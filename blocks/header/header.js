import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
// eslint-disable-next-line import/no-named-as-default
import IndexUtils from '../../scripts/index-utils.js';
import { fetchDashboardCardData } from '../../scripts/cfUtil.js';
import decorateExternalLinksUtility from '../../scripts/utils.js';
import { renderBlock } from '../../scripts/multi-theme.js';

// Constants for maintainability
const DESKTOP_BREAKPOINT = '(min-width: 1024px)';
const SCROLL_THRESHOLD_DEFAULT = 200;

// Cached state and selectors
let lastScrollTop = 0;
const navigationCache = new Map();
let scrollThrottleId = null;
let cachedHeaderEl = null;

// Media query for desktop
const isDesktop = window.matchMedia(DESKTOP_BREAKPOINT);

/**
 * Utility: Throttles a function using requestAnimationFrame.
 * @param {Function} callback - The function to throttle.
 */
function throttleRAF(callback) {
  if (scrollThrottleId) return;
  scrollThrottleId = requestAnimationFrame(() => {
    callback();
    scrollThrottleId = null;
  });
}

/**
 * Utility: Creates an element with optional attributes, classes, and content.
 * @param {string} tag - The HTML tag.
 * @param {Object} options - Options for the element.
 * @returns {Element} The created element.
 */
