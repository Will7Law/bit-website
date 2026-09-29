/* ═══════════════════════════════════════════════════════════════
   Hero Ember Swap
   ───────────────────────────────────────────────────────────────
   Replaces the hero's right-side Three.js scene (the orbiting tools
   around a polygon "ember") with the AI-generated hero-ember.mp4.

   Strategy:
     • Wait for React to mount the hero
     • Locate the hero's Three.js canvas (specifically the one inside
       the section that contains the "Building Guyana's" H1)
     • Replace it with a <video> element that autoplay-loops
     • Eliminates one WebGL context — measurable scroll smoothness gain
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function waitFor(predicate, cb, attempts = 80){
    const result = predicate();
    if(result) return cb(result);
    if(attempts <= 0) return console.warn('[hero-ember] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // Locate the hero section: it's the section whose H1 starts with "Building Guyana's"
  function findHeroCanvas(){
    const headings = document.querySelectorAll('h1');
    for(const h of headings){
      if(/building guyana/i.test(h.textContent || '')){
        const sec = h.closest('section');
        if(!sec) continue;
        const canvas = sec.querySelector('canvas');
        if(canvas) return canvas;
      }
    }
    return null;
  }

  waitFor(findHeroCanvas, (canvas) => {
    const host = canvas.parentElement;
    if(!host) return;

    // Build the replacement video — with poster for instant first paint
    const video = document.createElement('video');
    video.src = '/media/videos/hero-ember.mp4';
    video.poster = '/media/posters/hero-ember.jpg';      // visible while video loads
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', 'Cinematic ember scene with orbiting tools and exploding sparks');
    video.className = canvas.className || 'absolute inset-0 w-full h-full';
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#0A1530;';

    canvas.replaceWith(video);

    // IntersectionObserver: only buffer + play when visible
    const io = new IntersectionObserver((entries)=>{
      const e = entries[0];
      if(!e) return;
      if(e.isIntersecting){
        video.preload = 'auto';
        video.play().catch(()=>{});
      } else {
        try { video.pause(); } catch(_){}
      }
    }, { rootMargin: '200px' });
    io.observe(video);

    console.log('[hero-ember] active — Three.js scene replaced by hero-ember.mp4');
  });
})();
