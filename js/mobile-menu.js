/* ═══════════════════════════════════════════════════════════════
   Mobile Menu — hamburger button + slide-down drawer for the
   v2 home navigation. The bundled React nav was designed for
   desktop (5+ pills + Apply CTA in a row); on phone screens the
   pills overflow or get clipped by the BIT logo + Apply pill.

   This wedge:
     1. Hides the desktop nav links on screens ≤ 640px
     2. Adds a hamburger ☰ button in the nav (between logo and Apply)
     3. Tap → fullscreen overlay with all links + close button
     4. Tap a link or anywhere on backdrop → close
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function waitFor(predicate, cb, attempts = 80){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[mobile-menu] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // The nav row contains the logo, the link group, and the apply CTA.
  // We DON'T inject the hamburger into the nav row because React re-renders
  // it and strips child nodes. Instead, the button is mounted directly under
  // <body> as a position:fixed pill, so it survives every React render.
  function findHeader(){
    return document.querySelector('header');
  }

  waitFor(findHeader, (header) => {
    if(document.body.dataset.mobileMenuBound) return;
    document.body.dataset.mobileMenuBound = '1';

    // CSS — only kicks in on small screens
    const css = `
      @media (max-width: 760px){
        /* Hide the desktop link group on mobile — but ONLY the inline <nav>
           element, NOT its parent glass pill (which holds the BIT logo).
           Earlier selector used :has(a[href="#programmes"]) which bubbled
           up and hid the whole header pill, taking the BIT logo with it. */
        header nav.main-nav-desktop,
        header nav.hidden.lg\\:flex,
        header nav[class*="lg:flex"]{
          display: none !important;
        }
        /* Compact the apply pill on mobile */
        header a[href="#apply"]{
          padding: 8px 12px !important;
          font-size: 11.5px !important;
        }
      }
      .mm-toggle{
        display: none;
        position: fixed;
        top: 22px;
        right: 18px;
        z-index: 100;
        background: rgba(10, 21, 48, 0.78);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.14);
        color: #fff;
        width: 44px; height: 44px;
        border-radius: 999px;
        cursor: pointer;
        align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: background-color .2s ease, transform .2s ease;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      .mm-toggle:hover, .mm-toggle:focus{
        background: rgba(242,101,34,0.20);
        border-color: rgba(242,101,34,0.5);
        outline: none;
      }
      .mm-toggle:active{ transform: scale(0.95); }
      .mm-toggle svg{ width: 20px; height: 20px; }
      @media (max-width: 760px){
        .mm-toggle{ display: inline-flex; }
        /* Hide the inline desktop nav link group so the hamburger replaces it */
        header nav.hidden.lg\:flex,
        header nav[class*="lg:flex"]{ display: none !important; }
        /* Compact the apply CTA to make room next to the hamburger */
        header a[href="#apply"]{
          padding: 8px 14px !important;
          font-size: 12px !important;
        }
      }
      .mm-overlay{
        position: fixed; inset: 0; z-index: 95;
        background: rgba(6, 17, 42, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s cubic-bezier(0.2, 0, 0, 1);
        display: flex; flex-direction: column;
        padding-top: 90px;
      }
      .mm-overlay.open{ opacity: 1; pointer-events: auto; }
      .mm-list{
        list-style: none; padding: 0 24px; margin: 0;
        display: flex; flex-direction: column; gap: 4px;
      }
      .mm-list li{
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.4s cubic-bezier(0.2, 0, 0, 1), transform 0.4s cubic-bezier(0.2, 0, 0, 1);
      }
      .mm-overlay.open .mm-list li{
        opacity: 1; transform: translateY(0);
      }
      .mm-overlay.open .mm-list li:nth-child(1){ transition-delay: 0.05s; }
      .mm-overlay.open .mm-list li:nth-child(2){ transition-delay: 0.10s; }
      .mm-overlay.open .mm-list li:nth-child(3){ transition-delay: 0.15s; }
      .mm-overlay.open .mm-list li:nth-child(4){ transition-delay: 0.20s; }
      .mm-overlay.open .mm-list li:nth-child(5){ transition-delay: 0.25s; }
      .mm-overlay.open .mm-list li:nth-child(6){ transition-delay: 0.30s; }
      .mm-overlay.open .mm-list li:nth-child(7){ transition-delay: 0.35s; }
      .mm-overlay.open .mm-list li:nth-child(8){ transition-delay: 0.40s; }

      .mm-link{
        display: flex; align-items: center; justify-content: space-between;
        padding: 22px 18px; border-radius: 14px;
        color: #fff; text-decoration: none;
        font-family: Fraunces, serif; font-weight: 540;
        font-size: 28px; letter-spacing: -0.01em;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        transition: background-color .2s, border-color .2s, transform .2s;
      }
      .mm-link:hover, .mm-link:focus{
        background: rgba(242,101,34,0.10);
        border-color: rgba(242,101,34,0.3);
        outline: none;
      }
      .mm-link:active{ transform: scale(0.98); }
      .mm-link-num{
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; letter-spacing: 0.28em;
        color: rgba(255,255,255,0.4);
      }
      .mm-cta{
        margin: 24px 24px 30px;
        padding: 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #F26522, #FFA45A);
        color: #0a0a0a;
        text-decoration: none;
        text-align: center;
        font-weight: 600; font-size: 16px;
        display: block;
      }
      .mm-footer{
        margin-top: auto; padding: 24px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
        color: rgba(255,255,255,0.4);
        text-align: center;
        line-height: 1.7;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Build the hamburger button
    const btn = document.createElement('button');
    btn.className = 'mm-toggle';
    btn.setAttribute('aria-label', 'Open navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

    // Mount as a body-level fixed pill — React can't touch it here.
    document.body.appendChild(btn);

    // Build the overlay
    const overlay = document.createElement('nav');
    overlay.className = 'mm-overlay';
    overlay.setAttribute('aria-label', 'Site navigation');
    const links = [
      { href: 'pages/about.html',      label: 'About',      num: '01' },
      { href: '#programmes',           label: 'Programmes', num: '02' },
      { href: '#regions',              label: 'Regions',    num: '03' },
      { href: '#heritage',             label: 'Heritage',   num: '04' },
      { href: '#verify',               label: 'Verify',     num: '05' },
      { href: '#stories',              label: 'Stories',    num: '06' },
      { href: 'pages/v2-news.html',    label: 'News',       num: '07' },
      { href: 'pages/v2-gallery.html', label: 'Gallery',    num: '08' },
      { href: 'pages/contact.html',    label: 'Contact',    num: '09' },
    ];
    overlay.innerHTML = `
      <ul class="mm-list">
        ${links.map(l => `
          <li><a class="mm-link" href="${l.href}">
            <span>${l.label}</span>
            <span class="mm-link-num">${l.num}</span>
          </a></li>
        `).join('')}
      </ul>
      <a class="mm-cta" href="https://labour.gov.gy/" target="_blank" rel="noopener">Ministry of Labour →</a>
      <div class="mm-footer">
        +592 225-1077 · info@bit.gov.gy<br>
        82 Brickdam, Georgetown
      </div>
    `;
    document.body.appendChild(overlay);

    // ─── Always-visible mobile nav bar (review-1 feedback) ─────────
    // Replaces the hamburger-drawer pattern. A horizontally-scrollable
    // sticky bar sits just below the existing nav on phone screens so
    // ALL section links are visible at a glance — no tap-to-reveal.
    const barCSS = `
      .mm-bar{
        display: none;
        position: fixed;
        top: 78px; left: 12px; right: 12px;
        z-index: 95;
        padding: 8px 10px;
        background: rgba(10, 21, 48, 0.78);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 999px;
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        scrollbar-width: none;
      }
      .mm-bar::-webkit-scrollbar{ display: none; }
      .mm-bar a{
        display: inline-block;
        padding: 7px 14px;
        margin-right: 4px;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.85);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-decoration: none;
        transition: background-color .15s, color .15s;
      }
      .mm-bar a:hover, .mm-bar a:focus-visible{
        background: rgba(242, 101, 34, 0.20);
        color: #FFA45A;
        outline: none;
      }
      .mm-bar a:last-child{ margin-right: 0; }
      @media (max-width: 760px){
        .mm-bar{ display: block; }
        /* Hide the hamburger; the bar replaces it */
        .mm-toggle{ display: none !important; }
        /* Push the page content down so the bar doesn't overlap the hero text */
        main, body{ padding-top: 0; }
        section#top{ padding-top: 60px; }
      }
    `;
    const barStyle = document.createElement('style');
    barStyle.textContent = barCSS;
    document.head.appendChild(barStyle);

    const bar = document.createElement('nav');
    bar.className = 'mm-bar';
    bar.setAttribute('aria-label', 'Quick navigation');
    bar.innerHTML = links.map(l => `<a href="${l.href}">${l.label}</a>`).join('') +
                    `<a href="https://labour.gov.gy/" target="_blank" rel="noopener" style="color:#FFA45A;">Ministry of Labour ↗</a>`;
    document.body.appendChild(bar);

    function open(){
      overlay.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close(){
      overlay.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => {
      if(overlay.classList.contains('open')) close(); else open();
    });
    overlay.querySelectorAll('.mm-link, .mm-cta').forEach(link => {
      link.addEventListener('click', () => setTimeout(close, 100));
    });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && overlay.classList.contains('open')) close();
    });

    console.log('[mobile-menu] hamburger active on screens ≤ 760px');
  });
})();
