/* Extracted from pages/regional-centres.html (inline block #1).
   Moved out of the HTML so the page CSP can enforce
   script-src 'self' without 'unsafe-inline'.
   NDMA security assessment, 10 July 2026, Finding 4. */
(function () {
    'use strict';
    var table = document.querySelector('.pam-table');
    if (!table) return;

    var reset = document.getElementById('pamReset');
    var footnote = document.getElementById('pamFootnote');
    var tbody = table.querySelector('tbody');
    var progHeaders = table.querySelectorAll('thead th[data-prog]');
    var progButtons = table.querySelectorAll('.pam-prog-btn');
    var regionButtons = table.querySelectorAll('.pam-region-btn');

    // Friendly labels for status messages
    var PROG_LABELS = {
      electrical: 'Electrical Installation & Maintenance',
      plumbing: 'Plumbing & Pipefitting',
      welding: 'Welding & Fabrication',
      motor: 'Motor Vehicle Mechanics',
      carpentry: 'Carpentry & Joinery',
      masonry: 'Masonry & Construction',
      it: 'Information Technology & Computer Servicing',
      cosmetology: 'Cosmetology & Beauty Culture',
      garment: 'Garment Construction & Fashion Design',
      culinary: 'Food Preparation & Culinary Arts',
      ac: 'Air Conditioning & Refrigeration',
      agriculture: 'Agriculture & Agro-Processing'
    };
    var REGION_LABELS = {
      '1': 'Mabaruma (Region 1)',
      '2': 'Anna Regina (Region 2)',
      '3': 'West Demerara (Region 3)',
      '4': 'Georgetown HQ (Region 4)',
      '5': 'Fort Wellington (Region 5)',
      '6': 'Berbice (Region 6)',
      '7': 'Bartica (Region 7)',
      '8': 'Mahdia (Region 8)',
      '9': 'Lethem (Region 9)',
      '10': 'Linden (Region 10)'
    };

    function clearState() {
      table.classList.remove('filter-prog-active', 'filter-region-active');
      progButtons.forEach(function (b) { b.classList.remove('is-active'); });
      regionButtons.forEach(function (b) { b.classList.remove('is-active'); });
      tbody.querySelectorAll('tr').forEach(function (tr) {
        tr.classList.remove('pam-row-active', 'pam-row-hit');
      });
      table.querySelectorAll('td, th').forEach(function (c) {
        c.classList.remove('pam-col-active');
      });
      reset.classList.remove('is-visible');
      footnote.querySelector('span').innerHTML = 'Showing all 12 programmes across all 10 regions. All regional centres can be contacted through HQ at <a href="tel:+5922251077">+592 225-1077</a>.';
    }

    function filterByProgramme(prog) {
      clearState();
      table.classList.add('filter-prog-active');

      // Mark matching programme button active
      var btn = table.querySelector('.pam-prog-btn[data-prog="' + prog + '"]');
      if (btn) btn.classList.add('is-active');
      var th = table.querySelector('thead th[data-prog="' + prog + '"]');
      if (th) th.classList.add('pam-col-active');

      // Mark all cells in this column as active
      var cells = tbody.querySelectorAll('td[data-prog="' + prog + '"]');
      var hits = 0;
      cells.forEach(function (td) {
        td.classList.add('pam-col-active');
        if (td.classList.contains('pam-yes')) {
          td.parentElement.classList.add('pam-row-hit');
          hits++;
        }
      });

      reset.classList.add('is-visible');
      var label = PROG_LABELS[prog] || prog;
      footnote.querySelector('span').innerHTML =
        '<strong>' + label + '</strong> is offered at <strong>' + hits +
        '</strong> of 10 regional centres. Tap another programme or the reset button to change view.';
    }

    function filterByRegion(region) {
      clearState();
      table.classList.add('filter-region-active');

      var btn = table.querySelector('.pam-region-btn[data-region="' + region + '"]');
      if (btn) btn.classList.add('is-active');

      var row = tbody.querySelector('tr[data-region="' + region + '"]');
      if (row) {
        row.classList.add('pam-row-active');
        var offered = row.querySelectorAll('td.pam-yes').length;
        reset.classList.add('is-visible');
        var label = REGION_LABELS[region] || 'Region ' + region;
        footnote.querySelector('span').innerHTML =
          '<strong>' + label + '</strong> offers <strong>' + offered +
          '</strong> of 12 programmes. Tap another region or the reset button to change view.';
      }
    }

    // Attach handlers
    progButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var prog = b.getAttribute('data-prog');
        // Toggle off if already active
        if (b.classList.contains('is-active')) clearState();
        else filterByProgramme(prog);
      });
    });
    regionButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var region = b.getAttribute('data-region');
        if (b.classList.contains('is-active')) clearState();
        else filterByRegion(region);
      });
    });
    reset.addEventListener('click', clearState);
  })();
