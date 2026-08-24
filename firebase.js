/* ═══════════════════════════════════════════
   VitaIA — Firebase, autenticação e comunidade
   Módulo ES6 carregado pelo index.html.
═══════════════════════════════════════════ */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, onValue, set, remove,
  serverTimestamp, query, limitToLast, off
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAQJ7GMQg2Bdrtqt6bN1DHXmcVgfkIfMiA",
  authDomain:        "tcc-qol.firebaseapp.com",
  databaseURL:       "https://tcc-qol-default-rtdb.firebaseio.com",
  projectId:         "tcc-qol",
  storageBucket:     "tcc-qol.firebasestorage.app",
  messagingSenderId: "788642843582",
  appId:             "1:788642843582:web:ec12a0f6435ef6834bc7ef"
};

let fbApp = null;
let db = null;
let auth = null;
let currentUser = null;
let friendsRef = null;
let messagesRef = null;
let currentRoom = 'comunidade';
let commInitialized = false;
let authReady = null;

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function ensureFirebase() {
  if (!fbApp) {
    fbApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(fbApp);
    auth = getAuth(fbApp);

    authReady = new Promise(resolve => {
      let first = true;
      onAuthStateChanged(auth, user => {
        currentUser = user || null;
        window._vitaiaUser = currentUser;
        window._vitaiaAuth = auth;
        window._vitaiaDB = db;
        window._vitaiaDBAPI = { ref, set, push, remove, onValue, serverTimestamp };
        window.dispatchEvent(new CustomEvent('vitaia-auth-state-changed', { detail: { user: currentUser } }));
        if (first) {
          first = false;
          resolve(currentUser);
        }
      });
    });
  }
  return { app: fbApp, db, auth };
}

async function waitForAuth() {
  ensureFirebase();
  return authReady ? await authReady : currentUser;
}

function authErrorMessage(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-not-found': 'Não existe uma conta com este e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Este e-mail já possui uma conta.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/popup-closed-by-user': 'A janela de login foi fechada.',
    'auth/popup-blocked': 'O navegador bloqueou a janela de login. Tente novamente.',
    'auth/cancelled-popup-request': 'Outra janela de login já está aberta.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/operation-not-allowed': 'Este método de login ainda não está habilitado no Firebase.',
    'auth/account-exists-with-different-credential': 'Este e-mail já está vinculado a outro método de login.'
  };
  return messages[code] || error?.message || 'Não foi possível concluir a autenticação.';
}

/* ══════════════════════════════════════════
   AUTENTICAÇÃO
══════════════════════════════════════════ */
window.firebaseInit = async function() {
  ensureFirebase();
  await waitForAuth();
  return { app: fbApp, db, auth, user: currentUser };
};

window.firebaseGetUser = function() {
  ensureFirebase();
  return currentUser;
};

window.firebaseOnAuthStateChanged = function(callback) {
  ensureFirebase();
  return onAuthStateChanged(auth, callback);
};

window.firebaseSignInGoogle = async function() {
  ensureFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    return { user: result.user, credential: result.credential };
  } catch (error) {
    if (error?.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      return { redirected: true };
    }
    throw new Error(authErrorMessage(error));
  }
};

window.firebaseFinishGoogleRedirect = async function() {
  ensureFirebase();
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error('Google redirect:', error);
    throw new Error(authErrorMessage(error));
  }
};

