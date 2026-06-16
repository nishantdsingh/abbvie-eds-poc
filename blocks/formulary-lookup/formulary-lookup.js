import { getRecaptchaToken } from '../eds-form/recaptcha.js';
import { getMetadata } from '../../scripts/aem.js';

const DEFAULT_FLAGS = {
  showIcon: true,
  showRecaptchaNotice: true,
  showDisclaimer: true,
  disclaimerModal: false,
  submitIconEnabled: false,
  headingTag: 'h2',
  autoSubmitOnStateChange: true,
};

async function loadFormularyConfig() {
  const brand = getMetadata('brand')?.trim();
  const imports = [
    import('./block-config.js').catch(() => null),
  ];
  if (brand) {
    imports.push(import(`./${brand}/block-config.js`).catch(() => null));
  }
  const [globalMod, brandMod] = await Promise.all(imports);
  const globalCfg = globalMod ? await globalMod.default() : {};
  const brandCfg = brandMod ? await brandMod.default() : {};
  return {
    ...DEFAULT_FLAGS,
    ...globalCfg.flags,
    ...brandCfg.flags,
  };
}

const US_STATES = [
  ['Alabama', 'AL'], ['Alaska', 'AK'], ['Arizona', 'AZ'], ['Arkansas', 'AR'], ['California', 'CA'],
  ['Colorado', 'CO'], ['Connecticut', 'CT'], ['Delaware', 'DE'], ['Florida', 'FL'], ['Georgia', 'GA'],
  ['Hawaii', 'HI'], ['Idaho', 'ID'], ['Illinois', 'IL'], ['Indiana', 'IN'], ['Iowa', 'IA'],
  ['Kansas', 'KS'], ['Kentucky', 'KY'], ['Louisiana', 'LA'], ['Maine', 'ME'], ['Maryland', 'MD'],
  ['Massachusetts', 'MA'], ['Michigan', 'MI'], ['Minnesota', 'MN'], ['Mississippi', 'MS'], ['Missouri', 'MO'],
  ['Montana', 'MT'], ['Nebraska', 'NE'], ['Nevada', 'NV'], ['New Hampshire', 'NH'], ['New Jersey', 'NJ'],
  ['New Mexico', 'NM'], ['New York', 'NY'], ['North Carolina', 'NC'], ['North Dakota', 'ND'], ['Ohio', 'OH'],
  ['Oklahoma', 'OK'], ['Oregon', 'OR'], ['Pennsylvania', 'PA'], ['Rhode Island', 'RI'], ['South Carolina', 'SC'],
  ['South Dakota', 'SD'], ['Tennessee', 'TN'], ['Texas', 'TX'], ['Utah', 'UT'], ['Vermont', 'VT'],
  ['Virginia', 'VA'], ['Washington', 'WA'], ['West Virginia', 'WV'], ['Wisconsin', 'WI'], ['Wyoming', 'WY'],
];

const RICHTEXT_KEYS = new Set(['recaptcha-notice', 'disclaimer']);
const INLINE_HTML_KEYS = new Set(['heading', 'description']);
const tooltipControllers = new WeakMap();

const FIELD_ORDER = [
  'icon', 'heading', 'description', 'state-label', 'county-label',
  'zip-label', 'zip-placeholder', 'submit-label', 'filter-label', 'filter-options',
  'indication-label', 'indications', 'api', 'recaptcha-key', 'results-per-page',
  'no-results', 'error', 'recaptcha-notice', 'disclaimer', 'analyticsid',
];

function unwrapSingleP(html) {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p[^>]*>([\s\S]*)<\/p>$/i);
  return match ? match[1].trim() : trimmed;
}

function readValue(key, cell) {
  if (RICHTEXT_KEYS.has(key)) return cell?.innerHTML.trim() || '';
  if (INLINE_HTML_KEYS.has(key)) return unwrapSingleP(cell?.innerHTML.trim() || '');
  if (key === 'icon') {
    const img = cell?.querySelector('img');
    return img?.getAttribute('src') || cell?.textContent.trim() || '';
  }
  return cell?.textContent.trim() || '';
}

