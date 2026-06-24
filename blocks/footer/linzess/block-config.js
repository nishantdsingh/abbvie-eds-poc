import {
  loadFooterFragment,
  getSectionChildren,
  buildColumnsByHeading,
  buildBottom,
} from '../footer.js';
import decorateExternalLinksUtility from '../../../scripts/utils.js';

/**
 * LINZESS DTC footer — 6-column heading-based grid with 3 callout-only columns
 * + footer-bottom carrying sub-links, legal text, partner logos, copyright,
 * and indication code.
 *
 * Authoring (fragment at /linzess/footer):
 *   Section 1: H5 headings + ULs (one column per heading via buildColumnsByHeading).
 *     1. H5 "WHY LINZESS"            + UL of 4 sub-links
 *     2. H5 "UNDERSTANDING CONSTIPATION" + UL of 4 sub-links
 *     3. H5 "FIND RELIEF"            + UL of 2 sub-links
 *     4. H5 "RESOURCES"              + UL of 3 sub-links
 *     5. H5 "SAVINGS & SUPPORT"      + UL of 2 sub-links
 *     6. H5 "CHECK MY SYMPTOMS"      + UL of 2 sub-links (FAQs, SIGN UP FOR UPDATES)
 *   Line breaks inside specific headings/links (e.g. WHY<br>LINZESS,
 *   FIND<br class="desktop-only"> RELIEF) are inserted automatically by
 *   `applyLineBreaks()` per the LINE_BREAKS map below — replicating the
 *   live abbv-footer's authored <br> placement.
 *
 *   Section 2: footer-bottom
 *     - UL of horizontal sub-links (Accessibility Statement, Contact Us, …)
 *     - P with trademark legal text
 *     - P with US-residents disclaimer
 *     - Image: AbbVie logo  (left of bottom row)
 *     - Image: Ironwood logo (left of bottom row, after divider)
 *     - P with copyright "© 2026 AbbVie and Ironwood Pharmaceuticals, Inc. …"
 *     - P with indication code "US-LIN-250071"
 *
 * @param {Element} block
 */
/**
 * Line-break rules mirroring the live abbv-footer's inline <br> placement.
 * Each rule says: "if a link/heading's full text equals `match`, insert a
 * <br> after `after` (rule.after must be a prefix of rule.match)".
 * `desktopOnly: true` makes the <br> behave like the live's
 * `<br class="desktop-only">` — present on desktop, hidden on mobile.
 */
const LINE_BREAKS = [
  { match: 'WHY LINZESS', after: 'WHY', desktopOnly: false },
  { match: 'FIND RELIEF', after: 'FIND', desktopOnly: true },
  { match: 'SAVINGS & SUPPORT', after: 'SAVINGS', desktopOnly: true },
  { match: 'CHECK MY SYMPTOMS', after: 'CHECK MY', desktopOnly: true },
  { match: 'SIGN UP FOR UPDATES', after: 'SIGN UP', desktopOnly: true },
  { match: 'Constipation Treatment Options', after: 'Constipation', desktopOnly: false },
  { match: 'Community Resources', after: 'Community', desktopOnly: true },
];

/**
 * Apply LINE_BREAKS to anchors and headings inside `root`. Anchors are
 * processed first so an `<h5><a>...</a></h5>` callout doesn't get its
 * <a> destroyed. Each element is broken at most once (early-return when
 * a <br> already exists inside).
 */
function applyLineBreaks(root) {
  const elements = [
    ...root.querySelectorAll('a'),
    ...root.querySelectorAll('h1, h2, h3, h4, h5, h6'),
  ];
  elements.forEach((el) => {
    if (el.querySelector('br')) return;
    const text = el.textContent.trim();
    const rule = LINE_BREAKS.find((r) => r.match === text);
    if (!rule) return;
    const before = text.slice(0, rule.after.length);
    const after = text.slice(rule.after.length);
    el.textContent = '';
    el.append(before);
    const br = document.createElement('br');
    if (rule.desktopOnly) br.className = 'footer-br-desktop';
    el.append(br, after);
  });
}

/**
 * Group footer-bottom's last four authored items (logo1, logo2, copyright,
 * indication code) into two wrapper divs so CSS grid can place them
 * deterministically: logos packed left, texts packed right.
 * Expects 6 P children (2 legal + 2 logo + copy + code) — no-op otherwise.
 * @param {Element} bottom .footer-bottom container
 */
function groupBottomLogosAndTexts(bottom) {
  const ps = bottom.querySelectorAll(':scope > p');
  if (ps.length < 6) return;
  const [, , logo1, logo2, copy, code] = ps;

  const logos = document.createElement('div');
  logos.className = 'footer-bottom-logos';
  logo1.before(logos);
  logos.append(logo1, logo2);

  const texts = document.createElement('div');
  texts.className = 'footer-bottom-texts';
  copy.before(texts);
  texts.append(copy, code);
}

/**
 * Floating back-to-top button (live: circular up-arrow that smooth-scrolls to
 * the top). Appended to <body> so it floats above page content. It shows only
 * once the floating safety bar has hidden itself (i.e. the ISI/footer has
 * scrolled into view) so the two never overlap — matching live behaviour.
 * Falls back to a 300px scroll threshold when no safety bar is present.
 */
function createBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'back to top');
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  let ticking = false;
  const update = () => {
    const safetyBar = document.querySelector('.safety-bar-section');
    const show = safetyBar
      ? safetyBar.classList.contains('is-hidden')
      : window.scrollY > 300;
    btn.classList.toggle('is-visible', show);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
  update();

  document.body.appendChild(btn);
}

async function decorateLinzess(block) {
  const fragment = await loadFooterFragment();
  block.textContent = '';

  const sections = fragment.querySelectorAll('.section');

  if (sections.length > 0) {
    const columns = buildColumnsByHeading(getSectionChildren(sections[0]));
    applyLineBreaks(columns);
    block.appendChild(columns);
    decorateExternalLinksUtility(columns);
  }

  if (sections.length > 1) {
    const wrapper = sections[1].querySelector('.default-content-wrapper');
    if (wrapper) {
      const bottom = buildBottom(Array.from(wrapper.children));
      groupBottomLogosAndTexts(bottom);
      decorateExternalLinksUtility(bottom);
      block.appendChild(bottom);
    }
  }

  createBackToTop();
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateLinzess(ctx),
    },
  };
}
