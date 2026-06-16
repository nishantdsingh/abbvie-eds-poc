import { resolveImageReference } from '../../scripts/scripts.js';
import decorateExternalLinksUtility from '../../scripts/utils.js';

export default function decorate(block) {
  const rowData = [...block.children];
  const anchorId = rowData[0]?.textContent.trim();
  if (anchorId) {
    block.id = anchorId;
    rowData[0]?.remove();
  }

  rowData.forEach((item) => {
    item.classList.add('columns-item');

    [...item.children].forEach((cell) => {
      resolveImageReference(cell);
      if (cell.querySelector('picture, img')) {
        cell.classList.add('columns-item-image');
      } else {
        cell.classList.add('columns-item-content');
      }
    });
  });

  decorateExternalLinksUtility(block);
}
