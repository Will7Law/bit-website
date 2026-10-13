/* ═══════════════════════════════════════════════════════════════
   Nav Unify — one consistent main nav on the home page
   ───────────────────────────────────────────────────────────────
   Oct-2026, per client: every page shows the SAME nav —
   Home · About · Programmes · Regions · News · Gallery · Contact.

   IMPORTANT: this wedge is APPEND-ONLY. It never removes the bundle's
   own nav nodes — doing so makes React re-add them and loops forever
   (that froze the home page). Instead it HIDES the bundle's
   section-anchor pills with CSS and appends the canonical page links.
   A debounced observer re-appends them if React wipes the row.
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

  // Hide the bundle's section-anchor pills (Programmes/Regions/Heritage).
  // CSS only — we never touch React's nodes, so there is no fight/loop.
  var style = document.createElement('style');
  style.id = 'nav-unify-style';
  style.textContent =
    'header nav a[href^="#"]{ display:none !important; }' +
    'header nav a[data-nav-extra]{ display:inline-flex !important; }';
  document.head.appendChild(style);

  function findNav(){
    var pill = document.querySelector(
      'header nav a[href^="#"], header nav a[data-nav-extra]');
    return pill ? pill.parentElement : null;
  }

  function injectAll(nav){
    if(!nav) return;
    var anchor = nav.querySelector('a');
    var cls = (anchor && anchor.className) || '';
    LINKS.forEach(function(link){
      if(nav.querySelector('a[data-nav-extra="' + link.label.toLowerCase() + '"]')) return;
      var a = document.createElement('a');
      a.href = link.href;
      a.className = cls;
      a.setAttribute('data-hover', '');
      a.setAttribute('data-nav-extra', link.label.toLowerCase());
      a.textContent = link.label;
      nav.appendChild(a);
    });
  }

  function waitFor(pred, cb, n){
    n = (n === undefined) ? 100 : n;
    var r = pred();
    if(r) return cb(r);
    if(n <= 0) return;
    setTimeout(function(){ waitFor(pred, cb, n - 1); }, 100);
  }

  waitFor(findNav, function(nav){
    injectAll(nav);

    // Debounced, append-only re-injection if React rebuilds the row.
    var pending = null;
    var mo = new MutationObserver(function(){
      if(pending) return;
      pending = setTimeout(function(){
        pending = null;
        injectAll(findNav());
      }, 120);
    });
    var header = document.querySelector('header');
    if(header) mo.observe(header, { childList: true, subtree: true });

    console.log('[nav-extras] home nav unified — Home, About, Programmes, Regions, News, Gallery, Contact');
  });
})();
