/* ═══════════════════════════════════════════════════════════════
   Review Fixes — post-review-1 cleanup (May 2026)
   ───────────────────────────────────────────────────────────────
   The BIT officer reviewed the live site and asked for several
   surgical changes. Most touch text/elements baked into the
   compiled React bundle, so we sweep them via this wedge.

   1. Remove every "Oil & Gas Pre-Employment" reference (matrix
      row, spotlight card, programme detail link, search index)
   2. Hide the "#06 11 22B" chapter marker at the bottom-right
      of the hero — reviewer flagged it as confusing noise
   3. Hide the tiny "BOARD OF INDUSTRIAL TRAINING · GUYANA"
      eyebrow above the hero H1 (it's hard to read at that size;
      we'll make the BIT identity stronger in the nav instead)
   4. Strip text-decoration: underline from the USAID partner
      marker (and anywhere else underline accents leaked in)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ─── 1. Oil & Gas removal ─────────────────────────────────────
  // Patterns that identify the Oil & Gas card / matrix row / link.
  const OG_PATTERNS = [
    /oil\s*&?\s*gas/i,
    /\bpre-?employment\b/i,
    /\bfactor\b/i,
  ];

  function isOilGasElement(el){
    if(!el || el.nodeType !== 1) return false;
    if(el.dataset && el.dataset.reviewStripped) return false;
    const txt = (el.textContent || '').trim().toLowerCase();
    if(!txt || txt.length > 200) return false;
    return OG_PATTERNS.some(rx => rx.test(txt));
  }

  function hideOilGas(){
    // Spotlight card buttons (10 large carousel cards)
    document.querySelectorAll('button[aria-label^="Programme:"]').forEach(btn => {
      if(/oil\s*&?\s*gas/i.test(btn.getAttribute('aria-label') || '')){
        btn.style.display = 'none';
        btn.dataset.reviewStripped = '1';
      }
    });
    // Detail-page arrow links + page-links wedge entries
    document.querySelectorAll('a[href*="oil-gas"], .bit-detail-arrow[href*="oil-gas"]').forEach(a => {
      a.style.display = 'none';
      a.dataset.reviewStripped = '1';
    });
    // Programme list rows in #programmes section (whole <li>)
    document.querySelectorAll('#programmes li').forEach(li => {
      const span = li.querySelector('span.flex-1') || li.querySelector('span:nth-child(2)');
      if(span && /oil\s*&?\s*gas/i.test(span.textContent || '')){
        li.style.display = 'none';
        li.dataset.reviewStripped = '1';
      }
    });
    // Matrix programme name buttons (left column of the 12×10 grid)
    document.querySelectorAll('#regions button.text-left').forEach(btn => {
      const span = btn.querySelector('span:last-child');
      if(span && /oil\s*&?\s*gas/i.test(span.textContent || '')){
        // Hide the row's name button + its 10 region cells
        const grid = btn.parentElement;
        if(grid){
          const start = Array.from(grid.children).indexOf(btn);
          for(let c = 0; c < 11; c++){
            const cell = grid.children[start + c];
            if(cell){
              cell.style.display = 'none';
              cell.dataset.reviewStripped = '1';
            }
          }
        }
      }
    });
    // Search widget index — if open
    document.querySelectorAll('[data-bit-search] [data-slug="oil-gas"]').forEach(el => {
      el.style.display = 'none';
    });
  }

  // ─── 2. Hide hex/code-like ticker text near the hero ─────────
  // Catches every short alphanumeric label that looks like a build
  // hash, frame tag, or chapter code. Patterns covered:
  //   "#0611 22B"        — hash + two digit groups + letter
  //   "#06 11 22B"       — three groups
  //   "#061122B"         — no separator
  //   "0611 22B" / "611B"— without hash
  //   "0xF26522" / "#F26522" — hex strings
  //   bare "06.11.22B"   — dot-separated
  const TICKER_PATTERNS = [
    /^#?\s*\d{2,}\s+\d{1,}[A-Z]?$/i,
    /^#?\s*\d{2,}\s+\d{2,}\s+\d{1,}[A-Z]?$/i,
    /^#?\s*\d{4,}\s*\d{1,}[A-Z]$/i,
    /^#?\s*\d{3,}[A-Z]$/i,
    /^#?\s*[0-9a-fA-F]{6,8}$/,                // bare hex like F26522 or #FFA45A (≥ 6 hex chars)
    /^(0x)?[0-9A-F]{4,}$/i,                   // 0x-prefixed or bare hex
    /^#?\s*\d{1,}[.\-]\d{1,}[.\-]\d{1,}[A-Z]?$/i, // "06.11.22B"
  ];
  function isTicker(t){
    if(!t || t.length > 20) return false;
    return TICKER_PATTERNS.some(rx => rx.test(t));
  }
  function hideChapterTicker(){
    // Only check elements near the hero — avoid hiding e.g. "1910" headings.
    const hero = document.getElementById('top');
    const candidates = hero
      ? hero.querySelectorAll('div, span, p, code')
      : document.querySelectorAll('div, span, p, code');
    candidates.forEach(el => {
      if(el.children.length || el.dataset.reviewStripped) return;
      const t = (el.textContent || '').trim();
      if(isTicker(t)){
        el.style.display = 'none';
        el.dataset.reviewStripped = '1';
        // Hide tiny wrapper pills too
        const par = el.parentElement;
        if(par && par.children.length <= 2 && par.textContent.trim().length < 20){
          par.style.display = 'none';
        }
      }
    });
  }

  // ─── 3. Hide the small "BOARD OF INDUSTRIAL TRAINING · GUYANA"
  //       eyebrow above the H1. The BIT identity now lives prominently
  //       in the nav (handled separately via CSS).
  function hideHeroEyebrow(){
    document.querySelectorAll('div, span, p').forEach(el => {
      if(el.children.length || el.dataset.reviewStripped) return;
      const t = (el.textContent || '').trim();
      if(/^board\s+of\s+industrial\s+training\s*[·•|–-]?\s*guyana$/i.test(t)){
        el.style.display = 'none';
        el.dataset.reviewStripped = '1';
      }
    });
  }

  // ─── 4. Strip stray text-decoration + REMOVE USAID entirely ───
  // Review-2 escalation: don't just clear USAID's underline — hide
  // the USAID partner node AND any connecting line that pointed at
  // it. Hide the parent group (often a positioned div in the
  // partners constellation) so we don't leave a stranded SVG line.
  function stripUnderlines(){
    document.querySelectorAll('a, span, div').forEach(el => {
      const cs = getComputedStyle(el);
      if(cs.textDecorationLine === 'underline' && !el.closest('a[href]')){
        el.style.textDecoration = 'none';
      }
    });
  }
  function removeUSAID(){
    // Hide every element whose visible text is exactly "USAID"
    // (and its positioned wrapper, which usually carries the partner
    // connector line on the partners diagram).
    document.querySelectorAll('*').forEach(el => {
      if(el.dataset.reviewStripped) return;
      if(el.children.length) return;
      const t = (el.textContent || '').trim();
      if(t.toUpperCase() === 'USAID' || /^usaid$/i.test(t)){
        // Walk up to the partner wrapper (absolute-positioned div) and
        // hide it so the connector line + label disappear together.
        let target = el;
        for(let depth = 0; depth < 3; depth++){
          if(!target.parentElement) break;
          const cs = getComputedStyle(target.parentElement);
          if(cs.position === 'absolute' || cs.position === 'relative'){
            target = target.parentElement;
            break;
          }
          target = target.parentElement;
        }
        target.style.display = 'none';
        target.dataset.reviewStripped = '1';
      }
    });
  }

  // ─── 5. Hide the static "Where Guyana's future is built." corner
  // label inside the workshop scrub section. It says the same thing
  // as the scroll-tied caption injected by scrub-frames.js, so when
  // both are visible mid-scroll the user sees the same text twice
  // (overlapping).
  //
  // Distinguish CORNER LABEL (only this phrase) from INJECTED CAPTIONS
  // (the same phrase among 4 others) by checking the TRIMMED textContent
  // length. The corner label is ≤ 40 chars; the injected wrapper holds
  // all 5 captions concatenated (~120 chars).
  function hideDuplicateCornerLabel(){
    document.querySelectorAll('h2').forEach(h => {
      if(h.dataset.reviewStripped) return;
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim();
      const isCornerLabel = t.length <= 40 &&
                            /^where\s+guyana.{0,2}s?\s+future\s+is\s+built\.?$/i.test(t);
      if(!isCornerLabel) return;
      // Hide the H2's direct wrap container (the self-end label box)
      const wrap = h.parentElement;
      if(wrap){
        wrap.style.display = 'none';
        wrap.dataset.reviewStripped = '1';
      } else {
        h.style.display = 'none';
        h.dataset.reviewStripped = '1';
      }
    });
  }

  function sweep(){
    hideOilGas();
    hideChapterTicker();
    hideHeroEyebrow();
    stripUnderlines();
    removeUSAID();
    hideDuplicateCornerLabel();
  }

  function boot(){
    sweep();
    const mo = new MutationObserver((muts) => {
      let touch = false;
      for(const m of muts){
        if(m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)){ touch = true; break; }
      }
      if(touch) sweep();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    console.log('[review-fixes] active — Oil & Gas / chapter ticker / eyebrow / underlines purged');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
