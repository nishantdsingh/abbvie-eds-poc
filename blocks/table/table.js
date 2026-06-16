/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
// md2jcr column-count markers used for multi-column authoring. A single-cell
// row whose only text is `table-N-columns` selects the parent filter; each data
// row may lead with a `table-col-N` cell that selects the item model. Both are
// authoring artifacts that must not render.
const FILTER_ROW_RE = /^table-\d+-columns$/i;
const COL_MARKER_RE = /^table-col-\d+$/i;

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  // Drop any single-cell filter-marker rows (e.g. "table-4-columns").
  const rows = [...block.children].filter((row) => {
    const cells = [...row.children];
    return !(cells.length === 1 && FILTER_ROW_RE.test(cells[0].textContent.trim()));
  });

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    let cells = [...row.children];
    // Strip a leading component-id marker cell (e.g. "table-col-4").
    if (cells.length && COL_MARKER_RE.test(cells[0].textContent.trim())) {
      cells = cells.slice(1);
    }

    cells.forEach((cell) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });
  table.append(thead, tbody);
  block.replaceChildren(table);
}