/* eslint-disable-next-line object-curly-newline */
function createElement(tag, { className, attributes = {}, textContent, innerHTML } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  if (textContent) el.textContent = textContent;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

/**
 * Toggles all nav sections.
 * @param {boolean} expanded - Whether sections should be expanded.
 */
function toggleAllNavSections(expanded = false) {
  const nav = cachedHeaderEl?.querySelector('nav');
  const isSearchOpen = [...(nav?.querySelectorAll('.nav-sections ul > li') || [])]
    .some((li) => li.getAttribute('aria-expanded') === 'true');
  if (nav && !isDesktop.matches && isSearchOpen) {
    nav.classList.remove('second-level-active');
  }

  cachedHeaderEl?.querySelectorAll('.nav-item-level-0 .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
    section.querySelector('button')?.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav menu.
 * @param {Element} nav - The nav element.
 * @param {Element} navSections - The nav sections.
 * @param {boolean|null} forceExpanded - Force expansion state.
 */
function toggleMenu(nav, _navSections, forceExpanded = null) {
  if (forceExpanded === null) {
    const isSearchOpen = nav.querySelector('.menu-search')?.getAttribute('aria-expanded') === 'true';
    const expanded = forceExpanded !== null ? forceExpanded : (isSearchOpen || nav.getAttribute('aria-expanded') === 'true');
    const button = nav.querySelector('.nav-hamburger button');
    document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    toggleAllNavSections(false); // Fixed: Pass boolean, not string
    button?.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * Creates a submenu wrapper.
 * @param {string} label - The submenu label.
 * @returns {Object} - { submenu }
 */
function createSubmenuWrapper(label) {
  const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const submenu = createElement('div', {
    className: 'submenu-level-1',
    attributes: { id: `submenu-${slug}`, role: 'menu', 'data-label': label },
  });
  return { submenu };
}

/**
 * Fetches navigation data by path with caching.
 * @param {string} path - The navigation path.
 * @returns {Promise<Object>} - Navigation data.
 */
async function getNavigationByPath(path) {
  if (navigationCache.has(path)) return navigationCache.get(path);
  try {
    const item = await IndexUtils.findIndexItem(path);
    navigationCache.set(path, item);
    return item;
  } catch (error) {
    return { children: [] };
  }
}

// Recursive function to parse UL into JSON-like structure
function parseUl(ul) {
  const children = [];
  Array.from(ul.children).forEach((li) => {
    let textTitle = '';
    let link = '#';
    let subChildren = [];
    let hasP = false;

    Array.from(li.childNodes).forEach((node) => {
      if (node.tagName === 'P') {
        // Top-level item: extract title from <p>
        textTitle = node.textContent.trim();
        hasP = true;
      } else if (node.tagName === 'UL') {
        // Recurse for nested UL
        subChildren = parseUl(node);
      }
    });

    if (!hasP) {
      // Sub-level item: check for <a> or use text content
      const a = li.querySelector('a');
      if (a) {
        textTitle = a.textContent.trim() || a.getAttribute('title') || '';
        link = a.getAttribute('href') || '#';
      } else {
        textTitle = li.textContent.trim();
      }
    }

    const child = {
      title: textTitle,
      path: link,
      children: subChildren,
    };
    children.push(child);
  });
  return children;
}

async function getSecondCardData(url) {
  if (!url) return false;

  try {
    const response = await fetchDashboardCardData(url, 'cfBaseUrl');
    return response?.data?.dashboardCardByPath?.item || { children: [] };
  } catch (error) {
    return { children: [] };
  }
}

/**
 * Builds mega menu.
 * @param {Element} block - The block element.
 */
async function buildMegaMenu(block) {
  if (!block) return null;
  const innerDivs = block.querySelectorAll(':scope > div');
  if (innerDivs.length <= 1) return null;
  const allTags = Array.from(innerDivs).slice(1);
  const tagsValues = allTags.map((div) => {
    const ul = div.querySelector('ul');
    if (ul) return ul;

    const a = div.querySelector('a');
    if (a) return a;

    const p = div.querySelector('p');
    const heading = div.querySelector('h1, h2, h3, h4, h5, h6');

    // If both heading AND p exist → return both together
    if (heading && p) {
      return {
        heading: heading.textContent.trim(),
        paragraph: p.textContent.trim(),
      };
    }
    // If only heading exists
    if (heading) return heading.textContent.trim();

    // If only p exists
    if (p) return p.textContent.trim();

    return ''; // empty div
  });
  const [
    megaMenuTitle,
    megaMenuDescription,
    megaMenuCta,
    megaMenuDashboardLinks,
    megaMenuCardTitle,
    megaMenuCardContent,
    megaMenuCardCta,
    megaMenuDashboardCard,
    dashboardCardType,
  ] = tagsValues;

  // No authored mega menu content — bail to avoid rendering empty wrapper
  if (!megaMenuTitle) return null;

  const primaryCardData = {
    title: megaMenuCardTitle,
    cardContent: megaMenuCardContent,
    link: megaMenuCardCta,
  };
  const secondaryCardData = await getSecondCardData(megaMenuDashboardCard?.title);
  const dashboardLinks = megaMenuDashboardLinks?.querySelectorAll('li');
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu-wrapper';

  // -----------------------
  // LEFT SECTION
  // -----------------------
  const left = document.createElement('div');
  left.className = 'mega-menu-left';

  const titleEl = document.createElement('h4');
  titleEl.className = 'mega-menu-title';
  titleEl.textContent = megaMenuTitle;

  const descEl = document.createElement('div');
  descEl.className = 'mega-menu-description';
  descEl.textContent = megaMenuDescription;

  const ctaP = document.createElement('p');
  ctaP.className = 'button-container';
  const ctaA = document.createElement('a');
  ctaA.className = 'button';
  ctaA.href = (megaMenuCta instanceof HTMLElement ? megaMenuCta.href : null) || '#';
  ctaA.textContent = megaMenuCta instanceof HTMLElement ? megaMenuCta.textContent.trim() : '';
  ctaP.append(ctaA);
  left.append(titleEl, descEl, ctaP);

  // Dashboard links
  if (dashboardLinks) {
    const ul = document.createElement('ul');
    ul.className = 'dashboard-links';
    dashboardLinks.forEach((li) => {
      const link = li.querySelector('a');
      if (!link) return;
      const liClone = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dashboard-list-link';
      a.href = link.href;
      if (link.title) a.title = link.title;
      a.textContent = link.textContent.trim();
      liClone.append(a);
      ul.appendChild(liClone);
    });
    left.appendChild(ul);
  }

  // -----------------------
  // CARD GENERATOR
  // -----------------------
  function createCard(data, cardType, isPrimary = false) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = `mega-menu-card ${isPrimary ? 'mega-card-primary' : 'mega-card-secondary'} ${cardType}`;
    const card = document.createElement('div');
    card.className = 'mega-card';
    const appendIfExists = (parent, tag, classType, content) => {
      if (content) {
        parent.appendChild(createElement(tag, { className: classType, textContent: content }));
      }
    };

    if (isPrimary) {
      appendIfExists(card, 'p', 'mega-card-title', data?.title);
      if (data?.cardContent?.heading || data?.cardContent?.paragraph) {
        const content = createElement('div', { className: 'mega-card-content' });
        appendIfExists(content, 'h4', 'mega-card-heading', data.cardContent.heading);
        appendIfExists(content, 'p', 'card-description', data.cardContent.paragraph);
        card.appendChild(content);
      } else {
        const contentP = createElement('div', { className: 'mega-card-content' });
        appendIfExists(contentP, 'h4', 'mega-card-heading', data.cardContent);
        card.appendChild(contentP);
      }
      if (data?.link?.textContent) {
        const btnWrap = createElement('p', { className: 'button-container' });
        btnWrap.appendChild(createElement('span', {
          className: 'card-cta',
          textContent: data.link.textContent,
        }));
        card.appendChild(btnWrap);
      }

      // Wrap in anchor if link exists
      const container = data?.link ? (() => {
        const anchor = createElement('a', { className: 'card-link' });
        anchor.href = data.link.href;
        return anchor;
      })() : cardWrapper;
      container.appendChild(card);
      if (data?.link) cardWrapper.appendChild(container);
    } else {
      // Eyebrow
      appendIfExists(card, 'p', 'mega-card-title', data?.eyebrow);

      // Count + Suffix
      if (data?.dataPoint || data?.dataPointSufix) {
        const countWrap = createElement('div', { className: 'mega-card-count' });
        appendIfExists(countWrap, 'div', 'count', data.dataPoint);
        appendIfExists(countWrap, 'div', 'count-unit', data.dataPointSufix);
        card.appendChild(countWrap);
      }

      // Description
      appendIfExists(card, 'p', 'card-description', data?.description?.plaintext);

      cardWrapper.appendChild(card);
    }

    return cardWrapper;
  }

  // -----------------------
  // APPEND BOTH CARDS
  // -----------------------
  const primaryCard = createCard(primaryCardData, dashboardCardType, true);
  const secondaryCard = createCard(secondaryCardData, dashboardCardType, false);

  wrapper.appendChild(left);
  wrapper.appendChild(primaryCard);
  wrapper.appendChild(secondaryCard);

  wrapper.addEventListener('click', () => {
    cachedHeaderEl?.querySelector('.mega-menu-minimize')?.classList.remove('mega-menu-minimize');
  });

  return wrapper;
}

/**
 * Builds level-two navigation and submenu.
 * @param {Element} block - The block element.
 */
async function buildLevelTwoNavigations(block, languageLinkData, element) {
  const selector = languageLinkData ? 'span:last-child' : 'span';
  const label = block.querySelector(selector)?.textContent?.trim() || '';
  if (!label) return;
  const navigation = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let navigationData;
  let navItemPath;
  if (languageLinkData) {
    navigationData = { children: parseUl(languageLinkData) };
    languageLinkData.remove();
  } else {
    const anchor = block.querySelector('a');
    const href = anchor?.href ?? null;
    navItemPath = href ? new URL(href).pathname : `/${navigation}`;
    navigationData = await getNavigationByPath(navItemPath);
  }
  const level2Container = cachedHeaderEl?.querySelector(`#submenu-${navigation}`);
  if (!level2Container) return;

  // build mega nev
  const isMegaMenu = level2Container.querySelector('.mega-menu-wrapper');
  if (isDesktop.matches) {
    level2Container.classList.add('mega-menu-minimize');
  }
  if (isMegaMenu) {
    isMegaMenu.remove();
  }
  const megaMenu = await buildMegaMenu(element);
  const data = navigationData;
  // Remove existing navigation group
  level2Container.querySelector('.navigation-group')?.remove();

  const fragment = document.createDocumentFragment(); // Batch DOM changes
  const ul = createElement('ul', { className: 'navigation-group' });
  const pageRedirectText = megaMenu?.querySelector('.mega-menu-left .button-container a')?.textContent?.trim() || '';
  (data?.children || []).forEach((child) => {
    const li = createElement('li', { className: 'navigation-item navigation-item-level-1' });
    if (child.children?.length) {
      // Submenu with dropdown
      const levelTwoMenu = createElement('div', { className: 'level-two-menu' });
      const button = createElement('button', {
        className: 'root-two-dropdown-btn',
        attributes: {
          'aria-expanded': 'false',
        },
        textContent: child.title,
      });
      button.appendChild(createElement('span', { className: 'accordion-icon' }));
      const menuItems = createElement('div', { className: 'level-two-menu-items' });
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        button.classList.toggle('active');
        menuItems.classList.toggle('show-child');
      });
      const goToPageLink = createElement('a', {
        className: 'go-to-page-btn',
        attributes: {
          href: child.path,
          'aria-label': pageRedirectText,
          'data-warn-on-departure': 'false',
        },
        textContent: pageRedirectText,
      });
      const subUl = createElement('ul', { className: 'navigation-group' });
      child.children.forEach((subChild) => {
        const subLi = createElement('li', { className: 'navigation-item navigation-item-level-2' });
        const subLink = createElement('a', {
          className: 'navigation-item-link',
          attributes: { href: subChild.path, 'data-warn-on-departure': 'false' },
          textContent: subChild.title,
        });
        subLi.appendChild(subLink);
        subUl.appendChild(subLi);
      });
      menuItems.appendChild(goToPageLink);
      menuItems.appendChild(subUl);
      levelTwoMenu.appendChild(button);
      levelTwoMenu.appendChild(menuItems);
      li.appendChild(levelTwoMenu);
    } else {
      // Simple link
      const link = createElement('a', {
        className: 'level-two-link-adjustment',
        attributes: { href: child.path, 'data-warn-on-departure': 'false' },
        textContent: child.title,
      });
      li.appendChild(link);
    }
    ul.appendChild(li);
  });

  if (!ul.children.length && !megaMenu) {
    const parentLi = level2Container.closest('li');
    level2Container.remove();
    const parentBtn = parentLi?.querySelector('button');
    if (parentBtn && navItemPath) {
      const navLink = createElement('a', {
        className: 'nav-item-link',
        attributes: { href: navItemPath },
      });
      if (parentBtn.classList.contains('selected')) navLink.classList.add('selected');
      const span = parentBtn.querySelector('span');
      if (span) navLink.appendChild(span);
      parentBtn.replaceWith(navLink);
    } else if (parentBtn) {
      parentBtn.setAttribute('aria-haspopup', 'false');
    }
    return;
  }

  fragment.appendChild(ul);
  if (megaMenu) level2Container.appendChild(megaMenu);
  level2Container.appendChild(fragment);
}

/**
 * Creates a search form.
 * Reads label text, mobile placeholder and results page path from the
 * authored navigation-content search block.
 * @param {Element} searchBlock - The navigation-content block with data-type="search".
 * @returns {Element} - The search form wrapper element.
 */
function createSearchForm(searchBlock) {
  const searchCell = searchBlock.querySelector(':scope > div > div');
  const paras = [...(searchCell?.querySelectorAll(':scope > p') || [])];
  const text = paras[1]?.textContent.trim() || 'Search';
  const mobilePlaceholder = searchBlock.dataset.searchMobilePlaceholder || text;
  const resultsPath = searchCell?.querySelector('a[href]')?.getAttribute('href')?.trim() || '/search-results';

  const maindiv = createElement('div', { className: 'search-main-wrapper' });
  const wrapperdiv = createElement('div', { className: 'search-wrapper' });
  const form = createElement('form', {
    className: 'search-form',
    attributes: { method: 'get', role: 'search', action: resultsPath },
  });
  const innerDiv = createElement('div', { className: 'search-inner-wrapper' });
  const input = createElement('input', {
    className: 'search-input',
    attributes: {
      type: 'search',
      autocomplete: 'off',
      spellcheck: 'false',
      size: '10',
      maxlength: '100',
      'aria-label': text,
      name: 'q',
      'aria-describedby': 'search-alert-text',
    },
  });
  const charsetInput = createElement('input', {
    attributes: { type: 'hidden', name: '_charset_', value: 'UTF-8' },
  });
  const label = createElement('label', {
    className: 'search-input-label',
    attributes: { 'data-desktop-placeholder': text, 'aria-label': text },
    textContent: text,
  });
  const alertDiv = createElement('div', { className: 'search-input-alert' });
  const alertP = createElement('p', { attributes: { id: 'search-alert-text' }, textContent: 'Please enter a valid search term' });

  alertDiv.appendChild(alertP);
  innerDiv.append(input, label, alertDiv);
  form.append(innerDiv, charsetInput);
  wrapperdiv.appendChild(form);
  maindiv.appendChild(wrapperdiv);

  // Responsive placeholder swap (mobile vs desktop)
  const mq = window.matchMedia('(width < 744px)');
  const updatePlaceholder = () => {
    const placeholder = mq.matches ? mobilePlaceholder : text;
    label.textContent = placeholder;
    input.setAttribute('aria-label', placeholder);
  };
  mq.addEventListener('change', updatePlaceholder);
  updatePlaceholder();

  // Floating label state
  const updateLabel = () => {
    label.classList.toggle('focus-out', input.value.trim() === '' && document.activeElement !== input);
  };
  input.addEventListener('focus', () => {
    updateLabel();
    alertDiv.classList.remove('visible');
    input.classList.remove('search-input-error');
  });
  input.addEventListener('blur', updateLabel);
  label.addEventListener('focus', updateLabel);
  label.addEventListener('blur', updateLabel);
  updateLabel();

  // Submit: validate non-empty, then let form navigate to resultsPath?q=value
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      alertDiv.classList.add('visible');
      input.classList.add('search-input-error');
      input.focus();
    } else {
      alertDiv.classList.remove('visible');
      input.classList.remove('search-input-error');
    }
  });

  return maindiv;
}

