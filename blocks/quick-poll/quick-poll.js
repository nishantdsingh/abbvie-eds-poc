import { renderBlock, getBrandCode } from '../../scripts/multi-theme.js';
import { getConfigValue } from '../../scripts/config.js';

const COOKIE_DAYS = 365;
const FETCH_TIMEOUT = 10000;
let pollInstanceCounter = 0;

// Fallback UI copy — override by authoring the block's error-* and result-label fields.
const DEFAULTS = {
  resultLabel: 'See how others responded',
  errorTimeout: 'Request timed out. Please try again.',
  errorNoPoll: 'Poll is currently unavailable.',
  errorFetchResults: 'Results unavailable. Try again later.',
  errorSave: 'Unable to save your response.',
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Positional map for xwalk delivery — must match _quick-poll.json field order.
// Tab fields and the classes select produce no rows; all other fields produce one row each.
const XWALK_FIELDS = [
  'image', // 0
  'image-alt', // 1
  'master-campaign-id', // 2
  'poll-name', // 3
  'question-id', // 4
  'question-text', // 5
  'result-label', // 6
  'result-description', // 7
  'option', // 8
  'error-timeout', // 9
  'error-no-poll', // 10
  'error-fetch-results', // 11
  'error-save', // 12
];

async function getApiUrl(key) {
  const value = (await getConfigValue(key)) || '';
  // Accept absolute (http/https) and root-relative (/api/...) URLs.
  return (value.startsWith('http') || value.startsWith('/')) ? value : '';
}

function getCookie(name) {
  const key = encodeURIComponent(name);
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${key}=`));
  return entry ? decodeURIComponent(entry.slice(key.length + 1)) : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // encodeURIComponent prevents name/value chars from injecting extra cookie directives.
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function parseOption(text) {
  const parts = text.split('|').map((s) => s.trim());
  if (!parts[0]) return null;
  return {
    OptionId: parts[1] || parts[0].toLowerCase().replace(/\s+/g, '-'),
    OptionText: parts[0],
  };
}

export async function decorateBlock(block) {
  // Parse authored rows synchronously before any await so block.replaceChildren()
  // fires before the section is revealed — prevents the raw table from flashing.
  const rows = [...block.children];
  const fields = {};
  const authoredOptions = [];

  // xwalk: every row has exactly one cell. Doc authoring: two-cell rows (key + value).
  const isXwalk = rows.length > 0 && rows.every((r) => r.children.length === 1);

  if (isXwalk) {
    rows.forEach((row, idx) => {
      const fieldName = XWALK_FIELDS[idx];
      if (!fieldName) return;
      const cell = row.children[0] || null;
      if (fieldName === 'option' && cell) {
        [...cell.querySelectorAll('p')]
          .map((p) => p.textContent.trim())
          .filter(Boolean)
          .forEach((line) => {
            const opt = parseOption(line);
            if (opt) authoredOptions.push(opt);
          });
      } else {
        fields[fieldName] = cell;
      }
    });
  }

  // Doc-authoring path, or xwalk fallback when positional map yields no campaign ID
  // (indicates XWALK_FIELDS indices shifted — e.g. classes/tab fields gained a row).
  if (!isXwalk || !fields['master-campaign-id']) {
    if (isXwalk) {
      // Clear any mis-mapped values before re-parsing
      Object.keys(fields).forEach((k) => { delete fields[k]; });
      authoredOptions.length = 0;
    }
    rows.forEach((row) => {
      const cells = [...row.children];
      const key = cells[0]?.textContent.trim().toLowerCase();
      if (!key) return;
      if (key === 'option' && cells[1]) {
        const opt = parseOption(cells[1].textContent.trim());
        if (opt) authoredOptions.push(opt);
      } else {
        fields[key] = cells[1] || null;
      }
    });
  }

  const getText = (key, fallback = '') => fields[key]?.textContent?.trim() || fallback;

  const masterCampaignId = getText('master-campaign-id');
  const pollName = getText('poll-name');
  const questionId = getText('question-id');
  const questionTextAuthored = getText('question-text');
  const resultLabel = getText('result-label', DEFAULTS.resultLabel);
  const resultDescEl = fields['result-description'] || null;
  const errors = {
    timeout: getText('error-timeout', DEFAULTS.errorTimeout),
    noPoll: getText('error-no-poll', DEFAULTS.errorNoPoll),
    fetchResults: getText('error-fetch-results', DEFAULTS.errorFetchResults),
    save: getText('error-save', DEFAULTS.errorSave),
  };

  if (!masterCampaignId || !pollName) {
    block.hidden = true;
    return;
  }

  block.replaceChildren();

  // Sanitise for DOM id and cookie name — no spaces or chars invalid per RFC 6265 / HTML spec.
  const safePollName = pollName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  pollInstanceCounter += 1;
  const qTextId = `qpoll-q-${safePollName}-${pollInstanceCounter}`;

  const imgAlt = getText('image-alt', '');
  const imageCell = fields.image;
  if (imageCell?.querySelector('img, picture')) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'qpoll-image';
    [...imageCell.childNodes].forEach((n) => imgWrap.append(n.cloneNode(true)));
    if (imgAlt) {
      const img = imgWrap.querySelector('img');
      if (img) img.alt = imgAlt;
    }
    block.append(imgWrap);
  }

  const ia = document.createElement('div');
  ia.className = 'qpoll-ia';

  const qText = document.createElement('p');
  qText.className = 'qpoll-question';
  qText.id = qTextId;
  qText.setAttribute('role', 'heading');
  qText.setAttribute('aria-level', '2');
  if (questionId) qText.dataset.questionid = questionId;
  qText.textContent = questionTextAuthored;

  const resultsLabel = document.createElement('p');
  resultsLabel.className = 'qpoll-results-label';
  resultsLabel.textContent = resultLabel;
  resultsLabel.hidden = true;

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'qpoll-options';
  optionsWrap.setAttribute('role', 'radiogroup');
  optionsWrap.setAttribute('aria-labelledby', qTextId);
  // Fallback label while question text loads asynchronously from the API.
  if (!questionTextAuthored) optionsWrap.setAttribute('aria-label', 'Poll options');

  const resultsEl = document.createElement('div');
  resultsEl.className = 'qpoll-results';
  resultsEl.hidden = true;
  const resultSet = document.createElement('div');
  resultSet.className = 'qpoll-result-set';
  const resultsDesc = document.createElement('div');
  resultsDesc.className = 'qpoll-results-desc';
  if (resultDescEl) {
    [...resultDescEl.cloneNode(true).childNodes].forEach((n) => resultsDesc.append(n));
  }
  resultsEl.append(resultSet, resultsDesc);

  const loadingEl = document.createElement('div');
  loadingEl.className = 'qpoll-loading';
  loadingEl.hidden = true;
  loadingEl.setAttribute('aria-live', 'polite');
  const spinner = document.createElement('span');
  spinner.className = 'qpoll-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  spinner.hidden = true;
  const errorBox = document.createElement('div');
  errorBox.className = 'qpoll-error';
  errorBox.hidden = true;
  const errorMsg = document.createElement('p');
  errorMsg.className = 'qpoll-error-msg';
  const errorClose = document.createElement('button');
  errorClose.className = 'qpoll-error-close';
  errorClose.type = 'button';
  errorClose.setAttribute('aria-label', 'Close error');
  errorClose.textContent = '✕';
  errorBox.append(errorMsg, errorClose);
  loadingEl.append(spinner, errorBox);

  ia.append(qText, resultsLabel, optionsWrap, resultsEl, loadingEl);
  block.append(ia);

  function showLoading() {
    spinner.hidden = false;
    errorBox.hidden = true;
    loadingEl.hidden = false;
  }

  function hideLoading() {
    loadingEl.hidden = true;
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    spinner.hidden = true;
    errorBox.hidden = false;
    loadingEl.hidden = false;
  }

  function enableButtons() {
    [...optionsWrap.querySelectorAll('.qpoll-option')].forEach((b) => { b.disabled = false; });
  }

  function setQuestionText(text) {
    if (text) {
      qText.textContent = text;
      optionsWrap.removeAttribute('aria-label');
    }
  }

  function buildOptionButtons(options) {
    optionsWrap.replaceChildren();
    resultSet.replaceChildren();
    options.forEach((opt) => {
      if (!opt.OptionId) return;
      const btn = document.createElement('button');
      btn.className = 'qpoll-option';
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.optionid = opt.OptionId;
      btn.textContent = opt.OptionText;
      optionsWrap.append(btn);

      const resItem = document.createElement('div');
      resItem.className = 'qpoll-result-item';
      resItem.dataset.optionid = opt.OptionId.toLowerCase();
      const pct = document.createElement('span');
      pct.className = 'qpoll-pct';
      pct.textContent = '0';
      pct.setAttribute('aria-label', '0%');
      const label = document.createElement('p');
      label.textContent = opt.OptionText;
      resItem.append(pct, label);
      resultSet.append(resItem);
    });
  }

  function applyPercentages(questionOptions) {
    questionOptions.forEach((opt) => {
      const id = opt.QuestionOptionId?.toLowerCase();
      const item = id ? resultSet.querySelector(`[data-optionid="${CSS.escape(id)}"]`) : null;
      if (!item) return;
      const pct = item.querySelector('.qpoll-pct');
      if (pct) {
        const rounded = Math.round(parseFloat(opt.PercentageOfUsersRespondedOnOption ?? 0));
        pct.textContent = String(rounded);
        pct.setAttribute('aria-label', `${rounded}%`);
      }
      if (opt.OptionValue) {
        const label = item.querySelector('p');
        if (label) label.textContent = opt.OptionValue;
      }
    });
  }

  function showLocalResults() {
    optionsWrap.hidden = true;
    resultsLabel.hidden = false;
    hideLoading();
    resultsEl.hidden = false;
    if (!getCookie(safePollName)) setCookie(safePollName, '1', COOKIE_DAYS);
  }

  // Tracks the real QuestionId returned by the API (may differ from authored questionId).
  let activeQuestionId = questionId;

  showLoading();

  const brandCode = getBrandCode();

  let getAssessmentUrl = '';
  let saveAssessmentUrl = '';
  let getAggregatedUrl = '';
  try {
    [getAssessmentUrl, saveAssessmentUrl, getAggregatedUrl] = await Promise.all([
      getApiUrl('getAssessment'),
      getApiUrl('saveAssessment'),
      getApiUrl('getAggregated'),
    ]);
  } catch {
    showError(errors.noPoll);
    return;
  }

  function findQuestion(questions) {
    return (questionId
      ? questions.find((q) => q.QuestionId?.toUpperCase() === questionId.toUpperCase())
      : null) ?? questions[0];
  }

  async function fetchAggregated() {
    try {
      if (!getAggregatedUrl) throw new Error('not configured');
      const url = new URL(getAggregatedUrl, window.location.origin);
      url.searchParams.set('brand', brandCode);
      url.searchParams.set('CampaignMasterId', masterCampaignId);
      const resp = await fetchWithTimeout(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data?.IsStatusSuccessful) throw new Error('API error');
      const qData = findQuestion(data?.ContentResult?.AssessmentQuestion ?? []);
      if (!qData) throw new Error('No question data');
      activeQuestionId = qData.QuestionId ?? activeQuestionId;
      if (!questionTextAuthored) setQuestionText(qData.QuestionText);
      applyPercentages(qData.QuestionOption ?? []);
      optionsWrap.hidden = true;
      resultsLabel.hidden = false;
      hideLoading();
      resultsEl.hidden = false;
      if (!getCookie(safePollName)) setCookie(safePollName, '1', COOKIE_DAYS);
    } catch (err) {
      if (err?.name === 'AbortError') { showError(errors.timeout); return; }
      if (resultSet.children.length > 0) {
        showLocalResults();
      } else {
        showError(errors.fetchResults);
      }
    }
  }

  async function submitAnswer(optionId) {
    [...optionsWrap.querySelectorAll('.qpoll-option')].forEach((b) => {
      b.setAttribute('aria-checked', b.dataset.optionid === optionId ? 'true' : 'false');
      b.disabled = true;
    });
    showLoading();
    try {
      if (!saveAssessmentUrl) throw new Error('not configured');
      const saveUrl = new URL(saveAssessmentUrl, window.location.origin);
      saveUrl.searchParams.set('brand', brandCode);
      const resp = await fetchWithTimeout(saveUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CampaignMasterId: masterCampaignId,
          CompleteDate: null,
          ConsumerId: '',
          IndividualId: '',
          AssessmentQuestion: [{
            QuestionId: activeQuestionId,
            QuestionOptions: [{ OptionId: optionId, ResponseText: '' }],
          }],
          OtherInformation: { cid: '' },
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data?.IsStatusSuccessful) {
        try {
          await fetchAggregated();
        } finally {
          enableButtons();
        }
      } else {
        enableButtons();
        showError(errors.save);
      }
    } catch (err) {
      enableButtons();
      if (err?.name === 'AbortError') { showError(errors.timeout); return; }
      if (authoredOptions.length >= 2) {
        showLocalResults();
      } else {
        showError(errors.save);
      }
    }
  }

  async function loadQuestion(keepLoading = false) {
    showLoading();
    try {
      if (!getAssessmentUrl) throw new Error('not configured');
      const url = new URL(getAssessmentUrl, window.location.origin);
      url.searchParams.set('brand', brandCode);
      url.searchParams.set('CampaignMasterId', masterCampaignId);
      if (questionId) url.searchParams.set('QuesId', questionId);
      const resp = await fetchWithTimeout(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data?.IsStatusSuccessful) throw new Error('API error');
      const qData = findQuestion(data?.ContentResult?.AssessmentQuestion ?? []);
      if (!qData) throw new Error('No question data');
      activeQuestionId = qData.QuestionId ?? activeQuestionId;
      if (!questionTextAuthored) setQuestionText(qData.QuestionText);
      buildOptionButtons(qData.QuestionOption ?? []);
      if (!keepLoading) hideLoading();
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') { showError(errors.timeout); return false; }
      if (authoredOptions.length >= 2) {
        buildOptionButtons(authoredOptions);
        if (!keepLoading) hideLoading();
        return true;
      }
      showError(errors.noPoll);
      return false;
    }
  }

  optionsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.qpoll-option');
    const oid = btn?.dataset.optionid;
    if (oid && !btn.disabled) {
      submitAnswer(oid).catch(() => { enableButtons(); showError(errors.save); });
    }
  });

  errorClose.addEventListener('click', () => {
    hideLoading();
    enableButtons();
  });

  if (getCookie(safePollName) === '1') {
    const ok = await loadQuestion(true);
    if (ok) await fetchAggregated();
  } else {
    await loadQuestion(false);
  }
}

export default async function decorate(block) {
  await renderBlock(block);
}
