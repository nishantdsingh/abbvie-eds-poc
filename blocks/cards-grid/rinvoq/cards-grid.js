import { fixEncodedSupInParagraph } from '../cards-grid.js';

const RINVOQ_COMMON_FLEX_CONTAINER_CLASS = (
  'abbv-flex-container-v2 flexbox--break-row-column'
);

const RINVOQ_SLIDER_THUMB_DEFAULT_HASH = '#body-parts-container';

function isRinvoqSliderThumbnailUeRow(wrapper) {
  if (!wrapper || wrapper.tagName !== 'DIV') return false;
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  if (cells.length < 4) return false;
  const mediaCell = cells[1];
  if (!mediaCell?.querySelector('picture, img')) return false;
  const titleRaw = (cells[2]?.textContent || '').trim();
  return titleRaw.length > 0;
}

function rinvoqSliderThumbnailAdultsPercentageClass(subtitleText) {
  const m = (subtitleText || '').match(/(\d+)\s*%/);
  if (!m) return 'adults-percentage-75';
  const n = parseInt(m[1], 10);
  if (Number.isNaN(n)) return 'adults-percentage-75';
  if (n >= 90) return 'adults-percentage-90';
  if (n >= 75) return 'adults-percentage-75';
  return `adults-percentage-${n}`;
}

function rinvoqSliderThumbnailFlexItemClass(index, total) {
  const base = 'abbv-flex-item p-0 max-width-110 max-width-md-120';
  if (total <= 1) return `${base} ml-0 ml-0 mr-md-10 mr-0`;
  if (index === 0) return `${base} ml-0 ml-0 mr-md-10 mr-0`;
  if (index === total - 1) return `${base} ml-md-5 ml-lg-10 ml-0 mt-md-10`;
  return `${base} ml-md-10 ml-0 mr-md-10 mr-0`;
}

function clonePictureFromRinvoqSliderThumbnailUeCell(mediaCell) {
  if (!mediaCell) return null;
  const pic = mediaCell.querySelector('picture');
  if (pic) {
    const clone = /** @type {HTMLPictureElement} */ (pic.cloneNode(true));
    clone.querySelectorAll('source').forEach((s) => {
      if (!(s.getAttribute('srcset') || '').trim()) s.remove();
    });
    return clone;
  }
  const img = mediaCell.querySelector('img');
  if (!img) return null;
  const picture = document.createElement('picture');
  picture.append(img.cloneNode(true));
  return picture;
}

function extractRinvoqSliderThumbnailLinkFromUeCells(cells) {
  for (let i = 0; i < cells.length; i += 1) {
    const a = cells[i]?.querySelector('a[href]');
    if (a) {
      const href = (a.getAttribute('href') || '').trim();
      if (href) return { href, anchor: a };
    }
  }
  return { href: RINVOQ_SLIDER_THUMB_DEFAULT_HASH, anchor: null };
}

function rinvoqSliderThumbnailLinkDisplayTitle(titleText, subtitleText, anchor) {
  const fromUe = (anchor?.getAttribute('title') || anchor?.textContent || '').trim();
  if (fromUe) return fromUe;
  const combined = `${titleText} ${subtitleText}`.trim().toLowerCase();
  return combined || 'thumbnail selection';
}

