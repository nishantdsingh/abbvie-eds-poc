/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form variant.
 * Base block: form
 * Source: https://www.linzess.com/savings-card
 * Selector: .forms-embed .cmp-adaptiveform-container
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract form reference path from the adaptive form link
  const formLink = element.querySelector('link[href*="/content/forms/"]');
  let formPath = '';

  if (formLink) {
    formPath = formLink.getAttribute('href')
      .replace(/\.html$/, '')
      .replace(/\/jcr:content\/guideContainer$/, '')
      .replace(/^\/abbviecloud/, '');
  }

  // Row with field hint for xwalk
  const refFrag = document.createDocumentFragment();
  refFrag.appendChild(document.createComment(' field:reference '));
  if (formPath) {
    refFrag.appendChild(document.createTextNode(formPath));
  }

  cells.push([refFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
