/* ═══════════════════════════════════════════════════════════════
   Sectors & Occupational Areas — homepage wedge (May 2026)
   ───────────────────────────────────────────────────────────────
   Injects a "Sectors & Occupational Areas" section before the
   footer. Data sourced from BIT website Info.docx Table 1.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const SECTORS = [
    {
      name: 'Agriculture',
      icon: 'fas fa-seedling',
      colour: '#2e7d32',
      programmes: [
        'Sustainable Farming',
        'Agro-processing',
        'Tractor Operator',
        'Small Engine Repair',
        'Boat Building',
      ],
    },
    {
      name: 'Construction',
      icon: 'fas fa-hard-hat',
      colour: '#bf360c',
      programmes: [
        'Building Construction',
        'Masonry',
        'Electrical Installation',
        'Plumbing',
        'Carpentry / Furniture / Joinery',
        'Welding & Fabrication',
        'Metal Work Engineering',
        'AutoCAD',
        'OSH',
      ],
    },
    {
      name: 'Oil & Gas',
      icon: 'fas fa-oil-well',
      colour: '#37474f',
      programmes: [
        'Welding',
        'Electrical',
        'Heavy Duty Equipment Operation',
        'Heavy Duty Mechanic',
        'Automotive Trades',
        'AC & Refrigeration',
        'Fibre Optics',
        'Solar PV',
        'IT / Data',
        'OSH',
        'Boat Building',
      ],
    },
    {
      name: 'Manufacturing / Industrial Trades',
      icon: 'fas fa-industry',
      colour: '#0277bd',
      programmes: [
        'Fitting & Machining',
        'Metal Work Engineering',
        'Welding',
        'PV Systems',
        'Furniture Making',
      ],
    },
    {
      name: 'ICT & Digital Services',
      icon: 'fas fa-laptop-code',
      colour: '#6a1b9a',
      programmes: [
        'Information Technology',
        'Data Operations',
        'Computer Maintenance & Repair',
        'JAWS / ICT',
        'Customer Service',
      ],
    },
    {
      name: 'Hospitality & Tourism',
      icon: 'fas fa-utensils',
      colour: '#c62828',
      programmes: [
        'Commercial Food Preparation',
        'Hospitality',
        'Cosmetology',
        'Aesthetics',
        'Interior Decoration',
      ],
    },
    {
      name: 'Automotive & Transportation',
      icon: 'fas fa-car',
      colour: '#1565c0',
      programmes: [
        'Motor Vehicle Servicing & Repairs',
        'Automotive Electrician',
        'Auto Body Repair',
        'HD Mechanic',
        'HD Equipment Operator',
        'Tractor Operation',
      ],
    },
    {
      name: 'Social Services / Office Administration',
      icon: 'fas fa-briefcase',
      colour: '#4527a0',
      programmes: [
        'Psychology',
        'Social Work',
        'Organizational Management',
        'Supervisory Management',
        'General Office Administration',
      ],
    },
    {
      name: 'Creative / Craft Industries',
      icon: 'fas fa-palette',
      colour: '#ad1457',
      programmes: [
        'Craft Production',
        'Interior Decoration',
      ],
    },
  ];

  function buildSection() {
    const cardsHTML = SECTORS.map(s => `
      <div style="background:#fff;border-radius:14px;box-shadow:0 2px 18px rgba(0,0,0,0.08);overflow:hidden;display:flex;flex-direction:column;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.14)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 18px rgba(0,0,0,0.08)'">
        <div style="background:${s.colour};padding:20px 22px;display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="${s.icon}" style="color:#fff;font-size:18px;"></i>
          </div>
          <h3 style="color:#fff;font-size:0.95rem;font-weight:700;margin:0;line-height:1.3;">${s.name}</h3>
        </div>
        <ul style="list-style:none;margin:0;padding:12px 18px 16px;flex:1;">
          ${s.programmes.map(p => `
            <li style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:0.875rem;color:#374151;">
              <i class="fas fa-check-circle" style="color:${s.colour};font-size:11px;flex-shrink:0;margin-top:2px;"></i>
              <span>${p}</span>
            </li>
          `).join('')}
        </ul>
        <div style="padding:8px 18px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <span style="font-size:0.78rem;color:#6b7280;font-weight:600;">${s.programmes.length} occupational area${s.programmes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    `).join('');

    const sec = document.createElement('section');
    sec.id = 'sectors-occupational-areas';
    sec.setAttribute('aria-label', 'Sectors and Occupational Areas');
    sec.style.cssText = 'padding:80px 0;background:#f8fafc;border-top:3px solid #1B4D8E;';
    sec.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
        <div style="text-align:center;margin-bottom:48px;">
          <span style="display:inline-block;font-size:0.72rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#F26522;margin-bottom:10px;">Training Catalogue</span>
          <h2 style="font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;color:#1B4D8E;margin:0 0 14px;">Sectors &amp; Occupational Areas</h2>
          <div style="width:60px;height:4px;background:linear-gradient(90deg,#1B4D8E,#F26522);border-radius:2px;margin:0 auto 16px;"></div>
          <p style="color:#6b7280;max-width:600px;margin:0 auto;font-size:1rem;line-height:1.65;">BIT offers certified training across <strong>9 industry sectors</strong> — encompassing 40+ occupational areas from trades and technology to hospitality, agriculture, and the creative industries.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:22px;">
          ${cardsHTML}
        </div>
        <div style="text-align:center;margin-top:48px;">
          <a href="pages/programmes.html" style="display:inline-flex;align-items:center;gap:10px;background:#1B4D8E;color:#fff;font-weight:700;padding:14px 34px;border-radius:8px;text-decoration:none;font-size:0.95rem;transition:background 0.2s;" onmouseover="this.style.background='#163d72'" onmouseout="this.style.background='#1B4D8E'">
            <i class="fas fa-graduation-cap"></i> View All Programmes &amp; Apply
          </a>
        </div>
      </div>
    `;
    return sec;
  }

  function inject() {
    if (document.getElementById('sectors-occupational-areas')) return;
    const footer = document.querySelector('footer.footer');
    if (!footer) return;
    footer.parentNode.insertBefore(buildSection(), footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Handle React late-mount
  const obs = new MutationObserver(function () {
    if (!document.getElementById('sectors-occupational-areas')) inject();
  });
  obs.observe(document.body, { childList: true, subtree: false });
  setTimeout(function () { obs.disconnect(); inject(); }, 5000);
})();
