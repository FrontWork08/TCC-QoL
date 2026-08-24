/* VitaIA — integração da tela de login com Firebase Authentication */

(() => {
  const waitForFirebase = (timeout = 15000) => new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.firebaseInit && window.firebaseOnAuthStateChanged && window.firebaseSignInGoogle && window.firebaseSignInEmail) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Firebase não carregou a tempo.'));
      setTimeout(tick, 100);
    };
    tick();
  });

  const showLogin = () => {
    const app = document.getElementById('screen-app');
    const login = document.getElementById('screen-login');
    if (app) app.classList.remove('active');
    if (login) login.classList.add('active');
  };

  const enterFirebaseUser = (user) => {
    if (!user) return;
    const name = user.displayName || user.email?.split('@')[0] || 'Usuário';
    const email = user.email || `${user.uid}@firebase.local`;
    localStorage.setItem('vitaia_current_user', JSON.stringify({ name, email, uid: user.uid }));
    if (typeof window.enterApp === 'function') window.enterApp(name, email);
    else {
      const app = document.getElementById('screen-app');
      const login = document.getElementById('screen-login');
      if (app) app.classList.add('active');
      if (login) login.classList.remove('active');
      document.getElementById('username-display')?.replaceChildren(document.createTextNode(name));
    }
  };

  const syncStateToFirebase = async (user) => {
    if (!user || !window._vitaiaDB) return;
    try {
      const raw = localStorage.getItem('vitaia_state_' + (user.email || '').toLowerCase());
      if (!raw) return;
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
      const data = JSON.parse(raw);
      await set(ref(window._vitaiaDB, `users/${user.uid}/state`), data);
    } catch (e) {
      console.warn('Firebase state sync:', e);
    }
  };

  const install = async () => {
    try {
      await waitForFirebase();
      await window.firebaseInit();

      // Firebase passa a ser a fonte de verdade da sessão.
      window.firebaseOnAuthStateChanged(async (user) => {
        if (user) {
          enterFirebaseUser(user);
          await syncStateToFirebase(user);
        } else {
          localStorage.removeItem('vitaia_current_user');
          showLogin();
        }
      });

      // Login por e-mail/senha usando os campos já existentes.
      window.doLogin = async function () {
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-pass');
        const email = emailEl?.value.trim().toLowerCase() || '';
        const pass = passEl?.value || '';
        if (!email || !email.includes('@')) {
          window.setFieldError?.('field-login-email', true, 'E-mail inválido.');
          return;
        }
        if (!pass) {
          window.setFieldError?.('field-login-pass', true, 'Informe sua senha.');
          return;
        }
        try {
          await window.firebaseSignInEmail(email, pass);
        } catch (e) {
          window.setFieldError?.('field-login-pass', true, e.message);
          window.showToast?.('Login', e.message, '⚠️', 4000);
        }
      };

      // Cadastro por e-mail/senha usando os campos já existentes.
      window.doRegister = async function () {
        const name = document.getElementById('reg-name')?.value.trim() || '';
        const email = document.getElementById('reg-email')?.value.trim().toLowerCase() || '';
        const pass = document.getElementById('reg-pass')?.value || '';
        const pass2 = document.getElementById('reg-pass2')?.value || '';
        if (name.length < 2) { window.setFieldError?.('field-reg-name', true, 'Informe seu nome.'); return; }
        if (!email || !email.includes('@')) { window.setFieldError?.('field-reg-email', true, 'E-mail inválido.'); return; }
        if (pass.length < 6) { window.setFieldError?.('field-reg-pass', true, 'Mínimo 6 caracteres.'); return; }
        if (pass !== pass2) { window.setFieldError?.('field-reg-pass2', true, 'As senhas não conferem.'); return; }
        try {
          await window.firebaseCreateEmailAccount(email, pass, name);
        } catch (e) {
          window.showToast?.('Cadastro', e.message, '⚠️', 4000);
        }
      };

      // Google usa Firebase Authentication; não usa mais o Client ID/OAuth antigo do GSI.
      window.socialLoginOAuth = async function (provider) {
        if (provider !== 'google') {
          window.showToast?.('Login', 'Facebook ainda não está configurado no Firebase deste projeto.', 'ℹ️', 3500);
          return;
        }
        try {
          const result = await window.firebaseSignInGoogle();
          if (result?.user) enterFirebaseUser(result.user);
        } catch (e) {
          window.showToast?.('Google', e.message, '⚠️', 4500);
        }
      };

      // Logout encerra também a sessão do Firebase.
      window.doLogout = async function () {
        if (!confirm('Deseja sair da conta?')) return;
        try { window.saveState?.(); } catch (_) {}
        try { await window.firebaseSignOut(); } catch (e) { console.warn(e); }
        localStorage.removeItem('vitaia_current_user');
        showLogin();
        document.getElementById('login-email')?.replaceChildren();
        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-pass');
        if (email) email.value = '';
        if (pass) pass.value = '';
        window.switchTab?.('login');
      };

      // Ao salvar localmente, também replica o estado para users/{uid}/state.
      if (typeof window.saveState === 'function') {
        const originalSaveState = window.saveState;
        window.saveState = function () {
          originalSaveState();
          const user = window.firebaseGetUser?.();
          if (user) syncStateToFirebase(user);
        };
      }
    } catch (error) {
      console.error('Firebase Auth Bridge:', error);
      // Mantém a tela local funcionando caso o Firebase esteja indisponível.
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
