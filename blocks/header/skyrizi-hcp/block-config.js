import { isUniversalEditor } from '../../../scripts/utils.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: (block) => {
        block.querySelectorAll('a.external-link').forEach((link) => link.classList.remove('external-link'));

        // Utility dropdown — open on hover (desktop; mobile utility bar is hidden via CSS)
        block.querySelectorAll('.nav-utility li:has(button[aria-haspopup])').forEach((dropLi) => {
          const btn = dropLi.querySelector('button[aria-haspopup]');
          const menu = dropLi.querySelector('ul[role="menu"]');
          let hoverTimer = null;

          const openOnHover = () => {
            clearTimeout(hoverTimer);
            btn.setAttribute('aria-expanded', 'true');
          };
          const closeOnLeave = () => {
            hoverTimer = setTimeout(() => btn.setAttribute('aria-expanded', 'false'), 150);
          };

          dropLi.addEventListener('mouseenter', openOnHover);
          dropLi.addEventListener('mouseleave', closeOnLeave);
          menu?.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
          menu?.addEventListener('mouseleave', closeOnLeave);
        });

        // Skip DOM cloning in UE author mode and guard against double-execution.
        if (isUniversalEditor() || block.querySelector('.mobile-specialty-clone')) return;

        // Build SELECT YOUR SPECIALTY as an inline mobile item (flat category + conditions layout).
        const utilityItem = block.querySelector('.nav-utility ul[role="menubar"] > li:first-child');
        const navList = block.querySelector('.nav-sections .default-content-wrapper > ul');

        if (utilityItem && navList) {
          const srcBtn = utilityItem.querySelector('button[aria-haspopup]');
          const cloneItem = document.createElement('li');
          cloneItem.classList.add('mobile-specialty-clone');

          const cloneBtn = document.createElement('button');
          cloneBtn.type = 'button';
          cloneBtn.setAttribute('aria-expanded', 'false');
          cloneBtn.textContent = srcBtn?.textContent?.trim() || 'SELECT YOUR SPECIALTY';

          const dropdown = document.createElement('ul');
          dropdown.setAttribute('role', 'menu');

          const catItems = utilityItem.querySelectorAll('.utility-category-item');
          if (catItems.length) {
            // Flyout structure — rebuild as inline category headers with conditions below
            catItems.forEach((catItem) => {
              const catText = catItem.querySelector('button')?.textContent?.trim() || '';
              const subPanel = utilityItem.querySelector(`.utility-sub-list[data-idx="${catItem.dataset.idx}"]`);

              const catLi = document.createElement('li');
              const catHeading = document.createElement('p');
              catHeading.className = 'button-container';
              const catAnchor = document.createElement('span');
              catAnchor.className = 'button';
              catAnchor.textContent = catText;
              catHeading.appendChild(catAnchor);
              catLi.appendChild(catHeading);

              if (subPanel) {
                const subUl = document.createElement('ul');
                subPanel.querySelectorAll('a').forEach((link) => {
                  const subLi = document.createElement('li');
                  subLi.appendChild(link.cloneNode(true));
                  subUl.appendChild(subLi);
                });
                catLi.appendChild(subUl);
              }

              dropdown.appendChild(catLi);
            });
          } else {
            // Simple dropdown — copy link items directly
            utilityItem.querySelectorAll('ul[role="menu"] > li > a').forEach((link) => {
              const li = document.createElement('li');
              li.appendChild(link.cloneNode(true));
              dropdown.appendChild(li);
            });
          }

          cloneBtn.addEventListener('click', () => {
            const expanded = cloneBtn.getAttribute('aria-expanded') === 'true';
            cloneBtn.setAttribute('aria-expanded', String(!expanded));
          });

          cloneItem.append(cloneBtn, dropdown);
          navList.prepend(cloneItem);
        }
      },
    },
  };
}
