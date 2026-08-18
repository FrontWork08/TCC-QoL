/* ═══════════════════════════════════════════
   VitaIA — Módulo de Acessibilidade
═══════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   MÓDULO DE ACESSIBILIDADE COMPLETO — VitaIA
══════════════════════════════════════════════════════════ */

// ── ESTADO DE ACESSIBILIDADE ──
const ACC = {
  tts: false,
  lang: localStorage.getItem('acc_lang') || 'pt',
  colorFilter: localStorage.getItem('acc_color') || 'none',
  fontSize: parseInt(localStorage.getItem('acc_fontsize') || '0'),
  illiteracy: localStorage.getItem('acc_illiteracy') === '1',
  simpleMode: false,
  ttsVoice: null,
};

// ── TRADUÇÕES ──
const TRANSLATIONS = {
  pt: { login:'Entrar', register:'Cadastrar', water:'Beber Água', mood:'Como você está?',
    recovery:'Recuperar Senha', support:'Ajuda & Suporte', profile:'Meu Perfil',
    ai:'Falar com IA', ai_sub:'Tire suas dúvidas', simple_water:'Beber Água',
    simple_mood:'Como você está?', simple_ai:'Falar com IA', simple_ai_sub:'Tire suas dúvidas',
    simple_recovery:'Recuperar Senha', simple_recovery_sub:'Esqueceu? Recupere aqui',
    simple_support:'Ajuda & Suporte', simple_support_sub:'Tire dúvidas conosco',
    simple_profile:'Meu Perfil', simple_profile_sub:'Suas informações',
    enter:'ENTRAR', create:'CRIAR CONTA', send:'ENVIAR', name:'Nome completo',
    email:'E-mail', password:'Senha', forgot:'Esqueci minha senha',
    no_account:'Não tem conta?', create_free:'Criar conta grátis',
    has_account:'Já tem conta?', greeting:'Bom dia,' },
  en: { login:'Sign In', register:'Sign Up', water:'Drink Water', mood:'How are you?',
    recovery:'Recover Password', support:'Help & Support', profile:'My Profile',
    ai:'Talk to AI', ai_sub:'Ask your questions', simple_water:'Drink Water',
    simple_mood:'How are you?', simple_ai:'Talk to AI', simple_ai_sub:'Ask your questions',
    simple_recovery:'Recover Password', simple_recovery_sub:'Forgot? Recover here',
    simple_support:'Help & Support', simple_support_sub:'Get help from us',
    simple_profile:'My Profile', simple_profile_sub:'Your information',
    enter:'SIGN IN', create:'CREATE ACCOUNT', send:'SEND', name:'Full name',
    email:'Email', password:'Password', forgot:'Forgot my password',
    no_account:"Don't have an account?", create_free:'Create free account',
    has_account:'Already have an account?', greeting:'Good morning,' },
  es: { login:'Entrar', register:'Registrarse', water:'Beber Agua', mood:'¿Cómo estás?',
    recovery:'Recuperar Contraseña', support:'Ayuda y Soporte', profile:'Mi Perfil',
    ai:'Hablar con IA', ai_sub:'Resuelve tus dudas', simple_water:'Beber Agua',
    simple_mood:'¿Cómo estás?', simple_ai:'Hablar con IA', simple_ai_sub:'Resuelve tus dudas',
    simple_recovery:'Recuperar Contraseña', simple_recovery_sub:'¿Olvidaste? Recupérala aquí',
    simple_support:'Ayuda y Soporte', simple_support_sub:'Obtén ayuda',
    simple_profile:'Mi Perfil', simple_profile_sub:'Tu información',
    enter:'ENTRAR', create:'CREAR CUENTA', send:'ENVIAR', name:'Nombre completo',
    email:'Correo electrónico', password:'Contraseña', forgot:'Olvidé mi contraseña',
    no_account:'¿No tienes cuenta?', create_free:'Crear cuenta gratis',
    has_account:'¿Ya tienes cuenta?', greeting:'Buenos días,' },
  fr: { login:'Se connecter', register:"S'inscrire", water:"Boire de l'eau", mood:'Comment allez-vous?',
    recovery:'Récupérer le mot de passe', support:'Aide & Support', profile:'Mon Profil',
    ai:"Parler à l'IA", ai_sub:'Posez vos questions', simple_water:"Boire de l'eau",
    simple_mood:'Comment allez-vous?', simple_ai:"Parler à l'IA", simple_ai_sub:'Posez vos questions',
    simple_recovery:'Récupérer le mot de passe', simple_recovery_sub:'Oublié? Récupérez ici',
    simple_support:'Aide & Support', simple_support_sub:'Obtenir de l aide',
    simple_profile:'Mon Profil', simple_profile_sub:'Vos informations',
    enter:'CONNEXION', create:'CRÉER UN COMPTE', send:'ENVOYER', name:'Nom complet',
    email:'E-mail', password:'Mot de passe', forgot:'Mot de passe oublié',
    no_account:'Pas de compte?', create_free:'Créer un compte gratuit',
    has_account:'Déjà un compte?', greeting:'Bonjour,' },
  de: { login:'Anmelden', register:'Registrieren', water:'Wasser trinken', mood:'Wie geht es Ihnen?',
    recovery:'Passwort wiederherstellen', support:'Hilfe & Support', profile:'Mein Profil',
    ai:'Mit KI sprechen', ai_sub:'Stellen Sie Ihre Fragen', simple_water:'Wasser trinken',
    simple_mood:'Wie geht es Ihnen?', simple_ai:'Mit KI sprechen', simple_ai_sub:'Fragen stellen',
    simple_recovery:'Passwort wiederherstellen', simple_recovery_sub:'Vergessen? Hier wiederherstellen',
    simple_support:'Hilfe & Support', simple_support_sub:'Hilfe erhalten',
    simple_profile:'Mein Profil', simple_profile_sub:'Ihre Informationen',
    enter:'ANMELDEN', create:'KONTO ERSTELLEN', send:'SENDEN', name:'Vollständiger Name',
    email:'E-Mail', password:'Passwort', forgot:'Passwort vergessen',
    no_account:'Kein Konto?', create_free:'Kostenloses Konto erstellen',
    has_account:'Bereits ein Konto?', greeting:'Guten Morgen,' },
  it: { login:'Accedi', register:'Registrati', water:"Bevi dell'acqua", mood:'Come stai?',
    recovery:'Recupera Password', support:'Aiuto & Supporto', profile:'Il Mio Profilo',
    ai:"Parla con l'IA", ai_sub:'Fai le tue domande', simple_water:"Bevi dell'acqua",
    simple_mood:'Come stai?', simple_ai:"Parla con l'IA", simple_ai_sub:'Fai domande',
    simple_recovery:'Recupera Password', simple_recovery_sub:'Dimenticata? Recupera qui',
    simple_support:'Aiuto & Supporto', simple_support_sub:'Ottieni aiuto',
    simple_profile:'Il Mio Profilo', simple_profile_sub:'Le tue informazioni',
    enter:'ACCEDI', create:'CREA ACCOUNT', send:'INVIA', name:'Nome completo',
    email:'E-mail', password:'Password', forgot:'Ho dimenticato la password',
    no_account:'Non hai un account?', create_free:'Crea account gratuito',
    has_account:'Hai già un account?', greeting:'Buongiorno,' },
  zh: { login:'登录', register:'注册', water:'喝水', mood:'你好吗?',
    recovery:'恢复密码', support:'帮助与支持', profile:'我的主页',
    ai:'与AI交流', ai_sub:'提出您的问题', simple_water:'喝水',
    simple_mood:'你好吗?', simple_ai:'与AI交流', simple_ai_sub:'提出问题',
    simple_recovery:'恢复密码', simple_recovery_sub:'忘记了？在这里恢复',
    simple_support:'帮助与支持', simple_support_sub:'获得帮助',
    simple_profile:'我的主页', simple_profile_sub:'您的信息',
    enter:'登录', create:'创建账户', send:'发送', name:'全名',
    email:'电子邮件', password:'密码', forgot:'忘记密码',
    no_account:'没有账户?', create_free:'免费创建账户',
    has_account:'已有账户?', greeting:'早上好,' },
  ja: { login:'ログイン', register:'登録', water:'水を飲む', mood:'お気持ちは?',
    recovery:'パスワード回復', support:'ヘルプ&サポート', profile:'マイプロフィール',
    ai:'AIと話す', ai_sub:'ご質問をどうぞ', simple_water:'水を飲む',
    simple_mood:'お気持ちは?', simple_ai:'AIと話す', simple_ai_sub:'質問する',
    simple_recovery:'パスワード回復', simple_recovery_sub:'忘れた？ここで回復',
    simple_support:'ヘルプ&サポート', simple_support_sub:'サポートを受ける',
    simple_profile:'マイプロフィール', simple_profile_sub:'あなたの情報',
    enter:'ログイン', create:'アカウント作成', send:'送信', name:'フルネーム',
    email:'メール', password:'パスワード', forgot:'パスワードを忘れた',
    no_account:'アカウントがない?', create_free:'無料アカウント作成',
    has_account:'既にアカウントがある?', greeting:'おはようございます,' },
  ar: { login:'تسجيل الدخول', register:'التسجيل', water:'اشرب ماء', mood:'كيف حالك؟',
    recovery:'استعادة كلمة المرور', support:'المساعدة والدعم', profile:'ملفي الشخصي',
    ai:'تحدث مع الذكاء الاصطناعي', ai_sub:'اطرح أسئلتك', simple_water:'اشرب ماء',
    simple_mood:'كيف حالك؟', simple_ai:'تحدث مع الذكاء الاصطناعي', simple_ai_sub:'اطرح أسئلتك',
    simple_recovery:'استعادة كلمة المرور', simple_recovery_sub:'نسيتها؟ استعدها هنا',
    simple_support:'المساعدة والدعم', simple_support_sub:'احصل على المساعدة',
    simple_profile:'ملفي الشخصي', simple_profile_sub:'معلوماتك',
    enter:'دخول', create:'إنشاء حساب', send:'إرسال', name:'الاسم الكامل',
    email:'البريد الإلكتروني', password:'كلمة المرور', forgot:'نسيت كلمة المرور',
    no_account:'ليس لديك حساب؟', create_free:'إنشاء حساب مجاني',
    has_account:'لديك حساب؟', greeting:'صباح الخير,' },
};

