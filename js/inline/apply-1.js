/* Extracted from pages/apply.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
let currentStep = 1;
  let selectedProgramme = '';

  function selectProgramme(el, name) {
    document.querySelectorAll('.programme-select-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedProgramme = name;
  }

  // Pre-select from URL param (sanitize input to allow only safe chars)
  (function() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('programme');
    if (!raw) return;
    // Only allow letters, digits, spaces and hyphens — prevents injection via URL
    const p = String(raw).replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 60);
    if (!p) return;
    document.querySelectorAll('.programme-select-card').forEach(card => {
      const strong = card.querySelector('strong');
      if (strong && strong.textContent.toLowerCase().includes(p.toLowerCase())) {
        card.classList.add('selected');
        selectedProgramme = strong.textContent;
      }
    });
  })();

  function updateProgress() {
    const items = document.querySelectorAll('.step-item');
    const fill = document.getElementById('progressFill');
    const pct = ((currentStep - 1) / (items.length - 1)) * 80;
    fill.style.width = pct + '%';

    items.forEach((item, i) => {
      item.classList.remove('active', 'completed');
      if (i + 1 === currentStep) item.classList.add('active');
      else if (i + 1 < currentStep) item.classList.add('completed');
    });
  }

  function nextStep(step) {
    // Validation
    if (currentStep === 1 && !selectedProgramme) {
      alert('Please select a programme to continue.');
      return;
    }

    document.getElementById('step' + currentStep).classList.remove('active');
    currentStep = step;
    document.getElementById('step' + currentStep).classList.add('active');
    updateProgress();
    window.scrollTo({ top: 300, behavior: 'smooth' });

    if (step === 4) buildReview();
  }

  function prevStep(step) {
    document.getElementById('step' + currentStep).classList.remove('active');
    currentStep = step;
    document.getElementById('step' + currentStep).classList.add('active');
    updateProgress();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  // Security: build review DOM with safe text nodes (no innerHTML with user input)
  function buildReview() {
    const v = id => { const el = document.getElementById(id); return el ? (el.value || 'Not provided') : 'Not provided'; };
    const root = document.getElementById('reviewContent');
    root.textContent = ''; // clear safely

    const makeSection = (iconClass, title, rows) => {
      const h3 = document.createElement('h3');
      h3.style.cssText = 'margin-bottom:var(--space-md);font-size:1.1rem';
      const i = document.createElement('i');
      i.className = iconClass;
      i.style.cssText = 'color:var(--primary);margin-right:6px';
      h3.appendChild(i);
      h3.appendChild(document.createTextNode(' ' + title));
      root.appendChild(h3);

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm) var(--space-xl);margin-bottom:var(--space-xl);font-size:0.92rem';
      rows.forEach(([label, value, fullWidth]) => {
        const div = document.createElement('div');
        if (fullWidth) div.style.gridColumn = 'span 2';
        const strong = document.createElement('strong');
        strong.textContent = label + ':';
        div.appendChild(strong);
        div.appendChild(document.createTextNode(' ' + value));
        grid.appendChild(div);
      });
      root.appendChild(grid);
    };

    makeSection('fas fa-graduation-cap', 'Programme', [
      ['Programme', selectedProgramme || 'Not selected'],
      ['Intake', v('intakePeriod')],
      ['Preferred Region', v('prefRegion')]
    ]);

    makeSection('fas fa-user', 'Personal Information', [
      ['Name', v('firstName') + ' ' + v('lastName')],
      ['Date of Birth', v('dob')],
      ['Gender', v('gender')],
      ['National ID', v('nationalId')],
      ['Phone', v('phone')],
      ['Email', v('email')],
      ['Address', v('address'), true]
    ]);

    makeSection('fas fa-file-alt', 'Education', [
      ['Education Level', v('education')],
      ['Last School', v('lastSchool')],
      ['Work Experience', v('experience')]
    ]);
  }

  function submitApplication() {
    if (!document.getElementById('truthful').checked || !document.getElementById('privacy').checked) {
      alert('Please accept both declarations to submit your application.');
      return;
    }

    // Generate reference number
    const ref = 'BIT-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    document.getElementById('refCode').textContent = ref;

    // Hide all steps, show success
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    document.getElementById('stepSuccess').classList.add('active');
    document.querySelector('.step-progress').style.display = 'none';
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
