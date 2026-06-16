/*
 * drcom-widget
 * Lazy-loads the Dr.com directory widget (external custom element).
 *
 * Authoring model:
 *   | drcom-widget           |
 *   | partner-id | abc123    | ← required: Dr.com partner site ID
 *   | heading    | Find a Specialist | ← optional heading
 *   | api-env    | prod      | ← optional: prod (default) | test
 *
 * The widget renders itself as a <directory-widget> custom element once
 * the external Dr.com script is loaded. We defer loading until the block
 * enters the viewport.
 */

const DRCOM_ENDPOINTS = {
  prod: 'https://widget.doctor.com/directory/app.js',
  test: 'https://widget-staging.doctor.com/directory/app.js',
};

function loadDrcomScript(env) {
  const src = DRCOM_ENDPOINTS[env] || DRCOM_ENDPOINTS.prod;
  if (document.getElementById('drcom-script')) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'drcom-script';
    script.src = src;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const config = {};

  rows.forEach((row) => {
    const [keyCell, valCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const val = valCell?.textContent.trim();
    if (key && val) config[key] = val;
  });

  const { 'partner-id': partnerId, heading, 'api-env': apiEnv = 'prod' } = config;

  if (!partnerId) {
    block.textContent = 'drcom-widget: partner-id is required.';
    return;
  }

  const container = document.createElement('div');
  container.className = 'drcom-widget-container';

  if (heading) {
    const h2 = document.createElement('h2');
    h2.className = 'drcom-widget-heading';
    h2.textContent = heading;
    container.append(h2);
  }

  // Placeholder while loading
  const placeholder = document.createElement('div');
  placeholder.className = 'drcom-widget-placeholder';
  placeholder.setAttribute('aria-busy', 'true');
  placeholder.setAttribute('aria-label', 'Loading doctor search…');
  container.append(placeholder);

  block.replaceChildren(container);

  // Defer script + widget init until block is visible
  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      try {
        await loadDrcomScript(apiEnv);

        const widget = document.createElement('directory-widget');
        widget.setAttribute('widget.partner', partnerId);

        const zipParam = new URLSearchParams(window.location.search).get('zip');
        if (zipParam) widget.setAttribute('widget.zipcode', zipParam);

        placeholder.replaceWith(widget);
      } catch {
        placeholder.textContent = 'Doctor search is currently unavailable.';
        placeholder.removeAttribute('aria-busy');
      }
    },
    { rootMargin: '200px' },
  );

  observer.observe(block);
}
