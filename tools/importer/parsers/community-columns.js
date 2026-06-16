/* eslint-disable */
/* global WebImporter */

/**
 * Parser: community-columns
 * Maps to existing 'columns' block
 * Selector: .abbv-flex-container-v2 (non-card flex containers)
 *
 * Used for image+text touts and bottom navigation CTAs.
 * columns model: each column has content (richtext) + image + imageAlt
 */
export default function parse(element, { document }) {
  // Skip if this is article cards or wellness tips (handled by community-cards parser)
  if (element.classList.contains('flexbox-cards')
    || element.className.includes('article-flashcards')
    || element.className.includes('wellness-tips')
    || element.className.includes('resources-page')
    || element.className.includes('flexbox-video-cards')) {
    return;
  }

  const items = element.querySelectorAll('.abbv-flex-item-v2');
  if (!items || items.length === 0) return;

  // Build one row with N columns
  const row = [];
  items.forEach((item) => {
    const contentFrag = document.createDocumentFragment();

    // Check for image
    const img = item.querySelector('img');
    if (img) {
      const pic = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src') || '';
      newImg.alt = img.getAttribute('alt') || '';
      pic.appendChild(newImg);
      const p = document.createElement('p');
      p.appendChild(pic);
      contentFrag.appendChild(p);
    }

    // Extract text content (headings, paragraphs, links)
    const textContainer = item.querySelector('.abbv-stretched-card-body')
      || item.querySelector('.abbv-image-text-content-v2')
      || item.querySelector('.abbv-rich-text');

    if (textContainer) {
      // Get headings
      const headings = textContainer.querySelectorAll('h1, h2, h3, p.heading-1, p.heading-2');
      headings.forEach((h) => {
        const newH = document.createElement('h2');
        newH.textContent = h.textContent.trim();
        contentFrag.appendChild(newH);
      });

      // Get paragraphs (non-heading)
      const paras = textContainer.querySelectorAll('p:not([class*="heading"])');
      paras.forEach((p) => {
        if (p.textContent.trim() && !p.querySelector('b')?.textContent.match(/heading/i)) {
          const newP = document.createElement('p');
          newP.innerHTML = p.innerHTML;
          contentFrag.appendChild(newP);
        }
      });

      // Get CTAs
      const links = textContainer.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="button"]');
      links.forEach((a) => {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = a.getAttribute('href') || '';
        link.textContent = a.textContent.trim();
        p.appendChild(link);
        contentFrag.appendChild(p);
      });
    } else {
      // Fallback: grab headings and links directly from item
      const heading = item.querySelector('h2, p.heading-2');
      if (heading) {
        const h = document.createElement('h2');
        h.textContent = heading.textContent.trim();
        contentFrag.appendChild(h);
      }
      const link = item.querySelector('a');
      if (link) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = link.getAttribute('href') || '';
        a.textContent = link.textContent.trim();
        p.appendChild(a);
        contentFrag.appendChild(p);
      }
    }

    row.push(contentFrag);
  });

  if (row.length === 0) return;

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
