import { applyCommonProps } from '../../scripts/utils.js';

const ABBVIE_LOGO_SVG = '<svg viewBox="0 0 124.4 21.5" class="brand-explorer-abbvie-logo"><g><path fill="currentColor" d="M123.8,20.8c0-1.3-0.8-1.8-2-1.8c-0.7,0-9.2,0-9.2,0c-4.5,0-5.6-2.7-5.8-4.4c0,0,9.5,0,12.5,0c3.8,0,5-2.8,5-4.6c0-1.9-1.2-4.6-5-4.6c-3.4,0-6.9,0-6.9,0c-6.5,0-8.6,4.4-8.6,8c0,3.9,2.4,8,8.6,8h11.4C123.8,21.5,123.8,20.9,123.8,20.8z M112.6,7.8c1,0,4.6,0,6,0c2.2,0,2.7,1.3,2.7,2.2c0,0.8-0.5,2.2-2.7,2.2c-1.5,0-12,0-12,0C106.8,10.8,108.1,7.8,112.6,7.8z M85.9,20.5c-0.7,0.9-1,1.3-1.7,1.3c-0.9,0-1.1-0.4-1.7-1.3c-1.4-2-9.8-15-9.8-15s0.6,0,1.2,0c2,0,2.6,0.9,3.2,1.9c0.5,0.8,7.3,11.2,7.3,11.2s6.4-9.9,7.3-11.3c0.6-0.9,1.4-1.8,3.3-1.8c0.4,0,0.9,0,0.9,0S87.1,18.9,85.9,20.5z M22.8,21.5c-1.5,0-2.1-0.6-2.3-1.8L20.1,18c-0.4,0.7-2.4,3.5-6.8,3.5c0,0-2.2,0-4.5,0c-6.8,0-8.7-4.6-8.7-8c0-3.8,2.3-8,8.7-8c1.3,0,2.7,0,4.8,0c4.9,0,7.6,2.8,8.2,6.3c0.5,2.9,1.8,9.7,1.8,9.7S23.3,21.5,22.8,21.5z M12.9,8c-1.6,0-2,0-3.8,0C4.5,8,3,10.9,3,13.5S4.5,19,9.1,19c1.9,0,2.5,0,3.8,0c4.8,0,6.1-3,6.1-5.5C19,11.3,17.8,8,12.9,8z M99,2.9c0.7,0,1.4-0.4,1.4-1.3c0-0.2,0-0.4,0-0.5c0-0.8-0.7-1.3-1.4-1.3c-0.7,0-1.4,0.4-1.4,1.3c0,0.1,0,0.3,0,0.5C97.6,2.5,98.3,2.9,99,2.9z M97.7,5.5c0,0,0.4,0,0.6,0c1.3,0,2.1,0.7,2.1,2.1c0,0.2,0,13.9,0,13.9s-0.3,0-0.6,0c-1.3,0-2.1-0.8-2.1-2.2C97.7,19.2,97.7,5.5,97.7,5.5z M28.1,7.8c0.6-0.6,2.4-2.3,5.9-2.3c0,0,2.2,0,4.5,0c6.8,0,8.8,4.6,8.8,8c0,3.8-2.4,8-8.8,8c-1.3,0-2.7,0-4.8,0c-4.9,0-8.4-3.1-8.4-8c0-1.6,0-13.4,0-13.4s0.5,0,0.8,0c1.4,0,2,0.7,2,1.9C28.1,2.2,28.1,7.8,28.1,7.8z M34.4,19c1.6,0,2,0,3.8,0c4.5,0,6.1-2.9,6.1-5.5S42.8,8,38.2,8c-1.9,0-2.5,0-3.8,0c-4.8,0-6.1,3-6.1,5.5C28.2,15.7,29.5,19,34.4,19z M53.2,7.8c0.6-0.6,2.4-2.3,5.9-2.3c0,0,2.2,0,4.5,0c6.8,0,8.7,4.6,8.7,8c0,3.8-2.3,8-8.7,8c-1.3,0-2.7,0-4.8,0c-4.9,0-8.4-3.1-8.4-8c0-1.6,0-13.4,0-13.4s0.5,0,0.8,0c1.4,0,2,0.7,2,1.9C53.2,2.2,53.2,7.8,53.2,7.8z M59.5,19c1.6,0,2,0,3.8,0c4.6,0,6.1-2.9,6.1-5.5S67.9,8,63.3,8c-1.9,0-2.4,0-3.8,0c-4.8,0-6.1,3-6.1,5.5C53.3,15.7,54.6,19,59.5,19z"/></g></svg>';