/**
 * Builds a menu item with button and submenu.
 * @param {Element} block - The block element.
 * @param {boolean} isNavigation - Whether it's a navigation item.
 * @returns {Element|null} - The li element.
 */
function buildMenuItem(block, isNavigation = false) {
  const label = block.querySelector('p')?.textContent.trim();
  if (!label && !block.classList.contains('search')) return null;

  const slug = (label || 'search').toLowerCase().replace(/\s+/g, '-');
  const segments = window.location.pathname.split('/').filter(Boolean);
  const currentParentPage = segments[0];
  const li = createElement('li', { className: `menu-${slug}` });
  const text = createElement('span', { textContent: label });

  const isLinkLanguageBlock = block?.classList.contains('language-links');

  // Leaf nav item: has a direct link and no sub-nav ul → render as anchor immediately
  if (isNavigation && !isLinkLanguageBlock && !block.classList.contains('search')) {
    const directAnchor = block.querySelector('a');
    if (directAnchor && !block.querySelector('ul')) {
      const navLink = createElement('a', {
        className: 'nav-item-link',
        attributes: { href: directAnchor.href },
      });
      if (currentParentPage === slug) navLink.classList.add('selected');
      navLink.appendChild(text);
      li.appendChild(navLink);
      return li;
    }
  }

  // Language-links single link → render as anchor (avoids anchor-inside-button)
  if (isLinkLanguageBlock) {
    const isLinkLanguage = block.querySelector('ul');
    if (!isLinkLanguage) {
      const a = block.querySelector('a');
      if (a) {
        const navLink = createElement('a', {
          className: 'nav-item-link',
          attributes: { href: a.href },
        });
        if (currentParentPage === slug) navLink.classList.add('selected');
        navLink.appendChild(text);
        li.appendChild(navLink);
        return li;
      }
    }
  }

  const button = createElement('button', {
    attributes: { type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' },
  });
  if (currentParentPage === slug) {
    button.classList.add('selected');
  }
  // Only include the icon if it's the search block (other blocks get the search icon by mistake
  // because content_searchIcon is a template default shared across all navigation-content blocks)
  const icon = block.classList.contains('search') ? block.querySelector('p > span') : null;
  if (icon) button.appendChild(icon.cloneNode(true));
  button.appendChild(text);
  const { submenu } = createSubmenuWrapper(label);
  if (isLinkLanguageBlock) {
    const uls = [...block.querySelectorAll('ul')];
    if (uls.length > 1 && isNavigation) {
      const megaWrapper = createElement('div', { className: 'mega-menu-wrapper' });
      const megaLeft = createElement('div', { className: 'mega-menu-left' });
      const megaCard = createElement('div', { className: 'mega-menu-card' });
      const firstUlClone = uls[0].cloneNode(true);
      firstUlClone.classList.add('navigation-group');
      megaLeft.appendChild(firstUlClone);
      [...block.querySelectorAll('pre, ul')].forEach((el) => {
        if (el === uls[0]) return;
        const clone = el.cloneNode(true);
        if (clone.tagName === 'UL') clone.classList.add('navigation-group');
        megaCard.appendChild(clone);
      });
      megaWrapper.append(megaLeft, megaCard);
      submenu.appendChild(megaWrapper);
    } else if (uls.length === 1) {
      uls[0].classList.add('navigation-group');
      if (isNavigation) {
        submenu.appendChild(uls[0].cloneNode(true));
      }
    }
  }
  li.append(button, submenu);

  button.addEventListener('click', async (e) => {
    e.stopPropagation();
    const mainDiv = button.parentElement;
    const languageLinkData = mainDiv?.querySelector('.navigation-group');
    const isParsedUl = languageLinkData?.children.length > 0;
    const subMenuContainer = mainDiv.querySelector('.submenu-level-1');
    if (subMenuContainer && isDesktop.matches) subMenuContainer.classList.add('mega-menu-minimize');
    if (isNavigation && !isParsedUl) {
      await buildLevelTwoNavigations(
        button,
        languageLinkData,
        block,
      );
    }
    const expanded = li.getAttribute('aria-expanded') === 'true';
    const nav = cachedHeaderEl?.querySelector('nav');

    // Close hamburger menu if search is being opened and change hamburger to close icon
    if (block.classList.contains('search')) {
      const navSections = nav.querySelector('.nav-sections');
      const hamburgerBtn = nav.querySelector('.nav-hamburger button');

      if (!expanded) {
        // Opening search - close hamburger menu and show close icon on hamburger
        if (nav.getAttribute('aria-expanded') === 'true') {
          toggleMenu(nav, navSections, true);
        }
        // Change hamburger to close icon
        nav.setAttribute('aria-expanded', 'true');
        hamburgerBtn?.setAttribute('aria-label', 'Close navigation');
      } else {
        // Closing search - reset hamburger to menu icon
        nav.setAttribute('aria-expanded', 'false');
        hamburgerBtn?.setAttribute('aria-label', 'Open navigation');
      }
    }

    if (nav && !isDesktop.matches && isNavigation) {
      nav.classList.add('second-level-active');
    }
    toggleAllNavSections(false);
    li.setAttribute('aria-expanded', !expanded);
    button.setAttribute('aria-expanded', !expanded);
  });

  // Desktop: hover opens submenu
  // (mouseenter/mouseleave with small delay to allow moving into submenu)
  if (isNavigation) {
    let hoverTimer = null;
    let isHovering = false;
    let loadPromise = null;

    const openOnHover = async () => {
      isHovering = true;
      clearTimeout(hoverTimer); // always cancel pending close before any early return
      if (!isDesktop.matches) return;
      if (!li.querySelector('.submenu-level-1')) return;
      const navGroup = li.querySelector('.navigation-group');
      const isParsed = navGroup?.children.length > 0;
      if (!isParsed) {
        // Share a single in-flight fetch — concurrent hovers await the same promise
        if (!loadPromise) {
          loadPromise = buildLevelTwoNavigations(button, navGroup, block)
            .finally(() => { loadPromise = null; });
        }
        try {
          await loadPromise;
        } catch {
          return;
        }
      }
      if (!isHovering) return; // cursor left during async fetch — don't open
      toggleAllNavSections(false);
      li.querySelector('.submenu-level-1')?.classList.remove('mega-menu-minimize');
      li.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-expanded', 'true');
    };

    const closeOnLeave = () => {
      isHovering = false;
      if (!isDesktop.matches) return;
      hoverTimer = setTimeout(() => {
        li.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-expanded', 'false');
      }, 100);
    };

    li.addEventListener('mouseenter', openOnHover);
    li.addEventListener('mouseleave', closeOnLeave);
    // When cursor moves from submenu back to the button area, li.mouseenter does NOT
    // re-fire (cursor never left li). This catches that return movement to cancel the
    // close timer and re-open if the timer already fired and closed the dropdown.
    button.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      if (!isDesktop.matches) return;
      isHovering = true;
      if (li.getAttribute('aria-expanded') !== 'true') {
        li.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-expanded', 'true');
      }
    });
    submenu.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
    submenu.addEventListener('mouseleave', closeOnLeave);
  }

  return li;
}