function findPropKey(cell) {
  const prop = cell?.dataset?.aueProp || cell?.dataset?.richtextProp;
  if (prop) return prop;
  const child = cell?.querySelector('[data-aue-prop],[data-richtext-prop]');
  return child?.dataset?.aueProp || child?.dataset?.richtextProp || '';
}

function isUEMode(block) {
  const rows = [...block.children];
  if (!rows.length) return false;
  const firstRow = rows[0];
  const cells = [...firstRow.children];
  if (cells.length === 1) return true;
  if (cells.length === 2 && findPropKey(cells[0])) return true;
  return false;
}

function parseConfig(block) {
  const config = {};
  const rows = [...block.children];

  if (isUEMode(block)) {
    rows.forEach((row, i) => {
      const cell = row.children[0];
      const key = findPropKey(cell) || (i < FIELD_ORDER.length ? FIELD_ORDER[i] : '');
      if (!key) return;
      const normalKey = key.toLowerCase().replace(/\s+/g, '-');
      config[normalKey] = readValue(normalKey, cell);
    });
  } else {
    rows.forEach((row) => {
      const cells = [...row.children];
      const key = cells[0]?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      const valueCell = cells[1] || cells[0];
      config[key] = readValue(key, valueCell);
    });
  }
  return config;
}

function createStateSelect(config, id) {
  const label = document.createElement('label');
  label.className = 'formulary-lookup-label';
  label.htmlFor = id;
  label.textContent = config['state-label'] || 'Select your state';

  const select = document.createElement('select');
  select.id = id;
  select.className = 'formulary-lookup-select';
  select.setAttribute('aria-label', config['state-label'] || 'Select your state');

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— Select a state —';
  select.append(defaultOpt);

  US_STATES.forEach(([name, code]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    select.append(opt);
  });

  return { label, select };
}

function createCountySelect(config, id) {
  const wrapper = document.createElement('div');
  wrapper.className = 'formulary-lookup-county-wrapper';
  wrapper.hidden = true;

  const label = document.createElement('label');
  label.className = 'formulary-lookup-label';
  label.htmlFor = id;
  label.textContent = config['county-label'] || 'Select your county';

  const select = document.createElement('select');
  select.id = id;
  select.className = 'formulary-lookup-select';
  select.setAttribute('aria-label', config['county-label'] || 'Select your county');
  select.disabled = true;

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— Select a county —';
  select.append(defaultOpt);

  wrapper.append(label, select);
  return { wrapper, select };
}

function createZipForm(config) {
  const form = document.createElement('form');
  form.className = 'formulary-lookup-zip-form';
  form.setAttribute('novalidate', '');

  const label = document.createElement('label');
  label.className = 'formulary-lookup-label';
  label.htmlFor = 'formulary-zip';
  label.textContent = config['zip-label'] || 'Enter your ZIP code';

  const inputGroup = document.createElement('div');
  inputGroup.className = 'formulary-lookup-input-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'formulary-zip';
  input.className = 'formulary-lookup-zip-input';
  input.pattern = '[0-9]{5}';
  input.inputMode = 'numeric';
  input.maxLength = 5;
  input.placeholder = config['zip-placeholder'] || '';
  input.setAttribute('aria-label', config['zip-label'] || 'Enter your ZIP code');
  input.required = true;

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'formulary-lookup-submit';
  btn.textContent = config['submit-label'] || 'Search';

  inputGroup.append(input, btn);
  form.append(label, inputGroup);
  return { form, input };
}

function createStatus() {
  const status = document.createElement('div');
  status.className = 'formulary-lookup-status';
  status.setAttribute('aria-live', 'polite');
  return status;
}

