/* Extracted from pages/faq.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
function filterFAQs(query) {
    const items = document.querySelectorAll('.accordion-item');
    const q = query.toLowerCase();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  }
