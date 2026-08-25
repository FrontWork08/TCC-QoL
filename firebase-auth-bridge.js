/* VitaIA — integração da tela de login com Firebase Authentication */

(() => {
  const waitForFirebase = (timeout = 15000) => new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (
        window.firebaseInit &&
        window.firebaseOnAuthStateChanged &&
        window.firebaseSignInGoogle &&
        window.firebaseSignInEmail
      ) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Firebase não carregou a tempo.'));
      setTimeout(tick, 100);
    };
    tick();
  });

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

      // Primeira utilização desta conta no Firebase: migra o cache local existente.
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

    // Evita duas renderizações quando popup + onAuthStateChanged disparam juntos.
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
      await waitForFirebase();
      await window.firebaseInit();

      // Firebase passa a ser a fonte de verdade da sessão principal.
      window.firebaseOnAuthStateChanged(async (user) => {
        if (user && !user.isAnonymous) {
          await handleAuthenticatedUser(user);
        } else if (!user) {
          localStorage.removeItem('vitaia_current_user');
          showLogin();
        }
        // Usuário anônimo é reservado para a Comunidade e não entra no app principal.
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
          const user = await window.firebaseSignInEmail(email, pass);
          await handleAuthenticatedUser(user);
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

      // Google usa Firebase Authentication; não usa mais o Client ID/OAuth antigo do GSI.
      window.socialLoginOAuth = async function (provider) {
        if (provider !== 'google') {
          window.showToast?.(
            'Login',
            'Facebook ainda não está configurado no Firebase deste projeto.',
            'ℹ️',
            3500
          );
          return;
        }

        try {
          const result = await window.firebaseSignInGoogle();
          if (result?.user) await handleAuthenticatedUser(result.user);
        } catch (e) {
          window.showToast?.('Google', e.message, '⚠️', 4500);
        }
      };

      // Logout salva o estado atual antes de encerrar a sessão Firebase.
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

      // Ao salvar localmente, replica o estado para users/{uid}/state.
      if (typeof window.saveState === 'function' && !window.saveState.__firebaseWrapped) {
        const originalSaveState = window.saveState;
        const wrappedSaveState = function () {
          originalSaveState.apply(this, arguments);
          const user = window.firebaseGetUser?.();
          if (user && !user.isAnonymous) syncStateToFirebase(user);
        };
        wrappedSaveState.__firebaseWrapped = true;
        window.saveState = wrappedSaveState;
      }
    } catch (error) {
      console.error('Firebase Auth Bridge:', error);
      // Mantém a tela local funcionando caso o Firebase esteja indisponível.
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
