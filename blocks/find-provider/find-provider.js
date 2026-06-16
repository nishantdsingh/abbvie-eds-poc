import { renderBlock } from '../../scripts/multi-theme.js';

const MIN_LOADER_DELAY_MS = 800;

let blockCounter = 0;

function getBestAddress(provider) {
  const addresses = provider.PartyAddress || [];
  const best = addresses.find((a) => a.BestAddressIndicator === 'Yes');
  if (best) return best;
  if (addresses.length > 1) {
    return [...addresses].sort(
      (a, b) => parseFloat(a.DistanceInMiles || 9999) - parseFloat(b.DistanceInMiles || 9999),
    )[0];
  }
  return addresses[0] || {};
}

function extractParties(data) {
  const body = data?.PhysicianLocatorResponse?.PhysicianLocatorResponseBody;
  if (body) {
    if (body.IsStatusSuccessful === 'false') return { providers: [], matchCount: 0, recordCount: 10 };
    const content = body.ContentResult || {};
    return {
      providers: content.Party || [],
      matchCount: parseInt(content.MatchCount || '0', 10),
      recordCount: parseInt(content.RecordCount || '10', 10),
    };
  }
  const providers = data?.results || data?.providers || (Array.isArray(data) ? data : []);
  return { providers, matchCount: providers.length, recordCount: providers.length };
}

function resolveTokenColor(token, el) {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  el.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color || undefined;
}

function parseRadius(radiusStr) {
  const n = parseInt(radiusStr, 10);
  return Number.isNaN(n) ? 25 : n;
}

function isLatLng(query) {
  return /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(query.trim());
}

// Must match the field order in _find-provider.json (excluding tab, classes, and common-prop)
const FIELD_ORDER = [
  'search-label',
  'search-placeholder',
  'radius-label',
  'radius-options',
  'submit-label',
  'geo-button-label',
  'clear-label',
  'terms-label',
  'terms-text',
  'terms-error',
  'no-results',
  'error',
  'captcha-message',
  'results-title',
  'directions-label',
  'details-label',
  'api-endpoint',
  'indication',
  'exit-modal-id',
  'anchor-id',
];

const RICHTEXT_KEYS = new Set(['terms-text', 'captcha-message']);

// UE renders each field as a single-column row; Google Doc authoring uses key | value rows
function isUEMode(block) {
  const firstRow = block.children[0];
  return firstRow ? firstRow.children.length === 1 : false;
}

function readConfig(block) {
  const config = {};
  const rows = [...block.children];
  const ue = isUEMode(block);

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const key = ue ? FIELD_ORDER[i] : cells[0]?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const cell = ue ? cells[0] : cells[1];
    if (!key || !cell) return;
    config[key] = RICHTEXT_KEYS.has(key) ? cell.innerHTML.trim() : cell.textContent.trim();
  });

  return config;
}