/**
 * Builds eyebrow bars (top / bottom) from authored navigation-content blocks.
 * Each eyebrow block has: row[0] = position text ("top"|"bottom"), row[1] = HTML content.
 * @param {Element} headerEl - The navigation-content-container element.
 * @returns {Array<{position: string, bar: Element}>}
 */
function buildEyebrows(headerEl) {
  const result = [];
  headerEl.querySelectorAll('.navigation-content[data-type="eyebrow"]').forEach((eb) => {
    // All block fields are packed inline as <p> tags inside row 0's inner cell.
    // Fixed positions (determined by model field order — same in UE and production):
    //   p[0]      = searchIcon (template default — always first)
    //   p[1]      = eyebrowPosition ("top"|"bottom" — template default)
    //   p[2..n-3] = eyebrowContent (authored — one <p> per richtext paragraph)
    //   p[n-2]    = floatingIsiExpandLabel ("See Full ISI" — template default)
    //   p[n-1]    = floatingIsiCollapseLabel ("Collapse ISI" — template default)
    const cell = eb.querySelector(':scope > div > div');
    const paras = [...(cell?.querySelectorAll(':scope > p') || [])];
    const contentParas = paras.length >= 4 ? paras.slice(2, -2) : [];
    if (!contentParas.length) return;

    const positionText = paras[1]?.textContent.trim().toLowerCase();
    const position = positionText === 'bottom' ? 'bottom' : 'top';

    const bar = createElement('div', { className: `nav-eyebrow nav-eyebrow-${position}` });
    contentParas.forEach((p) => bar.appendChild(p.cloneNode(true)));
    result.push({ position, bar });
  });
  return result;
}

