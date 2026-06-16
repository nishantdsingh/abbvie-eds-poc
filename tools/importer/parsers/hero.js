/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant.
 * Base block: hero
 * Source: https://www.linzess.com/savings-and-support/faqs
 * Selector: .savings-faq-hero
 * Generated: 2026-06-02
 *
 * Target table structure (from block library):
 *   | Hero |
 *   | background-image |
 *   | eyebrow text |
 *   | heading |
 *   | cta link (optional) |
 *
 * UE Model fields: image, imageAlt, eyebrow, text
 */
export default function parse(element, { document }) {
  // Extract background image from picture element or img
  const bgImage = element.querySelector('.abbv-image-content-container-v2 img, picture img, img[class*="hero"], img');

  // Extract eyebrow text
  const eyebrow = element.querySelector('p.eyebrow, .eyebrow, [class*="eyebrow"]');

  // Extract heading (h1 primary, h2/h3 fallback)
  const heading = element.querySelector('h1, h2, h3, [class*="heading"]');

  // Extract CTA links (optional)
  const ctaLinks = Array.from(element.querySelectorAll('a.cta, a.button, .abbv-stretched-card-body a, a[class*="btn"]'));

  // Build cells to match block library table structure
  const cells = [];

  // Row 1: Background image with field hint
  if (bgImage) {
    const imageCell = document.createElement('div');
    const imageHint = document.createComment(' field: image ');
    imageCell.appendChild(imageHint);
    imageCell.appendChild(bgImage.cloneNode(true));
    cells.push([imageCell]);
  } else {
    // Empty row required for xwalk even if no image
    const emptyImageCell = document.createElement('div');
    const imageHint = document.createComment(' field: image ');
    emptyImageCell.appendChild(imageHint);
    cells.push([emptyImageCell]);
  }

  // Row 2: Eyebrow text with field hint
  const eyebrowCell = document.createElement('div');
  const eyebrowHint = document.createComment(' field: eyebrow ');
  eyebrowCell.appendChild(eyebrowHint);
  if (eyebrow) {
    eyebrowCell.appendChild(eyebrow.cloneNode(true));
  }
  cells.push([eyebrowCell]);

  // Row 3: Heading (and optional body text / CTAs) with field hint
  const textCell = document.createElement('div');
  const textHint = document.createComment(' field: text ');
  textCell.appendChild(textHint);
  if (heading) {
    const headingClone = heading.cloneNode(true);
    // Markdown headings are single-line, so a mid-heading <br> is dropped on
    // publish and the surrounding phrases concatenate (e.g. "QuestionsAbout").
    // Replace each <br> with a space so the heading stays readable and wraps
    // naturally on the rendered page.
    headingClone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode(' '));
    });
    textCell.appendChild(headingClone);
  }
  // Append CTA links if present
  if (ctaLinks.length > 0) {
    ctaLinks.forEach((link) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.appendChild(link.cloneNode(true));
      p.appendChild(strong);
      textCell.appendChild(p);
    });
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
