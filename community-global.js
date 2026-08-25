/* VitaIA — Comunidade global em tempo real
   Usa a conta autenticada e o Realtime Database já inicializados em firebase.js.
   A sala pública é rooms/comunidade/messages e é compartilhada por todos os usuários autenticados.
*/

import {
  ref,
  push,
  set,
  remove,
  onValue,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  query,
  limitToLast,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const ROOM_PATH = 'rooms/comunidade/messages';
const FILTER_KEY = 'vitaia_community_filter_enabled';
const MAX_MESSAGE_LENGTH = 500;
const SEND_COOLDOWN_MS = 1500;

let db = null;
let activeUser = null;
let activeUid = null;
let messagesUnsub = null;
let removedUnsub = null;
let presenceUnsub = null;
let lastSendAt = 0;
const messageCache = new Map();

/* Termos normalizados, usados apenas para moderação básica da comunidade. */
const BLOCKED_PHRASES = [
  'filho da puta', 'filha da puta', 'vai se foder', 'vai tomar no cu', 'pau no cu',
  'seu arrombado', 'sua arrombada', 'seu retardado', 'sua retardada',
  'seu imbecil', 'sua imbecil', 'seu idiota', 'sua idiota',
  'seu lixo', 'sua lixo', 'fdp'
];

const SENSITIVE_WORDS = new Set([
  'arrombado', 'arrombada', 'babaca', 'bosta', 'burro', 'burra', 'caralho', 'cu',
  'cuzao', 'desgracado', 'desgracada', 'fdp', 'foda', 'fodase', 'foder', 'idiota',
  'imbecil', 'lixo', 'merda', 'otario', 'otaria', 'porra', 'puta', 'puto',
  'retardado', 'retardada', 'vagabundo', 'vagabunda'
]);

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsBlockedLanguage(text) {
  const normalized = ` ${normalizeText(text)} `;
  return BLOCKED_PHRASES.some(term => normalized.includes(` ${term} `));
}

function filterEnabled() {
  return localStorage.getItem(FILTER_KEY) !== 'false';
}

function maskSensitiveLanguage(text) {
  if (!filterEnabled()) return String(text || '');
  return String(text || '').replace(/[\p{L}\p{N}@!$*]+/gu, token => {
    const normalized = normalizeToken(token);
    return SENSITIVE_WORDS.has(normalized) ? '••••' : token;
  });
}

function showNotice(title, message, icon = 'ℹ️') {
  if (typeof window.showToast === 'function') {
    window.showToast(title, message, icon, 4500);
  } else {
    alert(`${title}: ${message}`);
  }
}

function getDisplayName(user) {
  const name = String(user?.displayName || '').trim();
  if (name) return name.slice(0, 80);
  const emailName = String(user?.email || '').split('@')[0].trim();
  return (emailName || 'Usuário').slice(0, 80);
}

function prepareCommunityUI() {
  const onlineRow = document.getElementById('social-online-row');
  const area = document.getElementById('social-chat-area');
  const input = document.getElementById('social-input');
  if (!onlineRow || !area || !input) return false;

  // Remove os contatos demonstrativos/fakes existentes no HTML antigo.
  onlineRow.replaceChildren();
  onlineRow.setAttribute('aria-live', 'polite');

  const parent = onlineRow.parentElement;
  if (parent && !document.getElementById('community-global-toolbar')) {
    const toolbar = document.createElement('div');
    toolbar.id = 'community-global-toolbar';
    toolbar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 10px;padding:9px 11px;border:1px solid var(--border);border-radius:12px;background:var(--surface2);font-size:11px;color:var(--muted)';

    const live = document.createElement('div');
    live.innerHTML = '<strong style="color:var(--text)">🌐 Comunidade global</strong><span id="community-live-status" style="margin-left:7px">Conectando…</span>';

    const label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;color:var(--text)';
    label.title = 'Quando ativado, palavrões e linguagem sensível são ocultados na sua tela.';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'community-language-filter';
    checkbox.checked = filterEnabled();
    checkbox.style.accentColor = 'var(--cyan)';
    checkbox.addEventListener('change', () => {
      localStorage.setItem(FILTER_KEY, checkbox.checked ? 'true' : 'false');
      renderAllMessages();
    });

    const labelText = document.createElement('span');
    labelText.textContent = 'Filtro de linguagem';
    label.append(checkbox, labelText);
    toolbar.append(live, label);
    parent.insertBefore(toolbar, onlineRow);
  }

  input.maxLength = MAX_MESSAGE_LENGTH;
  input.placeholder = 'Mensagem para a comunidade global...';
  input.setAttribute('aria-label', 'Mensagem para a comunidade global');

  if (!area.dataset.globalCommunityReady) {
    area.dataset.globalCommunityReady = 'true';
    area.replaceChildren(createEmptyMessage('Entre na sua conta para participar da comunidade.'));
  }

  return true;
}

function createEmptyMessage(text) {
  const div = document.createElement('div');
  div.className = 'community-empty-message';
  div.style.cssText = 'font-size:12px;color:var(--muted);text-align:center;padding:14px';
  div.textContent = text;
  return div;
}

function setStatus(text, ok = false) {
  const status = document.getElementById('community-live-status');
  if (!status) return;
  status.textContent = text;
  status.style.color = ok ? 'var(--green)' : 'var(--muted)';
}

function renderOnlineUsers(snapshot) {
  const row = document.getElementById('social-online-row');
  if (!row) return;
  row.replaceChildren();

  const values = Object.values(snapshot.val() || {})
    .filter(user => user && user.online === true && user.uid && user.name)
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));

  if (!values.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:11px;color:var(--muted);padding:4px 2px';
    empty.textContent = 'Nenhum usuário online agora.';
    row.appendChild(empty);
    return;
  }

  values.forEach(user => {
    const chip = document.createElement('div');
    chip.className = 'ig-dm-contact';
    chip.title = 'Usuário online';

    const avatar = document.createElement('span');
    avatar.className = 'ig-dm-contact-avatar';
    avatar.textContent = String(user.name).charAt(0).toUpperCase() || '?';

    const name = document.createElement('span');
    name.textContent = String(user.name).slice(0, 80);

    chip.append(avatar, name);
    row.appendChild(chip);
  });
}

