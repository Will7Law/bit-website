/* ═══════════════════════════════════════════════════════════════
   Network Section Pin + Scroll-Scrub
   ───────────────────────────────────────────────────────────────
   Restructures the "Across all ten regions" section so:
     • Section becomes a tall scroll runway (~380vh)
     • All visual content (video → canvas, gradient overlay,
       headline + region pins + caption) gets pinned to viewport
       inside a sticky stage
     • Backdrop video is replaced by frame-sequence canvas that
       scrubs forward as user scrolls down, reverses going up
     • The 10 region pills explode based on scroll progress
       instead of just on viewport entry — they fly out as the
       user scrolls in, retract on scroll back

   Eliminates the autoplay-loop video (one less GPU decoder slot)
   and gives the section the same cinematic pin feel as the hero
   and workshop scrub sections.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const FRAMES_DIR = '/media/frames/network/';
  const FRAME_COUNT = 145;
  const SECTION_HEIGHT = '260vh';   // review-2: more scroll runway so all 10 region pins surface fully
  const FRAME_PAD = 5;

  function pad(n){ return String(n).padStart(FRAME_PAD, '0'); }

  function waitFor(predicate, cb, attempts = 80){
    const result = predicate();
    if(result) return cb(result);
    if(attempts <= 0) return console.warn('[network-pin] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }
  function waitForEngine(cb){
    if(window.ScrollEngine) return cb();
    setTimeout(()=> waitForEngine(cb), 50);
  }

  // We need: the section AND its existing children to be present
  function findSection(){
    const sec = document.getElementById('network');
    if(!sec) return null;
    // Wait until the React content is rendered (look for the heading)
    if(!sec.querySelector('.text-center.mb-16')) return null;
    return sec;
  }

  waitForEngine(() => waitFor(findSection, (section) => {
    // Find the existing children we need to relocate
    const video = section.querySelector('video');
    // The gradient overlay is the absolute-inset-0 div with linear-gradient bg
    const gradient = Array.from(section.children).find(el =>
      el.tagName === 'DIV' && /absolute/.test(el.className) && /inset-0/.test(el.className) && !el.querySelector('video'));
    // The content wrapper (relative max-w-[1400px])
    const content = Array.from(section.children).find(el =>
      el.tagName === 'DIV' && /relative/.test(el.className) && /max-w-/.test(el.className));

    if(!content){
      console.warn('[network-pin] could not locate content wrapper');
      return;
    }

    // ─── 1. Restructure: tall section + sticky stage ──────────
    section.style.position = 'relative';
    section.style.height = SECTION_HEIGHT;
    section.style.padding = '0';        // override py-24 padding
    section.style.overflow = 'visible'; // CRITICAL: overflow:hidden breaks sticky
    section.classList.remove('cv-auto'); // content-visibility: auto breaks pin math
    section.classList.remove('overflow-hidden');

    const stage = document.createElement('div');
    stage.className = 'network-stage';
    // 100dvh respects mobile address-bar showing/hiding. Falls back to 100vh.
    // review-2: removed overflow:hidden so the bottom regional pins
    // (Mahdia / Lethem) never get clipped — they sometimes overflow the
    // 100vh box because the visualisation grows tall on portrait phones.
    stage.style.cssText = 'position:sticky;top:0;height:100vh;height:100dvh;min-height:760px;width:100%;display:flex;align-items:center;justify-content:center;padding:0 0 40px 0;';
    // Also relax overflow on the content wrapper so the bottom centres
    // never get cropped at small heights.
    section.style.overflow = 'visible';

    // Move existing children into the stage (preserving React node identities
    // — React reconciliation only touches PROPERTIES of nodes, never asks where
    // they live in DOM, so this is safe)
    section.appendChild(stage);
    if(video) stage.appendChild(video);
    if(gradient) stage.appendChild(gradient);
    stage.appendChild(content);
    // Make content not push stage layout
    content.style.position = 'absolute';
    content.style.inset = '0';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.justifyContent = 'center';
    content.style.padding = '6vh 1.5rem';

    // ─── 2. Replace video with frame-scrub canvas ─────────────
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    canvas.setAttribute('aria-label', 'Across ten regions of Guyana — cinematic scrub');
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    ctx.imageSmoothingEnabled = false;

    if(video){
      video.replaceWith(canvas);
    } else {
      stage.insertBefore(canvas, stage.firstChild);
    }

    // ─── 3. Preload frames as ImageBitmaps via ScrollEngine ───
    const frames = new Array(FRAME_COUNT);
    let firstDrawn = false;

    async function loadOne(i){
      const f = await window.ScrollEngine.loadFrame(FRAMES_DIR + pad(i) + '.jpg');
      frames[i] = f;
      if(!firstDrawn && f){
        firstDrawn = true;
        sizeCanvas();
        drawFrame(0);
      }
    }
    loadOne(0);
    (async function preload(){
      const queue = [];
      for(let i = 1; i < FRAME_COUNT; i++) queue.push(i);
      const BATCH = 6;
      for(let cursor = 0; cursor < queue.length; cursor += BATCH){
        const slice = queue.slice(cursor, cursor + BATCH);
        await Promise.all(slice.map(loadOne));
      }
    })();

    function sizeCanvas(){
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);  // capped 1.5 for perf
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
        for(let off = 1; off < FRAME_COUNT; off++){
          const j = i - off;
          if(j >= 0 && window.ScrollEngine.isImageReady(frames[j])){ drawFrame(j); return; }
          const k = i + off;
          if(k < FRAME_COUNT && window.ScrollEngine.isImageReady(frames[k])){ drawFrame(k); return; }
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

    // ─── 4. Register with ScrollEngine for unified per-frame updates ──
    let lastIdx = -1;
    window.ScrollEngine.register({
      el: section,
      tick: (progress) => {
        const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(progress * (FRAME_COUNT - 1))));
        if(idx !== lastIdx){
          drawFrame(idx);
          lastIdx = idx;
        }
      },
    });

    window.addEventListener('resize', () => { sizeCanvas(); });

    console.log('[network-pin] active — engine-driven, ' + FRAME_COUNT + ' frames');
  }));
})();
