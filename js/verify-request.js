/* ═══════════════════════════════════════════════════════════════
   Certificate verification request
   ───────────────────────────────────────────────────────────────
   The website holds NO certificate records and makes no claim about
   the authenticity of any certificate. Verification is performed by
   BIT's Certification Department against the official register held
   under the Industrial Training Act, Chapter 39:04.

   This script validates the shape of the code the user typed and
   prepares a pre-filled email to the department. Nothing is stored,
   transmitted or looked up client-side.

   External file (not inline) so the page's Content-Security-Policy
   can enforce script-src 'self' without 'unsafe-inline'.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DEPT_EMAIL = 'certification@bit.gov.gy';

  // Accepts letters, digits and hyphens, 4–24 chars. Deliberately loose:
  // we are not asserting the code exists, only that it is well-formed
  // enough to be worth sending to the department.
  var CODE_SHAPE = /^[A-Z0-9-]{4,24}$/;

  function byId(id) { return document.getElementById(id); }

  function prepareRequest() {
    var input    = byId('certCode');
    var prepared = byId('verifyPrepared');
    var invalid  = byId('verifyInvalid');
    if (!input || !prepared || !invalid) return;

    var code = input.value.trim().toUpperCase();

    prepared.style.display = 'none';
    invalid.style.display  = 'none';

    if (!CODE_SHAPE.test(code)) {
      invalid.style.display = 'block';
      invalid.classList.add('error');
      invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    byId('preparedCode').textContent = code;

    var subject = 'Certificate verification request — ' + code;
    var body =
      'Certificate verification request\n' +
      '--------------------------------\n\n' +
      'Certificate code: ' + code + '\n\n' +
      'Please confirm whether this certificate was issued by the Board of ' +
      'Industrial Training, and whether it remains valid.\n\n' +
      'Requester name:\n' +
      'Organisation:\n' +
      'Contact number:\n' +
      'Reason for request:\n\n' +
      'Thank you.\n';

    byId('verifyMailLink').href =
      'mailto:' + DEPT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);

    prepared.style.display = 'block';
    prepared.classList.add('success');
    prepared.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function init() {
    var btn   = byId('verifyBtn');
    var input = byId('certCode');
    if (btn)   btn.addEventListener('click', prepareRequest);
    if (input) input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); prepareRequest(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
