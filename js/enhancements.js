/**
 * ============================================================
 * BIT GUYANA — Premium Enhancement Engine
 * Powers: AOS, Swiper, Typed.js, GSAP ScrollTrigger,
 * tsParticles, Dark Mode, Micro-interactions
 * ============================================================
 */

(function () {
  'use strict';

  // Hardware-aware: skip heavy effects on low-end devices (like Linear.app)
  var isHighEnd = (navigator.hardwareConcurrency || 2) >= 4;

  document.addEventListener('DOMContentLoaded', function () {
    initHeroEntrance();
    initDarkMode();
    initAOS();
    initTyped();
    initSwiper();
    if (isHighEnd) initParticles();
    initGSAP();
    initMicroInteractions();
    initMagneticButtons();
  });

  // ── Magnetic Buttons (Polish Pass Item 5) ────────────────────
  // Primary CTAs subtly track the cursor on hover. Opt-in only via
  // the selector below. Respects prefers-reduced-motion and skips
  // on touch devices.
  function initMagneticButtons() {
    if (!window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;  // touch devices

    // Target: hero CTAs + CTA section buttons + primary apply buttons
    var targets = document.querySelectorAll(
      '.hero-buttons .btn, .cta-buttons .btn, .hero-cta-wrap .btn'
    );
    targets.forEach(function (el) {
      el.setAttribute('data-magnetic', '');
      var strength = 0.25;  // subtle — max 8px drift at edge

      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * strength) + 'px, ' + (y * strength) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  // ── Hero Entrance Trigger ───────────────────────────────────
  function initHeroEntrance() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    // Small delay to let the page settle, then trigger entrance
    requestAnimationFrame(function() {
      setTimeout(function() {
        hero.classList.add('hero-ready');
      }, 80);
    });
  }

  // ── Dark Mode Toggle ───────────────────────────────────────
  function initDarkMode() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    var stored = localStorage.getItem('bit-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');

    applyTheme(theme);

    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('bit-theme', next);
    });

    // Listen for OS-level changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('bit-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // ── AOS (Animate On Scroll) ──────────────────────────────
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0
    });
  }

  // ── Typed.js (Hero Typewriter) ───────────────────────────
  function initTyped() {
    if (typeof Typed === 'undefined') return;
    var el = document.getElementById('typed-output');
    if (!el) return;

    new Typed('#typed-output', {
      strings: [
        'Skilled Workforce',
        'Future Leaders',
        'Trade Professionals',
        'Industrial Champions',
        'Certified Experts'
      ],
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 2200,
      startDelay: 600,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    });
  }

  // ── Swiper (Testimonials) ────────────────────────────────
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    if (!document.querySelector('.testimonial-swiper')) return;

    new Swiper('.testimonial-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: false,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 28 }
      },
      speed: 650
    });
  }

  // ── BIT Trade Galaxy — Continuous particle network with
  //    random icon formations at different positions ──────────
  // Performance-tuned: DPR-aware, spatial-grid connections, batched draws,
  //                    visibility-throttled, debounced resize
  function initParticles() {
    var container = document.getElementById('hero-particles');
    if (!container) return;

    // Respect reduced-motion preference (accessibility + perf)
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;z-index:2;';
    // Safely clear container without innerHTML
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(canvas);

    // Device Pixel Ratio for crisp rendering on HiDPI without oversizing
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function resize() {
      var cw = container.offsetWidth  || window.innerWidth;
      var ch = container.offsetHeight || 520;
      W = cw; H = ch;
      canvas.width  = Math.floor(cw * DPR);
      canvas.height = Math.floor(ch * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    // Debounced resize
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    // ── Colors & Trades ──────────────────────────────────────
    var COLORS = ['#FFD89B', '#7DD3FC', '#F59E0B'];
    var TRADES = [
      { name: 'Electrical Installation\n& Maintenance',       icon: '\uf0e7' },
      { name: 'Plumbing\n& Pipefitting',                      icon: '\uf043' },
      { name: 'Welding\n& Fabrication',                       icon: '\uf06d' },
      { name: 'Motor Vehicle\nMechanics',                     icon: '\uf1b9' },
      { name: 'Carpentry\n& Joinery',                         icon: '\uf6e3' },
      { name: 'Masonry\n& Construction',                      icon: '\uf1b3' },
      { name: 'Information Technology\n& Computer Servicing', icon: '\uf5fc' },
      { name: 'Cosmetology\n& Beauty Culture',                icon: '\uf5bb' },
      { name: 'Garment Construction\n& Fashion Design',       icon: '\uf0c4' },
      { name: 'Food Preparation\n& Culinary Arts',            icon: '\uf2e7' },
      { name: 'Air Conditioning\n& Refrigeration',            icon: '\uf2dc' },
      { name: 'Agriculture\n& Agro-Processing',               icon: '\uf4d8' }
    ];
    TRADES.forEach(function (t, i) { t.color = COLORS[i % COLORS.length]; });

    // ── Helpers ───────────────────────────────────────────────
    function shuffle(arr) {
      var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
      } return a;
    }
    function ease(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function h2r(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }
    function lerpColor(ca, cb, t) {
      var a = h2r(ca), b = h2r(cb);
      return 'rgba('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t);
    }
    function rgba(hex, a) { var c = h2r(hex); return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

    // ── Icon sampler ─────────────────────────────────────────
    var iconCache = {};
    function sampleIcon(iconChar) {
      if (iconCache[iconChar]) return iconCache[iconChar];
      var sz = 400;
      var off = document.createElement('canvas'); off.width = off.height = sz;
      var c = off.getContext('2d');
      c.fillStyle = '#fff';
      c.font = '900 ' + Math.floor(sz * 0.78) + 'px "Font Awesome 6 Free"';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(iconChar, sz / 2, sz / 2);
      var d = c.getImageData(0, 0, sz, sz).data;
      var pts = [], step = 3;
      for (var y = 0; y < sz; y += step)
        for (var x = 0; x < sz; x += step)
          if (d[(y * sz + x) * 4 + 3] > 40) pts.push({ nx: x / sz, ny: y / sz });
      iconCache[iconChar] = pts;
      return pts;
    }

    // ── Build solid icon canvas for a formation ──────────────
    function buildSolidCanvas(iconChar, color, size) {
      var c = document.createElement('canvas');
      c.width = c.height = Math.ceil(size);
      var g = c.getContext('2d');
      g.fillStyle = color;
      g.font = '900 ' + Math.floor(size * 0.78) + 'px "Font Awesome 6 Free"';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(iconChar, size / 2, size / 2);
      return c;
    }

    // ── Galaxy Particles ─────────────────────────────────────
    // Adaptive count: fewer particles on small screens / reduced motion
    var TOTAL = reduceMotion ? 120 : (W < 500 ? 180 : W < 900 ? 240 : 320);
    var particles = [];
    for (var i = 0; i < TOTAL; i++) {
      particles.push({
        x: Math.random() * (W || 800),
        y: Math.random() * (H || 500),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.35 + 0.12,
        alpha: 0,
        // formation state
        formId: -1, ox: 0, oy: 0, tx: 0, ty: 0, conColor: '#FFD89B',
        // which color bucket during free-float: 0 = white, 1 = orange, 2 = blue
        colorBucket: (i % 10 === 0) ? 1 : (i % 10 === 5) ? 2 : 0
      });
    }

    // ── Active Formations ────────────────────────────────────
    var formations = [];
    var formIdCounter = 0;
    var DUR = { converge: 1800, hold: 3000, disperse: 1400 };

    function findForm(id) {
      for (var i = 0; i < formations.length; i++) if (formations[i].id === id) return formations[i];
      return null;
    }

    function spawnFormation() {
      var trade = TRADES[Math.floor(Math.random() * TRADES.length)];
      var pts = sampleIcon(trade.icon);
      if (!pts.length) return;

      // Cap to visible hero content area (not full container which can be very tall)
      var heroEl = document.querySelector('.hero');
      var heroVisible = Math.min(H, window.innerHeight || 600);
      // On tablet/mobile the hero is taller than content; cap to ~600px
      var VH = Math.min(heroVisible, 650);
      var iconSize = W < 500 ? 80 : W < 900 ? 100 : 120;
      var pad = iconSize * 0.5 + 10;

      // Spawn at predefined corner/edge spots to avoid centered hero text
      var spots;
      if (W < 500) {
        // Mobile: only bottom corners and top corners (tiny)
        spots = [
          { x: W * 0.18, y: VH * 0.85 },
          { x: W * 0.82, y: VH * 0.85 },
          { x: W * 0.12, y: VH * 0.12 },
          { x: W * 0.88, y: VH * 0.12 },
        ];
      } else if (W < 900) {
        // Tablet: top corners only (content fills full width lower down)
        spots = [
          { x: W * 0.10, y: VH * 0.15 },
          { x: W * 0.90, y: VH * 0.15 },
          { x: W * 0.08, y: VH * 0.38 },
          { x: W * 0.92, y: VH * 0.38 },
        ];
      } else {
        // Desktop: edges and corners
        spots = [
          { x: W * 0.08, y: VH * 0.25 },  // top-left
          { x: W * 0.92, y: VH * 0.25 },  // top-right
          { x: W * 0.06, y: VH * 0.65 },  // bottom-left
          { x: W * 0.94, y: VH * 0.65 },  // bottom-right
          { x: W * 0.05, y: VH * 0.45 },  // mid-left
          { x: W * 0.95, y: VH * 0.45 },  // mid-right
        ];
      }
      var spot = spots[Math.floor(Math.random() * spots.length)];
      var fx = spot.x + (Math.random() - 0.5) * iconSize * 0.4;
      var fy = spot.y + (Math.random() - 0.5) * iconSize * 0.4;
      fx = Math.max(pad, Math.min(W - pad, fx));
      fy = Math.max(pad, Math.min(VH - pad, fy));
      var ox = fx - iconSize / 2, oy = fy - iconSize / 2;

      // Grab nearest free particles
      var COUNT = W < 500 ? 80 : 120;
      var free = [];
      for (var i = 0; i < TOTAL; i++) {
        if (particles[i].formId === -1) {
          var dx = particles[i].x - fx, dy = particles[i].y - fy;
          free.push({ idx: i, d: dx*dx + dy*dy });
        }
      }
      free.sort(function(a,b){ return a.d - b.d; });
      free = free.slice(0, COUNT);
      if (free.length < 30) return;

      var fid = formIdCounter++;
      var sPts = shuffle(pts);
      var pIdxs = [];

      for (var i = 0; i < free.length; i++) {
        var p = particles[free[i].idx];
        var pt = sPts[i % sPts.length];
        p.formId = fid;
        p.ox = p.x; p.oy = p.y;
        p.tx = ox + pt.nx * iconSize;
        p.ty = oy + pt.ny * iconSize;
        p.conColor = trade.color;
        pIdxs.push(free[i].idx);
      }

      var solidCanvas = buildSolidCanvas(trade.icon, trade.color, iconSize);

      formations.push({
        id: fid, trade: trade, x: ox, y: oy, size: iconSize,
        phase: 'converge', start: Date.now(),
        solidCanvas: solidCanvas, pIdxs: pIdxs
      });

      // Phase transitions via timeouts
      setTimeout(function () {
        var f = findForm(fid); if (f) { f.phase = 'hold'; f.start = Date.now(); }
        setTimeout(function () {
          var f = findForm(fid);
          if (f) {
            f.phase = 'disperse'; f.start = Date.now();
            for (var i = 0; i < f.pIdxs.length; i++) {
              var p = particles[f.pIdxs[i]];
              p.ox = p.x; p.oy = p.y;
              p.tx = p.x + (Math.random() - 0.5) * 300;
              p.ty = p.y + (Math.random() - 0.5) * 300;
            }
          }
          setTimeout(function () {
            var f = findForm(fid);
            if (f) {
              for (var i = 0; i < f.pIdxs.length; i++) particles[f.pIdxs[i]].formId = -1;
              formations = formations.filter(function (ff) { return ff.id !== fid; });
            }
          }, DUR.disperse);
        }, DUR.hold);
      }, DUR.converge);
    }

    // Random spawn scheduler
    function scheduleSpawn() {
      var delay = 2500 + Math.random() * 3500;
      setTimeout(function () { spawnFormation(); scheduleSpawn(); }, delay);
    }

    // ── Render Loop (optimized) ──────────────────────────────
    // Perf techniques:
    //   1. Spatial hash grid reduces O(n^2) connection check to ~O(n)
    //   2. Particles drawn in ONE path per alpha-bucket (batching)
    //   3. Connection lines drawn in ONE path per alpha-bucket
    //   4. Throttle to 60 FPS, pause when tab hidden or hero off-screen
    //   5. Single Date.now() per frame
    //   6. Cached string concatenations and hoisted locals
    var lastTs = 0, lastNow = 0;
    var running = true;         // tab visibility
    var heroVisible = true;     // hero in viewport
    var FRAME_MS = 1000 / 60;   // 60 FPS cap

    // Connection drawing: spatial hash grid
    var CDIST = 130;                        // connection radius
    var CDIST2 = CDIST * CDIST;
    var cellSize = CDIST;
    // Cached buckets (reused each frame to avoid GC churn)
    var grid = Object.create(null);

    // Alpha buckets for batched particle/line drawing
    var ALPHA_BUCKETS = 6;
    function bucketKey(a) {
      var i = (a * ALPHA_BUCKETS) | 0;
      if (i < 0) i = 0; else if (i >= ALPHA_BUCKETS) i = ALPHA_BUCKETS - 1;
      return i;
    }

    // Pre-allocated path objects per bucket/color — filled each frame, drawn once
    // colors: 0=white, 1=orange, 2=blue (free float) + trade-colors for formations
    function makeBuckets(n) { var a = []; for (var i = 0; i < n; i++) a.push([]); return a; }

    // Pause rendering when hero section scrolls out of viewport.
    // Only trust the observer once the element has real layout dimensions;
    // otherwise the initial callback can arrive with isIntersecting=false
    // before the page has finished laying out and stall the render loop.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        var e = entries[0];
        var r = e.boundingClientRect;
        if (r && (r.width > 0 || r.height > 0)) {
          heroVisible = e.isIntersecting;
        }
      }, { threshold: 0 });
      io.observe(container);
    }
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) { lastTs = performance.now(); requestAnimationFrame(frame); }
    });

    function frame(ts) {
      if (!running || !heroVisible) { requestAnimationFrame(frame); return; }
      requestAnimationFrame(frame);

      // 60 FPS cap (skip frame if not enough time elapsed)
      var delta = ts - lastTs;
      if (delta < FRAME_MS - 0.5) return;
      lastTs = ts;
      var dt = Math.min(delta, 50);
      lastNow = Date.now();

      ctx.clearRect(0, 0, W, H);

      // ── Draw solid icons for active formations ─────────────
      var fCount = formations.length;
      for (var fi = 0; fi < fCount; fi++) {
        var f = formations[fi];
        var elF = lastNow - f.start;
        var ia = 0;
        if (f.phase === 'converge') ia = ease(Math.min(elF / DUR.converge, 1));
        else if (f.phase === 'hold') ia = 1;
        else if (f.phase === 'disperse') ia = 1 - ease(Math.min(elF / DUR.disperse, 1));
        if (ia > 0.01) {
          ctx.globalAlpha = ia * 0.85;
          ctx.drawImage(f.solidCanvas, f.x, f.y, f.size, f.size);
        }
      }
      ctx.globalAlpha = 1;

      // ── Update particles + build spatial grid ──────────────
      // Clear grid (reuse keys where possible)
      for (var k in grid) grid[k].length = 0;

      var dtNorm = dt / 16;
      var tsCol = ts * 0.001;  // sin argument base
      for (var i = 0; i < TOTAL; i++) {
        var p = particles[i];

        if (p.formId !== -1) {
          var ff = findForm(p.formId);
          if (ff) {
            var el2 = lastNow - ff.start;
            var t;
            if (ff.phase === 'converge') {
              t = ease(Math.min(el2 / DUR.converge, 1));
              p.x = p.ox + (p.tx - p.ox) * t;
              p.y = p.oy + (p.ty - p.oy) * t;
              p.alpha = p.baseAlpha + (1 - p.baseAlpha) * t;
            } else if (ff.phase === 'hold') {
              p.x = p.tx; p.y = p.ty; p.alpha = 1;
            } else {
              t = ease(Math.min(el2 / DUR.disperse, 1));
              p.x = p.ox + (p.tx - p.ox) * t;
              p.y = p.oy + (p.ty - p.oy) * t;
              p.alpha = 1 + (p.baseAlpha - 1) * t;
            }
          } else { p.formId = -1; }
        } else {
          // Free float
          p.x += p.vx * dtNorm; p.y += p.vy * dtNorm;
          if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
          // Shimmer — abs(sin) is expensive; approximate with cheaper fn
          var s = Math.sin(tsCol + i * 0.5);
          if (s < 0) s = -s;
          p.alpha = p.baseAlpha + s * 0.18;
        }

        // Insert into spatial hash grid (only free particles connect)
        if (p.formId === -1) {
          var gx = (p.x / cellSize) | 0;
          var gy = (p.y / cellSize) | 0;
          var key = gx + ',' + gy;
          (grid[key] || (grid[key] = [])).push(i);
        }
      }

      // ── Draw connection lines using spatial grid ───────────
      // Each particle only checks its 9 neighboring cells (constant-time)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      for (var key in grid) {
        var cell = grid[key];
        if (!cell.length) continue;
        var comma = key.indexOf(',');
        var gx = +key.substring(0, comma);
        var gy = +key.substring(comma + 1);
        for (var a = 0; a < cell.length; a++) {
          var ia2 = cell[a];
          var pa = particles[ia2];
          // Check current cell (pairs only once per unordered pair) + 4 neighbors
          // (right, down-left, down, down-right) to avoid double-counting
          for (var b = a + 1; b < cell.length; b++) {
            var pb = particles[cell[b]];
            var dx = pa.x - pb.x, dy = pa.y - pb.y, d2 = dx*dx + dy*dy;
            if (d2 < CDIST2) { ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); }
          }
          var neigh = [[gx+1, gy], [gx-1, gy+1], [gx, gy+1], [gx+1, gy+1]];
          for (var n = 0; n < 4; n++) {
            var nc = grid[neigh[n][0] + ',' + neigh[n][1]];
            if (!nc) continue;
            for (var c = 0; c < nc.length; c++) {
              var pc = particles[nc[c]];
              var dx2 = pa.x - pc.x, dy2 = pa.y - pc.y, d22 = dx2*dx2 + dy2*dy2;
              if (d22 < CDIST2) { ctx.moveTo(pa.x, pa.y); ctx.lineTo(pc.x, pc.y); }
            }
          }
        }
      }
      ctx.stroke();

      // ── Draw particles — batched by color ──────────────────
      // White (most), orange (accent), blue (accent), + formation-color per formation
      var TAU = Math.PI * 2;
      // White pass
      ctx.beginPath();
      for (var i = 0; i < TOTAL; i++) {
        var p = particles[i];
        if (p.formId !== -1 || p.colorBucket !== 0) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, TAU);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();

      // Orange accent pass
      ctx.beginPath();
      for (var i = 0; i < TOTAL; i++) {
        var p = particles[i];
        if (p.formId !== -1 || p.colorBucket !== 1) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, TAU);
      }
      ctx.fillStyle = 'rgba(242,101,34,0.75)';
      ctx.fill();

      // Blue accent pass
      ctx.beginPath();
      for (var i = 0; i < TOTAL; i++) {
        var p = particles[i];
        if (p.formId !== -1 || p.colorBucket !== 2) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, TAU);
      }
      ctx.fillStyle = 'rgba(46,107,196,0.75)';
      ctx.fill();

      // Formation particles — one path per formation color
      for (var fi2 = 0; fi2 < fCount; fi2++) {
        var f3 = formations[fi2];
        ctx.beginPath();
        var ids = f3.pIdxs;
        for (var q = 0; q < ids.length; q++) {
          var pp = particles[ids[q]];
          var ds = pp.size + 1.5;
          ctx.moveTo(pp.x + ds, pp.y);
          ctx.arc(pp.x, pp.y, ds, 0, TAU);
        }
        ctx.fillStyle = rgba(f3.trade.color, 0.95);
        ctx.fill();
      }

      // ── Draw formation labels ──────────────────────────────
      for (var fi3 = 0; fi3 < fCount; fi3++) {
        var f2 = formations[fi3];
        var el3 = lastNow - f2.start;
        var la = 0;
        if (f2.phase === 'converge') la = ease(Math.min(el3 / DUR.converge, 1)) * 0.9;
        else if (f2.phase === 'hold') la = 0.95;
        else if (f2.phase === 'disperse') la = (1 - ease(Math.min(el3 / DUR.disperse, 1))) * 0.9;
        if (la > 0.01) {
          var lx = f2.x + f2.size / 2;
          var ly = f2.y + f2.size + 4;
          var lines = f2.trade.name.split('\n');
          var fs = W < 500 ? 9 : 11;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.shadowColor = f2.trade.color;
          ctx.shadowBlur = 14;
          ctx.font = '700 ' + fs + 'px "Inter",-apple-system,sans-serif';
          ctx.fillStyle = rgba(f2.trade.color, la * 0.9);
          for (var li = 0; li < lines.length; li++) {
            ctx.fillText(lines[li].toUpperCase(), lx, ly + li * (fs + 3));
          }
          ctx.shadowBlur = 0;
        }
      }
    }

    // ── Start ────────────────────────────────────────────────
    // Start rendering immediately — the frame loop doesn't depend on fonts
    // (only sampleIcon does, and the first spawnFormation runs after 2.5s).
    // This avoids a dead-start when document.fonts.ready doesn't resolve
    // in time or the IntersectionObserver reports !isIntersecting early.
    // Note: when the tab is hidden on initial load, the browser pauses rAF;
    // the visibilitychange listener above will resume the loop on focus.
    lastTs = performance.now();
    requestAnimationFrame(frame);

    // Wait for fonts before sampling icons for formations.
    var startSpawns = function () {
      if (!reduceMotion) {
        setTimeout(function () { spawnFormation(); scheduleSpawn(); }, 2500);
      }
    };
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(startSpawns, startSpawns);
    } else {
      startSpawns();
    }
  }

  // ── GSAP + ScrollTrigger (Scroll-driven Storytelling) ────
  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // ─ Hero entrance: handled by CSS keyframes (see enhancements.css) ─
    // GSAP handles scroll-driven effects only, not initial entrance

    if (typeof ScrollTrigger === 'undefined') return;

    // ── Helper: scroll-triggered reveal (no pre-hidden state) ──
    function scrollReveal(targets, triggerEl, startPos, fromVars, toVars) {
      var els = gsap.utils.toArray(targets);
      if (!els.length) return;
      ScrollTrigger.create({
        trigger: triggerEl,
        start: startPos || 'top 85%',
        once: true,
        onEnter: function () {
          gsap.fromTo(els, fromVars, toVars);
        }
      });
    }

    // ─ Stats banner: stagger in with scale ─
    scrollReveal('.stat-item', '.stats-banner', 'top 85%',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    // ─ Scroll indicator fades away on scroll ─
    if (document.querySelector('.scroll-indicator')) {
      gsap.to('.scroll-indicator', {
        scrollTrigger: {
          trigger: '.hero',
          start: '10% top',
          end: '25% top',
          scrub: true
        },
        opacity: 0, y: 20
      });
    }

    // ─ CTA sections: subtle parallax background ─
    document.querySelectorAll('.cta-section').forEach(function (section) {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        backgroundPosition: '50% 30%',
        ease: 'none'
      });
    });

    // ─ Why BIT: left column text slides in, right column staggers ─
    if (document.querySelector('.why-bit-text')) {
      scrollReveal('.why-bit-text', '.why-bit-grid', 'top 75%',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
      );

      scrollReveal('.features-column .feature-card', '.features-column', 'top 80%',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }

    // ─ Footer columns stagger ─
    scrollReveal('.footer-grid > div', '.footer', 'top 85%',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
    );

    // ─ Programmes bento stagger ─
    scrollReveal('.bento-programmes .programme-card', '.bento-programmes', 'top 80%',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
  }

  // ── Micro-Interactions ───────────────────────────────────
  function initMicroInteractions() {
    // Magnetic hover on glow buttons
    if (typeof gsap !== 'undefined') {
      document.querySelectorAll('.btn-glow').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var rect = btn.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.12, y: y * 0.12, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
      });
    }

    // Tilt effect on feature cards
    document.querySelectorAll('.feature-card, .programme-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'translateY(-6px) perspective(800px) rotateX(' + (y * -4) + 'deg) rotateY(' + (x * 4) + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'all 0.5s cubic-bezier(0.2, 0, 0, 1)';
      });
    });

    // Number count-up with monospace styling
    addMonospaceCounters();
  }

  function addMonospaceCounters() {
    document.querySelectorAll('.stat-number, .hero-stat .number').forEach(function (el) {
      el.style.fontVariantNumeric = 'tabular-nums';
    });
  }

})();