/**
 * Parses table format (plain.html) — multi-cell rows with first row as bar config.
 * @param {HTMLElement[]} rows - Block child rows
 * @returns {Object} Parsed config with barLabel, utilityLinks, brands, projectNumber
 */
function parseTableFormat(rows) {
  let barLabel = '';
  const utilityLinks = [];
  const brands = [];
  const projectNumber = '';

  const [barRow, ...restRows] = rows;
  const barCells = [...barRow.children];
  barLabel = barCells[0]?.textContent.trim() || '';

  for (let i = 1; i < barCells.length; i += 1) {
    const a = barCells[i]?.querySelector('a');
    if (a) utilityLinks.push({ text: a.textContent.trim(), href: a.href, target: a.target || '_self' });
  }

  let currentBrand = null;
  restRows.forEach((row) => {
    const cells = [...row.children];
    const hasImage = cells[0]?.querySelector('img, picture');
    if (hasImage) {
      currentBrand = {
        image: hasImage.cloneNode(true),
        name: cells[1]?.textContent.trim() || '',
        safetyText: cells[2]?.innerHTML.trim() || '',
        url: cells[3]?.textContent.trim() || '#',
        color: cells[4]?.textContent.trim() || '',
        indications: [],
      };
      brands.push(currentBrand);
    } else if (currentBrand) {
      const name = cells[0]?.textContent.trim();
      const url = cells[1]?.textContent.trim() || '#';
      const severity = cells[2]?.textContent.trim().toLowerCase() || '';
      if (name) currentBrand.indications.push({ name, url, severity });
    }
  });

  return {
    barLabel, utilityLinks, brands, projectNumber,
  };
}

/**
 * Parses flat xwalk format — single-cell rows, block fields first then brand entries.
 * @param {HTMLElement[]} rows - Block child rows
 * @returns {Object} Parsed config with barLabel, utilityLinks, brands, projectNumber
 */
function parseFlatXwalkFormat(rows) {
  let barLabel = '';
  const utilityLinks = [];
  const brands = [];
  let projectNumber = '';

  const flatValues = rows.map((row) => {
    const img = row.querySelector('img, picture');
    const link = row.querySelector('a');
    const cells = [...row.children];
    const text = row.textContent.trim();
    return {
      el: row, img, link, cells, text,
    };
  });

  let i = 0;
  while (i < flatValues.length && !flatValues[i].img) {
    const { text, link } = flatValues[i];
    const isProjectNum = /^[A-Z]{2,}-[A-Z]+-\d/.test(text);
    if (isProjectNum) {
      projectNumber = text;
    } else if (text && !link && !text.startsWith('http') && text !== '#') {
      const nextVal = flatValues[i + 1];
      if (nextVal?.link) {
        utilityLinks.push({
          text,
          href: nextVal.link.href,
          target: text.toLowerCase().includes('contact') ? '_self' : '_blank',
        });
        i += 1;
      } else if (!barLabel) {
        barLabel = text;
      }
    }
    i += 1;
  }

  while (i < flatValues.length) {
    const { img, cells } = flatValues[i];
    if (img && cells.length > 1) {
      const brandName = cells[1]?.textContent.trim() || '';
      const brandUrl = cells[4]?.querySelector('a')?.href || cells[4]?.textContent.trim() || '#';
      const safetyText = cells[5]?.innerHTML.trim() || '';
      const indicationsRaw = cells[6]?.textContent.trim() || '';
      const indications = [];
      if (indicationsRaw) {
        const lines = indicationsRaw.includes('\n')
          ? indicationsRaw.split('\n')
          : indicationsRaw.split(/(?<=\|(?:moderate|active|refractory|noninfectious|blank))\s+/i);
        lines.forEach((line) => {
          const parts = line.split('|').map((p) => p.trim());
          if (parts[0]) indications.push({ name: parts[0], url: parts[1] || '#', severity: (parts[2] || '').toLowerCase() });
        });
      }
      brands.push({
        image: img.cloneNode(true), name: brandName, safetyText, url: brandUrl, color: '', indications,
      });
    }
    i += 1;
  }

  return {
    barLabel, utilityLinks, brands, projectNumber,
  };
}

