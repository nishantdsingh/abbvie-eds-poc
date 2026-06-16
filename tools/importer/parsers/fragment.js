/* eslint-disable */
/* global WebImporter */

/**
 * Parser: fragment
 * Base block: fragment
 * Source: https://www.linzess.com/find-relief
 * Selector: .abbv-inline-use-isi
 * Generated: 2026-06-04
 *
 * The fragment block references shared ISI content managed as a fragment.
 * It outputs a single row containing a link to the fragment path.
 * UE Model field: reference (aem-content)
 */
export default function parse(element, { document }) {
  // The ISI content is shared across all Linzess pages as a fragment reference.
  // Instead of importing the full ISI content inline, we reference the fragment path.
  const fragmentPath = '/fragments/isi/linzess';

  // Create link element for the fragment reference
  const link = document.createElement('a');
  link.href = fragmentPath;
  link.textContent = fragmentPath;

  // Build cells: single row with fragment reference
  // Field hint for xwalk UE model: reference (aem-content)
  const cells = [
    [link], // <!-- field:reference -->
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
  element.replaceWith(block);
}
