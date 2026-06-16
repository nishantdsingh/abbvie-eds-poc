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

  // Hide the source block — it only feeds the sticky bar, not rendered in-page.
  // If safety-bar is the only block in its section, hide the entire section.
  // Otherwise, hide only the block wrapper to avoid hiding sibling blocks.
  const section = block.closest('.section');
  const blockWrappers = section.querySelectorAll(':scope > div[class*="-wrapper"]');
  if (blockWrappers.length <= 1) {
    section.hidden = true;
  } else {
    block.closest('.safety-bar-wrapper')?.remove();
    section.classList.remove('safety-bar-container');
  }

  // Build the sticky floating bar
  const stickySection = document.createElement('div');
  stickySection.className = 'section safety-bar-section';

  const stickyBlock = document.createElement('div');
  stickyBlock.className = [...block.classList].join(' ');
  let fullEl;

  const syncExpandedContent = (isExpanded) => {
    if (!expanded) return;

    const overlayEl = document.querySelector('.safety-bar-overlay');

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
      overlayEl?.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return;
    }

    fullEl?.remove();
    overlayEl?.classList.remove('is-visible');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
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

  const overlay = document.createElement('div');
  overlay.className = 'safety-bar-overlay';
  document.body.append(overlay);

  overlay.addEventListener('click', () => {
    stickyBlock.classList.remove('is-expanded');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    syncExpandedContent(false);
    const toggle = stickyBlock.querySelector('.safety-bar-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });

  document.body.append(stickySection);

  // Footer visibility is handled by the scroll-based check below.
  // No separate IntersectionObserver needed (it conflicts with scrollCheck
  // by hiding the bar on initial load when footer is in viewport).

  // Hide the bar when inline ISI is 200px into viewport (matches live site logic).
  // Throttled scroll check — same approach as live site's safetyBarScrollCheck.
  const isiSection = document.querySelector('.section.isi');
  let ticking = false;
  const scrollCheck = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const footerEl = document.querySelector('footer');
    const footerTop = footerEl
      ? footerEl.getBoundingClientRect().top + scrollTop
      : Infinity;
    const footerVisible = (scrollTop + windowHeight) > footerTop;

    let isiVisible = false;
    if (isiSection) {
      const isiTop = isiSection.getBoundingClientRect().top + scrollTop;
      isiVisible = (scrollTop + windowHeight) > (isiTop + 200);
    }

    if (isiVisible || footerVisible) {
      stickySection.classList.add('is-hidden');
    } else {
      stickySection.classList.remove('is-hidden');
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollCheck();
        ticking = false;
      });
      ticking = true;
    }
  });
  scrollCheck();
}
