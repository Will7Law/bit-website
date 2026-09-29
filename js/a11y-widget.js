/* ═══════════════════════════════════════════════════════════════
   Accessibility Widget — Persons-with-Disabilities controls
   ───────────────────────────────────────────────────────────────
   A small floating button (bottom-left) that opens a panel with
   user-facing accessibility controls:
     • Text size  (smaller / default / larger / largest)
     • High contrast mode (boosts contrast site-wide)
     • Reduce motion (kills transitions + animations)
     • Reset

   All settings persist via localStorage and reapply on every page.
   Designed to coexist with the dark/light theme toggle already on
   the site. No third-party dependencies; no FontAwesome required.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORE = 'bit-a11y-v1';
  var DEFAULTS = { size: 100, contrast: false, motion: false };
  var STATE = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULTS, parsed);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(STATE)); } catch (e) {}
  }

  function applyState() {
    var html = document.documentElement;
    // Text size — proportional zoom via root font-size
    html.style.setProperty('--bit-a11y-zoom', STATE.size + '%');
    if (STATE.size !== 100) html.style.fontSize = STATE.size + '%';
    else html.style.fontSize = '';
    // High contrast — adds a class the inline stylesheet styles
    html.classList.toggle('bit-a11y-contrast', !!STATE.contrast);
    // Reduce motion — adds a class that kills transitions/animations
    html.classList.toggle('bit-a11y-reduce-motion', !!STATE.motion);
  }

  function injectStyle() {
    if (document.getElementById('bit-a11y-style')) return;
    var css = ''
      /* High-contrast — boosts text contrast & focus rings site-wide */
      + 'html.bit-a11y-contrast body,'
      + 'html.bit-a11y-contrast p,'
      + 'html.bit-a11y-contrast li,'
      + 'html.bit-a11y-contrast span,'
      + 'html.bit-a11y-contrast a,'
      + 'html.bit-a11y-contrast h1, html.bit-a11y-contrast h2,'
      + 'html.bit-a11y-contrast h3, html.bit-a11y-contrast h4 {'
      + '  color: #ffffff !important;'
      + '}'
      + 'html.bit-a11y-contrast body{ background:#000 !important; }'
      + 'html.bit-a11y-contrast section,'
      + 'html.bit-a11y-contrast main,'
      + 'html.bit-a11y-contrast header,'
      + 'html.bit-a11y-contrast footer{ background:#000 !important; color:#fff !important; }'
      + 'html.bit-a11y-contrast a{ color:#FFD166 !important; text-decoration:underline !important; }'
      + 'html.bit-a11y-contrast :focus-visible{ outline:3px solid #FFD166 !important; outline-offset:3px !important; }'
      /* Reduce motion */
      + 'html.bit-a11y-reduce-motion *,'
      + 'html.bit-a11y-reduce-motion *::before,'
      + 'html.bit-a11y-reduce-motion *::after {'
      + '  animation-duration: .001ms !important;'
      + '  animation-iteration-count: 1 !important;'
      + '  transition-duration: .001ms !important;'
      + '  scroll-behavior: auto !important;'
      + '}'
      /* Widget shell */
      + '.bit-a11y-fab{ position:fixed; left:18px; bottom:18px; z-index:9500;'
      + '  width:48px; height:48px; border-radius:50%;'
      + '  background:linear-gradient(180deg,#1B4D8E,#0F3568);'
      + '  color:#fff; border:1px solid rgba(255,255,255,0.18);'
      + '  box-shadow:0 8px 24px rgba(0,0,0,0.30);'
      + '  display:inline-flex; align-items:center; justify-content:center;'
      + '  cursor:pointer; transition:transform .2s ease, box-shadow .2s ease;'
      + '  -webkit-tap-highlight-color:transparent;'
      + '}'
      + '.bit-a11y-fab:hover{ transform:translateY(-2px); box-shadow:0 14px 32px rgba(0,0,0,0.45); }'
      + '.bit-a11y-fab:focus-visible{ outline:3px solid #FFA45A; outline-offset:3px; }'
      + '.bit-a11y-fab svg{ width:24px; height:24px; }'
      + '.bit-a11y-panel{ position:fixed; left:18px; bottom:78px; z-index:9500;'
      + '  width:300px; max-width:calc(100vw - 36px);'
      + '  background:#0F1F3F; color:#fff;'
      + '  border:1px solid rgba(255,255,255,0.12);'
      + '  border-radius:14px; padding:18px 18px 16px;'
      + '  box-shadow:0 24px 60px rgba(0,0,0,0.55);'
      + '  font-family:Inter,system-ui,sans-serif;'
      + '  display:none;'
      + '}'
      + '.bit-a11y-panel.is-open{ display:block; }'
      + '.bit-a11y-panel h3{ font-size:.95rem; margin:0 0 12px; color:#fff; font-weight:700; letter-spacing:0; }'
      + '.bit-a11y-row{ margin-bottom:14px; }'
      + '.bit-a11y-row > label{ display:block; font-size:.78rem; color:rgba(255,255,255,0.65); margin-bottom:6px; letter-spacing:.04em; }'
      + '.bit-a11y-btnrow{ display:flex; gap:6px; flex-wrap:wrap; }'
      + '.bit-a11y-btn{ flex:1; min-width:0; padding:8px 6px; font-size:.82rem;'
      + '  background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.14);'
      + '  border-radius:9px; cursor:pointer; font-family:inherit;'
      + '}'
      + '.bit-a11y-btn:hover{ background:rgba(255,255,255,0.12); }'
      + '.bit-a11y-btn[aria-pressed="true"]{ background:#F26522; border-color:#F26522; color:#fff; font-weight:600; }'
      + '.bit-a11y-btn:focus-visible{ outline:2px solid #FFA45A; outline-offset:2px; }'
      + '.bit-a11y-foot{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:6px; }'
      + '.bit-a11y-reset{ font-size:.78rem; background:none; border:0; color:#FFA45A; cursor:pointer; padding:4px 6px; font-family:inherit; }'
      + '.bit-a11y-reset:hover{ color:#fff; text-decoration:underline; }'
      + '.bit-a11y-more{ font-size:.78rem; color:rgba(255,255,255,0.65); text-decoration:underline; }'
      + '.bit-a11y-more:hover{ color:#fff; }'
      + '@media (max-width:480px){ .bit-a11y-fab{ left:12px; bottom:12px; } .bit-a11y-panel{ left:12px; bottom:70px; } }';
    var st = document.createElement('style');
    st.id = 'bit-a11y-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function makeButton(label, ariaLabel, pressed, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bit-a11y-btn';
    b.textContent = label;
    b.setAttribute('aria-label', ariaLabel);
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', onClick);
    return b;
  }

  function buildPanel() {
    var p = document.createElement('div');
    p.className = 'bit-a11y-panel';
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Accessibility settings');

    var h = document.createElement('h3');
    h.textContent = 'Accessibility settings';
    p.appendChild(h);

    /* Text size */
    var row1 = document.createElement('div');
    row1.className = 'bit-a11y-row';
    var lab1 = document.createElement('label');
    lab1.textContent = 'Text size';
    row1.appendChild(lab1);
    var brow1 = document.createElement('div'); brow1.className = 'bit-a11y-btnrow';
    var sizes = [
      { v: 90,  label: 'Smaller' },
      { v: 100, label: 'Default' },
      { v: 115, label: 'Larger' },
      { v: 130, label: 'Largest' },
    ];
    sizes.forEach(function (s) {
      var btn = makeButton(s.label, 'Set text size to ' + s.label, STATE.size === s.v, function () {
        STATE.size = s.v;
        save(); applyState();
        Array.from(brow1.children).forEach(function (c, i) {
          c.setAttribute('aria-pressed', sizes[i].v === s.v ? 'true' : 'false');
        });
      });
      brow1.appendChild(btn);
    });
    row1.appendChild(brow1);
    p.appendChild(row1);

    /* High contrast */
    var row2 = document.createElement('div');
    row2.className = 'bit-a11y-row';
    var lab2 = document.createElement('label');
    lab2.textContent = 'High-contrast mode';
    row2.appendChild(lab2);
    var brow2 = document.createElement('div'); brow2.className = 'bit-a11y-btnrow';
    [['Off', false], ['On', true]].forEach(function (pair) {
      var btn = makeButton(pair[0], 'High-contrast ' + pair[0], STATE.contrast === pair[1], function () {
        STATE.contrast = pair[1];
        save(); applyState();
        Array.from(brow2.children).forEach(function (c, i) {
          c.setAttribute('aria-pressed',
            (i === 0 && !STATE.contrast) || (i === 1 && STATE.contrast) ? 'true' : 'false');
        });
      });
      brow2.appendChild(btn);
    });
    row2.appendChild(brow2);
    p.appendChild(row2);

    /* Reduce motion */
    var row3 = document.createElement('div');
    row3.className = 'bit-a11y-row';
    var lab3 = document.createElement('label');
    lab3.textContent = 'Reduce motion / animations';
    row3.appendChild(lab3);
    var brow3 = document.createElement('div'); brow3.className = 'bit-a11y-btnrow';
    [['Off', false], ['On', true]].forEach(function (pair) {
      var btn = makeButton(pair[0], 'Reduce motion ' + pair[0], STATE.motion === pair[1], function () {
        STATE.motion = pair[1];
        save(); applyState();
        Array.from(brow3.children).forEach(function (c, i) {
          c.setAttribute('aria-pressed',
            (i === 0 && !STATE.motion) || (i === 1 && STATE.motion) ? 'true' : 'false');
        });
      });
      brow3.appendChild(btn);
    });
    row3.appendChild(brow3);
    p.appendChild(row3);

    /* Foot */
    var foot = document.createElement('div');
    foot.className = 'bit-a11y-foot';
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'bit-a11y-reset';
    reset.textContent = 'Reset to defaults';
    reset.addEventListener('click', function () {
      STATE = Object.assign({}, DEFAULTS);
      save(); applyState();
      // Re-render the panel to refresh button states
      panel.parentNode.replaceChild(buildPanel(), panel);
      panel = document.querySelector('.bit-a11y-panel');
      panel.classList.add('is-open');
    });
    var more = document.createElement('a');
    more.href = locateAccessibilityPage();
    more.className = 'bit-a11y-more';
    more.textContent = 'More info';
    foot.appendChild(reset);
    foot.appendChild(more);
    p.appendChild(foot);
    return p;
  }

  function locateAccessibilityPage() {
    // Choose relative path based on whether we're at the site root or
    // inside /pages/.
    return location.pathname.indexOf('/pages/') !== -1
      ? 'accessibility.html'
      : 'pages/accessibility.html';
  }

  var panel = null;
  function ensurePanel() {
    if (panel && document.body.contains(panel)) return panel;
    panel = buildPanel();
    document.body.appendChild(panel);
    return panel;
  }

  function makeFab() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'bit-a11y-fab';
    fab.setAttribute('aria-label', 'Open accessibility settings');
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2"/><path d="M4 9h16"/><path d="M9 9v4l-2 8"/><path d="M15 9v4l2 8"/><path d="M9 13h6"/></svg>';
    fab.addEventListener('click', function () {
      var p = ensurePanel();
      var open = p.classList.toggle('is-open');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    return fab;
  }

  function boot() {
    injectStyle();
    applyState();
    document.body.appendChild(makeFab());
    // Click outside the panel closes it
    document.addEventListener('click', function (ev) {
      var p = ensurePanel();
      if (!p.classList.contains('is-open')) return;
      if (p.contains(ev.target)) return;
      if (ev.target.closest('.bit-a11y-fab')) return;
      p.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        var p = ensurePanel();
        if (p.classList.contains('is-open')) p.classList.remove('is-open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
