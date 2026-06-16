const navClickCleanup = new WeakMap();

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: (block) => {
        // Home icon on the first utility nav link
        const utilityUl = block.querySelector('.nav-utility ul[role="menubar"]');
        if (utilityUl) {
          const firstLi = utilityUl.querySelector('li:first-child');
          const firstLink = firstLi?.querySelector('a');
          if (firstLink && !firstLink.querySelector('.nav-utility-home-icon')) {
            firstLi.classList.add('nav-utility-home');
            const homeIcon = document.createElement('span');
            homeIcon.className = 'nav-utility-home-icon';
            homeIcon.setAttribute('aria-hidden', 'true');
            const homeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            homeSvg.setAttribute('viewBox', '0 0 24 24');
            const homePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            homePath.setAttribute('d', 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z');
            homeSvg.append(homePath);
            homeIcon.append(homeSvg);
            firstLink.prepend(homeIcon);
          }
        }

        // Click outside nav-sections → collapse all top-level items (abort previous on re-decorate)
        navClickCleanup.get(block)?.abort();
        const controller = new AbortController();
        navClickCleanup.set(block, controller);
        document.addEventListener('click', (e) => {
          if (!block.querySelector('.nav-sections')?.contains(e.target)) {
            block.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((li) => {
              li.setAttribute('aria-expanded', 'false');
            });
          }
        }, { signal: controller.signal });

        // Utility dropdown — open on hover (desktop only; mobile utility bar is hidden)
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

        // PDF icon on utility dropdown links that point to PDF files
        block.querySelectorAll('.nav-utility ul[role="menu"] a').forEach((link) => {
          if (!link.href.toLowerCase().endsWith('.pdf')) return;
          if (link.querySelector('.nav-utility-pdf-icon')) return;
          const icon = document.createElement('span');
          icon.className = 'nav-utility-pdf-icon';
          icon.setAttribute('aria-hidden', 'true');
          const pdfSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          pdfSvg.setAttribute('viewBox', '0 0 24 24');
          const pdfPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pdfPath.setAttribute('d', 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z');
          pdfSvg.append(pdfPath);
          icon.append(pdfSvg);
          link.prepend(icon);
        });

        // Remove external-link class — not needed in header nav
        block.querySelectorAll('a.external-link').forEach((link) => link.classList.remove('external-link'));
      },
    },
  };
}
