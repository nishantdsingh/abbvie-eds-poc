/*
 * ugc-detail (User Generated Content detail view)
 * Displays a patient story: portrait, quote, attribution, before/after images.
 *
 * Authoring model:
 *   | ugc-detail                                     |
 *   | [portrait img] | Patient Name | Condition/title | ← row 0: identity
 *   | Story quote or narrative text (rich text)       | ← row 1: story
 *   | [before img]   | [after img]                    | ← row 2 (optional): before/after
 *
 * Variant: ugc-detail centered — centres the portrait and quote.
 */

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [identityRow, storyRow, imagesRow] = rows;

  // ── identity ──────────────────────────────────────────────────────────────
  const portraitImg = identityRow?.querySelector('img');
  const identityCells = [...(identityRow?.children || [])];
  const nameCell = identityCells.find((c) => !c.querySelector('img') && c.textContent.trim());
  const titleCell = identityCells.filter((c) => !c.querySelector('img') && c.textContent.trim())[1];

  const identity = document.createElement('div');
  identity.className = 'ugc-detail-identity';

  if (portraitImg) {
    portraitImg.className = 'ugc-detail-portrait';
    portraitImg.loading = 'lazy';
    const figure = document.createElement('figure');
    figure.className = 'ugc-detail-portrait-wrap';
    figure.append(portraitImg);
    identity.append(figure);
  }

  const meta = document.createElement('div');
  meta.className = 'ugc-detail-meta';

  if (nameCell) {
    const name = document.createElement('strong');
    name.className = 'ugc-detail-name';
    name.textContent = nameCell.textContent.trim();
    meta.append(name);
  }

  if (titleCell) {
    const title = document.createElement('span');
    title.className = 'ugc-detail-title';
    title.textContent = titleCell.textContent.trim();
    meta.append(title);
  }

  if (meta.hasChildNodes()) identity.append(meta);

  // ── story ─────────────────────────────────────────────────────────────────
  const story = document.createElement('blockquote');
  story.className = 'ugc-detail-story';
  if (storyRow) {
    story.innerHTML = storyRow.innerHTML;
  }

  // ── before / after images ─────────────────────────────────────────────────
  let comparison = null;
  if (imagesRow) {
    const imgs = [...imagesRow.querySelectorAll('img')];
    if (imgs.length) {
      comparison = document.createElement('div');
      comparison.className = 'ugc-detail-comparison';

      imgs.forEach((img, i) => {
        const figure = document.createElement('figure');
        figure.className = 'ugc-detail-comparison-item';

        img.loading = 'lazy';
        const caption = document.createElement('figcaption');
        caption.textContent = i === 0 ? 'Before' : 'After';

        figure.append(img, caption);
        comparison.append(figure);
      });
    }
  }

  const parts = [identity, story, comparison].filter(Boolean);
  block.replaceChildren(...parts);
}