function t(key) {
  const lang = ACC.lang;
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['pt'][key]) || key;
}

// ── BOLINHA FLUTUANTE DE ACESSIBILIDADE ──
function toggleAccessBar(forceState) {
  const bar = document.getElementById('access-bar');
  const fab = document.getElementById('access-fab');
  const icon = document.getElementById('access-fab-icon');
  const isOpen = typeof forceState === 'boolean' ? forceState : !bar.classList.contains('open');
  bar.classList.toggle('open', isOpen);
  fab.classList.toggle('open', isOpen);
  fab.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  icon.textContent = isOpen ? '✕' : '☰';
  if (!isOpen) {
    // Fecha também os submenus internos ao recolher a bolinha
    const lm = document.getElementById('lang-menu'); if (lm) lm.style.display = 'none';
    const cm = document.getElementById('color-menu'); if (cm) cm.style.display = 'none';
  }
}
// Fecha a bolinha ao clicar fora dela
document.addEventListener('click', function(e) {
  const bar = document.getElementById('access-bar');
  if (!bar || !bar.classList.contains('open')) return;
  if (!e.target.closest('#access-bar') && !e.target.closest('#access-fab')) toggleAccessBar(false);
});

// ── INICIALIZAÇÃO ──
document.addEventListener('DOMContentLoaded', function() {
  applyColorFilter(ACC.colorFilter);
  applyFontSize(ACC.fontSize);
  if (ACC.illiteracy) applyIlliteracyMode(true);
  applyLang(ACC.lang);
  // Init TTS auto-on via setting or if first time (optional: check localStorage)
  if (localStorage.getItem('acc_tts') === '1') {
    ACC.tts = false;
    toggleTTS();
  }
  // Update simple mode hydra display
  updateSimpleHydra();
  // Label lang button
  document.getElementById('lang-label').textContent = ACC.lang.toUpperCase();
});

