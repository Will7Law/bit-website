/* ═══════════════════════════════════════════════════════════════
   Leadership section — CEO Maughn's mandate + 6 strategic priorities
   + the $1.14B reinvested figure + Minister Griffith quote.
   Injected after the Stories section so the institutional authority
   reads BEFORE the partners constellation.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function waitFor(predicate, cb, attempts = 80){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[leadership] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  function findInsertionPoint(){
    // After the Stories section, before Partners
    const partners = Array.from(document.querySelectorAll('h2'))
      .find(h => /trusted across guyana/i.test(h.textContent || ''));
    if(!partners) return null;
    return partners.closest('section');
  }

  waitFor(findInsertionPoint, (partnersSection) => {
    if(document.getElementById('leadership')) return;

    const css = `
      #leadership{
        position: relative;
        padding: clamp(60px, 10vh, 120px) 0;
        background: linear-gradient(180deg, transparent 0%, rgba(14,26,61,0.4) 50%, transparent 100%);
      }
      #leadership .lead-wrap{
        max-width: 1200px; margin: 0 auto; padding: 0 24px;
      }
      #leadership .lead-eyebrow{
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase;
        color: rgba(255,255,255,0.4); margin-bottom: 14px;
      }
      #leadership h2{
        font-family: Fraunces, serif; font-weight: 540;
        font-size: clamp(2rem, 5vw, 4.4rem);
        letter-spacing: -0.02em; line-height: 1.02;
        text-wrap: balance; margin: 0 0 36px;
        color: #fff;
      }
      #leadership h2 em{ font-style: italic; color: #F26522; font-weight: 500; }

      #leadership .lead-grid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-top: 48px;
      }
      @media (max-width: 900px){
        #leadership .lead-grid{ grid-template-columns: 1fr; gap: 32px; }
      }

      #leadership .lead-figure{
        background: rgba(14, 26, 61, 0.62);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px; padding: 32px;
      }
      #leadership .lead-role{
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
        color: #FFA45A; margin-bottom: 12px;
      }
      #leadership .lead-name{
        font-family: Fraunces, serif; font-weight: 540;
        font-size: 28px; letter-spacing: -0.01em;
        color: #fff; margin: 0 0 6px;
      }
      #leadership .lead-title{
        font-size: 13.5px; color: rgba(255,255,255,0.6);
        margin-bottom: 24px;
      }
      #leadership .lead-quote{
        font-family: Fraunces, serif; font-style: italic;
        font-size: 17px; line-height: 1.55;
        color: rgba(255,255,255,0.92);
        text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        margin: 0 0 16px;
      }
      #leadership .lead-quote span{ color: #F26522; }

      #leadership .lead-stat-bar{
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 56px;
        padding: 32px;
        background: linear-gradient(180deg, rgba(242,101,34,0.08), rgba(242,101,34,0.02));
        border: 1px solid rgba(242,101,34,0.2);
        border-radius: 18px;
      }
      @media (max-width: 700px){
        #leadership .lead-stat-bar{ grid-template-columns: 1fr; gap: 24px; padding: 24px; }
      }
      #leadership .lead-stat-num{
        font-family: Fraunces, serif; font-weight: 600;
        font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1;
        color: #FFA45A; letter-spacing: -0.02em;
      }
      #leadership .lead-stat-cap{
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; letter-spacing: 0.28em; text-transform: uppercase;
        color: rgba(255,255,255,0.6);
        margin-top: 8px;
      }
      #leadership .lead-stat-sub{
        font-size: 13px; color: rgba(255,255,255,0.55);
        line-height: 1.5; margin-top: 8px;
      }

      #leadership .lead-priorities{
        margin-top: 60px;
      }
      #leadership .lead-priorities-head{
        font-family: Inter, system-ui, sans-serif;
        font-size: 14px; font-weight: 600;
        color: rgba(255,255,255,0.65); margin-bottom: 24px;
      }
      #leadership .lead-priorities-grid{
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 900px){
        #leadership .lead-priorities-grid{ grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 540px){
        #leadership .lead-priorities-grid{ grid-template-columns: 1fr; }
      }
      #leadership .lead-priority{
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 22px 22px 24px;
        position: relative;
      }
      #leadership .lead-priority-num{
        /* Plain badge — no monospace, no heavy tracking. Looks hand-set. */
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; border-radius: 50%;
        background: rgba(242,101,34,0.18);
        color: #FFA45A;
        font-family: Inter, system-ui, sans-serif;
        font-size: 12px; font-weight: 700; letter-spacing: 0;
        margin-bottom: 12px;
      }
      #leadership .lead-priority-text{
        font-family: Inter, system-ui, sans-serif;
        font-size: 15px; line-height: 1.5;
        color: rgba(255,255,255,0.88);
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const html = `
      <section id="leadership">
        <div class="lead-wrap">
          <div class="lead-eyebrow">§ 09 · Leadership · Mandate</div>
          <h2>A national board, with <em>a national mandate.</em></h2>

          <div class="lead-grid">
            <article class="lead-figure">
              <div class="lead-role">Chief Executive Officer</div>
              <h3 class="lead-name">Richard Maughn</h3>
              <div class="lead-title">Board of Industrial Training</div>
              <p class="lead-quote">
                <span>“</span>Our mandate is unchanged since 1910 — to put the trades that build
                Guyana into the hands of Guyanese. What has changed is the scale: sixteen
                programmes, ten regional centres, and a billion-dollar reinvestment in the
                workforce that powers our economy.<span>”</span>
              </p>
            </article>

            <article class="lead-figure">
              <div class="lead-role">Minister of Labour &amp; Manpower Planning</div>
              <h3 class="lead-name">Hon. Keoma Griffith</h3>
              <div class="lead-title">Government of Guyana</div>
              <p class="lead-quote">
                <span>“</span>Every Guyanese deserves a path to skilled, dignified work.
                BIT is how we deliver that — across every region, with no fee, with industry
                partners that hire on graduation. The 2026 intake is open and the seats are filling.<span>”</span>
              </p>
            </article>
          </div>

          <div class="lead-stat-bar">
            <div>
              <div class="lead-stat-num">3,587</div>
              <div class="lead-stat-cap">Beneficiaries · 2025 cycle</div>
              <div class="lead-stat-sub">Trainees engaged across BIT programmes nationwide in the 2025 cycle alone.</div>
            </div>
            <div>
              <div class="lead-stat-num">1,645</div>
              <div class="lead-stat-cap">Women · 2025 cycle</div>
              <div class="lead-stat-sub">Women trained in 2025 across welding, electrical, IT, cosmetology and other programmes — 46% of total intake.</div>
            </div>
            <div>
              <div class="lead-stat-num">77%</div>
              <div class="lead-stat-cap">Graduates employed</div>
              <div class="lead-stat-sub">Of recent BIT graduates are gainfully employed within their field after certification.</div>
            </div>
          </div>

          <div class="lead-priorities">
            <div class="lead-priorities-head">Strategic priorities, 2025–2028</div>
            <div class="lead-priorities-grid">
              <div class="lead-priority">
                <div class="lead-priority-num">01</div>
                <div class="lead-priority-text">Expand access to vocational training across all 10 administrative regions.</div>
              </div>
              <div class="lead-priority">
                <div class="lead-priority-num">02</div>
                <div class="lead-priority-text">Roll out micro-credentialing for short-cycle, industry-aligned skills.</div>
              </div>
              <div class="lead-priority">
                <div class="lead-priority-num">03</div>
                <div class="lead-priority-text">Implement Prior Learning Assessment &amp; Recognition (PLAR) for working tradespeople.</div>
              </div>
              <div class="lead-priority">
                <div class="lead-priority-num">04</div>
                <div class="lead-priority-text">Deepen industry partnerships — ExxonMobil, Hess, CNOOC, GuySuCo, GNIC.</div>
              </div>
              <div class="lead-priority">
                <div class="lead-priority-num">05</div>
                <div class="lead-priority-text">Embed lifelong-learning pathways from apprentice to master tradesperson.</div>
              </div>
              <div class="lead-priority">
                <div class="lead-priority-num">06</div>
                <div class="lead-priority-text">Modernise data systems for tracer studies, employer feedback, and outcomes.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const newSection = wrap.firstElementChild;
    partnersSection.parentNode.insertBefore(newSection, partnersSection);

    console.log('[leadership] section added before partners');
  });
})();
