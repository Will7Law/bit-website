/* Extracted from pages/v2-gallery.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
// Filter pills — instant client-side filter
  (function(){
    const pills = document.querySelectorAll('.filter-pill');
    const tiles = document.querySelectorAll('.tile');
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      const f = p.getAttribute('data-filter');
      tiles.forEach(t => {
        if(f === 'all' || t.getAttribute('data-cat') === f){
          t.classList.remove('hidden');
        } else {
          t.classList.add('hidden');
        }
      });
    }));
  })();