// ── TEXT TO SPEECH ──
function toggleTTS() {
  ACC.tts = !ACC.tts;
  const btn = document.getElementById('btn-tts');
  localStorage.setItem('acc_tts', ACC.tts ? '1' : '0');
  if (ACC.tts) {
    btn.classList.add('acc-active');
    btn.setAttribute('aria-pressed', 'true');
    speakText('Leitura de tela ativada. Clique em qualquer texto para ouvir.');
    enableTTSClicks();
  } else {
    btn.classList.remove('acc-active');
    btn.setAttribute('aria-pressed', 'false');
    window.speechSynthesis && window.speechSynthesis.cancel();
    disableTTSClicks();
    showToast('TTS', 'Leitura de tela desativada.', '🔇', 2000);
  }
}

// Elementos interativos nunca recebem highlight visual no TTS
const TTS_NO_HIGHLIGHT = ['BUTTON','A','INPUT','SELECT','TEXTAREA','LABEL'];

function speakText(text, highlight) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = String(text).replace(/<[^>]*>/g, '').trim();
  if (!clean) return;
  const utt = new SpeechSynthesisUtterance(clean);
  const langMap = { pt:'pt-BR', en:'en-US', es:'es-ES', fr:'fr-FR', de:'de-DE', it:'it-IT', zh:'zh-CN', ja:'ja-JP', ar:'ar-SA' };
  utt.lang = langMap[ACC.lang] || 'pt-BR';
  utt.rate = 0.95;
  utt.pitch = 1;
  // Carrega voz correta (async na primeira vez)
  const trySetVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]));
    if (match) utt.voice = match;
  };
  trySetVoice();
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', trySetVoice, { once: true });
  }
  // ARIA live region
  const live = document.getElementById('tts-live');
  if (live) live.textContent = clean;

  // Highlight SOMENTE em elementos de texto estático (não interativos)
  const canHighlight = highlight
    && !TTS_NO_HIGHLIGHT.includes(highlight.tagName)
    && !highlight.closest('button, a, input, select, textarea');

  let safetyTimer;
  if (canHighlight) {
    highlight.classList.add('tts-reading');
    const removeHL = () => {
      highlight.classList.remove('tts-reading');
      if (live) live.textContent = '';
      clearTimeout(safetyTimer);
    };
    utt.onend = removeHL;
    utt.onerror = removeHL;
    // Garante remoção após no máximo 10s mesmo se onend não disparar
    safetyTimer = setTimeout(removeHL, 10000);
  } else {
    utt.onend = () => { if (live) live.textContent = ''; };
  }

  window.speechSynthesis.speak(utt);
}

function enableTTSClicks() {
  document.body.addEventListener('click', ttsClickHandler, true);
  document.body.addEventListener('mouseover', ttsHoverHandler, false);
}

function disableTTSClicks() {
  document.body.removeEventListener('click', ttsClickHandler, true);
  document.body.removeEventListener('mouseover', ttsHoverHandler, false);
}

