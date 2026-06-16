import { renderBlock } from '../../scripts/multi-theme.js';

const SAFE_HREF_RE = /^(https?:\/\/|\/|#|tel:|sms:|mailto:)/i;

const LINE1_CLASS = 'card-grid-item-line-1';
const LINE2_CLASS = 'card-grid-item-line-2';
const LINE3_CLASS = 'card-grid-item-line-3';
const LINE4_CLASS = 'card-grid-item-line-4';
const RISA_CLASS = 'card-grid-item-risa-pri';

function decorateLine1(card) {
  if (!card) return;
  const firstDiv = card.firstElementChild;
  if (firstDiv?.tagName !== 'DIV') return;
  const span = document.createElement('span');
  span.className = LINE1_CLASS;
  while (firstDiv.firstChild) {
    span.append(firstDiv.firstChild);
  }
  firstDiv.replaceWith(span);

  const innerP = span.querySelector('p');
  if (!innerP) return;

  const raw = innerP.textContent.trim();
  if (raw.includes('|')) {
    const segments = raw.split('|').map((s) => s.trim()).filter((s) => s.length > 0);
    const left = segments[0];
    const right = segments.slice(1).join(' ');
    innerP.remove();
    const risa = document.createElement('span');
    risa.className = RISA_CLASS;
    risa.textContent = left;
    span.append(risa);
    if (right) {
      span.append(document.createTextNode(` ${right}`));
    }
    return;
  }

  const innerSpan = document.createElement('span');
  innerSpan.className = RISA_CLASS;
  while (innerP.firstChild) {
    innerSpan.append(innerP.firstChild);
  }
  innerP.replaceWith(innerSpan);
}

/** Unwrap a single direct child `<p>` inside a line span (UE column markup). */
function unwrapDirectParagraph(span) {
  const lineP = span.querySelector(':scope > p');
  if (!lineP) return;
  while (lineP.firstChild) {
    span.insertBefore(lineP.firstChild, lineP);
  }
  lineP.remove();
}

function splitIndicationItems(span) {
  const frag = document.createDocumentFragment();
  const children = [...span.childNodes];
  let i = 0;
  while (i < children.length) {
    const node = children[i];
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
      const link = node.querySelector(':scope > a');
      if (link) {
        const textAfter = node.textContent.replace(link.textContent, '').replace(/^\s*[—–-]\s*/, '').trim();
        frag.append(link.cloneNode(true));
        if (textAfter) {
          const p = document.createElement('p');
          p.textContent = textAfter;
          frag.append(p);
        }
      } else {
        frag.append(node.cloneNode(true));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
      frag.append(node.cloneNode(true));
      const next = children[i + 1];
      if (next && next.nodeType === Node.TEXT_NODE) {
        const text = next.nodeValue.replace(/^\s*[—–-]\s*/, '').trim();
        if (text) {
          const p = document.createElement('p');
          p.textContent = text;
          frag.append(p);
        }
        i += 1;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.replace(/^\s*[—–-]\s*/, '').trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        frag.append(p);
      }
    } else {
      frag.append(node.cloneNode(true));
    }
    i += 1;
  }
  span.innerHTML = '';
  span.append(frag);
}

function decorateLine2(card) {
  if (!card) return;
  const lineDiv = [...card.children].find((el) => el.tagName === 'DIV');
  if (!lineDiv) return;
  const span = document.createElement('span');
  span.className = LINE2_CLASS;
  while (lineDiv.firstChild) {
    span.append(lineDiv.firstChild);
  }
  lineDiv.replaceWith(span);
  unwrapDirectParagraph(span);
  splitIndicationItems(span);
}

function decodePlatformCSupTags(container) {
  // Platform-C encodes <sup> as &lt;sup&gt; in HTML source; the browser creates
  // text nodes with literal angle-bracket characters. Walk those text nodes and
  // replace each encoded <sup>…</sup> span with a real DOM element so that the
  // sup content is set via textContent (no HTML re-parsing / injection risk).
  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let n = walker.nextNode();
  while (n) {
    textNodes.push(n);
    n = walker.nextNode();
  }
  textNodes.forEach((textNode) => {
    const val = textNode.nodeValue || '';
    if (!val.includes('<sup')) return;
    const parts = val.split(/(<sup>[\s\S]*?<\/sup>)/gi);
    if (parts.length <= 1) return;
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      const m = /^<sup>([\s\S]*?)<\/sup>$/i.exec(part);
      if (m) {
        const sup = document.createElement('sup');
        sup.textContent = m[1].replace(/<[^>]+>/g, '');
        frag.append(sup);
      } else {
        frag.append(document.createTextNode(part));
      }
    });
    textNode.replaceWith(frag);
  });
}

