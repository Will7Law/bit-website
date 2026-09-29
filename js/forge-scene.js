/* ═══════════════════════════════════════════════════════════════
   Forge BIT — interactive hero replacement
   ───────────────────────────────────────────────────────────────
   Replaces the static frame-sequence hero scrub with a live,
   cursor- and scroll-reactive particle scene.

   Five scroll keyframes across the 450vh section:
     0.00 – 0.15   embers drift inward from screen edges
     0.15 – 0.45   converge into the BIT logo
     0.45 – 0.62   logo holds, breathes
     0.62 – 0.82   bursts into a 10-point regional constellation
     0.82 – 1.00   constellation rotates + dissipates upward as sparks

   Cursor acts as a torch — particles within 90px are pushed away.
   Click → small implosion + re-explode. Mouse leaves → spring back.

   Reads scroll progress from the existing window.ScrollEngine so
   captions tied to data-caption opacities continue to work.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  console.log('[forge-scene] script loaded');

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    console.log('[forge-scene] reduced motion; skipping');
    return;
  }

  // iOS Safari is the single biggest source of "page crashed" reports
  // (it kills tabs aggressively when memory budget is exceeded). The
  // 600-particle canvas + decoded backdrop video sits right at the edge
  // of what mobile WebKit allows. Skip the animated scene on iOS — the
  // BIT logo image still shows, just without the ember particles.
  var UA = navigator.userAgent || '';
  var IS_IOS = /iPad|iPhone|iPod/.test(UA) ||
               (/Mac/i.test(UA) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  if(IS_IOS){
    console.log('[forge-scene] iOS detected; skipping ember scene to protect tab memory');
    return;
  }
  // Same protection on the user's "Reduce motion" or "Reduce animations"
  // accessibility toggle from our own widget.
  if(document.documentElement.classList.contains('bit-a11y-reduce-motion')){
    console.log('[forge-scene] user reduce-motion preference; skipping');
    return;
  }

  // ─── Adaptive performance budgets ─────────────────────────────
  // We tune particle count, DPR, and whether we even fetch the
  // 3 MB backdrop video based on the device + connection so the
  // page is responsive on a $50 phone with a 2G hotspot.
  const NETWORK = (navigator.connection || navigator.mozConnection || navigator.webkitConnection || {});
  const NET_TYPE   = (NETWORK.effectiveType || '4g').toLowerCase();   // 'slow-2g'|'2g'|'3g'|'4g'
  const SAVE_DATA  = !!NETWORK.saveData;
  const IS_MOBILE  = window.matchMedia('(max-width: 760px)').matches;
  const SLOW_NET   = SAVE_DATA || NET_TYPE === 'slow-2g' || NET_TYPE === '2g' || NET_TYPE === '3g';
  // 4 cores or fewer (mobile or budget hardware) → tighten the budget
  const LOW_CPU    = (navigator.hardwareConcurrency || 8) <= 4;

  const PARTICLE_COUNT      = (SLOW_NET || LOW_CPU) ? 280 : (IS_MOBILE ? 380 : 620);
  const DPR_CAP             = IS_MOBILE ? 1.25 : 1.75;
  const ENABLE_BG_VIDEO     = !SAVE_DATA && NET_TYPE !== 'slow-2g' && NET_TYPE !== '2g';
  const VIDEO_PRELOAD       = SLOW_NET ? 'metadata' : 'auto';

  const REPULSION_RADIUS    = 95;
  const REPULSION_STRENGTH  = 0.18;
  const SPRING_K            = 0.045;     // pull toward target
  const FRICTION            = 0.86;
  const SAMPLING_STRIDE     = (SLOW_NET || LOW_CPU) ? 6 : 4;   // wider stride → fewer logo points to fit
  const LOGO_SRC            = '/images/bit-logo.png';
  const COLORS = {
    ember:       'rgba(242, 101, 34, ',  // append alpha + ")"
    glow:        'rgba(255, 164,  90, ',
    spark:       'rgba(255, 220, 170, ',
    void:        '#06112A',
  };

  function waitFor(predicate, cb, attempts = 100){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[forge-scene] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }
  function waitForEngine(cb){
    if(window.ScrollEngine) return cb();
    setTimeout(()=> waitForEngine(cb), 50);
  }

  // ─── 1. Build target-point sets ───────────────────────────────
  /** Sample the BIT logo bitmap → array of {x,y} normalised to [-1, 1]. */
  function sampleLogo(){
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Render small (low cost), sample dense
        const W = 240, H = Math.round(240 * img.height / img.width);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        const pts = [];
        for(let y = 0; y < H; y += SAMPLING_STRIDE){
          for(let x = 0; x < W; x += SAMPLING_STRIDE){
            const i = (y * W + x) * 4;
            const a = data[i + 3];
            if(a > 120){
              // Normalize to centred [-1,1] keeping aspect
              const nx = (x - W / 2) / (H / 2);
              const ny = (y - H / 2) / (H / 2);
              pts.push({ x: nx, y: ny });
            }
          }
        }
        resolve({ points: pts, aspect: W / H });
      };
      img.onerror = () => resolve({ points: [], aspect: 3 });
      img.src = LOGO_SRC;
    });
  }

  /** Constellation of 10 points arranged in a ring (representing regions). */
  function constellationPoints(count = 10, radius = 0.85){
    const pts = [];
    for(let i = 0; i < count; i++){
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
    }
    return pts;
  }

  /** Random edge-drift starting positions. */
  function edgePoints(count){
    const pts = [];
    for(let i = 0; i < count; i++){
      const side = Math.floor(Math.random() * 4);
      const t = Math.random() * 2 - 1;
      let x, y;
      if(side === 0) { x = -1.5; y = t; }
      else if(side === 1) { x = 1.5; y = t; }
      else if(side === 2) { x = t; y = -1.5; }
      else { x = t; y = 1.5; }
      pts.push({ x, y });
    }
    return pts;
  }

  // ─── 2. Mount target ──────────────────────────────────────────
  // We mount Forge BIT exactly ONCE — as a full-bleed backdrop on
  // the #top landing section. The hero text stays on top of it via
  // z-index. The original right-side aspect-square panel that
  // contained a small Three.js scene gets hidden — Forge is now the
  // entire backdrop. The next section down (the 450vh scrub) is
  // left alone so scrub-frames can play the hero-flythrough video
  // there as the FIRST scroll-reactive scene.
  function findTopSection(){
    const headings = document.querySelectorAll('h1');
    for(const h of headings){
      if(/building guyana/i.test(h.textContent || '')){
        const sec = h.closest('section');
        if(sec) return sec;
      }
    }
    return document.getElementById('top');
  }

  async function mountForge(section, opts){
    const mode    = opts?.mode || 'static';
    if(!section){ console.warn('[forge-scene] no section'); return; }
    if(section.dataset.forgeBound){ return; }
    section.dataset.forgeBound = '1';
    const stage = section;       // backdrop fills the full section

      // Replace canvas. We paint an INSTANT CSS-only forge gradient
      // beneath everything so the hero panel never appears blank, even
      // before any JS or network I/O has finished. The video (if used)
      // is layered on top with a screen blend; particles render on top
      // of that.
      const wrap = document.createElement('div');
      wrap.style.cssText = [
        'position:absolute;inset:0;display:block;overflow:hidden;',
        // Multi-stop radial gradient that evokes the forge palette —
        // warm core, cool void surround. Pure CSS, zero network cost.
        'background:',
        '  radial-gradient(60% 60% at 50% 60%, rgba(242,101,34,0.22), transparent 70%),',
        '  radial-gradient(80% 80% at 50% 50%, rgba(255,164,90,0.10), transparent 70%),',
        '  radial-gradient(60% 80% at 80% 20%, rgba(27,77,142,0.18), transparent 70%),',
        '  ' + COLORS.void + ';',
      ].join('');

      let bgVideo = null;
      if(ENABLE_BG_VIDEO){
        bgVideo = document.createElement('video');
        bgVideo.src = '/media/forge-loop.mp4';
        // Poster paints instantly — same trick every other video on the page
        // already uses (hero-ember.jpg, era-1910.jpg, etc.). Fixes the 3-4
        // second blank-panel pause the user reported.
        bgVideo.poster = '/media/posters/forge-loop.jpg';
        bgVideo.autoplay = true;
        bgVideo.loop = true;
        bgVideo.muted = true;
        bgVideo.playsInline = true;
        bgVideo.preload = VIDEO_PRELOAD;
        // Faster reveal (250ms instead of 600ms) since the poster already
        // bridges the visual gap.
        bgVideo.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.55;transition:opacity 250ms ease;mix-blend-mode:screen;pointer-events:none;';
        bgVideo.setAttribute('aria-hidden', 'true');
        wrap.appendChild(bgVideo);
      }

      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;background:transparent;';
      canvas.setAttribute('aria-label', 'Forge BIT — interactive ember particles forming the BIT wordmark');
      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      wrap.appendChild(canvas);

      // Mount the wrap as a FULL-SECTION backdrop on #top, behind the
      // existing hero text grid. The right-side panel that originally held
      // a small Three.js scene is hidden — Forge fills the whole landing.
      section.style.position = section.style.position || 'relative';
      section.insertBefore(wrap, section.firstChild);
      // Lift every existing direct child of the section above the backdrop.
      Array.from(section.children).forEach(el => {
        if(el === wrap) return;
        const cs = getComputedStyle(el);
        if(cs.position === 'static') el.style.position = 'relative';
        el.style.zIndex = el.style.zIndex || '1';
      });
      // Hide the small right-side aspect-square panel that previously
      // hosted the orbital ember scene — Forge is now full-bleed.
      const rightPanel = section.querySelector('.relative.aspect-square');
      if(rightPanel) rightPanel.style.display = 'none';

      // Robust autoplay: muted+playsInline videos can autoplay on most browsers,
      // but we wait for `canplay` to ensure the buffer is filled before calling
      // play(). If the user hasn't interacted with the page yet some mobile
      // browsers will still block — fall back silently to particles only.
      if(bgVideo){
        function tryPlay(){
          bgVideo.play().catch(() => {/* particles still render fine */});
        }
        if(bgVideo.readyState >= 3){ tryPlay(); }
        else { bgVideo.addEventListener('canplay', tryPlay, { once: true }); }
        window.addEventListener('pointerdown', tryPlay, { once: true });
        window.addEventListener('scroll', tryPlay, { once: true, passive: true });
      }

      // ─── 3. Init particle pool ──────────────────────────────────
      const { points: logoPts, aspect: logoAspect } = await sampleLogo();
      const ringPts = constellationPoints(10);
      const startPts = edgePoints(PARTICLE_COUNT);

      function repeatToCount(arr, n){
        if(!arr.length) return Array.from({length:n}, () => ({ x: (Math.random()*2-1)*0.4, y:(Math.random()*2-1)*0.4 }));
        const out = [];
        for(let i = 0; i < n; i++) out.push(arr[i % arr.length]);
        return out;
      }

      const logoTargets   = repeatToCount(logoPts, PARTICLE_COUNT);
      const ringTargets   = repeatToCount(ringPts, PARTICLE_COUNT);
      const driftTargets  = startPts;

      // Particle state
      const P = new Array(PARTICLE_COUNT);
      for(let i = 0; i < PARTICLE_COUNT; i++){
        P[i] = {
          x: startPts[i].x, y: startPts[i].y,
          vx: 0, vy: 0,
          tx: 0, ty: 0,                     // current target
          size: 0.6 + Math.random() * 1.6,  // 0.6..2.2
          flick: Math.random() * Math.PI * 2,
        };
      }

      // ─── 4. Mouse + click state ─────────────────────────────────
      const mouse = { x: -9999, y: -9999, active: false, lastMove: 0 };
      const impulses = [];   // { x, y, t0, kind: 'pull'|'push' }

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
        mouse.active = true;
        mouse.lastMove = performance.now();
      });
      canvas.addEventListener('mouseleave', () => { mouse.active = false; });
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        const y = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
        impulses.push({ x, y, t0: performance.now(), kind: 'pull' });
        // Schedule re-explode
        setTimeout(() => impulses.push({ x, y, t0: performance.now(), kind: 'push' }), 280);
      });

      // Touch support (mobile)
      canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0]; if(!t) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((t.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = ((t.clientY - rect.top)  / rect.height) * 2 - 1;
        mouse.active = true;
        mouse.lastMove = performance.now();
      }, { passive: true });

      // ─── 5. Scroll progress driver ───────────────────────────────
      // 'scrub' mode → scroll-tied progress 0..1
      // 'static' mode → progress is a slowly oscillating value that keeps
      //                 us in the "logo holds + breathes" phase forever
      let progress = 0.50;
      if(mode === 'scrub' && section && window.ScrollEngine){
        window.ScrollEngine.register({
          el: section,
          tick: (linear) => { progress = linear; },
        });
      } else {
        // Slowly drift between 0.45 and 0.62 so particles feel alive even idle
        setInterval(() => {
          const t = (performance.now() / 4000) % 1;
          progress = 0.45 + Math.sin(t * Math.PI * 2) * 0.085 + 0.085;
        }, 80);
      }

      // ─── 6. Compute target per scroll phase ─────────────────────
      function blend(a, b, t){ return a * (1 - t) + b * t; }
      function easeInOut(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }

      function computeTargets(prog){
        // Determine the current phase + lerp factor
        // Phase 1 (0.00..0.15): drift  → drift  (no change yet)
        // Phase 2 (0.15..0.45): drift  → logo
        // Phase 3 (0.45..0.62): logo   → logo (breathing)
        // Phase 4 (0.62..0.82): logo   → ring
        // Phase 5 (0.82..1.00): ring   → outward sparks (scaled out + upward)
        const breath = 1 + Math.sin(prog * Math.PI * 6) * 0.04;       // for phase 3
        for(let i = 0; i < PARTICLE_COUNT; i++){
          let a, b, t;
          if(prog < 0.15){
            a = driftTargets[i]; b = driftTargets[i]; t = 0;
          } else if(prog < 0.45){
            a = driftTargets[i]; b = logoTargets[i];
            t = easeInOut((prog - 0.15) / 0.30);
          } else if(prog < 0.62){
            a = logoTargets[i]; b = logoTargets[i]; t = 0;
          } else if(prog < 0.82){
            a = logoTargets[i]; b = ringTargets[i];
            t = easeInOut((prog - 0.62) / 0.20);
          } else {
            // Outward + upward dissipation
            const explodeT = (prog - 0.82) / 0.18;
            const angle = Math.atan2(ringTargets[i].y, ringTargets[i].x);
            const r = 1.2 + explodeT * 1.5;
            a = ringTargets[i];
            b = { x: Math.cos(angle) * r, y: ringTargets[i].y - explodeT * 1.5 };
            t = easeInOut(explodeT);
          }
          let tx = blend(a.x, b.x, t);
          let ty = blend(a.y, b.y, t);
          // Apply breathing during phase 3
          if(prog >= 0.45 && prog < 0.62){ tx *= breath; ty *= breath; }
          P[i].tx = tx; P[i].ty = ty;
        }
      }

      // ─── 7. Render loop ────────────────────────────────────────
      let W = 1, H = 1, scale = 1;
      function resize(){
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        W = wrap.clientWidth  || stage.clientWidth  || window.innerWidth;
        H = wrap.clientHeight || stage.clientHeight || window.innerHeight;
        canvas.width  = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min(W, H) * 0.40;   // px per normalised unit
      }
      window.addEventListener('resize', resize);
      resize();

      function frame(now){
        computeTargets(progress);

        // Clear to fully transparent — the backdrop video shows through.
        // (The container <div> already has the navy void colour as a fallback
        //  in case the video isn't loaded yet.)
        ctx.clearRect(0, 0, W, H);

        // A few atmospheric noise dots (background sparks) painted very faintly
        // — these layer over the video without overwhelming it.
        ctx.fillStyle = 'rgba(255, 220, 170, 0.05)';
        for(let i = 0; i < 14; i++){
          const x = (Math.sin((now*0.0003) + i*1.7) * 0.5 + 0.5) * W;
          const y = ((now*0.00005 + i*0.21) % 1) * H;
          ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI*2); ctx.fill();
        }

        // Apply impulses
        const impulseAge = (imp) => (now - imp.t0) / 1000;

        // Update particles
        for(let i = 0; i < PARTICLE_COUNT; i++){
          const p = P[i];
          // Spring toward target
          p.vx += (p.tx - p.x) * SPRING_K;
          p.vy += (p.ty - p.y) * SPRING_K;
          // Cursor repulsion (only when active and within radius)
          if(mouse.active){
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distNorm = Math.hypot(dx, dy);
            const distPx = distNorm * scale;
            if(distPx < REPULSION_RADIUS && distPx > 0.5){
              const force = (1 - distPx / REPULSION_RADIUS) * REPULSION_STRENGTH;
              p.vx += (dx / distNorm) * force;
              p.vy += (dy / distNorm) * force;
            }
          }
          // Apply impulses
          for(const imp of impulses){
            const age = impulseAge(imp);
            if(age > 0.6) continue;
            const dx = p.x - imp.x, dy = p.y - imp.y;
            const d = Math.hypot(dx, dy);
            if(d < 1.2 && d > 0.001){
              const dirx = dx / d, diry = dy / d;
              const decay = 1 - age / 0.6;
              const mag = (imp.kind === 'pull' ? -0.35 : 0.55) * decay;
              p.vx += dirx * mag;
              p.vy += diry * mag;
            }
          }
          // Friction
          p.vx *= FRICTION; p.vy *= FRICTION;
          p.x += p.vx; p.y += p.vy;
          // Flick (subtle phase for glow flicker)
          p.flick += 0.05 + Math.random() * 0.02;
        }
        // Prune old impulses
        for(let i = impulses.length - 1; i >= 0; i--){
          if(impulseAge(impulses[i]) > 0.7) impulses.splice(i, 1);
        }

        // Draw — additive glow
        ctx.globalCompositeOperation = 'lighter';
        for(let i = 0; i < PARTICLE_COUNT; i++){
          const p = P[i];
          const px = W/2 + p.x * scale;
          const py = H/2 + p.y * scale;
          // Skip off-screen
          if(px < -20 || px > W+20 || py < -20 || py > H+20) continue;
          const flick = 0.7 + 0.3 * Math.sin(p.flick);
          const r = p.size * flick;
          const alpha = 0.85 * flick;
          // Outer glow
          ctx.beginPath();
          ctx.arc(px, py, r * 4, 0, Math.PI*2);
          ctx.fillStyle = COLORS.ember + (alpha * 0.18).toFixed(3) + ')';
          ctx.fill();
          // Mid
          ctx.beginPath();
          ctx.arc(px, py, r * 2, 0, Math.PI*2);
          ctx.fillStyle = COLORS.glow + (alpha * 0.55).toFixed(3) + ')';
          ctx.fill();
          // Hot core
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI*2);
          ctx.fillStyle = COLORS.spark + alpha.toFixed(3) + ')';
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        // Cursor torch — soft warm halo following cursor (only when active)
        if(mouse.active && (now - mouse.lastMove) < 1500){
          const cx = W/2 + mouse.x * scale;
          const cy = H/2 + mouse.y * scale;
          const cg = ctx.createRadialGradient(cx, cy, 2, cx, cy, REPULSION_RADIUS * 1.4);
          cg.addColorStop(0, 'rgba(255, 200, 130, 0.32)');
          cg.addColorStop(1, 'rgba(255, 200, 130, 0)');
          ctx.fillStyle = cg;
          ctx.fillRect(cx - REPULSION_RADIUS*1.4, cy - REPULSION_RADIUS*1.4, REPULSION_RADIUS*2.8, REPULSION_RADIUS*2.8);
        }

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      console.log('[forge-scene] active (' + mode + ') — ' + PARTICLE_COUNT + ' particles, ' + logoPts.length + ' logo target points (net=' + NET_TYPE + ', saveData=' + SAVE_DATA + ', mobile=' + IS_MOBILE + ', video=' + ENABLE_BG_VIDEO + ', dprCap=' + DPR_CAP + ')');
  } /* end mountForge */

  // Forge BIT mounts ONLY on the landing hero (#top) as a full-bleed
  // backdrop. The next section down (the 450vh hero-flythrough scrub)
  // is left to scrub-frames.js which plays the ember frame sequence
  // there — that's the FIRST scroll-reactive video.
  // Static mode doesn't need ScrollEngine (it only registers in scrub mode),
  // so we skip waitForEngine and find the section as soon as the DOM is
  // available. Saves 50-200ms of wait time on first paint.
  waitFor(findTopSection, (sec) => mountForge(sec, { mode: 'static' }));
})();
