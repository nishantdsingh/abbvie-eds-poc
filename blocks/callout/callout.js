export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const contentCell = rows[0]?.firstElementChild;
  if (contentCell) {
    contentCell.classList.add('callout-content');
  }

  if (rows[1]) {
    const iconCell = rows[1].firstElementChild;
    if (iconCell) {
      iconCell.classList.add('callout-icon');
      block.prepend(iconCell);
      rows[1].remove();
    }
  }
}
