/* ═══════════════════════════════════════════════════════════════
   Nav Unify — one consistent main nav on the home page
   ───────────────────────────────────────────────────────────────
   Oct-2026, per client: every page must show the SAME navigation.
   The inner pages now carry the canonical header (Home · About ·
   Programmes · Regions · News · Gallery · Contact). This wedge makes
   the home page's React nav row match it — the same labels, pointing
   at the same pages — instead of the old section-anchor pills
   (Programmes/Regions/Heritage/Verify/Stories).

   It removes the bundle's #-anchor pills and any prior injections and
   lays down the canonical links in order. A MutationObserver re-applies
   it if React rebuilds the row; a re-entrancy guard stops loops.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const LINKS = [
    { href: 'index.html',                  label: 'Home'       },
    { href: 'pages/about.html',            label: 'About'      },
    { href: 'pages/programmes.html',       label: 'Programmes' },
    { href: 'pages/regional-centres.html', label: 'Regions'    },
    { href: 'pages/news.html',             label: 'News'       },
    { href: 'pages/gallery.html',          label: 'Gallery'    },
    { href: 'pages/contact.html',          label: 'Contact'    },
  ];

  let busy = false;

  function findNav(){
    const pill = document.querySelector(
      'header a[href="#programmes"], header a[href="#regions"], ' +
      'header a[href="#heritage"], header a[data-nav-extra]');
    return pill ? pill.parentElement : null;
  }

  function rebuild(){
    const nav = findNav();
    if(!nav || busy) return;
    busy = true;
    const anchor = nav.querySelector('a');
    const cls = (anchor && anchor.className) || '';
    // strip the bundle's section-anchor pills + any previous injection
    Array.from(nav.querySelectorAll('a')).forEach(a => {
      const h = a.getAttribute('href') || '';
      if(h.charAt(0) === '#' || a.hasAttribute('data-nav-extra')) a.remove();
    });
    // lay down the canonical links in order
    LINKS.forEach(({ href, label }) => {
      const present = Array.from(nav.querySelectorAll('a'))
        .some(a => (a.getAttribute('href') || '') === href);
      if(present) return;
      const a = document.createElement('a');
      a.href = href;
      a.className = cls;
      a.setAttribute('data-hover', '');
      a.setAttribute('data-nav-extra', label.toLowerCase());
      a.textContent = label;
      nav.appendChild(a);
    });
    busy = false;
  }

  function waitFor(pred, cb, n){
    n = (n === undefined) ? 100 : n;
    if(pred()) return cb();
    if(n <= 0) return;
    setTimeout(() => waitFor(pred, cb, n - 1), 100);
  }

  waitFor(findNav, () => {
    rebuild();
    const header = document.querySelector('header');
    if(header){
      const mo = new MutationObserver(() => { if(!busy) rebuild(); });
      mo.observe(header, { childList: true, subtree: true });
    }
    console.log('[nav-extras] home nav unified — Home, About, Programmes, Regions, News, Gallery, Contact');
  });
})();
