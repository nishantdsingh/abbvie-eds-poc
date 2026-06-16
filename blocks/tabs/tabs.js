// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

let tabBlockCnt = 0;

function normalize(value) {
  return value?.trim().toLowerCase() || '';
}

/**
 * Get section name/ID to match against tab names.
 * Checks: id attribute, data-aue-label, section-metadata name/tabName rows.
 */
function getSectionIdentifier(section) {
  if (section.id) return section.id;
  if (section.dataset.aueLabel) return section.dataset.aueLabel;

  const meta = section.querySelector('.section-metadata');
  if (meta) {
    const match = [...meta.children].find((row) => {
      const firstChild = row.firstElementChild;
      if (!firstChild) return false;
      const key = normalize(firstChild.textContent);
      return key === 'tabname' || key === 'tab-name' || key === 'name';
    });
    if (match) {
      const cells = [...match.children];
      return cells[1]?.textContent?.trim() || '';
    }
  }

  return '';
}

export default async function decorate(block) {
  tabBlockCnt += 1;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt}`;

  // Find sibling sections after the tabs block's parent section
  const blockSection = block.closest('.section');
  const main = blockSection?.parentElement;
  let panels = [];

  if (main) {
    const allSections = [...main.children].filter(
      (el) => el.classList.contains('section') && el !== blockSection,
    );
    const blockIdx = [...main.children].indexOf(blockSection);
    panels = allSections.filter(
      (el) => [...main.children].indexOf(el) > blockIdx,
    );
  }

  // Extract tab item names from block
  const tabItems = [...block.children];
  const tabNames = tabItems.map((item) => {
    const titleCell = item.firstElementChild;
    return titleCell?.textContent.trim() || '';
  });

  // Match sections to tab names (case-insensitive)
  // Group multiple sections per tab name
  const tabPanelMap = new Map();
  tabNames.forEach((name) => {
    const normalizedName = normalize(name);
    const matched = panels.filter(
      (section) => normalize(getSectionIdentifier(section)) === normalizedName,
    );
    if (matched.length > 0) tabPanelMap.set(name, matched);
  });

  // Build tab buttons and wrap matched panels
  let hasActiveTab = false;
  tabNames.forEach((name, i) => {
    const matched = tabPanelMap.get(name) || [];
    const panelId = `tab-panel-${tabBlockCnt}-${i + 1}`;

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${panelId}`;
    button.textContent = name || `Tab ${i + 1}`;
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.setAttribute('tabindex', hasActiveTab || matched.length === 0 ? '-1' : '0');

    const shouldActivate = matched.length > 0 && !hasActiveTab;
    button.setAttribute('aria-selected', shouldActivate);

    let wrapper = null;

    if (matched.length > 0) {
      wrapper = document.createElement('div');
      wrapper.className = 'tabs-panel';
      wrapper.id = panelId;
      wrapper.setAttribute('role', 'tabpanel');
      wrapper.setAttribute('aria-labelledby', button.id);
      wrapper.setAttribute('aria-hidden', !shouldActivate);

      const insertBefore = matched[0];
      main.insertBefore(wrapper, insertBefore);
      matched.forEach((section) => {
        section.dataset.tabsGrid = 'true';
        if (shouldActivate) section.style.display = '';
        wrapper.append(section);
      });

      if (shouldActivate) hasActiveTab = true;
    }

    button.addEventListener('click', () => {
      // Hide all panels
      main.querySelectorAll(`.tabs-panel[id^="tab-panel-${tabBlockCnt}"]`).forEach((p) => {
        p.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
        btn.setAttribute('tabindex', '-1');
      });
      // Show clicked panel and ensure sections inside are visible
      if (wrapper) {
        wrapper.setAttribute('aria-hidden', false);
        wrapper.querySelectorAll('.section').forEach((s) => {
          s.style.display = '';
        });
      }
      button.setAttribute('aria-selected', true);
      button.setAttribute('tabindex', '0');
      // Update URL hash
      window.history.replaceState(null, '', `#${panelId}`);
    });

    tablist.append(button);

    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }
  });

  // Hide original tab items but keep in DOM for UE content tree
  tabItems.forEach((tabItem) => {
    tabItem.classList.add('tabs-item-hidden');
  });
  block.prepend(tablist);

  // Keyboard navigation (ARIA tabs pattern)
  tablist.addEventListener('keydown', (e) => {
    const buttons = [...tablist.querySelectorAll('button')];
    const currentIndex = buttons.indexOf(document.activeElement);
    let targetIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        targetIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        targetIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    buttons[targetIndex]?.click();
    buttons[targetIndex]?.focus();
  });

  // Deep link support — activate tab from URL hash
  const hash = window.location.hash.slice(1);
  if (hash) {
    const targetButton = tablist.querySelector(`[aria-controls="${hash}"]`);
    if (targetButton) targetButton.click();
  }
}
