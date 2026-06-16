import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const rows = [...block.children];
  const [mainRow, sidebarRow] = rows;

  const mainCell = mainRow?.children[0];
  const sidebarCell = sidebarRow?.children[0];

  const mainLink = mainCell?.querySelector('a');
  const sidebarLink = sidebarCell?.querySelector('a');

  const layout = document.createElement('div');
  layout.className = 'sticky-sidebar-layout';

  const mainEl = document.createElement('div');
  mainEl.className = 'sticky-sidebar-main';

  const sideEl = document.createElement('div');
  sideEl.className = 'sticky-sidebar-side';

  if (mainLink?.href) {
    const frag = await loadFragment(mainLink.pathname);
    if (frag) mainEl.append(frag);
  } else {
    mainEl.append(mainCell || '');
  }

  if (sidebarLink?.href) {
    const frag = await loadFragment(sidebarLink.pathname);
    if (frag) sideEl.append(frag);
  } else {
    sideEl.append(sidebarCell || '');
  }

  layout.append(mainEl, sideEl);
  block.replaceChildren(layout);
}
