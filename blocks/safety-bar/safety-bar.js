function buildToggle(stickyBlock, onToggle) {
  const toggle = document.createElement('button');
  toggle.className = 'safety-bar-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'safety-bar-full-content');
  toggle.setAttribute('aria-label', 'Expand Important Safety Information');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute(
      'aria-label',
      expanded ? 'Expand Important Safety Information' : 'Collapse Important Safety Information',
    );
    const nextExpanded = !expanded;
    stickyBlock.classList.toggle('is-expanded', nextExpanded);
    onToggle(nextExpanded);
  });

  return toggle;
}

function getNonNestedProp(block, name) {
  return [...block.querySelectorAll(`[data-aue-prop="${name}"]`)]
    .find((el) => !el.parentElement?.closest(`[data-aue-prop="${name}"]`)) || null;
}

function extractContentFields(block, isSplit) {
  const hasAueProps = block.querySelector('[data-aue-prop]');

  if (hasAueProps) {
    return {
      collapsed: getNonNestedProp(block, 'collapsedContent'),
      collapsedCol2: isSplit ? getNonNestedProp(block, 'collapsedContentCol2') : null,
      expanded: getNonNestedProp(block, 'expandedContent'),
    };
  }

  const rows = [...block.querySelectorAll(':scope > div')];
  const hasRenderableContent = (el) => {
    if (!el) return false;
    return !!el.textContent?.trim() || !!el.querySelector('img, picture, video, iframe, ul, ol, table');
  };

  return {
    collapsed: rows[0] || null,
    collapsedCol2: isSplit ? rows[1] || null : null,
    expanded: isSplit
      ? rows[2] || null
      : rows.slice(1).findLast(hasRenderableContent) || rows[1] || null,
  };
}

export default function decorate(block) {
  const isSplit = block.classList.contains('split');
  const { collapsed, collapsedCol2, expanded } = extractContentFields(block, isSplit);

  // Hide the source section — it only feeds the sticky bar, not rendered in-page
  block.closest('.section').hidden = true;

  // Build the sticky floating bar
  const stickySection = document.createElement('div');
  stickySection.className = 'section safety-bar-section';

  const stickyBlock = document.createElement('div');
  stickyBlock.className = [...block.classList].join(' ');
  let fullEl;

  const syncExpandedContent = (isExpanded) => {
    if (!expanded) return;

    if (isExpanded) {
      if (!fullEl) {
        fullEl = document.createElement('div');
        fullEl.className = 'safety-bar-full';
        fullEl.id = 'safety-bar-full-content';
        fullEl.innerHTML = expanded.innerHTML;
      }

      if (!stickyBlock.contains(fullEl)) {
        stickyBlock.append(fullEl);
      }
      return;
    }

    fullEl?.remove();
  };

  const abbrevEl = document.createElement('div');
  abbrevEl.className = 'safety-bar-abbreviated';

  if (isSplit && collapsedCol2) {
    const col1Div = document.createElement('div');
    col1Div.className = 'safety-bar-col1';
    col1Div.innerHTML = collapsed ? collapsed.innerHTML : '';

    const col2Div = document.createElement('div');
    col2Div.className = 'safety-bar-col2';
    col2Div.innerHTML = collapsedCol2.innerHTML;

    abbrevEl.append(col1Div, col2Div);
  } else if (collapsed) {
    abbrevEl.innerHTML = collapsed.innerHTML;
  }

  stickyBlock.append(abbrevEl);

  stickyBlock.append(buildToggle(stickyBlock, syncExpandedContent));

  stickySection.append(stickyBlock);
  document.body.append(stickySection);

  // Hide the bar when the footer is visible; reveal it when footer scrolls away.
  // Footer loads async in EDS, so fall back to a MutationObserver if not yet in DOM.
  const footerObserver = new IntersectionObserver(([entry]) => {
    stickySection.classList.toggle('is-hidden', entry.isIntersecting);
  });

  const footer = document.querySelector('footer');
  if (footer) {
    footerObserver.observe(footer);
  } else {
    const mo = new MutationObserver(() => {
      const el = document.querySelector('footer');
      if (el) {
        mo.disconnect();
        footerObserver.observe(el);
      }
    });
    mo.observe(document.body, { childList: true });
  }
}
