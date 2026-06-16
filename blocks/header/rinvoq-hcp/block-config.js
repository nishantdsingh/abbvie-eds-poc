const navClickCleanup = new WeakMap();

// Normalize the current path to a brand-relative path so condition checks work
// on every surface. Author/preview serve pages under /content/<brand>/... while
// the published site serves them under /<brand>/... (e.g. /rinvoq-hcp/...).
// Strip a leading /content/<brand> OR a leading /<brand> so the remaining path
// starts at the condition segment (/dermatology, /atopic-dermatitis, ...).
function getConditionPath() {
  let path = window.location.pathname.replace(/\/$/, '') || '/';
  path = path.replace(/^\/content\/[^/]+/, '');
  // Strip the published brand prefix (the first segment) when it isn't itself
  // a condition route. Known condition roots stay intact.
  const conditionRoots = ['/dermatology', '/atopic-dermatitis'];
  if (!conditionRoots.some((root) => path.startsWith(root))) {
    const stripped = path.replace(/^\/[^/]+/, '');
    if (conditionRoots.some((root) => stripped.startsWith(root))) path = stripped;
  }
  return path || '/';
}

function addSubmenuCategoryLabels(block) {
  block.querySelectorAll('.nav-sections .submenu-level-1 ul li a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href === '/atopic-dermatitis' || href === '/atopic-dermatitis/efficacy' || href === '/atopic-dermatitis/real-patients') {
      a.closest('li')?.classList.add('nav-submenu-ref-moderate');
    }
  });
}

function addIndicationText(block) {
  const currentPath = getConditionPath();
  if (!currentPath.startsWith('/dermatology') && !currentPath.startsWith('/atopic-dermatitis')) return;
  const navBrand = block.querySelector('.nav-brand .default-content-wrapper');
  if (!navBrand || navBrand.querySelector('.nav-brand-indication-text')) return;
  const indication = document.createElement('span');
  indication.className = 'nav-brand-indication-text';
  indication.innerHTML = 'For adults and pediatric patients 12 years of age and older with refractory, moderate to severe atopic dermatitis (AD) whose disease is not adequately controlled with other systemic drug products, including biologics, or when use of those therapies are inadvisable<sup>1</sup>';
  navBrand.appendChild(indication);
}

function addActiveNavState(block) {
  const currentPath = getConditionPath();
  if (currentPath === '/') return;

  let exactMatch = null;
  const startsWithMatches = [];

  block.querySelectorAll('.nav-sections a').forEach((link) => {
    let linkPath = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    // Nav links may be authored brand-relative (/atopic-dermatitis) or with the
    // published brand prefix (/rinvoq-hcp/atopic-dermatitis); strip the prefix
    // so they compare against the normalized current path.
    linkPath = linkPath.replace(/^\/content\/[^/]+/, '');
    const conditionRoots = ['/dermatology', '/atopic-dermatitis'];
    if (!conditionRoots.some((root) => linkPath.startsWith(root))) {
      const stripped = linkPath.replace(/^\/[^/]+/, '');
      if (conditionRoots.some((root) => stripped.startsWith(root))) linkPath = stripped;
    }
    if (currentPath === linkPath) {
      exactMatch = link;
    } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
      startsWithMatches.push(link);
    }
  });

  if (exactMatch) {
    exactMatch.classList.add('nav-active');
    const topLi = exactMatch.closest('.nav-sections .default-content-wrapper > ul > li');
    if (topLi) {
      const topTrigger = topLi.querySelector(':scope > a, :scope > button');
      if (topTrigger && topTrigger !== exactMatch) topTrigger.classList.add('nav-active');
    }
  } else if (startsWithMatches.length) {
    startsWithMatches.forEach((link) => {
      link.classList.add('nav-active');
      const topLi = link.closest('.nav-sections .default-content-wrapper > ul > li');
      if (topLi) {
        const topTrigger = topLi.querySelector(':scope > a, :scope > button');
        if (topTrigger && topTrigger !== link) topTrigger.classList.add('nav-active');
      }
    });
  }
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: (block) => {
        // Remove external-link class — not needed in header nav
        block.querySelectorAll('a.external-link').forEach((link) => link.classList.remove('external-link'));

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

        addActiveNavState(block);
        addSubmenuCategoryLabels(block);
        addIndicationText(block);
      },
    },
  };
}
