import { fixEncodedSupInParagraph } from '../cards-grid.js';

function fixLinzessEncodedBoldInParagraph(p) {
  if (!p) return;
  let html = p.innerHTML;
  if (!html.includes('&lt;')) return;
  html = html.replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/gi, (_, inner) => `<b>${inner.replace(/<[^>]+>/g, '')}</b>`);
  p.innerHTML = html;
}

function resolveLinzessCtaHref(linkCell) {
  if (!linkCell) return '#';
  const a = linkCell.querySelector('a[href]');
  const fromA = a?.getAttribute('href');
  if (fromA) {
    if (/^javascript:/i.test(fromA)) return '#';
    return fromA;
  }
  const raw = linkCell.textContent?.trim() || '';
  if (!raw) return '#';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^sms:/i.test(raw)) return raw;
  if (/^tel:/i.test(raw)) return raw;
  const smsDigits = raw.match(/^sms:?\s*(\d+)$/i);
  if (smsDigits) return `sms:${smsDigits[1]}`;
  return '#';
}

const LINZESS_FLEX_ITEM_CLASSES = [
  'abbv-flex-item-v2 background-light-purple rounded-corners text-align-center col-2-card icon-image-card',
  'abbv-flex-item-v2 background-dark-purple rounded-corners text-align-center col-2-card icon-image-card',
  'abbv-flex-item-v2 background-light-purple rounded-corners text-align-center col-2-card icon-image-card',
];

const LINZESS_IMAGE_TEXT_ROOT_CLASSES = [
  'abbv-image-text-v2 abbv-image-scale',
  'c-linz-white abbv-image-text-v2 abbv-image-scale',
  'abbv-image-text-v2 abbv-image-scale',
];

const LINZESS_HEADING_CLASS = ['heading-2 c-linz-dark-purple', 'heading-2', 'heading-2 c-linz-dark-purple'];

const LINZESS_BUTTON_CLASSES = [
  'abbv-icon-keyboard_arrow_right abbv-button-primary i-a abbv-button-primary',
  'abbv-icon-keyboard_arrow_right abbv-button-secondary i-a abbv-button-primary',
  'abbv-icon-keyboard_arrow_right abbv-button-primary i-a abbv-button-primary',
];

const LINZESS_FLEX_CONTAINER_CLASS = (
  'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards margin-top-80 savings-card-cards'
);

const LINZESS_ARTICLE_FLEX_CONTAINER_CLASS = (
  'abbv-flex-container-v2 flexbox-column-mobile flexbox-cards flexbox-article-cards '
  + 'article-flashcards resources-flexbox-column'
);

const LINZESS_ARTICLE_FLEX_ITEM_CLASS = 'abbv-flex-item-v2 background-light-purple rounded-corners';

function buildLinzessStatCardColumn(wrapper) {
  // cells: [0]=link (unused), [1]=image (optional icon), [2]=heading, [3]=body
  const directDivs = [...wrapper.children].filter((c) => c.tagName === 'DIV');
  const [, imageDiv, headingDiv, bodyDiv] = directDivs.length >= 4
    ? directDivs
    : [null, null, directDivs[0], directDivs[1]];

  const card = document.createElement('div');
  card.className = 'linz-stat-card';

  const picture = imageDiv?.querySelector('picture');
  const loneImg = imageDiv?.querySelector(':scope > img');
  if (picture || loneImg) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'linz-stat-card-icon';
    imgWrap.append(picture || loneImg);
    card.append(imgWrap);
  }

  const headingP = headingDiv?.querySelector('p') || headingDiv;
  const headingText = headingP?.textContent?.trim();
  if (headingText) {
    const h = document.createElement('p');
    h.className = 'linz-stat-card-heading';
    const strong = document.createElement('strong');
    strong.textContent = headingText;
    h.append(strong);
    card.append(h);
  }

  const body = document.createElement('div');
  body.className = 'linz-stat-card-body';
  if (bodyDiv) {
    [...bodyDiv.children].forEach((node) => {
      if (node.tagName === 'P' || node.tagName === 'UL' || node.tagName === 'OL') {
        const clone = node.cloneNode(true);
        if (clone.tagName === 'P') {
          fixLinzessEncodedBoldInParagraph(clone);
          fixEncodedSupInParagraph(clone);
        } else {
          clone.querySelectorAll('p').forEach((p) => {
            fixLinzessEncodedBoldInParagraph(p);
            fixEncodedSupInParagraph(p);
          });
        }
        body.append(clone);
      }
    });
  }
  card.append(body);

  return card;
}

function resolveLinzessArticleCta(ctaDiv) {
  if (!ctaDiv) return { href: '#', label: 'Read the article' };
  const a = ctaDiv.querySelector('a[href]');
  if (a) {
    const rawHref = a.getAttribute('href') || '';
    return {
      href: /^javascript:/i.test(rawHref) ? '#' : (rawHref || '#'),
      label: (a.textContent || '').trim() || 'Read the article',
    };
  }
  const href = resolveLinzessCtaHref(ctaDiv);
  const label = (ctaDiv.textContent || '').trim() || 'Read the article';
  return { href, label };
}

