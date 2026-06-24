import { isUniversalEditor } from '../../../scripts/utils.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: (block) => {
        // Add no-hero class for non-hero pages (purple header + arc)
        if (!document.querySelector('main .hero')) {
          document.body.classList.add('no-hero');
        }

        block.querySelectorAll('a.external-link').forEach((link) => link.classList.remove('external-link'));

        // Remove ISI trigger text ("top") injected into the eyebrow bar by buildEyebrows.
        const eyebrow = block.querySelector('.nav-eyebrow-top');
        if (eyebrow) {
          eyebrow.querySelectorAll('p').forEach((p) => {
            if (p.textContent.trim().toLowerCase() === 'top') p.remove();
          });
        }

        // Skip DOM cloning in UE author mode and guard against double-execution.
        if (isUniversalEditor() || block.querySelector('.mobile-cta-clone')) return;

        // Clone CTA into the mobile header row (before hamburger) so it's visible in both
        // closed and open states — .nav-sections is hidden when the nav is collapsed.
        // Wrapped in a div (not li) since it sits as a direct child of nav alongside other divs.
        const ctaItem = block.querySelector('.nav-sections .default-content-wrapper > ul > li.menu-check-my-symptoms')
          || [...block.querySelectorAll('.nav-sections .default-content-wrapper > ul > li')]
            .find((li) => li.querySelector('a[href*="check-my-symptoms"], a[href*="gutcheck"]'));
        const hamburger = block.querySelector('.nav-hamburger');
        if (ctaItem && hamburger) {
          const ctaLink = ctaItem.querySelector('a.nav-item-link, button');
          if (ctaLink) {
            const ctaWrapper = document.createElement('div');
            ctaWrapper.classList.add('mobile-cta-clone');
            ctaWrapper.append(ctaLink.cloneNode(true));
            hamburger.before(ctaWrapper);
          }
        }

        // Clone utility links 3–6 (En Español, FAQs, Sign Up, HCP) to the bottom of
        // the open nav — they live in .nav-utility which sits above nav in the DOM.
        const utilityItems = [...block.querySelectorAll('.nav-utility ul[role="menubar"] > li')].slice(2);
        const navList = block.querySelector('.nav-sections .default-content-wrapper > ul');
        if (utilityItems.length && navList) {
          const wrapper = document.createElement('li');
          wrapper.classList.add('mobile-utility-clone');
          const ul = document.createElement('ul');
          utilityItems.forEach((item) => ul.append(item.cloneNode(true)));
          wrapper.append(ul);
          navList.append(wrapper);
        }
      },
    },
  };
}
