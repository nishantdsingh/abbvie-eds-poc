export default function decorate(block) {
  const storageKey = `dismissible-${window.location.pathname}`;
  if (sessionStorage.getItem(storageKey) === 'closed') {
    block.closest('.section')?.remove();
    return;
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dismissible-close';
  closeBtn.setAttribute('aria-label', 'Close');

  block.append(closeBtn);

  closeBtn.addEventListener('click', () => {
    sessionStorage.setItem(storageKey, 'closed');
    block.classList.add('is-closing');
    block.addEventListener('transitionend', () => block.closest('.section')?.remove(), { once: true });
  });
}
