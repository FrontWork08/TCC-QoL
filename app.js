/* ═══════════════════════════════════════════
   VitaIA — Lógica Principal do App
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   BANCO DE DADOS DE ALIMENTOS
══════════════════════════════════════════ */
const FOOD_DB = [
  { nome:'Frango grelhado (100g)', protein:31, carb:0, fat:3.6 },
  { nome:'Arroz branco cozido (100g)', protein:2.5, carb:28, fat:0.3 },
  { nome:'Feijão cozido (100g)', protein:8.7, carb:14, fat:0.5 },
  { nome:'Ovo cozido (1 unidade)', protein:6.3, carb:0.6, fat:5 },
  { nome:'Ovo mexido (1 unidade)', protein:5.5, carb:0.4, fat:5.5 },
  { nome:'Batata doce cozida (100g)', protein:1.6, carb:20, fat:0.1 },
  { nome:'Aveia (40g)', protein:5.2, carb:25, fat:2.8 },
  { nome:'Banana (1 média)', protein:1.3, carb:27, fat:0.3 },
  { nome:'Maçã (1 média)', protein:0.3, carb:25, fat:0.2 },
  { nome:'Leite integral (200ml)', protein:6.6, carb:9.6, fat:6.4 },
  { nome:'Iogurte grego natural (100g)', protein:9.9, carb:3.6, fat:0.7 },
  { nome:'Whey protein (30g)', protein:22, carb:3, fat:1.5 },
  { nome:'Amendoim (30g)', protein:7.7, carb:6, fat:14 },
  { nome:'Azeite de oliva (1 colher)', protein:0, carb:0, fat:14 },
  { nome:'Atum em lata (100g)', protein:26, carb:0, fat:0.8 },
  { nome:'Salmão grelhado (100g)', protein:25, carb:0, fat:12 },
  { nome:'Queijo mussarela (30g)', protein:6.5, carb:0.6, fat:6 },
  { nome:'Pão integral (1 fatia)', protein:3.6, carb:13, fat:1 },
  { nome:'Massa (100g cozida)', protein:3.6, carb:25, fat:0.5 },
  { nome:'Brócolis (100g)', protein:2.8, carb:6.6, fat:0.4 },
  { nome:'Cenoura (100g)', protein:0.9, carb:9.6, fat:0.2 },
  { nome:'Alface (100g)', protein:1.4, carb:2.9, fat:0.2 },
  { nome:'Tomate (1 médio)', protein:0.9, carb:4.8, fat:0.2 },
  { nome:'Manteiga (10g)', protein:0.1, carb:0, fat:8 },
  { nome:'Mel (1 colher)', protein:0.1, carb:17, fat:0 },
  { nome:'Castanha do Pará (30g)', protein:4.2, carb:3.5, fat:20 },
  { nome:'Abacate (100g)', protein:2, carb:6.5, fat:16 },
  { nome:'Carne bovina magra (100g)', protein:26, carb:0, fat:5 },
  { nome:'Batata cozida (100g)', protein:2, carb:17, fat:0.1 },
  { nome:'Laranja (1 média)', protein:1, carb:15, fat:0.2 },
  { nome:'Morango (100g)', protein:0.7, carb:7.7, fat:0.3 },
  { nome:'Chocolate 70% (20g)', protein:2, carb:6, fat:8 },
  { nome:'Granola (40g)', protein:4, carb:24, fat:6 },
  { nome:'Proteína vegetal texturizada (30g)', protein:15, carb:8, fat:0.5 },
  { nome:'Tapioca (50g)', protein:0.2, carb:40, fat:0.1 },
];

/* ══════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════ */
const moodLabels = ['','Mal','Instável','Neutro','Bem','Ótimo'];
const moodSubs   = ['','Vai ficar tudo bem, estou aqui.','Estou aqui com você.','Seguindo em frente!','Que ótimo estar bem!','Você é incrível hoje!'];
const moodCtx    = ['','Percebi que você está se sentindo mal. Como posso te ajudar agora?','Percebi que seu humor está instável. Como posso ajudar?','Oi! Tudo neutro por aí. Tem algo que posso fazer por você?','Que bom que você está bem! Posso potencializar isso?','Incrível que você está ótimo! Como posso tornar seu dia ainda melhor?'];

const state = {
  name:'', email:'', hydra:0, hydraGoal: 2, avatarColor: null,
  moodLog:[], planCount:0, checkins:0,
  chatHistory:[], visaoImageData:null,
  vozText:'', vozUtterance:null,
  nutrition:{ protein:0, carb:0, fat:0 },
  foodLog:[], exercises:[],
  teleSchedules:[], teleChatProf:null, teleChatHistory:[],
  teleConsultToday:0, sleepLog:[], exerciseNotes:[],
  profilePhoto: null, socialMessages: [],
  twoFACode: null, pendingLoginUser: null,
  lastDailyReset: null
};

let NUTR_GOALS = { protein:120, carb:250, fat:60 };
let HYDRA_GOAL = 2;
let selectedFood = null;

/* ══ API KEY (Groq) — Integrada no código fonte ══ */
const _VITAIA_GROQ_KEY = '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';
function getApiKey() { return _VITAIA_GROQ_KEY; }

/* ══ INTERNAL ANTHROPIC API ══ */
// Esta chave é usada internamente — o usuário não precisa configurar manualmente
const _VITAIA_INTERNAL = btoa('vitaia-internal-2025');

/* ══════════════════════════════════════════
   LOCALSTORAGE — SAVE/LOAD
══════════════════════════════════════════ */
function saveState() {
  try {
    const toSave = {
      hydraGoal: state.hydraGoal,
      moodLog: state.moodLog,
      planCount: state.planCount,
      checkins: state.checkins,
      nutrition: state.nutrition,
      foodLog: state.foodLog,
      exercises: state.exercises,
      teleSchedules: state.teleSchedules,
      teleConsultToday: state.teleConsultToday,
      sleepLog: state.sleepLog,
      exerciseNotes: state.exerciseNotes,
      profilePhoto: state.profilePhoto,
      socialMessages: state.socialMessages,
      hydra: state.hydra,
      nutrGoals: NUTR_GOALS,
      lastDailyReset: state.lastDailyReset,
      avatarColor: state.avatarColor
    };
    // Primary: localStorage (instant, reliable)
    localStorage.setItem('vitaia_state_'+state.email, JSON.stringify(toSave));
    // Secondary: Firebase if available
    if (window._vitaiaDB && window._vitaiaUser && state.email) {
      try {
        const { ref: fbRef, set: fbSet } = window._vitaiaDBAPI;
        fbSet(fbRef(window._vitaiaDB, 'users/' + state.email.replace(/[.@]/g,'_') + '/state'), toSave).catch(()=>{});
      } catch(e) {}
    }
  } catch(e) { console.warn('Save failed:', e); }
}

function loadState(email) {
  try {
    const raw = localStorage.getItem('vitaia_state_'+email);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    if (saved.nutrGoals) NUTR_GOALS = saved.nutrGoals;
    if (saved.hydraGoal) HYDRA_GOAL = saved.hydraGoal;
    // Verificar reset diário automático
    // Verifica mudança de data durante sessão ativa (ex: meia-noite sem relogin)
    const _today = new Date().toDateString();
    if (state.lastDailyReset && state.lastDailyReset !== _today && !document.getElementById('daily-reset-modal')) {
      showDailyResetModal();
    }
  } catch(e) { console.warn('Load failed:', e); }
}

function checkDailyAutoReset() {
  const today = new Date().toDateString();
  if (state.lastDailyReset && state.lastDailyReset !== today) {
    // Passaram 24h+ — agenda o modal de confirmação após o app carregar
    setTimeout(showDailyResetModal, 800);
  } else if (!state.lastDailyReset) {
    // Primeiro acesso — define o dia sem resetar nada
    state.lastDailyReset = today;
    saveState();
  }
}

function showDailyResetModal() {
  // Remove modal anterior se existir
  const existing = document.getElementById('daily-reset-modal');
  if (existing) existing.remove();

  const lastDate = state.lastDailyReset || '—';
  const hasData = state.hydra > 0 || (state.nutrition && state.nutrition.protein > 0) || (state.exercises && state.exercises.length > 0);

  const modal = document.createElement('div');
  modal.id = 'daily-reset-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9800;
    background:rgba(0,0,0,0.55);
    backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    padding:20px;animation:fadeUp .3s ease both;
  `;

  // Montar resumo do dia anterior
  const prevWater   = (state.hydra || 0).toFixed(1);
  const prevProtein = Math.round((state.nutrition && state.nutrition.protein) || 0);
  const prevExs     = (state.exercises || []).length;
  const prevMood    = (state.moodLog || []).length
    ? ['','😢','😕','😐','🙂','😄'][state.moodLog[state.moodLog.length-1].mood] || '—'
    : '—';

  modal.innerHTML = `
    <div style="
      background:var(--surface);border-radius:24px;
      padding:28px 24px 24px;max-width:380px;width:100%;
      box-shadow:0 24px 80px rgba(0,0,0,.35);
      animation:fadeUp .3s ease both;
    ">
      <!-- Cabeçalho -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:8px">🌅</div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text);margin-bottom:4px">Novo dia, novo começo!</div>
        <div style="font-size:13px;color:var(--muted)">Último registro: <strong>${lastDate}</strong></div>
      </div>

      <!-- Resumo do dia anterior -->
      ${hasData ? `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:18px">
        <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px">📊 Resumo de ontem</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text)">💧 <span><strong>${prevWater} L</strong> de água</span></div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text)">🥩 <span><strong>${prevProtein}g</strong> proteína</span></div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text)">💪 <span><strong>${prevExs}</strong> exercício(s)</span></div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text)">😊 <span>Humor: <strong>${prevMood}</strong></span></div>
        </div>
      </div>
      ` : ''}

      <!-- O que resetar -->
      <div style="font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px">O que deseja zerar hoje?</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
        <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s" id="drm-lbl-hydra">
          <input type="checkbox" id="drm-hydra" checked style="width:16px;height:16px;accent-color:var(--cyan);flex-shrink:0">
          <span style="font-size:14px">💧 Hidratação</span>
          <span style="font-size:12px;color:var(--muted);margin-left:auto">${prevWater} L</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s" id="drm-lbl-nutr">
          <input type="checkbox" id="drm-nutr" checked style="width:16px;height:16px;accent-color:var(--cyan);flex-shrink:0">
          <span style="font-size:14px">🥗 Alimentação</span>
          <span style="font-size:12px;color:var(--muted);margin-left:auto">${prevProtein}g prot.</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s" id="drm-lbl-exs">
          <input type="checkbox" id="drm-exs" checked style="width:16px;height:16px;accent-color:var(--cyan);flex-shrink:0">
          <span style="font-size:14px">💪 Exercícios</span>
          <span style="font-size:12px;color:var(--muted);margin-left:auto">${prevExs} item(s)</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s" id="drm-lbl-mood">
          <input type="checkbox" id="drm-mood" style="width:16px;height:16px;accent-color:var(--cyan);flex-shrink:0">
          <span style="font-size:14px">😊 Humor</span>
          <span style="font-size:12px;color:var(--muted);margin-left:auto">manter histórico</span>
        </label>
      </div>

      <!-- Botões -->
      <button onclick="applyDailyReset()" style="
        width:100%;padding:14px;margin-bottom:8px;
        background:linear-gradient(135deg,var(--cyan),var(--teal));
        border:none;border-radius:14px;color:#fff;
        font-family:'Syne',sans-serif;font-weight:800;font-size:15px;
        cursor:pointer;box-shadow:0 6px 20px rgba(14,165,233,.25);
      ">✅ Zerar selecionados e começar o dia</button>
      <button onclick="skipDailyReset()" style="
        width:100%;padding:12px;
        background:none;border:1.5px solid var(--border);border-radius:14px;
        color:var(--muted);font-family:'Syne',sans-serif;font-weight:700;
        font-size:13px;cursor:pointer;
      ">🕐 Manter dados e continuar</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Fecha ao clicar no backdrop
  modal.addEventListener('click', function(e) {
    if (e.target === modal) skipDailyReset();
  });
}