function buildLinzessArticleCardColumn(wrapper) {
  const directDivs = [...wrapper.children].filter((c) => c.tagName === 'DIV');
  let pictureDiv;
  let titleDiv;
  let bodyDiv;
  let ctaDiv;
  if (directDivs.length >= 5) {
    [, pictureDiv, titleDiv, bodyDiv, ctaDiv] = directDivs;
  } else {
    [pictureDiv, titleDiv, bodyDiv, ctaDiv] = directDivs;
  }

  const { href, label } = resolveLinzessArticleCta(ctaDiv);

  const col = document.createElement('div');
  col.className = 'flexboxitem-v2 parbase';

  const flexItem = document.createElement('div');
  flexItem.className = LINZESS_ARTICLE_FLEX_ITEM_CLASS;

  const imageTextParbase = document.createElement('div');
  imageTextParbase.className = 'image-text-v2 parbase';

  const rootImageText = document.createElement('div');
  rootImageText.className = 'abbv-image-text-v2 abbv-image-scale';

  const imgContainer = document.createElement('div');
  imgContainer.className = 'abbv-image-content-container-v2';

  if (pictureDiv) {
    const picture = pictureDiv.querySelector('picture');
    const loneImg = pictureDiv.querySelector(':scope > img');
    if (picture) {
      imgContainer.append(picture);
    } else if (loneImg) {
      imgContainer.append(loneImg);
    }
  }

  const outContainer = document.createElement('div');
  outContainer.className = 'abbv-image-text-content-container-v2 abbv-image-text-out';
  const contentV2 = document.createElement('div');
  contentV2.className = 'abbv-image-text-content-v2';
  const displayV2 = document.createElement('div');
  displayV2.className = 'abbv-image-text-display-v2';
  const bodyStretch = document.createElement('div');
  bodyStretch.className = 'abbv-stretched-card-body';

  const titleP = titleDiv?.querySelector('p');
  if (titleP) {
    const tp = document.createElement('p');
    tp.className = 'c-linz-dark-purple';
    const rawHtml = titleP.innerHTML?.trim() || '';
    const hasBoldTag = /<b\b|<strong\b/i.test(rawHtml) || rawHtml.includes('&lt;b');
    if (hasBoldTag) {
      [...titleP.cloneNode(true).childNodes].forEach((node) => tp.append(node));
    } else {
      const b = document.createElement('b');
      b.textContent = titleP.textContent?.trim() || '';
      tp.append(b);
    }
    fixLinzessEncodedBoldInParagraph(tp);
    fixEncodedSupInParagraph(tp);
    bodyStretch.append(tp);
  }

  if (bodyDiv) {
    bodyDiv.querySelectorAll(':scope > p').forEach((srcP) => {
      const bp = document.createElement('p');
      bp.className = srcP.className;
      [...srcP.cloneNode(true).childNodes].forEach((node) => bp.append(node));
      fixLinzessEncodedBoldInParagraph(bp);
      fixEncodedSupInParagraph(bp);
      bodyStretch.append(bp);
    });
  }

  const ctaA = document.createElement('a');
  ctaA.className = 'abbv-button-primary abbv-image-text-link';
  ctaA.href = href;
  ctaA.target = '_self';
  ctaA.title = label;
  ctaA.setAttribute('role', 'link');
  ctaA.setAttribute('aria-label', label);
  ctaA.textContent = label;
  bodyStretch.append(ctaA);

  displayV2.append(bodyStretch);
  contentV2.append(displayV2);
  outContainer.append(contentV2);
  rootImageText.append(imgContainer, outContainer);
  imageTextParbase.append(rootImageText);
  flexItem.append(imageTextParbase);
  col.append(flexItem);

  return col;
}

