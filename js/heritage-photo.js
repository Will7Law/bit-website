/* ═══════════════════════════════════════════════════════════════
   Heritage chapter — swap 2025 Berbice video for the real photo
   ───────────────────────────────────────────────────────────────
   The React bundle renders the Heritage timeline as a row of chapter
   cards, each backed by an MP4 loop (era-1910 → era-2025). The
   2025/Berbice card uses a CGI render that reads as AI-generated
   architecture. Now that we have the real Berbice Training Centre
   photograph (gallery-04-modern-facility.jpg) we replace just that
   one video with the actual photo — every other chapter still uses
   its existing era video.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TARGET_SRC_FRAGMENT = 'era-2025';
  const REPLACEMENT_IMG_SRC = '/images/gallery/gallery-04-modern-facility.jpg?v=2';
  const REPLACEMENT_ALT     = 'The BIT Berbice training centre — modern grey-and-orange exterior, daylight, with Board of Industrial Training signage.';

  function swap(video) {
    if (video.dataset.berbicePhotoSwapped === '1') return;
    if ((video.getAttribute('src') || '').indexOf(TARGET_SRC_FRAGMENT) === -1) return;

    const img = document.createElement('img');
    img.src = REPLACEMENT_IMG_SRC;
    img.alt = REPLACEMENT_ALT;
    img.loading = 'lazy';
    img.decoding = 'async';
    // Preserve the existing video's positioning / opacity / object-fit
    // so the chapter card's gradient overlay still sits cleanly on top.
    img.className = video.className;
    img.style.cssText = video.style.cssText + ';object-fit:cover;display:block;';
    img.dataset.berbicePhotoSwapped = '1';

    video.replaceWith(img);
  }

  function sweep() {
    document.querySelectorAll('video[src*="' + TARGET_SRC_FRAGMENT + '"]').forEach(swap);
  }

  function boot() {
    sweep();
    // React mounts the heritage section lazily on first scroll near it.
    // Watch the body for new chapter cards being added.
    const mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('video[src*="' + TARGET_SRC_FRAGMENT + '"]')) {
            swap(n);
          } else if (n.querySelectorAll) {
            n.querySelectorAll('video[src*="' + TARGET_SRC_FRAGMENT + '"]').forEach(swap);
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    console.log('[heritage-photo] Berbice chapter ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
