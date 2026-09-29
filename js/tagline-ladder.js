/* ═══════════════════════════════════════════════════════════════
   Tagline Ladder — restores the five-line tagline that lived on
   the old 450vh ember-scrub section before it was removed.
   ───────────────────────────────────────────────────────────────
   The phrases ("Welcome to the workshop", "Sixteen trades", etc.)
   were the narrative spine of the old hero scrub. Now that the
   Forge BIT scene has replaced that section, those phrases were
   lost. We bring them back as a clean, type-driven section that
   sits between #top and the next block — no scroll-tied canvas,
   just a pleasant fade-in ladder.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const PHRASES = [
    { kicker: '00', line: 'Welcome to the workshop.' },
    { kicker: '01', line: 'Sixteen trades.' },
    { kicker: '02', line: 'Ten regional centres.' },
    { kicker: '03', line: 'One hundred and sixteen years.' },
    { kicker: '04', line: 'Where Guyana’s future is built.' },
  ];

  function waitFor(predicate, cb, attempts = 100){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[tagline-ladder] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  waitFor(() => document.getElementById('top'), (top) => {
    if(document.getElementById('tagline-ladder')) return;

    // CSS — added once
    const css = `
      #tagline-ladder{
        position: relative; z-index: 1;
        padding: 110px 24px 130px;
        background: linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%);
        overflow: hidden;
      }
      #tagline-ladder::before{
        content: ''; position: absolute; inset: 0;
        background:
          radial-gradient(50% 60% at 12% 18%, rgba(242,101,34,0.12), transparent 70%),
          radial-gradient(40% 50% at 88% 80%, rgba(27,77,142,0.18), transparent 70%);
        pointer-events: none;
      }
      .tl-wrap{ max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }
      .tl-eyebrow{
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase;
        color: rgba(255,255,255,0.55);
        display: flex; align-items: center; gap: 14px;
        margin-bottom: 56px;
      }
      .tl-eyebrow::before{
        content: ''; width: 36px; height: 1px;
        background: rgba(255,255,255,0.30);
      }
      .tl-list{ display: flex; flex-direction: column; gap: 28px; list-style: none; padding: 0; margin: 0; }
      .tl-item{
        display: grid; grid-template-columns: 56px 1fr; align-items: baseline; gap: 24px;
        opacity: 0; transform: translateY(18px);
        transition: opacity 600ms cubic-bezier(0.2, 0, 0, 1), transform 600ms cubic-bezier(0.2, 0, 0, 1);
      }
      .tl-item.visible{ opacity: 1; transform: translateY(0); }
      .tl-num{
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px; letter-spacing: 0.18em;
        color: rgba(242,101,34,0.85);
        padding-top: 14px;
      }
      .tl-line{
        font-family: 'Fraunces', serif;
        font-variation-settings: 'opsz' 144;
        font-weight: 540;
        font-size: clamp(2.2rem, 6vw, 5.4rem);
        line-height: 1.04;
        letter-spacing: -0.02em;
        color: #fff;
        margin: 0;
      }
      .tl-item:nth-child(5) .tl-line em{
        font-style: italic;
        color: var(--orange-2);
        font-variation-settings: 'opsz' 144;
      }
      @media (max-width: 760px){
        #tagline-ladder{ padding: 70px 22px 90px; }
        .tl-eyebrow{ margin-bottom: 36px; }
        .tl-item{ grid-template-columns: 44px 1fr; gap: 16px; }
        .tl-list{ gap: 18px; }
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Build section
    const section = document.createElement('section');
    section.id = 'tagline-ladder';
    section.setAttribute('aria-label', 'BIT in five lines');
    section.innerHTML = `
      <div class="tl-wrap">
        <div class="tl-eyebrow">§ Five lines about the Board</div>
        <ul class="tl-list">
          ${PHRASES.map((p, i) => `
            <li class="tl-item" data-i="${i}">
              <span class="tl-num">${p.kicker}</span>
              <h2 class="tl-line">${i === PHRASES.length - 1
                ? p.line.replace(/built/, '<em>built</em>')
                : p.line}</h2>
            </li>`).join('')}
        </ul>
      </div>
    `;

    // Insert directly after #top so it's the first thing visitors meet
    // after the Forge hero.
    if(top.nextElementSibling){
      top.parentNode.insertBefore(section, top.nextElementSibling);
    } else {
      top.parentNode.appendChild(section);
    }

    // Reveal items as they enter the viewport
    const items = section.querySelectorAll('.tl-item');
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if(e.isIntersecting){
            const idx = parseInt(e.target.getAttribute('data-i') || '0', 10);
            setTimeout(() => e.target.classList.add('visible'), idx * 110);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      items.forEach(el => io.observe(el));
    } else {
      items.forEach(el => el.classList.add('visible'));
    }

    console.log('[tagline-ladder] active — 5 phrases mounted after #top');
  });
})();
