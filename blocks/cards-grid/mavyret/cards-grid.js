import { fixEncodedSupInParagraph } from '../cards-grid.js';

const MAVYRET_FLEX_ICON_RICH_CLASS = 'abbv-rich-text stacking-copy abbv-rich-text-common';

function ensureMavyretSubheadAfterIcon(iconP) {
  let next = iconP.nextElementSibling;
  while (next && next.tagName === 'SCRIPT') {
    next = next.nextElementSibling;
  }
  if (!next) return;

  if (next.tagName === 'P') {
    if (!next.classList.contains('subhead')) {
      next.classList.add('subhead');
    }
    return;
  }

  if (next.tagName !== 'DIV') return;

  const scopedPs = [...next.querySelectorAll(':scope > p')];
  const plain = (next.textContent || '').trim();
  if (!plain) return;

  const sub = document.createElement('p');
  sub.className = 'subhead';
  const sourceEl = scopedPs.length >= 1 ? scopedPs[0] : next;
  [...sourceEl.cloneNode(true).childNodes].forEach((n) => sub.append(n));
  next.replaceWith(sub);
}

function isMavyretCellIconDiv(el) {
  if (!el || el.tagName !== 'DIV') return false;
  const hasMedia = el.querySelector(':scope > picture, :scope > img');
  if (!hasMedia) return false;
  return !el.querySelector(':scope > p');
}

function normalizeMavyretFromTableCellRows(abbvRt) {
  const kids = [...abbvRt.children];
  if (!kids.some(isMavyretCellIconDiv)) return false;

  const iconIdx = kids.findIndex(isMavyretCellIconDiv);
  const iconDiv = kids[iconIdx];
  const legacyImg = iconDiv.querySelector('picture img') || iconDiv.querySelector('img');
  if (!legacyImg) return false;

  const src = (legacyImg.getAttribute('src') || legacyImg.currentSrc || '').trim();
  const alt = (legacyImg.getAttribute('alt') || '').trim();

  const iconP = document.createElement('p');
  iconP.className = 'text-center';
  if (src) {
    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.className = 'icon';
    imgEl.setAttribute('loading', 'lazy');
    if (alt) {
      imgEl.setAttribute('alt', alt);
    }
    const w = legacyImg.getAttribute('width');
    const h = legacyImg.getAttribute('height');
    if (w) imgEl.setAttribute('width', w);
    if (h) imgEl.setAttribute('height', h);
    iconP.append(imgEl);
  }

  const built = [iconP];
  let titleDone = false;

  for (let i = iconIdx + 1; i < kids.length; i += 1) {
    const el = kids[i];
    if (el.tagName === 'DIV') {
      const ulEl = el.querySelector(':scope > ul');
      if (ulEl) {
        ulEl.remove();
        built.push(ulEl);
        break;
      }

      const scopedPs = [...el.querySelectorAll(':scope > p')];
      const plain = (el.textContent || '').trim();
      if (plain || scopedPs.length > 0) {
        if (!titleDone) {
          const sub = document.createElement('p');
          sub.className = 'subhead';
          if (scopedPs.length >= 1) {
            [...scopedPs[0].cloneNode(true).childNodes].forEach((n) => sub.append(n));
          } else {
            sub.textContent = plain;
          }
          built.push(sub);
          for (let j = 1; j < scopedPs.length; j += 1) {
            built.push(scopedPs[j].cloneNode(true));
          }
          titleDone = true;
        } else {
          scopedPs.forEach((srcP) => {
            built.push(srcP.cloneNode(true));
          });
          if (scopedPs.length === 0 && plain) {
            const p = document.createElement('p');
            p.textContent = plain;
            built.push(p);
          }
        }
      }
    }
  }

  abbvRt.replaceChildren(...built);
  return true;
}