function makeMessageElement(key, msg) {
  const isMine = activeUser && msg.uid === activeUser.uid;
  const row = document.createElement('div');
  row.className = `ig-dm-row${isMine ? ' ig-dm-row-mine' : ''}`;
  row.dataset.communityMessageKey = key;

  const bubbleWrap = document.createElement('div');
  bubbleWrap.style.cssText = `display:flex;flex-direction:column;align-items:${isMine ? 'flex-end' : 'flex-start'};max-width:88%`;

  if (!isMine) {
    const author = document.createElement('div');
    author.style.cssText = 'font-size:10px;font-weight:700;color:var(--muted);margin:0 7px 3px';
    author.textContent = String(msg.name || 'Usuário').slice(0, 80);
    bubbleWrap.appendChild(author);
  }

  const bubble = document.createElement('div');
  bubble.className = `ig-dm-bubble${isMine ? ' ig-dm-bubble-mine' : ''}`;
  bubble.textContent = maskSensitiveLanguage(msg.text || '');
  bubbleWrap.appendChild(bubble);

  const meta = document.createElement('div');
  meta.className = 'ig-dm-time';
  const time = typeof msg.ts === 'number'
    ? new Date(msg.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : 'agora';
  meta.textContent = time;
  bubbleWrap.appendChild(meta);

  row.appendChild(bubbleWrap);

  if (isMine) {
    const del = document.createElement('button');
    del.type = 'button';
    del.title = 'Apagar sua mensagem';
    del.setAttribute('aria-label', 'Apagar sua mensagem');
    del.textContent = '×';
    del.style.cssText = 'border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:16px;padding:4px';
    del.addEventListener('click', async () => {
      if (!confirm('Apagar esta mensagem da comunidade?')) return;
      try {
        await remove(ref(db, `${ROOM_PATH}/${key}`));
      } catch (error) {
        console.error('Comunidade: erro ao apagar mensagem', error);
        showNotice('Comunidade', 'Não foi possível apagar a mensagem.', '⚠️');
      }
    });
    row.appendChild(del);
  }

  return row;
}

function renderAllMessages() {
  const area = document.getElementById('social-chat-area');
  if (!area) return;
  area.replaceChildren();

  if (!activeUser) {
    area.appendChild(createEmptyMessage('Entre na sua conta para participar da comunidade.'));
    return;
  }

  if (!messageCache.size) {
    area.appendChild(createEmptyMessage('Nenhuma mensagem ainda. Seja o primeiro a conversar!'));
    return;
  }

  for (const [key, msg] of messageCache) {
    area.appendChild(makeMessageElement(key, msg));
  }
  area.scrollTop = area.scrollHeight;
}

function startMessageListener() {
  if (!db || !activeUser) return;
  if (messagesUnsub) messagesUnsub();
  if (removedUnsub) removedUnsub();
  messageCache.clear();
  renderAllMessages();

  const roomQuery = query(ref(db, ROOM_PATH), limitToLast(100));
  messagesUnsub = onChildAdded(roomQuery, snapshot => {
    const value = snapshot.val();
    if (!value || !value.uid || typeof value.text !== 'string') return;
    messageCache.set(snapshot.key, value);
    renderAllMessages();
  });

  removedUnsub = onChildRemoved(roomQuery, snapshot => {
    messageCache.delete(snapshot.key);
    renderAllMessages();
  });
}

function startPresenceListener() {
  if (!db) return;
  if (presenceUnsub) presenceUnsub();
  presenceUnsub = onValue(ref(db, 'presence'), renderOnlineUsers, error => {
    console.warn('Comunidade: presença indisponível', error);
  });
}

async function setUserOnline(user) {
  if (!db || !user || user.isAnonymous) return;
  const name = getDisplayName(user);
  const presenceRef = ref(db, `presence/${user.uid}`);
  const offlineData = { uid: user.uid, name, online: false, ts: serverTimestamp() };
  const onlineData = { uid: user.uid, name, online: true, ts: serverTimestamp() };

  try {
    await onDisconnect(presenceRef).set(offlineData);
    await set(presenceRef, onlineData);
  } catch (error) {
    console.warn('Comunidade: não foi possível atualizar presença', error);
  }
}

async function setPreviousUserOffline() {
  if (!db || !activeUid) return;
  try {
    const existingName = getDisplayName(activeUser);
    await set(ref(db, `presence/${activeUid}`), {
      uid: activeUid,
      name: existingName,
      online: false,
      ts: serverTimestamp()
    });
  } catch (_) {}
}

async function activateForUser(user) {
  prepareCommunityUI();
  db = window._vitaiaDB || db;

  if (!db || !user || user.isAnonymous) {
    if (activeUid) await setPreviousUserOffline();
    activeUser = null;
    activeUid = null;
    setStatus('Faça login para participar');
    renderAllMessages();
    return;
  }

  if (activeUid && activeUid !== user.uid) await setPreviousUserOffline();

  activeUser = user;
  activeUid = user.uid;
  await setUserOnline(user);
  startPresenceListener();
  startMessageListener();
  setStatus('Ao vivo', true);
}

async function sendCommunityMessage() {
  const input = document.getElementById('social-input');
  if (input?.disabled) return;
  const text = String(input?.value || '').trim();
  db = window._vitaiaDB || db;
  activeUser = window._vitaiaUser || activeUser;

  if (!text) return;
  if (!db || !activeUser || activeUser.isAnonymous) {
    showNotice('Comunidade', 'Entre na sua conta para enviar mensagens.', '⚠️');
    return;
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    showNotice('Comunidade', `A mensagem pode ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`, '⚠️');
    return;
  }

  if (containsBlockedLanguage(text)) {
    showNotice('Comunidade', 'Mensagem não enviada. Remova insultos ou linguagem ofensiva e tente novamente.', '🛡️');
    return;
  }

  const now = Date.now();
  if (now - lastSendAt < SEND_COOLDOWN_MS) return;
  lastSendAt = now;

  input.disabled = true;
  try {
    await push(ref(db, ROOM_PATH), {
      uid: activeUser.uid,
      name: getDisplayName(activeUser),
      text,
      ts: serverTimestamp(),
      moderation: 'client-v1'
    });
    input.value = '';
  } catch (error) {
    console.error('Comunidade: erro ao enviar', error);
    showNotice('Comunidade', 'Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.', '⚠️');
  } finally {
    input.disabled = false;
    input.focus();
  }
}

function clearLegacyCommunityState() {
  // O chat antigo era apenas local. A comunidade atual usa exclusivamente o Firebase.
  localStorage.removeItem('vitaia_social_messages');
  try {
    const identity = JSON.parse(localStorage.getItem('vitaia_current_user') || 'null');
    if (identity?.email) {
      const key = `vitaia_state_${String(identity.email).toLowerCase()}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const state = JSON.parse(raw);
        if (Array.isArray(state.socialMessages) && state.socialMessages.length) {
          state.socialMessages = [];
          localStorage.setItem(key, JSON.stringify(state));
        }
      }
    }
  } catch (_) {}
}

function install() {
  prepareCommunityUI();
  clearLegacyCommunityState();

  // Substitui o antigo chat local pelas operações globais do Firebase.
  window.sendSocialMsg = sendCommunityMessage;
  window.loadSocialMessages = () => {
    prepareCommunityUI();
    activateForUser(window._vitaiaUser || null);
  };
  window.renderSocialMessages = renderAllMessages;

  // O campo já possui um handler inline no HTML; ele passa a chamar a função global acima.
  window.addEventListener('vitaia-auth-state-changed', event => {
    activateForUser(event.detail?.user || null);
  });

  // Cobre o caso em que o evento de autenticação aconteceu antes deste módulo carregar.
  activateForUser(window._vitaiaUser || null);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', install, { once: true });
} else {
  install();
}
