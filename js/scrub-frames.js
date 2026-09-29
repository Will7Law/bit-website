/* ═══════════════════════════════════════════════════════════════
   Scroll-Scrub Frame Renderer (v3, engine-driven)
   ───────────────────────────────────────────────────────────────
   Now powered by /js/scroll-engine.js — single rAF loop, cached
   offsets, ImageBitmap frames. Per-frame work is reduced to:
     1. Skip if scrollY unchanged (engine handles)
     2. Compute scaled frame index
     3. drawImage of pre-decoded ImageBitmap (zero decode cost)

   Result: scroll-driven canvas updates that consistently land
   inside a single rAF tick (~1ms), even on cheap hardware.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeInOut(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }

  const SITES = [
    {
      id: 'hero-flythrough',
      framesDir: '/media/frames/hero/',
      frameCount: 145,
      sectionHeight: '600vh',     /* May-2026: matched to workshop-interior
                                     (also 600vh, 5 captions) so the two
                                     sections advance text & video at the
                                     same scroll rate — one wheel-tick per
                                     caption beat. */
      findTarget: () => document.querySelector('video[src*="hero-flythrough"]'),
      ariaLabel: 'Workshop scene cinematic flythrough',
      captionMap: { selector: '[data-caption]' },
      injectCaptions: [
        /* Caption positions mirror the workshop-interior caption rhythm
           (0.05 / 0.25 / 0.50 / 0.75 / 0.95) so both sections feel
           identical when scrolled. */
        { at: 0.05, text: 'Welcome.' },
        { at: 0.25, text: 'Twelve trades.' },
        { at: 0.50, text: 'Across ten regions.' },
        { at: 0.75, text: 'Established 1910.' },
        { at: 0.95, text: 'This is BIT.' },
      ],
    },
    {
      id: 'workshop-interior',
      framesDir: '/media/frames/workshop/',
      frameCount: 193,
      sectionHeight: '600vh',     /* review-2: slower text — was 450vh, bump to
                                     600vh so dense workshop captions don't feel
                                     rushed when scrolled normally */
      findTarget: () => {
        const sec = document.getElementById('flythrough');
        if (!sec) return null;
        const sticky = sec.querySelector('.sticky.top-0');
        if (!sticky) return null;
        return sticky.querySelector(':scope > .absolute.inset-0') || null;
      },
      ariaLabel: 'Inside the trades — cinematic workshop interior tour',
      captionMap: { selector: '[data-caption]' },
    },
  ];

  function pad(n, w = 5){ return String(n).padStart(w, '0'); }

  function waitFor(predicate, cb, attempts = 80){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[scrub-frames] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  function waitForEngine(cb){
    if(window.ScrollEngine) return cb();
    setTimeout(()=> waitForEngine(cb), 50);
  }

  function setupSite(site){
    waitFor(site.findTarget, (target) => {
      const section = target.closest('section');
      if(!section){ console.warn('[scrub-frames]', site.id, 'no section'); return; }

      if(site.sectionHeight) section.style.height = site.sectionHeight;
      // CSS containment lets the browser skip layout/paint cascading
      // outside this section — big win during scroll.
      section.style.contain = 'layout paint';

      const stage = target.parentElement;

      // Replace target with canvas
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      canvas.setAttribute('aria-label', site.ariaLabel);
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      ctx.imageSmoothingEnabled = false;
      target.replaceWith(canvas);

      // Captions
      let captions = [];
      // Inject captions if requested (for sites where React doesn't render them)
      if(site.injectCaptions && site.injectCaptions.length){
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 1.5rem;pointer-events:none;z-index:3;';
        const inner = document.createElement('h2');
        inner.style.cssText = 'font-family:Fraunces,serif;font-weight:540;text-align:center;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,0.8),0 0 40px rgba(0,0,0,0.5);font-size:clamp(1.8rem,5vw,4.5rem);line-height:1.05;letter-spacing:-0.02em;max-width:18ch;margin:0;';
        site.injectCaptions.forEach(c => {
          const span = document.createElement('span');
          span.setAttribute('data-caption', String(c.at));
          span.style.cssText = 'display:block;opacity:0;will-change:opacity,transform;';
          span.textContent = c.text;
          inner.appendChild(span);
        });
        wrap.appendChild(inner);
        // Insert into the same parent as the canvas (the sticky stage)
        stage.appendChild(wrap);
      }
      if(site.captionMap){
        captions = Array.from(section.querySelectorAll(site.captionMap.selector))
          .map(el => ({ el, at: parseFloat(el.getAttribute('data-caption') || '0.5') }));
      }

      // ── Frame loading via ImageBitmap (when supported) ──
      const frames = new Array(site.frameCount);
      let firstReady = false;

      async function loadOne(i){
        const f = await window.ScrollEngine.loadFrame(site.framesDir + pad(i) + '.jpg');
        frames[i] = f;
        if(!firstReady && f){
          firstReady = true;
          sizeCanvas();
          drawFrame(0);
        }
      }
      // Sites can opt out of preloading (e.g. hero-flythrough where forge-scene
      // is doing its own rendering). We still keep the canvas + caption DOM,
      // we just don't fetch the JPG frame sequence.
      if(!site.skipFrameLoad){
        loadOne(0);
        // Batched parallel preload — limit concurrency to keep network calm
        (async function preload(){
          const queue = [];
          for(let i = 1; i < site.frameCount; i++) queue.push(i);
          const BATCH = 6;
          for(let cursor = 0; cursor < queue.length; cursor += BATCH){
            const slice = queue.slice(cursor, cursor + BATCH);
            await Promise.all(slice.map(loadOne));
          }
        })();
      } else {
        // Still need to size the canvas immediately so other code (forge-scene)
        // can read its dimensions when it takes over.
        sizeCanvas();
      }

      // ── Canvas sizing — DPR capped at 1.5 (was 2) for these decorative
      //    backdrops; 1.5× is indistinguishable from 2× at viewing distance
      //    but 50% less pixels to push to the GPU. ──
      function sizeCanvas(){
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = stage.clientWidth || window.innerWidth;
        const h = stage.clientHeight || window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }

      function drawFrame(i){
        const f = frames[i];
        if(!window.ScrollEngine.isImageReady(f)){
          // Fallback to nearest loaded frame
          for(let off = 1; off < site.frameCount; off++){
            const j = i - off;
            if(j >= 0 && window.ScrollEngine.isImageReady(frames[j])){ drawFrame(j); return; }
            const k = i + off;
            if(k < site.frameCount && window.ScrollEngine.isImageReady(frames[k])){ drawFrame(k); return; }
          }
          return;
        }
        const cw = stage.clientWidth, ch = stage.clientHeight;
        const fw = window.ScrollEngine.frameWidth(f);
        const fh = window.ScrollEngine.frameHeight(f);
        const ir = fw / fh;
        const sr = cw / ch;
        let dw, dh, dx, dy;
        if(ir > sr){ dh = ch; dw = ch * ir; dy = 0; dx = (cw - dw) / 2; }
        else { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
        ctx.drawImage(f, dx, dy, dw, dh);
      }

      // Review-3: previous fade math let two captions both reach
      // ~0.6 opacity in the gap between them, causing text-over-text.
      // New approach — winner-take-all with hard mid-point cuts:
      // each caption owns a window [midpoint_prev, midpoint_next).
      // Only the caption whose window covers the current progress is
      // visible. A tiny crossfade (0.015) at the boundary keeps the
      // transition from popping.
      const sortedCaptions = captions.slice().sort((a, b) => a.at - b.at);
      const boundaries = [0];
      for(let i = 0; i < sortedCaptions.length - 1; i++){
        boundaries.push((sortedCaptions[i].at + sortedCaptions[i + 1].at) / 2);
      }
      boundaries.push(1);
      const FADE = 0.015;

      function updateCaptions(progress){
        if(!sortedCaptions.length) return;
        // Find the active caption window
        let active = -1;
        for(let i = 0; i < sortedCaptions.length; i++){
          if(progress >= boundaries[i] && progress < boundaries[i + 1]){
            active = i; break;
          }
        }
        if(active === -1) active = progress >= 1 ? sortedCaptions.length - 1 : 0;

        for(let i = 0; i < sortedCaptions.length; i++){
          const c = sortedCaptions[i];
          let opacity = 0;
          if(i === active){
            const distLow  = progress - boundaries[i];
            const distHigh = boundaries[i + 1] - progress;
            const edge = Math.min(distLow, distHigh);
            opacity = Math.min(1, Math.max(0, edge / FADE));
          }
          c.el.style.setProperty('opacity', String(opacity), 'important');
          c.el.style.setProperty('--cap-o', String(opacity));
        }
      }

      let lastIdx = -1;

      // Register with the engine — this is the per-frame callback
      window.ScrollEngine.register({
        el: section,
        tick: (linear) => {
          const eased = easeInOut(linear);
          const idx = Math.min(site.frameCount - 1, Math.max(0, Math.round(eased * (site.frameCount - 1))));
          if(idx !== lastIdx){
            drawFrame(idx);
            lastIdx = idx;
          }
          updateCaptions(linear);
        },
      });

      window.addEventListener('resize', () => { sizeCanvas(); });

      if(REDUCE_MOTION) drawFrame(0);

      console.log('[scrub-frames] ' + site.id + ' active — ' + site.frameCount + ' frames, engine-driven');
    });
  }

  waitForEngine(() => {
    SITES.forEach(setupSite);
  });
})();
