/* eslint-disable */
/* global WebImporter */

/**
 * Parser: community-hero
 * Maps to existing 'hero' block
 * Selector: .hero-container
 */
export default function parse(element, { document }) {
  // Extract background image
  const img = element.querySelector('img');
  const imgSrc = img ? img.getAttribute('src') : '';

  // Extract eyebrow text (first paragraph)
  const eyebrowEl = element.querySelector('.abbv-stretched-card-body p:first-child');
  const eyebrow = eyebrowEl ? eyebrowEl.textContent.trim() : '';

  // Extract heading
  const headingEl = element.querySelector('h1');

  // Build hero block cells matching the hero model:
  // Row 1: image
  const imageFrag = document.createDocumentFragment();
  imageFrag.appendChild(document.createComment(' field:image '));
  if (img) {
    const pic = document.createElement('picture');
    const newImg = document.createElement('img');
    newImg.src = imgSrc;
    newImg.alt = '';
    pic.appendChild(newImg);
    const p = document.createElement('p');
    p.appendChild(pic);
    imageFrag.appendChild(p);
  }

  // Row 2: eyebrow
  const eyebrowFrag = document.createDocumentFragment();
  eyebrowFrag.appendChild(document.createComment(' field:eyebrow '));
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow;
    eyebrowFrag.appendChild(p);
  }

  // Row 3: text (heading + description)
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (headingEl) {
    textFrag.appendChild(headingEl.cloneNode(true));
  }

  const cells = [
    [imageFrag],
    [eyebrowFrag],
    [textFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
