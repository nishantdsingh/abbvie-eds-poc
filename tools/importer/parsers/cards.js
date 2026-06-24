/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards
 * Base block: cards
 * Source: https://www.linzess.com/find-relief
 * Selectors: .abbv-flex-container-v2:has(.icon-image-card), .savings-card-cards
 * Generated: 2026-06-04
 *
 * Handles two card instances:
 * 1. "Already Been Prescribed" - 2 cards with icon, heading, description (no CTA)
 * 2. "Need A Savings Card" - 3 cards with icon, heading, description, and CTA button
 *
 * UE Model (container block):
 *   - Parent: cards (fields: classes [SKIP])
 *   - Child: card (fields: image [reference], text [richtext])
 *   - Each card = one row with 2 columns: image | text
 */
export default function parse(element, { document }) {
  // Guard: only process actual card containers (have .flexbox-cards class)
  // This excludes tab-internal flex containers that also match :has(.icon-image-card)
  if (!element.classList.contains('flexbox-cards') && !element.classList.contains('savings-card-cards')) {
    return;
  }

  // Find direct card items (immediate .flexboxitem-v2 children contain the card items)
  const cardItems = element.querySelectorAll(':scope > .flexboxitem-v2 > .abbv-flex-item-v2.icon-image-card');

  // Guard: skip if no card items found
  if (!cardItems.length) return;

  const cells = [];

  cardItems.forEach((card) => {
    // Extract icon image
    const img = card.querySelector('.abbv-image-content-container-v2 img');

    // Extract text content: heading + description + optional CTA
    const cardBody = card.querySelector('.abbv-stretched-card-body');
    const heading = cardBody ? cardBody.querySelector('.heading-2') : null;
    const description = cardBody ? cardBody.querySelector('p:not(.heading-2)') : null;

    // Optional CTA link (present in savings-card-cards instance)
    const ctaLink = card.querySelector('.cta a');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      const imgEl = document.createElement('img');
      imgEl.src = img.getAttribute('src') || '';
      imgEl.alt = img.getAttribute('alt') || '';
      imageCell.appendChild(imgEl);
    }

    // Build text cell with field hint - contains heading, description, and optional CTA
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      textCell.appendChild(h);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }
    if (ctaLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.getAttribute('href') || '';
      a.textContent = ctaLink.textContent.trim();
      p.appendChild(a);
      textCell.appendChild(p);
    }

    // Each card is one row with two columns: [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
