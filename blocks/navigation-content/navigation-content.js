import { applyCommonProps } from '../../scripts/utils.js';

// All variant class values from the navigation-content UE model's classes select field.
// Explicit matching prevents lang:* / id:* / custom classes from being misdetected as the type.
const BLOCK_TYPES = [
  'logo', 'language-links', 'search', 'utility-nav',
  'eyebrow', 'floating-isi', 'cta-group',
];

export default function decorate(block) {
  const typeClass = BLOCK_TYPES.find((t) => block.classList.contains(t));
  block.dataset.type = typeClass || 'navigation-content';

  const secondCol = block.children[1];
  if (secondCol) {
    const toolsLink = secondCol.querySelector(':scope > div > div > p:nth-of-type(2) > a');
    if (toolsLink) toolsLink.classList.add('navigation-content-preview-tools-link');
  }

  const firstCol = block.children[0];
  if (!firstCol) return;

  const wrapper = firstCol.firstElementChild;
  if (!wrapper) return;

  wrapper
    .querySelector(':scope > p:first-child')
    ?.classList.add('navigation-content-preview-heading');

  wrapper
    .querySelector(':scope > p:nth-of-type(2) > a')
    ?.classList.add('navigation-content-preview-link');
  applyCommonProps(block);
}
