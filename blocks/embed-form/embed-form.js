import { getConfigValue } from '../../scripts/config.js';
import { isUniversalEditor } from '../../scripts/utils.js';

const DEFAULT_HOST = 'https://publish-p157365-e1665798.adobeaemcloud.com';

/**
 * Rewrites same-origin resource URLs in the injected form HTML so scripts and
 * stylesheets resolve against the AEM publish host instead of the EDS host.
 * @param {Element} container
 * @param {URL} formUrlObj
 */
function rewriteResourceUrls(container, formUrlObj) {
  container.querySelectorAll('script[src], link[href]').forEach((el) => {
    const attr = el.tagName.toLowerCase() === 'script' ? 'src' : 'href';
    try {
      const parsed = new URL(el[attr]);
      if (parsed.host === window.location.host) {
        el[attr] = `${formUrlObj.protocol}//${formUrlObj.hostname}${parsed.pathname}`;
      }
    } catch {
      // relative or invalid — leave as-is
    }
  });
}

/**
 * Re-executes <script> elements sequentially so external scripts (e.g. jQuery
 * bundled by AEM) finish loading before dependent inline scripts run.
 * External scripts are moved to <head> with duplicate detection to prevent the
 * AEM Forms SDK from registering its listeners more than once.
 * @param {Element} container
 * @returns {Promise<void>}
 */
function runScripts(container) {
  const runOne = (oldScript) => {
    const newScript = document.createElement('script');
    [...oldScript.attributes].forEach((attr) => newScript.setAttribute(attr.name, attr.value));
    newScript.textContent = oldScript.textContent;

    if (newScript.src) {
      if (document.querySelector(`head script[src="${newScript.src}"]`)) {
        oldScript.remove();
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        newScript.onload = resolve;
        newScript.onerror = resolve;
        document.head.appendChild(newScript);
        oldScript.remove();
      });
    }
    oldScript.replaceWith(newScript);
    return Promise.resolve();
  };

  return [...container.querySelectorAll('script')].reduce(
    (chain, script) => chain.then(() => runOne(script)),
    Promise.resolve(),
  );
}

/**
 * Loads jQuery from CDN if not already present.
 * Resolves regardless of outcome so the caller can check window.jQuery.
 */
const ensureJQuery = () => new Promise((resolve) => {
  if (window.jQuery) { resolve(); return; }
  const script = document.createElement('script');
  script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
  script.onload = resolve;
  script.onerror = resolve;
  document.head.appendChild(script);
});

/**
 * Embed Form Block
 * Fetches an AEM Adaptive Form by URL and injects its HTML into the page,
 * mirroring the AEM forms-embed component behaviour.
 */
export default async function decorate(block) {
  if (!block) return;

  const formLink = block.querySelector('a');
  if (!formLink?.href) return;

  const aemHost = (await getConfigValue('aemPublishUrl')) || DEFAULT_HOST;

  let { href } = formLink;
  let finalFormPath = '';

  if (isUniversalEditor()) {
    finalFormPath = href;
  } else if (formLink.host !== window.location.host) {
    finalFormPath = href;
  } else {
    href = formLink.pathname + formLink.search + formLink.hash;
    if (/\/content\/forms\//.test(href)) {
      const formsPath = href.slice(href.indexOf('/content/forms'));
      const normalised = formsPath.endsWith('.html') ? formsPath : `${formsPath}.html`;
      finalFormPath = `${aemHost}${normalised}`;
    } else {
      finalFormPath = `${window.location.origin}${href}`;
    }
  }

  const formUrlObj = new URL(finalFormPath);

  const formContainer = document.createElement('div');
  formContainer.className = 'embed-form-container';
  block.querySelector(':scope div').replaceWith(formContainer);

  await ensureJQuery();
  if (!window.jQuery) {
    formContainer.innerHTML = '<p class="embed-form-error">Form could not be loaded (jQuery unavailable).</p>';
    return;
  }

  formContainer.innerHTML = '<div class="embed-form-loading">Loading form…</div>';

  window.jQuery.ajax({
    url: finalFormPath,
    type: 'GET',
    data: isUniversalEditor() ? { wcmmode: 'disabled' } : {},
    success(data) {
      formContainer.innerHTML = data;
      rewriteResourceUrls(formContainer, formUrlObj);

      const form = formContainer.querySelector('[data-cmp-path]');
      if (form) {
        form.setAttribute('data-cmp-context-path', formUrlObj.origin);
      }

      runScripts(formContainer).then(() => {
        document.dispatchEvent(new CustomEvent('adaptiveform:loaded', {
          detail: { finalFormPath, container: formContainer },
        }));
      });
    },
    error(error) {
      formContainer.innerHTML = '<p class="embed-form-error">Error loading form. Please try again later.</p>';
      document.dispatchEvent(new CustomEvent('adaptiveform:error', {
        detail: { finalFormPath, error },
      }));
    },
  });
}
