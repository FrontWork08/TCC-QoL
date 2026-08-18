/* ═══════════════════════════════════════════
   VitaIA — Módulo de Animações de UI
   Transição de páginas/abas, microinterações e
   scroll-reveal para cards. Não modifica app.js:
   envolve (wrap) as funções globais goTo() e
   switchTab() já existentes, então continua
   funcionando mesmo se a lógica delas mudar.
═══════════════════════════════════════════ */

(function () {
  const REVEAL_SELECTOR = [
    '.card', '.mood-card', '.nutrition-card', '.exercise-card', '.stat-box',
    '.lab-item', '.lab-inner-card', '.tele-type-card', '.tele-prof-item',
    '.tele-sched-item', '.insight-card', '.clock-card', '.protein-insight-card',
    '.hydra-card', '.social-card', '.contact-card'
  ].join(', ');

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let revealObserver = null;
  function setupRevealObserver() {
    if (revealObserver || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  }

  // Prepara os cards de uma página para o efeito de scroll-reveal.
  // Cards já revelados antes não são reprocessados.
  function primeRevealFor(pageEl) {
    if (!pageEl) return;
    if (prefersReducedMotion) return; // já tratado globalmente no CSS, mas evita custo extra
    setupRevealObserver();
    const items = pageEl.querySelectorAll(REVEAL_SELECTOR);
    items.forEach((el, i) => {
      if (el.dataset.revealReady) return;
      el.dataset.revealReady = '1';
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = (Math.min(i, 8) * 40) + 'ms';
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible'); // fallback sem IntersectionObserver
    });
  }

  function animatePageEntrance(pageEl) {
    if (!pageEl) return;
    pageEl.classList.remove('page-anim-enter');
    void pageEl.offsetWidth; // força reflow para poder reiniciar a animação
    pageEl.classList.add('page-anim-enter');
    primeRevealFor(pageEl);
  }

  // ── Indicador deslizante da barra inferior ──
  // Move um "pontinho" compartilhado até o item ativo, com transição suave,
  // em vez de o indicador simplesmente aparecer/desaparecer em cada item.
  let moveNavIndicator = null;
  function setupNavSlideIndicator() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav || prefersReducedMotion) return;

    let dot = document.getElementById('nav-slide-dot');
    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'nav-slide-dot';
      dot.className = 'nav-slide-dot';
      nav.appendChild(dot);
    }
    nav.classList.add('js-nav-indicator');

    function moveTo(item) {
      if (!item || item.classList.contains('nav-item-center') || item.classList.contains('nav-item-avatar')) {
        dot.style.opacity = '0';
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const center = (itemRect.left + itemRect.width / 2) - navRect.left;
      dot.style.opacity = '1';
      dot.style.transform = 'translateX(' + center + 'px) translateX(-50%)';
    }

    moveNavIndicator = moveTo;
    requestAnimationFrame(() => moveTo(nav.querySelector('.nav-item.active')));
    window.addEventListener('resize', () => moveTo(nav.querySelector('.nav-item.active')));
  }

  // Envolve window.goTo (definida em app.js) para animar a página
  // que passa a ficar visível, sem duplicar a lógica de navegação.
  function wrapGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__animWrapped) return;
    const original = window.goTo;
    function wrapped(page, el) {
      original(page, el);
      animatePageEntrance(document.getElementById('page-' + page));
      if (moveNavIndicator) moveNavIndicator(el || document.querySelector('.nav-item.active'));
    }
    wrapped.__animWrapped = true;
    window.goTo = wrapped;
  }

  // Envolve window.switchTab (login/cadastro) para dar um fade suave
  // ao conteúdo do formulário exibido.
  function wrapSwitchTab() {
    if (typeof window.switchTab !== 'function' || window.switchTab.__animWrapped) return;
    const original = window.switchTab;
    function wrapped(tab) {
      original(tab);
      const shown = document.getElementById(tab === 'login' ? 'form-login' : 'form-register');
      if (shown && !prefersReducedMotion) {
        shown.classList.remove('auth-form-anim-enter');
        void shown.offsetWidth;
        shown.classList.add('auth-form-anim-enter');
      }
    }
    wrapped.__animWrapped = true;
    window.switchTab = wrapped;
  }

  document.addEventListener('DOMContentLoaded', () => {
    wrapGoTo();
    wrapSwitchTab();
    setupNavSlideIndicator();
    // Revela os cards já visíveis na página inicial ao carregar
    primeRevealFor(document.getElementById('page-home'));
  });
})();
