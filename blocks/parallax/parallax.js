import { renderBlock } from '../../scripts/multi-theme.js';

function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch {
    // invalid URL
  }
  return '';
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Field mapping — UE puts each field in its own row (one cell per row).
  // Document authoring may group image+alt in same row (two cells).
  // Detect by checking if first row has multiple cells.
  const isMultiCell = rows[0]?.children.length > 1;

  let imageCell;
  let altCell;
  let contentCell;
  let anchorCell;

  if (isMultiCell) {
    // Document pattern: Row 0 = [image, alt], Row 1 = content, Row 2 = anchorId
    imageCell = rows[0]?.children[0];
    altCell = rows[0]?.children[1];
    contentCell = rows[1]?.children[0];
    anchorCell = rows[2]?.children[0];
  } else {
    // UE/XWalk pattern: each field = own row
    imageCell = rows[0]?.children[0];
    altCell = rows[1]?.children[0];
    contentCell = rows[2]?.children[0];
    anchorCell = rows[3]?.children[0];
  }

  // Extract image source
  let imgSrc = '';
  const picture = imageCell?.querySelector('picture');
  const img = picture?.querySelector('img');
  if (img) {
    imgSrc = img.src;
  } else {
    const damLink = imageCell?.querySelector('a[href*="/content/dam"], a[href*=".jpg"], a[href*=".png"], a[href*=".webp"], a[href*=".svg"]');
    if (damLink) imgSrc = damLink.href;
  }

  // Extract alt text
  const altText = altCell?.textContent?.trim() || '';

  // Extract anchor ID
  const rawAnchorId = anchorCell?.textContent?.trim() || '';
  const normalizedId = rawAnchorId.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  // Clone content nodes
  const contentFragment = document.createDocumentFragment();
  if (contentCell) {
    [...contentCell.childNodes].forEach((node) => {
      contentFragment.append(node.cloneNode(true));
    });
  }

  // Clear block
  block.textContent = '';

  // Set anchor ID if authored
  if (normalizedId) block.id = normalizedId;

  // Build parallax structure
  const wrapper = document.createElement('div');
  wrapper.className = 'parallax-wrapper';
  if (altText) {
    wrapper.setAttribute('role', 'img');
    wrapper.setAttribute('aria-label', altText);
  }

  // Set background image via CSS custom property with URL validation
  const safeUrl = sanitizeUrl(imgSrc);
  if (safeUrl) {
    const encodedUrl = safeUrl.replace(/'/g, '%27');
    wrapper.style.setProperty('--parallax-bg-image', `url('${encodedUrl}')`);
  }

  // Content overlay — append cloned DOM nodes (no innerHTML)
  if (contentFragment.childNodes.length) {
    const overlay = document.createElement('div');
    overlay.className = 'parallax-content';
    overlay.append(contentFragment);
    wrapper.append(overlay);
  }

  block.append(wrapper);

  try {
    await renderBlock(block);
  } catch {
    // brand block-config failed; parallax still renders
  }
}
