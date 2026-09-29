/* ═══════════════════════════════════════════════════════════════
   Nav Extras — adds About, Contact, News, Gallery to the nav
   ───────────────────────────────────────────────────────────────
   The React bundle hardcodes only 5 nav pills (Programmes, Regions,
   Heritage, Verify, Stories). About + Contact + News + Gallery are
   appended via this wedge after React mounts, so visitors always
   see them no matter where they are on the page.

   The wedge is idempotent + observer-backed: if React re-renders
   the nav row (which strips our additions), we re-inject. That way
   the four extra links never disappear.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // Link list — order matters (left → right in the nav)
  const LINKS = [
    { href: 'pages/about.html',      label: 'About'   },
    { href: 'pages/v2-news.html',    label: 'News'    },
    { href: 'pages/v2-gallery.html', label: 'Gallery' },
    { href: 'pages/contact.html',    label: 'Contact' },
  ];

  function waitFor(predicate, cb, attempts = 80){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[nav-extras] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // Find the nav links container — the parent of the existing nav pills
  function findNavContainer(){
    const stories = document.querySelector('header a[href="#stories"]');
    return stories ? stories.parentElement : null;
  }

  function injectAll(nav){
    if(!nav) return;
    const sibling = nav.querySelector('a[href="#stories"]');
    const cls = sibling?.className || '';

    LINKS.forEach(({ href, label }) => {
      // Only inject if not already present (idempotent across re-renders)
      const existing = Array.from(nav.querySelectorAll('a')).find(a =>
        a.getAttribute('href') === href ||
        a.textContent.trim().toLowerCase() === label.toLowerCase()
      );
      if(existing) return;

      const a = document.createElement('a');
      a.href = href;
      a.className = cls;
      a.setAttribute('data-hover', '');
      a.setAttribute('data-nav-extra', label.toLowerCase());
      a.textContent = label;
      nav.appendChild(a);
    });
  }

  waitFor(findNavContainer, (nav) => {
    injectAll(nav);

    // Re-inject on every React reconciliation that touches the nav row.
    const mo = new MutationObserver(() => {
      // Re-resolve nav in case React rebuilt the entire row
      const current = findNavContainer();
      if(current){
        // Ensure the missing ones get re-added (idempotent)
        injectAll(current);
      }
    });
    const observeTarget = nav.parentElement || document.querySelector('header') || document.body;
    mo.observe(observeTarget, { childList: true, subtree: true });

    console.log('[nav-extras] About, News, Gallery, Contact links wired to nav');
  });
})();
