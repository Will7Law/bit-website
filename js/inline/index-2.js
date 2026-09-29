/* Extracted from index.html (inline block #2).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
(function(){
  'use strict';
  var REPL = {
    '§ 02 · Scale of practice': 'By the numbers',
    '§ 04 · Footprint':         'Where we operate',
    '§ 05 · Heritage':          'Our history',
    '§ 07 · Verification':      'Verify a certificate',
    '§ 08 · Graduates':         'Stories'
  };
  function sweep(){
    var nodes = document.querySelectorAll('div, span');
    for(var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if(el.children.length) continue;
      var t = (el.textContent || '').trim();
      if(Object.prototype.hasOwnProperty.call(REPL, t)){
        el.textContent = REPL[t];
      }
    }
  }
  function boot(){
    sweep();
    var mo = new MutationObserver(sweep);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