/**
 * Parses UE editor format — rows with data-aue-component attributes.
 * @param {HTMLElement[]} rows - Block child rows
 * @returns {Object} Parsed config with barLabel, utilityLinks, brands, projectNumber
 */
function parseUEEditorFormat(rows) {
  let barLabel = '';
  const utilityLinks = [];
  const brands = [];
  let projectNumber = '';

  rows.forEach((row) => {
    const comp = row.getAttribute('data-aue-component');
    if (comp === 'brand-explorer-item') {
      const img = row.querySelector('img, picture');
      const allTexts = [...row.querySelectorAll('p, div, span')]
        .map((el) => el.textContent.trim()).filter(Boolean);
      const urlEl = row.querySelector('a');
      const brandUrl = urlEl?.href || allTexts.find((t) => t.startsWith('http')) || '#';
      const brandNameEl = row.querySelector('[data-aue-prop="brandName"]');
      const brandName = brandNameEl?.textContent.trim()
        || allTexts.find((t) => !t.startsWith('http') && !t.startsWith('#') && !t.includes('|') && t.length < 30) || '';
      let safetyText = '';
      row.querySelectorAll('p, div, span, b, strong').forEach((el) => {
        if (safetyText) return;
        const txt = el.textContent.trim().toLowerCase();
        if (txt.includes('safety information') || txt.includes('boxed warning')) {
          safetyText = el.innerHTML.trim() || el.textContent.trim();
        }
      });
      const brandColor = allTexts.find((t) => t.startsWith('#') && t.length <= 7) || '';
      const indications = [];
      const indicationsText = allTexts.find((t) => t.includes('|'));
      if (indicationsText) {
        indicationsText.split('\n').forEach((line) => {
          const parts = line.split('|').map((p) => p.trim());
          if (parts[0]) indications.push({ name: parts[0], url: parts[1] || '#', severity: parts[2] || '' });
        });
      }
      brands.push({
        image: img ? img.cloneNode(true) : null,
        name: brandName,
        safetyText,
        url: brandUrl,
        color: brandColor,
        indications,
      });
    } else if (!comp) {
      if (!barLabel) {
        const barLabelEl = row.querySelector('[data-aue-prop="barLabel"]');
        if (barLabelEl) barLabel = barLabelEl.textContent.trim();
      }
      const text = row.textContent.trim();
      if (!projectNumber && /^[A-Z]{2,}-[A-Z]+-\d/.test(text)) projectNumber = text;
    }
  });

  return {
    barLabel, utilityLinks, brands, projectNumber,
  };
}

/**
 * Detects content format and parses block rows into a configuration object.
 * Supports: table format, flat xwalk format, UE editor format.
 * @param {HTMLElement[]} rows - Block child rows
 * @returns {Object} Config with barLabel, utilityLinks, brands, projectNumber
 */
function detectAndParseContent(rows, block) {
  const firstRowCells = rows[0]?.children?.length || 0;
  const isTableFormat = firstRowCells > 1
    || rows[0]?.querySelector('a')
    || rows[0]?.querySelector('img, picture');

  let cfg;
  if (isTableFormat) {
    cfg = parseTableFormat(rows);
  } else {
    cfg = parseFlatXwalkFormat(rows);
    if (!cfg.brands.length) {
      const ueCfg = parseUEEditorFormat(rows);
      if (ueCfg.brands.length) cfg = ueCfg;
    }
  }

  if (block) {
    const projEl = block.querySelector('[data-aue-prop="projectNumber"]');
    if (projEl && projEl.textContent.trim()) cfg.projectNumber = projEl.textContent.trim();
    const barEl = block.querySelector('[data-aue-prop="barLabel"]');
    if (barEl && barEl.textContent.trim()) cfg.barLabel = barEl.textContent.trim();
  }

  return cfg;
}

