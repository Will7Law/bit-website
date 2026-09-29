/* Extracted from pages/gallery.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
/* ─────────────────────────────────────────────────────────────
     Gallery — filter + lightbox
     ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // ─── 1. Filter pills ─────────────────────────────────────
    const filters = document.querySelectorAll('.gallery-filter');
    const items   = Array.from(document.querySelectorAll('.gallery-item'));
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        items.forEach(item => {
          if (cat === 'all' || item.dataset.category === cat) {
            item.style.display = '';
            item.style.animation = 'fadeIn 0.4s ease';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // ─── 2. Lightbox ─────────────────────────────────────────
    // Build the lightbox shell once. Photos are pulled from each
    // .gallery-item's <img> + caption when opened.
    const backdrop = document.createElement('div');
    backdrop.className = 'lb-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Photo viewer');
    backdrop.innerHTML = ''
      + '<div class="lb-stage">'
      +   '<img class="lb-img" alt="">'
      +   '<div class="lb-cap"></div>'
      +   '<div class="lb-count" aria-live="polite"></div>'
      +   '<button class="lb-prev lb-btn" type="button" aria-label="Previous photo">'
      +     '<svg class="lb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
      +   '</button>'
      +   '<button class="lb-next lb-btn" type="button" aria-label="Next photo">'
      +     '<svg class="lb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
      +   '</button>'
      +   '<button class="lb-close" type="button" aria-label="Close photo viewer">'
      +     '<svg class="lb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      +   '</button>'
      + '</div>';
    document.body.appendChild(backdrop);
    const imgEl   = backdrop.querySelector('.lb-img');
    const capEl   = backdrop.querySelector('.lb-cap');
    const countEl = backdrop.querySelector('.lb-count');
    const prevBtn = backdrop.querySelector('.lb-prev');
    const nextBtn = backdrop.querySelector('.lb-next');
    const closeBtn= backdrop.querySelector('.lb-close');
    let idx = 0;
    let visible = [];   // photos shown by current filter
    let lastFocus = null;

    function refreshVisible(){
      visible = items.filter(it => it.style.display !== 'none');
    }
    function render(){
      if (!visible.length) return;
      const it = visible[idx];
      const img = it.querySelector('img');
      const cap = it.querySelector('.gallery-item-caption');
      imgEl.src = img.getAttribute('src');
      imgEl.alt = img.getAttribute('alt') || '';
      capEl.innerHTML = cap ? cap.innerHTML : '';
      countEl.textContent = (idx + 1) + ' / ' + visible.length;
      prevBtn.style.visibility = visible.length > 1 ? 'visible' : 'hidden';
      nextBtn.style.visibility = visible.length > 1 ? 'visible' : 'hidden';
    }
    function open(at){
      refreshVisible();
      if (!visible.length) return;
      idx = ((at % visible.length) + visible.length) % visible.length;
      lastFocus = document.activeElement;
      render();
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close(){
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      imgEl.src = ''; // free memory
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch(_){} }
    }
    function step(d){
      if (!visible.length) return;
      idx = ((idx + d) % visible.length + visible.length) % visible.length;
      render();
    }

    // Wire each tile to open the lightbox
    items.forEach((it, i) => {
      it.setAttribute('role', 'button');
      it.setAttribute('tabindex', '0');
      it.setAttribute('aria-label', 'Open photo: ' + (it.querySelector('strong')?.textContent || ''));
      it.addEventListener('click', () => {
        refreshVisible();
        const at = visible.indexOf(it);
        if (at >= 0) open(at);
      });
      it.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          refreshVisible();
          const at = visible.indexOf(it);
          if (at >= 0) open(at);
        }
      });
    });

    // Backdrop click closes; clicking inside the image/caption does not
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    closeBtn.addEventListener('click', close);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!backdrop.classList.contains('is-open')) return;
      if (e.key === 'Escape')      { close(); }
      else if (e.key === 'ArrowLeft')  { step(-1); }
      else if (e.key === 'ArrowRight') { step(1); }
    });

    // Touch swipe for mobile
    let tx = 0;
    backdrop.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    backdrop.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
  });
