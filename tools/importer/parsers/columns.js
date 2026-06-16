/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns variant.
 * Base block: columns
 * Source: https://www.linzess.com/savings-and-support/faqs
 * Selector: .abbv-flex-container-v2
 * Generated: 2026-06-02
 *
 * Structure (from UE model):
 *   Container block with child "column" items.
 *   Each column has: content (richtext), image (reference), imageAlt (text).
 *   Columns blocks do NOT require field hint comments (xwalk exception).
 *
 * Source DOM:
 *   .abbv-flex-container-v2
 *     .flexboxitem-v2 .parbase
 *       .abbv-flex-item-v2
 *         .rich-text > .abbv-rich-text > p.heading-2
 *         .cta > a.abbv-button-primary
 */
export default function parse(element, { document }) {
  // Extract each column item from the flex container
  const columnItems = element.querySelectorAll(':scope .abbv-flex-item-v2');

  // Build one row where each cell represents a column's content
  const cells = [];
  const row = [];

  columnItems.forEach((col) => {
    // Create a container fragment for this column's content
    const colContent = document.createElement('div');

    // Extract heading (p.heading-2, or fallback to h2, h3, any .heading-*)
    const heading = col.querySelector('p.heading-2, h2, h3, [class*="heading"]');
    if (heading) {
      // Convert to proper heading element for semantic markup
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      colContent.appendChild(h2);
    }

    // Extract CTA link(s)
    const ctas = col.querySelectorAll('.cta a, a.abbv-button-primary, a[class*="abbv-button"]');
    ctas.forEach((cta) => {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href') || '';
      link.textContent = cta.textContent.trim();
      // Wrap in paragraph for proper block rendering
      const p = document.createElement('p');
      p.appendChild(link);
      colContent.appendChild(p);
    });

    // Extract any images if present (optional per UE model)
    const img = col.querySelector('img');
    if (img) {
      colContent.appendChild(img.cloneNode(true));
    }

    row.push(colContent);
  });

  if (row.length > 0) {
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
