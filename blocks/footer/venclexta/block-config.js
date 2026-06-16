import {
  loadFooterFragment,
  getSectionChildren,
  buildColumnsByHeading,
  buildBottom,
} from '../footer.js';
import decorateExternalLinksUtility from '../../../scripts/utils.js';

/**
 * VENCLEXTA DTC footer — heading-based columns, footer-bottom, and logo strip.
 *
 * Authoring (fragment at /venclexta/footer):
 *   Section 1:
 *     H5 "About AML" + UL of links
 *     H5 "Why VENCLEXTA?" + UL of links
 *     H5 "Taking VENCLEXTA" + UL of links
 *     H5 with "Side Effects" link (heading-only column, no UL)
 *     H5 "Resources & Support" + UL of links
 *   Section 2:
 *     UL of horizontal sub-links (Site Map, Terms, Privacy, etc.)
 *     P with copyright/legal text
 *     P with indication code (e.g. US-VEN-230090)
 *   Section 3 (logo strip):
 *     1st image (with optional link): partner logo (e.g. AbbVie)
 *     2nd image (with optional link): partner logo (e.g. Genentech)
 *     3rd image (with optional link): brand logo (Venclexta) — right-aligned
 *
 * @param {Element} block
 */
async function decorateVenclexta(block) {
  const fragment = await loadFooterFragment();
  block.textContent = '';

  const sections = fragment.querySelectorAll('.section');

  if (sections.length > 0) {
    const columns = buildColumnsByHeading(getSectionChildren(sections[0]));
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

  /* Section 3 → footer-logos (partner logos left, brand logo right). */
  if (sections.length > 2) {
    const wrapper = sections[2].querySelector('.default-content-wrapper');
    if (wrapper) {
      const logos = document.createElement('div');
      logos.className = 'footer-logos';
      Array.from(wrapper.children).forEach((child) => {
        logos.appendChild(child.cloneNode(true));
      });
      decorateExternalLinksUtility(logos);
      block.appendChild(logos);
    }
  }
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateVenclexta(ctx),
    },
  };
}
