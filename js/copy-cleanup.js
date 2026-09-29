/* ═══════════════════════════════════════════════════════════════
   Copy Cleanup — homepage tone-down (June 2026)
   ───────────────────────────────────────────────────────────────
   The React bundle hardcodes a few lines of polished hero copy that
   reads as marketing-flavoured / AI-flavoured prose. This wedge
   rewrites them after React mounts so the homepage sounds like an
   institution writing about itself, not a designer writing for
   ad copy.
     • Hero subtitle  — drops the "tradespeople who build Guyana's
                        roads, kitchens, clinics, and code" rhythm
     • Word swap      — drops the "Industry-Ready" / "Future-Ready"
                        buzz words; keeps the rotating display effect
   ═══════════════════════════════════════════════════════════════ */
console.log('[copy-cleanup] file parsed');
(function () {
  'use strict';
  console.log('[copy-cleanup] IIFE entered, readyState=' + document.readyState);

  // The exact source strings (so we match safely and idempotently).
  const OLD_SUBTITLE = /A statutory body of the Ministry of Labour & Manpower Planning\.\s*One hundred and sixteen years of certifying the tradespeople who build Guyana's roads, kitchens, clinics, and code\./;

  const NEW_SUBTITLE = 'Industrial training and trades certification for Guyana. Operating under the Ministry of Labour & Manpower Planning since 1910.';

  // Replacement words for the rotating display effect.
  const OLD_WORDS = ['Industry-Ready', 'Future-Ready'];
  const NEW_WORDS = ['Working', 'Trained'];

  // Workshop-interior scroll captions, hardcoded inside the React bundle.
  // The original five form a poetic "Through the workshop floor / past the
  // welder's torch / under the steel and copper / to a future being made /
  // by Guyanese hands." line — replaced with plainer trade labels.
  const CAPTION_REPLACEMENTS = {
    'Through the workshop floor': 'Welding.',
    "past the welder's torch":    'Electrical.',
    "past the welder’s torch":    'Electrical.',
    'under the steel and copper': 'Plumbing.',
    'to a future being made':     'IT.',
    'by Guyanese hands.':         'Twelve trades. One BIT.',
  };

  // Section-eyebrow labels that read as AI/designer flourish ("§ 02 · Scale
  // of practice"). Replaced with plain phrases a human would write.
  const SECTION_LABEL_REPLACEMENTS = {
    '§ 02 · Scale of practice': 'By the numbers',
    '§ 04 · Footprint':         'Where we operate',
    '§ 05 · Heritage':          'Our history',
    '§ 07 · Verification':      'Verify a certificate',
    '§ 08 · Graduates':         'Stories',
  };

  function rewriteSubtitle() {
    // The hero subtitle is the only <p> with this exact text on the page.
    const ps = document.querySelectorAll('section#top p, header + section p, p.max-w-\\[52ch\\]');
    ps.forEach((p) => {
      if (p.dataset.copyCleaned === '1') return;
      if (OLD_SUBTITLE.test(p.textContent || '')) {
        p.textContent = NEW_SUBTITLE;
        p.dataset.copyCleaned = '1';
      }
    });
  }

  function rewriteWordSwap() {
    // The rotating-word slot lives inside .word-swap > span. React owns the
    // state and re-renders the span, so we just sweep on every mutation and
    // patch the visible text node if it matches one of our targets.
    const slots = document.querySelectorAll('.word-swap > span');
    slots.forEach((s) => {
      const txt = (s.textContent || '').trim();
      const idx = OLD_WORDS.indexOf(txt);
      if (idx !== -1) {
        s.textContent = NEW_WORDS[idx];
      }
    });
  }

  function rewriteScrollCaptions() {
    // Workshop-interior section: spans with data-caption="<at>".
    // We patch their text content idempotently — once swapped, the new
    // text won't match any key, so the loop stops doing work.
    document.querySelectorAll('span[data-caption]').forEach((s) => {
      const t = (s.textContent || '').trim();
      if (Object.prototype.hasOwnProperty.call(CAPTION_REPLACEMENTS, t)) {
        s.textContent = CAPTION_REPLACEMENTS[t];
      }
    });
  }

  function rewriteSectionLabels() {
    // Section eyebrows live in <div class="font-mono ... uppercase ...">.
    // We sweep every monospace-styled text node on the page and swap any
    // that exactly matches one of our known "§ NN · LABEL" strings.
    document.querySelectorAll('div, span').forEach((el) => {
      if (el.children.length) return;       // text node only
      const t = (el.textContent || '').trim();
      if (Object.prototype.hasOwnProperty.call(SECTION_LABEL_REPLACEMENTS, t)) {
        el.textContent = SECTION_LABEL_REPLACEMENTS[t];
      }
    });
  }

  // CSS overrides — dial back the heavy "AI eyebrow" treatment that the
  // bundle uses on its section labels and stat sublabels: monospace +
  // uppercase + 0.32em letter-spacing. The pattern reads as designer/AI
  // flourish. We keep the monospace + uppercase look but pull the
  // letter-spacing back to a normal editorial value.
  function injectEyebrowFix() {
    if (document.getElementById('eyebrow-fix-style')) return;
    const css = `
      /* Heavy-tracked Tailwind utilities used as eyebrow labels in the
         React bundle. We attribute-select on the bracketed arbitrary
         values so we don't depend on a generated class hash. */
      [class*="tracking-[0.40em]"],
      [class*="tracking-[0.4em]"]  { letter-spacing: 0.12em !important; }
      [class*="tracking-[0.32em]"] { letter-spacing: 0.10em !important; }
      [class*="tracking-[0.30em]"] { letter-spacing: 0.10em !important; }
      [class*="tracking-[0.28em]"] { letter-spacing: 0.08em !important; }
      [class*="tracking-[0.24em]"] { letter-spacing: 0.06em !important; }
      [class*="tracking-[0.22em]"] { letter-spacing: 0.06em !important; }
      [class*="tracking-[0.20em]"] { letter-spacing: 0.06em !important; }
      /* Also lighten the dim white/55 colour the eyebrows use so they
         read as real labels, not "AI design accents". */
      [class*="font-mono"][class*="uppercase"][class*="text-white/55"],
      [class*="font-mono"][class*="uppercase"][class*="text-white/50"]{
        color: rgba(255,255,255,0.72) !important;
      }
    `;
    const st = document.createElement('style');
    st.id = 'eyebrow-fix-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function sweep() {
    rewriteSubtitle();
    rewriteWordSwap();
    rewriteScrollCaptions();
    rewriteSectionLabels();
  }

  function boot() {
    injectEyebrowFix();   // CSS overrides — apply ASAP
    sweep();
    const mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    console.log('[copy-cleanup] active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
