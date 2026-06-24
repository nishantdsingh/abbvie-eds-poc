/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero
 * Base block: hero
 * Source: https://www.linzess.com/find-relief
 * Selector: .hero-container.abbv-image-text-v2
 * Generated: 2026-06-09
 *
 * UE Model fields (13 rows, excluding tabs):
 *  Row 0: image (reference), Row 1: imageAlt (text — collapsed into image, skip)
 *  Row 2: mobileImage (reference), Row 3: mobileImageAlt (text — collapsed, skip)
 *  Row 4: eyebrow (text), Row 5: indication (richtext)
 *  Row 6: text (richtext), Row 7: layers (richtext)
 *  Row 8: video (reference), Row 9: imageCaption (text)
 *  Row 10: textAlign (select — classes_textAlign suffix, skip)
 *  Row 11: textColor (select — classes_textColor suffix, skip)
 *  Row 12: customClass (text — classes_customClass suffix, skip)
 *
 * Per xwalk hinting: fields ending in Alt, Type, MimeType are collapsed into parent.
 * classes_* suffixed fields are collapsed into the block's classes attribute.
 * So actual rows in plain.html = image, mobileImage, eyebrow, indication, text, layers, video, imageCaption
 * = 8 content rows.
 */
export default function parse(element, { document }) {
  // Extract background image
  const img = element.querySelector('.abbv-image-content-container-v2 img');
  const imgSrc = img?.getAttribute('src') || '';
  const imgAlt = img?.getAttribute('alt') || '';

  // Extract eyebrow text
  const eyebrowEl = element.querySelector('.eyebrow, .eyebrow--white');
  const eyebrow = eyebrowEl?.textContent?.trim() || '';

  // Extract heading text (h1 or .heading-1)
  const headingEl = element.querySelector('h1, .heading-1');
  const headingText = headingEl?.textContent?.trim() || '';

  // Extract image caption (e.g., "Actor Portrayal" overlay)
  const captionEl = element.querySelector('.tout-overlay');
  const imageCaption = captionEl?.textContent?.trim() || '';

  // Determine classes/variants from container
  const classes = [];
  if (element.classList.contains('uppercase')) classes.push('no-padding');
  const contentContainer = element.querySelector('.abbv-image-text-content-container-v2');
  if (contentContainer) {
    if (contentContainer.classList.contains('middle-left')) classes.push('text-left');
    else if (contentContainer.classList.contains('middle-center')) classes.push('text-center');
    else if (contentContainer.classList.contains('middle-right')) classes.push('text-right');
  }

  // Build the block name with variant classes
  const blockName = classes.length > 0 ? `hero (${classes.join(', ')})` : 'hero';

  // Build image element for row
  const imageEl = document.createElement('img');
  imageEl.src = imgSrc;
  if (imgAlt) imageEl.alt = imgAlt;

  // Build heading element
  const h1 = document.createElement('h1');
  h1.textContent = headingText;

  // Build cells: each row is one field
  // Row layout: image, mobileImage (empty), eyebrow, indication (empty), text, layers (empty), video (empty), imageCaption
  const cells = [
    [imageEl],                                    // image
    [''],                                         // mobileImage (not available in source)
    [eyebrow],                                    // eyebrow
    [''],                                         // indication (not used on this page)
    [h1],                                         // text (heading & body)
    [''],                                         // layers (not used)
    [''],                                         // video (not used)
    [imageCaption],                               // imageCaption
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  element.replaceWith(block);
}
