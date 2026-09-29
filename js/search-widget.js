/* ═══════════════════════════════════════════════════════════════
   BIT Find — fast client-side search across programmes + regions.
   Floating button opens a panel with a search input. Type "weld"
   or "Region 6" or "berbice" to instantly surface matches with
   centre + region info.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const PROGRAMMES = [
    { code: 'EL',  name: 'Electrical Installation & Maintenance', cat: 'trades',     months: 6, regions: [3,4,6,10] },
    { code: 'PL',  name: 'Plumbing & Pipefitting',                cat: 'trades',     months: 6, regions: [3,4,6] },
    { code: 'WF',  name: 'Welding & Fabrication',                 cat: 'trades',     months: 6, regions: [3,4,6,10] },
    { code: 'MV',  name: 'Motor Vehicle Mechanics',               cat: 'trades',     months: 6, regions: [3,4,6] },
    { code: 'CJ',  name: 'Carpentry & Joinery',                   cat: 'trades',     months: 6, regions: [1,3,4,6,7,8,9,10] },
    { code: 'MC',  name: 'Masonry & Construction',                cat: 'trades',     months: 6, regions: [1,3,4,6,7,8,9] },
    { code: 'AC',  name: 'Air Conditioning & Refrigeration',      cat: 'trades',     months: 6, regions: [3,4,6] },
    { code: 'IT',  name: 'Information Technology & Computer Servicing', cat: 'tech', months: 6, regions: [3,4,6,10] },
    { code: 'CB',  name: 'Cosmetology & Beauty Culture',          cat: 'creative',   months: 4, regions: [3,4,6] },
    { code: 'GC',  name: 'Garment Construction & Fashion Design', cat: 'creative',   months: 4, regions: [3,4,6] },
    { code: 'FC',  name: 'Food Preparation & Culinary Arts',      cat: 'hospitality',months: 4, regions: [3,4,6] },
    { code: 'AG',  name: 'Agriculture & Agro-Processing',         cat: 'agriculture',months: 6, regions: [1,2,3,4,5,6,8,9] },
    { code: 'PV',  name: 'Photovoltaic Installation',             cat: 'energy',     months: 4, regions: [3,4,6] },
    { code: 'HD',  name: 'Heavy-Duty Equipment Operation',        cat: 'industrial', months: 6, regions: [4,6] },
    /* "Oil & Gas Pre-Employment" removed per review-1 — BIT does not offer this. */
    { code: 'WD',  name: 'Website Development',                   cat: 'tech',       months: 4, regions: [4] },
  ];

  const REGIONS = [
    { n: 1,  name: 'Mabaruma',        admin: 'Barima-Waini' },
    { n: 2,  name: 'Anna Regina',     admin: 'Pomeroon-Supenaam' },
    { n: 3,  name: 'West Demerara',   admin: 'Essequibo Islands-West Demerara' },
    { n: 4,  name: 'Georgetown',      admin: 'Demerara-Mahaica · HQ' },
    { n: 5,  name: 'Fort Wellington', admin: 'Mahaica-Berbice' },
    { n: 6,  name: 'Berbice',         admin: 'East Berbice-Corentyne' },
    { n: 7,  name: 'Bartica',         admin: 'Cuyuni-Mazaruni' },
    { n: 8,  name: 'Mahdia',          admin: 'Potaro-Siparuni' },
    { n: 9,  name: 'Lethem',          admin: 'Upper Takutu-Upper Essequibo' },
    { n: 10, name: 'Linden',          admin: 'Upper Demerara-Berbice' },
  ];

  const CAT_COLOR = {
    trades: '#1B4D8E', tech: '#9DC9FF', creative: '#E36AA9',
    hospitality: '#F2A522', agriculture: '#3FB36F',
    energy: '#FFD400', industrial: '#2B9DB0', offshore: '#FFA45A',
  };

  function fuzzyMatch(haystack, needle){
    if(!needle) return 0;
    const h = haystack.toLowerCase();
    const n = needle.toLowerCase();
    if(h.includes(n)) return 1.0;
    // Token-level partial
    const tokens = n.split(/\s+/).filter(Boolean);
    let hits = 0;
    for(const t of tokens) if(h.includes(t)) hits++;
    return tokens.length ? hits / tokens.length : 0;
  }

  function search(query){
    if(!query || query.length < 2) return [];
    const results = [];
    // Programme matches
    for(const p of PROGRAMMES){
      const score = Math.max(
        fuzzyMatch(p.name, query),
        fuzzyMatch(p.code, query),
        fuzzyMatch(p.cat, query),
      );
      if(score > 0){
        results.push({ kind: 'programme', score, p });
      }
    }
    // Region matches (typing "Berbice", "Region 6", "Linden", etc.)
    const regionMatch = /^(?:r|region)\s*(\d+)$/i.exec(query.trim()) ||
                        /^(\d+)$/.exec(query.trim());
    for(const r of REGIONS){
      let score = Math.max(
        fuzzyMatch(r.name, query),
        fuzzyMatch(r.admin, query),
      );
      if(regionMatch && parseInt(regionMatch[1]) === r.n) score = 1.0;
      if(score > 0){
        results.push({ kind: 'region', score, r });
      }
    }
    return results.sort((a,b) => b.score - a.score).slice(0, 12);
  }

  // ── DOM ────────────────────────────────────────────────────
  const css = `
    .bit-search-fab{
      position: fixed; bottom: 28px; right: 28px; z-index: 90;
      width: 56px; height: 56px; border-radius: 999px;
      background: linear-gradient(135deg, #F26522, #FFA45A);
      border: none; cursor: pointer;
      color: #0a0a0a; font-size: 22px;
      box-shadow: 0 12px 32px -8px rgba(242,101,34,0.55), 0 0 0 1px rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      transition: transform .25s cubic-bezier(.34,1.56,.64,1);
    }
    .bit-search-fab:hover, .bit-search-fab:focus{ transform: scale(1.06); outline: none; }
    .bit-search-fab svg{ width: 22px; height: 22px; }
    @media (max-width: 640px){
      .bit-search-fab{ bottom: 20px; right: 16px; width: 48px; height: 48px; }
    }

    .bit-search-overlay{
      position: fixed; inset: 0; z-index: 100;
      background: rgba(6, 17, 42, 0.85);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      display: none; align-items: flex-start; justify-content: center;
      padding: clamp(40px, 8vh, 80px) 16px 16px;
      opacity: 0; transition: opacity .25s ease;
    }
    .bit-search-overlay.open{ display: flex; opacity: 1; }
    .bit-search-panel{
      width: 100%; max-width: 640px;
      background: rgba(14, 26, 61, 0.92);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6);
      overflow: hidden;
    }
    .bit-search-input-row{
      display: flex; align-items: center; gap: 12px;
      padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .bit-search-input{
      flex: 1; background: transparent; border: none; outline: none;
      color: #fff; font-size: 17px; font-family: inherit;
    }
    .bit-search-input::placeholder{ color: rgba(255,255,255,0.4); }
    .bit-search-close{
      background: rgba(255,255,255,0.06); color: #fff; border: none;
      width: 32px; height: 32px; border-radius: 8px;
      cursor: pointer; font-size: 18px; line-height: 1;
    }
    .bit-search-results{
      max-height: 60vh; overflow-y: auto;
      padding: 8px;
    }
    .bit-search-result{
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-radius: 10px;
      cursor: pointer; text-decoration: none; color: inherit;
      transition: background-color .15s ease;
    }
    .bit-search-result:hover, .bit-search-result:focus{
      background: rgba(242,101,34, 0.10);
      outline: none;
    }
    .bit-search-dot{
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .bit-search-text{ flex: 1; min-width: 0; }
    .bit-search-title{
      font-family: Fraunces, serif; font-size: 16px;
      color: #fff; line-height: 1.2;
    }
    .bit-search-meta{
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: rgba(255,255,255,0.5); margin-top: 4px;
    }
    .bit-search-arrow{ color: rgba(255,255,255,0.4); font-size: 18px; }
    .bit-search-empty{
      padding: 40px 20px; text-align: center;
      color: rgba(255,255,255,0.5); font-size: 14px;
    }
    .bit-search-suggestions{
      padding: 8px;
    }
    .bit-search-suggestions-label{
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255,255,255,0.4); padding: 12px 14px 6px;
    }
    .bit-search-suggestion{
      display: inline-block; margin: 4px; padding: 6px 12px;
      background: rgba(255,255,255,0.05); border-radius: 999px;
      color: rgba(255,255,255,0.75); font-size: 12.5px;
      cursor: pointer; border: 1px solid rgba(255,255,255,0.06);
      transition: all .2s ease;
    }
    .bit-search-suggestion:hover{
      background: rgba(242,101,34, 0.15);
      color: #FFA45A; border-color: rgba(242,101,34,0.3);
    }
  `;

  function inject(){
    const styleTag = document.createElement('style');
    styleTag.id = 'bit-search-css';
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // Floating action button
    const fab = document.createElement('button');
    fab.className = 'bit-search-fab';
    fab.setAttribute('aria-label', 'Find a programme or region');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
    document.body.appendChild(fab);

    // Overlay panel
    const overlay = document.createElement('div');
    overlay.className = 'bit-search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Find a programme or region');
    overlay.innerHTML = `
      <div class="bit-search-panel">
        <div class="bit-search-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="bit-search-input" type="text" placeholder="Find a trade, region, or centre…" autocomplete="off"/>
          <button class="bit-search-close" aria-label="Close search">×</button>
        </div>
        <div class="bit-search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.bit-search-input');
    const results = overlay.querySelector('.bit-search-results');
    const closeBtn = overlay.querySelector('.bit-search-close');

    function open(){
      overlay.classList.add('open');
      setTimeout(() => input.focus(), 50);
      renderEmpty();
    }
    function close(){
      overlay.classList.remove('open');
      input.value = '';
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') close();
      // Cmd/Ctrl + K to open
      if((e.metaKey || e.ctrlKey) && e.key === 'k'){
        e.preventDefault();
        if(overlay.classList.contains('open')) close(); else open();
      }
    });

    function renderEmpty(){
      results.innerHTML = `
        <div class="bit-search-suggestions">
          <div class="bit-search-suggestions-label">Try searching</div>
          <span class="bit-search-suggestion" data-q="welding">Welding</span>
          <span class="bit-search-suggestion" data-q="electrical">Electrical</span>
          <span class="bit-search-suggestion" data-q="oil and gas">Oil &amp; gas</span>
          <span class="bit-search-suggestion" data-q="solar">Solar (PV)</span>
          <span class="bit-search-suggestion" data-q="berbice">Berbice (Region 6)</span>
          <span class="bit-search-suggestion" data-q="linden">Linden (Region 10)</span>
          <span class="bit-search-suggestion" data-q="lethem">Lethem (Region 9)</span>
          <span class="bit-search-suggestion" data-q="culinary">Culinary</span>
        </div>
      `;
      results.querySelectorAll('.bit-search-suggestion').forEach(el => {
        el.addEventListener('click', () => {
          input.value = el.getAttribute('data-q');
          input.dispatchEvent(new Event('input'));
          input.focus();
        });
      });
    }

    function regionsForCode(code){
      const p = PROGRAMMES.find(x => x.code === code);
      if(!p) return '';
      const names = p.regions.map(n => REGIONS.find(r => r.n === n)?.name).filter(Boolean);
      return names.join(' · ');
    }
    function programmesForRegion(n){
      return PROGRAMMES.filter(p => p.regions.includes(n)).map(p => p.name);
    }

    function render(query){
      const out = search(query);
      if(out.length === 0 && query && query.length >= 2){
        results.innerHTML = `<div class="bit-search-empty">No matches for "${escapeHtml(query)}".<br>Try a programme name, "Region N", or a centre name.</div>`;
        return;
      }
      if(out.length === 0){
        renderEmpty();
        return;
      }
      results.innerHTML = out.map(item => {
        if(item.kind === 'programme'){
          const cat = CAT_COLOR[item.p.cat] || '#F26522';
          return `<a class="bit-search-result" href="/pages/programme-detail.html?p=${detailKey(item.p.code)}">
            <span class="bit-search-dot" style="background:${cat}"></span>
            <span class="bit-search-text">
              <span class="bit-search-title">${escapeHtml(item.p.name)}</span>
              <span class="bit-search-meta">${item.p.months} months · Available in ${item.p.regions.length} regions: ${escapeHtml(regionsForCode(item.p.code))}</span>
            </span>
            <span class="bit-search-arrow">→</span>
          </a>`;
        } else {
          const progs = programmesForRegion(item.r.n);
          return `<a class="bit-search-result" href="/pages/regional-centres.html#region-${item.r.n}">
            <span class="bit-search-dot" style="background:#FFA45A"></span>
            <span class="bit-search-text">
              <span class="bit-search-title">${escapeHtml(item.r.name)} · Region ${item.r.n}</span>
              <span class="bit-search-meta">${escapeHtml(item.r.admin)} · ${progs.length} programmes available</span>
            </span>
            <span class="bit-search-arrow">→</span>
          </a>`;
        }
      }).join('');
    }

    function detailKey(code){
      // Map programme code to programme-detail.html ?p= slug
      const map = { EL:'electrical', PL:'plumbing', WF:'welding', MV:'motor',
                    CJ:'carpentry', MC:'masonry', AC:'ac', IT:'it', CB:'cosmetology',
                    GC:'garment', FC:'culinary', AG:'agriculture',
                    PV:'photovoltaic', HD:'heavy-duty', WD:'web-dev' };
      return map[code] || code.toLowerCase();
    }
    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => render(input.value), 80);
    });

    console.log('[bit-search] active — press Cmd+K (Mac) / Ctrl+K (Win) to open');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
