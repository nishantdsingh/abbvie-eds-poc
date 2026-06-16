/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion
 * Selector: .abbv-accordion-container
 *
 * XWalk container block: NO parent config rows (those are JCR node properties).
 * Only item rows with 7 columns matching accordion-item model:
 * summary | text | fragmentPath | ariaExpandLabel | ariaCollapseLabel | anchorId | image
 *
 * Skipped per hinting rules: classes_defaultOpen (classes prefix), imageAlt (collapsed suffix)
 */
export default function parse(element, { document }) {
  if (element.dataset && element.dataset.accordionProcessed) return;
  if (!element.closest || !element.parentElement) return;

  const section = element.closest('.abbv-container') || element.parentElement;
  const allContainers = section.querySelectorAll('.abbv-accordion-container');

  if (!allContainers || allContainers.length === 0) return;

  const itemRows = [];
  allContainers.forEach((container) => {
    const questionEl = container.querySelector('.abbv-accordion-blade-text');
    const answerContainer = container.querySelector('.abbv-accordion-content .abbv-rich-text')
      || container.querySelector('.abbv-accordion-content .rich-text');

    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    if (questionEl) {
      summaryFrag.appendChild(questionEl.cloneNode(true));
    }

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (answerContainer) {
      textFrag.appendChild(answerContainer.cloneNode(true));
    }

    // 7 columns: summary | text | fragmentPath | ariaExpandLabel | ariaCollapseLabel | anchorId | image
    // Empty cells have no field hints per hinting Rule 4
    itemRows.push([
      summaryFrag,
      textFrag,
      '',
      '',
      '',
      '',
      '',
    ]);

    container.setAttribute('data-accordion-processed', 'true');
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells: itemRows });
  element.replaceWith(block);

  allContainers.forEach((container) => {
    if (container.parentElement) {
      const parbase = container.closest('.accordion.parbase')
        || container.closest('.abbv-accordion')
        || container;
      if (parbase && parbase.parentElement) {
        parbase.remove();
      }
    }
  });
}
