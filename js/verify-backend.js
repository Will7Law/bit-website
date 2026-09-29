/* ═══════════════════════════════════════════════════════════════
   Homepage verify widget → verification request
   ───────────────────────────────────────────────────────────────
   The website holds NO certificate records and does not attest to
   the authenticity of any certificate. Verification is performed by
   BIT's Certification Department against the official register kept
   under the Industrial Training Act, Chapter 39:04.

   This wedge intercepts the homepage verify form and, instead of
   claiming a result, validates the shape of the code and hands the
   user off to the Certification Department with the code pre-filled.

   NDMA security assessment (10 July 2026), Finding 2: the previous
   implementation fetched /data/certificates.json — a client-side file
   containing names, programmes, regions, grades and issue dates — and
   rendered "Certificate is authentic". Both the file and the claim
   have been removed.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DEPT_EMAIL = 'certification@bit.gov.gy';
  var CODE_SHAPE = /^[A-Z0-9-]{4,24}$/;

  function waitFor(predicate, cb, attempts) {
    attempts = (attempts === undefined) ? 40 : attempts;
    var r = predicate();
    if (r) return cb(r);
    if (attempts <= 0) return console.info('[verify-backend] no verify form on this page — skipping');
    setTimeout(function () { waitFor(predicate, cb, attempts - 1); }, 100);
  }

  function findVerifyForm() {
    var verify = document.getElementById('verify');
    return verify ? verify.querySelector('form') : null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mailtoFor(code) {
    var subject = 'Certificate verification request — ' + code;
    var body =
      'Certificate verification request\n' +
      '--------------------------------\n\n' +
      'Certificate code: ' + code + '\n\n' +
      'Please confirm whether this certificate was issued by the Board of ' +
      'Industrial Training, and whether it remains valid.\n\n' +
      'Requester name:\nOrganisation:\nContact number:\nReason for request:\n\n' +
      'Thank you.\n';
    return 'mailto:' + DEPT_EMAIL +
           '?subject=' + encodeURIComponent(subject) +
           '&body='    + encodeURIComponent(body);
  }

  waitFor(findVerifyForm, function (form) {
    if (form.dataset.backendBound) return;

    // The bundle renders <input placeholder="BIT-YYYY-XX-#####"> with no
    // type attribute, so an input[type="text"] selector never matches it.
    // Select the first text-ish input instead.
    var input = form.querySelector('input:not([type="hidden"]):not([type="submit"])');
    if (!input) return;

    form.dataset.backendBound = '1';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var code = (input.value || '').trim().toUpperCase();
      render(code);
    }, true); // capture phase — runs before the bundle's own handler

    function render(code) {
      var container = document.getElementById('verify-extended-result');
      if (!container) {
        container = document.createElement('div');
        container.id = 'verify-extended-result';
        container.style.cssText = 'margin-top:24px;max-width:640px;margin-left:auto;margin-right:auto;';
        form.insertAdjacentElement('afterend', container);
      }

      if (!CODE_SHAPE.test(code)) {
        container.innerHTML =
          '<div style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.3);' +
          'border-radius:14px;padding:18px;color:rgba(255,255,255,0.85);font-size:14px">' +
          '<span style="color:#F87171">Please check the certificate code.</span> ' +
          'Enter it exactly as printed — letters, numbers and hyphens only, ' +
          'for example <code style="font-family:\'JetBrains Mono\',monospace;color:#FFA45A">BIT-2025-EL-04821</code>.' +
          '</div>';
        return;
      }

      container.innerHTML =
        '<div style="background:rgba(27,77,142,0.10);border:1px solid rgba(120,170,255,0.35);' +
        'border-radius:14px;padding:22px;color:#fff">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
            '<div style="width:40px;height:40px;border-radius:50%;background:rgba(120,170,255,0.18);' +
            'border:2px solid #78AAFF;display:flex;align-items:center;justify-content:center;' +
            'color:#78AAFF;font-size:18px">✉</div>' +
            '<div>' +
              '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:0.28em;' +
              'text-transform:uppercase;color:#78AAFF">Verification request ready</div>' +
              '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;' +
              'color:rgba(255,255,255,0.5);margin-top:2px">' + escapeHtml(code) + '</div>' +
            '</div>' +
          '</div>' +
          '<p style="font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.85);margin:0 0 16px">' +
            'Certificate verification is carried out by BIT’s Certification Department against the ' +
            'official register. Send the request below and a certification officer will confirm the ' +
            'certificate and reply to you directly, normally within two business days.' +
          '</p>' +
          '<a href="' + mailtoFor(code) + '" ' +
            'style="display:inline-block;background:#78AAFF;color:#06112A;font-weight:600;' +
            'text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px">' +
            'Send verification request</a>' +
          '<p style="font-size:12px;color:rgba(255,255,255,0.45);margin:14px 0 0">' +
            'Prefer to call? Ring +592 225-1077 and ask for the Certification Department.' +
          '</p>' +
        '</div>';
    }

    console.info('[verify-backend] active — verification handled by Certification Department');
  });
})();
