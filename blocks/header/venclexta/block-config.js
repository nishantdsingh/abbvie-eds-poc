import { isUniversalEditor } from '../../../scripts/utils.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: (block) => {
        block.querySelectorAll('a.external-link').forEach((link) => link.classList.remove('external-link'));

        const nav = block.querySelector('nav');
        if (!nav) return;

        // The brand-info block (phone/support text) has a <p> with text content so header.js
        // treats it as a nav-sections item instead of brand-info. Move the first nav-sections
        // li that has no .navigation-group (no real submenu items) into .nav-brand-info.
        const sectionsUl = nav.querySelector('.nav-sections .default-content-wrapper > ul');
        if (!sectionsUl) return;

        const firstLi = sectionsUl.querySelector('li');
        if (!firstLi || firstLi.querySelector('.navigation-group')) return;

        const btn = firstLi.querySelector('button');
        if (!btn) return;

        firstLi.remove();

        let brandInfo = nav.querySelector('.nav-brand-info');
        if (!brandInfo) {
          brandInfo = document.createElement('div');
          brandInfo.className = 'nav-brand-info';
          const navSections = nav.querySelector('.nav-sections');
          nav.insertBefore(brandInfo, navSections || null);
        }

        const p = document.createElement('p');
        p.textContent = btn.textContent.trim();
        brandInfo.appendChild(p);

        // Skip DOM cloning in UE author mode and guard against double-execution.
        if (isUniversalEditor() || block.querySelector('.mobile-utility-clone')) return;

        // Clone utility links 2–N (skip AML dropdown at index 0) to the bottom of
        // the open nav — visible only on mobile when nav is expanded.
        const utilityItems = [...block.querySelectorAll('.nav-utility ul[role="menubar"] > li')].slice(1);
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
