/* Highlights the current page in the standardised main nav.
   The header is now identical on every page (Oct-2026), so the active
   link is set at runtime from the URL instead of being hard-coded. */
(function(){
  'use strict';
  function run(){
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var links = document.querySelectorAll('.main-nav a');
    for(var i = 0; i < links.length; i++){
      var href = (links[i].getAttribute('href') || '').split('/').pop().split('?')[0].toLowerCase();
      if(href && href === page) links[i].classList.add('active');
    }
    if(page === 'programme-detail.html'){
      var prog = document.querySelector('.main-nav .nav-dropdown > a');
      if(prog) prog.classList.add('active');
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
