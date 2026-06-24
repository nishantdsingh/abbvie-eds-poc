/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion variant.
 * Base block: accordion
 * Source: https://www.linzess.com/savings-card
 * Selector: .abbv-accordion.savings-accordion.abbv-accordion-single
 *
 * XWalk model: accordion (parent) + accordion-item (child)
 * Parent config rows (14 rows, single value in col 0):
 *   0: blockHeading, 1: expandAllLabel, 2: collapseAllLabel,
 *   3: expandAllIcon, 4: collapseAllIcon, 5: expandIcon, 6: collapseIcon,
 *   7-10: icon images, 11-12: aria labels, 13: analyticsId
 * Child item rows (7 columns each):
 *   col 0: summary, col 1: text, col 2: fragmentPath,
 *   col 3: ariaExpandLabel, col 4: ariaCollapseLabel, col 5: anchorId, col 6: image
 */
export default function parse(element, { document }) {
  const blades = element.querySelectorAll('.abbv-accordion-blade');

  const cells = [];

  // 14 parent config rows
  cells.push(['']);            // 0: blockHeading
  cells.push(['Expand All']); // 1: expandAllLabel
  cells.push(['Collapse All']); // 2: collapseAllLabel
  cells.push(['plus']);        // 3: expandAllIcon
  cells.push(['minus']);       // 4: collapseAllIcon
  cells.push(['plus']);        // 5: expandIcon
  cells.push(['minus']);       // 6: collapseIcon
  cells.push(['']);            // 7: expandAllIconImage
  cells.push(['']);            // 8: collapseAllIconImage
  cells.push(['']);            // 9: expandIconImage
  cells.push(['']);            // 10: collapseIconImage
  cells.push(['']);            // 11: ariaExpandAllLabel
  cells.push(['']);            // 12: ariaCollapseAllLabel
  cells.push(['']);            // 13: analyticsId

  // Child item rows (7 columns each)
  blades.forEach((blade) => {
    const titleEl = blade.querySelector('.abbv-accordion-blade-text');
    const contentEl = blade.querySelector('.abbv-accordion-content .abbv-rich-text, .abbv-accordion-content .rich-text, .abbv-accordion-content');

    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    if (titleEl) {
      const text = document.createTextNode(titleEl.textContent.trim());
      summaryFrag.appendChild(text);
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (contentEl) {
      textFrag.appendChild(contentEl.cloneNode(true));
    }

    cells.push([
      summaryFrag,  // col 0: summary
      textFrag,     // col 1: text
      '',           // col 2: fragmentPath
      '',           // col 3: ariaExpandLabel
      '',           // col 4: ariaCollapseLabel
      '',           // col 5: anchorId
      '',           // col 6: image
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
