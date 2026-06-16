/**
 * Image with Text Block
 *
 * Content model (xwalk field-per-row, no row for classes/imageAlt/mobileImageAlt —
 * those are applied by the framework/server):
 *   Row 0 – image          reference → <picture><img>
 *   Row 1 – mobileImage    reference → <picture><img> (swap variant only; may be empty)
 *   Row 2 – content        richtext
 *   Row 3 – ctaLabel       text
 *   Row 4 – ctaHref        text (URL)
 *   Row 5 – ctaTarget      text (_self | _blank)
 *   Row 6 – modalId        text — CTA triggers modal instead of navigating
 *   Row 7 – anchorId       text — sets id on block for page-anchor nav
 *   Row 8 – analyticsId    text — data-analytics attribute on CTA
 *
 * Decorated structure:
 *   .image-text [variant-classes]
 *     .image-text-image-col
 *       picture > img
 *     .image-text-content-col
 *       .image-text-content   (richtext)
 *       p.button-container > a.button   (optional CTA)
 */

const MOBILE_MQ = '(max-width: 599px)';

const ROW = {
  IMAGE: 0,
  MOBILE_IMAGE: 1,
  CONTENT: 2,
  CTA_LABEL: 3,
  CTA_HREF: 4,
  CTA_TARGET: 5,
  MODAL_ID: 6,
  ANCHOR_ID: 7,
  ANALYTICS_ID: 8,
};

/**
 * Reads trimmed text from a row's first child cell.
 */
function getCellText(row) {
  return row?.firstElementChild?.textContent?.trim() || '';
}

/**
 * Extracts a <picture> element from a block row, handling three authoring cases:
 *   1. EDS standard — <picture> already present in DOM
 *   2. Bare <img> — wraps it in a <picture>
 *   3. AEM Author reference — image rendered as an <a> to the asset URL
 * Returns null when the row is empty or contains no image.
 */
function extractPicture(row) {
  if (!row) return null;
  const picture = row.querySelector('picture');
  if (picture) return picture;

  const img = row.querySelector('img');
  if (img) {
    const wrapper = document.createElement('picture');
    wrapper.appendChild(img);
    return wrapper;
  }

  const link = row.querySelector('a');
  if (link?.href) {
    const newImg = document.createElement('img');
    newImg.src = link.href;
    newImg.alt = link.title || link.textContent?.trim() || '';
    newImg.loading = 'lazy';
    const wrapper = document.createElement('picture');
    wrapper.appendChild(newImg);
    return wrapper;
  }

  return null;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // --- Extract DOM nodes before clearing the block ---
  const picture = extractPicture(rows[ROW.IMAGE]);
  const mobilePicture = extractPicture(rows[ROW.MOBILE_IMAGE]);
  const contentCell = rows[ROW.CONTENT]?.firstElementChild;

  // --- Extract text values ---
  const ctaLabel = getCellText(rows[ROW.CTA_LABEL]);
  const ctaHrefLink = rows[ROW.CTA_HREF]?.querySelector('a');
  const ctaHref = ctaHrefLink?.href || getCellText(rows[ROW.CTA_HREF]);
  const ctaTarget = getCellText(rows[ROW.CTA_TARGET]) || '_self';
  const modalId = getCellText(rows[ROW.MODAL_ID]);
  const anchorId = getCellText(rows[ROW.ANCHOR_ID]);
  const analyticsId = getCellText(rows[ROW.ANALYTICS_ID]);

  // --- Apply anchor ID to block ---
  if (anchorId) block.id = anchorId;

  // --- Build image column ---
  const imageCol = document.createElement('div');
  imageCol.classList.add('image-text-image-col');
  if (picture) imageCol.appendChild(picture);

  // --- Build content column ---
  const contentCol = document.createElement('div');
  contentCol.classList.add('image-text-content-col');

  if (contentCell) {
    contentCell.classList.add('image-text-content');
    contentCol.appendChild(contentCell);
  }

  // --- Build CTA ---
  // Stretched variant needs an invisible full-card link even without a visible label,
  // so the condition also fires when there is a destination (href or modal) and the
  // block is in stretched mode.
  const isStretched = block.classList.contains('image-text-stretched');
  const hasDestination = ctaHref || modalId;
  if (ctaLabel || (isStretched && hasDestination)) {
    const buttonP = document.createElement('p');
    buttonP.classList.add('button-container');

    const link = document.createElement('a');
    link.classList.add('button');
    link.textContent = ctaLabel;

    if (modalId) {
      link.href = '#';
      link.dataset.modal = modalId;
      link.setAttribute('aria-haspopup', 'dialog');
    } else if (ctaHref) {
      link.href = ctaHref;
      link.target = ctaTarget;
      if (ctaTarget === '_blank') link.rel = 'noopener noreferrer';
    }

    if (analyticsId) link.dataset.analytics = analyticsId;

    buttonP.appendChild(link);
    contentCol.appendChild(buttonP);
  }

  // --- Set sizes hint for responsive image loading ---
  const img = picture?.querySelector('img');
  if (img && !img.sizes) {
    let colWidth = '50vw';
    if (block.classList.contains('image-text-image-large')) colWidth = '60vw';
    else if (block.classList.contains('image-text-image-medium')) colWidth = '40vw';
    else if (block.classList.contains('image-text-image-small')) colWidth = '33vw';
    img.sizes = `(max-width: 767px) 100vw, ${colWidth}`;
  }

  // --- Rebuild block ---
  // For reverse, put content first so DOM order matches visual order.
  // This avoids CSS `order` and lets grid-template-columns read left→right.
  block.innerHTML = '';
  if (block.classList.contains('image-text-reverse')) {
    block.appendChild(contentCol);
    block.appendChild(imageCol);
  } else {
    block.appendChild(imageCol);
    block.appendChild(contentCol);
  }

  // --- Swap variant: swap image src at mobile breakpoint ---
  if (block.classList.contains('image-text-swap') && mobilePicture) {
    const desktopImg = picture?.querySelector('img');
    const mobileImg = mobilePicture.querySelector('img');

    if (desktopImg && mobileImg) {
      const desktopSrc = desktopImg.src;
      const mobileSrc = mobileImg.src;
      const desktopAlt = desktopImg.alt;
      const mobileAlt = mobileImg.alt;

      const applySwap = (isMobile) => {
        desktopImg.src = isMobile ? mobileSrc : desktopSrc;
        desktopImg.alt = isMobile ? mobileAlt : desktopAlt;
      };

      const mq = window.matchMedia(MOBILE_MQ);
      applySwap(mq.matches);
      mq.addEventListener('change', (e) => applySwap(e.matches));
    }
  }
}
