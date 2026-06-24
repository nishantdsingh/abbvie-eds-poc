/* eslint-disable */

/**
 * Appends the standard Linzess page metadata block (brand, nav, footer, title)
 * to migrated utility pages so they render with the correct brand chrome.
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const { document } = payload;

  const title = (document.title
    || document.querySelector('title')?.textContent
    || element.querySelector('h1, h2, h3')?.textContent
    || '').trim();

  const description = (
    document.querySelector('meta[name="description"]')?.getAttribute('content')
    || ''
  ).trim();

  // Some utility pages (e.g. the SMS reminder terms & conditions) render on the
  // live site as standalone documents with NO header/footer. For those, omit the
  // nav/footer metadata so the header/footer blocks have no fragment to load.
  const sourceUrl = payload.params?.originalURL || payload.url || '';
  const noChrome = /reminder-terms-conditions/i.test(sourceUrl);

  // For no-chrome pages, set nav/footer to the explicit `false` opt-out so the
  // header/footer blocks skip rendering (omitting them lets footer fall back to
  // the existing /footer fragment, which would still render).
  const cells = [
    ['Metadata'],
    ['brand', 'linzess'],
    ...(noChrome
      ? [['nav', 'false'], ['footer', 'false']]
      : [['nav', '/linzess/nav'], ['footer', '/linzess/footer']]),
    ['title', title],
    ['description', description],
  ].filter((row) => row.length === 1 || row[1]);

  // Use the WebImporter table helper so html2md emits a real block table
  // (a hand-built div.metadata is serialized as plain paragraphs instead).
  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.append(table);
}
