/* ═══════════════════════════════════════════════════════════════
   Scroll Engine — single rAF loop driving every scroll animation
   ───────────────────────────────────────────────────────────────
   The previous architecture had multiple scroll listeners, each
   calling getBoundingClientRect() (forces layout) and re-computing
   redundantly. This engine fixes that by:

   1. ONE rAF loop reads window.scrollY just ONCE per frame
   2. Section offsets are cached; only recomputed on resize
   3. The loop is gated — if scrollY didn't change AND no resize
      happened, NO compute work runs
   4. Sites pre-decode frames into ImageBitmaps (when supported)
      for GPU-direct uploads — drawImage is then ~3× faster
   5. Subscribers register a `tick(progress)` callback. The engine
      passes them the precise 0-1 progress for their section.

   API:
     ScrollEngine.register({
       el: HTMLElement,         // section to observe (uses offsetTop + offsetHeight)
       margin: 0,               // optional, extends "in range" margin
       tick: (progress) => {},  // called once per frame when section in range
     })

   Returns a handle with .destroy().
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  if(window.ScrollEngine) return;     // already booted

  const sites = [];
  let lastScrollY = -1;
  let needsLayout = true;

  function refreshLayout(){
    const vh = window.innerHeight;
    for(const s of sites){
      s.offsetTop = s.el.offsetTop;
      s.height = s.el.offsetHeight;
      s.scrollable = Math.max(1, s.height - vh);
    }
    needsLayout = false;
  }

  function tick(){
    requestAnimationFrame(tick);

    const y = window.scrollY || window.pageYOffset || 0;
    if(y === lastScrollY && !needsLayout) return;     // nothing to do

    if(needsLayout) refreshLayout();
    lastScrollY = y;

    const vh = window.innerHeight;
    for(const s of sites){
      const localOffset = y - s.offsetTop;
      // Pre-cull: section entirely above or below viewport
      if(localOffset < -vh - 200 || localOffset > s.height + 200) continue;
      const inside = Math.max(0, Math.min(s.scrollable, localOffset));
      const progress = inside / s.scrollable;
      try { s.tick(progress); } catch(e){ console.error('[scroll-engine]', e); }
    }
  }

  // Layout cache invalidation
  window.addEventListener('resize', () => { needsLayout = true; }, { passive: true });
  // Also invalidate on font load (changes layout) and after window load
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => { needsLayout = true; });
  }
  window.addEventListener('load', () => { needsLayout = true; });

  // Boot the loop
  requestAnimationFrame(tick);

  /* ── Frame helper: load a frame as ImageBitmap when supported ──
     ImageBitmaps are pre-decoded GPU-friendly textures. Drawing them
     to canvas is markedly faster than HTMLImageElement (no decode-on-
     draw, no rasterization). Fallback to Image when unavailable. */
  const supportsBitmap = typeof createImageBitmap === 'function';

  async function loadFrame(url){
    if(supportsBitmap){
      try {
        const r = await fetch(url);
        if(!r.ok) return null;
        const blob = await r.blob();
        return await createImageBitmap(blob);
      } catch(e){
        // Fall through to Image fallback
      }
    }
    return new Promise((resolve)=>{
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function isImageReady(frame){
    if(!frame) return false;
    if(typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap) return true;
    if(frame instanceof HTMLImageElement) return frame.complete && frame.naturalWidth > 0;
    return false;
  }

  function frameWidth(frame){
    if(typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap) return frame.width;
    return frame.naturalWidth || 0;
  }
  function frameHeight(frame){
    if(typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap) return frame.height;
    return frame.naturalHeight || 0;
  }

  /* ── Public API ─────────────────────────────────────────────── */
  window.ScrollEngine = {
    register(opts){
      const site = {
        el: opts.el,
        tick: opts.tick,
        offsetTop: 0, height: 0, scrollable: 1,
      };
      sites.push(site);
      needsLayout = true;
      // Force initial sync
      lastScrollY = -2;
      return {
        destroy(){
          const i = sites.indexOf(site);
          if(i >= 0) sites.splice(i, 1);
        },
      };
    },
    invalidateLayout(){ needsLayout = true; },
    loadFrame,
    isImageReady,
    frameWidth,
    frameHeight,
  };

  console.log('[scroll-engine] booted');
})();