function ttsClickHandler(e) {
  if (!ACC.tts) return;
  // Não cancela o evento — apenas lê o texto em paralelo
  const el = e.target.closest('button, a, label, [role="button"], [tabindex]') || e.target;
  const text = (
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.innerText ||
    el.textContent ||
    ''
  ).trim();
  // Passa undefined como highlight — nunca aplica classe em botões
  if (text && text.length > 0 && text.length < 500) {
    speakText(text); // sem highlight em interativos
  }
}

let ttsHoverTimeout;
function ttsHoverHandler(e) {
  if (!ACC.tts) return;
  clearTimeout(ttsHoverTimeout);
  ttsHoverTimeout = setTimeout(() => {
    const el = e.target;
    const tag = el.tagName || '';
    // Lê e destaca SOMENTE elementos de texto estático
    if (['P','H1','H2','H3','H4','SPAN','DIV','LABEL','LI','TD','TH'].includes(tag)
        && !el.closest('button, a, input, select, textarea')) {
      const text = (el.getAttribute('aria-label') || el.innerText || '').trim();
      if (text && text.length > 2 && text.length < 300) speakText(text, el);
    }
  }, 700);
}

// ── SELETOR DE IDIOMA ──
function toggleLangMenu() {
  const m = document.getElementById('lang-menu');
  const cm = document.getElementById('color-menu');
  cm.style.display = 'none';
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function openColorMenu() {
  const m = document.getElementById('color-menu');
  const lm = document.getElementById('lang-menu');
  lm.style.display = 'none';
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('#lang-selector-wrap')) document.getElementById('lang-menu').style.display = 'none';
  if (!e.target.closest('#btn-daltonismo') && !e.target.closest('#color-menu')) document.getElementById('color-menu').style.display = 'none';
});

function setLang(lang) {
  ACC.lang = lang;
  localStorage.setItem('acc_lang', lang);
  document.getElementById('lang-menu').style.display = 'none';
  document.getElementById('lang-label').textContent = lang.toUpperCase();
  applyLang(lang);
  // Set RTL for Arabic
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (ACC.tts) speakText('Idioma alterado para ' + lang);
  showToast('🌐 Idioma', 'Idioma alterado!', '🌐', 2000);
}

function applyLang(lang) {
  // Apply translations to data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  // Update tab buttons
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');
  if (tabLogin) tabLogin.textContent = t('login');
  if (tabReg) tabReg.textContent = t('register');
  // Update login footer text
  const footer = document.querySelector('.login-footer');
  if (footer) {
    const isLoginActive = document.getElementById('form-login')?.style.display !== 'none';
    footer.innerHTML = isLoginActive
      ? `${t('no_account')} <a onclick="switchTab('register')">${t('create_free')}</a>`
      : `${t('has_account')} <a onclick="switchTab('login')">${t('login')}</a>`;
  }
}

// ── FILTROS DE COR (DALTONISMO) ──
function setColorFilter(filter) {
  const filters = ['none','protanopia','deuteranopia','tritanopia','achromatopsia','high-contrast'];
  // Remove all filter classes
  filters.forEach(f => { if (f !== 'none') document.body.classList.remove('filter-' + f); });
  // Remove high contrast
  document.body.classList.remove('filter-high-contrast');
  if (filter !== 'none') document.body.classList.add('filter-' + filter);
  ACC.colorFilter = filter;
  localStorage.setItem('acc_color', filter);
  // Update active button
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById('cbtn-' + filter);
  if (activeBtn) activeBtn.classList.add('active');
  document.getElementById('color-menu').style.display = 'none';
  if (ACC.tts) {
    const names = { none:'Sem filtro', protanopia:'Protanopia', deuteranopia:'Deuteranopia', tritanopia:'Tritanopia', achromatopsia:'Acromatopsia', 'high-contrast':'Alto contraste' };
    speakText('Filtro de cor: ' + (names[filter] || filter));
  }
}

function applyColorFilter(filter) {
  if (filter && filter !== 'none') {
    document.body.classList.add('filter-' + filter);
    const activeBtn = document.getElementById('cbtn-' + filter);
    if (activeBtn) activeBtn.classList.add('active');
  }
}

// ── TAMANHO DE FONTE ──
function changeFontSize(delta) {
  ACC.fontSize = Math.max(-3, Math.min(6, ACC.fontSize + delta));
  localStorage.setItem('acc_fontsize', ACC.fontSize);
  applyFontSize(ACC.fontSize);
}

function applyFontSize(delta) {
  const base = 16 + delta * 2;
  document.documentElement.style.fontSize = base + 'px';
}

// ── MODO ÍCONES (ANALFABETOS) ──
function toggleIlliteracyMode() {
  ACC.illiteracy = !ACC.illiteracy;
  localStorage.setItem('acc_illiteracy', ACC.illiteracy ? '1' : '0');
  applyIlliteracyMode(ACC.illiteracy);
  const btn = document.getElementById('btn-analfabeto');
  if (ACC.illiteracy) {
    btn.classList.add('acc-active');
    btn.setAttribute('aria-pressed', 'true');
    showToast('🖼️ Modo Ícones', 'Modo visual ativado! Ícones grandes para fácil navegação.', '🖼️', 3000);
    if (ACC.tts) speakText('Modo ícones ativado. Use os grandes botões coloridos para navegar.');
  } else {
    btn.classList.remove('acc-active');
    btn.setAttribute('aria-pressed', 'false');
    showToast('🖼️ Modo Ícones', 'Modo visual desativado.', '📝', 2000);
  }
}