function normalizeMavyretFromIconParagraph(abbvRt) {
  const ps = [...abbvRt.querySelectorAll('p')];
  const idx = ps.findIndex((p) => p.querySelector('img'));
  if (idx < 0) return;

  const iconP = ps[idx];
  iconP.className = 'text-center';

  const legacyImg = iconP.querySelector('picture img') || iconP.querySelector('img');
  if (!legacyImg) return;

  const src = (legacyImg.getAttribute('src') || legacyImg.currentSrc || '').trim();
  const alt = (legacyImg.getAttribute('alt') || '').trim();

  if (src) {
    iconP.replaceChildren();
    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.className = 'icon';
    imgEl.setAttribute('loading', 'lazy');
    if (alt) {
      imgEl.setAttribute('alt', alt);
    }
    iconP.append(imgEl);
  } else {
    legacyImg.classList.add('icon');
    if (!legacyImg.getAttribute('loading')) {
      legacyImg.setAttribute('loading', 'lazy');
    }
  }

  ensureMavyretSubheadAfterIcon(iconP);
}

function normalizeMavyretStackingCopyDom(abbvRt) {
  if (normalizeMavyretFromTableCellRows(abbvRt)) {
    return;
  }
  normalizeMavyretFromIconParagraph(abbvRt);
}

function buildMavyretFlexIconColumn(wrapper) {
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';

  const abbvRt = document.createElement('div');
  abbvRt.className = MAVYRET_FLEX_ICON_RICH_CLASS;

  const existingRt = wrapper.querySelector(':scope > .abbv-rich-text');
  if (existingRt) {
    [...existingRt.cloneNode(true).childNodes].forEach((n) => abbvRt.append(n));
  } else {
    while (wrapper.firstChild) {
      abbvRt.append(wrapper.firstChild);
    }
  }

  abbvRt.querySelectorAll('p').forEach((p) => {
    fixEncodedSupInParagraph(p);
  });

  normalizeMavyretStackingCopyDom(abbvRt);

  abbvRt.querySelectorAll('p').forEach((p) => {
    fixEncodedSupInParagraph(p);
  });

  richTextOuter.append(abbvRt);
  return richTextOuter;
}

function finalizeMavyretCtaAnchorFromUe(a) {
  if (!a || a.tagName !== 'A') return;
  if (!a.getAttribute('role')) {
    a.setAttribute('role', 'link');
  }
  a.setAttribute('aria-hidden', 'false');
  const href = (a.getAttribute('href') || '').trim();
  const isTel = /^tel:/i.test(href);
  if (isTel) {
    a.className = 'abbv-button-plain cta--phone';
    if (!a.hasAttribute('data-linktype')) {
      a.setAttribute('data-linktype', 'internal');
    }
    if (!a.hasAttribute('target')) {
      a.setAttribute('target', '_self');
    }
    return;
  }
  a.className = 'abbv-icon-keyboard_arrow_right abbv-button-primary i-a';
  const isHttp = /^https?:\/\//i.test(href);
  const isPdf = /\.pdf(\?|$)/i.test(href);
  if (!a.hasAttribute('data-linktype')) {
    if (isPdf) {
      a.setAttribute('data-linktype', 'download');
    } else if (isHttp) {
      a.setAttribute('data-linktype', 'external');
    } else if (href.startsWith('/')) {
      a.setAttribute('data-linktype', 'internal');
    }
  }
  if (!a.hasAttribute('target')) {
    if (isHttp || isPdf) {
      a.setAttribute('target', '_blank');
    } else {
      a.setAttribute('target', '_self');
    }
  }
  const lab = (a.textContent || '').trim();
  const opensNew = (a.getAttribute('target') || '').toLowerCase() === '_blank';
  if (lab && !a.getAttribute('aria-label')) {
    a.setAttribute('aria-label', opensNew ? `${lab}, Opens in a new window` : lab);
  }
}

function applyMavyretBodySup(p) {
  if (!p) return;
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let n = walker.nextNode();
  while (n) { textNodes.push(n); n = walker.nextNode(); }
  for (let i = textNodes.length - 1; i >= 0; i -= 1) {
    const textNode = textNodes[i];
    const val = textNode.nodeValue || '';
    const match = /^([\s\S]*?)\s*\|\s*1\s*$/i.exec(val);
    if (match) {
      const sup = document.createElement('sup');
      sup.textContent = '1';
      const [, before] = match;
      if (before) {
        textNode.nodeValue = before;
        textNode.parentNode.insertBefore(sup, textNode.nextSibling);
      } else {
        textNode.replaceWith(sup);
      }
      break;
    }
  }
}

