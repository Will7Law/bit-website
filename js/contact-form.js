/* ═══════════════════════════════════════════════════════════════
   BIT contact form — validation, throttling, submission
   ───────────────────────────────────────────────────────────────
   Addresses NDMA security assessment (10 July 2026), Finding 1:
     • Field length restrictions, enforced and surfaced to the user.
     • Character-set constraints on name and phone fields.
     • Client-side submission throttle (1 per 60s, plus a minimum
       time-on-form) to deter automated and excessive submissions.
     • Honeypot retained; Netlify's own spam filtering remains on.
     • Matching hard caps are enforced server-side in the Apps Script
       relay, which drops any payload exceeding them.

   Also addresses Finding 4: this logic lives in an external file so
   the page's CSP can enforce script-src 'self' without
   'unsafe-inline'.

   Note on CAPTCHA: NDMA offered "CAPTCHA, request throttling, or
   submission rate limiting" as alternatives. Throttling and rate
   limiting were chosen over a visual CAPTCHA because the site is
   committed to WCAG 2.1 AA and a visual challenge would exclude the
   users the accessibility work is there to serve.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── Limits (must mirror the Apps Script relay) ────────────────
  var LIMITS = {
    firstName: 50,
    lastName:  50,
    email:     254,
    phone:     25,
    subject:   100,
    region:    100,
    message:   2000
  };

  var MESSAGE_MIN     = 10;      // chars
  var THROTTLE_MS     = 60000;   // 1 submission per minute
  var MIN_FILL_MS     = 3000;    // a human takes >3s to fill this form
  var STORAGE_KEY     = 'bit-contact-last-submit';

  var NAME_RE  = /^[^<>]{1,50}$/;
  var PHONE_RE = /^[0-9+()\-\s]{0,25}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var loadedAt = Date.now();

  function byId(id) { return document.getElementById(id); }

  // ─── Live character counter on the message field ───────────────
  function wireCounter() {
    var ta    = byId('cf-message');
    var count = byId('cf-message-count');
    if (!ta || !count) return;

    function update() {
      var n = ta.value.length;
      count.textContent = n + ' / ' + LIMITS.message + ' characters';
      count.classList.toggle('is-near',  n > LIMITS.message * 0.9 && n < LIMITS.message);
      count.classList.toggle('is-limit', n >= LIMITS.message);
    }
    ta.addEventListener('input', update);
    update();
  }

  // ─── Validation ────────────────────────────────────────────────
  function fieldError(input, msg) {
    var holder = input.parentNode.querySelector('.field-error');
    if (!holder) {
      holder = document.createElement('div');
      holder.className = 'field-error';
      input.parentNode.appendChild(holder);
    }
    holder.textContent = msg;
    holder.classList.add('is-shown');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var holder = input.parentNode.querySelector('.field-error');
    if (holder) holder.classList.remove('is-shown');
    input.removeAttribute('aria-invalid');
  }

  function validate() {
    var problems = [];
    var first = byId('cf-first'), last = byId('cf-last');
    var email = byId('cf-email'), phone = byId('cf-phone');
    var msg   = byId('cf-message'), subject = byId('cf-subject');
    var consent = byId('consent');

    [first, last, email, phone, msg, subject].forEach(function (el) {
      if (el) clearError(el);
    });

    if (!NAME_RE.test(first.value.trim())) {
      fieldError(first, 'Enter your first name (up to 50 characters, no angle brackets).');
      problems.push(first);
    }
    if (!NAME_RE.test(last.value.trim())) {
      fieldError(last, 'Enter your last name (up to 50 characters, no angle brackets).');
      problems.push(last);
    }
    if (!EMAIL_RE.test(email.value.trim()) || email.value.length > LIMITS.email) {
      fieldError(email, 'Enter a valid email address.');
      problems.push(email);
    }
    if (phone.value && !PHONE_RE.test(phone.value.trim())) {
      fieldError(phone, 'Phone may contain digits, spaces and + ( ) - only.');
      problems.push(phone);
    }
    if (!subject.value) {
      fieldError(subject, 'Please choose a subject.');
      problems.push(subject);
    }
    var m = msg.value.trim();
    if (m.length < MESSAGE_MIN) {
      fieldError(msg, 'Please write at least ' + MESSAGE_MIN + ' characters so we can help.');
      problems.push(msg);
    } else if (m.length > LIMITS.message) {
      fieldError(msg, 'Message must be ' + LIMITS.message + ' characters or fewer.');
      problems.push(msg);
    }
    if (consent && !consent.checked) {
      problems.push(consent);
    }

    if (problems.length) {
      problems[0].focus();
      problems[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  // ─── Throttle ──────────────────────────────────────────────────
  function throttleRemaining() {
    var last = 0;
    try { last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0; }
    catch (e) { return 0; }               // storage blocked → don't block the user
    var elapsed = Date.now() - last;
    return elapsed >= THROTTLE_MS ? 0 : Math.ceil((THROTTLE_MS - elapsed) / 1000);
  }

  function markSubmitted() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) { /* ignore */ }
  }

  function showThrottle(secs) {
    var note = byId('contactThrottle');
    var span = byId('throttleSecs');
    if (!note) return;
    if (span) span.textContent = secs;
    note.classList.add('is-shown');
    note.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var iv = setInterval(function () {
      var left = throttleRemaining();
      if (span) span.textContent = left;
      if (left <= 0) { clearInterval(iv); note.classList.remove('is-shown'); }
    }, 1000);
  }

  // ─── Submit ────────────────────────────────────────────────────
  function handleSubmit(ev) {
    ev.preventDefault();

    var form      = byId('contactForm');
    var btn       = byId('contactSubmitBtn');
    var label     = byId('contactSubmitLabel');
    var successEl = byId('contactSuccess');
    var errorEl   = byId('contactError');
    var errorMsg  = byId('contactErrorMsg');
    var note      = byId('contactThrottle');

    errorEl.style.display = 'none';
    if (note) note.classList.remove('is-shown');

    // Bot heuristic: form completed implausibly fast.
    if (Date.now() - loadedAt < MIN_FILL_MS) {
      showThrottle(Math.ceil((MIN_FILL_MS - (Date.now() - loadedAt)) / 1000));
      return false;
    }

    var wait = throttleRemaining();
    if (wait > 0) { showThrottle(wait); return false; }

    if (!validate()) return false;

    btn.disabled = true;
    label.textContent = 'Sending…';

    var body = new URLSearchParams(new FormData(form)).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    })
    .then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error('HTTP ' + r.status + (t ? ' — ' + t.slice(0, 200) : ''));
        });
      }
      markSubmitted();
      form.style.display = 'none';
      successEl.style.display = 'block';
      window.scrollTo({ top: successEl.offsetTop - 200, behavior: 'smooth' });
    })
    .catch(function (err) {
      console.error('[contact-form] submission failed:', err && err.message);
      if (errorMsg) errorMsg.textContent = (err && err.message) || 'Unknown network error';
      errorEl.style.display = 'block';
      btn.disabled = false;
      label.textContent = 'Send Message';
      window.scrollTo({ top: errorEl.offsetTop - 200, behavior: 'smooth' });
    });

    return false;
  }

  // ─── Init ──────────────────────────────────────────────────────
  function init() {
    // AOS was previously initialised by an inline script; moved here so
    // the page needs no inline <script> at all (Finding 4).
    if (typeof window.AOS !== 'undefined') {
      window.AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
    }

    var form = byId('contactForm');
    if (!form) return;
    form.addEventListener('submit', handleSubmit);
    wireCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