function applyIlliteracyMode(on) {
  if (on) {
    document.body.classList.add('illiteracy-mode');
    // Add icon hints to buttons
    const iconMap = {
      'doLogin': '🔓', 'doRegister': '✅', 'openForgotPassword': '🔑',
      'addHydra': '💧', 'openAjuda': '🤖', 'openProfileModal': '👤'
    };
    document.querySelectorAll('button[onclick]').forEach(btn => {
      const fn = btn.getAttribute('onclick') || '';
      for (const [key, icon] of Object.entries(iconMap)) {
        if (fn.includes(key) && !btn.querySelector('.ill-icon')) {
          const span = document.createElement('span');
          span.className = 'ill-icon';
          span.textContent = ' ' + icon;
          span.style.fontSize = '18px';
          btn.appendChild(span);
        }
      }
    });
    // Make nav icons bigger
    document.querySelectorAll('.nav-icon').forEach(el => { el.style.fontSize = '28px'; });
  } else {
    document.body.classList.remove('illiteracy-mode');
    document.querySelectorAll('.ill-icon').forEach(el => el.remove());
    document.querySelectorAll('.nav-icon').forEach(el => { el.style.fontSize = ''; });
  }
}

// ── MODO SIMPLES ──
function isUserLoggedIn() {
  if (typeof state !== 'undefined' && state.name && state.name.length > 0) return true;
  try {
    const saved = JSON.parse(localStorage.getItem('vitaia_current_user') || 'null');
    if (saved && saved.name) return true;
  } catch(e) {}
  return false;
}

function toggleSimpleMode() {
  const btn = document.getElementById('btn-simple');
  const screen = document.getElementById('simple-mode-screen');

  if (ACC.simpleMode) {
    ACC.simpleMode = false;
    screen.style.display = 'none';
    btn.classList.remove('acc-active');
    btn.setAttribute('aria-pressed', 'false');
    return;
  }

  if (!isUserLoggedIn()) {
    showSimpleLoginGate();
    if (ACC.tts) speakText('Para usar o Modo Simples, faça login primeiro.');
    return;
  }

  ACC.simpleMode = true;
  screen.style.display = 'block';
  btn.classList.add('acc-active');
  btn.setAttribute('aria-pressed', 'true');
  refreshSimpleMode();
  if (ACC.tts) speakText('Modo simples ativado. Mostrando apenas as funções essenciais.');
}

// ── Atualiza TODOS os widgets do modo simples ──
function refreshSimpleMode() {
  updateSimpleHydra();
  updateSimpleNutrition();
  updateSimpleSleep();
  updateSimpleExercises();
  updateSimpleMood();
  updateSimpleSummary();
  // Saudação personalizada
  const sub = document.getElementById('simple-greeting-sub');
  if (sub && typeof state !== 'undefined' && state.name) {
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    sub.textContent = greeting + ', ' + state.name.split(' ')[0] + '! 👋';
  }
}

// ── Hidratação ──
function updateSimpleHydra() {
  if (typeof state === 'undefined') return;
  const water = state.hydra || 0;
  const goal  = state.hydraGoal || 2;
  const el = document.getElementById('simple-hydra-display');
  if (el) el.textContent = water.toFixed(1) + ' L de ' + goal + ' L hoje';
  const bar = document.getElementById('simple-hydra-bar');
  if (bar) bar.style.width = Math.min(100, (water / goal) * 100) + '%';
  updateSimpleSummary();
}

function simpleAddWater(amount) {
  if (typeof addHydra === 'function') addHydra(amount);
  else {
    if (typeof state !== 'undefined') {
      state.hydra = (state.hydra || 0) + amount;
      if (typeof saveState === 'function') saveState();
    }
  }
  updateSimpleHydra();
}

// ── Humor ──
function updateSimpleMood() {
  if (typeof state === 'undefined') return;
  const last = state.moodLog && state.moodLog.length ? state.moodLog[state.moodLog.length - 1] : null;
  const moods = ['','😢','😕','😐','🙂','😄'];
  const labels = ['','Mal','Instável','Neutro','Bem','Ótimo'];
  const status = document.getElementById('simple-mood-status');
  if (last && status) status.textContent = 'Último: ' + (moods[last.mood] || '') + ' ' + (labels[last.mood] || '');
  // Highlight o botão atual
  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById('smood-' + i);
    if (!btn) continue;
    if (last && last.mood === i) {
      btn.style.background = 'var(--cyan)';
      btn.style.borderColor = 'var(--cyan)';
      btn.querySelector('span').style.color = '#fff';
    } else {
      btn.style.background = 'var(--surface2)';
      btn.style.borderColor = 'var(--border)';
      btn.querySelector('span').style.color = 'var(--muted)';
    }
  }
  updateSimpleSummary();
}

