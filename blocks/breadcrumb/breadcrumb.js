// eslint-disable-next-line import/no-named-as-default
import IndexUtils from '../../scripts/index-utils.js';

function formatSegment(segment) {
  return segment.split('-').join(' ');
}

function appendJsonLd(ol) {
  const items = [...ol.querySelectorAll('li')];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((li, idx) => {
      const a = li.querySelector('a');
      const entry = {
        '@type': 'ListItem',
        position: idx + 1,
        name: li.textContent.trim(),
      };
      if (a) {
        entry.item = new URL(a.getAttribute('href'), window.location.origin).href;
      }
      return entry;
    }),
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try { if (JSON.parse(s.textContent)?.['@type'] === 'BreadcrumbList') s.remove(); } catch { /* ignore */ }
  });
  // JSON-LD must be injected into <head> — intentional global side-effect
  document.head.append(script);
}

function extractConfig(block) {
  const rows = [...block.querySelectorAll(':scope > div:not([data-aue-resource])')];

  let autoVal = false;
  let homeLabel = 'Home';
  let title = 'Breadcrumb';
  let anchorId = '';

  rows.forEach((row) => {
    const prop = row.querySelector('[data-aue-prop]');
    if (prop) {
      const name = prop.getAttribute('data-aue-prop');
      if (name === 'homeLabel') homeLabel = prop.textContent?.trim() || 'Home';
      if (name === 'title') title = prop.textContent?.trim() || 'Breadcrumb';
      if (name === 'anchorId') anchorId = prop.textContent?.trim() || '';
      if (name === 'auto') {
        const val = prop.textContent?.trim().toLowerCase();
        autoVal = val === 'true';
      }
      row.dataset.bcConfig = '';
    } else {
      const divs = row.querySelectorAll(':scope > div');
      if (divs.length >= 2) {
        const key = divs[0]?.textContent?.trim().toLowerCase();
        const val = divs[1]?.textContent?.trim().toLowerCase();
        if (key === 'auto') { autoVal = val === 'true'; row.dataset.bcConfig = ''; }
        if (key === 'homelabel') { homeLabel = divs[1]?.textContent?.trim() || 'Home'; row.dataset.bcConfig = ''; }
        if (key === 'title') { title = divs[1]?.textContent?.trim() || 'Breadcrumb'; row.dataset.bcConfig = ''; }
        if (key === 'anchorid') { anchorId = divs[1]?.textContent?.trim() || ''; row.dataset.bcConfig = ''; }
      }
    }
  });

  return {
    auto: autoVal, homeLabel, title, anchorId,
  };
}

function extractItems(block) {
  const itemRows = [...block.querySelectorAll(':scope > div[data-aue-resource]')];
  if (itemRows.length) {
    return itemRows.reduce((items, row) => {
      const labelEl = row.querySelector('[data-aue-prop="label"]');
      const label = labelEl?.textContent?.trim() || '';
      const a = row.querySelector('a[href]');
      const href = a?.getAttribute('href') || '';
      if (label) items.push({ label, href });
      return items;
    }, []);
  }

  const rows = [...block.querySelectorAll(':scope > div:not([data-bc-config])')];
  return rows.reduce((items, row) => {
    const divs = row.querySelectorAll(':scope > div');
    if (divs.length >= 2) {
      const label = divs[0]?.textContent?.trim() || '';
      const a = divs[1]?.querySelector('a');
      const href = a?.getAttribute('href') || divs[1]?.textContent?.trim() || '';
      if (label && href) items.push({ label, href });
    }
    return items;
  }, []);
}

function toPathname(url) {
  try {
    return new URL(url, window.location.origin).pathname
      .replace(/^\/content/, '')
      .replace(/\.html$/, '');
  } catch {
    return (url || '').replace(/\.html$/, '');
  }
}

function buildNav(crumbs, ariaLabel) {
  const currentPath = window.location.pathname
    .replace(/^\/content/, '')
    .replace(/\.html$/, '');

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav';
  nav.setAttribute('aria-label', ariaLabel || 'Breadcrumb');

  const ol = document.createElement('ol');
  crumbs.forEach(({ label, href }) => {
    const li = document.createElement('li');
    const hrefPath = toPathname(href);
    const isActive = hrefPath && hrefPath === currentPath;

    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      if (isActive) a.classList.add('flex-active');
      li.append(a);
    } else {
      li.textContent = label;
    }
    if (isActive) li.setAttribute('aria-current', 'page');
    ol.append(li);
  });

  nav.append(ol);
  return nav;
}

async function buildAutoTrail(homeLabel) {
  const currentPath = window.location.pathname
    .replace(/^\/content/, '')
    .replace(/\.html$/, '');

  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length <= 1) return [];

  let indexData;
  try {
    indexData = await IndexUtils.getIndexData(true);
  } catch {
    return [];
  }
  if (!indexData) return [];

  return segments.map((seg, i) => {
    const itemPath = `/${segments.slice(0, i + 1).join('/')}`;
    const matchedItem = Object.values(indexData).find((item) => item.path === itemPath);
    let label = formatSegment(matchedItem?.navtitle || seg);
    if (i === 0 && homeLabel) label = homeLabel;
    return { label, href: itemPath };
  });
}

export default async function decorate(block) {
  const config = extractConfig(block);
  const items = extractItems(block);

  // Hide authored rows — preserve UE instrumentation
  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => { row.classList.add('breadcrumb-hidden'); });

  let crumbs;
  if (config.auto) {
    crumbs = await buildAutoTrail(config.homeLabel);
  } else {
    crumbs = items;
  }

  if (!crumbs.length) return;

  const nav = buildNav(crumbs, config.title);
  if (config.anchorId) block.id = config.anchorId;
  block.append(nav);
  appendJsonLd(nav.querySelector('ol'));
}