/**
 * Builds the floating ISI compliance bar from a navigation-content block.
 * row[0] = ISI text (richtext), row[1] = expand label, row[2] = collapse label.
 * @param {Element} headerEl
 * @returns {Element|null}
 */
function buildFloatingIsi(headerEl) {
  const isiBlock = headerEl.querySelector('.navigation-content[data-type="floating-isi"]');
  if (!isiBlock) return null;

  // Fixed positions in row 0's inner cell (model field order — same in UE and production):
  //   p[0]      = searchIcon (template default)
  //   p[1]      = eyebrowPosition ("top" — template default)
  //   p[2..n-3] = floatingIsiText (authored ISI text)
  //   p[n-2]    = floatingIsiExpandLabel (authored or default "See Full ISI")
  //   p[n-1]    = floatingIsiCollapseLabel (authored or default "Collapse ISI")
  const cell = isiBlock.querySelector(':scope > div > div');
  const paras = [...(cell?.querySelectorAll(':scope > p') || [])];
  const expandLabel = paras.length >= 2 ? paras[paras.length - 2]?.textContent.trim() || 'See Full ISI' : 'See Full ISI';
  const collapseLabel = paras.length >= 1 ? paras[paras.length - 1]?.textContent.trim() || 'Collapse ISI' : 'Collapse ISI';
  const isiParas = paras.length >= 4 ? paras.slice(2, -2) : [];

  const bar = createElement('div', {
    className: 'nav-floating-isi',
    attributes: { role: 'complementary', 'aria-label': 'Important Safety Information' },
  });
  const textWrap = createElement('div', { className: 'nav-floating-isi-text', attributes: { 'aria-live': 'polite' } });
  isiParas.forEach((p) => textWrap.appendChild(p.cloneNode(true)));

  const toggle = createElement('button', {
    className: 'nav-floating-isi-toggle',
    attributes: { type: 'button', 'aria-expanded': 'false' },
    textContent: expandLabel,
  });
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? expandLabel : collapseLabel;
    bar.classList.toggle('nav-floating-isi-open', !expanded);
  });

  bar.append(toggle, textWrap);
  return bar;
}

/**
 * Builds the CTA group (guest/user state + primary button) from a navigation-content block.
 * All fields inline in row 0's cell (model field order):
 *   p[0] = searchIcon (template default)
 *   p[1] = eyebrowPosition (template default)
 *   p[2] = floatingIsiExpandLabel (template default)
 *   p[3] = floatingIsiCollapseLabel (template default)
 *   p[4..k] = ctaGuestLinks (authored richtext)
 *   p[k+1..m] = ctaUserLinks (authored richtext)
 *   p[last] = ctaPrimaryLabel (authored text, no link)
 * Primary CTA link (aem-content) is in a separate row: ctaBlock.children[1].
 * @param {Element} headerEl
 * @returns {Element|null}
 */
function buildCtaGroup(headerEl) {
  const ctaBlock = headerEl.querySelector('.navigation-content[data-type="cta-group"]');
  if (!ctaBlock) return null;

  const cell = ctaBlock.querySelector(':scope > div > div');
  const paras = [...(cell?.querySelectorAll(':scope > p') || [])];
  if (!paras.length) return null;

  const group = createElement('div', { className: 'nav-cta-group' });

  const linkParas = paras.filter((p) => p.querySelector('a'));
  const lastPara = paras[paras.length - 1];
  // If the last para is text-only (no anchor), it's an explicit CTA label
  const ctaLabel = !lastPara?.querySelector('a') ? lastPara?.textContent.trim() : null;
  // content_ctaPrimaryLink — renders as a later block row (after any empty
  // aem-content rows from template defaults). Use non-empty href to skip.
  const primaryLinkEl = linkParas[0]?.querySelector('a')
    || ctaBlock.querySelector(':scope > div:not(:first-child) a[href]:not([href=""])');

  if (ctaLabel && primaryLinkEl) {
    // Separate label para exists — build clean anchor (avoids href-as-text EDS default)
    group.appendChild(createElement('a', {
      className: 'nav-cta-primary button',
      attributes: { href: primaryLinkEl.href },
      textContent: ctaLabel,
    }));
  } else if (linkParas.length) {
    // No separate label — render link paras as-is (guest/user auth split)
    const mid = Math.ceil(linkParas.length / 2);
    const guestWrap = createElement('div', { className: 'nav-cta-guest' });
    linkParas.slice(0, mid).forEach((p) => guestWrap.appendChild(p.cloneNode(true)));
    group.appendChild(guestWrap);

    if (linkParas.length > 1) {
      const userWrap = createElement('div', {
        className: 'nav-cta-user',
        attributes: { hidden: '', 'aria-hidden': 'true' },
      });
      linkParas.slice(mid).forEach((p) => userWrap.appendChild(p.cloneNode(true)));
      group.appendChild(userWrap);
    }
  }

  return group.children.length ? group : null;
}

