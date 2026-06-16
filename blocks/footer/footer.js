import { getMetadata } from '../../scripts/aem.js';
import { renderBlock } from '../../scripts/multi-theme.js';
import decorateExternalLinksUtility from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Load the footer fragment from the page's `footer` metadata,
 * falling back to `/footer` when no override is set.
 * @returns {Promise<Element>} fragment root element
 */
export async function loadFooterFragment() {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  return loadFragment(footerPath);
}

/**
 * Collect children from default-content-wrapper and social-media-wrapper
 * inside a section, in document order.
 * @param {Element} section
 * @returns {Element[]} children (live references — clone before insertion)
 */
export function getSectionChildren(section) {
  const children = [];
  const wrappers = section.querySelectorAll('.default-content-wrapper, .social-media-wrapper');
  wrappers.forEach((wrapper) => children.push(...wrapper.children));
  return children;
}

function createColumn(className, children) {
  const column = document.createElement('div');
  column.className = className;
  children.forEach((child) => column.appendChild(child));
  return column;
}

/**
 * Default positional column strategy: leading picture → logo,
 * UL/social run → primary, P+UL pair → secondary, remainder → tertiary.
 * @param {Element[]} children
 * @returns {Element} .footer-columns container
 */
export function buildColumnsByPosition(children) {
  const container = document.createElement('div');
  container.className = 'footer-columns';
  let cursor = 0;

  const logoChildren = [];
  if (children[cursor] && children[cursor].querySelector('picture')) {
    logoChildren.push(children[cursor].cloneNode(true));
    cursor += 1;
  }
  container.appendChild(createColumn('footer-column footer-logo', logoChildren));

  const primaryLinkChildren = [];
  while (
    cursor < children.length
    && (children[cursor].tagName === 'UL' || children[cursor].classList.contains('social-media'))
  ) {
    primaryLinkChildren.push(children[cursor].cloneNode(true));
    cursor += 1;
  }
  container.appendChild(createColumn('footer-column footer-links-primary', primaryLinkChildren));

  const secondaryLinkChildren = [];
  if (cursor < children.length && children[cursor].tagName === 'P') {
    secondaryLinkChildren.push(children[cursor].cloneNode(true));
    cursor += 1;
  }
  if (cursor < children.length && children[cursor].tagName === 'UL') {
    secondaryLinkChildren.push(children[cursor].cloneNode(true));
    cursor += 1;
  }
  container.appendChild(createColumn('footer-column footer-links-secondary', secondaryLinkChildren));

  const tertiaryLinkChildren = [];
  while (cursor < children.length) {
    tertiaryLinkChildren.push(children[cursor].cloneNode(true));
    cursor += 1;
  }
  container.appendChild(createColumn('footer-column footer-links-tertiary', tertiaryLinkChildren));

  return container;
}

/**
 * Heading-based column strategy: each H1–H6 starts a new column.
 * Children before any heading are placed in an implicit first column.
 * @param {Element[]} children
 * @returns {Element} .footer-columns container
 */
export function buildColumnsByHeading(children) {
  const container = document.createElement('div');
  container.className = 'footer-columns';
  let currentColumn = null;
  let columnIndex = 0;

  const startColumn = () => {
    columnIndex += 1;
    currentColumn = document.createElement('div');
    currentColumn.className = `footer-column footer-column-${columnIndex}`;
    container.appendChild(currentColumn);
  };

  children.forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName) || !currentColumn) {
      startColumn();
    }
    currentColumn.appendChild(child.cloneNode(true));
  });

  return container;
}

/**
 * Build a `.footer-bottom` container from the given items (cloned).
 * @param {Element[]} items
 * @returns {Element}
 */
export function buildBottom(items) {
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  items.forEach((item) => bottom.appendChild(item.cloneNode(true)));
  return bottom;
}

/**
 * Default footer decoration — positional columns from section 1,
 * footer-bottom from section 2.
 * @param {Element} block
 */
export async function decorateBlock(block) {
  const fragment = await loadFooterFragment();
  block.textContent = '';

  const sections = fragment.querySelectorAll('.section');

  if (sections.length > 0) {
    const columns = buildColumnsByPosition(getSectionChildren(sections[0]));
    block.appendChild(columns);
    decorateExternalLinksUtility(columns);
  }

  if (sections.length > 1) {
    const wrapper = sections[1].querySelector('.default-content-wrapper');
    if (wrapper) {
      const bottom = buildBottom(Array.from(wrapper.children));
      decorateExternalLinksUtility(bottom);
      block.appendChild(bottom);
    }
  }
}

/**
 * Default export — entry point called by the block loader.
 * Delegates to renderBlock which loads block-config.js (global + brand merge)
 * and runs the configured decorations hooks.
 * @param {Element} block
 */
export default async function decorate(block) {
  await renderBlock(block);
}
