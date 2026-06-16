/* eslint-disable */
/* global WebImporter */

/**
 * Parser: community-cards
 * Maps to existing 'cards' block
 * Selectors: .flexbox-article-cards, .resources-page (flex containers with card items)
 *
 * cards model: container with card items (image | text per item)
 */
export default function parse(element, { document }) {
  // Find all flex items within this container
  const items = element.querySelectorAll('.abbv-flex-item-v2');
  if (!items || items.length === 0) return;

  const rows = [];
  items.forEach((item) => {
    // Extract image
    const img = item.querySelector('img');

    // Extract text content (title, description, CTA)
    const title = item.querySelector('.abbv-stretched-card-body p b')
      || item.querySelector('.abbv-stretched-card-body p:first-child');
    const descEl = item.querySelector('.abbv-stretched-card-body p:nth-child(2)');
    const ctaEl = item.querySelector('.abbv-stretched-card-body a');

    // Also check for icon-based cards (wellness/resource pattern)
    const iconImg = item.querySelector('.abbv-image-content-container-v2 img')
      || item.querySelector('img');
    const headingEl = item.querySelector('.abbv-stretched-card-body p b')
      || item.querySelector('p.heading-2')
      || item.querySelector('h2');
    const listEl = item.querySelector('ul');

    // Build image cell
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    if (iconImg || img) {
      const pic = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = (iconImg || img).getAttribute('src') || '';
      newImg.alt = (iconImg || img).getAttribute('alt') || '';
      pic.appendChild(newImg);
      const p = document.createElement('p');
      p.appendChild(pic);
      imageFrag.appendChild(p);
    }

    // Build text cell (rich text with title, desc, CTA or list)
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    // Title
    const titleText = title ? title.textContent.trim()
      : (headingEl ? headingEl.textContent.trim() : '');
    if (titleText) {
      const h = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleText;
      h.appendChild(strong);
      textFrag.appendChild(h);
    }

    // Description or list
    if (listEl) {
      textFrag.appendChild(listEl.cloneNode(true));
    } else if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      textFrag.appendChild(p);
    }

    // CTA link
    if (ctaEl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaEl.getAttribute('href') || '';
      a.textContent = ctaEl.textContent.trim();
      p.appendChild(a);
      textFrag.appendChild(p);
    }

    rows.push([imageFrag, textFrag]);
  });

  if (rows.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells: rows });
  element.replaceWith(block);
}