/**
 * Wires click handlers on HCP modal links — any <a> with class "hcp-modal"
 * or data-hcp-modal attribute intercepts navigation and shows a leave-site warning.
 * @param {Element} container
 */
function wireHcpModalLinks(container, block) {
  const headerEl = block.closest('header') || block;
  let dialog = headerEl.querySelector('.hcp-leave-site-dialog');
  let warningP;
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'hcp-leave-site-dialog';
    const form = document.createElement('form');
    form.method = 'dialog';
    warningP = document.createElement('p');
    const menu = document.createElement('menu');
    const cancelBtn = document.createElement('button');
    cancelBtn.value = 'cancel';
    cancelBtn.textContent = 'Cancel';
    const confirmBtn = document.createElement('button');
    confirmBtn.value = 'confirm';
    confirmBtn.textContent = 'Continue';
    menu.append(cancelBtn, confirmBtn);
    form.append(warningP, menu);
    dialog.appendChild(form);
    headerEl.appendChild(dialog);
  } else {
    warningP = dialog.querySelector('p');
  }

  container.querySelectorAll('a.hcp-modal, a[data-hcp-modal]').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (warningP) warningP.textContent = link.dataset.hcpWarning || '';
      dialog.showModal();
      dialog.addEventListener('close', () => {
        if (dialog.returnValue === 'confirm') window.open(link.href, '_blank', 'noopener,noreferrer');
      }, { once: true });
    });
  });
}

// Throttled scroll handler
function handleScroll() {
  throttleRAF(() => {
    const header = cachedHeaderEl;
    if (!header) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // Cross-block read: hero height drives the scroll-hide threshold.
    const heroBlock = document.querySelector('.hero.block');
    const threshold = heroBlock ? heroBlock.offsetHeight - 100 : SCROLL_THRESHOLD_DEFAULT;
    const scrollingDown = scrollTop > lastScrollTop;
    const scrollingUp = scrollTop < lastScrollTop;
    if (scrollingDown && scrollTop > threshold) {
      header.classList.add('hide-nav');
      header.classList.remove('show-nav');
      header.classList.remove('sticky-scrollback');
    } else if (scrollingUp || scrollTop <= threshold) {
      header.classList.add('show-nav');
      header.classList.remove('hide-nav');
      if (header.classList.contains('has-sticky-scrollback')) {
        header.classList.toggle('sticky-scrollback', scrollingUp && scrollTop > threshold);
      }
    }
    lastScrollTop = Math.max(scrollTop, 0);
  });
}