function simpleSelectMood(val) {
  // Chama o selectMood original do app com um mock de elemento
  if (typeof selectMood === 'function') {
    selectMood({ dataset: { mood: String(val) } });
  } else if (typeof state !== 'undefined') {
    state.moodLog.push({ mood: val, ts: Date.now() });
    if (typeof saveState === 'function') saveState();
  }
  updateSimpleMood();
  const labels = ['','Mal','Instável','Neutro','Bem','Ótimo'];
  if (typeof showToast === 'function') showToast('😊 Humor', 'Registrado: ' + labels[val], '✅', 2000);
}

// ── Sono ──
function updateSimpleSleep() {
  if (typeof state === 'undefined') return;
  const log = state.sleepLog || [];
  const status = document.getElementById('simple-sleep-status');
  if (!status) return;
  if (!log.length) { status.textContent = 'Quantas horas você dormiu?'; return; }
  const last = log[log.length - 1];
  const score = last.hours >= 8 ? '🌟 Ótimo!' : last.hours >= 6 ? '👍 Bom' : '⚠️ Pouco';
  status.textContent = 'Ontem: ' + last.hours + 'h — ' + score;
  updateSimpleSummary();
}

function simpleLogSleep(hours) {
  if (typeof saveSleep === 'function') {
    const inp = document.getElementById('sleep-hours');
    if (inp) { inp.value = hours; saveSleep(); }
  } else if (typeof state !== 'undefined') {
    state.sleepLog.push({ hours, ts: Date.now() });
    if (typeof saveState === 'function') saveState();
  }
  updateSimpleSleep();
  const score = hours >= 8 ? '🌟 Ótimo sono!' : hours >= 6 ? '👍 Sono razoável' : '⚠️ Sono curto';
  if (typeof showToast === 'function') showToast('😴 Sono', hours + 'h registradas — ' + score, '✅', 2500);
}

// ── Exercícios ──
function updateSimpleExercises() {
  if (typeof state === 'undefined') return;
  const exs = state.exercises || [];
  const status = document.getElementById('simple-exercise-status');
  if (status) status.textContent = exs.length ? exs.join(', ') : 'Nenhum registrado hoje';
  // Highlight botões ativos
  const ids = { 'caminhada':'sex-caminhada', 'corrida':'sex-corrida', 'musculacao':'sex-musculacao', 'yoga':'sex-yoga', 'natacao':'sex-natacao', 'ciclismo':'sex-ciclismo' };
  Object.entries(ids).forEach(([key, id]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const active = exs.some(e => e.toLowerCase().includes(key));
    btn.style.background = active ? 'var(--teal)' : 'var(--surface2)';
    btn.style.borderColor = active ? 'var(--teal)' : 'var(--border)';
    btn.style.color = active ? '#fff' : 'var(--text)';
  });
}

function simpleToggleExercise(key, label) {
  if (typeof toggleExercise === 'function') {
    toggleExercise(key, label);
  } else if (typeof state !== 'undefined') {
    const i = state.exercises.indexOf(label);
    if (i >= 0) state.exercises.splice(i, 1);
    else state.exercises.push(label);
    if (typeof saveState === 'function') saveState();
  }
  updateSimpleExercises();
}

// ── Nutrição ──
function updateSimpleNutrition() {
  if (typeof state === 'undefined') return;
  const n = state.nutrition || { protein: 0, carb: 0, fat: 0 };
  const pEl = document.getElementById('simple-protein-val');
  const cEl = document.getElementById('simple-carb-val');
  const fEl = document.getElementById('simple-fat-val');
  if (pEl) pEl.textContent = Math.round(n.protein || 0) + 'g';
  if (cEl) cEl.textContent = Math.round(n.carb || 0) + 'g';
  if (fEl) fEl.textContent = Math.round(n.fat || 0) + 'g';
  updateSimpleSummary();
}

function simpleAddFood(name, protein, carb, fat) {
  if (typeof state !== 'undefined') {
    state.nutrition.protein = (state.nutrition.protein || 0) + protein;
    state.nutrition.carb    = (state.nutrition.carb || 0) + carb;
    state.nutrition.fat     = (state.nutrition.fat || 0) + fat;
    state.foodLog = state.foodLog || [];
    state.foodLog.push({ nome: name, protein, carb, fat, ts: Date.now() });
    if (typeof saveState === 'function') saveState();
    if (typeof updateNutritionDisplay === 'function') updateNutritionDisplay();
  }
  updateSimpleNutrition();
  if (typeof showToast === 'function') showToast('🥗 ' + name, `+${protein}g prot · +${carb}g carb · +${fat}g gord`, '✅', 2500);
}

// ── IA Rápida ──
function simpleAskAI(question) {
  const box = document.getElementById('simple-ai-response');
  if (!box) return;
  box.style.display = 'block';
  box.innerHTML = '<span style="color:var(--muted)">🤖 Pensando…</span>';
  // Usa a função de chat do app se disponível
  if (typeof askGroq === 'function') {
    askGroq(question).then(resp => {
      box.innerHTML = '🤖 ' + (resp || 'Sem resposta.');
    }).catch(() => {
      box.innerHTML = '🤖 Não foi possível conectar. Tente o chat completo.';
    });
  } else {
    // Fallback: abre o chat completo com a pergunta pré-digitada
    setTimeout(() => {
      box.innerHTML = '🤖 Abrindo o chat completo com sua pergunta…';
      setTimeout(() => simpleOpenFullChat(question), 1000);
    }, 400);
  }
  if (ACC.tts) speakText('Perguntando: ' + question);
}