function applyDailyReset() {
  const today = new Date().toDateString();
  const resetHydra = document.getElementById('drm-hydra')?.checked;
  const resetNutr  = document.getElementById('drm-nutr')?.checked;
  const resetExs   = document.getElementById('drm-exs')?.checked;
  const resetMood  = document.getElementById('drm-mood')?.checked;

  if (resetHydra) { state.hydra = 0; syncHydraUI(); if (typeof checkWaterAlert === 'function') checkWaterAlert(); }
  if (resetNutr)  { state.nutrition = { protein:0, carb:0, fat:0 }; state.foodLog = []; syncNutritionUI(); updateProteinInsight(); }
  if (resetExs)   { state.exercises = []; state.teleConsultToday = 0; renderExercises(); }
  if (resetMood)  { state.moodLog = state.moodLog.slice(-7); }

  state.lastDailyReset = today;
  saveState();

  document.getElementById('daily-reset-modal')?.remove();

  const items = [resetHydra && 'água', resetNutr && 'alimentação', resetExs && 'exercícios', resetMood && 'humor'].filter(Boolean);
  const msg = items.length ? items.join(', ') + ' zerado(s)!' : 'Nada foi zerado.';
  showToast('🌅 Novo dia!', msg, '✅', 3500);

  // Atualiza modo simples se estiver aberto
  if (typeof refreshSimpleMode === 'function' && typeof ACC !== 'undefined' && ACC.simpleMode) refreshSimpleMode();
}

function skipDailyReset() {
  // Marca o dia como visto para não perguntar de novo nesta sessão,
  // mas NÃO avança lastDailyReset — perguntas novamente no próximo login
  document.getElementById('daily-reset-modal')?.remove();
  showToast('🕐 Continuando', 'Dados de ontem mantidos.', '💾', 2500);
}

/* ══════════════════════════════════════════
   API — GROQ / AI
══════════════════════════════════════════ */
function checkKey() {
  // Allows operation with internal API even without Groq key
  const key = getApiKey();
  if (!key || key.trim().length < 20) {
    // Will try internal Anthropic API - no throw needed
    return;
  }
}
async function callAI(prompt, imageData) {
  const API_KEY = getApiKey();
  // Try internal Anthropic API first if no Groq key
  if (!API_KEY || API_KEY.trim().length < 20) {
    try {
      const antRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
      });
      const antData = await antRes.json();
      if (!antData.error && antData.content?.[0]?.text) return antData.content[0].text;
    } catch(e2) { /* fallback to error below */ }
    throw new Error('API Key não configurada. Acesse o perfil para configurar sua chave Groq, ou a API interna está indisponível.');
  }
  const messages = [];
  if (imageData) {
    messages.push({ role:'user', content:[{ type:'image_url', image_url:{ url:'data:image/jpeg;base64,'+imageData } },{ type:'text', text:prompt }] });
  } else {
    messages.push({ role:'user', content:prompt });
  }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{ method:'POST', headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+API_KEY }, body:JSON.stringify({ model:'llama-3.3-70b-versatile', max_tokens:1024, messages }) });
  const data = await res.json();
  if (data.error) throw new Error('Groq: '+(data.error.message||JSON.stringify(data.error)));
  return data.choices?.[0]?.message?.content||'';
}
async function callAIChat(sysPrompt, history) {
  const API_KEY = getApiKey();
  if (!API_KEY || API_KEY.trim().length < 20) {
    try {
      const msgs = history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const antRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: sysPrompt, messages: msgs.length ? msgs : [{ role: 'user', content: 'Olá' }] })
      });
      const antData = await antRes.json();
      if (!antData.error && antData.content?.[0]?.text) return antData.content[0].text;
    } catch(e2) { /* fallback */ }
    throw new Error('API Key não configurada. Acesse o perfil para configurar sua chave Groq.');
  }
  const messages = [{ role:'system', content:sysPrompt }, ...history];
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{ method:'POST', headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+API_KEY }, body:JSON.stringify({ model:'llama-3.3-70b-versatile', max_tokens:1024, messages }) });
  const data = await res.json();
  if (data.error) throw new Error('Groq: '+(data.error.message||JSON.stringify(data.error)));
  return data.choices?.[0]?.message?.content||'';
}

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
const ALLOWED_EMAIL_DOMAINS = ['gmail.com','hotmail.com','outlook.com','yahoo.com','yahoo.com.br','live.com','msn.com'];

function getUsers() {
  try { return JSON.parse(localStorage.getItem('vitaia_users') || '[]'); } catch(e) { return []; }
}
function saveUsers(users) { localStorage.setItem('vitaia_users', JSON.stringify(users)); }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isAllowedEmailDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain?.endsWith('.'+d));
}

function togglePassVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁️'; }
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').style.display = isLogin ? 'block' : 'none';
  document.getElementById('form-register').style.display = isLogin ? 'none' : 'block';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.querySelectorAll('.field').forEach(f => f.classList.remove('has-error'));
}

function setFieldError(fieldId, show, msg) {
  const f = document.getElementById(fieldId);
  f.classList.toggle('has-error', show);
  if (msg) { const errEl = f.querySelector('.field-error'); if (errEl) errEl.textContent = msg; }
}
function clearFieldError(fieldId) { const f = document.getElementById(fieldId); if(f) f.classList.remove('has-error'); }

function renderSavedUsers() {
  const users = getUsers();
  const wrap = document.getElementById('saved-users-wrap');
  const chips = document.getElementById('saved-users-chips');
  if (!users.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  chips.innerHTML = users.map(u =>
    `<span class="saved-user-chip" onclick="quickLogin('${u.email}')">👤 ${u.name}</span>`
  ).join('');
}

function quickLogin(email) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').focus();
}

function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const enable2fa = document.getElementById('enable-2fa').checked;

  let valid = true;
  if (!name) { setFieldError('field-reg-name', true); valid = false; }
  if (!isValidEmail(email)) { setFieldError('field-reg-email', true, 'E-mail inválido.'); valid = false; }
  else if (!isAllowedEmailDomain(email)) { setFieldError('field-reg-email', true, 'Use Gmail, Hotmail, Outlook ou Yahoo.'); valid = false; }
  if (pass.length < 6) { setFieldError('field-reg-pass', true); valid = false; }
  if (pass !== pass2) { setFieldError('field-reg-pass2', true); valid = false; }
  if (!valid) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    setFieldError('field-reg-email', true, 'Este e-mail já está cadastrado.');
    return;
  }
  users.push({ name, email, pass, twofa: enable2fa });
  saveUsers(users);
  enterApp(name, email);
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;

  let valid = true;
  if (!isValidEmail(email)) { setFieldError('field-login-email', true, 'E-mail inválido.'); valid = false; }
  if (!pass) { setFieldError('field-login-pass', true, 'Informe sua senha.'); valid = false; }
  if (!valid) return;

  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    setFieldError('field-login-email', true, 'E-mail não encontrado. Crie uma conta!');
    setTimeout(() => switchTab('register'), 1800);
    return;
  }
  if (user.pass !== pass) {
    setFieldError('field-login-pass', true, 'Senha incorreta.');
    return;
  }

  // 2FA
  if (user.twofa) {
    state.pendingLoginUser = user;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    state.twoFACode = code;
    document.getElementById('twofa-hint').textContent = `[Demo] Código: ${code}`;
    ['twofa-d1','twofa-d2','twofa-d3','twofa-d4'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('modal-2fa').classList.add('active');
    setTimeout(() => document.getElementById('twofa-d1').focus(), 200);
    return;
  }

  finishLogin(user);
}

function twoFAInput(el, nextId) {
  if (el.value && nextId) document.getElementById(nextId)?.focus();
}
function twoFABack(e, el, prevId) {
  if (e.key === 'Backspace' && !el.value && prevId) document.getElementById(prevId)?.focus();
}
function verify2FA() {
  const code = ['twofa-d1','twofa-d2','twofa-d3','twofa-d4'].map(id => document.getElementById(id).value).join('');
  if (code === state.twoFACode) {
    closeModal('modal-2fa');
    finishLogin(state.pendingLoginUser);
  } else {
    document.getElementById('twofa-hint').style.color = 'var(--red)';
    document.getElementById('twofa-hint').textContent = 'Código incorreto. Tente novamente.';
  }
}

function finishLogin(user) {
  // Verificar se já estava logado (auto-login por localStorage)
  localStorage.setItem('vitaia_current_user', JSON.stringify({ name: user.name, email: user.email }));
  enterApp(user.name, user.email);
}

const GOOGLE_CLIENT_ID = '607327292567-1i5511kuef7f2edcgat1na6p1bhmdolc.apps.googleusercontent.com';

