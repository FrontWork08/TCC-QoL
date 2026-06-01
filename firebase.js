/* ═══════════════════════════════════════════
   VitaIA — Firebase & Comunidade (módulo ES6)
   Importe como: <script type="module" src="firebase.js"></script>
═══════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, onValue, set, remove, serverTimestamp, query, limitToLast, off
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth, signInAnonymously, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ══════════════════════════════════════════════
   🔴 SUBSTITUA OS VALORES ABAIXO PELOS DO SEU
      PROJETO NO FIREBASE CONSOLE
   ══════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  databaseURL:       "https://SEU_PROJETO-default-rtdb.firebaseio.com",
  projectId:         "SEU_PROJETO",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};

let fbApp, db, auth, currentUser, friendsRef, messagesRef, currentRoom = 'comunidade';
let commInitialized = false;

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function initFirebase() {
  if (commInitialized) return;
  commInitialized = true;
  try {
    fbApp = initializeApp(firebaseConfig);
    db    = getDatabase(fbApp);
    auth  = getAuth(fbApp);
    const cred = await signInAnonymously(auth);
    currentUser = cred.user;
    const savedName = localStorage.getItem('vitaia_chat_name');
    if (savedName) {
      await updateProfile(currentUser, { displayName: savedName });
      showCommChat(savedName);
    } else {
      document.getElementById('comm-setup-screen').style.display = 'flex';
      document.getElementById('comm-chat-screen').style.display  = 'none';
      document.getElementById('comm-firebase-status').textContent = '✅ Conectado ao Firebase!';
      document.getElementById('comm-firebase-status').style.color = '#00b87a';
    }
    // show UID
    document.getElementById('comm-uid-display').textContent = currentUser.uid.slice(0,10) + '…';
  } catch(err) {
    const el = document.getElementById('comm-firebase-status');
    if (el) { el.innerHTML = `⚠️ <strong>Erro Firebase:</strong> ${err.message}<br><small>Configure o firebaseConfig no código.</small>`; el.style.color='#ef4444'; }
  }
}

window.commEnterChat = async function() {
  const nameEl = document.getElementById('comm-name-input');
  const name = nameEl.value.trim();
  if (!name || name.length < 2) { nameEl.style.borderColor='#ef4444'; return; }
  nameEl.style.borderColor='';
  localStorage.setItem('vitaia_chat_name', name);
  await updateProfile(currentUser, { displayName: name });
  showCommChat(name);
};

window.commChangeName = async function() {
  const newName = prompt('Novo nome:', currentUser?.displayName || '');
  if (!newName || newName.trim().length < 2) return;
  localStorage.setItem('vitaia_chat_name', newName.trim());
  await updateProfile(currentUser, { displayName: newName.trim() });
  document.getElementById('comm-username-display').textContent = newName.trim();
  if (db && currentUser) {
    const presenceRef = ref(db, `presence/${currentUser.uid}`);
    set(presenceRef, { name: newName.trim(), uid: currentUser.uid, online: true, ts: serverTimestamp() });
  }
};

function showCommChat(name) {
  document.getElementById('comm-setup-screen').style.display = 'none';
  document.getElementById('comm-chat-screen').style.display  = 'flex';
  document.getElementById('comm-username-display').textContent = name;
  document.getElementById('comm-uid-display').textContent = currentUser.uid.slice(0,10) + '…';
  // Avatar
  const av = document.getElementById('comm-profile-avatar-el');
  if (av) av.textContent = name[0].toUpperCase();
  // Presence
  const presenceRef = ref(db, `presence/${currentUser.uid}`);
  set(presenceRef, { name, uid: currentUser.uid, online: true, ts: serverTimestamp() });
  window.addEventListener('beforeunload', () => {
    set(presenceRef, { name, uid: currentUser.uid, online: false, ts: serverTimestamp() });
  });
  // Listen online
  onValue(ref(db, 'presence'), snap => {
    const all = snap.val() || {};
    const online = Object.values(all).filter(u => u.online);
    const el = document.getElementById('comm-online-list');
    if (!el) return;
    el.innerHTML = online.map(u => `<div class="comm-online-chip"><span class="comm-online-dot"></span>${escHtml(u.name||'Anônimo')}</div>`).join('') || '<div style="font-size:10px;color:rgba(255,255,255,.25)">Nenhum online</div>';
    document.getElementById('comm-online-count').textContent = online.length + ' online';
  });
  // Listen friends
  friendsRef = ref(db, `friends/${currentUser.uid}`);
  onValue(friendsRef, snap => {
    const friends = snap.val() || {};
    const list = document.getElementById('comm-friends-list');
    if (!list) return;
    const entries = Object.entries(friends);
    if (!entries.length) { list.innerHTML = '<div class="comm-friends-empty">Nenhum amigo ainda.<br>Compartilhe seu UID!</div>'; return; }
    list.innerHTML = entries.map(([uid, f]) => `
      <div class="comm-friend-item">
        <div class="comm-friend-avatar">${escHtml((f.name||'?')[0].toUpperCase())}</div>
        <div class="comm-friend-info"><div class="comm-friend-name">${escHtml(f.name||'Usuário')}</div><div class="comm-friend-uid">${uid.slice(0,8)}…</div></div>
        <button class="comm-btn-msg-friend" onclick="commOpenPrivateChat('${uid}','${escHtml(f.name||'Usuário')}')">💬</button>
      </div>`).join('');
  });
  commJoinRoom('comunidade');
}

window.commJoinRoom = function(roomId) {
  if (messagesRef) off(messagesRef);
  currentRoom = roomId;
  document.getElementById('comm-messages-area').innerHTML = '';
  document.getElementById('comm-room-label').textContent = roomId === 'comunidade' ? '# comunidade' : '🔒 ' + roomId;
  const q = query(ref(db, `rooms/${roomId}/messages`), limitToLast(50));
  messagesRef = q;
  onChildAdded(q, snap => commAppendMessage(snap.val(), snap.key));
};

window.commSendMessage = async function() {
  const input = document.getElementById('comm-msg-input');
  const text  = input.value.trim();
  if (!text || !currentUser || !db) return;
  input.value = '';
  await push(ref(db, `rooms/${currentRoom}/messages`), {
    uid: currentUser.uid,
    name: currentUser.displayName || 'Anônimo',
    text, ts: serverTimestamp()
  });
};

window.commDeleteMessage = async function(key) {
  if (!confirm('Apagar esta mensagem?')) return;
  await remove(ref(db, `rooms/${currentRoom}/messages/${key}`));
  document.querySelector(`[data-comm-key="${key}"]`)?.remove();
};

window.commAddFriend = async function() {
  const inp = document.getElementById('comm-friend-uid-input');
  const uid = inp.value.trim();
  if (!uid || uid === currentUser?.uid) { alert('UID inválido.'); return; }
  const presSnap = await new Promise(resolve => {
    onValue(ref(db, `presence/${uid}`), snap => resolve(snap), { onlyOnce: true });
  });
  const friendName = presSnap.val()?.name || 'Usuário #' + uid.slice(-4);
  await set(ref(db, `friends/${currentUser.uid}/${uid}`), { uid, name: friendName, addedAt: serverTimestamp() });
  inp.value = '';
  alert(`✅ ${friendName} adicionado!`);
};

window.commOpenPrivateChat = function(friendUid, friendName) {
  const roomId = [currentUser.uid, friendUid].sort().join('_');
  commJoinRoom(roomId);
  document.getElementById('comm-room-label').textContent = '🔒 ' + friendName;
  document.getElementById('comm-friends-panel').classList.remove('open');
};

window.commCopyUID = function() {
  if (!currentUser) return;
  navigator.clipboard.writeText(currentUser.uid).then(() => alert('✅ Seu UID copiado!\n\n' + currentUser.uid));
};

function commAppendMessage(msg, key) {
  const area = document.getElementById('comm-messages-area');
  if (!area) return;
  const isMe = currentUser && msg.uid === currentUser.uid;
  const time = msg.ts ? new Date(msg.ts).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) : '--:--';
  const el = document.createElement('div');
  el.className = 'comm-msg-row' + (isMe ? ' comm-msg-mine' : '');
  el.dataset.commKey = key;
  el.innerHTML = `
    <div class="comm-msg-bubble">
      ${!isMe ? `<div class="comm-msg-author">${escHtml(msg.name)}</div>` : ''}
      <div class="comm-msg-text">${escHtml(msg.text)}</div>
      <div class="comm-msg-time">${time}</div>
    </div>
    ${isMe ? `<button class="comm-msg-del" title="Apagar" onclick="commDeleteMessage('${key}')">✕</button>` : ''}
  `;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

// Expose initFirebase for when user navigates to the comunidade tab
window._initFirebase = initFirebase;

// Keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('comm-msg-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commSendMessage(); }
  });
  document.getElementById('comm-name-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') commEnterChat();
  });
  document.getElementById('comm-friend-uid-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') commAddFriend();
  });
});
