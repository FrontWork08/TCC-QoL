/* VitaIA — integração da tela de login com Firebase Authentication */

(() => {
  const waitForFirebase = (timeout = 15000) => new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (
        window.firebaseInit &&
        window.firebaseOnAuthStateChanged &&
        window.firebaseSignInGoogle &&
        window.firebaseSignInEmail &&
        window.firebaseResetPassword
      ) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Firebase não carregou a tempo.'));
      setTimeout(tick, 100);
    };
    tick();
  });

  const upsertMeta = (selector, attrs) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  };

  const ensureDocumentMetadata = () => {
    const canonicalUrl = 'https://tcc-qo-l.vercel.app/';
    const description = 'VitaIA é uma plataforma acadêmica de qualidade de vida com acompanhamento de hábitos, Firebase e inteligência artificial.';

    document.documentElement.lang = 'pt-BR';
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow' });
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#4f6ef7' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: 'VitaIA — IA de Qualidade de Vida' });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let favicon = document.head.querySelector('link[rel~="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.type = 'image/svg+xml';
    favicon.href = '/favicon.svg';
  };

  const removeUnsupportedSocialButtons = () => {
    document
      .querySelectorAll("button[onclick*=\"socialLoginOAuth('facebook')\"]")
      .forEach(button => button.remove());

    document.querySelectorAll('.social-login-row').forEach(row => {
      const buttons = row.querySelectorAll('.btn-social');
      if (buttons.length === 1) buttons[0].style.flex = '1 1 100%';
    });
  };

  const ensureLegalLinks = () => {
    const card = document.querySelector('#screen-login .login-card');
    if (!card || card.querySelector('[data-vitaia-legal]')) return;

    const legal = document.createElement('div');
    legal.dataset.vitaiaLegal = 'true';
    legal.style.cssText = 'margin-top:18px;text-align:center;font-size:11px;color:var(--muted);line-height:1.5';
    legal.innerHTML = 'Ao usar o VitaIA, você concorda com os <a href="termos.html" style="color:var(--cyan)">Termos de Uso</a> e pode consultar a <a href="privacidade.html" style="color:var(--cyan)">Política de Privacidade</a>.';
    card.appendChild(legal);
  };

  const getUserIdentity = (user) => ({
    name: user.displayName || user.email?.split('@')[0] || 'Usuário',
    email: (user.email || `${user.uid}@firebase.local`).toLowerCase(),
    uid: user.uid
  });

  const showLogin = () => {
    const app = document.getElementById('screen-app');
    const login = document.getElementById('screen-login');
    if (app) app.classList.remove('active');
    if (login) login.classList.add('active');
  };

  const enterFirebaseUser = (user) => {
    if (!user || user.isAnonymous) return;
    const { name, email, uid } = getUserIdentity(user);
    localStorage.setItem('vitaia_current_user', JSON.stringify({ name, email, uid }));

    if (typeof window.enterApp === 'function') {
      window.enterApp(name, email);
    } else {
      const app = document.getElementById('screen-app');
      const login = document.getElementById('screen-login');
      if (app) app.classList.add('active');
      if (login) login.classList.remove('active');
      document.getElementById('username-display')?.replaceChildren(document.createTextNode(name));
    }
  };

  const importDatabaseHelpers = async () => {
    return import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
  };

  const syncStateToFirebase = async (user) => {
    if (!user || user.isAnonymous || !window._vitaiaDB) return false;
    try {
      const { email } = getUserIdentity(user);
      const raw = localStorage.getItem('vitaia_state_' + email);
      if (!raw) return false;

      const { ref, set } = await importDatabaseHelpers();
      const data = JSON.parse(raw);
      await set(ref(window._vitaiaDB, `users/${user.uid}/state`), data);
      return true;
    } catch (e) {
      console.warn('Firebase state upload:', e);
      return false;
    }
  };

  /*
   * Firebase é a fonte persistente de dados entre navegadores/dispositivos.
   * Ao autenticar, buscamos users/{uid}/state ANTES de chamar enterApp().
   * Assim enterApp/loadState encontra o estado remoto no localStorage e
   * renderiza os mesmos dados em uma guia anônima ou outro dispositivo.
   */
  const restoreStateFromFirebase = async (user) => {
    if (!user || user.isAnonymous || !window._vitaiaDB) return { found: false };

    try {
      const { email } = getUserIdentity(user);
      const localKey = 'vitaia_state_' + email;
      const { ref, get, set } = await importDatabaseHelpers();
      const stateRef = ref(window._vitaiaDB, `users/${user.uid}/state`);
      const snapshot = await get(stateRef);

      if (snapshot.exists()) {
        const remoteState = snapshot.val();
        localStorage.setItem(localKey, JSON.stringify(remoteState));
        return { found: true, source: 'firebase', data: remoteState };
      }

      const raw = localStorage.getItem(localKey);
      if (raw) {
        const localState = JSON.parse(raw);
        await set(stateRef, localState);
        return { found: true, source: 'local', data: localState };
      }

      return { found: false };
    } catch (e) {
      console.warn('Firebase state restore:', e);
      return { found: false, error: e };
    }
  };

  let handlingAuthUid = null;

  const handleAuthenticatedUser = async (user) => {
    if (!user || user.isAnonymous) return;
    if (handlingAuthUid === user.uid) return;
    handlingAuthUid = user.uid;

    try {
      await restoreStateFromFirebase(user);
      enterFirebaseUser(user);
    } finally {
      handlingAuthUid = null;
    }
  };

  const install = async () => {
    try {
      ensureDocumentMetadata();
      removeUnsupportedSocialButtons();
      ensureLegalLinks();
      await waitForFirebase();
      await window.firebaseInit();

      window.firebaseOnAuthStateChanged(async (user) => {
        if (user && !user.isAnonymous) {
          await handleAuthenticatedUser(user);
        } else if (!user) {
          localStorage.removeItem('vitaia_current_user');
          showLogin();
        }
      });

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
          const user = await window.firebaseSignInEmail(email, pass);
          await handleAuthenticatedUser(user);
        } catch (e) {
          window.setFieldError?.('field-login-pass', true, e.message);
          window.showToast?.('Login', e.message, '⚠️', 4000);
        }
      };

      window.doRegister = async function () {
        const name = document.getElementById('reg-name')?.value.trim() || '';
        const email = document.getElementById('reg-email')?.value.trim().toLowerCase() || '';
        const pass = document.getElementById('reg-pass')?.value || '';
        const pass2 = document.getElementById('reg-pass2')?.value || '';

        if (name.length < 2) {
          window.setFieldError?.('field-reg-name', true, 'Informe seu nome.');
          return;
        }
        if (!email || !email.includes('@')) {
          window.setFieldError?.('field-reg-email', true, 'E-mail inválido.');
          return;
        }
        if (pass.length < 6) {
          window.setFieldError?.('field-reg-pass', true, 'Mínimo 6 caracteres.');
          return;
        }
        if (pass !== pass2) {
          window.setFieldError?.('field-reg-pass2', true, 'As senhas não conferem.');
          return;
        }

        try {
          const user = await window.firebaseCreateEmailAccount(email, pass, name);
          await handleAuthenticatedUser(user);
        } catch (e) {
          window.showToast?.('Cadastro', e.message, '⚠️', 4000);
        }
      };

      /* O modal já existe em app.js; aqui trocamos a simulação pelo envio real do Firebase. */
      window.sendForgotPassword = async function () {
        const emailEl = document.getElementById('forgot-email');
        const email = emailEl?.value.trim().toLowerCase() || '';

        if (!email || !email.includes('@')) {
          window.showToast?.('Recuperar senha', 'Informe um e-mail válido.', '⚠️', 3500);
          emailEl?.focus();
          return;
        }

        const form = document.getElementById('forgot-form');
        const success = document.getElementById('forgot-success');
        const submit = form?.querySelector('button[onclick="sendForgotPassword()"]');
        const oldText = submit?.textContent;

        if (submit) {
          submit.disabled = true;
          submit.textContent = 'ENVIANDO...';
        }

        try {
          await window.firebaseResetPassword(email);
          if (form) form.style.display = 'none';
          if (success) success.style.display = 'block';
          window.showToast?.('Recuperar senha', 'E-mail de recuperação enviado. Verifique sua caixa de entrada e o spam.', '✅', 5000);
        } catch (e) {
          window.showToast?.('Recuperar senha', e.message || 'Não foi possível enviar o e-mail.', '⚠️', 5000);
        } finally {
          if (submit) {
            submit.disabled = false;
            submit.textContent = oldText || 'ENVIAR LINK';
          }
        }
      };

      window.socialLoginOAuth = async function (provider) {
        if (provider !== 'google') return;

        try {
          const result = await window.firebaseSignInGoogle();
          if (result?.user) await handleAuthenticatedUser(result.user);
        } catch (e) {
          window.showToast?.('Google', e.message, '⚠️', 4500);
        }
      };

      window.doLogout = async function () {
        if (!confirm('Deseja sair da conta?')) return;

        const user = window.firebaseGetUser?.();
        try { window.saveState?.(); } catch (_) {}
        if (user && !user.isAnonymous) await syncStateToFirebase(user);

        try {
          await window.firebaseSignOut();
        } catch (e) {
          console.warn('Firebase logout:', e);
        }

        localStorage.removeItem('vitaia_current_user');
        showLogin();

        const email = document.getElementById('login-email');
        const pass = document.getElementById('login-pass');
        if (email) email.value = '';
        if (pass) pass.value = '';
        window.switchTab?.('login');
      };

      /*
       * app.js ainda possui uma gravação legada por e-mail dentro de saveState().
       * As Rules atuais aceitam apenas users/{uid}, então essa chamada gerava
       * permission_denied no console. Ao executar o save local, ocultamos
       * temporariamente o handle do banco e em seguida sincronizamos pelo UID.
       */
      if (typeof window.saveState === 'function' && !window.saveState.__firebaseWrapped) {
        const originalSaveState = window.saveState;
        const wrappedSaveState = function () {
          const activeDb = window._vitaiaDB;
          try {
            window._vitaiaDB = null;
            originalSaveState.apply(this, arguments);
          } finally {
            window._vitaiaDB = activeDb;
          }

          const user = window.firebaseGetUser?.();
          if (user && !user.isAnonymous) syncStateToFirebase(user);
        };
        wrappedSaveState.__firebaseWrapped = true;
        window.saveState = wrappedSaveState;
      }
    } catch (error) {
      console.error('Firebase Auth Bridge:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();

// Mantém a comunidade desacoplada do fluxo de autenticação e carrega o chat global em tempo real.
import('./community-global.js').catch(error => console.error('Comunidade global:', error));
