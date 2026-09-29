/* ═══════════════════════════════════════════════════════════════
   Region ↔ Matrix Link
   ───────────────────────────────────────────────────────────────
   Two-way binding between the Guyana map and the programme matrix:

     1. On startup → scans the matrix to figure out which programmes
        are actually offered in each region (cells with a tinted
        background = available; transparent = not). Publishes the
        result via `bit:matrix-availability` so guyana-map.js can
        recolour its heatmap and update tooltips.

     2. Listens for `bit:region-filter` events. When a region pin
        is clicked, dims programme rows in the matrix that aren't
        offered in that region. Click again or hit "Clear" to undim.

   Lives outside the React tree so it doesn't fight reconciliation.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  function waitFor(predicate, cb, attempts = 100){
    const r = predicate();
    if(r) return cb(r);
    if(attempts <= 0) return console.warn('[region-matrix-link] timed out');
    setTimeout(()=> waitFor(predicate, cb, attempts - 1), 100);
  }

  function findMatrix(){
    const reg = document.getElementById('regions');
    if(!reg) return null;
    const grid = reg.querySelector('div.grid[style*="grid-template-columns"]');
    if(!grid) return null;
    // Need at least header (11) + 12 programme rows × 11 cells = 11 + 132 = 143
    if(grid.children.length < 143) return null;
    return grid;
  }

  waitFor(findMatrix, (grid) => {
    // ─── 1. Compute availability matrix ─────────────────────────
    // Layout: row 0 is header (11 elements: blank + R1..R10)
    //         rows 1..12 each have 11 elements: button + 10 region cells
    const totalRows = Math.floor(grid.children.length / 11);
    const programmes = [];        // index 0..n-1, holds button + name
    const availability = [];      // [row][col-1] = bool
    for(let row = 1; row < totalRows; row++){
      const start = row * 11;
      const btn = grid.children[start];
      if(!btn || btn.tagName !== 'BUTTON') continue;
      // The visible programme name is in the 2nd <span>
      const nameSpan = btn.querySelector('span:last-child');
      const name = (nameSpan?.textContent || btn.textContent || '').trim();
      const cells = [];
      for(let c = 1; c <= 10; c++){
        const cell = grid.children[start + c];
        const inner = cell?.querySelector('div');
        const bg = inner?.style?.background || '';
        // "transparent" or empty = unavailable; any rgb/rgba colour = available
        const available = !!bg && bg.indexOf('transparent') === -1 && bg.indexOf('rgba(') !== -1;
        cells.push(available);
      }
      programmes.push({ name, btn, cells, rowStart: start });
      availability.push(cells);
    }

    // Per-region count (how many programmes offered)
    const regionCounts = {};
    for(let r = 1; r <= 10; r++){
      regionCounts[r] = 0;
      for(const p of programmes){
        if(p.cells[r-1]) regionCounts[r]++;
      }
    }

    // Tell the rest of the page about the availability data
    window.BIT_REGION_DATA = { regionCounts, programmes: programmes.map(p => ({ name: p.name, cells: p.cells })) };
    window.dispatchEvent(new CustomEvent('bit:matrix-availability', { detail: { regionCounts, programmes: programmes.map(p => ({ name: p.name, cells: p.cells })) } }));

    // ─── 2. CSS for dimming + active states ─────────────────────
    const css = `
      .matrix-row-dim{ opacity: 0.18; transition: opacity 0.3s ease; }
      .matrix-row-on{  opacity: 1;    transition: opacity 0.3s ease; }
      .matrix-col-highlight{ background: rgba(242,101,34,0.10); border-radius: 6px; }
      .matrix-status-pill{
        display: inline-flex; align-items: center; gap: 6px;
        padding: 3px 9px; border-radius: 999px;
        background: rgba(242,101,34,0.14);
        border: 1px solid rgba(242,101,34,0.35);
        color: #FFA45A;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase;
        margin-left: 10px;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // ─── 3. Filter: dim rows where region N is unavailable ──────
    function applyRegionFilter(regionN){
      const isClear = (regionN == null);
      // Dim/undim each programme row (button + 10 cells per row)
      programmes.forEach(p => {
        const eligible = isClear || p.cells[regionN - 1];
        const cls = eligible ? 'matrix-row-on' : 'matrix-row-dim';
        const otherCls = eligible ? 'matrix-row-dim' : 'matrix-row-on';
        for(let c = 0; c <= 10; c++){
          const el = grid.children[p.rowStart + c];
          if(!el) continue;
          el.classList.remove(otherCls);
          el.classList.add(cls);
        }
      });
      // Highlight the column header for the selected region
      for(let c = 1; c <= 10; c++){
        const headerCell = grid.children[c];
        headerCell?.classList.toggle('matrix-col-highlight', !isClear && c === regionN);
      }
    }

    window.addEventListener('bit:region-filter', (e) => {
      const n = e.detail?.regionN;
      applyRegionFilter(n);
    });

    // ─── 4. Hook the Clear button to also clear region selection ─
    const clearBtn = document.querySelector('#regions button.hover\\:text-orange-400');
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        // Dispatch a region-filter clear so the map drops its active state
        window.dispatchEvent(new CustomEvent('bit:region-filter', { detail: { regionN: null } }));
        // Also reset the map's visual state (call its click logic via DOM)
        const activeRegion = document.querySelector('.gy-region.active');
        if(activeRegion) activeRegion.click();
      });
    }

    console.log('[region-matrix-link] ' + programmes.length + ' programmes × 10 regions, availability scan done');
  });
})();
