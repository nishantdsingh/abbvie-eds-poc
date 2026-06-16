/*
 * Text Container block
 * This block allows content authors to create rows of text with one or two columns.
 * configuration can be set by adding a paragraph with the format "class:classname" in any row.
 * class will be added to the block, and the row will be removed from the DOM.
 * Future enhancements may include support for other properties, such as "id:myid".
 */
import { applyCommonProps } from '../../scripts/utils.js';

export default function decorate(block) {
  applyCommonProps(block);
  const rows = [...block.children];
  // Strip the leading placeholder rows (variant/blockId/language/analytics).
  // md2jcr routes the variant + common props to the block class attribute, so
  // the delivered placeholders are bare markers ('-', 'none', or empty). Only
  // remove rows that are genuine placeholders — never a real content item.
  // (A blanket "row lacks nested content" check wrongly dropped the first
  // content item when it was paragraph-only, e.g. the text-two-columns EASI 75
  // column whose markup has no heading/list/nested div.)
  const parentRowCount = 4;
  const isPlaceholder = (row) => {
    const text = row.textContent.trim();
    if (text === '' || text === '-' || text.toLowerCase() === 'none') return true;
    return /^(id|lang):/i.test(text);
  };
  for (let i = 0; i < Math.min(parentRowCount, rows.length); i += 1) {
    const row = rows[i];
    if (isPlaceholder(row)) {
      row.remove();
    }
  }
  // Unwrap extra div wrapper from each remaining row
  [...block.children].forEach((row) => {
    const child = row.querySelector('div');
    if (child && row.children.length === 1) {
      while (child.firstChild) {
        const element = child.firstChild;
        if (element.tagName === 'PICTURE') {
          element.classList?.add('text-container-picture');
        } else {
          element.classList?.add('text-container-text');
        }
        row.appendChild(element);
      }
      child.remove();
    }
  });
}
