/* Extracted from index.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
(function(){
  'use strict';
  var OLD_RE = /A statutory body of the Ministry of Labour & Manpower Planning\.\s*One hundred and sixteen years of certifying the tradespeople who build Guyana's roads, kitchens, clinics, and code\./;
  var NEW_TEXT = 'Industrial training and trades certification for Guyana. Operating under the Ministry of Labour & Manpower Planning since 1910.';
  var WORD_SWAP = { 'Industry-Ready':'Working', 'Future-Ready':'Trained' };

  function patch(node){
    if(!node || node.nodeType !== 1) return;
    // Subtitle <p> match — fast path via class attribute presence
    if(node.tagName === 'P' && (node.className || '').indexOf('max-w-[52ch]') !== -1){
      if(!node.dataset.copyCleaned && OLD_RE.test(node.textContent || '')){
        node.textContent = NEW_TEXT;
        node.dataset.copyCleaned = '1';
      }
    }
    // Word swap inside .word-swap > span
    if(node.tagName === 'SPAN' && node.parentElement &&
       (node.parentElement.className || '').indexOf('word-swap') !== -1){
      var t = (node.textContent || '').trim();
      if(WORD_SWAP[t]) node.textContent = WORD_SWAP[t];
    }
  }

  function sweep(root){
    // Process the root element itself plus every descendant <p> + <span>
    patch(root);
    if(!root.querySelectorAll) return;
    var ps = root.querySelectorAll('p, span');
    for(var i = 0; i < ps.length; i++) patch(ps[i]);
  }

  function install(){
    sweep(document.body);
    var mo = new MutationObserver(function(mutations){
      for(var i = 0; i < mutations.length; i++){
        var m = mutations[i];
        for(var j = 0; j < m.addedNodes.length; j++) sweep(m.addedNodes[j]);
        if(m.type === 'characterData' && m.target && m.target.parentNode) patch(m.target.parentNode);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });

    // Safety: even if our regex misses (e.g. the bundle is updated and
    // the subtitle text changes), reveal the paragraph after 1.5s so it
    // never stays invisible.
    setTimeout(function(){
      var ps = document.querySelectorAll('section#top p[class*="max-w-[52ch]"]:not([data-copy-cleaned])');
      for(var i = 0; i < ps.length; i++) ps[i].dataset.copyCleaned = '1';
    }, 1500);
  }

  // Body may not exist yet during head parsing — defer install until it does.
  if(document.body){ install(); }
  else { document.addEventListener('DOMContentLoaded', install, { once: true }); }
})();