// Keydown handler for ESC
function handleKeydown(e) {
  if (e.key !== 'Escape') return;
  const headerEl = cachedHeaderEl;
  headerEl?.querySelectorAll('.nav-utility button[aria-expanded="true"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
  const navSections = headerEl?.querySelector('.nav-sections');
  if (!navSections || navSections.getAttribute('aria-expanded') === 'false') return;
  toggleAllNavSections(false);
}

// Attach global event listeners
window.addEventListener('scroll', handleScroll);
document.addEventListener('keydown', handleKeydown);

/**
 * Loads and decorates the header.
 * @param {Element} block - The header block element.
 */
export default async function decorate(block) {
  let utilityBarEl = null;
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  const header = fragment.querySelector('.navigation-content-container');
  if (!header) return;
  cachedHeaderEl = block.closest('header') || block;

  // Sticky-on-scrollback: permanent feature flag — set via navigation-content block or page model
  if (
    header.querySelector('.navigation-content.stickyheadercheckbox')
    || getMetadata('stickyheadercheckbox') === 'true'
  ) {
    cachedHeaderEl.classList.add('has-sticky-scrollback');
  }

  // Block-level layout variants
  const isLite = block.classList.contains('lite');
  const isSticky = block.classList.contains('sticky');
  if (isLite) block.closest('header')?.classList.add('header-lite');
  if (isSticky) block.closest('header')?.classList.add('header-sticky');

  const nav = createElement('nav', { attributes: { id: 'nav', 'aria-expanded': 'false' } });

  // Utility Navigation (optional — content-driven, hidden when absent)
  const utilityBlocks = header.querySelectorAll('.navigation-content[data-type="utility-nav"]');
  if (utilityBlocks.length) {
    const utility = createElement('div', { className: 'section nav-utility' });
    const utilityNav = createElement('nav', {
      attributes: { 'aria-label': 'Utility Navigation' },
    });
    const utilityUl = createElement('ul', { attributes: { role: 'menubar' } });
    const indicationWrapper = createElement('div', { className: 'nav-indication' });

    utilityBlocks.forEach((utilBlock) => {
      // content_utilityItems is a richtext field that can contain <p> and <ul> elements.
      // All children are packed inline in row 0's cell (model field order):
      //   child[0]       = searchIcon <p> (template default)
      //   child[1..n-4]  = authored <p> links and <ul> dropdowns
      //   child[n-3]     = eyebrowPosition <p> (template default "top")
      //   child[n-2]     = floatingIsiExpandLabel <p> (template default)
      //   child[n-1]     = floatingIsiCollapseLabel <p> (template default)
      const cell = utilBlock.querySelector(':scope > div > div');

      const authoredChildren = [...(cell?.children || [])];

      authoredChildren.forEach((child, idx) => {
        if (child.tagName !== 'P') return; // <ul> nodes are handled by the preceding <p>
        const link = child.querySelector('a');
        if (!link) {
          // Plain text paragraph — collected into indicationWrapper, appended after utilityUl
          const text = child.textContent.trim();
          if (!text) return;
          const p = document.createElement('p');
          p.textContent = text;
          indicationWrapper.appendChild(p);
          return;
        }

        const nextChild = authoredChildren[idx + 1];
        const hasDropdown = nextChild?.tagName === 'UL';

        if (hasDropdown) {
          // Dropdown: preceding <p> is the trigger label, following <ul> holds the items
          const dropLi = createElement('li', { attributes: { role: 'none' } });
          const btn = createElement('button', {
            attributes: {
              type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', role: 'menuitem',
            },
            textContent: link.textContent.trim(),
          });
          const dropMenu = createElement('ul', { attributes: { role: 'menu' } });
          const topLevelLis = [...nextChild.querySelectorAll(':scope > li')];
          const hasFlyout = topLevelLis.some((tli) => tli.querySelector(':scope > ul'));

          if (hasFlyout) {
            // Two-column flyout: category list on left, sub-items revealed on hover at right
            dropMenu.classList.add('utility-flyout-menu');
            const colLeft = createElement('li', { className: 'utility-col-left', attributes: { role: 'none' } });
            const colRight = createElement('li', { className: 'utility-col-right', attributes: { role: 'none' } });
            const catList = createElement('ul', { className: 'utility-category-list' });

            topLevelLis.forEach((topLi, catIdx) => {
              const catA = topLi.querySelector(':scope > p > a, :scope > a');
              const subUl = topLi.querySelector(':scope > ul');
              const catItem = createElement('li', { className: 'utility-category-item', attributes: { role: 'none' } });
              catItem.dataset.idx = String(catIdx);
              const catBtn = createElement('button', {
                attributes: { type: 'button', role: 'menuitem' },
                textContent: catA ? catA.textContent.trim() : '',
              });
              catItem.appendChild(catBtn);
              catList.appendChild(catItem);

              if (subUl) {
                const subPanel = createElement('ul', { className: 'utility-sub-list', attributes: { role: 'none' } });
                subPanel.dataset.idx = String(catIdx);
                subPanel.setAttribute('hidden', '');
                subUl.querySelectorAll(':scope > li').forEach((subLi) => {
                  const subLink = subLi.querySelector('a');
                  if (!subLink) return;
                  const sli = createElement('li', { attributes: { role: 'none' } });
                  sli.appendChild(subLink.cloneNode(true));
                  subPanel.appendChild(sli);
                });
                colRight.appendChild(subPanel);
              }
            });

            let flyoutHideTimer;
            catList.querySelectorAll('.utility-category-item').forEach((catItem) => {
              catItem.addEventListener('mouseenter', () => {
                clearTimeout(flyoutHideTimer);
                const activeIdx = catItem.dataset.idx;
                catList.querySelectorAll('.utility-category-item').forEach((ci) => ci.classList.toggle('active', ci === catItem));
                const menuRect = dropMenu.getBoundingClientRect();
                const itemRect = catItem.getBoundingClientRect();
                colRight.style.setProperty('--utility-flyout-top', `${itemRect.top - menuRect.top}px`);
                colRight.querySelectorAll('.utility-sub-list').forEach((sl) => {
                  if (sl.dataset.idx === activeIdx) sl.removeAttribute('hidden');
                  else sl.setAttribute('hidden', '');
                });
              });
              catItem.addEventListener('mouseleave', () => {
                flyoutHideTimer = setTimeout(() => {
                  catItem.classList.remove('active');
                  const subPanel = colRight.querySelector(`.utility-sub-list[data-idx="${catItem.dataset.idx}"]`);
                  if (subPanel) subPanel.setAttribute('hidden', '');
                }, 150);
              });
            });
            colRight.addEventListener('mouseenter', () => clearTimeout(flyoutHideTimer));
            colRight.addEventListener('mouseleave', () => {
              flyoutHideTimer = setTimeout(() => {
                catList.querySelectorAll('.utility-category-item').forEach((ci) => ci.classList.remove('active'));
                colRight.querySelectorAll('.utility-sub-list').forEach((sl) => sl.setAttribute('hidden', ''));
              }, 150);
            });

            colLeft.appendChild(catList);
            dropMenu.append(colLeft, colRight);
          } else {
            // Simple single-level dropdown
            topLevelLis.forEach((subLi) => {
              const subLink = subLi.querySelector('a');
              if (!subLink) return;
              const sli = createElement('li', { attributes: { role: 'none' } });
              subLink.setAttribute('role', 'menuitem');
              sli.appendChild(subLink.cloneNode(true));
              dropMenu.appendChild(sli);
            });
          }

          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            utilityUl.querySelectorAll('button[aria-expanded="true"]').forEach((b) => {
              if (b !== btn) b.setAttribute('aria-expanded', 'false');
            });
            btn.setAttribute('aria-expanded', String(!expanded));
          });
          dropLi.append(btn, dropMenu);
          utilityUl.appendChild(dropLi);
        } else {
          // Simple link
          const li = createElement('li', { attributes: { role: 'none' } });
          link.setAttribute('role', 'menuitem');
          li.appendChild(link.cloneNode(true));
          utilityUl.appendChild(li);
        }
      });
    });

    utilityNav.appendChild(utilityUl);
    if (indicationWrapper.children.length) utilityNav.appendChild(indicationWrapper);
    utility.appendChild(utilityNav);
    // Utility bar stored for later insertion before nav in wrapper
    utilityBarEl = utility;
  }

  // Brand (Logo)
  const brandBlock = header.querySelector('.navigation-content[data-type="logo"]');
  if (brandBlock) {
    const pictures = brandBlock.querySelectorAll('picture');
    const brandImg = pictures[0];
    const indicationImg = pictures[1]; // optional second logo (e.g. site-indication)
    const brand = createElement('div', { className: 'section nav-brand nav-item-level-0' });
    const wrapper = createElement('div', { className: 'default-content-wrapper' });
    const p = createElement('p');
    const a = createElement('a', { attributes: { href: '/', title: 'Home' } });
    if (brandImg) a.appendChild(brandImg);
    p.appendChild(a);
    wrapper.appendChild(p);
    if (indicationImg) {
      const indication = createElement('div', { className: 'nav-brand-indication' });
      indication.appendChild(indicationImg);
      wrapper.appendChild(indication);
    }
    brand.appendChild(wrapper);
    nav.appendChild(brand);
  }

  // Secondary brand info — navigation-content blocks with no text label.
  // In AEM, richtext list content (e.g. "For savings & support" links) renders as
  // <div data-aue-prop="content_title"><ul>...</ul></div>, leaving no <p> with text.
  // These are supplementary inline links shown alongside the logo, not nav section items.
  const navContentBlocks = [...header.querySelectorAll('.navigation-content[data-type="navigation-content"]')];
  const brandInfoBlocks = navContentBlocks.filter((b) => !b.querySelector('p')?.textContent.trim());
  if (brandInfoBlocks.length) {
    const infoDiv = createElement('div', { className: 'nav-brand-info' });
    brandInfoBlocks.forEach((infoBlock) => {
      const cell = infoBlock.querySelector(':scope > div > div');
      const firstContent = cell?.firstElementChild;
      if (!firstContent) return;
      // Content is either a <ul> directly or inside a richtext <div> wrapper
      const ul = firstContent.tagName === 'UL' ? firstContent : firstContent.querySelector('ul');
      if (ul) {
        infoDiv.appendChild(ul.cloneNode(true));
      } else if (firstContent.tagName === 'P' && firstContent.textContent.trim()) {
        infoDiv.appendChild(firstContent.cloneNode(true));
      }
    });
    if (infoDiv.children.length) nav.appendChild(infoDiv);
  }

  // Navigation Items
  const section = createElement('div', { className: 'section nav-sections nav-item-level-0' });
  const sectionWrapper = createElement('div', { className: 'default-content-wrapper' });
  const ul = createElement('ul');

  const menus = header.querySelectorAll('.navigation-content[data-type="navigation-content"], .navigation-content[data-type="language-links"]');
  menus.forEach((menu) => {
    // Skip brand-info blocks — they have no text label (content is supplementary links)
    if (!menu.querySelector('p')?.textContent.trim()) return;

    let element = menu;
    const p = menu.querySelector('p');
    if (p && p.innerText.trim() === 'MORE') {
      const clonedBlock = menu.cloneNode(true);
      const clonedP = clonedBlock.querySelector('p');
      if (clonedP) clonedP.textContent = 'Quick Links';
      element = clonedBlock;
    }
    const li = buildMenuItem(element, true);
    if (li) ul.appendChild(li);
  });
  sectionWrapper.appendChild(ul);
  section.appendChild(sectionWrapper);
  nav.appendChild(section);

  /* ========== Language and links ========== */
  const tools = document.createElement('div');
  tools.className = 'section nav-tools nav-item-level-0';
  const toolsWrapper = document.createElement('div');
  toolsWrapper.className = 'default-content-wrapper';

  // CTA group (guest/user auth + primary button) — rendered BEFORE search/language-links
  const ctaGroup = buildCtaGroup(header);
  if (ctaGroup) {
    const ctaItem = createElement('div', { className: 'nav-cta-item' });
    ctaItem.appendChild(ctaGroup);
    toolsWrapper.appendChild(ctaItem);
    tools.appendChild(toolsWrapper);
    nav.appendChild(tools);
  }

  // Search — icon toggles to X on expand; search icon also appears inside input
  const searchBlock = header.querySelector('.navigation-content[data-type="search"]');
  if (searchBlock) {
    const navSearch = document.createElement('div');
    navSearch.className = 'section nav-search';

    const searchIconEl = searchBlock.querySelector('p > span');

    // Toggle button: search icon (collapsed) ↔ close icon (expanded)
    const toggleBtn = createElement('button', {
      className: 'search-toggle',
      attributes: { type: 'button', 'aria-label': 'Open search', 'aria-expanded': 'false' },
    });
    if (searchIconEl) toggleBtn.appendChild(searchIconEl.cloneNode(true));

    // Inline close (X) icon — no separate SVG file needed
    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'icon icon-close';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    toggleBtn.appendChild(closeIconSpan);

    // Expanded state: search form only (toggle button handles close)
    const searchExpanded = document.createElement('div');
    searchExpanded.className = 'search-expanded';
    searchExpanded.hidden = true;

    const searchForm = createSearchForm(searchBlock);

    // Dark search icon inside the input — fresh SVG with no fill so CSS colours it
    const inputSearchIcon = document.createElement('span');
    inputSearchIcon.className = 'icon icon-search';
    inputSearchIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.9,15.5c2.4-3.2,2.2-7.7-0.7-10.6c-3.1-3.1-8.1-3.1-11.3,0c-3.1,3.2-3.1,8.3,0,11.4c2.9,2.9,7.5,3.1,10.6,0.6c0,0.1,0,0.1,0,0.1l4.2,4.2c0.5,0.4,1.1,0.4,1.5,0c0.4-0.4,0.4-1,0-1.4L16.9,15.5C16.9,15.5,16.9,15.5,16.9,15.5L16.9,15.5z M14.8,6.3c2.3,2.3,2.3,6.1,0,8.5c-2.3,2.3-6.1,2.3-8.5,0C4,12.5,4,8.7,6.3,6.3C8.7,4,12.5,4,14.8,6.3z"/></svg>';
    searchForm.querySelector('.search-inner-wrapper')?.prepend(inputSearchIcon);

    searchExpanded.append(searchForm);

    toggleBtn.addEventListener('click', () => {
      const isExpanded = !searchExpanded.hidden;
      searchExpanded.hidden = isExpanded;
      toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      toggleBtn.setAttribute('aria-label', isExpanded ? 'Open search' : 'Close search');
      if (!isExpanded) searchExpanded.querySelector('.search-input')?.focus();
    });

    navSearch.append(searchExpanded, toggleBtn);
    nav.appendChild(navSearch);
  }

  // hamburger for mobile
  const navSections = nav.querySelector('.nav-sections');
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span></span><span></span><span></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    // Collapse search if expanded
    const searchExpanded = nav.querySelector('.nav-search .search-expanded');
    if (searchExpanded && !searchExpanded.hidden) {
      searchExpanded.hidden = true;
      const searchToggle = nav.querySelector('.nav-search .search-toggle');
      if (searchToggle) {
        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.setAttribute('aria-label', 'Open search');
      }
    }
    toggleMenu(nav, navSections);
  });
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  // Insert eyebrow bars: top goes before utility, bottom goes after utility
  const eyebrows = buildEyebrows(header);
  const topEyebrows = eyebrows.filter(({ position }) => position === 'top').map(({ bar }) => bar);
  const bottomEyebrows = eyebrows.filter(({ position }) => position === 'bottom').map(({ bar }) => bar);
  topEyebrows.forEach((bar) => navWrapper.append(bar));

  if (utilityBarEl) {
    navWrapper.append(utilityBarEl);
    utilityBarEl = null;
  }
  bottomEyebrows.forEach((bar) => navWrapper.append(bar));

  navWrapper.append(nav);
  decorateExternalLinksUtility(navWrapper);
  wireHcpModalLinks(navWrapper, block);
  block.append(navWrapper);

  // Floating ISI — appended to header block, sits outside nav-wrapper
  const floatingIsi = buildFloatingIsi(header);
  if (floatingIsi) {
    block.append(floatingIsi);
    document.body.classList.add('nav-isi-visible');
  }

  await renderBlock(block);
}