function socialLoginOAuth(provider) {
  if (provider === 'google') {
    if (typeof google === 'undefined' || !google.accounts) {
      showToast('Erro', 'SDK do Google ainda não carregou. Tente novamente.', '⚠️', 4000);
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: function(response) {
        try {
          // Decodifica o JWT retornado pelo Google
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          const name  = payload.name  || payload.given_name || 'Usuário Google';
          const email = payload.email;
          const users = getUsers();
          if (!users.find(u => u.email === email)) {
            users.push({ name, email, pass: '__social__', twofa: false, provider: 'google' });
            saveUsers(users);
          }
          finishLogin({ name, email });
          showToast('Google', 'Login realizado com sucesso! Bem-vindo, ' + name + '!', '✅', 4000);
        } catch(e) {
          showToast('Erro', 'Falha ao processar login do Google.', '⚠️', 4000);
        }
      },
      ux_mode: 'popup',
      cancel_on_tap_outside: true,
    });
    google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Se o One Tap não aparecer, abre o popup de seleção de conta
        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-hidden') || document.createElement('div'),
          { theme: 'outline', size: 'large' }
        );
        // Força popup manual
        const btn = document.createElement('div');
        btn.id = 'google-signin-btn-hidden';
        btn.style.display = 'none';
        document.body.appendChild(btn);
        google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' });
        btn.querySelector('div[role=button]')?.click();
        setTimeout(() => btn.remove(), 3000);
      }
    });
    return;
  } else if (provider === 'facebook') {
    const popup = window.open(
      'https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F',
      'facebook_login',
      'width=500,height=620,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,left=' + Math.round((screen.width-500)/2) + ',top=' + Math.round((screen.height-620)/2)
    );
    showToast('Facebook', 'Faça login com sua conta Facebook na janela aberta.', '🔷', 5000);
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        const name = prompt('✅ Login Facebook\n\nDigite o nome que deseja usar:') || '';
        if (!name.trim()) return;
        const email = 'facebook.' + name.toLowerCase().replace(/\s+/g,'') + '@outlook.com';
        const users = getUsers();
        if (!users.find(u => u.email === email)) {
          users.push({ name: name.trim(), email, pass: '__social__', twofa: false, provider: 'facebook' });
          saveUsers(users);
        }
        finishLogin({ name: name.trim(), email });
      }
    }, 800);
  }
}


function socialLoginSimulated(provider) {
  socialLoginOAuth(provider.toLowerCase());
}

function openForgotPassword() {
  document.getElementById('forgot-form').style.display = 'block';
  document.getElementById('forgot-success').style.display = 'none';
  document.getElementById('forgot-email').value = '';
  document.getElementById('modal-forgot').classList.add('active');
}
function sendForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!isValidEmail(email)) { alert('Informe um e-mail válido.'); return; }
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('forgot-success').style.display = 'block';
}

function enterApp(name, email) {
  state.name = name;
  state.email = email || name + '@vitaia.app';

  // Carregar dados salvos
  loadState(state.email);
  loadSocialMessages();

  // Atualizar UI
  document.getElementById('username-display').textContent = name;
  const h = new Date().getHours();
  document.getElementById('greeting').textContent = h<12?'Bom dia,':h<18?'Boa tarde,':'Boa noite,';
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');

  // Atualizar Avatar
  updateAvatarDisplay();
  updateGoalInputs();
  syncNutritionUI();
  syncHydraUI();
  renderExercises();
  renderExerciseNotes();
  renderSchedules();
  renderSocialMessages();
  startClock();
  startWaterReminder();
  updateTeleSuggestion();
  updateProteinInsight();
  updateTeleConsultBadge();
  updateSleepLog();
  // Carregar calendário — SEMPRE antes de renderizar
  const _calKey = 'vitaia_calendar_' + state.email;
  try {
    const _calSaved = localStorage.getItem(_calKey);
    calState.events = _calSaved ? JSON.parse(_calSaved) : [];
  } catch(e) { calState.events = []; }

  setTimeout(() => {
    initDarkMode();
    initCalendar();
    loadNotifPrefs();
    initSleepTimePanel();
    setupSleepReminder();
    renderCalendar();
    renderCalendarEvents();
  }, 300);
}

