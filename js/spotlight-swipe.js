/* ═══════════════════════════════════════════════════════════════
   Spotlight Swipe / Drag — programme-card carousel
   ───────────────────────────────────────────────────────────────
   The #spotlight section already has:
     • ← → arrow buttons
     • A row of "Go to programme N" dot buttons
     • Side cards with pointer-events:auto so clicking them shifts
       focus to that card
   This wedge adds:
     • Touch swipe (mobile)
     • Mouse drag (desktop)
   Both translate horizontal motion past a 40-px threshold into
   a press of the next/prev arrow. Small movements stay clicks so
   tap-on-side-card-to-focus is preserved.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const SWIPE_THRESHOLD_PX = 40;
  const SWIPE_MAX_MS       = 800;

  function findArrow(sec, glyph){
    return Array.from(sec.querySelectorAll('button')).find(b => b.textContent.trim() === glyph);
  }

  function attach(sec){
    if(sec.dataset.swipeBound) return;
    const prev = findArrow(sec, '←');
    const next = findArrow(sec, '→');
    if(!prev || !next) return;       // wait until React renders the arrows
    sec.dataset.swipeBound = '1';

    // Visual affordance — show the user this area is grabbable
    const css = `
      #spotlight{ touch-action: pan-y; cursor: grab; }
      #spotlight.is-grabbing{ cursor: grabbing; }
      /* Side cards already have pointer-events:auto from the React bundle,
         which means click-to-focus works out of the box. We just bump the
         cursor on them to communicate it. */
      #spotlight button[aria-label^="Programme:"]{ cursor: pointer; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    let startX = 0, startY = 0, startT = 0, dragging = false, primaryId = null;

    sec.addEventListener('pointerdown', (e) => {
      // Mouse: only primary button. Touch + pen: always.
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX; startY = e.clientY;
      startT = performance.now();
      dragging = true;
      primaryId = e.pointerId;
      sec.classList.add('is-grabbing');
    });

    function endDrag(e){
      if(!dragging) return;
      dragging = false;
      sec.classList.remove('is-grabbing');
      if(e.pointerId !== primaryId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dt = performance.now() - startT;
      // Must be primarily horizontal, exceed threshold, and faster than 800ms
      if(Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > SWIPE_THRESHOLD_PX && dt < SWIPE_MAX_MS){
        if(dx < 0) next.click();
        else        prev.click();
      }
    }
    sec.addEventListener('pointerup',     endDrag);
    sec.addEventListener('pointercancel', endDrag);
    sec.addEventListener('pointerleave',  endDrag);

    // Keyboard: ← / → for accessibility (when section has focus)
    sec.tabIndex = sec.tabIndex || 0;
    sec.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowLeft')  { prev.click(); e.preventDefault(); }
      if(e.key === 'ArrowRight') { next.click(); e.preventDefault(); }
    });

    console.log('[spotlight-swipe] active — touch + mouse drag wired');
  }

  function poll(attempts){
    const sec = document.getElementById('spotlight');
    if(sec) attach(sec);
    if(sec?.dataset.swipeBound) return;
    if(attempts <= 0) return console.warn('[spotlight-swipe] timed out');
    setTimeout(() => poll(attempts - 1), 200);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => poll(80), { once: true });
  } else {
    poll(80);
  }
})();
