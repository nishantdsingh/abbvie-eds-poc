import { renderBlock } from '../../scripts/multi-theme.js';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
    : '';
  document.cookie = `${name}=${value}${expires}; path=/`;
}

function getCellText(row) {
  return row?.firstElementChild?.textContent?.trim() || '';
}

function readBlock(block) {
  const rows = [...block.children];
  return {
    handleLabel: getCellText(rows[0]) || 'Savings',
    heading: getCellText(rows[1]) || '',
    contentRow: rows[2] || null,
    closeLabel: getCellText(rows[3]) || 'Close',
    anchorId: getCellText(rows[4]) || '',
  };
}

export async function decorateBlock(block) {
  const isRight = block.classList.contains('right');
  const isAutoOpen = block.classList.contains('autoopen');
  const isOnce = block.classList.contains('once');
  const isOnceClosed = block.classList.contains('once-closed');

  const cfg = readBlock(block);

  const drawerId = cfg.anchorId || block.id || 'promo-drawer';
  const cookieKey = `promo-drawer-${drawerId}`;

  if (isOnce && getCookie(cookieKey) === 'seen') {
    block.remove();
    return;
  }

  if (isOnceClosed && getCookie(cookieKey) === 'dismissed') {
    block.remove();
    return;
  }

  block.textContent = '';

  if (!isRight) block.classList.add('left');

  const handle = document.createElement('button');
  handle.className = 'promo-drawer-handle';
  handle.setAttribute('aria-expanded', 'false');
  handle.setAttribute('aria-controls', `${drawerId}-panel`);
  handle.textContent = cfg.handleLabel;

  const panel = document.createElement('div');
  panel.className = 'promo-drawer-panel';
  panel.id = `${drawerId}-panel`;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'promo-drawer-close';
  closeBtn.setAttribute('aria-label', cfg.closeLabel);
  panel.append(closeBtn);

  if (cfg.heading) {
    const h3 = document.createElement('h3');
    h3.className = 'promo-drawer-heading';
    h3.textContent = cfg.heading;
    panel.append(h3);
  }

  if (cfg.contentRow) panel.append(cfg.contentRow);

  block.append(handle, panel);

  function open() {
    block.classList.add('is-open');
    handle.setAttribute('aria-expanded', 'true');
    if (isOnce) setCookie(cookieKey, 'seen', 0);
  }

  function close() {
    block.classList.remove('is-open');
    handle.setAttribute('aria-expanded', 'false');
    if (isOnceClosed) setCookie(cookieKey, 'dismissed', 365);
  }

  handle.addEventListener('click', () => {
    if (block.classList.contains('is-open')) close();
    else open();
  });

  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && block.classList.contains('is-open')) {
      close();
      handle.focus();
    }
  });

  if (isAutoOpen && !(isOnce && getCookie(cookieKey)) && !(isOnceClosed && getCookie(cookieKey))) {
    setTimeout(open, 1500);
  }
}

export default async function decorate(block) {
  renderBlock(block);
}
