import { applyCommonProps } from '../../scripts/utils.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SAFE_URL_RE = /^(https?:\/\/|\/)/i;

// Share endpoints are external service URLs — absolute URLs are intentional here
// and cannot be expressed as relative paths or design tokens.
const PLATFORMS = {
  facebook: {
    label: 'Share on Facebook',
    buildUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    paths: [
      { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    ],
  },
  twitter: {
    label: 'Share on X (Twitter)',
    buildUrl: (url) => `https://www.twitter.com/share?url=${encodeURIComponent(url)}`,
    paths: [
      { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    ],
  },
  linkedin: {
    label: 'Share on LinkedIn',
    buildUrl: (url) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
    paths: [
      { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    ],
  },
  pinterest: {
    label: 'Share on Pinterest',
    buildUrl: (url) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
    paths: [
      { d: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z' },
    ],
  },
};

const NETWORK_KEYS = new Set([...Object.keys(PLATFORMS), 'copy', 'email']);

function buildSvgIcon(paths, viewBox = '0 0 24 24') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  paths.forEach(({ d, fill = 'currentColor' }) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    svg.append(path);
  });
  return svg;
}

function buildCopyIcon() {
  return buildSvgIcon([
    { d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' },
  ]);
}

function buildEmailIcon() {
  return buildSvgIcon([
    { d: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
  ]);
}

function buildVisuallyHidden(text) {
  const span = document.createElement('span');
  span.className = 'social-share-visually-hidden';
  span.textContent = text;
  return span;
}

function openSocialPopup(url) {
  // Suppress exit-intent for 2 s — moving the cursor toward the popup triggers
  // mouseleave with clientY <= 0, which would otherwise fire the exit modal.
  document.dispatchEvent(new CustomEvent('exit-intent:suppress', { detail: { ms: 2000 } }));
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

function buildPlatformItem(key, config, shareUrl, exitModalId) {
  const li = document.createElement('li');
  li.className = 'social-share-item';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `social-share-link social-share-link-${key}`;
  btn.setAttribute('aria-label', config.label);
  btn.append(buildSvgIcon(config.paths));
  btn.append(buildVisuallyHidden(config.label));

  const destUrl = config.buildUrl(shareUrl);

  if (exitModalId) {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('modal:open', {
        detail: { modalId: exitModalId, onConfirm: () => openSocialPopup(destUrl) },
      }));
    });
  } else {
    btn.addEventListener('click', () => openSocialPopup(destUrl));
  }

  li.append(btn);
  return li;
}

function buildCopyItem(shareUrl) {
  const li = document.createElement('li');
  li.className = 'social-share-item';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'social-share-link social-share-link-copy';
  btn.setAttribute('aria-label', 'Copy link');
  btn.append(buildCopyIcon());
  btn.append(buildVisuallyHidden('Copy link'));

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      btn.dispatchEvent(new CustomEvent('social-share:copied', { bubbles: true }));
    } catch {
      // clipboard unavailable (insecure context or permission denied)
    }
  });

  li.append(btn);
  return li;
}

function buildEmailItem(shareUrl, pageTitle, emailModalId) {
  const li = document.createElement('li');
  li.className = 'social-share-item';

  if (emailModalId) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'social-share-link social-share-link-email';
    btn.setAttribute('aria-label', 'Share via email');
    btn.append(buildEmailIcon());
    btn.append(buildVisuallyHidden('Share via email'));
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('modal:open', { detail: { modalId: emailModalId } }));
    });
    li.append(btn);
  } else {
    const a = document.createElement('a');
    a.className = 'social-share-link social-share-link-email';
    a.href = `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(shareUrl)}`;
    a.setAttribute('aria-label', 'Share via email');
    a.append(buildEmailIcon());
    a.append(buildVisuallyHidden('Share via email'));
    li.append(a);
  }

  return li;
}

function buildCopyToast(block) {
  const toast = document.createElement('div');
  toast.className = 'social-share-copy-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.textContent = 'Link copied!';

  let dismissTimer;
  block.addEventListener('social-share:copied', () => {
    clearTimeout(dismissTimer);
    toast.classList.add('social-share-copy-toast-visible');
    dismissTimer = setTimeout(() => toast.classList.remove('social-share-copy-toast-visible'), 3000);
  });

  return toast;
}

function readBlockFields(block) {
  const result = {
    shareUrl: '', networks: '', emailModalId: '', exitModalId: '',
  };
  const modalIds = [];

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    // aem-content fields render as <a> elements in the block DOM
    const anchor = cell.querySelector('a');
    if (anchor && !result.shareUrl) {
      result.shareUrl = anchor.href || cell.textContent.trim();
      return;
    }

    const text = cell.textContent.trim();
    if (!text) return;

    if (SAFE_URL_RE.test(text) && !result.shareUrl) {
      result.shareUrl = text;
      return;
    }

    // Comma-separated list containing at least one known network key → networks row
    if (!result.networks) {
      const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.some((k) => NETWORK_KEYS.has(k))) {
        result.networks = text;
        return;
      }
    }

    // Remaining plain-text rows are modal IDs
    modalIds.push(text);
  });

  // xwalk omits empty-string rows, so positional assignment is unreliable when one ID
  // is blank. Use the presence of 'email' in networks as a hint: emailModalId is only
  // meaningful when the email network is enabled. If email is not in networks, the
  // sole modal ID (if any) must be exitModalId.
  const hasEmailNetwork = result.networks.split(',').map((s) => s.trim()).includes('email');
  if (hasEmailNetwork) {
    [result.emailModalId = '', result.exitModalId = ''] = modalIds;
  } else {
    result.exitModalId = modalIds[0] || '';
  }

  return result;
}

export default async function decorate(block) {
  applyCommonProps(block);

  const {
    shareUrl: rawUrl, networks: rawNetworks, emailModalId, exitModalId,
  } = readBlockFields(block);

  const shareUrl = (rawUrl && SAFE_URL_RE.test(rawUrl)) ? rawUrl : window.location.href;
  const pageTitle = document.title || '';

  const networkKeys = rawNetworks
    ? rawNetworks.split(',').map((s) => s.trim()).filter(Boolean)
    : [...NETWORK_KEYS];

  [...block.children].forEach((row) => row.remove());

  const list = document.createElement('ul');
  list.className = 'social-share-list';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'Share this page');

  networkKeys.forEach((key) => {
    const config = PLATFORMS[key];
    if (config) {
      list.append(buildPlatformItem(key, config, shareUrl, exitModalId));
    } else if (key === 'copy') {
      list.append(buildCopyItem(shareUrl));
    } else if (key === 'email') {
      list.append(buildEmailItem(shareUrl, pageTitle, emailModalId));
    }
  });

  block.append(list);
  block.append(buildCopyToast(block));
}
