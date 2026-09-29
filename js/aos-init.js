/* Initialise AOS (Animate On Scroll) once the library has loaded.
   Extracted from a repeated inline <script> on every page so that the
   Content-Security-Policy can enforce script-src 'self' without
   'unsafe-inline' (NDMA security assessment, 10 July 2026, Finding 4).

   Respects the user's reduce-motion preference, both the OS-level
   setting and the site's own accessibility widget toggle. */
(function () {
  'use strict';

  function reduceMotion() {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) { /* matchMedia unavailable — fall through */ }
    return document.documentElement.classList.contains('bit-a11y-reduce-motion');
  }

  function init() {
    if (typeof window.AOS === 'undefined') return;
    if (reduceMotion()) {
      window.AOS.init({ disable: true });
      return;
    }
    window.AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
