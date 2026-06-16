import { getConfigValue } from '../../scripts/config.js';
import { isUniversalEditor } from '../../scripts/utils.js';

function addSectionClasses(block, section) {
  if (!section) return;
  if (section.classList.contains('navy-overlap') && section.classList.contains('hero-container')) {
    section.classList.add('hero-navy');
  }
  if (section.classList.contains('hero-container') && block.classList.contains('profile')) {
    section.classList.add('hero-profile-section');
  }
  if (section.classList.contains('hero-container') && block.classList.contains('landing')) {
    section.classList.add('hero-landing-section');
  }
}

function isVideoHref(href) {
  return (
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(href)
    || (/\/content\/dam\//i.test(href) && !/\.(jpg|jpeg|png|gif|webp|svg|pdf|html)(\?.*)?$/i.test(href))
  );
}

function extractRows(block) {
  const rows = Array.from(block.children);

  const videoRow = rows.find((row) => {
    const link = row.firstElementChild?.querySelector('a[href]');
    return link && isVideoHref(link.href);
  });

  const imageRow = rows[0];

  const textRow = rows.slice(1).find((row) => {
    if (row === videoRow) return false;
    const cell = row.firstElementChild;
    return cell?.querySelector('h1,h2,h3,h4,h5,h6') || cell?.querySelector('a[href]');
  });

  const mobileImageRow = rows.slice(1).find((row) => {
    if (row === textRow || row === videoRow) return false;
    return row.firstElementChild?.querySelector('picture,img');
  });

  // Indication row: richtext (p/strong) with no heading, link, or image — ISI header box
  const indicationRow = rows.slice(1).find((row) => {
    if (row === textRow || row === videoRow || row === mobileImageRow) return false;
    const cell = row.firstElementChild;
    return cell?.querySelector('p,strong,em') && !cell.querySelector('h1,h2,h3,h4,h5,h6,picture,img,a[href]');
  });

  // Caption row: plain text with no markup — e.g. "Actor portrayal."
  const captionRow = rows.slice(1).find((row) => {
    if (row === textRow || row === videoRow
      || row === mobileImageRow || row === indicationRow) return false;
    const cell = row.firstElementChild;
    const text = cell?.textContent?.trim();
    return text && !cell.querySelector('picture,img,a,h1,h2,h3,h4,h5,h6');
  });

  return {
    imageRow, textRow, videoRow, mobileImageRow, indicationRow, captionRow,
  };
}

function absorbBreadcrumb(textCell, section) {
  if (!section || !textCell) return;
  let breadcrumbWrapper = section.querySelector('.breadcrumb-wrapper');
  if (!breadcrumbWrapper) {
    const prev = section.previousElementSibling;
    if (prev?.classList.contains('section')) {
      breadcrumbWrapper = prev.querySelector('.breadcrumb-wrapper');
    }
  }
  if (!breadcrumbWrapper) return;
  const breadcrumbBlock = breadcrumbWrapper.querySelector('.breadcrumb');
  if (!breadcrumbBlock) return;
  textCell.prepend(breadcrumbBlock);
  breadcrumbWrapper.remove();
  const prev = section.previousElementSibling;
  if (prev?.classList.contains('section') && !prev.children.length) prev.remove();
}

function detectEyebrow(textCell) {
  if (!textCell) return;
  const firstP = textCell.querySelector('p:first-child');
  if (!firstP || firstP.querySelector('a') || firstP.querySelector('img')) return;
  const next = firstP.nextElementSibling;
  if (next?.tagName === 'H1' || next?.tagName === 'H2') {
    firstP.classList.add('hero-eyebrow');
  }
}

function mergeMobileImage(imageCell, mobileImageRow) {
  if (!imageCell) return;
  let desktopPicture = null;
  let mobilePicture = null;

  const inlinePics = imageCell.querySelectorAll('picture');
  if (inlinePics.length >= 2) {
    [desktopPicture, mobilePicture] = inlinePics;
  } else if (mobileImageRow) {
    desktopPicture = imageCell.querySelector('picture');
    mobilePicture = mobileImageRow.firstElementChild?.querySelector('picture');
  }

  if (!desktopPicture || !mobilePicture) return;
  const desktopImg = desktopPicture.querySelector('img');
  const mobileImg = mobilePicture.querySelector('img');
  if (!desktopImg || !mobileImg) return;

  const combined = document.createElement('picture');
  const source = document.createElement('source');
  source.media = '(min-width: 744px)';
  source.srcset = desktopImg.src;
  combined.appendChild(source);
  combined.appendChild(mobileImg.cloneNode(true));
  desktopPicture.replaceWith(combined);
  if (mobileImageRow) mobileImageRow.remove();
  else mobilePicture.closest('div')?.remove();
}

function promoteImageLink(imageCell) {
  if (!imageCell || imageCell.querySelector('img')) return;
  const link = imageCell.querySelector('a[href]');
  if (!link?.href) return;
  const img = document.createElement('img');
  img.src = link.href;
  img.alt = link.title || link.textContent || '';
  (link.closest('.button-container') || link.closest('p') || link).replaceWith(img);
}

function createIndication(indicationRow) {
  if (!indicationRow) return null;
  const cell = indicationRow.firstElementChild;
  if (!cell || !cell.childNodes.length) {
    indicationRow.remove();
    return null;
  }
  indicationRow.remove();
  const banner = document.createElement('div');
  banner.classList.add('hero-indication');
  // Use node-cloning instead of innerHTML to avoid XSS risk from CMS-authored content
  [...cell.childNodes].forEach((n) => banner.appendChild(n.cloneNode(true)));
  return banner;
}

function createCaption(captionRow) {
  if (!captionRow) return null;
  const text = captionRow.firstElementChild?.textContent?.trim();
  captionRow.remove();
  if (!text) return null;
  const caption = document.createElement('span');
  caption.classList.add('hero-image-caption');
  caption.textContent = text;
  return caption;
}

function wrapContent(block, textContainer, indication, caption) {
  if (!textContainer) return null;

  const wrapper = document.createElement('div');
  wrapper.classList.add('hero-content-stack');
  textContainer.replaceWith(wrapper);

  if (caption) wrapper.append(caption);
  if (indication) wrapper.append(indication);

  wrapper.append(textContainer);
  if (block.classList.contains('full')) wrapper.classList.add('hero-content-stack-full');

  return wrapper;
}

function injectFloatingContent(block, imageCell, indicationRow, captionRow) {
  const indication = createIndication(indicationRow);
  const caption = createCaption(captionRow);

  if (indication) block.append(indication);
  if (caption && imageCell) imageCell.append(caption);
}

function absorbPressReleases(section, textCell) {
  if (!textCell) return;
  const wrapper = section?.querySelector('.press-releases-wrapper');
  if (!wrapper) return;
  const pressBlock = wrapper.querySelector('.press-releases');
  if (!pressBlock) return;
  const container = document.createElement('div');
  container.classList.add('hero-press-releases-container');
  container.appendChild(pressBlock);
  textCell.appendChild(container);
  wrapper.remove();
}

// WeakMap avoids dangling-underscore ESLint violations and does not prevent GC.
const multilayerControllers = new WeakMap();

function initMultilayer(imageCell) {
  if (!imageCell) return;
  const layers = [...imageCell.children].filter((el) => el.dataset.buddyState);
  if (!layers.length) return;
  layers.forEach((layer) => layer.classList.add('hero-layer'));
  layers[0].classList.add('is-active');

  // Abort any previous listener registered on this element to prevent accumulation
  // when two or more multilayer hero blocks exist on the same page.
  if (multilayerControllers.has(imageCell)) {
    multilayerControllers.get(imageCell).abort();
  }
  const controller = new AbortController();
  multilayerControllers.set(imageCell, controller);

  document.addEventListener('abbv:buddy:stateChange', (e) => {
    const { state } = e.detail || {};
    if (!state) return;
    layers.forEach((layer) => {
      layer.classList.toggle('is-active', layer.dataset.buddyState === state);
    });
  }, { signal: controller.signal });
}

async function initVideo(videoRow, imageCell, block) {
  if (!videoRow) return;
  const link = videoRow.firstElementChild?.querySelector('a[href]');
  const videoSrc = link?.href;

  // Guard: if no valid video href is found, remove the empty row and bail out.
  if (!videoSrc) {
    videoRow.remove();
    return;
  }

  // In the Universal Editor (authoring environment) use the video src as-is.
  // Otherwise, resolve the publish URL from project config. If no config value
  // is present we cannot safely construct an absolute URL — skip video creation
  // rather than silently pointing at a wrong or decommissioned host.
  let videoURL;
  const authorMode = isUniversalEditor();
  if (authorMode) {
    videoURL = videoSrc;
  } else {
    const aemPublishUrl = await getConfigValue('aemPublishUrl');
    if (!aemPublishUrl) {
      videoRow.remove();
      return;
    }
    const splitedURL = videoSrc.split('/content');
    splitedURL[0] = aemPublishUrl;
    videoURL = splitedURL.join('/content');
  }
  videoRow.remove();

  const container = document.createElement('div');
  container.classList.add('hero-video-bg');

  const video = document.createElement('video');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');

  const source = document.createElement('source');
  source.src = videoURL;
  source.type = /\.webm(\?.*)?$/i.test(videoURL) ? 'video/webm' : 'video/mp4';
  video.appendChild(source);
  container.appendChild(video);
  (imageCell || block.querySelector('div')).appendChild(container);
}

export default async function decorate(block) {
  const section = block.closest('.section');
  addSectionClasses(block, section);

  const {
    imageRow, textRow, videoRow, mobileImageRow, indicationRow, captionRow,
  } = extractRows(block);
  const imageCell = imageRow?.firstElementChild;
  const textCell = textRow?.firstElementChild;
  const textContainer = textCell?.parentElement;

  if (textCell) {
    textContainer.classList.add('hero-text-container');
    textCell.classList.add('cmp-container-x-large');

    // Brand-agnostic: any variation ending in 'editorial-hero' moves the third row's
    // <p> into the text cell (e.g. the Linzess behind-nav editorial-hero layout).
    const isEditorialHero = [...block.classList].some((c) => c.endsWith('editorial-hero'));
    if (isEditorialHero) {
      const thirdRow = Array.from(block.children)[2];
      const p = thirdRow?.querySelector('p');
      if (p) textCell.prepend(p);
    }
  }

  absorbBreadcrumb(textCell, section);
  detectEyebrow(textCell);
  mergeMobileImage(imageCell, mobileImageRow);
  promoteImageLink(imageCell);
  if (block.classList.contains('full')) {
    const indication = createIndication(indicationRow);
    const caption = indication ? createCaption(captionRow) : null;
    wrapContent(block, textContainer, indication, caption);
    if (captionRow && !indication) injectFloatingContent(block, imageCell, null, captionRow);
  } else if ([...block.classList].some((c) => c.endsWith('data-hero'))) {
    // Brand-agnostic: any variation ending in 'data-hero' injects indication and caption
    // as floating elements (e.g. the Mavyret data-hero layout).
    injectFloatingContent(block, imageCell, indicationRow, captionRow);
  } else {
    injectFloatingContent(block, imageCell, null, captionRow || indicationRow);
  }

  if (block.classList.contains('landing')) absorbPressReleases(section, textCell);
  if (block.classList.contains('multilayer')) initMultilayer(imageCell);
  if (block.classList.contains('video')) await initVideo(videoRow, imageCell, block);
}
