/* ═══════════════════════════════════════════════════════════════
   Hero wordmark — crisp "Board of Industrial Training"
   ───────────────────────────────────────────────────────────────
   Oct-2026, per client: the full name must be CLEARLY readable, with
   a gentle shine moving over it (not formed out of blurry embers).

   This renders the name as real, responsive HTML text — so it stays
   sharp and legible on every device (including iOS, where the forge
   ember canvas is disabled for performance) — and sweeps a soft
   highlight across it. The forge embers sit behind as ambient sparkle
   and the blurred fire shows faintly through; this layer is the crisp
   word layer on top.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function waitForTop(cb, tries){
    tries = (tries === undefined) ? 100 : tries;
    var top = document.getElementById('top');
    if(top && top.querySelector('h1')) return cb(top);
    if(tries <= 0) return;
    setTimeout(function(){ waitForTop(cb, tries - 1); }, 80);
  }

  function init(){
    waitForTop(function(top){
      if(document.getElementById('bit-wordmark')) return;

      var style = document.createElement('style');
      style.id = 'bit-wordmark-style';
      style.textContent =
        '#bit-wordmark{position:absolute;left:0;right:0;top:max(140px,18%);display:flex;' +
          'justify-content:center;z-index:3;padding:0 1.1rem;pointer-events:none;}' +
        /* Solid WHITE — a core site colour, highest contrast over the dark +
           fire. Layered shadow (dark depth + soft halo) makes every letter
           crisp against the busy backdrop. No gradient tint, so it never
           muddies into an off-theme colour. */
        '#bit-wordmark .wm{pointer-events:auto;cursor:pointer;text-align:center;' +
          'font-family:Fraunces,Georgia,serif;font-weight:700;letter-spacing:0.012em;' +
          'line-height:0.98;text-transform:uppercase;font-size:clamp(2rem,7vw,5.2rem);' +
          'max-width:14ch;color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;' +
          'text-shadow:0 2px 6px rgba(4,10,25,0.75),0 6px 28px rgba(4,10,25,0.6),' +
            '0 0 2px rgba(4,10,25,0.9);' +
          'transition:transform .35s cubic-bezier(.2,0,0,1),text-shadow .35s ease;' +
          'will-change:transform,text-shadow;}' +
        /* hover = the same ember-lit interaction: the words warm up and lift */
        '#bit-wordmark .wm:hover,#bit-wordmark .wm.is-lit{transform:scale(1.03);' +
          'text-shadow:0 2px 6px rgba(4,10,25,0.75),0 0 16px rgba(242,101,34,0.7),' +
            '0 0 34px rgba(242,101,34,0.45);}' +
        '@media (max-width:640px){#bit-wordmark{top:max(118px,14%);}}' +
        '@media (prefers-reduced-motion:reduce){#bit-wordmark .wm{transition:none;}}';
      document.head.appendChild(style);

      var wrap = document.createElement('div');
      wrap.id = 'bit-wordmark';
      wrap.innerHTML = '<div class="wm" role="img" aria-label="Board of Industrial Training">' +
                       'Board of Industrial Training</div>';
      // ensure the hero is a positioning context
      if(getComputedStyle(top).position === 'static') top.style.position = 'relative';
      top.appendChild(wrap);

      // ── Same interactive ember effect on hover ──────────────────
      // The forge ember canvas sits behind the words. Forward pointer
      // activity from the wordmark to that canvas so the embers react to
      // the cursor (and burst on click) exactly as they do on the hero —
      // and light the words with a warm ember glow while hovered.
      var wm = wrap.querySelector('.wm');
      function forge(){ return document.querySelector('#top canvas[aria-label*="Forge"]'); }
      function relay(type, e){
        var cv = forge(); if(!cv) return;
        cv.dispatchEvent(new MouseEvent(type, { clientX: e.clientX, clientY: e.clientY, bubbles: false }));
      }
      wm.addEventListener('mouseenter', function(){ wm.classList.add('is-lit'); });
      wm.addEventListener('mouseleave', function(e){ wm.classList.remove('is-lit'); relay('mouseleave', e); });
      wm.addEventListener('mousemove', function(e){ relay('mousemove', e); });
      wm.addEventListener('click', function(e){ relay('click', e); });

      // Hide the now-redundant small eyebrow label ("Board of Industrial
      // Training · Guyana") — the crisp wordmark states the name.
      var nodes = top.querySelectorAll('span, div, p');
      for(var i = 0; i < nodes.length; i++){
        var el = nodes[i];
        if(el.id === 'bit-wordmark' || el.closest('#bit-wordmark')) continue;
        var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if(/^Board of Industrial Training\s*[·|]\s*Guyana$/i.test(t) && el.children.length <= 3){
          el.style.display = 'none';
          break;
        }
      }

      console.info('[hero-wordmark] crisp "Board of Industrial Training" injected');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
