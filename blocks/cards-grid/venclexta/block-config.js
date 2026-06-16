import { decorateBlock } from '../cards-grid.js';
import brandDecorate from './cards-grid.js';

// True when the anchor's visible text is just its URL (a bare-URL link),
// e.g. <a href="https://x.com/">https://x.com/</a>. Comparison ignores
// protocol, leading www., trailing slash, and case.
function anchorTextIsHref(anchor) {
  if (!anchor) return false;
  const text = (anchor.textContent || '').trim();
  const href = (anchor.getAttribute('href') || '').trim();
  if (!text || !href) return false;
  if (text === href) return true;
  const normalize = (value) => value
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
  return normalize(text) === normalize(href);
}

// For callout-card rows: when a link's text is just its URL, replace that text
// with the preceding cell's text, then remove that preceding text cell.
// Runs before brandDecorate consumes the cells.
function fixBareUrlCtaLabels(block) {
  if (!block.classList.contains('download-materials')) return;
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    cells.forEach((cell, index) => {
      const anchor = cell.querySelector('a[href]');
      if (!anchor || !anchorTextIsHref(anchor) || index === 0) return;
      const prevCell = cells[index - 1];
      const label = (prevCell?.textContent || '').trim();
      if (label) {
        anchor.textContent = label;
        prevCell.remove();
      }
    });
  });
}

export default async function getBlockConfigs() {
  return {
    decorations: {
      beforeDecorate: (ctx) => fixBareUrlCtaLabels(ctx),
      decorate: async (ctx) => {
        if (!brandDecorate(ctx)) decorateBlock(ctx);
      },
    },
  };
}