function createResultsContainer() {
  const results = document.createElement('div');
  results.className = 'formulary-lookup-results';
  return results;
}

function showLoading(status) {
  status.innerHTML = '';
  const spinner = document.createElement('div');
  spinner.className = 'formulary-lookup-loading';
  spinner.setAttribute('aria-label', 'Loading results');
  status.append(spinner);
}

function showMessage(status, msg, isError = false) {
  status.textContent = msg;
  status.classList.toggle('error', isError);
}

function createErrorTooltip(msg, container) {
  const existing = container.querySelector('.formulary-lookup-error-tooltip');
  if (existing) {
    const oldController = tooltipControllers.get(existing);
    if (oldController) oldController.abort();
    existing.remove();
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'formulary-lookup-error-tooltip';
  tooltip.setAttribute('role', 'alert');
  tooltip.setAttribute('aria-live', 'assertive');

  const text = document.createElement('span');
  text.className = 'formulary-lookup-error-tooltip-text';
  text.textContent = msg;

  const controller = new AbortController();
  tooltipControllers.set(tooltip, controller);

  function dismiss() {
    tooltip.remove();
    controller.abort();
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'formulary-lookup-error-tooltip-close';
  closeBtn.setAttribute('aria-label', 'Dismiss error');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', dismiss);

  tooltip.append(text, closeBtn);
  const formEl = container.classList.contains('formulary-lookup-form')
    ? container
    : (container.querySelector('.formulary-lookup-form') || container);
  formEl.append(tooltip);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tooltip.parentNode) dismiss();
  }, { signal: controller.signal });

  return tooltip;
}

