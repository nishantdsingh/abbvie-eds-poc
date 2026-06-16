import { hoistBeforeMain } from '../../scripts/scripts.js';

function setCookie(name) {
  const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=1;expires=${expires};path=/;SameSite=Lax;Secure`;
}

function hasCookie(name) {
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${encodeURIComponent(name)}=`));
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax;Secure`;
}

function readFields(block) {
  const rows = [...block.children];
  const fields = { cookieName: '', closeLabel: '', resetOnLoad: false };
  const toRemove = [];

  let contentSkipped = false;
  rows.forEach((row) => {
    const inner = row.querySelector(':scope > div');
    if (!inner) return;
    // UE annotates richtext with data-aue-type="richtext"; EDS delivery renders it as a direct <p>
    const isContent = inner.querySelector('[data-aue-type="richtext"]')
      || inner.querySelector(':scope > p');
    if (!contentSkipped && isContent) {
      contentSkipped = true;
      return;
    }
    const text = inner.textContent.trim();
    if (!text) return;
    toRemove.push(row);
    if (!fields.cookieName) {
      fields.cookieName = text;
    } else if (!fields.closeLabel && text !== 'true' && text !== 'false') {
      fields.closeLabel = text;
    } else if (text === 'true' || text === 'false') {
      fields.resetOnLoad = text === 'true';
    }
  });

  toRemove.forEach((r) => r.remove());
  return fields;
}

export default function decorate(block) {
  const { cookieName, closeLabel, resetOnLoad } = readFields(block);

  const key = cookieName || `dismiss-${window.location.pathname}`;

  const wrapper = block.closest('.dismiss-wrapper') ?? block;

  // Hoist only this wrapper before <main> so its containing block is <body> (full page height).
  // Skipped in UE editor (data-aue-resource present) to preserve editor instrumentation.
  if (block.classList.contains('sticky') && !block.dataset.aueResource) {
    hoistBeforeMain(wrapper);
  }

  if (resetOnLoad) {
    deleteCookie(key);
  } else if (hasCookie(key)) {
    wrapper.remove();
    return;
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dismiss-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', closeLabel || 'Close');

  block.append(closeBtn);

  closeBtn.addEventListener('click', () => {
    setCookie(key);
    block.classList.add('dismiss-is-closing');
    const duration = parseFloat(getComputedStyle(block).getPropertyValue('--transition-duration-medium') || '0.3') * 1000;
    setTimeout(() => wrapper.remove(), duration);
  });
}
