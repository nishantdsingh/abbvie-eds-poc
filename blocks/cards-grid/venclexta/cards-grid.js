function isVenclextaCalloutUeRow(wrapper) {
  if (!wrapper || wrapper.tagName !== 'DIV') return false;
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  if (cells.length < 5) return false;
  if (cells[0]?.querySelector('a[href]')) return false;
  const phoneA = cells[4]?.querySelector('a[href], .button-container a[href]');
  if (!phoneA) return false;
  const titleRaw = (cells[2]?.textContent || '').trim();
  return titleRaw.length > 0;
}

function venclextaCalloutModalDataId(titleText) {
  const compact = (titleText || '').replace(/[^a-zA-Z0-9]/g, '');
  const base = compact.length > 0 ? compact : 'Resource';
  return `linkTo${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}

function appendVenclextaPipeSplitContent(container, sourceEl) {
  const text = (sourceEl.textContent || '').trim();
  if (/^[^|<>]+\|[^|<>]+$/.test(text)) {
    const [left, right] = text.split('|').map((s) => s.trim());
    container.append(document.createTextNode(left));
    const em = document.createElement('em');
    em.textContent = right;
    container.append(em);
  } else {
    [...sourceEl.cloneNode(true).childNodes].forEach((n) => container.append(n));
  }
}

function populateVenclextaCalloutHeading(h3, titleCell) {
  if (!titleCell) return;
  const ps = [...titleCell.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
  if (ps.length === 0) {
    appendVenclextaPipeSplitContent(h3, titleCell);
  } else if (ps.length === 1) {
    appendVenclextaPipeSplitContent(h3, ps[0]);
  } else {
    ps.forEach((p, i) => {
      if (i > 0) h3.append(document.createElement('br'));
      [...p.cloneNode(true).childNodes].forEach((n) => h3.append(n));
    });
  }
}

function normalizeVenclextaTelHref(href) {
  const t = (href || '').trim();
  if (!t || t === '#') return '#';
  if (/^https?:\/\//i.test(t)) return t;
  if (/^tel:/i.test(t)) return t;
  const digits = t.replace(/\D/g, '');
  return digits.length > 0 ? `tel:${digits}` : t;
}

function buildVenclextaCalloutCardColumnFromUeRow(wrapper) {
  const cells = [...wrapper.querySelectorAll(':scope > div')];
  const titleCell = cells[2];
  const websiteCell = cells[3];
  const phoneCell = cells[4];
  const titlePlain = (titleCell?.textContent || '').trim();
  const phoneA = phoneCell?.querySelector('a[href], .button-container a[href]');
  let phoneHref = normalizeVenclextaTelHref(phoneA?.getAttribute('href') || '');
  if (phoneHref === '#') phoneHref = normalizeVenclextaTelHref(phoneA?.textContent || '');
  const phoneLabel = (phoneA?.getAttribute('aria-label') || phoneA?.textContent || '').trim()
    || phoneHref.replace(/^tel:/i, '');

  const websiteFromUe = cells[0]?.querySelector('a[href]') || websiteCell?.querySelector('a[href]');
  const websiteLabel = (websiteCell?.textContent || '').trim() || 'Website';

  const colItem = document.createElement('div');
  colItem.className = 'abbv-flex-item d-flex flex-col-xl-4 flex-justify_center';

  const flexboxParbaseOuter = document.createElement('div');
  flexboxParbaseOuter.className = 'flexbox parbase';

  const cardContainer = document.createElement('div');
  cardContainer.className = (
    'abbv-flex-container venclexta-gray-yellow-border-call-out flex-column '
    + 'abv-custom-bgcolor-white venxcleta-yellow-border-card'
  );

  const titleItem = document.createElement('div');
  titleItem.className = 'abbv-flex-item';
  const richTextOuter = document.createElement('div');
  richTextOuter.className = 'rich-text';
  const abbvRt = document.createElement('div');
  abbvRt.className = 'abbv-rich-text abbv-rich-text-common';
  const h3 = document.createElement('h3');
  populateVenclextaCalloutHeading(h3, titleCell);
  abbvRt.append(h3);
  richTextOuter.append(abbvRt);
  titleItem.append(richTextOuter);
  cardContainer.append(titleItem);

  const ctaRowItem = document.createElement('div');
  ctaRowItem.className = 'abbv-flex-item';
  const flexboxParbaseInner = document.createElement('div');
  flexboxParbaseInner.className = 'flexbox parbase';
  const leukemiaRow = document.createElement('div');
  leukemiaRow.className = 'abbv-flex-container leukemia-flex-wrap flex-row';

  const websiteCol = document.createElement('div');
  websiteCol.className = 'abbv-flex-item d-flex flex-col-6 flex-justify_center';
  const websiteCtaWrap = document.createElement('div');
  websiteCtaWrap.className = 'cta parbase';
  const websiteA = document.createElement('a');
  if (websiteFromUe) {
    const rawWebsiteHref = websiteFromUe.getAttribute('href') || '#';
    websiteA.href = /^javascript:/i.test(rawWebsiteHref) ? '#' : rawWebsiteHref;
    const tgt = websiteFromUe.getAttribute('target');
    if (tgt) websiteA.target = tgt;
    websiteA.textContent = (websiteFromUe.textContent || '').trim() || websiteLabel;
    websiteA.className = 'abbv-button-tertiary i-a material-font-ctas leukemia-min-width';
    websiteA.setAttribute('role', 'link');
  } else {
    websiteA.href = '#';
    websiteA.className = (
      'abbv-modal-open abbv-icon-call_made abbv-button-tertiary i-a material-font-ctas leukemia-min-width'
    );
    websiteA.setAttribute('data-id', venclextaCalloutModalDataId(titlePlain));
    websiteA.setAttribute('role', 'link');
    websiteA.setAttribute('aria-label', `${websiteLabel}, Opens in a new modal`);
    websiteA.setAttribute('tabindex', '0');
    websiteA.setAttribute('target', 'new-modal');
    websiteA.setAttribute('data-linktype', 'external');
    websiteA.setAttribute('aria-hidden', 'false');
    websiteA.textContent = websiteLabel;
  }
  websiteCtaWrap.append(websiteA);
  websiteCol.append(websiteCtaWrap);

  const phoneCol = document.createElement('div');
  phoneCol.className = 'abbv-flex-item d-flex flex-col-6 flex-justify_center';
  const phoneCtaWrap = document.createElement('div');
  phoneCtaWrap.className = 'cta parbase';
  const phoneLink = document.createElement('a');
  phoneLink.className = 'abbv-button-tertiary material-font-ctas leukemia-min-width pl-0 pr-0';
  phoneLink.href = phoneHref;
  phoneLink.setAttribute('role', 'link');
  phoneLink.setAttribute('aria-label', phoneLabel);
  phoneLink.setAttribute('target', '_self');
  phoneLink.setAttribute('data-linktype', 'internal');
  phoneLink.setAttribute('aria-hidden', 'false');
  phoneLink.textContent = (phoneA?.textContent || '').trim() || phoneLabel.replace(/\D/g, '');
  phoneCtaWrap.append(phoneLink);
  phoneCol.append(phoneCtaWrap);

  leukemiaRow.append(websiteCol);
  leukemiaRow.append(phoneCol);
  flexboxParbaseInner.append(leukemiaRow);
  ctaRowItem.append(flexboxParbaseInner);
  cardContainer.append(ctaRowItem);

  flexboxParbaseOuter.append(cardContainer);
  colItem.append(flexboxParbaseOuter);
  return colItem;
}

export default function decorate(block) {
  if (block.classList.contains('cards-grid-callout-cards')) {
    const wrappers = [...block.querySelectorAll(':scope > div')];
    if (wrappers.length === 0) return false;

    const cardCols = [];
    wrappers.forEach((w) => {
      if (isVenclextaCalloutUeRow(w)) {
        cardCols.push(buildVenclextaCalloutCardColumnFromUeRow(w));
      }
    });
    if (cardCols.length === 0) return false;

    wrappers.forEach((w) => {
      w.remove();
    });

    const outer = document.createElement('div');
    outer.className = (
      'abbv-flex-container flex-col-xl-10 flex-justify_center flex-column '
      + 'flex-xl-row m-xl-auto learn-more-callouts-flexbox'
    );
    cardCols.forEach((col) => {
      outer.append(col);
    });
    block.append(outer);
    return true;
  }

  return false;
}
