/* ═══════════════════════════════════════════════════════════════
   Delegated event handlers
   ───────────────────────────────────────────────────────────────
   Replaces the inline on*= attributes that previously appeared
   throughout the site. Inline handlers are blocked by a CSP that
   omits 'unsafe-inline', so each one has been rewritten as a
   data-* attribute and is wired here instead.

   NDMA security assessment (10 July 2026), Finding 4:
     "Review the application's reliance on inline scripts and, where
      practicable, migrate inline functionality to external script
      files."

   Mapping:
     onclick="toggleAccordion(this)"          → data-accordion
     onclick="selectProgramme(this,'X')"      → data-programme="X"
     onclick="window.location='URL'"          → data-href="URL"
     onclick="nextStep(N)" / "prevStep(N)"    → data-step-next / data-step-prev
     onclick="submitApplication()"            → data-submit-application
     oninput="filterFAQs(this.value)"         → data-faq-filter
     onmouseover/onmouseout style tweaks      → CSS classes (see styles)

   Uses a single delegated listener on document, so it also covers
   elements injected later by the wedge scripts.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function closestAttr(el, attr) {
    while (el && el !== document) {
      if (el.nodeType === 1 && el.hasAttribute(attr)) return el;
      el = el.parentNode;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var el;

    // Accordions (FAQ, verify, programme pages)
    if ((el = closestAttr(t, 'data-accordion'))) {
      if (typeof window.toggleAccordion === 'function') {
        window.toggleAccordion(el);
      }
      return;
    }

    // Programme picker (apply flow)
    if ((el = closestAttr(t, 'data-programme'))) {
      if (typeof window.selectProgramme === 'function') {
        window.selectProgramme(el, el.getAttribute('data-programme'));
      }
      return;
    }

    // Card-level navigation (programme cards)
    if ((el = closestAttr(t, 'data-href'))) {
      // Let real links inside the card behave normally.
      if (t.closest && t.closest('a')) return;
      window.location = el.getAttribute('data-href');
      return;
    }

    // Multi-step form navigation (apply flow)
    if ((el = closestAttr(t, 'data-step-next'))) {
      if (typeof window.nextStep === 'function') {
        window.nextStep(parseInt(el.getAttribute('data-step-next'), 10));
      }
      return;
    }
    if ((el = closestAttr(t, 'data-step-prev'))) {
      if (typeof window.prevStep === 'function') {
        window.prevStep(parseInt(el.getAttribute('data-step-prev'), 10));
      }
      return;
    }
    if ((el = closestAttr(t, 'data-submit-application'))) {
      if (typeof window.submitApplication === 'function') {
        window.submitApplication();
      }
      return;
    }
  });

  // FAQ live filter
  document.addEventListener('input', function (e) {
    var el = closestAttr(e.target, 'data-faq-filter');
    if (el && typeof window.filterFAQs === 'function') {
      window.filterFAQs(el.value);
    }
  });

  // Keyboard parity for elements that became clickable without being
  // real buttons — Enter/Space should activate them like a button does.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = closestAttr(e.target, 'data-accordion') ||
             closestAttr(e.target, 'data-href') ||
             closestAttr(e.target, 'data-programme');
    if (!el) return;
    if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT') return;
    e.preventDefault();
    el.click();
  });
})();
