const INTERNAL_EXTERNAL_LINK_WHITELIST = [
  'https://www.abbvie.com',
  'https://abbv.ie',
  'https://privacy.abbvie',
  'https://careers.abbvie.com',
];

function isExternalLink(url) {
  try {
    const linkUrl = new URL(url, window.location.origin);
    return (
      linkUrl.origin !== window.location.origin
      && !url.startsWith('/')
      && !INTERNAL_EXTERNAL_LINK_WHITELIST.some((domain) => url.startsWith(domain))
    );
  } catch {
    return false;
  }
}

export default function decorateExternalLinksUtility(container) {
  const anchors = container.querySelectorAll('a');
  anchors.forEach((link) => {
    if (isExternalLink(link.href)) {
      link.classList.add('external-link');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
}

export function isEditor() {
  return window.document.querySelector('.adobe-ue-edit') !== null;
}

export function isAuthorEnvironment() {
  if (window?.location?.origin?.includes('author')) {
    return true;
  }
  return false;
}

/**
 * Detect if running in Universal Editor environment.
 * Checks author origin, UE resource attribute on <html>, and ?aue query param.
 * @returns {boolean} True if running in Universal Editor
 */
export function isUniversalEditor() {
  if (isAuthorEnvironment()) return true;
  if (document.documentElement.hasAttribute('data-aue-resource')) return true;
  try {
    if (new URLSearchParams(window.location.search).has('aue')) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Decorate the block with a lang attribute if a paragraph with "lang:xx" is found
 * The paragraph will be removed from the DOM after processing
 * @param {Element} block The block element to decorate
 */
export function decorateLangAttribute(block) {
  [...block.children].forEach((row) => {
    const p = row.querySelector('[data-aue-prop]') || row.querySelector('p');
    if (p) {
      const val = p.textContent.trim();
      if (val && val !== 'none' && val.startsWith('lang:')) {
        const lang = val.substring(5);
        if (lang && lang !== 'none') {
          block.setAttribute('lang', lang);
        }
        row.remove();
      }
    }
  });
}

// Prefix-to-attribute mapping — easy to extend with new prefixes
const COMMON_PROP_HANDLERS = {
  'lang:': (block, val) => {
    const lang = val.slice(5);
    if (lang && lang !== 'none') block.setAttribute('lang', lang);
  },
  'id:': (block, val) => {
    const id = val.slice(3);
    if (id && id !== 'none') block.setAttribute('id', id);
  },
};

/**
 * Process common authorable properties encoded as prefixed text rows.
 * Supported prefixes: lang:<code>, id:<value>
 *
 * Note: customClass uses classes_ prefix and is handled automatically
 * by the framework — no JS needed.
 *
 * @param {Element} block - The block element
 */
export function applyCommonProps(block) {
  [...block.children].forEach((row) => {
    const p = row.querySelector('[data-aue-prop]') || row.querySelector('p');
    if (!p) return;

    const val = p.textContent.trim();
    if (!val || val === 'none') return;

    const prefix = Object.keys(COMMON_PROP_HANDLERS).find((k) => val.startsWith(k));
    if (prefix) {
      COMMON_PROP_HANDLERS[prefix](block, val);
      row.remove();
    }
  });
}

export function isUEEditMode() {
  return document.documentElement.classList.contains('adobe-ue-edit');
}

export function isUEPreviewMode() {
  return document.documentElement.classList.contains('adobe-ue-preview');
}

export function isUEAuthorSurface() {
  return isUEEditMode() || isUEPreviewMode();
}

/**
 * Run on preview + live, but NOT on UE edit mode
 */
export function shouldRunOutsideAuthorEdit() {
  return !isUEEditMode();
}

/**
 * Run only on true site delivery surfaces, NOT in UE edit/preview
 */
export function shouldRunOutsideAllUESurfaces() {
  return !isUEAuthorSurface();
}

function addIconClasses(element, classes) {
  if (!classes) return;
  const classesToAdd = Array.isArray(classes)
    ? classes
    : classes.split(/\s+/).filter(Boolean);
  classesToAdd.forEach((cls) => element.classList.add(cls));
}

function wrapIconIfNeeded(element, wrapperClass) {
  if (!wrapperClass) return element;
  const wrapperSpan = document.createElement('span');
  wrapperSpan.className = wrapperClass;
  wrapperSpan.appendChild(element);
  return wrapperSpan;
}

/**
 * Creates an icon element with the Abbvie icon font or image.
 * @param {string|HTMLPictureElement} source - The icon source
 * @param {string} type - 'icon-font', 'image', or 'svg'
 * @param {Object} options - Optional: additionalClasses, ariaHidden, wrapperClass
 * @returns {HTMLElement} The icon element (or wrapper if wrapperClass is provided)
 */
export function createIcon(source, type, options = {}) {
  if (!type || !['icon-font', 'image', 'svg'].includes(type)) {
    throw new Error('createIcon: type must be "icon-font", "image", or "svg"');
  }

  if (!source) return null;

  const {
    additionalClasses = '',
    ariaHidden = true,
    wrapperClass = '',
  } = options;

  if (type === 'image') {
    const iconSpan = document.createElement('span');
    addIconClasses(iconSpan, additionalClasses);

    let pictureEl;
    if (source instanceof Element && source.tagName === 'PICTURE') {
      pictureEl = source.cloneNode(true);
    } else {
      pictureEl = document.createElement('picture');
      const img = document.createElement('img');
      img.src = source;
      pictureEl.appendChild(img);
    }

    const innerImg = pictureEl.querySelector('img');
    if (innerImg) {
      innerImg.alt = '';
      if (ariaHidden) innerImg.setAttribute('aria-hidden', 'true');
    }

    iconSpan.appendChild(pictureEl);
    return wrapIconIfNeeded(iconSpan, wrapperClass);
  }

  if (type === 'svg') {
    const colonMatch = source.trim().match(/^:([a-z0-9-]+):$/i);
    const svgName = colonMatch ? colonMatch[1] : source.trim();

    const codeBasePath = window.hlx?.codeBasePath || '';

    const iconSpan = document.createElement('span');
    addIconClasses(iconSpan, additionalClasses);
    if (ariaHidden) iconSpan.setAttribute('aria-hidden', 'true');

    const pictureEl = document.createElement('picture');
    const img = document.createElement('img');
    img.src = `${codeBasePath}/icons/${svgName}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    pictureEl.appendChild(img);
    iconSpan.appendChild(pictureEl);

    return wrapIconIfNeeded(iconSpan, wrapperClass);
  }

  // icon-font: normalize to 'icon-abbvie-*'
  let normalizedClass = source.trim();
  const colonMatch = normalizedClass.match(/^:([a-z0-9-]+):$/i);
  if (colonMatch) {
    normalizedClass = `icon-abbvie-${colonMatch[1]}`;
  } else if (normalizedClass.startsWith('icon-abbvie-')) {
    // already correct
  } else if (normalizedClass.startsWith('icon-')) {
    normalizedClass = `icon-abbvie-${normalizedClass.slice('icon-'.length)}`;
  } else if (!normalizedClass.includes(' ')) {
    normalizedClass = `icon-abbvie-${normalizedClass}`;
  }

  const iconSpan = document.createElement('span');
  iconSpan.className = `${normalizedClass}`;
  addIconClasses(iconSpan, additionalClasses);

  if (ariaHidden) {
    iconSpan.setAttribute('aria-hidden', 'true');
  }

  return wrapIconIfNeeded(iconSpan, wrapperClass);
}

/**
 * Extracts an icon source from an authoring cell element.
 * Returns a cloned <picture> element, href string, or plain text.
 * @param {Element} cell - The authoring cell to extract from
 * @returns {HTMLPictureElement|string}
 */
export function extractIconSource(cell) {
  if (!cell) return '';

  const link = cell.querySelector('a[href]');
  if (link) return link.getAttribute('href');

  const picture = cell.querySelector('picture');
  if (picture) return picture.cloneNode(true);

  return cell.textContent?.trim() || '';
}