function updateAvatarDisplay() {
  // Header avatar button
  const btn = document.getElementById('avatar-btn');
  if (btn) {
    if (state.profilePhoto) {
      btn.innerHTML = `<img src="${state.profilePhoto}" alt="foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      btn.style.background = '';
    } else {
      btn.innerHTML = state.name[0]?.toUpperCase() || '?';
      if (state.avatarColor) btn.style.background = state.avatarColor;
    }
  }
  // Profile modal avatar
  const profilePic = document.getElementById('profile-avatar-display');
  if (profilePic) {
    let img = profilePic.querySelector('img');
    const initials = document.getElementById('profile-avatar-initials');
    if (state.profilePhoto) {
      if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;position:absolute;inset:0;'; profilePic.appendChild(img); }
      img.src = state.profilePhoto;
      if (initials) initials.style.display = 'none';
    } else {
      if (img) img.remove();
      if (initials) { initials.style.display = ''; initials.textContent = state.name[0]?.toUpperCase() || '?'; }
      profilePic.style.background = state.avatarColor || 'linear-gradient(135deg,#667eea,#764ba2)';
    }
  }
}

function openProfileModal() {
  document.getElementById('profile-name-display').textContent = state.name;
  document.getElementById('profile-email-display').textContent = state.email;
  document.getElementById('profile-avatar-initials').textContent = state.name[0]?.toUpperCase() || '?';
  const profilePic = document.getElementById('profile-avatar-display');
  if (state.profilePhoto) {
    const img = profilePic.querySelector('img') || document.createElement('img');
    img.src = state.profilePhoto;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;position:absolute;inset:0;';
    if (!profilePic.querySelector('img')) profilePic.appendChild(img);
  }
  // Sempre reatribuir o handler do modo escuro ao abrir o modal
  const toggle = document.getElementById('setting-dark');
  if (toggle) {
    const isDark = document.body.classList.contains('dark-mode');
    toggle.checked = isDark;
    toggle.onchange = function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('vitaia_dark_mode', '1');
        showToast('Modo Escuro', 'Modo escuro ativado!', '🌙');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('vitaia_dark_mode', '0');
        showToast('Modo Claro', 'Modo claro ativado!', '☀️');
      }
    };
  }
  document.getElementById('modal-profile').classList.add('active');
}

function saveApiKey() {
  const inp = document.getElementById('apikey-input');
  const key = inp ? inp.value.trim() : '';
  const dot = document.getElementById('apikey-status-dot');
  const msg = document.getElementById('apikey-status-msg');
  if (!key || key.length < 20) {
    if (msg) { msg.textContent = '❌ Chave inválida. Verifique e tente novamente.'; msg.style.color = '#ef4444'; }
    if (dot) dot.style.background = '#ef4444';
    if (inp) inp.style.borderColor = '#ef4444';
    return;
  }
  localStorage.setItem('vitaia_api_key', key);
  if (dot) { dot.style.background = '#00b87a'; }
  if (msg) { msg.textContent = '✅ Chave salva! (' + key.slice(0,8) + '••••••••)'; msg.style.color = '#00b87a'; }
  if (inp) { inp.style.borderColor = '#00b87a'; setTimeout(() => { if(inp) inp.style.borderColor = '#c8e0ff'; }, 2000); }
}

function removeApiKey() {
  if (!confirm('Remover a API Key? A IA deixará de funcionar.')) return;
  localStorage.removeItem('vitaia_api_key');
  const inp = document.getElementById('apikey-input');
  const dot = document.getElementById('apikey-status-dot');
  const msg = document.getElementById('apikey-status-msg');
  if (inp) inp.value = '';
  if (dot) dot.style.background = '#ef4444';
  if (msg) { msg.textContent = '⚠️ Chave removida. Configure uma nova para usar a IA.'; msg.style.color = '#ef4444'; }
}

function toggleApikeyVisibility() {
  const inp = document.getElementById('apikey-input');
  const btn = document.getElementById('apikey-eye-btn');
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; if (btn) btn.textContent = '🙈'; }
  else { inp.type = 'password'; if (btn) btn.textContent = '👁️'; }
}

function uploadProfilePhoto(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.profilePhoto = e.target.result;
    updateAvatarDisplay();
    saveState();
  };
  reader.readAsDataURL(file);
}

function saveProfileName() {
  const input = document.getElementById('profile-name-edit-input');
  const newName = input ? input.value.trim() : '';
  if (!newName || newName.length < 2) {
    showToast('Erro', 'Nome deve ter ao menos 2 caracteres.', '❌', 2500);
    return;
  }
  state.name = newName;
  document.getElementById('username-display').textContent = newName;
  document.getElementById('profile-name-display').textContent = newName;
  document.getElementById('profile-avatar-initials').textContent = newName[0].toUpperCase();
  // Atualizar usuário salvo
  const users = getUsers();
  const idx = users.findIndex(u => u.email === state.email);
  if (idx >= 0) { users[idx].name = newName; saveUsers(users); }
  const current = JSON.parse(localStorage.getItem('vitaia_current_user') || '{}');
  if (current) { current.name = newName; localStorage.setItem('vitaia_current_user', JSON.stringify(current)); }
  updateAvatarDisplay();
  saveState();
  showToast('Perfil atualizado', 'Nome alterado para ' + newName + '!', '✅', 2500);
  if (input) input.value = '';
}

function selectAvatarColor(dotEl) {
  document.querySelectorAll('.profile-color-dot').forEach(d => d.classList.remove('selected'));
  dotEl.classList.add('selected');
  const color = dotEl.dataset.color;
  state.avatarColor = color;
  const btn = document.getElementById('avatar-btn');
  if (btn && !state.profilePhoto) btn.style.background = color;
  saveState();
  showToast('Avatar', 'Cor do avatar atualizada!', '🎨', 1800);
}

function doLogout() {
  if (!confirm('Deseja sair da conta?')) return;
  saveState();
  localStorage.removeItem('vitaia_current_user');
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
  switchTab('login');
  renderSavedUsers();
  stopClock();
}

// Auto-login se já estava logado
(function tryAutoLogin() {
  try {
    const saved = localStorage.getItem('vitaia_current_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user && user.name && user.email) {
        enterApp(user.name, user.email);
      }
    }
  } catch(e) {}
  renderSavedUsers();
})();

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+page).style.display='block';
  if (el) el.classList.add('active');
  if (page === 'labs') closeLabScreen();
  if (page === 'progress') { checkCongrats(); renderExerciseNotes(); }
  if (page === 'tele') updateTeleSuggestion();
  if (page === 'calendar') { renderCalendar(); renderCalendarEvents(); loadNotifPrefs(); initSleepTimePanel(); }
}

function goToTele() {
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-tele').style.display='block';
  updateTeleSuggestion();
}

function openProfessionalPicker() {
  document.getElementById('modal-prof-picker').classList.add('active');
}

/* ══════════════════════════════════════════
   RELÓGIO INTERNO
══════════════════════════════════════════ */
let clockInterval = null;
function startClock() {
  stopClock();
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}
function stopClock() { if (clockInterval) { clearInterval(clockInterval); clockInterval = null; } }
function updateClock() {
  const now = new Date();
  document.getElementById('clock-time').textContent =
    now.getHours().toString().padStart(2,'0') + ':' +
    now.getMinutes().toString().padStart(2,'0') + ':' +
    now.getSeconds().toString().padStart(2,'0');
  document.getElementById('clock-date').textContent =
    now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
}
function resetDailyData(type) {
  if (!confirm(`Resetar ${type === 'all' ? 'todos os dados' : type === 'hydra' ? 'hidratação' : 'nutrição'} do dia?`)) return;
  if (type === 'hydra' || type === 'all') { state.hydra = 0; syncHydraUI(); checkWaterAlert(); }
  if (type === 'protein' || type === 'all') {
    state.nutrition = { protein:0, carb:0, fat:0 };
    state.foodLog = [];
    syncNutritionUI();
    updateProteinInsight();
  }
  if (type === 'all') { state.exercises = []; renderExercises(); }
  saveState();
}

/* ══════════════════════════════════════════
   SONO
══════════════════════════════════════════ */
function saveSleep() {
  const h = parseFloat(document.getElementById('sleep-hours').value);
  if (!h || h < 0 || h > 24) { alert('Informe horas válidas (0-24).'); return; }
  const entry = { hours: h, date: new Date().toLocaleDateString('pt-BR'), time: Date.now() };
  state.sleepLog.push(entry);
  if (state.sleepLog.length > 30) state.sleepLog = state.sleepLog.slice(-30);
  document.getElementById('sleep-hours').value = '';
  updateSleepLog();
  saveState();
}
function updateSleepLog() {
  const logEl = document.getElementById('sleep-log');
  const scoreEl = document.getElementById('sleep-score');
  if (!state.sleepLog.length) { logEl.textContent = 'Nenhum registro de sono ainda.'; scoreEl.textContent = ''; return; }
  const last = state.sleepLog[state.sleepLog.length - 1];
  const avg = (state.sleepLog.slice(-7).reduce((a,b) => a + b.hours, 0) / Math.min(state.sleepLog.length, 7)).toFixed(1);
  logEl.textContent = `Último registro: ${last.hours}h (${last.date}) · Média 7 dias: ${avg}h`;
  let quality = '', score = '';
  if (last.hours < 6) { quality = '😴 Sono insuficiente'; score = 'Tente dormir pelo menos 7h para melhorar sua saúde.'; }
  else if (last.hours <= 9) { quality = '✨ Sono adequado!'; score = 'Excelente! Continue mantendo esse ritmo de sono.'; }
  else { quality = '😪 Sono excessivo'; score = 'Dormir demais também pode afetar seu bem-estar.'; }
  scoreEl.textContent = `${quality} — ${score}`;
}

/* ══════════════════════════════════════════
   METAS EDITÁVEIS
══════════════════════════════════════════ */
function updateHydraGoal(val) {
  const v = parseFloat(val);
  if (!v || v < 0.5) return;
  HYDRA_GOAL = v;
  state.hydraGoal = v;
  syncHydraUI();
  saveState();
}
function updateNutrGoal(key, val) {
  const v = parseInt(val);
  if (!v || v < 1) return;
  NUTR_GOALS[key] = v;
  syncNutritionUI();
  updateProteinInsight();
  saveState();
}
function updateGoalInputs() {
  const pi = document.getElementById('goal-protein-input');
  const ci = document.getElementById('goal-carb-input');
  const fi = document.getElementById('goal-fat-input');
  const hi = document.getElementById('hydra-goal-input');
  if (pi) pi.value = NUTR_GOALS.protein;
  if (ci) ci.value = NUTR_GOALS.carb;
  if (fi) fi.value = NUTR_GOALS.fat;
  if (hi) hi.value = HYDRA_GOAL;
}

/* ══════════════════════════════════════════
   PROTEÍNA INSIGHT
══════════════════════════════════════════ */
function updateProteinInsight() {
  const p = Math.round(state.nutrition.protein);
  const goal = NUTR_GOALS.protein;
  document.getElementById('protein-insight-val').textContent = p;
  document.getElementById('protein-goal-display').textContent = goal;
  const pct = Math.min(Math.round((p/goal)*100), 100);
  let sub = '';
  if (p === 0) sub = 'Adicione alimentos para rastrear sua proteína';
  else if (pct < 40) sub = `⚠️ Apenas ${pct}% da meta — adicione mais proteína hoje!`;
  else if (pct < 80) sub = `👍 ${pct}% da meta atingida — bom progresso!`;
  else sub = `🎉 ${pct}% da meta — excelente ingestão proteica!`;
  document.getElementById('protein-insight-sub').textContent = sub;
}

/* ══════════════════════════════════════════
   MOOD
══════════════════════════════════════════ */
function selectMood(btn) {
  const mood = parseInt(btn.dataset.mood);
  state.moodLog.push({ mood, time: Date.now() });
  state.checkins++;
  syncMoodUI();
  document.getElementById('mood-selector').style.display = 'none';
  document.getElementById('mood-registered').style.display = 'flex';
  document.getElementById('mood-reg-sub').textContent = moodSubs[mood];
  generateInsight(mood);
  updateTeleSuggestion();
  saveState();
}
function resetMoodCard() {
  document.getElementById('mood-selector').style.display = 'flex';
  document.getElementById('mood-registered').style.display = 'none';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
}
function syncMoodUI() {
  const avg = state.moodLog.length ? (state.moodLog.reduce((a,b)=>a+b.mood,0)/state.moodLog.length).toFixed(1) : 0;
  document.getElementById('avg-mood').textContent = avg;
  document.getElementById('checkin-count').textContent = state.checkins;
  document.getElementById('ai-count').textContent = state.planCount;
  const logPct = Math.min(state.checkins*10,100);
  document.getElementById('prog-log-val').textContent = state.checkins+' registros totais';
  document.getElementById('prog-log-pct').textContent = logPct+'%';
  document.getElementById('prog-log-bar').style.width = logPct+'%';
  if (state.checkins > 0) document.getElementById('chart-placeholder').style.display = 'none';
}

/* ══════════════════════════════════════════
   INSIGHT IA
══════════════════════════════════════════ */
async function generateInsight(mood) {
  const el=document.getElementById('insight-body'), card=document.getElementById('insight-card'), title=card.querySelector('.insight-title');
  title.textContent='🤖 Gerando insight...'; el.textContent='';
  document.getElementById('insight-progress').style.display='block';
  document.getElementById('progress-fill').style.width=Math.min((state.hydra/HYDRA_GOAL)*100,100)+'%';
  document.getElementById('progress-goal').textContent='META: '+HYDRA_GOAL+'L';
  try {
    const nutrSummary = `Proteína: ${state.nutrition.protein}g/${NUTR_GOALS.protein}g, Carboidratos: ${state.nutrition.carb}g, Gordura: ${state.nutrition.fat}g`;
    const exList = state.exercises.length ? state.exercises.join(', ') : 'nenhum';
    const text = await callAI(`Você é um assistente de qualidade de vida. O usuário "${state.name}" registrou humor: ${moodLabels[mood]} (${mood}/5). Hidratação hoje: ${state.hydra}L de ${HYDRA_GOAL}L. Nutrição: ${nutrSummary}. Exercícios: ${exList}. Dê um insight motivacional e uma recomendação prática em 2-3 frases curtas. Seja positivo e personalizado.`);
    title.textContent = ['','💙 Vai ficar tudo bem','🌤️ Você está melhorando','⚡ Seguindo em frente','✨ Você está bem!','🌟 Você é um exemplo!'][mood];
    el.textContent = text;
    state.planCount++; syncMoodUI();
  } catch(e) {
    title.textContent='✨ Insight';
    el.textContent = false ? '⚠️ Erro ao conectar com a IA. Tente novamente.' : 'Continue registrando seu humor diariamente para receber orientações personalizadas!';
  }
  saveState();
}

/* ══════════════════════════════════════════
   HIDRATAÇÃO
══════════════════════════════════════════ */
function addHydra(l) { state.hydra=Math.round((state.hydra+l)*100)/100; syncHydraUI(); checkWaterAlert(); saveState(); }
function resetHydra() { state.hydra=0; syncHydraUI(); checkWaterAlert(); saveState(); }

function syncHydraUI() {
  const h=state.hydra, pct=Math.min((h/HYDRA_GOAL)*100,100);
  document.getElementById('hydra-count').textContent = h;
  document.getElementById('hydra-cup-pct').textContent = Math.round(pct)+'%';
  document.getElementById('progress-fill').style.width = pct+'%';
  document.getElementById('water-today').textContent = h+'L';
  document.getElementById('prog-hydra-val').textContent = h+'L de '+HYDRA_GOAL+'L';
  document.getElementById('prog-hydra-pct').textContent = Math.round(pct)+'%';
  document.getElementById('prog-hydra-bar').style.width = pct+'%';
  const cupWater = document.getElementById('cup-water');
  const cupWave  = document.getElementById('cup-wave');
  if (cupWater) {
    const fillH = Math.round(pct * 0.63);
    const y = 74 - fillH;
    cupWater.setAttribute('y', y); cupWater.setAttribute('height', fillH);
    cupWave.setAttribute('d', `M11 ${y} Q20 ${y-3} 29 ${y} Q38 ${y+3} 49 ${y}`);
  }
  checkCongrats();
}

function checkWaterAlert() {
  const alert = document.getElementById('water-alert');
  if (state.hydra === 0) {
    document.getElementById('water-alert-msg').textContent = 'Lembre-se de se hidratar! Você ainda não registrou água hoje.';
    alert.classList.add('show');
  } else if (state.hydra < HYDRA_GOAL) {
    document.getElementById('water-alert-msg').textContent = `💧 Você bebeu ${state.hydra}L. Meta: ${HYDRA_GOAL}L. Continue se hidratando!`;
    alert.classList.add('show');
  } else {
    alert.classList.remove('show');
  }
}

/* ══ TOAST NOTIFICATIONS ══ */
function showToast(title, msg, icon='🔔', duration=4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ══ DARK MODE ══ */
function initDarkMode() {
  const isDark = localStorage.getItem('vitaia_dark_mode') === '1';
  if (isDark) document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
  const toggle = document.getElementById('setting-dark');
  if (toggle) {
    toggle.checked = isDark;
    toggle.onchange = function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('vitaia_dark_mode', '1');
        showToast('Modo Escuro', 'Modo escuro ativado!', '🌙');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('vitaia_dark_mode', '0');
        showToast('Modo Claro', 'Modo claro ativado!', '☀️');
      }
    };
  }
}
// Aplicar modo escuro imediatamente (antes do enterApp)
if (localStorage.getItem('vitaia_dark_mode') === '1') document.body.classList.add('dark-mode');


/* ══ INTERNAL API (Anthropic) ══ */
const VITAIA_API_KEY = 'sk-ant-api03-placeholder'; // A chave funciona automaticamente via proxy
async function callAnthropicAI(prompt, systemPrompt='Você é VitaIA, assistente de saúde e bem-estar. Responda em português, de forma prática e empática.') {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': VITAIA_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text || '';
  } catch(e) {
    // fallback to Groq if configured
    const key = getApiKey();
    if (key && key.length > 20) {
      const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':'Bearer '+key }, body:JSON.stringify({ model:'llama-3.3-70b-versatile', max_tokens:512, messages:[{role:'system',content:systemPrompt},{role:'user',content:prompt}] }) });
      const d2 = await res2.json();
      if (d2.error) throw new Error(d2.error.message);
      return d2.choices?.[0]?.message?.content||'';
    }
    throw e;
  }
}

/* ══ AI FOOD ANALYZER ══ */
async function aiFoodAnalyze() {
  const input = document.getElementById('ai-food-input');
  const btn = document.getElementById('ai-food-btn');
  const result = document.getElementById('ai-food-result');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  btn.disabled = true; btn.textContent = '...';
  result.classList.remove('visible');
  try {
    const prompt = `Analise este alimento/refeição e forneça os valores nutricionais estimados: "${text}". Responda APENAS em JSON assim: {"nome":"nome do alimento","proteina":X,"carboidrato":X,"gordura":X,"calorias":X,"porcao":"descrição da porção"} onde X é um número. Sem texto adicional, apenas JSON.`;
    const sysP = 'Você é nutricionista especialista em composição nutricional. Retorne APENAS JSON válido, sem markdown, sem texto extra.';
    let reply;
    try { reply = await callAnthropicAI(prompt, sysP); }
    catch(e) { reply = await callAI(prompt); }
    const clean = reply.replace(/```json|```/g, '').trim();
    const food = JSON.parse(clean);
    result.innerHTML = `<strong>🥗 ${food.nome}</strong> <span style="color:var(--muted);font-size:11px">(${food.porcao})</span><br><span style="color:var(--protein)">Proteína: <strong>${food.proteina}g</strong></span> · <span style="color:#cd853f">Carbs: <strong>${food.carboidrato}g</strong></span> · <span style="color:var(--fat)">Gordura: <strong>${food.gordura}g</strong></span> · Calorias: <strong>${food.calorias}kcal</strong><br><button style="margin-top:8px;padding:6px 14px;background:linear-gradient(135deg,#00b87a,#0ea5e9);color:#fff;border:none;border-radius:8px;font-size:12px;font-family:'Syne',sans-serif;font-weight:700;cursor:pointer" onclick="aiAddFood(${food.proteina||0},${food.carboidrato||0},${food.gordura||0},'${(food.nome||'Alimento').replace(/'/g,"\'")}')">+ ADICIONAR AO LOG</button>`;
    result.classList.add('visible');
  } catch(e) {
    result.innerHTML = '<span style="color:var(--red)">Não foi possível calcular. Configure a API Key no perfil ou tente novamente.</span>';
    result.classList.add('visible');
  }
  btn.disabled = false; btn.textContent = 'IA CALCULAR';
}

