/* ═══════════════════════════════════════════════════════════════
   Strip Apply — removes every "apply for the course online"
   affordance from the page since enrolment is handled offline.
   ───────────────────────────────────────────────────────────────
   Most of these are baked into the compiled React bundle, so we
   purge them after each render via a MutationObserver. We also:
     • Correct the street address ("Lot 33 North Road, Lacytown"
       → "82 Brickdam, Georgetown") wherever it appears
     • Replace anything pointing at apply.html with the Ministry
       of Labour Guyana site so visitors still have a clear path
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const MOL_URL = 'https://labour.gov.gy/';

  // Selectors / text patterns that identify "apply" affordances.
  function isApplyTrigger(el){
    if(!el || el.nodeType !== 1) return false;
    if(el.dataset && el.dataset.applyStripped) return false;     // already handled
    const href = el.getAttribute && el.getAttribute('href');
    if(href === '#apply' || (href && href.endsWith('apply.html'))) return true;
    if(href && href.includes('pages/apply.html')) return true;
    const txt = (el.textContent || '').trim().toLowerCase();
    if(/^apply\b|apply for|apply online|apply now|application form|2026 intake/.test(txt) && txt.length < 80) return true;
    return false;
  }

  // Hide / rewire a single element. We *hide* (rather than delete) so
  // React's reconciler doesn't trip over a missing node next render.
  function neutralise(el){
    if(!el || el.dataset?.applyStripped) return;
    if(el.dataset) el.dataset.applyStripped = '1';
    // If it's inside the apply matrix CTA, the whole CTA pill should die.
    const pill = el.closest('a[href="#apply"], a[href*="apply.html"]') || el;
    if(pill.tagName === 'A' || pill.tagName === 'BUTTON'){
      pill.style.display = 'none';
      // mm-cta in mobile menu has a sibling we want to keep; just hide the link itself
    } else {
      el.style.display = 'none';
    }
  }

  // Replace the entire React-rendered #apply section with a brief
  // "How to enrol" notice that points at the Ministry of Labour site.
  function neutraliseApplySection(){
    const sec = document.getElementById('apply');
    if(!sec || sec.dataset.applyStripped) return;
    sec.dataset.applyStripped = '1';
    sec.style.minHeight = 'auto';
    sec.style.padding = '120px 24px 100px';
    sec.innerHTML = `
      <div class="max-w-[1100px] mx-auto px-4 md:px-8 text-center">
        <h2 class="font-display tracking-[-0.02em] leading-[1.05]"
            style="font-size: clamp(2rem, 5.4vw, 4rem); font-variation-settings: &quot;opsz&quot; 144; font-weight: 520;">
          Ready to <em style="color:#FFA45A;font-style:italic;">enrol</em>?
        </h2>
        <p class="mt-6 text-[15px] md:text-[16.5px] text-white/80 leading-[1.7] max-w-[58ch] mx-auto">
          BIT enrolments happen in person at any of our centres. Drop in, give us a call, or send us an email &mdash; we're happy to help you choose a trade and start the application.
        </p>

        <div class="bit-enrol-row" role="list">
          <a href="pages/regional-centres.html" class="bit-enrol-card" role="listitem">
            <span class="bit-enrol-ico" style="background:linear-gradient(135deg,#F26522,#D44E0F);box-shadow:0 8px 22px rgba(242,101,34,0.35)" aria-hidden="true">
              <!-- Map pin icon — stroke-style, 24x24 viewBox -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span class="bit-enrol-label">Visit a centre</span>
            <span class="bit-enrol-detail">Find your nearest BIT training centre</span>
            <span class="bit-enrol-cta">See all 10 regions
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </span>
          </a>
          <a href="tel:+5922260043" class="bit-enrol-card" role="listitem">
            <span class="bit-enrol-ico" style="background:linear-gradient(135deg,#1B4D8E,#0F3568)" aria-hidden="true">
              <!-- Phone handset -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <span class="bit-enrol-label">Give us a call</span>
            <span class="bit-enrol-detail">Monday to Friday, 8:00 a.m. &ndash; 4:30 p.m.</span>
            <span class="bit-enrol-cta">+592&nbsp;226-0043
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </span>
          </a>
          <a href="mailto:info@bit.gov.gy" class="bit-enrol-card" role="listitem">
            <span class="bit-enrol-ico" style="background:linear-gradient(135deg,#0F3568,#06112A)" aria-hidden="true">
              <!-- Envelope -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M3.5 6.5l8.5 7 8.5-7"/></svg>
            </span>
            <span class="bit-enrol-label">Send an email</span>
            <span class="bit-enrol-detail">We reply within 1&ndash;2 working days</span>
            <span class="bit-enrol-cta">info@bit.gov.gy
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </span>
          </a>
        </div>

        <p class="bit-enrol-foot">
          For national labour notices and vacancies, see the
          <a href="${MOL_URL}" target="_blank" rel="noopener">Ministry of Labour website</a>.
        </p>
      </div>
    `;
    injectCtaStyle();
  }

  // ── Government-grade CTA button styling ──────────────────────
  // Used in the #apply section above. Two variants:
  //   .bit-cta-primary  → solid navy → BIT institutional
  //   Three friendly enrolment cards: Visit · Call · Email.
  function injectCtaStyle(){
    if(document.getElementById('bit-cta-style')) return;
    const css = `
      /* Three-up grid of enrolment options. Collapses to one column on
         tablet/phone. */
      .bit-enrol-row{
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        max-width: 960px;
        margin: 44px auto 0;
        text-align: left;
      }
      @media (max-width: 880px){
        .bit-enrol-row{ grid-template-columns: 1fr; max-width: 460px; }
      }

      .bit-enrol-card{
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 16px;
        padding: 26px 24px;
        text-decoration: none;
        color: #fff;
        display: flex; flex-direction: column; gap: 6px;
        font-family: Inter, system-ui, sans-serif;
        transition: transform .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease;
        position: relative;
        overflow: hidden;
      }
      .bit-enrol-card:hover{
        transform: translateY(-3px);
        background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
        border-color: rgba(255,255,255,0.20);
        box-shadow: 0 16px 36px -10px rgba(0,0,0,0.55);
      }

      .bit-enrol-ico{
        width: 52px; height: 52px;
        border-radius: 14px;
        display: inline-flex; align-items: center; justify-content: center;
        color: #fff;
        font-size: 18px;
        margin-bottom: 14px;
      }

      .bit-enrol-label{
        font-size: 1.1rem;
        font-weight: 700;
        line-height: 1.25;
        color: #fff;
      }

      .bit-enrol-detail{
        font-size: 0.95rem;
        color: rgba(255,255,255,0.72);
        line-height: 1.5;
        margin-top: 2px;
      }

      .bit-enrol-cta{
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #FFA45A;
        margin-top: 14px;
      }
      .bit-enrol-cta i{
        font-size: 12px;
        transition: transform .2s ease;
      }
      .bit-enrol-card:hover .bit-enrol-cta i{ transform: translateX(4px); }

      /* Soft afterword */
      .bit-enrol-foot{
        margin-top: 36px;
        font-family: Inter, system-ui, sans-serif;
        font-size: 14px;
        color: rgba(255,255,255,0.55);
      }
      .bit-enrol-foot a{
        color: #FFA45A;
        text-decoration: underline;
        text-underline-offset: 3px;
        text-decoration-thickness: 1px;
      }
      .bit-enrol-foot a:hover{ color: #fff; }
    `;
    const st = document.createElement('style');
    st.id = 'bit-cta-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // Address replacement — walk text nodes once after first render, then
  // again on each mutation batch. The compiled React bundle splits the
  // address across multiple <li> nodes, so we also handle fragments
  // ("Lot 33 North Road" alone, "Lacytown, ..." alone) individually.
  const FULL_ADDR = /Lot\s*33[^,]*North Road[^,]*,?\s*Lacytown,?\s*Georgetown/gi;
  function replaceAddressIn(node){
    if(node.nodeType === 3){   // text node
      let t = node.nodeValue;
      if(!t) return;
      let changed = false;
      if(FULL_ADDR.test(t)){
        t = t.replace(FULL_ADDR, '82 Brickdam, Georgetown');
        changed = true;
      }
      // Fragment-level replacements for split nodes
      if(/Lot\s*33[^,]*North Road/i.test(t)){
        t = t.replace(/Lot\s*33[^,]*North Road/gi, '82 Brickdam');
        changed = true;
      }
      if(/Lacytown,?\s*/i.test(t)){
        // strip "Lacytown, " (or "Lacytown" alone) entirely; the surrounding
        // text already says "Georgetown, Guyana" or similar
        t = t.replace(/Lacytown,\s*/gi, '').replace(/\s*Lacytown\b/gi, '');
        changed = true;
      }
      if(changed) node.nodeValue = t;
      return;
    }
    if(node.nodeType !== 1) return;
    if(node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    for(const child of node.childNodes) replaceAddressIn(child);
  }

  // Insert a thin "Parent ministry: Ministry of Labour" pill into the
  // nav bar so the Ministry of Labour is immediately discoverable. Once.
  function injectMolPill(){
    if(document.querySelector('[data-mol-pill]')) return;
    const navRow = document.querySelector('header a[href="#top"]')?.parentElement;
    if(!navRow) return;
    // Hide the pill on tiny screens — it would clutter; the mobile menu
    // already has a Ministry of Labour link as the main CTA.
    const pill = document.createElement('a');
    pill.setAttribute('data-mol-pill', '1');
    pill.href = MOL_URL;
    pill.target = '_blank';
    pill.rel = 'noopener';
    pill.textContent = 'Ministry of Labour ↗';
    pill.style.cssText = [
      'display:none;align-items:center;gap:6px;',
      'padding:7px 13px;border-radius:999px;',
      'border:1px solid rgba(255,255,255,0.18);',
      'background:rgba(27,77,142,0.18);',
      'color:#fff;font-family:JetBrains Mono,ui-monospace,monospace;',
      'font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;',
      'text-decoration:none;transition:background-color .2s;',
      'margin-right:8px;flex-shrink:0;',
    ].join('');
    pill.addEventListener('mouseenter', () => { pill.style.background = 'rgba(242,101,34,0.22)'; });
    pill.addEventListener('mouseleave', () => { pill.style.background = 'rgba(27,77,142,0.18)'; });
    // Show on screens ≥ 880px so it doesn't clobber the mobile bar
    const showCSS = `@media (min-width: 880px){ [data-mol-pill]{ display:inline-flex !important; } }`;
    const st = document.createElement('style'); st.textContent = showCSS; document.head.appendChild(st);
    // Insert before the apply CTA wrapper (or at the end of the row if
    // apply already gone). The apply CTA is a deep descendant — not a
    // direct child of navRow — so use its actual parent to avoid the
    // "node is not a child of this node" insertBefore error.
    try {
      const applyCta = navRow.querySelector('a[href="#apply"], a[href*="apply.html"]');
      if(applyCta && applyCta.parentNode){
        applyCta.parentNode.insertBefore(pill, applyCta);
      } else {
        navRow.appendChild(pill);
      }
    } catch(_) {
      // Fallback: just append to the nav row. Better to have the pill at
      // the wrong position than to crash the rest of the wedge.
      try { navRow.appendChild(pill); } catch(_) {}
    }
  }

  // Batch a sweep of the page — each step is independent. If any step
  // throws, the others still run, so the user-visible apply section
  // replacement is never blocked by a side-quest failure.
  function sweep(){
    try {
      // 1. Strip apply CTAs
      document.querySelectorAll('a[href="#apply"], a[href*="apply.html"], button').forEach(el => {
        if(isApplyTrigger(el)) neutralise(el);
      });
      // Catch any plain text-link triggers that don't match selectors
      document.querySelectorAll('a, button').forEach(el => {
        if(isApplyTrigger(el)) neutralise(el);
      });
    } catch(_) {}
    try { neutraliseApplySection(); } catch(_) {}
    try { replaceAddressIn(document.body); } catch(_) {}
    try { injectMolPill(); } catch(_) {}
  }

  // First sweep after React mounts. Repeat on DOM mutations so newly-
  // rendered apply nodes (e.g. on view changes) get caught too.
  function boot(){
    sweep();
    const mo = new MutationObserver((muts) => {
      // Cheap guard: only resweep if any mutation looks relevant
      let touch = false;
      for(const m of muts){
        if(m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)){ touch = true; break; }
      }
      if(touch) sweep();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    console.log('[strip-apply] active — apply CTAs purged, address corrected, MOL link wired');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
