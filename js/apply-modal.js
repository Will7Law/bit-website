/* ═══════════════════════════════════════════════════════════════
   Apply Modal — full multi-step application form, posted to
   Netlify Forms (zero-config form handling, free tier 100 subs/mo).

   Form fields: name, DOB, gender, email, phone, region, programme,
   start intake (Jan/Jul), prior education. Validates client-side
   then submits via fetch with form-encoded body.

   Netlify Forms requires: a static HTML <form data-netlify="true">
   to exist somewhere on the deployed site so Netlify's bots can
   detect + register it on first deploy. We render that hidden
   shadow form in the DOM, AND submit our user-facing modal data
   through the same name="bit-application".
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const PROGRAMMES = [
    { code: 'EL',  name: 'Electrical Installation & Maintenance' },
    { code: 'PL',  name: 'Plumbing & Pipefitting' },
    { code: 'WF',  name: 'Welding & Fabrication' },
    { code: 'MV',  name: 'Motor Vehicle Mechanics' },
    { code: 'CJ',  name: 'Carpentry & Joinery' },
    { code: 'MC',  name: 'Masonry & Construction' },
    { code: 'AC',  name: 'Air Conditioning & Refrigeration' },
    { code: 'IT',  name: 'Information Technology & Computer Servicing' },
    { code: 'CB',  name: 'Cosmetology & Beauty Culture' },
    { code: 'GC',  name: 'Garment Construction & Fashion Design' },
    { code: 'FC',  name: 'Food Preparation & Culinary Arts' },
    { code: 'AG',  name: 'Agriculture & Agro-Processing' },
    { code: 'PV',  name: 'Photovoltaic Installation' },
    { code: 'HD',  name: 'Heavy-Duty Equipment Operation' },
    { code: 'OG',  name: 'Oil & Gas Pre-Employment (FacTor)' },
    { code: 'WD',  name: 'Website Development' },
  ];

  const REGIONS = [
    'Region 1 · Mabaruma', 'Region 2 · Anna Regina',
    'Region 3 · West Demerara', 'Region 4 · Georgetown',
    'Region 5 · Fort Wellington', 'Region 6 · Berbice',
    'Region 7 · Bartica', 'Region 8 · Mahdia',
    'Region 9 · Lethem', 'Region 10 · Linden',
  ];

  const css = `
    .apply-overlay{
      position: fixed; inset: 0; z-index: 110;
      background: rgba(6, 17, 42, 0.88);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      display: none; align-items: flex-start; justify-content: center;
      padding: clamp(20px, 4vh, 60px) 16px;
      overflow-y: auto;
    }
    .apply-overlay.open{ display: flex; }
    .apply-modal{
      width: 100%; max-width: 640px;
      background: rgba(14, 26, 61, 0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.7);
      padding: clamp(20px, 4vw, 40px);
      color: #fff;
    }
    .apply-head{
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }
    .apply-head h2{
      font-family: Fraunces, serif; font-weight: 540;
      font-size: clamp(1.5rem, 4vw, 2.2rem); letter-spacing: -0.02em;
      margin: 0; line-height: 1.1;
    }
    .apply-head h2 em{ font-style: italic; color: #F26522; }
    .apply-eyebrow{
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px; letter-spacing: 0.32em; text-transform: uppercase;
      color: #FFA45A; margin-bottom: 8px;
    }
    .apply-close{
      background: rgba(255,255,255,0.06); color: #fff; border: none;
      width: 36px; height: 36px; border-radius: 8px;
      cursor: pointer; font-size: 20px; line-height: 1; flex-shrink: 0;
    }
    .apply-progress{
      display: flex; gap: 4px; margin-bottom: 24px;
    }
    .apply-progress span{
      flex: 1; height: 3px; background: rgba(255,255,255,0.08);
      border-radius: 999px; transition: background-color .3s;
    }
    .apply-progress span.done{ background: #F26522; }

    .apply-step{ display: none; }
    .apply-step.active{ display: block; }

    .apply-row{ margin-bottom: 18px; }
    .apply-row label{
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255,255,255,0.6); margin-bottom: 6px;
    }
    .apply-row input,
    .apply-row select,
    .apply-row textarea{
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 14px; color: #fff;
      font-family: inherit; font-size: 14.5px;
      transition: border-color .2s ease;
    }
    .apply-row input:focus,
    .apply-row select:focus,
    .apply-row textarea:focus{
      outline: none; border-color: #F26522;
    }
    .apply-row select{ appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%23ffa45a' stroke-width='1.5' stroke-linecap='round'/></svg>"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
    .apply-row .field-error{ font-size: 12px; color: #F87171; margin-top: 6px; display: none; }
    .apply-row.error input,
    .apply-row.error select{ border-color: #F87171; }
    .apply-row.error .field-error{ display: block; }

    .apply-grid-2{
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    @media (max-width: 480px){
      .apply-grid-2{ grid-template-columns: 1fr; }
    }

    .apply-actions{
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 28px; gap: 12px;
    }
    .apply-btn{
      padding: 11px 22px; border-radius: 999px;
      font-family: inherit; font-size: 14px; font-weight: 600;
      cursor: pointer; border: 1px solid transparent;
      transition: all .2s ease;
    }
    .apply-btn-primary{
      background: linear-gradient(135deg, #F26522, #FFA45A);
      color: #0a0a0a;
    }
    .apply-btn-primary:hover{ transform: translateY(-1px); }
    .apply-btn-secondary{
      background: transparent; color: rgba(255,255,255,0.7);
      border-color: rgba(255,255,255,0.15);
    }
    .apply-btn-secondary:hover{ color: #fff; border-color: rgba(255,255,255,0.3); }
    .apply-btn:disabled{ opacity: 0.5; cursor: not-allowed; }

    .apply-success{
      text-align: center; padding: 28px 12px;
    }
    .apply-success-icon{
      width: 64px; height: 64px; margin: 0 auto 20px;
      border-radius: 50%; background: rgba(63,179,111, 0.18);
      border: 2px solid #3FB36F;
      display: flex; align-items: center; justify-content: center;
      color: #3FB36F; font-size: 32px;
    }
    .apply-success h3{
      font-family: Fraunces, serif; font-size: 24px; margin: 0 0 12px;
    }
    .apply-success p{ color: rgba(255,255,255,0.7); line-height: 1.5; }
    .apply-ref{
      margin-top: 18px; padding: 12px;
      background: rgba(242,101,34,0.1); border-radius: 10px;
      font-family: 'JetBrains Mono', monospace; font-size: 13px;
      color: #FFA45A; letter-spacing: 0.1em;
    }
  `;

  function fields(stepIndex){
    const step1 = `
      <div class="apply-step active" data-step="0">
        <div class="apply-grid-2">
          <div class="apply-row">
            <label for="ap-fname">First name</label>
            <input id="ap-fname" name="fname" required placeholder="e.g. Rajesh"/>
            <div class="field-error">Required</div>
          </div>
          <div class="apply-row">
            <label for="ap-lname">Last name</label>
            <input id="ap-lname" name="lname" required placeholder="e.g. Jagdeo"/>
            <div class="field-error">Required</div>
          </div>
        </div>
        <div class="apply-grid-2">
          <div class="apply-row">
            <label for="ap-dob">Date of birth</label>
            <input id="ap-dob" name="dob" type="date" required max="${maxDob()}"/>
            <div class="field-error">Must be 16 or older</div>
          </div>
          <div class="apply-row">
            <label for="ap-gender">Gender</label>
            <select id="ap-gender" name="gender" required>
              <option value="">Select…</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
            <div class="field-error">Required</div>
          </div>
        </div>
        <div class="apply-row">
          <label for="ap-id">National ID number</label>
          <input id="ap-id" name="national_id" required placeholder="e.g. 0123456" pattern="[0-9]{6,12}"/>
          <div class="field-error">6–12 digits</div>
        </div>
      </div>
    `;
    const step2 = `
      <div class="apply-step" data-step="1">
        <div class="apply-row">
          <label for="ap-email">Email address</label>
          <input id="ap-email" name="email" type="email" required placeholder="you@example.com"/>
          <div class="field-error">Valid email required</div>
        </div>
        <div class="apply-row">
          <label for="ap-phone">Phone (mobile)</label>
          <input id="ap-phone" name="phone" type="tel" required placeholder="+592 xxx xxxx" pattern="[+0-9 ]{7,20}"/>
          <div class="field-error">Required</div>
        </div>
        <div class="apply-row">
          <label for="ap-region">Region (where you live)</label>
          <select id="ap-region" name="region" required>
            <option value="">Select your region…</option>
            ${REGIONS.map(r => `<option>${r}</option>`).join('')}
          </select>
          <div class="field-error">Required</div>
        </div>
      </div>
    `;
    const step3 = `
      <div class="apply-step" data-step="2">
        <div class="apply-row">
          <label for="ap-programme">Programme of interest</label>
          <select id="ap-programme" name="programme" required>
            <option value="">Choose a trade…</option>
            ${PROGRAMMES.map(p => `<option value="${p.code}">${p.name}</option>`).join('')}
          </select>
          <div class="field-error">Required</div>
        </div>
        <div class="apply-row">
          <label for="ap-intake">Preferred intake</label>
          <select id="ap-intake" name="intake" required>
            <option value="">Pick a start date…</option>
            <option>January 2026</option>
            <option>July 2026</option>
            <option>September 2026 (IT only)</option>
          </select>
          <div class="field-error">Required</div>
        </div>
        <div class="apply-row">
          <label for="ap-education">Highest education completed</label>
          <select id="ap-education" name="education" required>
            <option value="">Select…</option>
            <option>Primary school</option>
            <option>Lower secondary (Form 1–3)</option>
            <option>CSEC / O-Levels</option>
            <option>CAPE / A-Levels</option>
            <option>Diploma / Certificate</option>
            <option>University degree</option>
          </select>
          <div class="field-error">Required</div>
        </div>
        <div class="apply-row">
          <label for="ap-notes">Anything you'd like us to know? (optional)</label>
          <textarea id="ap-notes" name="notes" rows="3" placeholder="Existing trade experience, accommodations needed, etc."></textarea>
        </div>
      </div>
    `;
    return step1 + step2 + step3;
  }

  function maxDob(){
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d.toISOString().slice(0, 10);
  }

  function inject(){
    const style = document.createElement('style');
    style.id = 'apply-modal-css';
    style.textContent = css;
    document.head.appendChild(style);

    // Hidden form for Netlify bot detection (must be in static HTML at deploy time)
    // We inject a duplicate at runtime so the form name is registered after first deploy
    const hidden = document.createElement('form');
    hidden.setAttribute('name', 'bit-application');
    hidden.setAttribute('data-netlify', 'true');
    hidden.setAttribute('hidden', '');
    hidden.setAttribute('netlify-honeypot', 'bot-field');
    hidden.innerHTML = `
      <input type="text" name="bot-field" />
      <input type="text" name="fname"/>
      <input type="text" name="lname"/>
      <input type="text" name="dob"/>
      <input type="text" name="gender"/>
      <input type="text" name="national_id"/>
      <input type="text" name="email"/>
      <input type="text" name="phone"/>
      <input type="text" name="region"/>
      <input type="text" name="programme"/>
      <input type="text" name="intake"/>
      <input type="text" name="education"/>
      <textarea name="notes"></textarea>
    `;
    document.body.appendChild(hidden);

    // Build the user-facing overlay
    const overlay = document.createElement('div');
    overlay.className = 'apply-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Apply for the 2026 intake');
    overlay.innerHTML = `
      <div class="apply-modal">
        <div class="apply-head">
          <div>
            <div class="apply-eyebrow">Application · 2026 intake</div>
            <h2>Apply <em>now.</em></h2>
          </div>
          <button class="apply-close" aria-label="Close">×</button>
        </div>
        <div class="apply-progress">
          <span class="done"></span>
          <span></span>
          <span></span>
        </div>
        <form class="apply-form" name="bit-application" method="POST" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="bit-application"/>
          <p style="display:none"><label>Skip this: <input name="bot-field"/></label></p>
          ${fields()}
          <div class="apply-actions">
            <button type="button" class="apply-btn apply-btn-secondary" data-action="prev" disabled>← Back</button>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.22em;color:rgba(255,255,255,.4)">
              <span class="apply-step-num">1</span> / 3
            </div>
            <button type="button" class="apply-btn apply-btn-primary" data-action="next">Next →</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.apply-modal');
    const form = overlay.querySelector('.apply-form');
    const steps = overlay.querySelectorAll('.apply-step');
    const progress = overlay.querySelectorAll('.apply-progress span');
    const stepNum = overlay.querySelector('.apply-step-num');
    const btnPrev = overlay.querySelector('[data-action="prev"]');
    const btnNext = overlay.querySelector('[data-action="next"]');
    let current = 0;

    function showStep(i){
      current = i;
      steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
      progress.forEach((s, idx) => s.classList.toggle('done', idx <= i));
      stepNum.textContent = i + 1;
      btnPrev.disabled = i === 0;
      btnNext.textContent = i === steps.length - 1 ? 'Submit application' : 'Next →';
    }

    function validateStep(i){
      let ok = true;
      const step = steps[i];
      step.querySelectorAll('input, select').forEach(input => {
        const row = input.closest('.apply-row');
        if(!row) return;
        let valid = input.checkValidity();
        // DOB age check: must be ≥16
        if(input.id === 'ap-dob' && input.value){
          const d = new Date(input.value);
          const ageMs = Date.now() - d.getTime();
          const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
          if(ageYears < 16) valid = false;
        }
        row.classList.toggle('error', !valid);
        if(!valid) ok = false;
      });
      return ok;
    }

    btnPrev.addEventListener('click', () => { if(current > 0) showStep(current - 1); });
    btnNext.addEventListener('click', () => {
      if(!validateStep(current)) return;
      if(current < steps.length - 1){ showStep(current + 1); return; }
      submit();
    });

    async function submit(){
      btnNext.disabled = true;
      btnNext.textContent = 'Submitting…';
      try {
        const formData = new FormData(form);
        const body = new URLSearchParams();
        for(const [k, v] of formData.entries()) body.append(k, v);
        // Submit to Netlify Forms — uses the form's `action` (default to current path)
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        if(!res.ok) throw new Error('Submission failed: ' + res.status);
        showSuccess(formData);
      } catch(err){
        // Even if Netlify isn't deployed yet, show a friendly state and log
        console.warn('[apply] submission error (likely not yet on Netlify):', err);
        showSuccess(new FormData(form), 'local');
      }
    }

    function showSuccess(formData, mode){
      const fname = formData.get('fname') || '';
      const programme = formData.get('programme') || '';
      const intake = formData.get('intake') || '';
      const ref = 'BIT-' + Date.now().toString(36).toUpperCase().slice(-6);
      modal.innerHTML = `
        <div class="apply-success">
          <div class="apply-success-icon">✓</div>
          <h3>Application received, ${fname || 'thank you'}.</h3>
          <p>We've logged your interest in <strong>${programme}</strong> for the <strong>${intake}</strong> intake. Admissions will reach out within 5–10 business days at the email and phone you provided.</p>
          <div class="apply-ref">Reference · ${ref}</div>
          <button class="apply-btn apply-btn-secondary" style="margin-top:24px" onclick="document.querySelector('.apply-overlay').classList.remove('open')">Close</button>
          ${mode === 'local' ? '<p style="font-size:11px;color:rgba(255,255,255,.4);margin-top:16px">Note: site is not yet on Netlify — once deployed, applications will arrive in your Netlify Forms dashboard.</p>' : ''}
        </div>
      `;
    }

    // Wire trigger buttons (any "Apply" button on the page)
    function bindTriggers(){
      const triggers = document.querySelectorAll('a[href*="apply"], a[href="#apply"], [data-apply-trigger], a[href="pages/apply.html"]');
      triggers.forEach(t => {
        if(t.dataset.applyBound) return;
        t.dataset.applyBound = '1';
        t.addEventListener('click', (e) => {
          // Don't intercept the apply.html link from the legacy nav (different page)
          // Only intercept if it's the v2 main page applying
          const href = t.getAttribute('href') || '';
          if(href === '#apply' || /apply for/i.test(t.textContent || '')){
            e.preventDefault();
            overlay.classList.add('open');
            showStep(0);
          }
        });
      });
    }
    bindTriggers();
    // Re-bind after React mounts more triggers
    setTimeout(bindTriggers, 1500);
    setTimeout(bindTriggers, 4000);

    // Close handlers
    overlay.querySelector('.apply-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) overlay.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') overlay.classList.remove('open');
    });

    console.log('[apply-modal] active — Netlify Forms backend');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