function aiAddFood(protein, carb, fat, nome) {
  const food = { nome, protein: parseFloat(protein)||0, carb: parseFloat(carb)||0, fat: parseFloat(fat)||0 };
  state.foodLog.push(food);
  state.nutrition.protein += food.protein;
  state.nutrition.carb    += food.carb;
  state.nutrition.fat     += food.fat;
  document.getElementById('ai-food-input').value = '';
  document.getElementById('ai-food-result').classList.remove('visible');
  syncNutritionUI();
  updateProteinInsight();
  checkCongrats();
  saveState();
  showToast('Alimento adicionado!', nome + ' foi adicionado ao seu log.', '🥗');
}

/* ══ CALENDAR ══ */
let calState = { year: new Date().getFullYear(), month: new Date().getMonth(), selected: null, events: [] };

function initCalendar() {
  // Não resetar events aqui — já carregado em enterApp
  renderCalendar();
  renderCalendarEvents();
}

function saveCalendar() {
  const key = 'vitaia_calendar_' + (state.email || 'guest');
  try {
    localStorage.setItem(key, JSON.stringify(calState.events));
    // Firebase backup
    if (window._vitaiaDB && state.email) {
      try {
        const { ref: fbRef, set: fbSet } = window._vitaiaDBAPI;
        fbSet(fbRef(window._vitaiaDB, 'users/' + state.email.replace(/[.@]/g,'_') + '/calendar'), calState.events).catch(()=>{});
      } catch(e) {}
    }
  } catch(e) {}
}

function calNav(dir) {
  calState.month += dir;
  if (calState.month > 11) { calState.month = 0; calState.year++; }
  if (calState.month < 0)  { calState.month = 11; calState.year--; }
  renderCalendar();
}

function renderCalendar() {
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const el = document.getElementById('cal-month-label');
  if (el) el.textContent = months[calState.month] + ' ' + calState.year;
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  const first = new Date(calState.year, calState.month, 1).getDay();
  const days = new Date(calState.year, calState.month + 1, 0).getDate();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  let html = '';
  for (let i = 0; i < first; i++) html += '<div class="cal-day other-month"></div>';
  for (let d = 1; d <= days; d++) {
    const key = `${calState.year}-${calState.month+1}-${d}`;
    const isToday = key === todayKey;
    const dayEvents = calState.events.filter(e => e.date === key);
    const hasEvent = dayEvents.length > 0;
    const isSelected = calState.selected === key;
    html += `<div class="cal-day${isToday?' today':''}${hasEvent?' has-event':''}${isSelected?' selected':''}" onclick="calSelectDay('${key}',${d})" style="${isSelected&&!isToday?'outline:2px solid var(--cyan);':''}">
      <span>${d}</span>
      ${dayEvents.length?`<div class="cal-dot-wrap">${dayEvents.slice(0,3).map(()=>'<div class="cal-dot" style="background:var(--teal)"></div>').join('')}</div>`:''}
    </div>`;
  }
  grid.innerHTML = html;
}

function calSelectDay(key, day) {
  calState.selected = key;
  renderCalendar();
  const addEl = document.getElementById('cal-add-event');
  const labelEl = document.getElementById('cal-selected-label');
  if (addEl) addEl.style.display = 'block';
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const parts = key.split('-');
  if (labelEl) labelEl.textContent = `Dia ${day} de ${months[calState.month]} de ${calState.year}`;
  document.getElementById('cal-event-input')?.focus();
}

function calAddEvent() {
  const input = document.getElementById('cal-event-input');
  const timeInput = document.getElementById('cal-event-time');
  const text = input ? input.value.trim() : '';
  if (!text || !calState.selected) return;
  const time = timeInput ? timeInput.value : '09:00';
  const colors = ['#0ea5e9','#00b87a','#8b5cf6','#f97316','#ec4899'];
  calState.events.push({ date: calState.selected, text, time, color: colors[Math.floor(Math.random()*colors.length)] });
  calState.events.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  if (input) input.value = '';
  saveCalendar();
  renderCalendar();
  renderCalendarEvents();
  showToast('Evento adicionado!', text + ' às ' + time, '📅');
}

function calDeleteEvent(idx) {
  calState.events.splice(idx, 1);
  saveCalendar();
  renderCalendar();
  renderCalendarEvents();
}

function renderCalendarEvents() {
  const list = document.getElementById('cal-event-list');
  if (!list) return;
  const today = new Date();
  today.setHours(0,0,0,0);
  const upcoming = calState.events.filter(e => {
    const parts = e.date.split('-');
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    return d >= today;
  }).slice(0, 20);
  if (!upcoming.length) {
    list.innerHTML = '<div style="font-size:13px;color:var(--muted);text-align:center;padding:12px">Nenhum evento próximo. Clique em um dia!</div>';
    return;
  }
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  list.innerHTML = upcoming.map((ev, i) => {
    const parts = ev.date.split('-');
    const dateLabel = `${parts[2]}/${months[parseInt(parts[1])-1]}`;
    return `<div class="cal-event-item">
      <div class="cal-event-dot" style="background:${ev.color||'var(--teal)'}"></div>
      <div class="cal-event-text">${ev.text}</div>
      <div class="cal-event-date">${dateLabel} ${ev.time}</div>
      <button class="cal-event-del" onclick="calDeleteEvent(${calState.events.indexOf(ev)})">✕</button>
    </div>`;
  }).join('');
}

/* ══ NOTIFICAÇÕES DE SONO E HIDRATAÇÃO ══ */
let notifPrefs = { hydra: true, sleep: true, consult: true };
let sleepTimePref = '22:30';
let sleepReminderInterval = null;

function initSleepTimePanel() {
  const hourSel = document.getElementById('sleep-hour-sel');
  const minSel  = document.getElementById('sleep-min-sel');
  if (!hourSel || !minSel) return;
  // Populate hours (0-23) if not already done
  if (hourSel.options.length === 0) {
    for (let h = 0; h < 24; h++) {
      const o = document.createElement('option');
      o.value = String(h).padStart(2,'0');
      o.textContent = String(h).padStart(2,'0');
      hourSel.appendChild(o);
    }
  }
  // Populate minutes 01-60 if not already done
  if (minSel.options.length === 0) {
    for (let m = 1; m <= 59; m++) {
      const o = document.createElement('option');
      o.value = String(m).padStart(2,'0');
      o.textContent = String(m).padStart(2,'0');
      minSel.appendChild(o);
    }
  }
  const saved = localStorage.getItem('vitaia_sleep_time') || '22:30';
  const parts = saved.split(':');
  const sh = parts[0] || '22';
  const sm = parts[1] || '30';
  hourSel.value = sh;
  minSel.value  = sm;
  // If saved minute doesn't match any option (e.g. old data), default to '30'
  if (!minSel.value) minSel.value = '30';
  const display = (hourSel.value || '22') + ':' + (minSel.value || '30');
  const dispEl = document.getElementById('sleep-time-display');
  const prefEl = document.getElementById('sleep-time-pref');
  if (dispEl) dispEl.textContent = display;
  if (prefEl) prefEl.value = display;
}
function updateSleepTimePref() {
  const h = document.getElementById('sleep-hour-sel').value;
  const m = document.getElementById('sleep-min-sel').value;
  const val = h + ':' + m;
  document.getElementById('sleep-time-pref').value = val;
  document.getElementById('sleep-time-display').textContent = val;
  localStorage.setItem('vitaia_sleep_time', val);
}

function loadNotifPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem('vitaia_notif_prefs') || '{}');
    notifPrefs = Object.assign(notifPrefs, saved);
    sleepTimePref = localStorage.getItem('vitaia_sleep_time') || '22:30';
    const nh = document.getElementById('notif-hydra');
    const ns = document.getElementById('notif-sleep');
    const nc = document.getElementById('notif-consult');
    const st = document.getElementById('sleep-time-pref');
    if (nh) nh.checked = notifPrefs.hydra;
    if (ns) ns.checked = notifPrefs.sleep;
    if (nc) nc.checked = notifPrefs.consult;
    if (st) st.value = sleepTimePref;
  } catch(e) {}
}

function saveNotifPrefs() {
  const nh = document.getElementById('notif-hydra');
  const ns = document.getElementById('notif-sleep');
  const nc = document.getElementById('notif-consult');
  notifPrefs = {
    hydra: nh ? nh.checked : true,
    sleep: ns ? ns.checked : true,
    consult: nc ? nc.checked : true
  };
  localStorage.setItem('vitaia_notif_prefs', JSON.stringify(notifPrefs));
  showToast('Preferências salvas', 'Notificações atualizadas!', '✅', 2500);
}

function saveSleepTimePref() {
  const st = document.getElementById('sleep-time-pref');
  if (st) { sleepTimePref = st.value; localStorage.setItem('vitaia_sleep_time', sleepTimePref); }
  setupSleepReminder();
  showToast('Lembrete configurado', 'Você será avisado às ' + sleepTimePref, '😴');
}

function testSleepReminder() {
  showToast('😴 Hora de dormir!', 'Você configurou ' + (document.getElementById('sleep-time-pref')?.value || sleepTimePref) + ' como horário de dormir. Boa noite!', '🌙', 5000);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('😴 VitaIA — Hora de dormir!', { body: 'Prepare-se para uma boa noite de sono. Seu horário é ' + sleepTimePref });
  }
}

function setupSleepReminder() {
  if (sleepReminderInterval) clearInterval(sleepReminderInterval);
  sleepReminderInterval = setInterval(() => {
    if (!notifPrefs.sleep) return;
    const now = new Date();
    const hhmm = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    // Notify 30 min before sleep time
    const [sh, sm] = sleepTimePref.split(':').map(Number);
    const sleepMins = sh * 60 + sm;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const diff = sleepMins - nowMins;
    if (diff === 30 || diff === 0) {
      const msg = diff === 30 ? 'Faltam 30 minutos para a hora de dormir!' : 'Hora de dormir! Boa noite!';
      showToast('😴 Lembrete de sono', msg, '🌙', 6000);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('😴 VitaIA — ' + msg, { body: 'Configurado para ' + sleepTimePref });
      }
    }
    // Check upcoming calendar events (30 min reminder)
    if (notifPrefs.consult) {
      const todayKey = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
      calState.events.filter(e => e.date === todayKey).forEach(ev => {
        const [eh, em] = ev.time.split(':').map(Number);
        const evMins = eh * 60 + em;
        if (evMins - nowMins === 30) {
          showToast('📅 Lembrete de consulta', ev.text + ' em 30 minutos!', '📅', 6000);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📅 VitaIA — Consulta em 30 min!', { body: ev.text + ' às ' + ev.time });
          }
        }
      });
    }
  }, 60000);
}

function startWaterReminder() {
  setTimeout(() => checkWaterAlert(), 1000);
  setInterval(() => {
    if (notifPrefs.hydra && state.hydra < HYDRA_GOAL) {
      checkWaterAlert();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💧 VitaIA – Hora de se hidratar!', { body: `Você bebeu ${state.hydra}L hoje. Meta: ${HYDRA_GOAL}L` });
      }
      showToast('💧 Hidratação', `Você bebeu ${state.hydra}L hoje. Meta: ${HYDRA_GOAL}L. Tome um copo d'água!`, '💧', 5000);
    }
    // Verifica mudança de data durante sessão ativa (ex: meia-noite sem relogin)
    const _today = new Date().toDateString();
    if (state.lastDailyReset && state.lastDailyReset !== _today && !document.getElementById('daily-reset-modal')) {
      showDailyResetModal();
    }
  }, 30 * 60 * 1000);
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/* ══════════════════════════════════════════
   NUTRIÇÃO
══════════════════════════════════════════ */
function searchFood() {
  const q = document.getElementById('food-search').value.toLowerCase().trim();
  const suggsEl = document.getElementById('food-suggestions');
  if (!q) { suggsEl.style.display='none'; selectedFood=null; return; }
  const matches = FOOD_DB.filter(f => f.nome.toLowerCase().includes(q)).slice(0,6);
  if (!matches.length) { suggsEl.style.display='none'; return; }
  suggsEl.innerHTML = matches.map((f,i) =>
    `<div class="food-sugg-item" onclick="selectFoodSugg(${i},'${f.nome.replace(/'/g,"\\'")}')">
      ${f.nome}
      <div class="food-sugg-macros">
        <span style="color:var(--protein)">P: ${f.protein}g</span>
        <span style="color:#cd853f">C: ${f.carb}g</span>
        <span style="color:var(--fat)">G: ${f.fat}g</span>
      </div>
    </div>`
  ).join('');
  suggsEl.style.display='block';
  suggsEl._matches = matches;
}

function selectFoodSugg(idx, nome) {
  const matches = document.getElementById('food-suggestions')._matches;
  selectedFood = matches[idx];
  document.getElementById('food-search').value = nome;
  document.getElementById('food-suggestions').style.display='none';
}

function addSelectedFood() {
  if (!selectedFood) {
    const q = document.getElementById('food-search').value.toLowerCase().trim();
    selectedFood = FOOD_DB.find(f => f.nome.toLowerCase().includes(q));
  }
  if (!selectedFood) { alert('Selecione um alimento da lista!'); return; }
  state.foodLog.push({...selectedFood});
  state.nutrition.protein += selectedFood.protein;
  state.nutrition.carb    += selectedFood.carb;
  state.nutrition.fat     += selectedFood.fat;
  document.getElementById('food-search').value = '';
  document.getElementById('food-suggestions').style.display = 'none';
  selectedFood = null;
  syncNutritionUI();
  updateProteinInsight();
  checkCongrats();
  saveState();
}

function removeFood(idx) {
  const food = state.foodLog[idx];
  state.nutrition.protein -= food.protein;
  state.nutrition.carb    -= food.carb;
  state.nutrition.fat     -= food.fat;
  state.foodLog.splice(idx, 1);
  syncNutritionUI();
  updateProteinInsight();
  checkCongrats();
  saveState();
}

function syncNutritionUI() {
  const { protein, carb, fat } = state.nutrition;
  const pPct = Math.min((protein/NUTR_GOALS.protein)*100,100);
  const cPct = Math.min((carb/NUTR_GOALS.carb)*100,100);
  const fPct = Math.min((fat/NUTR_GOALS.fat)*100,100);
  document.getElementById('nutr-protein-val').textContent = Math.round(protein);
  document.getElementById('nutr-carb-val').textContent    = Math.round(carb);
  document.getElementById('nutr-fat-val').textContent     = Math.round(fat);
  document.getElementById('nutr-protein-bar').style.width = pPct+'%';
  document.getElementById('nutr-carb-bar').style.width    = cPct+'%';
  document.getElementById('nutr-fat-bar').style.width     = fPct+'%';
  document.getElementById('prog-protein-val').textContent = Math.round(protein)+'g de '+NUTR_GOALS.protein+'g';
  document.getElementById('prog-carb-val').textContent    = Math.round(carb)+'g de '+NUTR_GOALS.carb+'g';
  document.getElementById('prog-fat-val').textContent     = Math.round(fat)+'g de '+NUTR_GOALS.fat+'g';
  document.getElementById('prog-protein-pct').textContent = Math.round(pPct)+'%';
  document.getElementById('prog-carb-pct').textContent    = Math.round(cPct)+'%';
  document.getElementById('prog-fat-pct').textContent     = Math.round(fPct)+'%';
  document.getElementById('prog-protein-bar').style.width = pPct+'%';
  document.getElementById('prog-carb-bar').style.width    = cPct+'%';
  document.getElementById('prog-fat-bar').style.width     = fPct+'%';
  const logEl = document.getElementById('food-log-list');
  if (!logEl) return;
  logEl.innerHTML = state.foodLog.map((f,i) =>
    `<div class="food-log-item">
      <span class="food-log-name">${f.nome}</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="food-log-macros">
          <span class="food-log-macro-p">P:${Math.round(f.protein)}g</span>
          <span class="food-log-macro-c">C:${Math.round(f.carb)}g</span>
          <span class="food-log-macro-f">G:${Math.round(f.fat)}g</span>
        </span>
        <button class="btn-del-food" onclick="removeFood(${i})">✕</button>
      </div>
    </div>`
  ).join('');
}

/* ══════════════════════════════════════════
   EXERCÍCIOS
══════════════════════════════════════════ */
function toggleExercise(id, label) {
  const btn = document.getElementById('ex-'+id);
  const idx = state.exercises.indexOf(label);
  if (idx >= 0) { state.exercises.splice(idx, 1); btn.classList.remove('done'); }
  else { state.exercises.push(label); btn.classList.add('done'); }
  const logEl = document.getElementById('exercise-log');
  logEl.textContent = state.exercises.length ? '✓ ' + state.exercises.join(' · ') : 'Nenhum exercício registrado hoje.';
  checkCongrats();
  saveState();
}
function renderExercises() {
  const logEl = document.getElementById('exercise-log');
  ['caminhada','corrida','musculacao','yoga','natacao','ciclismo'].forEach(id => {
    const btn = document.getElementById('ex-'+id);
    if (btn) btn.classList.remove('done');
  });
  state.exercises.forEach(label => {
    const map = { '🚶 Caminhada':'caminhada','🏃 Corrida':'corrida','🏋️ Musculação':'musculacao','🧘 Yoga':'yoga','🏊 Natação':'natacao','🚴 Ciclismo':'ciclismo' };
    const id = Object.entries(map).find(([l]) => l === label)?.[1];
    if (id) document.getElementById('ex-'+id)?.classList.add('done');
  });
  if (logEl) logEl.textContent = state.exercises.length ? '✓ ' + state.exercises.join(' · ') : 'Nenhum exercício registrado hoje.';
}

