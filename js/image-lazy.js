/* ═══════════════════════════════════════════════════════════════
   Image Lazy-Load — late-pass annotation
   ───────────────────────────────────────────────────────────────
   The React bundle renders images without explicit loading hints.
   We sweep the DOM after mount and add:
     • loading="lazy"   for images that aren't in the first viewport
     • decoding="async" so the main thread doesn't block on image
                        decode
   Above-the-fold images keep their default eager loading so the
   landing render isn't delayed.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const VIEWPORT_BUFFER = 200;   // images this far below fold are eager-loaded too

  function sweep(){
    const fold = window.innerHeight + VIEWPORT_BUFFER;
    document.querySelectorAll('img').forEach(img => {
      if(img.dataset.lazyHinted) return;
      img.dataset.lazyHinted = '1';
      // decoding=async on EVERY image (cheap, only helps)
      if(!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      // loading=lazy only for below-fold images
      const rect = img.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if(top > fold && !img.getAttribute('loading')){
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function boot(){
    sweep();
    // React often mounts more images after first render, so re-sweep on mutation
    const mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