function decorateLine3(card) {
  if (!card) return;
  const lineDiv = [...card.children].find((el) => el.tagName === 'DIV');
  if (!lineDiv) return;
  if (lineDiv.innerHTML.includes('&lt;sup')) {
    decodePlatformCSupTags(lineDiv);
  }
  const span = document.createElement('span');
  span.className = LINE3_CLASS;
  while (lineDiv.firstChild) {
    span.append(lineDiv.firstChild);
  }
  lineDiv.replaceWith(span);
  unwrapDirectParagraph(span);
}

function decorateLine4(card) {
  if (!card) return;
  const lineDiv = [...card.children].find((el) => el.tagName === 'DIV');
  if (!lineDiv) return;
  const span = document.createElement('span');
  span.className = LINE4_CLASS;
  while (lineDiv.firstChild) {
    span.append(lineDiv.firstChild);
  }
  lineDiv.replaceWith(span);
  unwrapDirectParagraph(span);
  // Pediatric indication group continues the line-2 list, so it needs the same
  // link/description split (<a></a><p></p>) for consistent structure & styling.
  splitIndicationItems(span);
}

function removeLeadingEmptyLineDivs(container) {
  if (!container) return;
  let el = container.firstElementChild;
  while (el && el.tagName === 'DIV') {
    const text = el.textContent.replace(/\u00a0/g, ' ').trim();
    const hasMedia = el.querySelector('img, picture, iframe, svg, video');
    if (text.length > 0 || hasMedia) break;
    const next = el.nextElementSibling;
    el.remove();
    el = next;
  }
}

function createWrapperATag(wrapper) {
  const card = document.createElement('a');
  card.className = 'grid-card';
  const sourceLink = wrapper.querySelector('a[href]');

  if (sourceLink) {
    const rawHref = sourceLink.getAttribute('href') || '';
    card.href = SAFE_HREF_RE.test(rawHref) ? rawHref : '#';
    card.target = sourceLink.getAttribute('target') || '_self';
  }

  while (wrapper.firstChild) {
    card.append(wrapper.firstChild);
  }

  const firstDiv = card.firstElementChild;
  if (firstDiv?.tagName === 'DIV') {
    firstDiv.remove();
  }

  const gridWrap = document.createElement('div');
  gridWrap.className = 'card-grid-item';
  const p = document.createElement('p');
  p.append(card);
  gridWrap.append(p);

  return gridWrap;
}

function isInUniversalEditor() {
  return !!window.hlx?.uePreview;
}

export function fixEncodedSupInParagraph(p) {
  if (!p) return;
  let html = p.innerHTML;
  if (html.includes('&lt;sup')) {
    // Strip any markup from captured text to prevent injection via authored content.
    html = html.replace(
      /&lt;sup&gt;([\s\S]*?)&lt;\/sup&gt;/gi,
      (_, text) => `<sup>${text.replace(/<[^>]+>/g, '')}</sup>`,
    );
    p.innerHTML = html;
  }
}

export function decorateBlock(block) {
  if (block.classList.contains('cards-grid-cta-card')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    wrappers.forEach((wrapper) => {
      const gridItem = createWrapperATag(wrapper);
      const anchor = gridItem.querySelector('a.grid-card');
      removeLeadingEmptyLineDivs(anchor);
      decorateLine1(anchor);
      decorateLine2(anchor);
      decorateLine3(anchor);
      decorateLine4(anchor);

      wrapper.replaceWith(gridItem);
    });
  }
}

export default function decorate(block) {
  if (isInUniversalEditor()) return;
  renderBlock(block);
}