function buildRinvoqSliderThumbnailFlexItemFromUeRow(wrapper, index, total) {
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  const mediaCell = cells[1];
  const titleText = (cells[2]?.textContent || '').trim();
  const subtitleText = (cells[3]?.textContent || '').trim();
  const pctClass = rinvoqSliderThumbnailAdultsPercentageClass(subtitleText);
  const { href, anchor } = extractRinvoqSliderThumbnailLinkFromUeCells(cells);
  const displayTitle = rinvoqSliderThumbnailLinkDisplayTitle(titleText, subtitleText, anchor);

  const flexItem = document.createElement('div');
  flexItem.className = rinvoqSliderThumbnailFlexItemClass(index, total);

  const parbase = document.createElement('div');
  parbase.className = 'image-text-v2 parbase';

  const cardRoot = document.createElement('div');
  cardRoot.className = (
    `width-100-percent trigger1-slider${index + 1} thumbnail1-${index + 1} `
    + `image-text-clickable ${pctClass} abbv-image-text-v2 abbv-image-swap`
  );
  if (index === 0) cardRoot.classList.add('border-thumbnails-active');

  const imgWrap = document.createElement('div');
  imgWrap.className = 'abbv-image-content-container-v2';
  const picture = clonePictureFromRinvoqSliderThumbnailUeCell(mediaCell);
  if (picture) imgWrap.append(picture);

  const contentOuter = document.createElement('div');
  contentOuter.className = 'abbv-image-text-content-container-v2 bottom-left';

  const contentInner = document.createElement('div');
  contentInner.className = 'abbv-image-text-content-v2';

  const display = document.createElement('div');
  display.className = 'abbv-image-text-display-v2';

  const body = document.createElement('div');
  body.className = 'abbv-stretched-card-body';

  const txt = document.createElement('div');
  txt.className = 'abv-custom-txtcolor-white image-text-clickable__txtcontent';

  const titleP = document.createElement('p');
  titleP.className = 'mb-0 font-line-height-14px font-helveticaMedium';
  const titleB = document.createElement('b');
  titleB.className = 'h3 font-14px font-md-16px font-helveticaBold';
  titleB.textContent = titleText;
  titleP.append(titleB);

  const subP = document.createElement('p');
  subP.className = 'mb-0 font-md-16px';
  subP.textContent = subtitleText;

  txt.append(titleP);
  txt.append(subP);

  const link = document.createElement('a');
  link.className = 'abbv-button-primary abbv-image-text-link abbv-stretched-link';
  link.href = href;
  link.setAttribute('title', displayTitle);
  link.setAttribute('target', '_self');
  link.textContent = displayTitle;

  body.append(txt);
  body.append(link);
  display.append(body);
  contentInner.append(display);
  contentOuter.append(contentInner);
  cardRoot.append(imgWrap);
  cardRoot.append(contentOuter);
  parbase.append(cardRoot);
  flexItem.append(parbase);
  return flexItem;
}

function wireRinvoqSliderThumbnailSelection(block) {
  const row = block.querySelector(':scope .abbv-flex-container.slider-thumbnails.adults');
  if (!row) return;
  row.addEventListener('click', (ev) => {
    const card = ev.target.closest('.abbv-image-text-v2.image-text-clickable');
    if (!card || !row.contains(card)) return;
    ev.preventDefault();
    row.querySelectorAll('.abbv-image-text-v2.image-text-clickable').forEach((c) => {
      c.classList.remove('border-thumbnails-active');
    });
    card.classList.add('border-thumbnails-active');
  }, true);
}

