import {
  loadFooterFragment,
  getSectionChildren,
  buildColumnsByHeading,
  buildBottom,
} from '../footer.js';
import decorateExternalLinksUtility from '../../../scripts/utils.js';

/* Indication codes look like US-RNQD-250405 — uppercase prefix + numeric suffix. */
const INDICATION_CODE = /^US-[A-Z]+-\d+$/;

/**
 * RINVOQ DTC footer — three-column heading-based grid with an extra
 * `.footer-top` carrying the indication code.
 *
 * Authoring (fragment at /rinvoq-dtc/footer):
 *   Section 1: H5 "RINVOQ (upadacitinib)" + UL,
 *              H5 "Important Information for Patients" + UL,
 *              H5 "Information from AbbVie" + UL
 *   Section 2: P with indication code (US-XXX-XXXXXX)  → .footer-top
 *              Optional copyright/legal P(s)            → .footer-bottom
 *              Image: AbbVie logo                       → .footer-bottom
 *
 * @param {Element} block
 */
async function decorateRinvoqDtc(block) {
  const fragment = await loadFooterFragment();
  block.textContent = '';

  const sections = fragment.querySelectorAll('.section');

  /* Split section 2: indication code → footer-top, everything else → footer-bottom. */
  let indicationCode = null;
  const bottomItems = [];
  if (sections.length > 1) {
    const wrapper = sections[1].querySelector('.default-content-wrapper');
    if (wrapper) {
      Array.from(wrapper.children).forEach((child) => {
        if (child.tagName === 'P' && INDICATION_CODE.test(child.textContent.trim())) {
          indicationCode = child;
        } else {
          bottomItems.push(child);
        }
      });
    }
  }

  if (indicationCode) {
    const top = document.createElement('div');
    top.className = 'footer-top';
    top.appendChild(indicationCode.cloneNode(true));
    block.appendChild(top);
  }

  if (sections.length > 0) {
    const columns = buildColumnsByHeading(getSectionChildren(sections[0]));
    block.appendChild(columns);
    decorateExternalLinksUtility(columns);
  }

  if (bottomItems.length) {
    const bottom = buildBottom(bottomItems);
    decorateExternalLinksUtility(bottom);
    block.appendChild(bottom);
  }
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateRinvoqDtc(ctx),
    },
  };
}
