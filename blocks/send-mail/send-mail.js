function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function decorate(block) {
  const rows = [...block.children];
  const config = {};
  rows.forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase().replace(/[\s-]+/g, '-');
    config[key] = cells[1]?.textContent.trim();
  });

  const form = document.createElement('form');
  form.className = 'send-mail-form';
  form.setAttribute('novalidate', '');

  if (config.heading) {
    const h2 = document.createElement('h2');
    h2.className = 'send-mail-heading';
    h2.textContent = config.heading;
    form.append(h2);
  }

  function field(id, labelText, type = 'text') {
    const wrapper = document.createElement('div');
    wrapper.className = 'send-mail-field';
    const lbl = document.createElement('label');
    lbl.htmlFor = id;
    lbl.textContent = labelText;
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    const err = document.createElement('span');
    err.className = 'send-mail-error';
    err.setAttribute('aria-live', 'polite');
    wrapper.append(lbl, input, err);
    return { wrapper, input, err };
  }

  const fromName = field('from-name', config['from-name-label'] || 'Your name');
  const fromEmail = field('from-email', config['from-email-label'] || 'Your email', 'email');
  const toName = field('to-name', config['to-name-label'] || 'Recipient name');
  const toEmail = field('to-email', config['to-email-label'] || 'Recipient email', 'email');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'send-mail-submit button';
  submit.textContent = config['submit-label'] || 'Send';

  const status = document.createElement('p');
  status.className = 'send-mail-status';
  status.setAttribute('aria-live', 'polite');

  form.append(fromName.wrapper, fromEmail.wrapper, toName.wrapper, toEmail.wrapper, submit, status);
  block.replaceChildren(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    [fromName, fromEmail, toName, toEmail].forEach(({ input, err }) => {
      err.textContent = '';
      if (!input.value.trim()) { err.textContent = 'This field is required.'; valid = false; } else if (input.type === 'email' && !validateEmail(input.value)) { err.textContent = 'Please enter a valid email.'; valid = false; }
    });

    if (!valid) return;

    if (!config.api) {
      status.textContent = config.success || 'Form submitted.';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      const resp = await fetch(config.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: fromName.input.value,
          fromEmail: fromEmail.input.value,
          toName: toName.input.value,
          toEmail: toEmail.input.value,
          pageUrl: window.location.href,
        }),
      });
      if (!resp.ok) throw new Error();
      status.textContent = config.success || 'Your message has been sent!';
      form.reset();
    } catch {
      status.textContent = config.error || 'Unable to send. Please try again.';
    } finally {
      submit.disabled = false;
      submit.textContent = config['submit-label'] || 'Send';
    }
  });
}
