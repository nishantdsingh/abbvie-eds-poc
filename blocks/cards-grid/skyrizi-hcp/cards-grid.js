import { fixEncodedSupInParagraph } from '../cards-grid.js';

const IMAGE_TEXT_IMG_CLASSES = [
  'abbv-image-text-img abbv-image-text-v1-1700201083-large',
  'abbv-image-text-img abbv-image-text-v1-880735932-large',
  'abbv-image-text-img abbv-image-text-v1-1752480423-large',
];

const IMAGE_TEXT_TITLE_CLASSES = [
  'abbv-rich-text h1 mb2 tc fs-20 fs-26-md abbv-rich-text-common',
  'abbv-rich-text h1 mb2 tc tc-sm fs-20 fs-26-md abbv-rich-text-common',
  'abbv-rich-text h1 mb2 tc fs-20 fs-26-md abbv-rich-text-common',
];

const IMAGE_TEXT_BODY_CLASSES = [
  'abbv-rich-text tc pl4-sm pr4-sm fs-16 fs-22-md abbv-rich-text-common',
  'abbv-rich-text tc tc-sm pl4-sm pr4-sm fs-16 fs-22-md abbv-rich-text-common',
  'abbv-rich-text tc pl4-sm pr4-sm fs-16 fs-22-md abbv-rich-text-common',
];

function buildImageTextColumn(wrapper, columnIndex) {
  const directDivs = [...wrapper.children].filter((c) => c.tagName === 'DIV');
  const pictureDiv = directDivs.find((d) => d.querySelector('picture, img'));
  const picIdx = pictureDiv ? directDivs.indexOf(pictureDiv) : -1;
  const titleDiv = picIdx >= 0 ? directDivs[picIdx + 1] : null;
  const bodyDiv = picIdx >= 0 ? directDivs[picIdx + 2] : null;

  const imgClass = IMAGE_TEXT_IMG_CLASSES[columnIndex % IMAGE_TEXT_IMG_CLASSES.length];
  const titleClass = IMAGE_TEXT_TITLE_CLASSES[columnIndex % IMAGE_TEXT_TITLE_CLASSES.length];
  const bodyClass = IMAGE_TEXT_BODY_CLASSES[columnIndex % IMAGE_TEXT_BODY_CLASSES.length];

  const col = document.createElement('div');
  col.className = 'abbv-col abbv-col-4';

  const outerContainer = document.createElement('div');
  outerContainer.className = 'container parbase';
  const outerAbbv = document.createElement('div');
  outerAbbv.className = 'abbv-container';

  const imageTextParbase = document.createElement('div');
  imageTextParbase.className = 'image-text parbase';
  const abbvImageText = document.createElement('div');
  abbvImageText.className = 'abbv-image-text abbv-image-text--icon tc mr3 mr0-sm mb3';
  const imgWrap = document.createElement('div');
  imgWrap.className = 'abbv-image-content-container i-b';

  if (pictureDiv) {
    const picture = pictureDiv.querySelector('picture');
    const loneImg = pictureDiv.querySelector(':scope > img');
    if (picture) {
      imgWrap.append(picture);
      const im = picture.querySelector('img');
      if (im) {
        im.className = imgClass;
        if (!im.getAttribute('width') || !im.getAttribute('height')) {
          im.setAttribute('width', '70');
          im.setAttribute('height', '70');
        }
      }
    } else if (loneImg) {
      loneImg.className = imgClass;
      if (!loneImg.getAttribute('width') || !loneImg.getAttribute('height')) {
        loneImg.setAttribute('width', '70');
        loneImg.setAttribute('height', '70');
      }
      imgWrap.append(loneImg);
    }
  }

  abbvImageText.append(imgWrap);
  imageTextParbase.append(abbvImageText);
  outerAbbv.append(imageTextParbase);

  const innerContainer = document.createElement('div');
  innerContainer.className = 'container parbase';
  const innerAbbv = document.createElement('div');
  innerAbbv.className = 'abbv-container';

  const richTitle = document.createElement('div');
  richTitle.className = 'rich-text';
  const titleRt = document.createElement('div');
  titleRt.className = titleClass;
  const titleP = titleDiv?.querySelector('p');
  if (titleP) {
    titleRt.append(titleP);
  }

  const richBody = document.createElement('div');
  richBody.className = 'rich-text';
  const bodyRt = document.createElement('div');
  bodyRt.className = bodyClass;
  const bodyP = bodyDiv?.querySelector('p');
  if (bodyP) {
    fixEncodedSupInParagraph(bodyP);
    bodyRt.append(bodyP);
  }

  richTitle.append(titleRt);
  richBody.append(bodyRt);
  innerAbbv.append(richTitle, richBody);
  innerContainer.append(innerAbbv);
  outerAbbv.append(innerContainer);
  outerContainer.append(outerAbbv);
  col.append(outerContainer);

  return col;
}

export default function decorate(block) {
  if (block.classList.contains('cards-grid-image-text')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    block.classList.add('abbv-row-container', 'mb5-sm', 'access-enroll-container');

    const row = document.createElement('div');
    row.className = 'abbv-row abbv-row-flush';

    wrappers.forEach((wrapper, index) => {
      row.append(buildImageTextColumn(wrapper, index));
      wrapper.remove();
    });

    block.append(row);
    return true;
  }
  return false;
}