function buildForm(config, blockId, isLocation) {
  const form = document.createElement('form');
  form.className = 'find-provider-form';
  form.setAttribute('novalidate', '');

  // Search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = `${blockId}-search`;
  searchInput.name = 'search';
  searchInput.className = 'find-provider-search-input';
  if (config['search-placeholder']) searchInput.placeholder = config['search-placeholder'];

  const searchGroup = document.createElement('div');
  searchGroup.className = 'find-provider-field-group';
  if (config['search-label']) {
    const label = document.createElement('label');
    label.htmlFor = searchInput.id;
    label.className = 'find-provider-label';
    label.textContent = config['search-label'];
    searchGroup.append(label);
  }

  const searchRow = document.createElement('div');
  searchRow.className = 'find-provider-search-row';
  searchRow.append(searchInput);

  if (isLocation && config['geo-button-label']) {
    const geoBtn = document.createElement('button');
    geoBtn.type = 'button';
    geoBtn.className = 'find-provider-geo-btn';
    const geoIcon = document.createElement('span');
    geoIcon.className = 'find-provider-geo-icon';
    geoIcon.setAttribute('aria-hidden', 'true');
    const geoText = document.createElement('span');
    geoText.textContent = config['geo-button-label'];
    geoBtn.append(geoIcon, geoText);
    searchRow.append(geoBtn);
  }

  searchGroup.append(searchRow);

  const searchError = document.createElement('span');
  searchError.className = 'find-provider-error find-provider-search-error';
  searchError.setAttribute('aria-live', 'polite');
  searchGroup.append(searchError);

  const formWrap = document.createElement('div');
  formWrap.className = 'find-provider-form-wrap';
  formWrap.append(searchGroup);

  // Terms & Conditions checkbox
  if (config['terms-label'] || config['terms-text']) {
    const termsGroup = document.createElement('div');
    termsGroup.className = 'find-provider-field-group find-provider-terms-group';

    if (config['terms-label']) {
      const termsHeading = document.createElement('span');
      termsHeading.className = 'find-provider-label';
      termsHeading.textContent = config['terms-label'];
      termsGroup.append(termsHeading);
    }

    const termsCheckboxLabel = document.createElement('label');
    termsCheckboxLabel.className = 'find-provider-terms-label';
    termsCheckboxLabel.htmlFor = `${blockId}-terms`;

    const termsCheckbox = document.createElement('input');
    termsCheckbox.type = 'checkbox';
    termsCheckbox.id = `${blockId}-terms`;
    termsCheckbox.className = 'find-provider-terms-checkbox';
    termsCheckbox.name = 'terms';

    const termsText = document.createElement('span');
    termsText.className = 'find-provider-terms-text';
    if (config['terms-text']) {
      const parser = new DOMParser();
      const sanitized = parser.parseFromString(config['terms-text'], 'text/html');
      [...sanitized.body.childNodes].forEach((n) => termsText.append(n));
    }

    termsCheckboxLabel.append(termsCheckbox, termsText);
    termsGroup.append(termsCheckboxLabel);

    const termsError = document.createElement('span');
    termsError.className = 'find-provider-error find-provider-terms-error';
    termsError.setAttribute('aria-live', 'polite');
    termsGroup.append(termsError);

    formWrap.append(termsGroup);
  }

  const actions = document.createElement('div');
  actions.className = 'find-provider-actions';

  if (config['submit-label']) {
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'find-provider-submit button primary';
    submitBtn.textContent = config['submit-label'];
    actions.append(submitBtn);
  }

  if (config['clear-label']) {
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'find-provider-clear button';
    clearBtn.textContent = config['clear-label'];
    actions.append(clearBtn);
  }

  formWrap.append(actions);
  form.append(formWrap);

  if (config['captcha-message']) {
    const captcha = document.createElement('div');
    captcha.className = 'find-provider-captcha-message';
    const parser = new DOMParser();
    const sanitized = parser.parseFromString(config['captcha-message'], 'text/html');
    [...sanitized.body.childNodes].forEach((n) => captcha.append(n));
    form.append(captcha);
  }

  return form;
}

function letterFromIndex(index) {
  return String.fromCharCode(65 + (index % 26));
}

