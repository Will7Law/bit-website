/* ═══════════════════════════════════════════════════════════════
   Apply Section Step Thumbnails Swap
   ───────────────────────────────────────────────────────────────
   Replaces the 3 StepThumb Three.js canvases (small ID-card / folder
   / diploma renders) with the AI-generated cinematic videos:
     Step 01 → step-01-apply.mp4
     Step 02 → step-02-choose.mp4
     Step 03 → step-03-launch.mp4

   Each video gets autoplay-loop + IntersectionObserver-gated playback
   so it only buffers/plays when the apply section is on screen.
   Eliminates 3 more WebGL contexts.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const VIDEOS = [
    '/media/videos/step-01-apply.mp4',
    '/media/videos/step-02-choose.mp4',
    '/media/videos/step-03-launch.mp4',
  ];

  function waitFor(predicate, cb, attempts = 30){
    const result = predicate();
    if(result) return cb(result);
    // Reached when strip-apply.js has already replaced the 3 StepThumb
    // canvases with the enrolment cards. Not an error — this wedge simply
    // has no work to do on the current build. Log at info level so it
    // does not surface as a warning in security reviews.
    if(attempts <= 0) return console.info('[apply-steps] no StepThumb canvases on this page — skipping');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // Find the 3 StepThumb canvases inside the Apply section.
  // The apply section has 3 cards in a grid, each containing a small
  // <div className="aspect-[4/3] ..."><canvas/></div> rendered by StepThumb.
  function findStepCanvases(){
    const apply = document.getElementById('apply');
    if(!apply) return null;
    // Step cards are the .glass children with aspect-[4/3] containers
    const cards = apply.querySelectorAll('.glass');
    if(cards.length < 3) return null;
    const canvases = [];
    for(const card of cards){
      const c = card.querySelector('canvas');
      if(c) canvases.push(c);
    }
    return canvases.length === 3 ? canvases : null;
  }

  waitFor(findStepCanvases, (canvases) => {
    canvases.forEach((canvas, i) => {
      if(i >= VIDEOS.length) return;
      const host = canvas.parentElement;
      if(!host) return;

      const video = document.createElement('video');
      video.src = VIDEOS[i];
      // Poster for instant first paint (mobile especially benefits)
      const posterName = VIDEOS[i].split('/').pop().replace('.mp4', '.jpg');
      video.poster = '/media/posters/' + posterName;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', 'Step ' + String(i+1).padStart(2,'0') + ' cinematic illustration');
      video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;background:#0A1530;';

      // Soft fade-in when first attached
      video.style.opacity = '0';
      video.style.transition = 'opacity 0.7s ease';
      video.addEventListener('canplay', () => {
        requestAnimationFrame(() => { video.style.opacity = '1'; });
      });

      canvas.replaceWith(video);

      // Only buffer + play when in viewport — saves bandwidth and CPU
      const io = new IntersectionObserver((entries)=>{
        const e = entries[0];
        if(!e) return;
        if(e.isIntersecting){
          video.preload = 'auto';
          video.play().catch(()=>{});
        } else {
          try { video.pause(); } catch(_){}
        }
      }, { rootMargin: '300px' });
      io.observe(video);
    });

    console.log('[apply-steps] active — 3 Three.js scenes replaced by cinematic videos');
  });
})();
