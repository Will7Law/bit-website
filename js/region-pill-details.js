/* ═══════════════════════════════════════════════════════════════
   Region Pill Details — click to open multi-office panel
   ───────────────────────────────────────────────────────────────
   Before this wedge, the 10 region pills around the orange ball in
   the #network section were decorative. Clicking did nothing. Users
   couldn't access the detailed office address / phone information
   we now hold per region.

   This wedge attaches a click handler to each pill and opens a
   modal that lists every BIT office in that region (name + street
   address + phone), pulled from the same dataset that drives the
   Regional Centres page.

   The dataset mirrors ADDRESSES in js/guyana-map.js — the data
   is duplicated intentionally so this module stays standalone and
   loads independently of the Regions page.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  //  REGION OFFICE DATA  (mirror of js/guyana-map.js ADDRESSES)
  // ─────────────────────────────────────────────────────────────
  const REGIONS = {
    1:  { admin: 'Barima-Waini',                       centre: 'Mabaruma',         programmes: 3,  offices: [
      { name: 'Mabaruma',     addr: 'Regional Administrative Building, Mabaruma Compound', phone: '' },
      { name: 'Port Kaituma', addr: 'Lot 1, Port Kaituma',                                  phone: '' },
    ]},
    2:  { admin: 'Pomeroon-Supenaam',                  centre: 'Anna Regina',      programmes: 4,  offices: [
      { name: 'Anna Regina',                addr: 'Track A Lot C, Anna Regina',     phone: '677-0376 / 681-3014' },
      { name: 'Essequibo Islands & HDEO',   addr: '82 Brickdam',                    phone: '696-7785' },
    ]},
    3:  { admin: 'Essequibo Islands–West Demerara',    centre: 'West Demerara',    programmes: 12, offices: [
      { name: 'West Bank Demerara', addr: 'Lot 26 Government Quarters, Klien Pouderoyen', phone: '264-0096 / 708-0555' },
      { name: 'Tuschen',            addr: 'Parcel 690, Phase 1, East Bank Essequibo',      phone: '' },
    ]},
    4:  { admin: 'Demerara-Mahaica · HQ',              centre: 'Georgetown',       programmes: 16, offices: [
      { name: 'Georgetown — North',   addr: '82 Brickdam',                         phone: '649-2189' },
      { name: 'Georgetown — Central', addr: '82 Brickdam',                         phone: '699-8458' },
      { name: 'Georgetown — South',   addr: '82 Brickdam',                         phone: '688-2125' },
      { name: 'East Coast',           addr: 'Better Hope Community Centre Ground', phone: '220-1411 / 669-9565' },
      { name: 'East Bank',            addr: 'Ixora Avenue, Eccles',                phone: '233-3600 / 617-6433' },
      { name: 'East Coast (Unity)',   addr: 'Unity Village',                       phone: '502-4770 / 669-9565' },
    ]},
    5:  { admin: 'Mahaica-Berbice',                    centre: 'Fort Wellington',  programmes: 3,  offices: [
      { name: 'West Coast Berbice', addr: 'Plantation Ross, North Public Road', phone: '630-3553' },
    ]},
    6:  { admin: 'East Berbice-Corentyne',             centre: 'Berbice',          programmes: 14, offices: [
      { name: 'New Amsterdam',                 addr: 'Grant 228 Vryman Erven, Lower Corentyne', phone: '500-2185 / 665-5138' },
      { name: 'Upper Corentyne (Springland)',  addr: 'Lot 12 Springland',                       phone: '335-4330' },
      { name: 'Upper Corentyne (Corriverton)', addr: 'Lot 170 #79 (M&TC Compound), Corriverton', phone: '339-2210' },
    ]},
    7:  { admin: 'Cuyuni-Mazaruni',                    centre: 'Bartica',          programmes: 3,  offices: [
      { name: 'Bartica', addr: 'Mongrippa Hill', phone: '455-0019 / 682-1578' },
    ]},
    8:  { admin: 'Potaro-Siparuni',                    centre: 'Mahdia',           programmes: 3,  offices: [
      { name: 'Mahdia', addr: 'Parcel 871, Mahdia', phone: '' },
    ]},
    9:  { admin: 'Upper Takutu–Upper Essequibo',       centre: 'Lethem',           programmes: 3,  offices: [
      { name: 'Lethem', addr: 'Tabatinga Sports Complex', phone: '668-0250' },
    ]},
    10: { admin: 'Upper Demerara-Berbice',             centre: 'Linden',           programmes: 5,  offices: [
      { name: 'Linden',   addr: '63 Crabwood Street, McKenzie', phone: '506-7706 / 660-6030' },
      { name: 'Kwakwani', addr: 'Kwakwani Park, Berbice River', phone: '440-2562 / 688-8921' },
    ]},
  };

  // ─────────────────────────────────────────────────────────────
  //  MODAL CONSTRUCTION
  // ─────────────────────────────────────────────────────────────
  let modalRoot = null;

  function ensureStyle() {
    if (document.getElementById('region-pill-modal-style')) return;
    const css = `
      .region-modal-backdrop{
        position: fixed; inset: 0; z-index: 9000;
        background: rgba(6, 12, 28, 0.78);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
        opacity: 0; transition: opacity .22s ease;
      }
      .region-modal-backdrop.is-open{ opacity: 1; }
      .region-modal-card{
        position: relative;
        width: 100%; max-width: 560px;
        max-height: calc(100vh - 32px);
        overflow-y: auto;
        background: linear-gradient(180deg, #0F1F3F 0%, #06112A 100%);
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,0.10);
        box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(242,101,34,0.18);
        color: #fff;
        font-family: Inter, system-ui, sans-serif;
        transform: translateY(12px) scale(0.98);
        transition: transform .26s cubic-bezier(0.2,0.7,0.2,1);
      }
      .region-modal-backdrop.is-open .region-modal-card{
        transform: translateY(0) scale(1);
      }
      .region-modal-close{
        position: absolute; top: 14px; right: 14px;
        width: 34px; height: 34px; border-radius: 50%;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        color: #fff; cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s ease, transform .15s ease;
      }
      .region-modal-close:hover{ background: rgba(242,101,34,0.30); transform: rotate(90deg); }
      .region-modal-header{
        padding: 28px 28px 18px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .region-modal-num{
        display: inline-flex; align-items: center; justify-content: center;
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, #F26522, #C24A18);
        font-family: 'Fraunces', serif; font-weight: 700; font-size: 17px;
        box-shadow: 0 4px 14px rgba(242,101,34,0.45);
        margin-bottom: 10px;
      }
      .region-modal-admin{
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; letter-spacing: 0.30em; text-transform: uppercase;
        color: #FFA45A; margin-bottom: 4px;
      }
      .region-modal-title{
        font-family: 'Fraunces', serif;
        font-size: 1.65rem; font-weight: 600; line-height: 1.1;
        margin: 0 0 6px;
      }
      .region-modal-meta{
        display: flex; gap: 18px; flex-wrap: wrap;
        font-size: 13px; color: rgba(255,255,255,0.72); margin-top: 12px;
      }
      .region-modal-meta strong{ color:#fff; }
      .region-modal-meta i{ color:#FFA45A; margin-right:6px; }

      .region-modal-body{ padding: 18px 28px 8px; }
      .region-modal-section-label{
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
        color: rgba(255,255,255,0.55);
        margin: 8px 0 12px;
      }
      .region-office{
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 10px;
        transition: border-color .15s ease, background .15s ease;
      }
      .region-office:hover{
        border-color: rgba(242,101,34,0.35);
        background: rgba(242,101,34,0.06);
      }
      .region-office-name{
        font-weight: 700; font-size: 13.5px; color: #fff;
        display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
      }
      .region-office-name i{ color: #FFA45A; font-size: 12px; }
      .region-office-addr{
        font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.5;
      }
      .region-office-phone{
        display: inline-flex; align-items: center; gap: 6px;
        margin-top: 6px;
        font-family: 'JetBrains Mono', monospace; font-size: 12px;
        color: #FFA45A; text-decoration: none;
      }
      .region-office-phone:hover{ color: #fff; }

      .region-modal-footer{
        padding: 16px 28px 26px;
        display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .region-modal-btn{
        display: inline-flex; align-items: center; gap: 8px;
        padding: 10px 18px; border-radius: 999px;
        font-size: 12.5px; font-weight: 600;
        text-decoration: none; cursor: pointer;
        transition: transform .15s ease, background .15s ease;
      }
      .region-modal-btn-primary{
        background: linear-gradient(180deg, #F26522, #D44E0F);
        color: #fff;
        box-shadow: 0 6px 18px rgba(242,101,34,0.40);
      }
      .region-modal-btn-primary:hover{ transform: translateY(-1px); }
      .region-modal-btn-ghost{
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.85);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .region-modal-btn-ghost:hover{ background: rgba(255,255,255,0.12); }
      @media (max-width:520px){
        .region-modal-header,
        .region-modal-body,
        .region-modal-footer{ padding-left:20px; padding-right:20px; }
        .region-modal-title{ font-size: 1.4rem; }
      }
    `;
    const st = document.createElement('style');
    st.id = 'region-pill-modal-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // Defense-in-depth: HTML-escape every interpolated value before
  // injecting via innerHTML. The REGION data is currently developer-
  // controlled, but escaping at the sink prevents any future content-
  // management change from introducing stored-XSS.
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  // Constrain a phone number for use in a tel: URI. Only digits, +, -,
  // space, and parentheses are permitted; everything else is dropped.
  function telSafe(s){
    return String(s == null ? '' : s).replace(/[^0-9+\-\s()]/g, '').slice(0, 32);
  }

  function buildModal(num) {
    const r = REGIONS[num];
    if (!r) return null;
    const officesHTML = r.offices.map(o => {
      const firstNum = telSafe((o.phone || '').split(/[\s/]/)[0]);
      const phoneBlock = o.phone
        ? `<a class="region-office-phone" href="tel:+592${firstNum.replace(/-/g,'')}"><i class="fas fa-phone"></i>${esc(o.phone)}</a>`
        : '';
      return `
        <div class="region-office">
          <div class="region-office-name"><i class="fas fa-building"></i>${esc(o.name)}</div>
          <div class="region-office-addr">${esc(o.addr)}</div>
          ${phoneBlock}
        </div>`;
    }).join('');

    const root = document.createElement('div');
    root.className = 'region-modal-backdrop';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', `Region ${num} — ${r.admin}`);
    const safeNum = String(parseInt(num, 10) || 0);
    root.innerHTML = `
      <div class="region-modal-card" role="document">
        <button class="region-modal-close" aria-label="Close">&times;</button>
        <div class="region-modal-header">
          <div class="region-modal-num">${safeNum}</div>
          <div class="region-modal-admin">Administrative Region ${safeNum}</div>
          <h2 class="region-modal-title">${esc(r.admin)}</h2>
          <div class="region-modal-meta">
            <span><i class="fas fa-map-marker-alt"></i><strong>${esc(r.centre)}</strong> &mdash; principal centre</span>
            <span><i class="fas fa-graduation-cap"></i><strong>${esc(r.programmes)}</strong> programmes offered</span>
          </div>
        </div>
        <div class="region-modal-body">
          <div class="region-modal-section-label">${r.offices.length} BIT office${r.offices.length !== 1 ? 's' : ''} in this region</div>
          ${officesHTML}
        </div>
        <div class="region-modal-footer">
          <a href="pages/regional-centres.html#region-${safeNum}" class="region-modal-btn region-modal-btn-ghost">
            <i class="fas fa-arrow-up-right-from-square"></i> Full Regional Page
          </a>
          <a href="#apply" class="region-modal-btn region-modal-btn-primary" data-close-modal="1">
            <i class="fas fa-paper-plane"></i> Apply at this Region
          </a>
        </div>
      </div>
    `;
    return root;
  }

  function closeModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove('is-open');
    setTimeout(() => {
      if (modalRoot && modalRoot.parentNode) {
        modalRoot.parentNode.removeChild(modalRoot);
      }
      modalRoot = null;
      document.body.style.overflow = '';
    }, 240);
  }

  function openModal(num) {
    ensureStyle();
    if (modalRoot) closeModal();
    const root = buildModal(num);
    if (!root) return;
    modalRoot = root;
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';
    // Animation tick
    requestAnimationFrame(() => root.classList.add('is-open'));

    // Close handlers
    root.querySelector('.region-modal-close').addEventListener('click', closeModal);
    root.addEventListener('click', (ev) => {
      if (ev.target === root) closeModal();
      if (ev.target.closest('[data-close-modal="1"]')) closeModal();
    });
    document.addEventListener('keydown', escClose);
  }

  function escClose(ev) {
    if (ev.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escClose);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  PILL WIRING
  // ─────────────────────────────────────────────────────────────
  // The React-rendered pills are absolute-positioned divs inside
  // #network, in DOM-order matching the region array (1..10).
  function wirePills() {
    const network = document.getElementById('network');
    if (!network) return false;
    const pills = network.querySelectorAll('.absolute.left-1\\/2.top-1\\/2.cursor-pointer');
    if (pills.length < 10) return false;

    pills.forEach((p, i) => {
      if (p.dataset.regionWired === '1') return;
      // i 0..9 ↔ region 1..10
      const regionNum = i + 1;
      p.dataset.regionWired = '1';
      // Visual affordance — make it FEEL clickable.
      p.style.cursor = 'pointer';
      p.setAttribute('role', 'button');
      p.setAttribute('tabindex', '0');
      p.setAttribute('aria-label', `View BIT offices in Region ${regionNum}`);
      // Click handler — capture-phase so we beat any React handler
      // that might setState and re-render.
      p.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        openModal(regionNum);
      }, true);
      // Keyboard equivalent
      p.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openModal(regionNum);
        }
      });
    });

    return true;
  }

  function boot(attempts = 80) {
    if (wirePills()) {
      // Watch for React re-renders that swap out the pill nodes.
      const network = document.getElementById('network');
      const mo = new MutationObserver(() => wirePills());
      mo.observe(network, { childList: true, subtree: true });
      console.log('[region-pill-details] 10 region pills clickable — modal ready');
      return;
    }
    if (attempts <= 0) return console.warn('[region-pill-details] no pills found');
    setTimeout(() => boot(attempts - 1), 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot(), { once: true });
  } else {
    boot();
  }
})();
