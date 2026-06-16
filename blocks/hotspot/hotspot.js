export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const imageRow = rows[0];
  const [imgCell, altCell] = imageRow.children;
  const img = imgCell?.querySelector('img');
  if (img && altCell) img.alt = altCell.textContent.trim();

  const wrapper = document.createElement('div');
  wrapper.className = 'hotspot-wrapper';
  wrapper.append(img || imgCell);

  rows.slice(1).forEach((row, i) => {
    const cells = [...row.children];
    const title = cells[0]?.textContent.trim();
    const content = cells[1]?.innerHTML || '';
    const left = cells[2]?.textContent.trim() || '50%';
    const top = cells[3]?.textContent.trim() || '50%';
    const position = cells[4]?.textContent.trim() || 'top-right';

    const point = document.createElement('button');
    point.className = 'hotspot-point';
    point.setAttribute('aria-expanded', 'false');
    point.setAttribute('aria-controls', `hotspot-panel-${i}`);
    point.setAttribute('aria-label', title);
    point.style.setProperty('--hotspot-x', left.includes('%') ? left : `${left}%`);
    point.style.setProperty('--hotspot-y', top.includes('%') ? top : `${top}%`);

    const panel = document.createElement('div');
    panel.className = `hotspot-panel hotspot-panel-${position}`;
    panel.id = `hotspot-panel-${i}`;
    panel.setAttribute('role', 'tooltip');
    panel.innerHTML = `<strong class="hotspot-panel-title">${title}</strong><div class="hotspot-panel-content">${content}</div>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'hotspot-panel-close';
    closeBtn.setAttribute('aria-label', 'Close');
    panel.prepend(closeBtn);

    point.append(panel);
    wrapper.append(point);

    function openPanel() {
      wrapper.querySelectorAll('.hotspot-point[aria-expanded="true"]').forEach((p) => {
        p.setAttribute('aria-expanded', 'false');
        p.classList.remove('is-active');
      });
      point.setAttribute('aria-expanded', 'true');
      point.classList.add('is-active');
    }

    function closePanel() {
      point.setAttribute('aria-expanded', 'false');
      point.classList.remove('is-active');
    }

    point.addEventListener('click', (e) => {
      if (e.target === closeBtn || closeBtn.contains(e.target)) {
        closePanel();
        return;
      }
      if (point.classList.contains('is-active')) closePanel();
      else openPanel();
    });

    point.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });

    closeBtn.addEventListener('click', closePanel);
  });

  block.replaceChildren(wrapper);
}
