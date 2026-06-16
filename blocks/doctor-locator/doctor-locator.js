export default async function decorate(block) {
  const rows = [...block.children];
  const config = {};
  const textRows = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const knownKeys = ['api', 'maps-key', 'placeholder', 'no-results', 'error', 'results-per-page'];
    if (knownKeys.includes(key)) {
      config[key] = cells[1]?.textContent.trim();
    } else {
      textRows.push(row);
    }
  });

  const heading = textRows[0]?.textContent.trim() || 'Find a Doctor';

  const h2 = document.createElement('h2');
  h2.className = 'doctor-locator-heading';
  h2.textContent = heading;

  const form = document.createElement('form');
  form.className = 'doctor-locator-form';
  form.setAttribute('novalidate', '');

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'zip';
  input.className = 'doctor-locator-input';
  input.placeholder = config.placeholder || 'Enter ZIP code';
  input.pattern = '[0-9]{5}';
  input.maxLength = 5;
  input.setAttribute('aria-label', config.placeholder || 'Enter ZIP code');
  input.setAttribute('inputmode', 'numeric');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'doctor-locator-submit button';
  submitBtn.textContent = 'Search';

  const geoBtn = document.createElement('button');
  geoBtn.type = 'button';
  geoBtn.className = 'doctor-locator-geo';
  geoBtn.textContent = 'Use my location';

  form.append(input, submitBtn, geoBtn);

  const status = document.createElement('p');
  status.className = 'doctor-locator-status';
  status.setAttribute('aria-live', 'polite');

  const results = document.createElement('ul');
  results.className = 'doctor-locator-results';

  block.replaceChildren(h2, form, status, results);

  async function search(zip) {
    if (!/^\d{5}$/.test(zip)) {
      status.textContent = 'Please enter a valid 5-digit ZIP code.';
      return;
    }
    status.textContent = 'Searching…';
    results.innerHTML = '';

    if (!config.api) {
      status.textContent = config.error || 'Search is not configured.';
      return;
    }

    try {
      const resp = await fetch(`${config.api}?zip=${zip}&limit=${config['results-per-page'] || 5}`);
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      const doctors = data.results || data.doctors || data || [];

      if (!doctors.length) {
        status.textContent = config['no-results'] || 'No results found.';
        return;
      }

      status.textContent = `Found ${doctors.length} result${doctors.length !== 1 ? 's' : ''}`;
      doctors.forEach((doc) => {
        const li = document.createElement('li');
        li.className = 'doctor-locator-result';
        li.innerHTML = `
          <strong class="doctor-locator-name">${doc.name || ''}</strong>
          <span class="doctor-locator-address">${doc.address || ''}</span>
          <span class="doctor-locator-distance">${doc.distance ? `${doc.distance} miles` : ''}</span>
        `;
        results.append(li);
      });
    } catch {
      status.textContent = config.error || 'An error occurred. Please try again.';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    search(input.value.trim());
  });

  geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    status.textContent = 'Detecting location…';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await resp.json();
          const zip = data.address?.postcode?.slice(0, 5);
          if (zip) {
            input.value = zip;
            search(zip);
          } else {
            status.textContent = 'Could not determine ZIP code from location.';
          }
        } catch {
          status.textContent = 'Could not determine location. Please enter ZIP manually.';
        }
      },
      () => { status.textContent = 'Location access denied. Please enter ZIP code manually.'; },
    );
  });
}
