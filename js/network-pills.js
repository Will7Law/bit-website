/* ═══════════════════════════════════════════════════════════════
   Network Pills — keep every regional centre pill visibly clear
   ───────────────────────────────────────────────────────────────
   The React-rendered network section animates each of the 10 region
   pills from scale(0.3) opacity:0 (collapsed) → scale(1) opacity:1
   (expanded). The expansion is driven by an "open/close" state that
   the user has to click into.

   Review-3 feedback: pills must be clearly visible at all times on
   both desktop and mobile. We watch the pill DOM and rewrite the
   inline transform/opacity so the pills are ALWAYS expanded, while
   preserving each pill's unique translate offset (otherwise they'd
   stack on top of each other at the centre).
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function isPillWrapper(el){
    if(!el || el.nodeType !== 1) return false;
    if(!el.classList) return false;
    if(!el.classList.contains('absolute')) return false;
    if(!el.classList.contains('cursor-pointer')) return false;
    if(!el.classList.contains('left-1/2')) return false;
    if(!el.classList.contains('top-1/2')) return false;
    return true;
  }

  // Rewrite a single pill's inline style — set scale to 1, opacity to 1,
  // preserve translate offsets, and disable the long transition.
  // We rewrite the existing transform string in place: just swap any
  // scale(X) → scale(1), leaving translate() (with its nested calc())
  // untouched. Earlier attempts using a regex that captured translate()
  // content tripped on the inner calc()'s parentheses.
  function forceExpanded(el){
    if(!el || !el.style) return;
    const transform = el.style.transform || '';
    let newTransform = transform.replace(/scale\([^)]+\)/, 'scale(1)');
    if(!/scale\(/.test(newTransform)){
      // No scale yet — append one
      newTransform = (newTransform || 'translate(-50%, -50%)') + ' scale(1)';
    }
    if(el.style.transform === newTransform &&
       el.style.opacity === '1' &&
       el.style.transition === 'none') return;
    el.style.setProperty('transform', newTransform, 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transition', 'none', 'important');
  }

  function sweep(){
    const network = document.getElementById('network');
    if(!network) return;
    network.querySelectorAll('.absolute.left-1\\/2.top-1\\/2.cursor-pointer').forEach(forceExpanded);
  }

  // Find the central "Expand regions" toggle and click it programmatically
  // so React shifts each pill to its proper outward translate() offset.
  // This is what flies the 10 pills apart from the stacked-at-centre
  // collapsed state into their orbit around the orange ball.
  function triggerExpand(){
    const network = document.getElementById('network');
    if(!network) return false;
    const toggle = Array.from(network.querySelectorAll('button')).find(b =>
      /^Expand regions$/i.test(b.getAttribute('aria-label') || ''));
    if(!toggle) return false;
    toggle.click();
    return true;
  }

  // Brighten the dim "N PROGRAMMES" subtitle inside each pill — the React
  // bundle paints it at white/50% which the reviewer flagged as too dim.
  // Also: (May-2026) the bottom three pills (Bartica / Berbice / Fort
  // Wellington) were fading into the section's bottom blue gradient.
  // We push the dark gradient further down, add bottom padding to the
  // section, and bump each pill background opacity so all 10 are
  // clearly visible at every viewport size.
  function brightenSubtitles(){
    const css = `
      #network .font-mono.text-\\[9px\\].text-white\\/50{
        color: rgba(255, 255, 255, 0.92) !important;
      }
      #network .text-white\\/50{
        color: rgba(255, 255, 255, 0.85) !important;
      }
      /* Make the "N PROGRAMMES" small-caps line itself slightly bolder */
      #network .font-mono.text-\\[9px\\]{
        font-weight: 600 !important;
        font-size: 9.5px !important;
      }
      /* ── May 2026: bottom-pill visibility fix ─────────────────── */
      /* Section gets extra bottom breathing room so the lowest pills
         (5/6/7) never touch the section edge or the next section. */
      #network{
        padding-bottom: 9rem !important;
      }
      @media (min-width: 768px){
        #network{ padding-bottom: 12rem !important; }
      }
      /* Soften & shift the dark gradient overlay. The original
         linear-gradient peaked at 85% blue right at the bottom edge,
         which swallowed the lowest pills. Now we peak earlier and
         hold at a slightly lighter value so pills always sit above
         readable contrast. */
      #network > div[style*="rgba(10,21,48"]{
        background: linear-gradient(180deg,
          rgba(10,21,48,0.45) 0%,
          rgba(10,21,48,0.62) 60%,
          rgba(10,21,48,0.55) 100%
        ) !important;
      }
      /* Pill chassis — pull every pill slightly forward so the
         backdrop-blur reads as a solid card, not a translucent ghost. */
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer > div,
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer .glass,
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer{
        /* nothing here directly — affordances are below */
      }
      /* The visible pill body has classes like "px-3 py-2 rounded-full
         backdrop-blur" or similar; we target any element inside the
         pill wrapper that has a background, and reinforce it. */
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer [class*="bg-"]{
        background-color: rgba(10, 21, 48, 0.85) !important;
        box-shadow:
          0 6px 18px rgba(0,0,0,0.35),
          0 0 0 1px rgba(255,255,255,0.10) !important;
      }
      /* Highlighted pill (Georgetown / hover) keeps its orange ring. */
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer.ring-1 [class*="bg-"],
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer:hover [class*="bg-"]{
        background-color: rgba(20, 35, 68, 0.92) !important;
        box-shadow:
          0 8px 26px rgba(242,101,34,0.30),
          0 0 0 1px rgba(242,101,34,0.55) !important;
      }
      /* Make sure every pill is above the gradient overlay. */
      #network .absolute.left-1\\/2.top-1\\/2.cursor-pointer{
        z-index: 4 !important;
      }
    `;
    if(!document.getElementById('network-pills-style')){
      const st = document.createElement('style');
      st.id = 'network-pills-style';
      st.textContent = css;
      document.head.appendChild(st);
    }
  }

  function boot(){
    brightenSubtitles();
    sweep();
    // Try to trigger React expansion. If the toggle isn't there yet,
    // retry a few times — once expanded, the pills get proper offsets
    // and naturally fly outward.
    let attempts = 0;
    function tryExpand(){
      if(triggerExpand()) return;
      if(++attempts < 30) setTimeout(tryExpand, 200);
    }
    tryExpand();

    const network = document.getElementById('network');
    if(!network) return;
    const mo = new MutationObserver((muts) => {
      for(const m of muts){
        if(m.type === 'attributes' && m.attributeName === 'style' && isPillWrapper(m.target)){
          forceExpanded(m.target);
        } else if(m.type === 'childList'){
          sweep();
        }
      }
    });
    mo.observe(network, { attributes: true, attributeFilter: ['style'], subtree: true, childList: true });

    // Strip the now-redundant "TAP CENTRE TO COLLAPSE — HOVER ANY PIN" hint.
    network.querySelectorAll('*').forEach(el => {
      if(el.children.length) return;
      const t = (el.textContent || '').trim().toUpperCase();
      if(/TAP\s+CENTRE\s+TO\s+(EXPAND|COLLAPSE)|HOVER\s+ANY\s+PIN/.test(t)){
        el.style.display = 'none';
      }
    });

    console.log('[network-pills] active — 10 region pills locked, subtitles brightened');
  }

  function waitForPills(attempts = 80){
    const network = document.getElementById('network');
    if(network && network.querySelectorAll('.absolute.left-1\\/2.top-1\\/2.cursor-pointer').length >= 8){
      boot(); return;
    }
    if(attempts <= 0) return console.warn('[network-pills] timed out');
    setTimeout(() => waitForPills(attempts - 1), 150);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => waitForPills(), { once: true });
  } else {
    waitForPills();
  }
})();