function isMavyretSectionCardUeRow(wrapper) {
  if (!wrapper || wrapper.tagName !== 'DIV') return false;
  const firstCell = wrapper.querySelector(':scope > div');
  if (!firstCell) return false;
  return !!firstCell.querySelector('a[href]');
}

function buildMavyretSectionIntroFromWrapper(wrapper) {
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';
  const abbvRt = document.createElement('div');
  abbvRt.className = (
    'abbv-rich-text section-narrow color-white text-center section-break-bottom '
    + 'abbv-rich-text-common'
  );
  [...wrapper.cloneNode(true).childNodes].forEach((n) => abbvRt.append(n));
  abbvRt.querySelectorAll('p').forEach((p) => {
    fixEncodedSupInParagraph(p);
  });
  richTextOuter.append(abbvRt);
  return richTextOuter;
}

function buildMavyretSectionCardColumnFromUeRow(wrapper) {
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  const linkEl = cells[0]?.querySelector('a[href]') || wrapper.querySelector('a[href]');
  let href = (linkEl?.getAttribute('href') || '').trim();
  if (!href || /^javascript:/i.test(href)) href = '#';

  const ctaP = cells[3]?.querySelector(':scope > p');
  let ctaLabel = (ctaP?.textContent || cells[3]?.textContent || '').trim();
  if (!ctaLabel) {
    ctaLabel = (linkEl?.textContent || '').trim() || 'Learn more';
  }

  const containerParbase = document.createElement('div');
  containerParbase.className = 'container parbase';
  const abbvInner = document.createElement('div');
  abbvInner.className = 'abbv-container cta--card';
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';
  const abbvRt = document.createElement('div');
  abbvRt.className = 'abbv-rich-text abbv-rich-text-common';

  const bodyCell = cells[2];
  if (bodyCell) {
    const bodyPs = [...bodyCell.querySelectorAll(':scope > p')];
    if (bodyPs.length > 0) {
      bodyPs.forEach((srcP) => {
        const p = srcP.cloneNode(true);
        applyMavyretBodySup(p);
        fixEncodedSupInParagraph(p);
        abbvRt.append(p);
      });
    } else {
      const kids = [...bodyCell.children];
      if (kids.length > 0) {
        kids.forEach((k) => {
          abbvRt.append(k.cloneNode(true));
        });
      } else {
        const p = document.createElement('p');
        [...bodyCell.cloneNode(true).childNodes].forEach((node) => p.append(node));
        applyMavyretBodySup(p);
        abbvRt.append(p);
      }
    }
  }

  abbvRt.querySelectorAll('p').forEach((p) => {
    fixEncodedSupInParagraph(p);
  });

  richTextOuter.append(abbvRt);
  abbvInner.append(richTextOuter);

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta parbase';
  const ctaA = document.createElement('a');
  ctaA.href = href;
  ctaA.textContent = ctaLabel;
  finalizeMavyretCtaAnchorFromUe(ctaA);
  ctaWrap.append(ctaA);
  abbvInner.append(ctaWrap);

  containerParbase.append(abbvInner);
  return containerParbase;
}