function simpleOpenFullChat(question) {
  toggleSimpleMode(); // fecha o modo simples
  if (typeof openAjuda === 'function') openAjuda();
  if (question) {
    setTimeout(() => {
      const inp = document.getElementById('chat-input') || document.getElementById('ajuda-input');
      if (inp) { inp.value = question; inp.focus(); }
    }, 400);
  }
}

// ── Navegação ──
function simpleGoTo(page) {
  toggleSimpleMode();
  setTimeout(() => goToNav(page), 150);
}

// ── Resumo do topo ──
function updateSimpleSummary() {
  if (typeof state === 'undefined') return;
  // Água
  const wEl = document.getElementById('simple-summary-water');
  if (wEl) wEl.textContent = (state.hydra || 0).toFixed(1) + ' L';
  // Proteína
  const pEl = document.getElementById('simple-summary-protein');
  if (pEl) pEl.textContent = Math.round((state.nutrition && state.nutrition.protein) || 0) + 'g';
  // Sono
  const sEl = document.getElementById('simple-summary-sleep');
  if (sEl) {
    const log = state.sleepLog || [];
    sEl.textContent = log.length ? log[log.length - 1].hours + 'h' : '—';
  }
  // Humor
  const mEl = document.getElementById('simple-summary-mood');
  const moods = ['','😢','😕','😐','🙂','😄'];
  if (mEl) {
    const log = state.moodLog || [];
    mEl.textContent = log.length ? moods[log[log.length - 1].mood] || '—' : '—';
  }
}

function showSimpleLoginGate() {
  // Cria ou reutiliza o modal de bloqueio
  let gate = document.getElementById('simple-login-gate');
  if (!gate) {
    gate = document.createElement('div');
    gate.id = 'simple-login-gate';
    gate.style.cssText = `
      position:fixed;inset:0;z-index:9500;
      background:rgba(0,0,0,0.6);
      backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;
      padding:20px;
    `;
    gate.innerHTML = `
      <div style="
        background:var(--surface);border-radius:24px;
        padding:32px 24px;max-width:360px;width:100%;
        text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.35);
        animation:slideUp .3s ease;
      ">
        <div style="font-size:56px;margin-bottom:12px">⚡🔒</div>
        <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--text);margin-bottom:8px">
          Modo Simples
        </div>
        <div style="font-size:14px;color:var(--muted);line-height:1.6;margin-bottom:24px">
          Para usar o <strong>Modo Simples</strong> você precisa estar logado.<br>
          Faça login ou crie sua conta gratuita para continuar.
        </div>
        <button onclick="closeSimpleLoginGate();goToLogin();"
          style="width:100%;padding:14px;background:linear-gradient(135deg,#00b87a,#0ea5e9);
          border:none;border-radius:14px;color:#fff;font-family:'Syne',sans-serif;
          font-size:15px;font-weight:800;cursor:pointer;margin-bottom:10px;
          box-shadow:0 6px 20px rgba(14,165,233,.3);">
          🔑 Fazer Login
        </button>
        <button onclick="closeSimpleLoginGate();goToRegister();"
          style="width:100%;padding:13px;background:var(--surface2);
          border:1.5px solid var(--border);border-radius:14px;color:var(--text);
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px;">
          ✨ Criar Conta Grátis
        </button>
        <button onclick="closeSimpleLoginGate();"
          style="width:100%;padding:10px;background:none;border:none;
          color:var(--muted);font-size:13px;cursor:pointer;">
          Fechar
        </button>
      </div>
    `;
    document.body.appendChild(gate);
    // Fecha ao clicar fora do card
    gate.addEventListener('click', function(e) {
      if (e.target === gate) closeSimpleLoginGate();
    });
  } else {
    gate.style.display = 'flex';
  }
}

function closeSimpleLoginGate() {
  const gate = document.getElementById('simple-login-gate');
  if (gate) gate.style.display = 'none';
}

function goToLogin() {
  // Garante que a tela de login está visível e aba "Entrar" ativa
  const loginScreen = document.getElementById('screen-login');
  const appScreen = document.getElementById('screen-app');
  if (loginScreen && !loginScreen.classList.contains('active')) {
    if (appScreen) appScreen.classList.remove('active');
    loginScreen.classList.add('active');
  }
  if (typeof switchTab === 'function') switchTab('login');
  document.getElementById('login-email')?.focus();
}

function goToRegister() {
  const loginScreen = document.getElementById('screen-login');
  const appScreen = document.getElementById('screen-app');
  if (loginScreen && !loginScreen.classList.contains('active')) {
    if (appScreen) appScreen.classList.remove('active');
    loginScreen.classList.add('active');
  }
  if (typeof switchTab === 'function') switchTab('register');
  document.getElementById('reg-name')?.focus();
}

// Override addHydra to also update simple mode display
if (typeof addHydra === 'function') {
  const _origAddHydra2 = addHydra;
  window.addHydra = function(v) { _origAddHydra2(v); if (ACC.simpleMode) updateSimpleHydra(); };
}