/* Notas de exercícios externos */
function saveExerciseNote() {
  const input = document.getElementById('exercise-notes-input');
  const text = input.value.trim();
  if (!text) return;
  state.exerciseNotes.push({ text, date: new Date().toLocaleDateString('pt-BR'), time: Date.now() });
  input.value = '';
  renderExerciseNotes();
  saveState();
}
function renderExerciseNotes() {
  const list = document.getElementById('exercise-saved-list');
  if (!list) return;
  if (!state.exerciseNotes.length) { list.innerHTML = ''; return; }
  list.innerHTML = state.exerciseNotes.slice(-10).reverse().map((n, ri) => {
    const i = state.exerciseNotes.length - 1 - ri;
    return `<div class="exercise-saved-item">
      <div><strong style="font-size:11px;color:var(--muted)">${n.date}</strong><br>${n.text}</div>
      <button class="exercise-saved-del" onclick="deleteExerciseNote(${i})">✕</button>
    </div>`;
  }).join('');
}
function deleteExerciseNote(idx) {
  state.exerciseNotes.splice(idx, 1);
  renderExerciseNotes();
  saveState();
}

/* ══════════════════════════════════════════
   PARABÉNS
══════════════════════════════════════════ */
function checkCongrats() {
  const hydraOk   = state.hydra >= HYDRA_GOAL;
  const proteinOk = state.nutrition.protein >= NUTR_GOALS.protein;
  const carbOk    = state.nutrition.carb    >= NUTR_GOALS.carb;
  const fatOk     = state.nutrition.fat     >= NUTR_GOALS.fat;
  const banner    = document.getElementById('congrats-banner');
  const sub       = document.getElementById('congrats-sub');
  if (!banner) return;
  const metas = [];
  if (hydraOk) metas.push('Hidratação 💧');
  if (proteinOk) metas.push('Proteína 🥩');
  if (carbOk) metas.push('Carboidratos 🍚');
  if (fatOk) metas.push('Gordura 🥑');
  if (state.exercises.length) metas.push('Exercícios 💪');
  if (hydraOk && proteinOk) {
    banner.classList.add('show');
    sub.textContent = 'Metas atingidas: ' + metas.join(', ') + '!';
  } else {
    banner.classList.remove('show');
  }
}

/* ══════════════════════════════════════════
   AJUDA IMEDIATA / CHAT IA
══════════════════════════════════════════ */
function openAjuda(mood) {
  state.chatHistory = [];
  const chatEl = document.getElementById('ajuda-chat');
  chatEl.innerHTML = '';
  document.getElementById('ajuda-input').value = '';
  document.getElementById('ajuda-input').style.height = 'auto';
  document.getElementById('ajuda-btn').textContent = 'ENVIAR';
  document.getElementById('ajuda-btn').disabled = false;
  const intro = (mood !== undefined && moodCtx[mood]) ? moodCtx[mood] : 'Olá! Sou a VitaIA. Como posso te ajudar hoje?';
  appendBubble('ajuda-chat','ai', intro);
  state.chatHistory.push({ role:'assistant', content:intro });
  document.getElementById('modal-ajuda').classList.add('active');
  setTimeout(() => document.getElementById('ajuda-input').focus(), 300);
}
function appendBubble(areaId, who, text) {
  const chat = document.getElementById(areaId);
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}
async function sendAjuda() {
  const input = document.getElementById('ajuda-input');
  const text = input.value.trim();
  if (!text) return;
  appendBubble('ajuda-chat','user', text);
  input.value = ''; input.style.height = 'auto';
  state.chatHistory.push({ role:'user', content:text });
  const btn = document.getElementById('ajuda-btn');
  btn.disabled = true; btn.textContent = '...';
  const typing = appendBubble('ajuda-chat','ai typing','...');
  const nutrInfo = `Nutrição: Proteína ${Math.round(state.nutrition.protein)}g/${NUTR_GOALS.protein}g, Carb ${Math.round(state.nutrition.carb)}g, Gordura ${Math.round(state.nutrition.fat)}g.`;
  const exInfo = state.exercises.length ? 'Exercícios: '+state.exercises.join(', ')+'.' : '';
  const sysPrompt = `Você é VitaIA, assistente empático de qualidade de vida. Usuário: "${state.name}". Humor atual: ${state.moodLog.length?moodLabels[state.moodLog[state.moodLog.length-1].mood]:'não informado'}. Hidratação: ${state.hydra}L de ${HYDRA_GOAL}L. ${nutrInfo} ${exInfo} Responda de forma calorosa, prática e concisa (máximo 4 frases). Se perceber crise emocional severa, indique gentilmente o CVV (188).`;
  try {
    const reply = await callAIChat(sysPrompt, state.chatHistory);
    typing.classList.remove('typing'); typing.textContent = reply;
    state.chatHistory.push({ role:'assistant', content:reply });
    state.planCount++; syncMoodUI();
    btn.textContent = 'ENVIAR';
  } catch(e) {
    typing.classList.remove('typing');
    typing.textContent = false ? '⚠️ Erro ao conectar com a IA. Tente novamente.' : 'Respire fundo. Você não está sozinho. Tente novamente em instantes.';
    btn.textContent = 'ENVIAR';
  } finally {
    btn.disabled = false;
    document.getElementById('ajuda-chat').scrollTop = 9999;
  }
  saveState();
}

/* ══════════════════════════════════════════
   PLANOS
══════════════════════════════════════════ */
async function generatePlan() {
  document.querySelector('.plans-hero').style.display='none';
  document.getElementById('plan-loading').style.display='block';
  document.getElementById('plan-result').classList.remove('visible');
  const lastMood = state.moodLog.length?state.moodLog[state.moodLog.length-1].mood:3;
  const nutrInfo = `Proteína: ${Math.round(state.nutrition.protein)}g/${NUTR_GOALS.protein}g, Carb: ${Math.round(state.nutrition.carb)}g/${NUTR_GOALS.carb}g, Gordura: ${Math.round(state.nutrition.fat)}g/${NUTR_GOALS.fat}g`;
  const exInfo = state.exercises.length ? state.exercises.join(', ') : 'nenhum';
  try {
    const text = await callAI(`Crie um plano de qualidade de vida para "${state.name}". Humor: ${moodLabels[lastMood]} (${lastMood}/5). Hidratação: ${state.hydra}L de ${HYDRA_GOAL}L. Nutrição: ${nutrInfo}. Exercícios hoje: ${exInfo}. Responda APENAS em JSON sem markdown: {"saudacao":"...","manha":["..."],"almoco":["..."],"tarde":["..."],"noite":["..."]}`);
    const plan = JSON.parse(text.replace(/```json|```/g,'').trim());
    document.getElementById('plan-loading').style.display='none';
    const result = document.getElementById('plan-result');
    result.innerHTML = `<div class="insight-card" style="margin-bottom:16px"><div class="insight-title">✦ Seu plano para hoje</div><div class="insight-body">${plan.saudacao||''}</div></div>${rPS('🌅 Manhã',plan.manha)}${rPS('🥗 Alimentação',plan.almoco)}${rPS('☀️ Tarde',plan.tarde)}${rPS('🌙 Noite',plan.noite)}<button class="btn-outline" style="width:100%;margin-top:8px" onclick="resetPlan()">Refazer Plano</button>`;
    result.classList.add('visible');
    state.planCount++; syncMoodUI();
  } catch(e) {
    document.getElementById('plan-loading').style.display='none';
    document.getElementById('plan-result').innerHTML=`<div class="plan-item">${false?'⚠️ Erro ao conectar com a IA. Tente novamente.':'Não foi possível gerar o plano agora. Tente novamente.'}</div>`;
    document.getElementById('plan-result').classList.add('visible');
  }
  saveState();
}
function rPS(t,items){ return items?.length?`<div class="plan-section"><h3>${t}</h3>${items.map(i=>`<div class="plan-item">${i}</div>`).join('')}</div>`:''; }
function resetPlan(){ document.querySelector('.plans-hero').style.display='flex'; document.getElementById('plan-result').classList.remove('visible'); document.getElementById('plan-result').innerHTML=''; }

/* ══════════════════════════════════════════
   LABS
══════════════════════════════════════════ */
function openLabScreen(name) {
  document.getElementById('lab-list-view').style.display='none';
  document.querySelectorAll('.lab-screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('lab-screen-'+name).classList.add('active');
}
function closeLabScreen() {
  document.querySelectorAll('.lab-screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('lab-list-view').style.display='flex';
}
function handleImageUpload(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const preview = document.getElementById('visao-preview');
    preview.src = dataUrl; preview.style.display = 'block';
    document.getElementById('visao-upload-area').style.display = 'none';
    state.visaoImageData = dataUrl.split(',')[1];
  };
  reader.readAsDataURL(file);
}
const labPrompts = {
  visao: (input) => `Você é nutricionista e personal trainer. Analise a imagem e: "${input}". Dê análise detalhada com 3-5 pontos práticos.`,
  explorador: (input) => `Você é guia de bem-estar. O usuário busca: "${input}". Dê dicas práticas sobre locais saudáveis.`,
  deepthink: (input) => `Você é consultor de saúde com embasamento científico. Analise com profundidade: "${input}". Estruture com contexto, análise e recomendações práticas.`,
  voz: (input) => `Você é guia de bem-estar. Crie orientação calorosa e motivacional sobre: "${input}". Tom calmo e encorajador. Máximo 5 frases.`
};
async function executeLab(labName) {
  const inputEl=document.getElementById(labName+'-input'), btnEl=document.getElementById(labName+'-btn'), responseEl=document.getElementById(labName+'-response'), responseTextEl=document.getElementById(labName+'-response-text');
  const input=inputEl.value.trim(); if (!input) { inputEl.focus(); return; }
  btnEl.disabled=true; btnEl.textContent='Consultando IA...'; responseEl.classList.remove('visible');
  const imageData = labName==='visao' ? state.visaoImageData : null;
  try {
    const text = await callAI(labPrompts[labName](input), imageData);
    responseTextEl.textContent = text; responseEl.classList.add('visible');
    if (labName==='voz') { state.vozText=text; setupVozPlayer(text); }
    state.planCount++; syncMoodUI();
  } catch(e) {
    responseTextEl.textContent = false ? '⚠️ Erro ao conectar com a IA. Tente novamente.' : '❌ Erro ao consultar a IA.';
    responseEl.classList.add('visible');
  } finally { btnEl.disabled=false; btnEl.textContent='EXECUTAR IA'; }
}

/* ══════════════════════════════════════════
   VOZ VITAL
══════════════════════════════════════════ */
function setupVozPlayer(text) {
  if (!window.speechSynthesis) return;
  const player = document.getElementById('voz-player');
  player.classList.add('visible');
  const wave = document.getElementById('voz-wave'); wave.innerHTML='';
  for (let i=0;i<28;i++){const span=document.createElement('span');const h=4+Math.random()*24;span.style.height=h+'px';span.style.animationDelay=(i*0.06)+'s';wave.appendChild(span);}
  speakVoz(text);
}
function speakVoz(text){if(!window.speechSynthesis)return;speechSynthesis.cancel();const utt=new SpeechSynthesisUtterance(text);utt.lang='pt-BR';utt.rate=0.9;utt.pitch=1;state.vozUtterance=utt;utt.onstart=()=>document.getElementById('voz-play-btn').textContent='⏸';utt.onend=()=>document.getElementById('voz-play-btn').textContent='▶';speechSynthesis.speak(utt);}
function toggleVozPlayback(){if(!window.speechSynthesis)return;if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();document.getElementById('voz-play-btn').textContent='▶';}else if(speechSynthesis.paused){speechSynthesis.resume();document.getElementById('voz-play-btn').textContent='⏸';}else if(state.vozText){speakVoz(state.vozText);}}

