/* Extracted from pages/news.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
/* News category-tab filter.
     Each news item (featured + list) carries a data-news-cat attribute.
     Clicking a tab pill (data-news-filter) toggles the active state and
     hides items whose data-news-cat does not match. The "All" tab clears
     the filter. Keyboard accessible via Enter / Space. */
  (function(){
    'use strict';
    var tabs = document.querySelectorAll('#newsCategoryTabs [data-news-filter]');
    var items = document.querySelectorAll('[data-news-cat]');
    if(!tabs.length || !items.length) return;

    function apply(filter){
      tabs.forEach(function(t){
        t.classList.toggle('active', t.getAttribute('data-news-filter') === filter);
      });
      var anyShown = false;
      items.forEach(function(el){
        var show = (filter === 'all') || (el.getAttribute('data-news-cat') === filter);
        el.style.display = show ? '' : 'none';
        if(show) anyShown = true;
      });
      // Show an empty-state notice when nothing matches
      var notice = document.getElementById('newsEmptyNotice');
      if(!anyShown){
        if(!notice){
          notice = document.createElement('p');
          notice.id = 'newsEmptyNotice';
          notice.style.cssText = 'color:var(--gray-600);font-style:italic;padding:var(--space-xl) 0;text-align:center';
          notice.textContent = 'No articles in this category yet.';
          var list = document.querySelector('.news-layout > div');
          if(list) list.appendChild(notice);
        } else {
          notice.style.display = '';
        }
      } else if(notice){
        notice.style.display = 'none';
      }
    }

    tabs.forEach(function(t){
      t.style.cursor = 'pointer';
      t.addEventListener('click', function(){
        apply(t.getAttribute('data-news-filter'));
      });
      t.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          apply(t.getAttribute('data-news-filter'));
        }
      });
    });
  })();