function buildLinzessIconImageCardColumn(wrapper, columnIndex) {
  const directDivs = [...wrapper.children].filter((c) => c.tagName === 'DIV');
  const linkCell = directDivs[0];
  const pictureDiv = directDivs[1];
  const titleDiv = directDivs[2];
  const bodyDiv = directDivs[3];
  const ctaDiv = directDivs[4];

  const href = resolveLinzessCtaHref(linkCell);
  const ctaP = ctaDiv?.querySelector('p');
  const ctaLabel = ctaP?.textContent?.trim() || 'Sign up';
  const titleP = titleDiv?.querySelector('p');
  const bodyP = bodyDiv?.querySelector('p');

  const linzIdx = columnIndex % LINZESS_FLEX_ITEM_CLASSES.length;
  const flexItemClass = LINZESS_FLEX_ITEM_CLASSES[linzIdx];
  const imageTextRootClass = LINZESS_IMAGE_TEXT_ROOT_CLASSES[linzIdx];
  const headingClass = LINZESS_HEADING_CLASS[linzIdx];
  const buttonClass = LINZESS_BUTTON_CLASSES[linzIdx];

  const col = document.createElement('div');
  col.className = 'flexboxitem-v2 parbase';

  const flexItem = document.createElement('div');
  flexItem.className = flexItemClass;

  const imageTextParbase = document.createElement('div');
  imageTextParbase.className = 'image-text-v2 parbase';

  const rootImageText = document.createElement('div');
  rootImageText.className = imageTextRootClass;

  const imgContainer = document.createElement('div');
  imgContainer.className = 'abbv-image-content-container-v2';

  if (pictureDiv) {
    const picture = pictureDiv.querySelector('picture');
    const loneImg = pictureDiv.querySelector(':scope > img');
    if (picture) {
      imgContainer.append(picture);
      const im = picture.querySelector('img');
      if (im && (!im.getAttribute('width') || !im.getAttribute('height'))) {
        im.setAttribute('width', '105');
        im.setAttribute('height', '105');
      }
    } else if (loneImg) {
      if (!loneImg.getAttribute('width') || !loneImg.getAttribute('height')) {
        loneImg.setAttribute('width', '105');
        loneImg.setAttribute('height', '105');
      }
      imgContainer.append(loneImg);
    }
  }

  const outContainer = document.createElement('div');
  outContainer.className = 'abbv-image-text-content-container-v2 abbv-image-text-out';
  const contentV2 = document.createElement('div');
  contentV2.className = 'abbv-image-text-content-v2';
  const displayV2 = document.createElement('div');
  displayV2.className = 'abbv-image-text-display-v2';
  const bodyStretch = document.createElement('div');
  bodyStretch.className = 'abbv-stretched-card-body';

  if (titleP) {
    const h = document.createElement('p');
    h.className = headingClass;
    h.classList.add('text-align-center');
    const titleText = titleP.textContent?.trim() || '';
    // Stat cards render a large leading number + smaller unit ("11.5 million").
    // Match live by wrapping the leading numeric token in a sized span.
    const statMatch = titleText.match(/^([\d.,]+)\s+(.+)$/);
    if (statMatch) {
      const [, statNumber, statUnit] = statMatch;
      const numSpan = document.createElement('span');
      numSpan.className = 'linz-stat-number';
      numSpan.textContent = statNumber;
      h.append(numSpan, document.createElement('br'), document.createTextNode(statUnit));
    } else {
      h.textContent = titleText;
    }
    bodyStretch.append(h);
  }

  if (bodyP) {
    const bp = document.createElement('p');
    bp.classList.add('text-align-center');
    [...bodyP.cloneNode(true).childNodes].forEach((node) => bp.append(node));
    fixLinzessEncodedBoldInParagraph(bp);
    fixEncodedSupInParagraph(bp);
    bodyStretch.append(bp);
  }

  displayV2.append(bodyStretch);
  contentV2.append(displayV2);
  outContainer.append(contentV2);
  rootImageText.append(imgContainer, outContainer);
  imageTextParbase.append(rootImageText);

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta parbase';
  const ctaA = document.createElement('a');
  ctaA.className = buttonClass;
  ctaA.setAttribute('role', 'link');
  ctaA.setAttribute('aria-label', ctaLabel);
  ctaA.href = href;
  ctaA.target = '_self';
  ctaA.textContent = ctaLabel;

  ctaWrap.append(ctaA);
  flexItem.append(imageTextParbase, ctaWrap);
  col.append(flexItem);

  return col;
}

export default function decorate(block) {
  if (block.classList.contains('cards-grid-stat-card')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    wrappers.forEach((wrapper) => {
      block.append(buildLinzessStatCardColumn(wrapper));
      wrapper.remove();
    });

    return true;
  }

  if (block.classList.contains('cards-grid-icon-image-card')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const demoWrap = document.createElement('div');
    demoWrap.className = 'demo-wrap';
    const flexboxV2 = document.createElement('div');
    flexboxV2.className = 'flexbox-v2 parbase';

    const flexContainer = document.createElement('div');
    flexContainer.className = LINZESS_FLEX_CONTAINER_CLASS;

    wrappers.forEach((wrapper, index) => {
      flexContainer.append(buildLinzessIconImageCardColumn(wrapper, index));
      wrapper.remove();
    });

    flexboxV2.append(flexContainer);
    demoWrap.append(flexboxV2);
    block.append(demoWrap);
    return true;
  }

  if (block.classList.contains('cards-grid-article-cards')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const demoWrap = document.createElement('div');
    demoWrap.className = 'demo-wrap';
    const flexboxV2 = document.createElement('div');
    flexboxV2.className = 'flexbox-v2 parbase';

    const flexContainer = document.createElement('div');
    flexContainer.className = LINZESS_ARTICLE_FLEX_CONTAINER_CLASS;

    wrappers.forEach((wrapper) => {
      flexContainer.append(buildLinzessArticleCardColumn(wrapper));
      wrapper.remove();
    });

    flexboxV2.append(flexContainer);
    demoWrap.append(flexboxV2);
    block.append(demoWrap);
    return true;
  }

  return false;
}
