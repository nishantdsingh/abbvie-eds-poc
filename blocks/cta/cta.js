import { applyCommonProps } from '../../scripts/utils.js';

/**
 * Extracts trimmed text content from a block row's first cell.
 * @param {HTMLElement|undefined} row - The block row element
 * @returns {string} The extracted text content
 */
function cellText(row) {
  if (!row) return '';
  const el = row.children?.[0];
  const text = el?.textContent?.trim() || row.textContent?.trim() || '';
  return text;
}

/**
 * Extracts the href value from a row (prefers anchor href, falls back to text).
 * @param {HTMLElement|undefined} row - The block row element
 * @returns {string} The extracted URL or text
 */
function cellHref(row) {
  const a = row?.querySelector('a');
  return a ? a.getAttribute('href') || a.href : cellText(row);
}

/**
 * Extracts image source from a row (img src or picture source srcset).
 * @param {HTMLElement|undefined} row - The block row element
 * @returns {string} The image URL or empty string
 */
function cellImage(row) {
  const img = row?.querySelector('img');
  if (img) return img.getAttribute('src') || img.src;
  const pic = row?.querySelector('picture source');
  if (pic) return pic.getAttribute('srcset');
  return '';
}

/**
 * Parses the block's authored rows into a structured configuration object.
 * Row order: label, href, ariaLabel, target, modalId, then icon rows.
 * @param {HTMLElement} block - The CTA block element
 * @returns {Object} Configuration with label, href, ariaLabel, target, modalId, icon properties
 */
function readConfig(block) {
  const rows = [...block.children];
  const label = cellText(rows[0]) || 'Button';
  const href = cellHref(rows[1]) || '#';
  const ariaLabel = cellText(rows[2]) || '';
  const target = cellText(rows[3]) || '_self';
  const modalId = cellText(rows[4]) || '';

  let iconType = 'none';
  let iconFont = '';
  let iconImage = '';
  let iconPosition = block.classList.contains('i-b') ? 'i-b' : 'i-a';

  for (let i = 5; i < rows.length; i += 1) {
    const text = cellText(rows[i]);
    const img = cellImage(rows[i]);

    if (text === 'icon-font' || text === 'image' || text === 'none') {
      iconType = text;
    } else if (text === 'i-a' || text === 'i-b') {
      iconPosition = text;
    } else if (img) {
      iconImage = img;
    } else if (text && /^[/\\]?(?:u\+?|0x|x)?[0-9a-f]{3,6}$/i.test(text) && !iconFont) {
      const match = text.match(/[0-9a-f]{3,6}/i);
      iconFont = match ? match[0] : '';
    }
  }

  return {
    label,
    href,
    ariaLabel,
    target,
    modalId,
    iconType,
    iconFont,
    iconImage,
    iconPosition,
  };
}

function getVariant(block) {
  const variants = [
    'abbv-button-primary', 'abbv-button-secondary', 'abbv-button-tertiary',
    'abbv-button-plain', 'abbv-switch-round', 'abbv-switch-square',
  ];
  return variants.find((v) => block.classList.contains(v)) || 'abbv-button-primary';
}

/**
 * Pushes CTA interaction events to GTM dataLayer.
 * @param {Object} cfg - CTA configuration object
 * @param {HTMLElement} block - The block element
 * @param {string} action - The interaction type (click, toggle_on, toggle_off)
 */
function pushAnalytics(cfg, block, action) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'cta_interaction',
    cta_action: action,
    cta_label: cfg.label,
    cta_variant: getVariant(block),
  });
}

function isToggle(block) {
  return block.classList.contains('abbv-switch-round')
    || block.classList.contains('abbv-switch-square');
}

function buildToggle(cfg, block) {
  const wrapper = document.createElement('label');
  wrapper.className = 'cta-toggle';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'cta-toggle-input';
  if (cfg.ariaLabel) input.setAttribute('aria-label', cfg.ariaLabel);

  const slider = document.createElement('span');
  slider.className = 'cta-toggle-slider';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'cta-toggle-label';
  labelSpan.textContent = cfg.label;

  wrapper.append(input, slider, labelSpan);

  input.addEventListener('change', () => {
    const action = input.checked ? 'toggle_on' : 'toggle_off';
    pushAnalytics(cfg, block, action);
  });

  return wrapper;
}

/**
 * Creates an icon element based on config (font icon or image icon).
 * @param {Object} cfg - CTA configuration with iconType, iconFont, iconImage
 * @returns {HTMLElement|null} The icon span element, or null if no icon
 */
function buildIcon(cfg) {
  if (!cfg.iconType || cfg.iconType === 'none') return null;

  if (cfg.iconType === 'image' && cfg.iconImage) {
    const iconEl = document.createElement('span');
    iconEl.className = 'cta-icon cta-icon-image';
    iconEl.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = cfg.iconImage;
    img.alt = '';
    img.loading = 'lazy';
    iconEl.append(img);
    return iconEl;
  }

  if (cfg.iconType === 'icon-font' && cfg.iconFont) {
    const iconEl = document.createElement('span');
    iconEl.className = 'cta-icon cta-icon-font';
    iconEl.setAttribute('aria-hidden', 'true');
    const code = cfg.iconFont.replace(/^[/\\]?(?:u\+?|0x|x)?/i, '').trim();
    const charCode = parseInt(code, 16);
    if (!Number.isNaN(charCode) && charCode > 0) {
      iconEl.textContent = String.fromCharCode(charCode);
    }
    return iconEl;
  }

  return null;
}

function attachIcon(el, iconEl, isBefore) {
  if (!iconEl) return;
  if (isBefore) {
    el.prepend(iconEl);
  } else {
    el.append(iconEl);
  }
}

function buildLink(cfg) {
  const el = document.createElement('a');
  el.className = 'abbv-cta';
  el.href = cfg.href;
  el.textContent = cfg.label;

  if (cfg.target === '_blank') {
    el.target = '_blank';
    el.rel = 'noopener';
  }

  if (cfg.ariaLabel) el.setAttribute('aria-label', cfg.ariaLabel);

  attachIcon(el, buildIcon(cfg), cfg.iconPosition === 'i-b');

  return el;
}

function buildButton(cfg) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'abbv-cta';
  el.dataset.modalId = cfg.modalId;
  el.textContent = cfg.label;

  if (cfg.ariaLabel) el.setAttribute('aria-label', cfg.ariaLabel);

  attachIcon(el, buildIcon(cfg), cfg.iconPosition === 'i-b');

  return el;
}

export default function decorate(block) {
  applyCommonProps(block);

  const cfg = readConfig(block);

  if (cfg.iconType && cfg.iconType !== 'none' && cfg.iconPosition) {
    block.classList.add(cfg.iconPosition);
  }

  block.textContent = '';

  const wrapper = document.createElement('span');
  wrapper.className = 'cta-wrapper';

  let element;
  if (isToggle(block)) {
    element = buildToggle(cfg, block);
  } else if (cfg.modalId) {
    element = buildButton(cfg);
  } else {
    element = buildLink(cfg);
  }

  wrapper.append(element);
  block.append(wrapper);

  block.dispatchEvent(
    new CustomEvent('cta:ready', { bubbles: true, detail: { cfg } }),
  );
}