function buildMavyretCtaCardsColumnFromUeRow(wrapper) {
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  const linkEl = cells[0]?.querySelector('a[href]') || wrapper.querySelector('a[href]');
  let href = (linkEl?.getAttribute('href') || '').trim();
  if (!href || /^javascript:/i.test(href)) href = '#';

  const iconCell = cells.find((c, idx) => idx > 0 && c.querySelector('picture, img')) || cells[1];
  const titleText = (cells[2]?.textContent || '').trim();
  const bodyText = (cells[3]?.textContent || '').trim();
  let ctaLabel = (cells[4]?.textContent || '').trim();
  if (!ctaLabel) {
    ctaLabel = (linkEl?.textContent || '').trim() || 'Learn more';
  }

  const containerParbase = document.createElement('div');
  containerParbase.className = 'container parbase';
  const abbvInner = document.createElement('div');
  abbvInner.className = 'abbv-container';
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';
  const abbvRt = document.createElement('div');
  abbvRt.className = MAVYRET_FLEX_ICON_RICH_CLASS;

  const iconP = document.createElement('p');
  iconP.className = 'center';
  const pic = iconCell?.querySelector(':scope picture');
  const loneImg = iconCell?.querySelector(':scope > img');
  if (pic) {
    const picClone = pic.cloneNode(true);
    iconP.append(picClone);
    const im = iconP.querySelector('img');
    if (im) {
      im.classList.add('icon');
      if (!im.getAttribute('loading')) im.setAttribute('loading', 'lazy');
    }
  } else if (loneImg) {
    const legacyImg = loneImg;
    const src = (legacyImg.getAttribute('src') || legacyImg.currentSrc || '').trim();
    const alt = (legacyImg.getAttribute('alt') || '').trim();
    if (src) {
      const imgEl = document.createElement('img');
      imgEl.src = src;
      imgEl.className = 'icon';
      imgEl.setAttribute('loading', 'lazy');
      if (alt) imgEl.setAttribute('alt', alt);
      ['width', 'height'].forEach((attr) => {
        const v = legacyImg.getAttribute(attr);
        if (v) imgEl.setAttribute(attr, v);
      });
      iconP.append(imgEl);
    }
  }
  abbvRt.append(iconP);

  const sub = document.createElement('p');
  sub.className = 'subhead';
  sub.textContent = titleText;
  abbvRt.append(sub);

  if (bodyText) {
    const bp = document.createElement('p');
    bp.textContent = bodyText;
    abbvRt.append(bp);
  }

  abbvRt.querySelectorAll('p').forEach((p) => {
    fixEncodedSupInParagraph(p);
  });

  richTextOuter.append(abbvRt);
  abbvInner.append(richTextOuter);

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta parbase';
  const ctaA = document.createElement('a');
  ctaA.href = href;
  ctaA.textContent = ctaLabel;
  finalizeMavyretCtaAnchorFromUe(ctaA);
  ctaWrap.append(ctaA);
  abbvInner.append(ctaWrap);

  containerParbase.append(abbvInner);
  return containerParbase;
}

export default function decorate(block) {
  if (block.classList.contains('cards-grid-icon-flex-cards')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const outer = document.createElement('div');
    outer.className = 'abbv-container flex-icon';

    wrappers.forEach((wrapper) => {
      outer.append(buildMavyretFlexIconColumn(wrapper));
      wrapper.remove();
    });

    const demoWrap = document.createElement('div');
    demoWrap.className = 'demo-wrap';
    demoWrap.append(outer);
    block.append(demoWrap);
    return true;
  }

  if (block.classList.contains('cards-grid-cta-cards-stacked')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const outer = document.createElement('div');
    outer.className = 'abbv-container flex-icon text-center flex-icon__cta-at-bottom';

    wrappers.forEach((w) => {
      outer.append(buildMavyretCtaCardsColumnFromUeRow(w));
      w.remove();
    });

    const demoWrap = document.createElement('div');
    demoWrap.className = 'demo-wrap';
    demoWrap.append(outer);
    block.append(demoWrap);
    return true;
  }

  if (block.classList.contains('cards-grid-section-cards')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    let cardStart = 0;
    let introEl = null;
    if (wrappers.length > 0 && !isMavyretSectionCardUeRow(wrappers[0])) {
      introEl = buildMavyretSectionIntroFromWrapper(wrappers[0]);
      cardStart = 1;
    }

    const cardCols = [];
    for (let i = cardStart; i < wrappers.length; i += 1) {
      if (isMavyretSectionCardUeRow(wrappers[i])) {
        cardCols.push(buildMavyretSectionCardColumnFromUeRow(wrappers[i]));
      }
    }
    if (cardCols.length === 0) return false;

    wrappers.forEach((w) => {
      w.remove();
    });

    if (introEl) block.append(introEl);

    const flexEven = document.createElement('div');
    flexEven.className = 'abbv-container flex-even section';
    cardCols.forEach((col) => {
      flexEven.append(col);
    });
    block.append(flexEven);
    return true;
  }

  return false;
}