function ensureRinvoqStatLineStrongTags(p, titlePattern = null) {
  if (!p || /<strong\b|<b\b/i.test(p.innerHTML)) return;

  // Split p's child nodes into runs at each <br> — no innerHTML writes.
  const runs = [];
  let run = [];
  [...p.childNodes].forEach((node) => {
    if (node.nodeName === 'BR') {
      runs.push(run);
      run = [];
    } else {
      run.push(node);
    }
  });
  runs.push(run);

  const frag = document.createDocumentFragment();
  runs.forEach((nodes, idx) => {
    if (idx > 0) frag.append(document.createElement('br'));
    if (nodes.length === 0) return;
    // plain is used only for pattern matching, not for rendering
    const plain = nodes.map((n) => n.textContent || '').join('').trim();
    if (!plain) return;
    const isTitle = titlePattern ? titlePattern.test(plain) : false;
    const isStat = /^\d+%\*/.test(plain) || /^\d+%\s*\(/.test(plain);
    if (isTitle || isStat) {
      const s = document.createElement('strong');
      nodes.forEach((n) => s.append(n.cloneNode(true)));
      frag.append(s);
    } else {
      nodes.forEach((n) => frag.append(n.cloneNode(true)));
    }
  });
  p.replaceChildren(frag);
}

function buildRinvoqCommonRichTextColumn(wrapper, columnIndex) {
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';

  const abbvRt = document.createElement('div');
  abbvRt.className = 'abbv-rich-text abbv-rich-text-common';

  let paragraphs = [...wrapper.querySelectorAll(':scope > p')];
  if (paragraphs.length === 0) {
    paragraphs = [...wrapper.querySelectorAll('p')];
  }

  const addSectionPadding = columnIndex === 0;

  if (paragraphs.length > 0) {
    paragraphs.forEach((srcP, pi) => {
      const p = srcP.cloneNode(true);
      if (addSectionPadding && pi === 0) {
        p.classList.add('section-padding-right');
      }
      fixEncodedSupInParagraph(p);
      ensureRinvoqStatLineStrongTags(p, /^MEASURE UP\s*\d/i);
      abbvRt.append(p);
    });
  } else {
    [...wrapper.cloneNode(true).childNodes].forEach((n) => abbvRt.append(n));
    abbvRt.querySelectorAll('p').forEach((p) => {
      fixEncodedSupInParagraph(p);
      ensureRinvoqStatLineStrongTags(p, /^MEASURE UP\s*\d/i);
    });
  }

  richTextOuter.append(abbvRt);
  return richTextOuter;
}

export default function decorate(block) {
  if (block.classList.contains('cards-grid-flex-row-cards')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    let introWrapper = null;
    let columnWrappers;
    if (wrappers[0]?.classList.contains('rinvoq-common-intro')) {
      [introWrapper, ...columnWrappers] = wrappers;
    } else {
      columnWrappers = wrappers;
    }
    if (columnWrappers.length === 0) return false;

    const outer = document.createElement('div');
    outer.className = 'flexboxitem-v2 parbase';

    const flexItem = document.createElement('div');
    flexItem.className = 'abbv-flex-item-v2';

    if (introWrapper) {
      flexItem.append(buildRinvoqCommonRichTextColumn(introWrapper, -1));
      introWrapper.remove();
    }

    const flexboxV2 = document.createElement('div');
    flexboxV2.className = 'flexbox-v2 parbase';

    const flexContainer = document.createElement('div');
    flexContainer.className = RINVOQ_COMMON_FLEX_CONTAINER_CLASS;

    columnWrappers.forEach((wrapper, index) => {
      flexContainer.append(buildRinvoqCommonRichTextColumn(wrapper, index));
      wrapper.remove();
    });

    flexboxV2.append(flexContainer);
    flexItem.append(flexboxV2);
    outer.append(flexItem);
    block.append(outer);
    return true;
  }

  if (block.classList.contains('cards-grid-slider-thumbnails')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const thumbRows = wrappers.filter((w) => isRinvoqSliderThumbnailUeRow(w));
    if (thumbRows.length === 0) return false;

    wrappers.forEach((w) => {
      w.remove();
    });

    const abbvContent = document.createElement('div');
    abbvContent.className = 'abbv-content';

    const flexRow = document.createElement('div');
    flexRow.className = (
      'abbv-flex-container pl-15 pr-15 pl-md-0 pr-md-0 m-auto max-width-400 '
      + 'max-width-md-540 max-width-lg-960 slider-thumbnails adults flex-wrap-wrap flex-direction-row'
    );

    const total = thumbRows.length;
    thumbRows.forEach((w, index) => {
      flexRow.append(buildRinvoqSliderThumbnailFlexItemFromUeRow(w, index, total));
    });

    abbvContent.append(flexRow);
    block.append(abbvContent);
    wireRinvoqSliderThumbnailSelection(block);
    return true;
  }

  return false;
}