/**
 * Builds the fixed bottom bar with logo, browse button, and utility links.
 * @param {Object} cfg - Parsed configuration
 * @returns {Object} { bar, barLeft, barRight, browseBtn }
 */
function buildBar(cfg) {
  const bar = document.createElement('div');
  bar.className = 'brand-explorer-bar';

  const barLeft = document.createElement('div');
  barLeft.className = 'brand-explorer-left';

  const logoLink = document.createElement('a');
  logoLink.href = 'https://www.abbvie.com';
  logoLink.target = '_blank';
  logoLink.className = 'brand-explorer-logo-link';
  logoLink.setAttribute('aria-label', 'AbbVie');
  logoLink.innerHTML = ABBVIE_LOGO_SVG;
  barLeft.append(logoLink);

  const browseBtn = document.createElement('button');
  browseBtn.className = 'brand-explorer-browse';
  browseBtn.setAttribute('aria-expanded', 'false');
  browseBtn.setAttribute('aria-controls', 'brand-explorer-content');
  const browseLabelSpan = document.createElement('span');
  browseLabelSpan.textContent = cfg.barLabel || 'Browse';
  const browseIcon = document.createElement('span');
  browseIcon.className = 'brand-explorer-browse-icon';
  browseBtn.append(browseLabelSpan, browseIcon);
  barLeft.append(browseBtn);

  const barRight = document.createElement('div');
  barRight.className = 'brand-explorer-right';

  cfg.utilityLinks.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.target = link.target;
    const href = link.href?.trim() || '';
    if (href.startsWith('#') && href.length > 1) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const modalEl = document.getElementById(href.slice(1));
        if (modalEl) modalEl.hidden = false;
      });
    } else if (href === '#' || !href) {
      a.addEventListener('click', (e) => { e.preventDefault(); });
    }
    barRight.append(a);
  });

  bar.append(barLeft, barRight);
  return { bar, browseBtn };
}

/**
 * Builds the expandable content panel with brand accordions.
 * @param {Object[]} brands - Array of brand objects
 * @param {string} projectNumber - Project number text
 * @returns {Object} { content, closeBtn, accordions }
 */
function buildContent(brands, projectNumber) {
  const content = document.createElement('div');
  content.className = 'brand-explorer-content';
  content.id = 'brand-explorer-content';
  content.hidden = true;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'brand-explorer-close';
  closeBtn.setAttribute('aria-label', 'Close brand explorer');
  closeBtn.textContent = 'Close ';
  const closeIcon = document.createElement('span');
  closeIcon.className = 'brand-explorer-close-icon';
  closeBtn.append(closeIcon);
  content.append(closeBtn);

  const accordions = document.createElement('div');
  accordions.className = 'brand-explorer-accordions';

  brands.forEach((brand) => {
    const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const accordion = document.createElement('div');
    accordion.className = brandSlug
      ? `brand-explorer-accordion brand-explorer-accordion--${brandSlug}`
      : 'brand-explorer-accordion';

    const blade = document.createElement('div');
    blade.className = 'brand-explorer-blade';

    const bladeLink = document.createElement('a');
    bladeLink.href = brand.url;
    bladeLink.className = 'brand-explorer-blade-link';

    if (brand.image) {
      const img = brand.image.tagName === 'IMG' ? brand.image : brand.image.querySelector('img');
      if (img) {
        img.className = 'brand-explorer-brand-img';
        img.loading = 'lazy';
        bladeLink.append(img);
      }
    }
    blade.append(bladeLink);

    if (brand.safetyText) {
      const subtitle = document.createElement('div');
      subtitle.className = 'brand-explorer-subtitle';
      subtitle.innerHTML = brand.safetyText;
      blade.append(subtitle);
    }

    const brandSlugColor = brandSlug; // declared at line 305 in this forEach

    const separator = document.createElement('hr');
    separator.className = 'brand-explorer-separator';
    if (brandSlugColor) separator.dataset.brand = brandSlugColor;
    blade.append(separator);
    accordion.append(blade);

    const links = document.createElement('div');
    links.className = 'brand-explorer-links';

    brand.indications.forEach((ind) => {
      const a = document.createElement('a');
      a.href = ind.url;
      a.className = 'brand-explorer-indication';
      if (ind.severity) a.classList.add(`brand-explorer-indication--${ind.severity}`);
      a.textContent = ind.name;
      links.append(a);
    });

    const visitLink = document.createElement('a');
    visitLink.href = brand.url;
    visitLink.className = 'brand-explorer-visit';
    if (brandSlugColor) visitLink.dataset.brand = brandSlugColor;
    visitLink.textContent = `Visit ${brand.name} `;
    const arrow = document.createElement('span');
    arrow.className = 'brand-explorer-visit-arrow';
    visitLink.append(arrow);
    links.append(visitLink);

    accordion.append(links);
    accordions.append(accordion);
  });

  content.append(accordions);

  const projectNum = document.createElement('div');
  projectNum.className = 'brand-explorer-project-number';
  projectNum.textContent = projectNumber;
  content.append(projectNum);

  return { content, closeBtn, accordions };
}

