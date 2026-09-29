/* ═══════════════════════════════════════════════════════════════
   BIT Logo Injection
   ───────────────────────────────────────────────────────────────
   The site previously rendered the brand as a Fraunces wordmark
   "BIT" in the nav. The actual institutional logo (orange shield
   with "BIT" + hammer/anvil icon) lives at /images/bit-logo.png
   but was never used. This wedge prepends it to the nav logo link
   so visitors see the official institutional mark.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const LOGO_SRC = '/images/bit-logo.png';

  function waitFor(predicate, cb, attempts = 80){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[bit-logo] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // The nav logo link contains "BIT" + the Roman numeral MCMX (1910)
  function findNavLogoAnchor(){
    const links = Array.from(document.querySelectorAll('header a, nav a'));
    for(const a of links){
      const text = (a.textContent || '').trim();
      // Text appears as "BITEST · MCMX" (BIT + EST run together in text node)
      if(/MCMX/.test(text) && a.getAttribute('href') === '#top'){
        return a;
      }
    }
    return null;
  }

  function findFooterWordmark(){
    // The footer has a colossal "BIT" Fraunces watermark — we leave that.
    // Instead we look for a smaller footer logo location: the "Contact"
    // column. We just return the footer for inserting an image.
    return document.querySelector('footer');
  }

  // CSS rules added once. They use !important so React re-renders
  // can't accidentally clobber the BIT mark.
  // Every BIT logo on the site is rendered as a circular badge for
  // brand consistency — reviewer feedback in May 2026.
  if(!document.getElementById('bit-logo-style')){
    const css = `
      img.bit-logo-mark,
      img.bit-logo-mark-footer{
        object-fit: contain !important;
        display: inline-block !important;
        flex-shrink: 0 !important;
        background: #ffffff !important;
        border-radius: 50% !important;
        padding: 3px !important;
        box-shadow: 0 4px 14px rgba(0,0,0,0.20), 0 0 0 1px rgba(242,101,34,0.18) !important;
      }
      /* May-2026: shrunk from 44px → 38px so the logo block stops crowding
         the menu items inside the floating pill. The round logo is still
         clearly the BIT shield, just visually balanced with the wordmark. */
      img.bit-logo-mark{ height: 38px !important; width: 38px !important; padding: 2px !important; }
      img.bit-logo-mark-footer{ height: 52px !important; width: 52px !important; }
      /* Catch-all: any <img> pointing at the BIT logo file gets the
         circular badge treatment, no matter where it lives. */
      img[src$="bit-logo.png"]{ border-radius: 50% !important; background: #ffffff !important; padding: 3px; }
      header a[href="#top"]{
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        flex-shrink: 0 !important;       /* logo block never pushes into nav */
        min-width: 0 !important;
      }
      /* ─────────────────────────────────────────────────────────────
         Anti-overlap guarantees for the floating pill nav. Every child
         of the pill must:
           • never wrap text mid-word ("Programmes" stays whole)
           • respect its siblings (no negative margins, no overlap)
           • shrink gracefully when the pill is narrow
         These rules apply to whatever React renders and whatever the
         nav-extras wedge appends, today and tomorrow.
         ───────────────────────────────────────────────────────────── */
      header > div > div{                  /* the .glass pill */
        gap: 18px !important;              /* solid gap between logo / nav / CTA */
        column-gap: 18px !important;
        flex-wrap: nowrap !important;
      }
      header nav a{
        white-space: nowrap !important;    /* link labels never wrap */
        flex-shrink: 0 !important;         /* labels stay full-size */
      }
      header nav{
        flex-wrap: nowrap !important;
        gap: 4px !important;
        min-width: 0 !important;
      }
      /* Raise the pill's max-width on wide screens so 9 nav links + logo
         + Apply CTA all fit on one row with breathing room. */
      @media (min-width: 1280px){
        header > div{ max-width: 1440px !important; }
      }
      @media (min-width: 1600px){
        header > div{ max-width: 1560px !important; }
      }
      /* Tighter padding on each nav pill so all 9 items fit without
         needing to overlap the logo. */
      header nav a[data-hover]{
        padding-left: 11px !important;
        padding-right: 11px !important;
      }
      /* Hide the "EST · MCMX" monospace tagline next to the BIT logo.
         The Roman-numeral + heavy-tracking treatment reads as AI design
         flourish — the round logo + "BIT" wordmark are enough.
         Targets the two spans React emits after the "BIT" wordmark:
           • the vertical divider (w-px h-5 bg-white/15)
           • the small-caps "EST · MCMX" text                           */
      header a[href="#top"] span.hidden.sm\\:block{ display: none !important; }
    `;
    const style = document.createElement('style');
    style.id = 'bit-logo-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  waitFor(findNavLogoAnchor, (anchor) => {
    // Already injected?
    if(anchor.querySelector('img.bit-logo-mark')) return;

    const img = document.createElement('img');
    img.src = LOGO_SRC;
    img.alt = 'BIT — Board of Industrial Training official logo';
    img.className = 'bit-logo-mark';
    img.decoding = 'async';
    img.loading = 'eager';

    // Insert as the FIRST child of the link, before the wordmark text
    anchor.insertBefore(img, anchor.firstChild);

    // ─────────────────────────────────────────────────────────────
    // (Previously we injected a "Board of / Industrial Training"
    //  stacked caption here. It pushed the logo block too wide and
    //  caused the menu items to overlap on common laptop widths
    //  (1366–1440px). Removed May 2026. The round logo + the BIT
    //  wordmark already communicate the institution; the full name
    //  still appears in the top bar of inner pages and in the footer.)
    // ─────────────────────────────────────────────────────────────
    // Also remove any previously injected caption that React may
    // have reconciled back in from cache.
    const old = anchor.querySelector('.bit-logo-caption');
    if(old) old.remove();

    // Make sure parent is flex with gap so the logo + text align
    anchor.style.display = 'flex';
    anchor.style.alignItems = 'center';
    anchor.style.gap = '8px';
    anchor.style.flexShrink = '0';

    console.log('[bit-logo] injected into nav');

    // ─── Survive React re-renders ──────────────────────────────
    // React's reconciler can wipe our img out when it reorders or
    // rebuilds the anchor. We watch the anchor's parent and re-inject
    // whenever the img is missing. Idempotent — see the early-out above.
    const watchTarget = anchor.parentElement || document.body;
    const ro = new MutationObserver(() => {
      const stillThere = anchor.querySelector('img.bit-logo-mark');
      if(!stillThere && document.body.contains(anchor)){
        const replacement = document.createElement('img');
        replacement.src = LOGO_SRC;
        replacement.alt = 'BIT — Board of Industrial Training official logo';
        replacement.className = 'bit-logo-mark';
        replacement.decoding = 'async';
        replacement.loading = 'eager';
        anchor.insertBefore(replacement, anchor.firstChild);
      }
    });
    ro.observe(watchTarget, { childList: true, subtree: true });
  });

  // Also inject a footer copy
  waitFor(findFooterWordmark, (footer) => {
    if(footer.querySelector('img.bit-logo-mark-footer')) return;
    // Find the footer brand block — first column under the grid
    const firstCol = footer.querySelector('.grid > div:first-child') ||
                     footer.querySelector(':scope > div:first-child > div:first-child') ||
                     footer.firstElementChild;
    if(!firstCol) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:14px;margin-bottom:18px;';
    const img = document.createElement('img');
    img.src = LOGO_SRC;
    img.alt = 'BIT — Board of Industrial Training';
    img.className = 'bit-logo-mark-footer';
    img.decoding = 'async';
    img.style.cssText = 'height:46px;width:auto;flex-shrink:0;';
    wrapper.appendChild(img);
    const txt = document.createElement('div');
    txt.style.cssText = 'font-family:Fraunces,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,.55);line-height:1.4;';
    txt.innerHTML = 'BOARD OF<br/>INDUSTRIAL TRAINING';
    wrapper.appendChild(txt);

    firstCol.insertBefore(wrapper, firstCol.firstChild);
    console.log('[bit-logo] injected into footer');
  });
})();