function buildResultCard(provider, config, index = 0) {
  const li = document.createElement('li');
  li.className = 'find-provider-result';

  const address = getBestAddress(provider);
  const phone = provider.Communication?.find(
    (c) => c.CommunicationTypeCode === '203200' || c.CommunicationTypeDescription === 'Telephone',
  )?.CommunicationValueText || provider.phone || '';

  const pin = document.createElement('span');
  pin.className = 'find-provider-result-pin';
  pin.textContent = letterFromIndex(index);
  pin.setAttribute('aria-hidden', 'true');
  li.append(pin);

  const degree = provider.HCPExtension?.DegreeCode || provider.specialty || '';
  const fullName = [provider.PartyName || provider.name || '', degree].filter(Boolean).join(', ');
  const name = document.createElement('strong');
  name.className = 'find-provider-result-name';
  name.textContent = fullName;
  li.append(name);

  const body = document.createElement('div');
  body.className = 'find-provider-result-body';

  const addr1 = address.AddressLine1 || provider.address || '';
  const city = address.CityName || '';
  const state = address.StateProvinceCode || '';
  const zip = address.PostalCode || '';
  const addressEl = document.createElement('address');
  addressEl.className = 'find-provider-result-address';
  if (addr1) {
    const line1 = document.createElement('span');
    line1.textContent = addr1;
    addressEl.append(line1);
    const cityStateZip = [city, state, zip].filter(Boolean).join(', ');
    if (cityStateZip) {
      const line2 = document.createElement('span');
      line2.textContent = cityStateZip;
      addressEl.append(line2);
    }
  }
  body.append(addressEl);

  const meta = document.createElement('div');
  meta.className = 'find-provider-result-meta';

  const rawDist = address.DistanceInMiles;
  const distance = rawDist
    ? `${parseFloat(rawDist).toFixed(1)} mi`
    : provider.distance || provider.DistanceText || '';
  if (distance) {
    const distEl = document.createElement('span');
    distEl.className = 'find-provider-result-distance';
    distEl.textContent = distance;
    meta.append(distEl);
  }

  if (addr1) {
    if (distance) {
      const sep = document.createElement('span');
      sep.className = 'find-provider-result-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '|';
      meta.append(sep);
    }
    const rawBase = config['directions-base-url'];
    const safeBase = rawBase && /^https?:\/\//i.test(rawBase) ? rawBase : null;
    if (safeBase) {
      const dest = encodeURIComponent(`${addr1} ${city}, ${state} ${zip}`.trim());
      const dirLink = document.createElement('a');
      dirLink.href = safeBase + dest;
      dirLink.target = '_blank';
      dirLink.rel = 'noopener noreferrer';
      dirLink.className = 'find-provider-result-directions';
      dirLink.textContent = config['directions-label'] || 'Get Directions';
      meta.append(dirLink);
    }
  }

  if (meta.childNodes.length) body.append(meta);

  if (phone) {
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${phone.replace(/\D/g, '')}`;
    phoneLink.className = 'find-provider-result-phone';
    phoneLink.textContent = phone;
    body.append(phoneLink);
  }

  const detailsBtn = document.createElement('button');
  detailsBtn.type = 'button';
  detailsBtn.className = 'find-provider-result-details';
  detailsBtn.setAttribute('aria-expanded', 'false');
  detailsBtn.append(`${config['details-label'] || 'Show all practice details'} `);
  const detailsIcon = document.createElement('span');
  detailsIcon.className = 'find-provider-result-details-icon';
  detailsIcon.setAttribute('aria-hidden', 'true');
  detailsIcon.textContent = '+';
  detailsBtn.append(detailsIcon);
  body.append(detailsBtn);

  li.append(body);

  if (config['exit-modal-id']) {
    li.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      li.dispatchEvent(new CustomEvent('find-provider:open-modal', {
        bubbles: true,
        detail: { provider, modalId: config['exit-modal-id'] },
      }));
    });
  }

  return li;
}

function buildResultsHeader(config) {
  const header = document.createElement('header');
  header.className = 'find-provider-results-header';

  const title = document.createElement('h2');
  title.className = 'find-provider-results-title';
  title.textContent = config['results-title'] || 'Results found';
  header.append(title);

  const radiusGroup = document.createElement('div');
  radiusGroup.className = 'find-provider-results-radius';

  if (config['radius-label']) {
    const radiusLabel = document.createElement('span');
    radiusLabel.className = 'find-provider-results-radius-label';
    radiusLabel.textContent = config['radius-label'];
    radiusGroup.append(radiusLabel);
  }

  const radiusSelect = document.createElement('select');
  radiusSelect.className = 'find-provider-results-radius-select';
  if (config['radius-label']) radiusSelect.setAttribute('aria-label', config['radius-label']);
  const radiusOptionList = config['radius-options']
    ? config['radius-options'].split(',').map((s) => s.trim()).filter(Boolean)
    : ['5 Miles', '10 Miles', '25 Miles', '50 Miles', '100 Miles'];
  radiusOptionList.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    radiusSelect.append(opt);
  });
  radiusSelect.value = radiusOptionList[0] || '';
  const selectWrapper = document.createElement('div');
  selectWrapper.className = 'find-provider-select-wrapper';
  selectWrapper.append(radiusSelect);
  radiusGroup.append(selectWrapper);

  header.append(radiusGroup);
  return header;
}

async function getConfigValue(key) {
  try {
    const resp = await fetch('/ab-config.json');
    if (!resp.ok) return null;
    const json = await resp.json();
    return json.data?.find(({ key: k }) => k === key)?.value || null;
  } catch {
    return null;
  }
}

export async function decorateBlock(block) {
  blockCounter += 1;
  const blockId = `fp-${blockCounter}`;
  const config = readConfig(block);
  const directionsBaseUrl = await getConfigValue('directions-base-url');
  if (directionsBaseUrl) config['directions-base-url'] = directionsBaseUrl;
  let lastQuery = null;
  let currentPage = 1;
  let totalPages = 1;
  let mapInitialized = false;
  let mapsFallbackUrl = null;

  if (config['anchor-id']) block.id = config['anchor-id'];

  const isLocation = block.classList.contains('find-provider-location');
  const isMapVariant = block.classList.contains('find-provider-map');

  const status = document.createElement('p');
  status.className = 'find-provider-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  const loader = document.createElement('div');
  loader.className = 'find-provider-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-label', 'Searching providers');
  const spinner = document.createElement('div');
  spinner.className = 'find-provider-loader-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  loader.append(spinner);

  const results = document.createElement('ul');
  results.className = 'find-provider-results';

  let mapContainer = null;
  if (isMapVariant) {
    mapContainer = document.createElement('div');
    mapContainer.id = `find-provider-map-${blockId}`;
    mapContainer.className = 'find-provider-map-container';
    mapContainer.setAttribute('role', 'region');
    mapContainer.setAttribute('aria-label', 'Provider map');
  }

  const form = buildForm(config, blockId, isLocation);
  const searchInput = form.querySelector('.find-provider-search-input');
  const clearBtn = form.querySelector('.find-provider-clear');
  const geoBtn = form.querySelector('.find-provider-geo-btn');
  const termsCheckbox = form.querySelector('.find-provider-terms-checkbox');

  const resultsPanel = document.createElement('div');
  resultsPanel.className = 'find-provider-results-panel';
  resultsPanel.append(buildResultsHeader(config));

  const resultsLayout = document.createElement('div');
  resultsLayout.className = 'find-provider-results-layout';
  resultsLayout.append(results);
  if (mapContainer) resultsLayout.append(mapContainer);
  resultsPanel.append(resultsLayout);

  const paginationNav = document.createElement('nav');
  paginationNav.className = 'find-provider-pagination';
  paginationNav.setAttribute('aria-label', 'Results pagination');
  resultsPanel.append(paginationNav);

  function rebuildPagination(total, active) {
    paginationNav.innerHTML = '';
    delete paginationNav.dataset.paginationBuilt;
    totalPages = total;
    if (total <= 0) return;

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'find-provider-pagination-btn find-provider-pagination-prev';
    prevBtn.setAttribute('aria-label', 'Previous page');
    prevBtn.disabled = active === 1;
    paginationNav.append(prevBtn);

    for (let i = 1; i <= total; i += 1) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'find-provider-pagination-page';
      if (i === active) { pageBtn.classList.add('is-active'); pageBtn.setAttribute('aria-current', 'page'); }
      pageBtn.textContent = String(i);
      pageBtn.setAttribute('aria-label', `Page ${i}`);
      pageBtn.dataset.page = String(i);
      paginationNav.append(pageBtn);
      if (i < total) {
        const sep = document.createElement('span');
        sep.className = 'find-provider-pagination-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        paginationNav.append(sep);
      }
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'find-provider-pagination-btn find-provider-pagination-next';
    nextBtn.setAttribute('aria-label', 'Next page');
    nextBtn.disabled = active === total;
    paginationNav.append(nextBtn);

    paginationNav.dispatchEvent(new CustomEvent('find-provider:pagination-rebuilt', { bubbles: true }));
  }

  async function renderProviders(providers, matchCount = 0, recordCount = 10, page = 1) {
    status.textContent = '';
    results.innerHTML = '';
    currentPage = page;
    if (!providers.length) {
      status.textContent = config['no-results'];
      rebuildPagination(0, 1);
      return;
    }
    providers.forEach((p, idx) => results.append(buildResultCard(p, config, idx)));
    rebuildPagination(Math.max(1, Math.ceil(matchCount / recordCount)), page);
    if (isMapVariant) {
      try {
        const { updateMapMarkers } = await import('../eds-form/maps.js');
        const markerFill = resolveTokenColor('--find-provider-color-pin-bg', block);
        const markerLabel = resolveTokenColor('--find-provider-color-pin-text', block);
        updateMapMarkers(providers, 0, markerFill, markerLabel);
      } catch {
        // Map not ready yet — markers will be set when initializeMap resolves
      }
    }
  }

  function showMapFallback(fallbackUrl) {
    if (!mapContainer) return;
    mapContainer.innerHTML = '';
    if (!fallbackUrl || !/^https?:\/\//i.test(fallbackUrl)) return;
    const iframe = document.createElement('iframe');
    iframe.src = fallbackUrl;
    iframe.title = 'Provider locations';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');
    iframe.className = 'find-provider-map-iframe';
    mapContainer.append(iframe);
  }

  async function doSearch(query, page = 1, radius = 25) {
    status.textContent = '';
    results.innerHTML = '';

    try {
      if (!config['api-endpoint']) throw new Error('api-endpoint not configured');

      const pageSize = 10;
      const recordsFrom = (page - 1) * pageSize;

      const innerReq = {};
      if (config.indication) innerReq.PublisherName = config.indication;
      if (isLatLng(query)) {
        const [lat, lng] = query.split(',');
        innerReq.GeoCoordinates = { Latitude: lat.trim(), Longitude: lng.trim() };
      } else {
        innerReq.Zip = query;
      }
      innerReq.SearchRadius = String(radius);
      innerReq.TermsConditionsCheck = 'Y';
      innerReq.RecordsFrom = String(recordsFrom);
      innerReq.RecordCount = String(pageSize);

      const token = await getConfigValue('find-provider-token');
      const body = {
        brandName: '',
        actionType: 'apigee',
        apiEndpointType: 'prod',
        formAction: 'PhysicianLocator',
        originName: 'originNameWeb',
        payload: JSON.stringify({ PhysicianLocatorRequest: innerReq }),
        token: token || '',
        version: 'V2',
      };

      const resp = await fetch(config['api-endpoint'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const { providers, matchCount, recordCount } = extractParties(data);
      await renderProviders(providers, matchCount, recordCount, page);
    } catch {
      if (isMapVariant && !mapInitialized) showMapFallback(mapsFallbackUrl);

      try {
        const fallbackResp = await fetch('/blocks/find-provider/dummy-providers.json');
        if (!fallbackResp.ok) throw new Error(`HTTP ${fallbackResp.status}`);
        const fallbackData = await fallbackResp.json();
        const { providers, matchCount, recordCount } = extractParties(fallbackData);
        await renderProviders(providers, matchCount, recordCount, page);
        return;
      } catch {
        // dummy data unavailable — fall through to error message
      }

      status.textContent = config.error || 'Unable to load results. Please try again.';
      rebuildPagination(0, 1);
    }
  }

  async function runSearchFlow(query, page = 1) {
    lastQuery = query;
    const radiusSelect = resultsPanel.querySelector('.find-provider-results-radius-select');
    const radius = parseRadius(radiusSelect?.value || '5 Miles');
    loader.classList.add('is-visible');
    const minDelay = new Promise((resolve) => { setTimeout(resolve, MIN_LOADER_DELAY_MS); });
    await Promise.all([doSearch(query, page, radius), minDelay]);
    loader.classList.remove('is-visible');
    resultsPanel.classList.add('is-visible');
  }

  // Delegated listener — wired once so rebuilding paginationNav doesn't lose handlers
  paginationNav.addEventListener('click', (e) => {
    if (!lastQuery) return;
    const pageBtn = e.target.closest('.find-provider-pagination-page');
    const prevBtn = e.target.closest('.find-provider-pagination-prev');
    const nextBtn = e.target.closest('.find-provider-pagination-next');
    const catchFn = () => { loader.classList.remove('is-visible'); };
    if (pageBtn) {
      const page = parseInt(pageBtn.dataset.page, 10);
      if (page !== currentPage) runSearchFlow(lastQuery, page).catch(catchFn);
    } else if (prevBtn && currentPage > 1) {
      runSearchFlow(lastQuery, currentPage - 1).catch(catchFn);
    } else if (nextBtn && currentPage < totalPages) {
      runSearchFlow(lastQuery, currentPage + 1).catch(catchFn);
    }
  });

  const radiusSelectEl = resultsPanel.querySelector('.find-provider-results-radius-select');
  if (radiusSelectEl) {
    radiusSelectEl.addEventListener('change', () => {
      if (lastQuery !== null) runSearchFlow(lastQuery, 1).catch(() => { loader.classList.remove('is-visible'); });
    });
  }

  const searchError = form.querySelector('.find-provider-search-error');
  const termsError = form.querySelector('.find-provider-terms-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput?.value.trim() || '';

    let hasError = false;
    if (!query) {
      if (searchError) searchError.textContent = 'Please enter a valid ZIP code or city';
      hasError = true;
    } else if (searchError) {
      searchError.textContent = '';
    }

    if (termsCheckbox && !termsCheckbox.checked) {
      if (termsError) termsError.textContent = config['terms-error'] || 'Please agree to the Terms & Conditions';
      hasError = true;
    } else if (termsError) {
      termsError.textContent = '';
    }

    if (hasError) return;
    runSearchFlow(query).catch(() => { loader.classList.remove('is-visible'); });
  });

  if (searchInput && searchError) {
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim()) searchError.textContent = '';
    });
  }

  if (termsCheckbox && termsError) {
    termsCheckbox.addEventListener('change', () => {
      if (termsCheckbox.checked) termsError.textContent = '';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form.reset();
      results.innerHTML = '';
      status.textContent = '';
      resultsPanel.classList.remove('is-visible');
      loader.classList.remove('is-visible');
      form.querySelectorAll('.find-provider-error').forEach((el) => { el.textContent = ''; });
    });
  }

  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!('geolocation' in navigator)) return;
      if (termsCheckbox && !termsCheckbox.checked) return;
      geoBtn.disabled = true;
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          geoBtn.disabled = false;
          runSearchFlow(`${coords.latitude},${coords.longitude}`).catch(() => { loader.classList.remove('is-visible'); });
        },
        () => {
          geoBtn.disabled = false;
        },
        { timeout: 8000 },
      );
    });
  }

  block.replaceChildren(form, status, loader, resultsPanel);

  if (isMapVariant) {
    const [mapsApiKey, fetchedFallbackUrl] = await Promise.all([
      getConfigValue('maps-api-key'),
      getConfigValue('maps-fallback-url'),
    ]);
    mapsFallbackUrl = fetchedFallbackUrl;
    if (mapsApiKey) {
      // gm_authFailure fires for RefererNotAllowedMapError, InvalidKeyMapError, etc.
      // authFailed guards against the race where the callback fires after initializeMap resolves.
      let authFailed = false;
      const prevAuthFailure = window.gm_authFailure;
      window.gm_authFailure = () => {
        if (typeof prevAuthFailure === 'function') prevAuthFailure();
        authFailed = true;
        showMapFallback(mapsFallbackUrl);
      };

      try {
        const { loadGoogleMapsAPI, initializeMap } = await import('../eds-form/maps.js');
        await loadGoogleMapsAPI(mapsApiKey);
        if (!authFailed) {
          await initializeMap(mapsApiKey, mapContainer);
          mapInitialized = true;
        }
      } catch {
        showMapFallback(mapsFallbackUrl);
      }
    } else {
      showMapFallback(mapsFallbackUrl);
    }
  }
}

export default async function decorate(block) {
  await renderBlock(block);
}
