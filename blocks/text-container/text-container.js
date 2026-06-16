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
  const parentRowCount = 4;
  for (let i = 0; i < Math.min(parentRowCount, rows.length); i += 1) {
    const row = rows[i];
    const innerDiv = row.querySelector(':scope > div');
    const content = innerDiv || row;
    const hasItemContent = content.querySelector('div, h1, h2, h3, h4, h5, h6, ul, ol, table, picture');
    if (!hasItemContent) {
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
