/* ═══════════════════════════════════════════════════════════════
   Mobile Fixes — comprehensive mobile-friendliness wedge
   ───────────────────────────────────────────────────────────────
   Tightens up every common mobile pain point in one place:

     • Tap targets — pad small <button> dots (programme carousel,
       region matrix) to a 44 × 44 hit zone via padding while
       preserving their visual size
     • Tiny mono text — bump 9.5–11px JetBrains Mono labels to a
       readable 11.5px floor on phones
     • Region matrix overflow — wrap the 12 × 10 grid in a
       horizontally scrollable container so it never breaks the
       page
     • Top-padding for content beneath the always-visible mobile
       nav pill bar
     • Larger close affordance on map tooltip
     • Larger touch target on the regional centre pills
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const MOBILE_MAX = 760;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  function injectCSS(){
    if(document.getElementById('mobile-fixes-style')) return;
    const css = `
      @media (max-width: ${MOBILE_MAX}px){
        /* ── 1. Hit-zone padding on tiny pagination dots ────────── */
        /* "Go to programme N" buttons render as a small visual dot
           but need a 44 × 44 hit zone for thumb taps. We use padding
           + box-sizing:content-box so the visual dot stays small. */
        button[aria-label^="Go to programme"]{
          padding: 18px !important;
          margin: -16px !important;     /* negate the padding so layout doesn't shift */
          background-clip: content-box !important;
          min-width: 36px !important;
          min-height: 36px !important;
        }
        /* The arrow nav buttons (← →) too */
        #spotlight button[data-hover]{
          min-width: 44px !important;
          min-height: 44px !important;
        }

        /* ── 2. Floor for tiny mono text so labels are readable ── */
        .font-mono.text-\\[9px\\],
        .font-mono.text-\\[10px\\],
        .font-mono.text-\\[10\\.5px\\],
        [class*="text-[9"],
        [class*="text-[10px"]{
          font-size: 11.5px !important;
          letter-spacing: 0.20em !important;
        }
        .font-mono.text-\\[11px\\]{
          font-size: 12px !important;
        }
        /* Body copy minimum 14.5px on phones */
        p.text-\\[14px\\], p.text-\\[13\\.5px\\], p.text-\\[13px\\]{
          font-size: 14.5px !important;
          line-height: 1.6 !important;
        }

        /* ── 3. Region-matrix horizontal scroll wrapper ──────────── */
        /* The 12 × 10 grid is wider than 375 px viewports. Wrap it
           in a horizontally-scrollable container with a subtle
           gradient fade on both edges as a "more →" cue. */
        #regions .grid[style*="grid-template-columns"]{
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
          padding-bottom: 8px;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
        }

        /* ── 4. Page top padding under the sticky mobile nav bar ── */
        section#top{ padding-top: 150px !important; }

        /* ── 5. Forge hero — taller for mobile readability ────── */
        section#top{ min-height: 100svh; }

        /* ── 6. Map: thumb-friendly tooltip ───────────────────── */
        .gy-tooltip{
          max-width: 86vw !important;
          font-size: 13px !important;
          padding: 12px 16px !important;
        }
        .gy-region-label{ font-size: 13px !important; }
        .gy-region-city{ font-size: 9.5px !important; }

        /* ── 7. Heritage scroll — tighter on mobile so chapters fit ── */
        section#heritage{ overflow: hidden; }

        /* ── 8. Larger touch targets for region pills ───────────── */
        #network .absolute.cursor-pointer{
          min-width: 44px;
        }
        /* And the small "01 · ..." chapter eyebrows */
        section .font-mono.uppercase{
          line-height: 1.5 !important;
        }

        /* ── 9. Forms: large enough fields + buttons ────────────── */
        input, textarea, select{
          font-size: 16px !important;   /* 16px prevents iOS auto-zoom on focus */
          min-height: 44px;
        }
        button:not(.bit-search-fab):not(.mm-toggle){
          min-height: 36px;
        }

        /* ── 10. CTAs ──────────────────────────────────────────── */
        a[class*="rounded-full"][class*="px-"]{
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }

        /* ── 11. Matrix "Details →" arrows: bigger tap zone ───── */
        .bit-detail-arrow{
          padding: 10px 12px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          font-size: 16px !important;
        }

        /* ── 12. Verify form submit + footer link hit-zones ───── */
        footer a, footer button{
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          padding: 6px 0;
        }

        /* ── 13. Disable hover-only affordances on touch ───────── */
        a[data-hover], button[data-hover]{
          touch-action: manipulation;       /* removes 300ms tap delay */
        }

        /* ── 14. Programme-cards in spotlight: bigger swipe area ── */
        #spotlight{
          touch-action: pan-y;              /* hint browser this is swipeable */
        }
      }

      /* Tablet middle ground (760–1023 px) keeps slightly relaxed
         caps but does pick up the tap-zone padding. */
      @media (min-width: 760px) and (max-width: 1023px){
        button[aria-label^="Go to programme"]{
          padding: 12px !important;
          margin: -10px !important;
          background-clip: content-box !important;
        }
      }
    `;
    const st = document.createElement('style');
    st.id = 'mobile-fixes-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // Push the matrix scroll position so the active R-column is visible
  // on mobile when a region is filtered.
  function followRegionFilter(){
    window.addEventListener('bit:region-filter', (e) => {
      if(!isMobile()) return;
      const n = e.detail?.regionN;
      if(n == null) return;
      const grid = document.querySelector('#regions .grid[style*="grid-template-columns"]');
      if(!grid) return;
      // Roughly: each cell is 28px + 6px gap = 34px. Header offset is name column (180–220px).
      const colWidth = 34;
      const headerOffset = 200;
      const target = headerOffset + (n - 1) * colWidth - grid.clientWidth / 2 + colWidth/2;
      grid.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    });
  }

  function boot(){
    injectCSS();
    followRegionFilter();
    console.log('[mobile-fixes] active — hit-zones bumped, mono text floor 11.5px, matrix scrollable');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