function createErrorModal(msg, state) {
  if (state.overlay) {
    state.overlay.remove();
    state.overlay = null;
  }
  if (state.abort) state.abort.abort();

  const overlay = document.createElement('div');
  overlay.className = 'formulary-lookup-error-overlay';

  const modal = document.createElement('div');
  modal.className = 'formulary-lookup-error-modal';
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Error');

  const content = document.createElement('div');
  content.className = 'formulary-lookup-error-modal-content';
  content.textContent = msg;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'formulary-lookup-error-modal-close';
  closeBtn.setAttribute('aria-label', 'Close error');
  closeBtn.textContent = '✕';

  modal.append(content, closeBtn);
  overlay.append(modal);
  state.container.append(overlay);
  state.overlay = overlay;

  const controller = new AbortController();
  state.abort = controller;

  function close() {
    overlay.remove();
    state.overlay = null;
    controller.abort();
  }

  function keydownHandler(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', keydownHandler, { signal: controller.signal });

  closeBtn.focus();
  return overlay;
}

function showError(msg, flags, container, modalState) {
  if (flags.errorDisplayMode === 'modal') {
    createErrorModal(msg, modalState);
  } else {
    createErrorTooltip(msg, container);
  }
}

function renderResultsTable(plans, results, config, page) {
  results.innerHTML = '';
  const perPage = parseInt(config['results-per-page'], 10) || 10;
  const totalPages = Math.ceil(plans.length / perPage);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const slice = plans.slice(start, start + perPage);

  const heading = document.createElement('h3');
  heading.className = 'formulary-results-heading';
  heading.textContent = 'Formulary Status Results';
  results.append(heading);

  const list = document.createElement('div');
  list.className = 'formulary-results-list';
  list.setAttribute('role', 'table');
  list.setAttribute('aria-label', 'Insurance Plans');

  const header = document.createElement('div');
  header.className = 'formulary-results-header';
  header.setAttribute('role', 'rowgroup');
  ['Plan Name', 'Plan Type', 'Status'].forEach((t) => {
    const col = document.createElement('div');
    col.className = 'formulary-results-col';
    col.setAttribute('role', 'columnheader');
    col.textContent = t;
    header.append(col);
  });
  list.append(header);

  slice.forEach((plan) => {
    const row = document.createElement('div');
    row.className = 'formulary-results-row';
    row.setAttribute('role', 'row');

    const colName = document.createElement('div');
    colName.className = 'formulary-results-col formulary-col-name';
    colName.setAttribute('role', 'cell');
    colName.textContent = plan.name || '';

    const colType = document.createElement('div');
    colType.className = 'formulary-results-col formulary-col-type';
    colType.setAttribute('role', 'cell');
    colType.textContent = plan.type || plan.tier || '';

    const colStatus = document.createElement('div');
    colStatus.className = 'formulary-results-col formulary-col-status';
    colStatus.setAttribute('role', 'cell');
    colStatus.textContent = plan.status || plan.detail || '';

    row.append(colName, colType, colStatus);
    list.append(row);
  });
  results.append(list);

  if (totalPages > 1) {
    const pagination = document.createElement('div');
    pagination.className = 'formulary-pagination';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'formulary-pagination-btn';
    prevBtn.setAttribute('aria-label', 'Previous page');
    prevBtn.innerHTML = '&#8249;';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener('click', () => {
      renderResultsTable(plans, results, config, currentPage - 1);
    });

    pagination.append(prevBtn);
    for (let p = 1; p <= totalPages; p += 1) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'formulary-pagination-num';
      if (p === currentPage) pageBtn.classList.add('is-active');
      pageBtn.textContent = p;
      pageBtn.setAttribute('aria-label', `Page ${p}`);
      pageBtn.addEventListener('click', () => {
        renderResultsTable(plans, results, config, p);
      });
      pagination.append(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'formulary-pagination-btn';
    nextBtn.setAttribute('aria-label', 'Next page');
    nextBtn.innerHTML = '&#8250;';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener('click', () => {
      renderResultsTable(plans, results, config, currentPage + 1);
    });

    pagination.append(nextBtn);
    results.append(pagination);
  }
}

async function fetchWithRecaptcha(url, config) {
  const headers = {};
  if (config['recaptcha-key']) {
    try {
      const token = await getRecaptchaToken(config['recaptcha-key'], 'formulary_lookup');
      headers['x-recaptcha-token'] = token;
    } catch {
      // proceed without token if reCAPTCHA fails
    }
  }
  const resp = await fetch(url, { headers });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

function applyAnalytics(el, config) {
  if (config.analyticsid) {
    el.setAttribute('data-analytics', config.analyticsid);
  }
}

function buildDefaultVariant(config, section, status, results, flags, modalState) {
  const { label, select } = createStateSelect(config, 'formulary-state');
  applyAnalytics(select, config);
  section.append(label, select);

  const hasSubmitBtn = !!config['submit-label'];
  let disclaimerShown = false;

  async function lookupState() {
    const state = select.value;
    if (!state) {
      results.innerHTML = '';
      showMessage(status, '');
      return;
    }
    results.innerHTML = '';

    if (!config.api) {
      const disclaimerEl = section.closest('.formulary-lookup')
        ?.querySelector('.formulary-lookup-disclaimer-overlay');
      if (disclaimerEl && typeof disclaimerEl.open === 'function') {
        disclaimerEl.open();
      } else {
        showError(config.error || 'The data was not able to be loaded. Please try again.', flags, section, modalState);
      }
      return;
    }
    showLoading(status);
    try {
      const data = await fetchWithRecaptcha(`${config.api}?state=${encodeURIComponent(state)}`, config);
      const plans = data.plans || data.results || data || [];
      if (!plans.length) {
        showMessage(status, config['no-results'] || 'No coverage information found.');
        return;
      }
      showMessage(status, '');
      renderResultsTable(plans, results, config, 1);

      if (!disclaimerShown && flags.disclaimerModal && config.disclaimer) {
        disclaimerShown = true;
        const disclaimerEl = section.closest('.formulary-lookup')
          ?.querySelector('.formulary-lookup-disclaimer-overlay');
        if (disclaimerEl && typeof disclaimerEl.open === 'function') disclaimerEl.open();
      }
    } catch {
      showError(config.error || 'The data was not able to be loaded. Please try again.', flags, section, modalState);
    }
  }

  if (hasSubmitBtn) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'formulary-lookup-submit';
    if (flags.submitIconEnabled) btn.classList.add('has-icon');
    btn.textContent = config['submit-label'];
    applyAnalytics(btn, config);
    section.append(btn);
    btn.addEventListener('click', lookupState);
  } else if (flags.autoSubmitOnStateChange !== false) {
    select.addEventListener('change', lookupState);
  }
}

function buildDynamicVariant(config, section, status, results, flags, modalState) {
  const { label: stateLabel, select: stateSelect } = createStateSelect(config, 'formulary-state');
  const { wrapper: countyWrapper, select: countySelect } = createCountySelect(config, 'formulary-county');
  applyAnalytics(countySelect, config);
  section.append(stateLabel, stateSelect, countyWrapper);

  stateSelect.addEventListener('change', async () => {
    const state = stateSelect.value;
    countySelect.innerHTML = '';
    results.innerHTML = '';
    showMessage(status, '');

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '— Select a county —';
    countySelect.append(defaultOpt);

    if (!state || !config.api) {
      countyWrapper.hidden = true;
      countySelect.disabled = true;
      if (state && !config.api) {
        showError(config.error || 'Lookup not configured.', flags, section, modalState);
      }
      return;
    }

    countyWrapper.hidden = false;
    countySelect.disabled = true;
    showLoading(status);

    try {
      const data = await fetchWithRecaptcha(`${config.api}?state=${encodeURIComponent(state)}&list=counties`, config);
      const counties = data.counties || data.results || data || [];
      if (!counties.length) {
        showMessage(status, config['no-results'] || 'No counties found for this state.');
        return;
      }
      showMessage(status, '');
      counties.forEach((county) => {
        const opt = document.createElement('option');
        const name = typeof county === 'string' ? county : county.name || county.county;
        opt.value = name;
        opt.textContent = name;
        countySelect.append(opt);
      });
      countySelect.disabled = false;
    } catch {
      showError(config.error || 'The data was not able to be loaded. Please try again.', flags, section, modalState);
    }
  });

  countySelect.addEventListener('change', async () => {
    const state = stateSelect.value;
    const county = countySelect.value;
    results.innerHTML = '';
    if (!county || !state || !config.api) return;

    showLoading(status);
    try {
      const data = await fetchWithRecaptcha(
        `${config.api}?state=${encodeURIComponent(state)}&county=${encodeURIComponent(county)}`,
        config,
      );
      const plans = data.plans || data.results || data || [];
      if (!plans.length) {
        showMessage(status, config['no-results'] || 'No coverage information found.');
        return;
      }
      showMessage(status, '');
      renderResultsTable(plans, results, config, 1);
    } catch {
      showError(config.error || 'The data was not able to be loaded. Please try again.', flags, section, modalState);
    }
  });
}

function createIcon(config) {
  if (!config.icon) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'formulary-lookup-icon';
  const img = document.createElement('img');
  img.src = config.icon;
  img.alt = '';
  img.loading = 'lazy';
  wrapper.append(img);
  return wrapper;
}

function createRecaptchaNotice(config) {
  if (!config['recaptcha-notice']) return null;
  const div = document.createElement('div');
  div.className = 'formulary-lookup-recaptcha-notice';
  div.innerHTML = config['recaptcha-notice'];
  return div;
}

function createDisclaimer(config, asModal = false) {
  if (!config.disclaimer) return null;
  if (!asModal) {
    const div = document.createElement('div');
    div.className = 'formulary-lookup-disclaimer';
    div.innerHTML = config.disclaimer;
    return div;
  }

  const overlay = document.createElement('div');
  overlay.className = 'formulary-lookup-disclaimer-overlay';
  overlay.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'formulary-lookup-disclaimer-modal';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'formulary-lookup-disclaimer-close';
  closeBtn.setAttribute('aria-label', 'Close disclaimer');
  closeBtn.textContent = '✕';

  const content = document.createElement('div');
  content.className = 'formulary-lookup-disclaimer';
  content.innerHTML = config.disclaimer;

  modal.append(content, closeBtn);
  overlay.append(modal);

  function close() {
    overlay.hidden = true;
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  overlay.open = () => { overlay.hidden = false; };
  return overlay;
}

function createFilterDropdown(config) {
  if (!config['filter-label']) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'formulary-lookup-filter';

  const anchor = document.createElement('div');
  anchor.className = 'formulary-lookup-filter-anchor';
  anchor.setAttribute('tabindex', '0');
  anchor.setAttribute('role', 'button');
  anchor.setAttribute('aria-expanded', 'false');
  anchor.setAttribute('aria-label', config['filter-label']);

  const anchorText = document.createElement('span');
  anchorText.className = 'formulary-lookup-filter-text';
  anchorText.textContent = config['filter-label'];

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'formulary-lookup-filter-clear';
  clearBtn.setAttribute('aria-label', 'Clear filter');
  clearBtn.textContent = '✕';
  clearBtn.hidden = true;

  anchor.append(anchorText, clearBtn);

  const panel = document.createElement('div');
  panel.className = 'formulary-lookup-filter-panel';
  panel.hidden = true;

  const opts = (config['filter-options'] || '')
    .split(',').map((o) => o.trim()).filter(Boolean);
  opts.forEach((opt, i) => {
    const item = document.createElement('label');
    item.className = 'formulary-lookup-filter-option';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = opt;
    cb.id = `formulary-filter-${i}`;
    item.append(cb, document.createTextNode(` ${opt}`));
    panel.append(item);
  });

  wrapper.append(anchor, panel);

  function getSelected() {
    return [...panel.querySelectorAll('input:checked')]
      .map((cb) => cb.value);
  }

  anchor.addEventListener('click', (e) => {
    if (e.target === clearBtn) return;
    const open = panel.hidden;
    panel.hidden = !open;
    anchor.setAttribute('aria-expanded', String(open));
    wrapper.classList.toggle('is-open', open);
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.querySelectorAll('input').forEach((cb) => {
      cb.checked = false;
    });
    clearBtn.hidden = true;
    anchorText.textContent = config['filter-label'];
    panel.hidden = true;
    anchor.setAttribute('aria-expanded', 'false');
    wrapper.classList.remove('is-open');
  });

  panel.addEventListener('change', () => {
    const sel = getSelected();
    if (sel.length) {
      anchorText.textContent = sel.join(', ');
      clearBtn.hidden = false;
    } else {
      anchorText.textContent = config['filter-label'];
      clearBtn.hidden = true;
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !panel.hidden) {
      panel.hidden = true;
      anchor.setAttribute('aria-expanded', 'false');
      wrapper.classList.remove('is-open');
    }
  });

  return { wrapper, getSelected };
}

function createIndicationRadio(config) {
  if (!config['indication-label'] || !config.indications) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'formulary-lookup-indications';

  const heading = document.createElement('h3');
  heading.className = 'formulary-lookup-indications-heading';
  heading.textContent = config['indication-label'];

  const group = document.createElement('div');
  group.className = 'formulary-lookup-indications-group';

  const items = config.indications.split(',').map((o) => o.trim()).filter(Boolean);
  items.forEach((item, i) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'formulary-indication';
    radio.id = `formulary-ind-${i}`;
    radio.value = item;
    if (i === 0) radio.checked = true;

    const container = document.createElement('label');
    container.append(radio, document.createTextNode(` ${item}`));
    group.append(container);
  });

  wrapper.append(heading, group);
  return wrapper;
}

function buildZipVariant(config, section, status, results, flags, modalState) {
  const { form, input } = createZipForm(config);
  const submitBtn = form.querySelector('.formulary-lookup-submit');
  if (flags.submitIconEnabled) submitBtn.classList.add('has-icon');
  applyAnalytics(submitBtn, config);

  const filter = createFilterDropdown(config);
  const indications = createIndicationRadio(config);

  if (filter || indications) {
    submitBtn.remove();
    if (filter) form.append(filter.wrapper);
    if (indications) form.append(indications);
    form.append(submitBtn);
  }

  section.append(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const zip = input.value.trim();
    results.innerHTML = '';

    if (!/^\d{5}$/.test(zip)) {
      showMessage(status, 'Please enter a valid 5-digit ZIP code.', true);
      return;
    }
    if (!config.api) {
      showError(config.error || 'Lookup not configured.', flags, section, modalState);
      return;
    }

    let url = `${config.api}?zip=${encodeURIComponent(zip)}`;
    if (filter) {
      const sel = filter.getSelected();
      if (sel.length) url += `&filter=${encodeURIComponent(sel.join(','))}`;
    }
    const indicationRadio = form.querySelector('input[name="formulary-indication"]:checked');
    if (indicationRadio) url += `&indication=${encodeURIComponent(indicationRadio.value)}`;

    showLoading(status);
    try {
      const data = await fetchWithRecaptcha(url, config);
      const plans = data.plans || data.results || data || [];
      if (!plans.length) {
        showMessage(status, config['no-results'] || 'No coverage information found.');
        return;
      }
      showMessage(status, '');
      renderResultsTable(plans, results, config, 1);
    } catch {
      showError(config.error || 'The data was not able to be loaded. Please try again.', flags, section, modalState);
    }
  });
}

export default async function decorate(block) {
  const config = parseConfig(block);
  const flags = await loadFormularyConfig();
  const isDynamic = block.classList.contains('dynamic');
  const isZip = block.classList.contains('zip');

  const section = document.createElement('div');
  section.className = 'formulary-lookup-form';

  const icon = flags.showIcon !== false ? createIcon(config) : null;
  const hasHeading = !!config.heading;
  const hTag = flags.headingTag || 'h2';

  if (icon && hasHeading) {
    const header = document.createElement('div');
    header.className = 'formulary-lookup-header';
    header.append(icon);
    const heading = document.createElement(hTag);
    heading.className = 'formulary-lookup-heading';
    heading.innerHTML = config.heading;
    header.append(heading);
    section.append(header);
  } else {
    if (icon) section.append(icon);
    if (hasHeading) {
      const heading = document.createElement(hTag);
      heading.className = 'formulary-lookup-heading';
      heading.innerHTML = config.heading;
      section.append(heading);
    }
  }

  if (config.description) {
    const p = document.createElement('p');
    p.className = 'formulary-lookup-description';
    p.innerHTML = config.description;
    section.append(p);
  }

  const status = createStatus();
  const results = createResultsContainer();
  const modalState = { overlay: null, container: block, abort: null };

  if (isZip) {
    buildZipVariant(config, section, status, results, flags, modalState);
  } else if (isDynamic) {
    buildDynamicVariant(config, section, status, results, flags, modalState);
  } else {
    buildDefaultVariant(config, section, status, results, flags, modalState);
  }

  if (flags.showRecaptchaNotice !== false) {
    const recaptchaNotice = createRecaptchaNotice(config);
    if (recaptchaNotice) section.append(recaptchaNotice);
  }

  section.append(status, results);

  if (flags.showDisclaimer !== false) {
    const isModal = !!flags.disclaimerModal;
    const disclaimer = createDisclaimer(config, isModal);
    if (disclaimer) {
      section.append(disclaimer);
    }
  }

  block.replaceChildren(section);
}