// ── RECUPERAÇÃO DE CONTA ──
function showRecoveryMethod(method) {
  ['email','sms','security','support'].forEach(m => {
    document.getElementById('recovery-' + m + '-form').style.display = 'none';
  });
  // Hide/show top options
  const opts = document.querySelector('.recovery-options');
  const backBtn = document.getElementById('recovery-back-btn');
  if (method === 'none' || !method) {
    if (opts) opts.style.display = 'flex';
    return;
  }
  if (opts) opts.style.display = 'none';
  const form = document.getElementById('recovery-' + method + '-form');
  if (form) form.style.display = 'block';
  if (ACC.tts) {
    const labels = { email:'Recuperação por e-mail selecionada.', sms:'Recuperação por SMS selecionada.', security:'Perguntas de segurança selecionadas.', support:'Suporte humano selecionado.' };
    speakText(labels[method] || '');
  }
}

function sendSMSRecovery() {
  const phone = document.getElementById('forgot-phone')?.value.trim();
  if (!phone) { if (ACC.tts) speakText('Por favor informe o número de celular.'); return; }
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('forgot-success').style.display = 'block';
  document.getElementById('forgot-success').querySelector('.recover-success-icon').textContent = '📱';
  document.getElementById('forgot-success').querySelector('[style]').textContent = 'Código enviado por SMS!';
  if (ACC.tts) speakText('Código enviado para o seu celular.');
}

function sendSecurityRecovery() {
  const a1 = document.getElementById('forgot-sec1')?.value.trim();
  const a2 = document.getElementById('forgot-sec2')?.value.trim();
  if (!a1 || !a2) { if (ACC.tts) speakText('Por favor responda todas as perguntas de segurança.'); return; }
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('forgot-success').style.display = 'block';
  document.getElementById('forgot-success').querySelector('.recover-success-icon').textContent = '✅';
  if (ACC.tts) speakText('Identidade verificada. Você pode redefinir sua senha.');
}

function openSupportChat() {
  closeModal('modal-forgot');
  openAjuda && openAjuda();
  if (ACC.tts) speakText('Abrindo chat de suporte.');
}

// ── NAVIGATION HELPER ──
function goToNav(page) {
  const pages = { suporte: 6, home: 0, progresso: 1, planos: 2, labs: 3, tele: 4, comunidade: 5 };
  const navItems = document.querySelectorAll('.nav-item');
  if (navItems[pages[page] || 0]) navItems[pages[page] || 0].click();
  if (typeof toggleSimpleMode === 'function' && ACC.simpleMode) toggleSimpleMode();
}

// ── ANÚNCIOS TTS AUTOMÁTICOS ──
// Anuncia mudanças de página para TTS
const _navItems = document.querySelectorAll('.nav-item');
_navItems.forEach(item => {
  item.addEventListener('click', function() {
    if (ACC.tts) {
      const label = this.querySelector('.nav-label')?.textContent || this.getAttribute('aria-label') || '';
      if (label) setTimeout(() => speakText('Página: ' + label), 300);
    }
  });
});

// Anuncia modais abertos
const _origOpenModal = window.openModal;
if (typeof openModal === 'function') {
  window.openModal = function(id) {
    openModal(id);
    if (ACC.tts) {
      const modal = document.getElementById(id);
      if (modal) {
        const title = modal.querySelector('.modal-title')?.textContent || '';
        if (title) setTimeout(() => speakText('Modal aberto: ' + title), 200);
      }
    }
  };
}

// ── ACESSIBILIDADE ARIA ──
// Adiciona role e aria-label a elementos sem eles
document.querySelectorAll('.mood-btn').forEach((btn, i) => {
  const labels = ['Mal', 'Instável', 'Neutro', 'Bem', 'Ótimo'];
  btn.setAttribute('aria-label', 'Humor: ' + (labels[i] || ''));
  btn.setAttribute('role', 'radio');
});
document.querySelectorAll('.nav-item').forEach(item => {
  if (!item.getAttribute('aria-label')) {
    item.setAttribute('aria-label', item.querySelector('.nav-label')?.textContent || 'Navegar');
  }
  item.setAttribute('role', 'tab');
});

// Skip to main content link (screen readers)
const skipLink = document.createElement('a');
skipLink.href = '#page-home';
skipLink.textContent = 'Ir para o conteúdo principal';
skipLink.style.cssText = 'position:absolute;top:-40px;left:0;background:var(--cyan);color:#fff;padding:8px;z-index:99999;border-radius:0 0 8px 0;font-weight:700;transition:top .2s';
skipLink.addEventListener('focus', () => { skipLink.style.top = '46px'; });
skipLink.addEventListener('blur', () => { skipLink.style.top = '-40px'; });
document.body.insertBefore(skipLink, document.body.firstChild);

// ── FOCUS TRAP IN MODALS ──
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const closeBtn = this.querySelector('.modal-close');
      if (closeBtn) closeBtn.click();
    }
    if (e.key === 'Tab') {
      const focusable = this.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
});

console.log('♿ Módulo de Acessibilidade VitaIA carregado com sucesso!');
