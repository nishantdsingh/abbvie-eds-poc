import { renderBlock } from '../../scripts/multi-theme.js';

// A table authored inside a flexbox item's rich text cannot survive the
// publish round-trip as a real <table> (md2jcr flattens block structure in
// rich-text fields to plain <p> rows). Authors instead write one paragraph
// per row with cells separated by "|". flexbox.js rebuilds the <table> here.
//
// Per-cell prefix hints in leading {…}: th (header cell), rN (rowspan N),
// cN (colspan N), vl (vertical-label wrapper div). Example:
//   <p>{th,r3,vl}CBC Differential|{th}Neutrophils|&lt;1,000 cells/mm³</p>
// A row may begin with a {{head}} marker to place it in <thead> (default:
// only the first row is the header). Cells keep inline markup (e.g. <br>).
const TABLE_ROW_RE = /^\s*(?:\{\{head\}\})?(?:\{[a-z0-9,]*\})?[^|]*\|/i;

function buildCell(raw) {
  let text = raw;
  let tag = 'td';
  let rowspan = 0;
  let colspan = 0;
  let verticalLabel = false;

  const hint = text.match(/^\{([a-z0-9,]*)\}/i);
  if (hint) {
    text = text.slice(hint[0].length);
    hint[1].split(',').forEach((token) => {
      const t = token.trim().toLowerCase();
      if (t === 'th') {
        tag = 'th';
      } else if (t === 'vl') {
        tag = 'th';
        verticalLabel = true;
      } else if (/^r\d+$/.test(t)) {
        rowspan = parseInt(t.slice(1), 10);
      } else if (/^c\d+$/.test(t)) {
        colspan = parseInt(t.slice(1), 10);
      }
    });
  }

  const cell = document.createElement(tag);
  if (rowspan > 1) cell.setAttribute('rowspan', String(rowspan));
  if (colspan > 1) cell.setAttribute('colspan', String(colspan));
  if (verticalLabel) {
    cell.className = 'vertical-label';
    const wrap = document.createElement('div');
    wrap.innerHTML = text.trim();
    cell.append(wrap);
  } else {
    cell.innerHTML = text.trim();
  }
  return cell;
}

// Convert a run of consecutive pipe-delimited <p> rows into a single <table>.
// The first row becomes <thead>, the rest <tbody>.
function rebuildTables(contentEl) {
  const children = [...contentEl.children];
  let rowEls = [];

  const flush = () => {
    if (rowEls.length < 2) { rowEls = []; return; }
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    // Rows flagged with a leading {{head}} marker (or, if none are flagged,
    // the first row) go into <thead>; the rest into <tbody>.
    const anyExplicitHead = rowEls.some((p) => /^\s*\{\{head\}\}/.test(p.innerHTML));
    rowEls.forEach((p, i) => {
      const html = p.innerHTML.trim();
      const isHead = anyExplicitHead ? /^\{\{head\}\}/.test(html) : i === 0;
      const rowHtml = html.replace(/^\{\{head\}\}/, '');
      const tr = document.createElement('tr');
      rowHtml.split('|').forEach((rawCell) => tr.append(buildCell(rawCell)));
      (isHead ? thead : tbody).append(tr);
    });
    table.append(thead, tbody);
    rowEls[0].replaceWith(table);
    rowEls.slice(1).forEach((p) => p.remove());
    rowEls = [];
  };

  children.forEach((el) => {
    if (el.tagName === 'P' && TABLE_ROW_RE.test(el.textContent)) {
      rowEls.push(el);
    } else {
      flush();
    }
  });
  flush();
}

export default async function decorate(block) {
  const rows = [...block.children];
  const anchorId = block.id || block.dataset.anchorId || '';
  if (anchorId) block.id = anchorId;

  // Detect UE context: rows have data-aue-type instrumentation
  const isUE = rows.some((row) => row.hasAttribute('data-aue-type'));

  if (isUE) {
    // UE mode: decorate in-place to preserve instrumentation
    rows.filter((row) => row.children.length > 0).forEach((row) => {
      row.classList.add('flexbox-item');
      const cells = [...row.children];
      // Field order: image(0) | imageAlt(1) | content(2) | itemClasses(3)
      const imageCell = cells[0];
      const altText = cells[1]?.textContent?.trim() || '';
      const contentCell = cells[2];
      const widthValue = cells[3]?.textContent?.trim() || '';

      if (imageCell) {
        const picture = imageCell.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img && altText) img.alt = altText;
          imageCell.classList.add('flexbox-item-image');
        }
      }
      if (contentCell) {
        contentCell.classList.add('flexbox-item-content');
        rebuildTables(contentCell);
      }
      if (cells[1]) cells[1].hidden = true;
      if (cells[3]) cells[3].hidden = true;

      if (['full', 'sixty', 'half', 'third', 'thirty', 'quarter'].includes(widthValue)) {
        row.dataset.width = widthValue;
      }
    });
  } else {
    const widthValues = ['full', 'sixty', 'half', 'third', 'thirty', 'quarter'];
    // Document authoring: rebuild DOM for clean markup, skip empty config rows
    const items = rows.filter((row) => row.textContent.trim() || row.querySelector('picture')).map((row) => {
      const cells = [...row.children];
      const item = document.createElement('div');
      item.className = 'flexbox-item';

      const lastCell = cells[cells.length - 1];
      const lastCellText = lastCell?.textContent?.trim().toLowerCase();
      if (lastCell && widthValues.includes(lastCellText)) {
        item.dataset.width = lastCellText;
        cells.pop();
      }

      cells.forEach((cell) => {
        const picture = cell.querySelector('picture');
        if (picture) {
          const imgWrap = document.createElement('div');
          imgWrap.className = 'flexbox-item-image';
          imgWrap.append(picture);
          item.append(imgWrap);
        } else if (cell.hasChildNodes()) {
          const contentWrap = document.createElement('div');
          contentWrap.className = 'flexbox-item-content';
          [...cell.childNodes].forEach((node) => {
            contentWrap.append(node.cloneNode(true));
          });
          rebuildTables(contentWrap);
          item.append(contentWrap);
        }
      });

      return item;
    });

    block.textContent = '';
    items.forEach((item) => block.append(item));
  }

  try {
    await renderBlock(block);
  } catch {
    // brand block-config failed; flexbox still renders
  }
}