/**
 * Attaches open/close/keyboard event listeners with AbortController for cleanup.
 * @param {HTMLElement} block - The block element
 * @param {HTMLElement} browseBtn - The browse trigger button
 * @param {HTMLElement} closeBtn - The close button
 * @param {HTMLElement} content - The content panel
 * @param {HTMLElement} accordions - The accordions container
 */
function attachEventListeners(block, browseBtn, closeBtn, content, accordions) {
  const controller = new AbortController();
  const { signal } = controller;

  function open() {
    content.hidden = false;
    requestAnimationFrame(() => {
      block.classList.add('is-open');
      browseBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    });
  }

  function close() {
    block.classList.remove('is-open');
    browseBtn.setAttribute('aria-expanded', 'false');
    content.addEventListener('transitionend', () => { content.hidden = true; }, { once: true });
    browseBtn.focus();
  }

  browseBtn.addEventListener('click', () => {
    if (block.classList.contains('is-open')) close(); else open();
  }, { signal });

  closeBtn.addEventListener('click', close, { signal });

  document.addEventListener('click', (e) => {
    if (block.classList.contains('is-open') && !block.contains(e.target)) close();
  }, { signal });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && block.classList.contains('is-open')) close();
  }, { signal });

  const MOBILE_MAX = '(max-width: 895px)';
  const mobileQuery = window.matchMedia(MOBILE_MAX);
  accordions.addEventListener('click', (e) => {
    if (!mobileQuery.matches) return;
    const clickedBlade = e.target.closest('.brand-explorer-blade');
    if (!clickedBlade) return;
    e.preventDefault();
    const parentAccordion = clickedBlade.closest('.brand-explorer-accordion');
    const wasActive = parentAccordion.classList.contains('is-active');
    accordions.querySelectorAll('.brand-explorer-accordion').forEach((acc) => acc.classList.remove('is-active'));
    if (!wasActive) parentAccordion.classList.add('is-active');
  }, { signal });

  block.dataset.cleanupController = 'attached';
}

/**
 * Decorates the brand-explorer block with multi-format content parsing,
 * fixed bottom bar, expandable brand panel, and utility links.
 *
 * Supported authoring formats:
 * 1. Table format (plain.html) — multi-cell rows with headers
 * 2. Flat xwalk format — single-cell rows, block fields then brand entries
 * 3. UE editor format — rows with data-aue-component attributes
 *
 * @param {HTMLElement} block - The brand-explorer block element
 */
export default function decorate(block) {
  applyCommonProps(block);

  const rows = [...block.children];
  if (!rows.length) return;

  const cfg = detectAndParseContent(rows, block);

  rows.forEach((row) => { row.classList.add('brand-explorer-hidden'); });

  const { bar, browseBtn } = buildBar(cfg);
  const { content, closeBtn, accordions } = buildContent(cfg.brands, cfg.projectNumber);

  block.prepend(content);
  block.append(bar);

  const section = block.closest('.section');
  if (section) {
    section.classList.add('brand-explorer-section');
    if (!section.dataset.bePositioned) {
      const doc = block.ownerDocument;
      const header = doc.querySelector('header');
      if (header && header.previousElementSibling !== section) {
        header.before(section);
      }
      section.dataset.bePositioned = 'true';
    }
  }

  attachEventListeners(block, browseBtn, closeBtn, content, accordions);
}