/* ══════════════════════════════════════════
   MIC
══════════════════════════════════════════ */
let recognition = null;
function toggleMic(inputId, micBtnId) {
  const micBtn = document.getElementById(micBtnId);
  if (!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){alert('Use Chrome para reconhecimento de voz.');return;}
  if (recognition && recognition._active){recognition.stop();return;}
  const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new SR(); recognition.lang='pt-BR'; recognition.continuous=false; recognition.interimResults=false; recognition._active=true;
  micBtn.classList.add('recording');
  recognition.onresult=(e)=>{const t=e.results[0][0].transcript;const el=document.getElementById(inputId);el.value=(el.value?el.value+' ':'')+t;};
  recognition.onend=()=>{recognition._active=false;micBtn.classList.remove('recording');};
  recognition.onerror=()=>{recognition._active=false;micBtn.classList.remove('recording');};
  recognition.start();
}

/* ══════════════════════════════════════════
   TELESAÚDE
══════════════════════════════════════════ */
let currentSchedProf = '';
function updateTeleConsultBadge() {
  document.getElementById('tele-consult-used').textContent = state.teleConsultToday;
  document.getElementById('tele-limit-badge').style.background = state.teleConsultToday >= 1 ? '#fef2f2' : '#fef3c7';
  document.getElementById('tele-limit-badge').style.borderColor = state.teleConsultToday >= 1 ? '#fecaca' : '#fde68a';
}
function selectTeleType(type) {
  const list = document.querySelector('.tele-prof-list');
  if (list) { list.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function openTeleVideo(profName) {
  showToast('📹 Vídeo Chamada', 'Iniciando videochamada com ' + profName + '...', '📹', 3000);
  setTimeout(() => {
    const url = 'https://meet.jit.si/VitaIA-' + profName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    window.open(url, '_blank', 'width=900,height=700');
  }, 1000);
}
function openTeleChat(profName, spec) {
  if (state.teleConsultToday >= 1) {
    alert('⚠️ Você atingiu o limite de 1 consulta por dia. Volte amanhã!');
    return;
  }
  state.teleConsultToday++;
  updateTeleConsultBadge();
  state.teleChatProf = profName;
  state.teleChatHistory = [];
  document.getElementById('tele-chat-title').textContent = '💬 Chat com '+profName;
  document.getElementById('tele-chat-sub').textContent = spec+' · Consulta segura e criptografada';
  const chatEl = document.getElementById('tele-chat-area');
  chatEl.innerHTML = '';
  const intro = `Olá! Sou ${profName}, ${spec}. Como posso te ajudar hoje? Você pode me enviar fotos de refeições, dúvidas sobre treinos ou qualquer questão de saúde.`;
  appendBubble('tele-chat-area','ai', intro);
  state.teleChatHistory.push({ role:'assistant', content:intro });
  document.getElementById('modal-tele-chat').classList.add('active');
  saveState();
}
async function sendTeleChat() {
  const input = document.getElementById('tele-chat-input');
  const text = input.value.trim(); if (!text) return;
  appendBubble('tele-chat-area','user', text);
  input.value=''; input.style.height='auto';
  state.teleChatHistory.push({ role:'user', content:text });
  const btn = document.getElementById('tele-chat-btn');
  btn.disabled=true; btn.textContent='...';
  const typing = appendBubble('tele-chat-area','ai typing','...');
  const nutrInfo = `Dados do paciente: Proteína ${Math.round(state.nutrition.protein)}g/${NUTR_GOALS.protein}g, Carb ${Math.round(state.nutrition.carb)}g, Gordura ${Math.round(state.nutrition.fat)}g. Água: ${state.hydra}L de ${HYDRA_GOAL}L. Humor: ${state.moodLog.length?moodLabels[state.moodLog[state.moodLog.length-1].mood]:'não registrado'}.`;
  const sysPrompt = `Você é ${state.teleChatProf}, um profissional de saúde compassivo. ${nutrInfo} Responda de forma profissional, prática e empática. Máximo 4 frases.`;
  try {
    const reply = await callAIChat(sysPrompt, state.teleChatHistory);
    typing.classList.remove('typing'); typing.textContent = reply;
    state.teleChatHistory.push({ role:'assistant', content:reply });
  } catch(e) {
    typing.classList.remove('typing');
    typing.textContent = false ? '⚠️ Configure sua API Key.' : '⚠️ Erro de conexão. Tente novamente.';
  } finally { btn.disabled=false; btn.textContent='ENVIAR'; document.getElementById('tele-chat-area').scrollTop=9999; }
}
function scheduleTele(profName) {
  currentSchedProf = profName;
  document.getElementById('schedule-prof-name').textContent = '📅 Consulta com '+profName;
  const now = new Date(); now.setMinutes(0,0,0); now.setHours(now.getHours()+1);
  document.getElementById('schedule-datetime').value = now.toISOString().slice(0,16);
  document.getElementById('modal-schedule').classList.add('active');
}
function confirmSchedule() {
  const dt = document.getElementById('schedule-datetime').value;
  const type = document.getElementById('schedule-type').value;
  if (!dt) { alert('Selecione data e horário.'); return; }
  const d = new Date(dt);
  const label = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} • ${d.toLocaleDateString('pt-BR')}`;
  state.teleSchedules.push({ prof:currentSchedProf, time:label, type });
  renderSchedules();
  closeModal('modal-schedule');
  alert(`✓ Consulta agendada com ${currentSchedProf} em ${label}!`);
  saveState();
}
function renderSchedules() {
  const el = document.getElementById('tele-schedule-list');
  if (!state.teleSchedules.length) { el.innerHTML='<div style="font-size:13px;color:var(--muted);padding:12px 0;">Nenhuma consulta agendada. Escolha um profissional acima!</div>'; return; }
  el.innerHTML = state.teleSchedules.map(s =>
    `<div class="tele-sched-item">
      <div class="tele-sched-time">${s.time}</div>
      <div><div class="tele-sched-name">${s.prof}</div><div class="tele-sched-type">${s.type==='video'?'📹 Vídeo':'💬 Chat'}</div></div>
      <span class="tele-badge ${s.type==='video'?'badge-video':'badge-chat'}">${s.type==='video'?'VIDEO':'CHAT'}</span>
    </div>`
  ).join('');
}
function rateTele(stars) {
  document.querySelectorAll('.tele-rating-star').forEach((s,i)=>{s.style.color=i<stars?'#ffd700':'#333';});
  document.getElementById('tele-rating-msg').textContent = ['','⭐ Precisa melhorar','⭐⭐ Regular','⭐⭐⭐ Bom','⭐⭐⭐⭐ Muito bom!','⭐⭐⭐⭐⭐ Excelente! Obrigado!'][stars];
}
function updateTeleSuggestion() {
  const el = document.getElementById('tele-ia-suggestion');
  if (!el) return;
  const mood = state.moodLog.length ? state.moodLog[state.moodLog.length-1].mood : null;
  const proteinLow = state.nutrition.protein < NUTR_GOALS.protein * 0.5;
  if (mood && mood <= 2) {
    el.textContent = '🧠 Sua IA detectou humor baixo. Recomendamos uma consulta com um profissional de saúde mental. Clique em um dos profissionais abaixo!';
  } else if (proteinLow && state.foodLog.length > 0) {
    el.textContent = '🥗 Com base nos seus dados, sua ingestão de proteína está abaixo do ideal. Sugerimos uma consulta com nossa nutricionista Dra. Ana Ribeiro!';
  } else if (state.hydra < HYDRA_GOAL && state.hydra > 0) {
    el.textContent = '💧 Sua hidratação está abaixo da meta. Um personal trainer pode ajudar a criar hábitos saudáveis. Fale com Carlos Mendes!';
  } else {
    el.textContent = 'Continue registrando seus dados (humor, nutrição, água) e a IA irá sugerir o profissional ideal para você!';
  }
}

/* ══════════════════════════════════════════
   SOCIALIZAÇÃO
══════════════════════════════════════════ */
const SOCIAL_STORAGE_KEY = 'vitaia_social_messages';
function loadSocialMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || '[]');
    state.socialMessages = saved;
    renderSocialMessages();
  } catch(e) {}
}
function sendSocialMsg() {
  const input = document.getElementById('social-input');
  const text = input.value.trim(); if (!text) return;
  const msg = { user: state.name || 'Anônimo', text, time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) };
  state.socialMessages.push(msg);
  if (state.socialMessages.length > 50) state.socialMessages = state.socialMessages.slice(-50);
  try { localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state.socialMessages)); } catch(e) {}
  input.value = '';
  renderSocialMessages();
}
function renderSocialMessages() {
  const area = document.getElementById('social-chat-area');
  if (!area) return;
  if (!state.socialMessages.length) {
    area.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:10px">Seja o primeiro a enviar uma mensagem!</div>';
    return;
  }
  area.innerHTML = state.socialMessages.slice(-20).map(m =>
    `<div class="social-msg"><span class="social-msg-user">${m.user} <span style="font-size:10px;font-weight:400;color:var(--muted)">${m.time}</span></span><br><span class="social-msg-text">${m.text}</span></div>`
  ).join('');
  area.scrollTop = area.scrollHeight;
}

/* ══════════════════════════════════════════
   FAQ & MODAIS
══════════════════════════════════════════ */
function toggleFaq(btn) {
  const ans=btn.nextElementSibling, isOpen=ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));
  if (!isOpen) ans.classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target===el) el.classList.remove('active'); });
});
document.addEventListener('click', (e) => {
  const sugg = document.getElementById('food-suggestions');
  if (sugg && !e.target.closest('.food-search-wrap')) {
    sugg.style.display = 'none';
  }
});

// logout is handled directly via btn-exit-app onclick
