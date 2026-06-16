/*
 * Efficacy Tabs — nested tab block for the LEVEL UP H2H / Switch efficacy data.
 *
 * Doc-based authoring keeps only the block-name class, so the nested structure is
 * encoded as a FLAT table where each row's first cell is a directive keyword and
 * the second cell is its content:
 *
 * Each row is: | rowKind | image | imageAlt | content |
 * The image cell carries any <picture> (kept out of the richtext `content`
 * field so md2jcr maps cleanly); content holds the remaining copy.
 *
 *   | outer  |        |  | H2H                         |  → start an outer tab (label = content)
 *   | intro  | <flag> |  | header copy + objective     |  → content above the inner tabs
 *   | inner  |        |  | Week 16                     |  → start an inner tab within current outer
 *   | chart  | <pic>  |  | header + footnotes          |  → left (60%) chart of the 60/30 row
 *   | text   |        |  | rich text + callout + CTAs  |  → right (30%) descriptive column
 *
 * Multiple inner tabs may follow one outer; each inner takes one chart + one text.
 */

/* Build a tablist + panels controller. `panels` are toggled in lock-step with the
   tab buttons; returns the list element to append. */
function buildTabs(labels, panels, extraClass) {
  const list = document.createElement('div');
  list.className = `efficacy-tabs-list ${extraClass}`;
  list.setAttribute('role', 'tablist');

  const buttons = [];
  const select = (idx) => {
    buttons.forEach((b, i) => {
      b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      b.setAttribute('tabindex', i === idx ? '0' : '-1');
    });
    panels.forEach((p, i) => { p.hidden = i !== idx; });
  };

  labels.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'efficacy-tabs-tab';
    btn.textContent = label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
    btn.addEventListener('click', () => select(i));
    list.append(btn);
    buttons.push(btn);
  });

  return list;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Parse the flat directive rows into a tree: outer tabs → { intro, inners[] }.
  const outers = [];
  let currentOuter = null;
  let currentInner = null;

  // Pull the row's <picture> (lives in its own image cell now, kept out of the
  // richtext `content` field so md2jcr maps cleanly).
  const pictureOf = (imageCell) => {
    const pic = imageCell?.querySelector('picture, img');
    return pic ? (pic.closest('picture') || pic) : null;
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    const key = (cells[0]?.textContent || '').trim().toLowerCase();
    // cells: [rowKind, image, content] — imageAlt collapses into image (Alt
    // suffix) so it does NOT get its own cell.
    const picture = pictureOf(cells[1]);
    const contentCell = cells[2];
    const label = (contentCell?.textContent || '').trim();

    if (key === 'outer') {
      currentOuter = {
        label, intro: null, introImage: null, inners: [],
      };
      currentInner = null;
      outers.push(currentOuter);
    } else if (key === 'intro' && currentOuter) {
      currentOuter.intro = contentCell;
      currentOuter.introImage = picture;
    } else if (key === 'inner' && currentOuter) {
      currentInner = {
        label, chart: null, chartImage: null, text: null,
      };
      currentOuter.inners.push(currentInner);
    } else if (key === 'chart' && currentInner) {
      currentInner.chart = contentCell;
      currentInner.chartImage = picture;
    } else if (key === 'text' && currentInner) {
      currentInner.text = contentCell;
    }
  });

  // Render.
  block.textContent = '';

  const outerPanels = outers.map((outer, oi) => {
    const panel = document.createElement('div');
    panel.className = 'efficacy-tabs-panel efficacy-tabs-panel--outer';
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = oi !== 0;

    if (outer.intro || outer.introImage) {
      const intro = document.createElement('div');
      intro.className = 'efficacy-tabs-intro';
      if (outer.introImage) {
        const p = document.createElement('p');
        p.append(outer.introImage);
        intro.append(p);
      }
      if (outer.intro) intro.append(...outer.intro.childNodes);
      panel.append(intro);
    }

    // Build the inner panels first, then their tablist (lock-step toggle).
    const innerPanels = outer.inners.map((inner, ii) => {
      const ipanel = document.createElement('div');
      ipanel.className = 'efficacy-tabs-panel efficacy-tabs-panel--inner';
      ipanel.setAttribute('role', 'tabpanel');
      ipanel.hidden = ii !== 0;

      // The chart cell holds header copy (full-width, above the grid on live)
      // followed by footnotes; the chart <picture> lives in its own image cell
      // (inner.chartImage). Header copy = paragraphs before the first footnote;
      // footnotes follow the image in the chart column.
      const chartNodes = inner.chart ? [...inner.chart.childNodes] : [];
      const firstFootnoteIdx = chartNodes.findIndex(
        (n) => n.nodeType === 1 && n.classList && n.classList.contains('footnote'),
      );
      let headerNodes = [];
      let footnoteNodes = [];
      if (firstFootnoteIdx > 0) {
        headerNodes = chartNodes.slice(0, firstFootnoteIdx);
        footnoteNodes = chartNodes.slice(firstFootnoteIdx);
      } else {
        headerNodes = chartNodes;
      }

      if (headerNodes.length) {
        const header = document.createElement('div');
        header.className = 'efficacy-tabs-chart-header';
        header.append(...headerNodes);
        ipanel.append(header);
      }

      const flex = document.createElement('div');
      flex.className = 'efficacy-tabs-flex';

      const imgCol = document.createElement('div');
      imgCol.className = 'efficacy-tabs-image';
      if (inner.chartImage) {
        const p = document.createElement('p');
        p.append(inner.chartImage);
        imgCol.append(p);
      }
      imgCol.append(...footnoteNodes);

      const textCol = document.createElement('div');
      textCol.className = 'efficacy-tabs-text';
      if (inner.text) textCol.append(...inner.text.childNodes);

      // Tag the standalone "DATA LIMITATIONS:" label so only it gets the
      // brushstroke underline (not the inline-bold copy or the gold callout).
      textCol.querySelectorAll('p > strong:only-child').forEach((strong) => {
        if (strong.parentElement.textContent.trim() === strong.textContent.trim()
            && /^DATA LIMITATIONS/i.test(strong.textContent.trim())) {
          strong.classList.add('underline-brush');
        }
      });

      flex.append(imgCol, textCol);
      ipanel.append(flex);
      return ipanel;
    });

    // Inner tabs only when there's more than one inner tab to switch between.
    if (outer.inners.length > 1) {
      const innerList = buildTabs(
        outer.inners.map((inner) => inner.label),
        innerPanels,
        'efficacy-tabs-list--inner',
      );
      panel.append(innerList);
    }
    innerPanels.forEach((ip) => panel.append(ip));

    return panel;
  });

  const outerList = buildTabs(
    outers.map((o) => o.label),
    outerPanels,
    'efficacy-tabs-list--outer',
  );
  block.append(outerList);
  outerPanels.forEach((p) => block.append(p));
}
