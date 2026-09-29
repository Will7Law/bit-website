/* ═══════════════════════════════════════════════════════════════
   Page Links — wires every clickable affordance on the new homepage
   to its destination page from the existing /pages/ directory.

   Why a wedge: the React bundle binds most footer/programme links
   to href="#" placeholders. We rewrite them after mount so:
     • Footer "About / Programmes / News / Gallery / Apply / Verify
       / Privacy / Terms / Accessibility / Downloads / Apprentice-
       ships" → corresponding pages
     • Programme list items in the #programmes section become
       clickable cards that open programme-detail.html?p=<slug>
     • The matrix programme-name buttons get a small "Details →"
       arrow link added next to them so the existing matrix-filter
       click is preserved
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // Footer link text → destination URL
  const FOOTER_MAP = {
    'About':              'pages/about.html',
    'Programmes':         'pages/programmes.html',
    'Regional Centres':   'pages/regional-centres.html',
    'News':               'pages/v2-news.html',
    'Gallery':            'pages/v2-gallery.html',
    // 'Apply Online' deliberately omitted — application is handled offline.
    'Verify Certificate': 'pages/verify.html',
    'Apprenticeships':    'pages/programmes.html#apprenticeships',
    'Downloads':          'pages/downloads.html',
    'Ministry of Labour': 'https://labour.gov.gy/',
    'Privacy':            'pages/privacy.html',
    'Terms':              'pages/terms.html',
    'Accessibility':      'pages/accessibility.html',
    'FAQ':                'pages/faq.html',
    'FAQs':               'pages/faq.html',
    'Contact':            'pages/contact.html',
    'Partners':           'pages/partners.html',
  };

  // Programme name → slug for programme-detail.html?p=<slug>
  const PROGRAMME_SLUG = [
    [ /electrical/i,                    'electrical'   ],
    [ /plumbing/i,                      'plumbing'     ],
    [ /welding/i,                       'welding'      ],
    [ /motor\s*vehicle/i,               'motor'        ],
    [ /carpentry/i,                     'carpentry'    ],
    [ /masonry/i,                       'masonry'      ],
    [ /air conditioning|refrigeration/i,'ac'           ],
    [ /information technology|computer/i,'it'          ],
    [ /cosmetology|beauty/i,            'cosmetology'  ],
    [ /garment|fashion/i,               'garment'      ],
    [ /culinary|food preparation/i,     'culinary'     ],
    [ /agriculture|agro/i,              'agriculture'  ],
    [ /photovolt|solar/i,               'photovoltaic' ],
    [ /heavy[- ]?duty|equipment/i,      'heavy-duty'   ],
    /* [ /oil\s*&?\s*gas|factor/i, 'oil-gas' ] — programme removed per review */
    [ /web|software dev/i,              'web-dev'      ],
  ];

  function programmeSlug(text){
    for(const [rx, slug] of PROGRAMME_SLUG){
      if(rx.test(text)) return slug;
    }
    return null;
  }

  function waitFor(predicate, cb, attempts = 100){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[page-links] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  // ─── 1. Wire footer links + relabel "Downloads" → "Resources" ──
  // (Nothing on the site is actually downloadable as a file — every
  // brochure / form is sent by email request — so the "Downloads"
  // label is misleading. The page URL stays /pages/downloads.html so
  // existing bookmarks still work; only the visible label changes.)
  function wireFooter(){
    const footer = document.querySelector('footer');
    if(!footer) return false;
    const links = footer.querySelectorAll('a');
    if(links.length < 5) return false;
    let wired = 0, relabelled = 0;
    links.forEach(a => {
      const txt = (a.textContent || '').trim();
      if(FOOTER_MAP[txt] && a.getAttribute('href') === '#'){
        a.setAttribute('href', FOOTER_MAP[txt]);
        wired++;
      }
      if(txt === 'Downloads'){
        a.textContent = 'Resources';
        relabelled++;
      }
    });
    if(wired > 0) console.log('[page-links] footer: wired ' + wired + ' links');
    if(relabelled > 0) console.log('[page-links] footer: relabelled ' + relabelled + ' Downloads → Resources');
    return true;
  }

  // ─── 2. Wire programme list items in #programmes section ──────
  function wireProgrammesSection(){
    const sec = document.getElementById('programmes');
    if(!sec) return false;
    const items = sec.querySelectorAll('li');
    if(items.length < 8) return false;
    if(sec.dataset.linksWired) return true;
    let wired = 0;
    items.forEach(li => {
      // Find the programme name span (the flex-1 child)
      const nameSpan = li.querySelector('span.flex-1') || li.querySelector('span:nth-child(2)');
      if(!nameSpan) return;
      const name = (nameSpan.textContent || '').trim();
      const slug = programmeSlug(name);
      if(!slug) return;
      // Wrap the <li>'s text content in an <a>, preserving icon spans
      li.style.cursor = 'pointer';
      li.classList.add('bit-prog-link');
      li.dataset.slug = slug;
      li.addEventListener('click', (e) => {
        // Don't hijack if user is selecting text
        if(window.getSelection && window.getSelection().toString().length) return;
        window.location.href = 'pages/programme-detail.html?p=' + encodeURIComponent(slug);
      });
      // Visual cue
      li.setAttribute('role', 'link');
      li.setAttribute('tabindex', '0');
      li.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          window.location.href = 'pages/programme-detail.html?p=' + encodeURIComponent(slug);
        }
      });
      wired++;
    });
    if(wired > 0){
      sec.dataset.linksWired = '1';
      // Subtle hover affordance
      const css = `
        .bit-prog-link{ border-radius: 8px; padding-left: 4px !important; padding-right: 4px !important; transition: background-color .2s, color .2s; }
        .bit-prog-link:hover{ background: rgba(242,101,34,0.08); }
        .bit-prog-link:hover span.flex-1{ color: #FFA45A; }
        .bit-prog-link:focus-visible{ outline: 2px solid rgba(242,101,34,0.6); outline-offset: 2px; }
      `;
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      console.log('[page-links] #programmes: wired ' + wired + ' programme rows');
    }
    return true;
  }

  // ─── 3. Add "Details →" arrow next to each matrix programme name
  function wireMatrixDetails(){
    const reg = document.getElementById('regions');
    if(!reg) return false;
    const grid = reg.querySelector('div.grid[style*="grid-template-columns"]');
    if(!grid || grid.children.length < 143) return false;
    if(grid.dataset.detailsWired) return true;
    const buttons = grid.querySelectorAll('button.text-left');
    let wired = 0;
    buttons.forEach(btn => {
      const nameSpan = btn.querySelector('span:last-child');
      if(!nameSpan) return;
      const name = nameSpan.textContent.trim();
      const slug = programmeSlug(name);
      if(!slug) return;
      // Add a small arrow link as a sibling — does NOT replace the existing
      // filter-button click handler.
      if(btn.querySelector('.bit-detail-arrow')) return;
      const arrow = document.createElement('a');
      arrow.className = 'bit-detail-arrow';
      arrow.href = 'pages/programme-detail.html?p=' + encodeURIComponent(slug);
      arrow.title = 'Open ' + name + ' details';
      arrow.setAttribute('aria-label', 'Open ' + name + ' details');
      arrow.textContent = '→';
      arrow.style.cssText = 'margin-left:auto;padding:2px 6px;border-radius:6px;color:rgba(255,255,255,0.45);font-size:14px;line-height:1;text-decoration:none;transition:background-color .2s, color .2s;';
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();   // don't trigger matrix filter
      });
      arrow.addEventListener('mouseenter', () => { arrow.style.background = 'rgba(242,101,34,0.18)'; arrow.style.color = '#FFA45A'; });
      arrow.addEventListener('mouseleave', () => { arrow.style.background = 'transparent'; arrow.style.color = 'rgba(255,255,255,0.45)'; });
      btn.appendChild(arrow);
      wired++;
    });
    if(wired > 0){
      grid.dataset.detailsWired = '1';
      console.log('[page-links] matrix: ' + wired + ' detail-arrows added');
    }
    return true;
  }

  // ─── Boot ─────────────────────────────────────────────────────
  waitFor(() => document.querySelector('footer'), wireFooter);
  waitFor(() => document.getElementById('programmes')?.querySelectorAll('li').length >= 8 ? document.getElementById('programmes') : null, wireProgrammesSection);
  waitFor(() => {
    const grid = document.querySelector('#regions div.grid[style*="grid-template-columns"]');
    return (grid && grid.children.length >= 143) ? grid : null;
  }, wireMatrixDetails);
})();
