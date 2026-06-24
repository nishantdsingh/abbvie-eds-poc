/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns
 * Base block: columns
 * Source: https://www.linzess.com/find-relief
 * Selectors:
 *   - .image-outside-container-v3.abbv-image-text-v2 (image + text CTA layout)
 *   - .abbv-row-container.savings-card-tout (savings card image + text CTA layout)
 *   - .abbv-container.background-dark-purple-gradient .abbv-image-text-v2 (bottom nav text+CTA columns)
 * Generated: 2026-06-04
 *
 * Columns block: each column is a child item with content (richtext) and image (reference).
 * Per xwalk hinting rules, Columns blocks do NOT require field hint comments.
 * UE Model: columns (parent) with column (child) items containing content + image fields.
 *
 * Handles three layout patterns:
 * 1. image-outside-container-v3: image left (with overlay text) + heading/paragraph/CTA right
 * 2. savings-card-tout: image left + heading/paragraph/CTA/secondary link right
 * 3. bottom-nav flex items: heading+CTA | heading+CTA (no images, text-only columns)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: .image-outside-container-v3.abbv-image-text-v2
  // Structure: This element is INSIDE the first .abbv-col.abbv-col-6 (image column).
  // The text column is a sibling .abbv-col at the .abbv-row level.
  // Navigate up to .abbv-row to find both columns.
  if (element.classList.contains('image-outside-container-v3')) {
    // Column 1: image from within this element
    const imageCol = [];
    const img = element.querySelector('.abbv-image-content-container-v2 img, picture');
    if (img) {
      const picture = img.closest('picture') || img;
      imageCol.push(picture);
    }

    // Column 2: navigate up to parent row to find the sibling text column
    const textCol = [];
    const parentRow = element.closest('.abbv-row');
    if (parentRow) {
      const cols = parentRow.querySelectorAll(':scope > .abbv-col');
      // The text column is the sibling col (not the one containing this element)
      const textColEl = cols.length > 1 ? cols[1] : null;
      if (textColEl) {
        const richText = textColEl.querySelector('.abbv-rich-text');
        if (richText) {
          const heading = richText.querySelector('p[class*="heading"], [class*="heading"]');
          if (heading) textCol.push(heading);
          const paragraphs = richText.querySelectorAll('p:not([class*="heading"])');
          paragraphs.forEach((p) => textCol.push(p));
        }
        const cta = textColEl.querySelector('.cta a, a.abbv-button-primary');
        if (cta) textCol.push(cta);
      }
    }

    cells.push([imageCol, textCol]);
  }
  // Pattern 2: .abbv-row-container.savings-card-tout
  // Structure: .abbv-row with two .abbv-col.abbv-col-6 children
  else if (element.classList.contains('savings-card-tout')) {
    const cols = element.querySelectorAll(':scope .abbv-col.abbv-col-6');

    // Column 1: image column
    const imageCol = [];
    if (cols.length > 0) {
      const img = cols[0].querySelector('img, picture');
      if (img) {
        const picture = img.closest('picture') || img;
        imageCol.push(picture);
      }
    }

    // Column 2: text content (heading, paragraph, CTA, secondary link)
    const textCol = [];
    if (cols.length > 1) {
      const richTexts = cols[1].querySelectorAll('.abbv-rich-text');
      richTexts.forEach((rt) => {
        const heading = rt.querySelector('[class*="heading"]');
        if (heading) textCol.push(heading);
        const paragraphs = rt.querySelectorAll('p:not([class*="heading"])');
        paragraphs.forEach((p) => textCol.push(p));
      });
      const ctas = cols[1].querySelectorAll('.cta a, a.abbv-button-primary');
      ctas.forEach((cta) => textCol.push(cta));
    }

    cells.push([imageCol, textCol]);
  }
  // Pattern 3: bottom-nav flex container (text-only columns with heading + CTA)
  // The element is the .abbv-image-text-v2 inside .abbv-container.bottom-nav,
  // OR the element could be the flex container itself
  else {
    // Look for flex items as column sources
    const flexItems = element.querySelectorAll('.flexboxitem-v2 .abbv-flex-item-v2, .abbv-flex-item-v2');
    if (flexItems.length > 0) {
      const row = [];
      flexItems.forEach((item) => {
        const col = [];
        const heading = item.querySelector('.abbv-rich-text [class*="heading"], .abbv-rich-text p');
        if (heading) col.push(heading);
        const cta = item.querySelector('.cta a, a.abbv-button-primary');
        if (cta) col.push(cta);
        row.push(col);
      });
      cells.push(row);
    } else {
      // Fallback: treat as generic two-column with whatever content is available
      const allCols = element.querySelectorAll('.abbv-col');
      if (allCols.length > 0) {
        const row = [];
        allCols.forEach((col) => {
          const colContent = [];
          const heading = col.querySelector('[class*="heading"], h2, h3');
          if (heading) colContent.push(heading);
          const paragraphs = col.querySelectorAll('p:not([class*="heading"])');
          paragraphs.forEach((p) => colContent.push(p));
          const cta = col.querySelector('.cta a, a.abbv-button-primary, a[class*="button"]');
          if (cta) colContent.push(cta);
          row.push(colContent);
        });
        cells.push(row);
      }
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