window.firebaseSignInEmail = async function(email, password) {
  ensureFirebase();
  try {
    const result = await signInWithEmailAndPassword(auth, String(email).trim(), password);
    currentUser = result.user;
    return result.user;
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
};

window.firebaseCreateEmailAccount = async function(email, password, displayName = '') {
  ensureFirebase();
  try {
    const result = await createUserWithEmailAndPassword(auth, String(email).trim(), password);
    currentUser = result.user;
    if (displayName?.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    return result.user;
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
};

window.firebaseResetPassword = async function(email) {
  ensureFirebase();
  try {
    await sendPasswordResetEmail(auth, String(email).trim());
    return true;
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
};

window.firebaseSignOut = async function() {
  ensureFirebase();
  await signOut(auth);
  currentUser = null;
  localStorage.removeItem('vitaia_chat_name');
};

/* ══════════════════════════════════════════
   COMUNIDADE
   Se o usuário já estiver autenticado com Google/e-mail,
   a comunidade usa a mesma conta. Caso contrário, usa anônimo.
══════════════════════════════════════════ */
async function initFirebase() {
  if (commInitialized) return;
  commInitialized = true;
  ensureFirebase();

  try {
    await waitForAuth();
    if (!currentUser) {
      const cred = await signInAnonymously(auth);
      currentUser = cred.user;
    }

    window._vitaiaUser = currentUser;
    window._vitaiaDB = db;
    window._vitaiaDBAPI = { ref, set, push, remove, onValue, serverTimestamp };

    const savedName = localStorage.getItem('vitaia_chat_name');
    const name = savedName || currentUser.displayName || currentUser.email?.split('@')[0] || '';

    if (name) {
      if (!currentUser.displayName || currentUser.displayName !== name) {
        await updateProfile(currentUser, { displayName: name });
      }
      showCommChat(name);
    } else {
      document.getElementById('comm-setup-screen')?.style && (document.getElementById('comm-setup-screen').style.display = 'flex');
      document.getElementById('comm-chat-screen')?.style && (document.getElementById('comm-chat-screen').style.display = 'none');
      const status = document.getElementById('comm-firebase-status');
      if (status) {
        status.textContent = '✅ Conectado ao Firebase!';
        status.style.color = '#00b87a';
      }
    }

    const uidEl = document.getElementById('comm-uid-display');
    if (uidEl) uidEl.textContent = currentUser.uid.slice(0,10) + '…';
  } catch(err) {
    console.error('Firebase:', err);
    const el = document.getElementById('comm-firebase-status');
    if (el) {
      el.innerHTML = `⚠️ <strong>Erro Firebase:</strong> ${escHtml(err.message)}<br><small>Verifique Authentication e Realtime Database.</small>`;
      el.style.color='#ef4444';
    }
  }
}

window.commEnterChat = async function() {
  const nameEl = document.getElementById('comm-name-input');
  if (!nameEl || !currentUser) return;
  const name = nameEl.value.trim();
  if (!name || name.length < 2) { nameEl.style.borderColor='#ef4444'; return; }
  nameEl.style.borderColor='';
  localStorage.setItem('vitaia_chat_name', name);
  await updateProfile(currentUser, { displayName: name });
  showCommChat(name);
};

window.commChangeName = async function() {
  const newName = prompt('Novo nome:', currentUser?.displayName || '');
  if (!newName || newName.trim().length < 2 || !currentUser) return;
  localStorage.setItem('vitaia_chat_name', newName.trim());
  await updateProfile(currentUser, { displayName: newName.trim() });
  document.getElementById('comm-username-display')?.replaceChildren(document.createTextNode(newName.trim()));
  if (db && currentUser) {
    const presenceRef = ref(db, `presence/${currentUser.uid}`);
    await set(presenceRef, { name: newName.trim(), uid: currentUser.uid, online: true, ts: serverTimestamp() });
  }
};

function showCommChat(name) {
  document.getElementById('comm-setup-screen')?.style && (document.getElementById('comm-setup-screen').style.display = 'none');
  document.getElementById('comm-chat-screen')?.style && (document.getElementById('comm-chat-screen').style.display = 'flex');
  const username = document.getElementById('comm-username-display');
  if (username) username.textContent = name;
  const uidEl = document.getElementById('comm-uid-display');
  if (uidEl) uidEl.textContent = currentUser.uid.slice(0,10) + '…';

  const av = document.getElementById('comm-profile-avatar-el');
  if (av) av.textContent = (name || '?')[0].toUpperCase();

  const presenceRef = ref(db, `presence/${currentUser.uid}`);
  set(presenceRef, { name, uid: currentUser.uid, online: true, ts: serverTimestamp() });
  window.addEventListener('beforeunload', () => {
    set(presenceRef, { name, uid: currentUser.uid, online: false, ts: serverTimestamp() });
  }, { once: true });

  onValue(ref(db, 'presence'), snap => {
    const all = snap.val() || {};
    const online = Object.values(all).filter(u => u?.online);
    const el = document.getElementById('comm-online-list');
    if (!el) return;
    el.innerHTML = online.map(u => `<div class="comm-online-chip"><span class="comm-online-dot"></span>${escHtml(u.name || 'Anônimo')}</div>`).join('') || '<div style="font-size:10px;color:rgba(255,255,255,.25)">Nenhum online</div>';
    const count = document.getElementById('comm-online-count');
    if (count) count.textContent = online.length + ' online';
  });

  friendsRef = ref(db, `friends/${currentUser.uid}`);
  onValue(friendsRef, snap => {
    const friends = snap.val() || {};
    const list = document.getElementById('comm-friends-list');
    if (!list) return;
    const entries = Object.entries(friends);
    if (!entries.length) {
      list.innerHTML = '<div class="comm-friends-empty">Nenhum amigo ainda.<br>Compartilhe seu UID!</div>';
      return;
    }
    list.innerHTML = entries.map(([uid, f]) => `
      <div class="comm-friend-item">
        <div class="comm-friend-avatar">${escHtml((f.name||'?')[0].toUpperCase())}</div>
        <div class="comm-friend-info"><div class="comm-friend-name">${escHtml(f.name||'Usuário')}</div><div class="comm-friend-uid">${escHtml(uid.slice(0,8))}…</div></div>
        <button class="comm-btn-msg-friend" onclick="commOpenPrivateChat('${escHtml(uid)}','${escHtml(f.name||'Usuário')}')">💬</button>
      </div>`).join('');
  });

  commJoinRoom('comunidade');
}

window.commJoinRoom = function(roomId) {
  if (!db || !currentUser) return;
  if (messagesRef) off(messagesRef);
  currentRoom = String(roomId || 'comunidade').replace(/[.#$\[\]/]/g, '_');
  document.getElementById('comm-messages-area')?.replaceChildren();
  const label = document.getElementById('comm-room-label');
  if (label) label.textContent = currentRoom === 'comunidade' ? '# comunidade' : '🔒 ' + currentRoom;
  const q = query(ref(db, `rooms/${currentRoom}/messages`), limitToLast(50));
  messagesRef = q;
  onChildAdded(q, snap => commAppendMessage(snap.val(), snap.key));
};

window.commSendMessage = async function() {
  const input = document.getElementById('comm-msg-input');
  const text = input?.value.trim();
  if (!text || !currentUser || !db) return;
  input.value = '';
  try {
    await push(ref(db, `rooms/${currentRoom}/messages`), {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anônimo',
      text,
      ts: serverTimestamp()
    });
  } catch (error) {
    console.error('Mensagem:', error);
    input.value = text;
  }
};

window.commDeleteMessage = async function(key) {
  if (!confirm('Apagar esta mensagem?') || !currentUser) return;
  try {
    await remove(ref(db, `rooms/${currentRoom}/messages/${key}`));
    document.querySelector(`[data-comm-key="${CSS.escape(key)}"]`)?.remove();
  } catch (error) {
    alert('Não foi possível apagar a mensagem.');
  }
};

window.commAddFriend = async function() {
  const inp = document.getElementById('comm-friend-uid-input');
  const uid = inp?.value.trim();
  if (!uid || !currentUser || uid === currentUser.uid) { alert('UID inválido.'); return; }
  try {
    const presSnap = await new Promise(resolve => {
      onValue(ref(db, `presence/${uid}`), snap => resolve(snap), { onlyOnce: true });
    });
    const friendName = presSnap.val()?.name || 'Usuário #' + uid.slice(-4);
    await set(ref(db, `friends/${currentUser.uid}/${uid}`), { uid, name: friendName, addedAt: serverTimestamp() });
    inp.value = '';
    alert(`✅ ${friendName} adicionado!`);
  } catch (error) {
    alert('Não foi possível adicionar esse usuário.');
  }
};

window.commOpenPrivateChat = function(friendUid, friendName) {
  if (!currentUser) return;
  const roomId = [currentUser.uid, friendUid].sort().join('_');
  commJoinRoom(roomId);
  const label = document.getElementById('comm-room-label');
  if (label) label.textContent = '🔒 ' + friendName;
  document.getElementById('comm-friends-panel')?.classList.remove('open');
};

window.commCopyUID = function() {
  if (!currentUser) return;
  navigator.clipboard.writeText(currentUser.uid)
    .then(() => alert('✅ Seu UID copiado!\n\n' + currentUser.uid))
    .catch(() => alert('Seu UID é:\n\n' + currentUser.uid));
};

function commAppendMessage(msg, key) {
  const area = document.getElementById('comm-messages-area');
  if (!area || !msg) return;
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
    ${isMe ? `<button class="comm-msg-del" title="Apagar" onclick="commDeleteMessage('${escHtml(key)}')">✕</button>` : ''}
  `;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

// Inicialização pública para a aba Comunidade.
window._initFirebase = initFirebase;

// Inicializa o SDK imediatamente, mas NÃO cria usuário anônimo até a comunidade ser aberta.
ensureFirebase();
window.firebaseFinishGoogleRedirect().catch(() => {});

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
