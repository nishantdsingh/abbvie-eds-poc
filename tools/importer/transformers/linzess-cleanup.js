/* eslint-disable */

/**
 * Linzess site-wide DOM cleanup transformer.
 * Removes non-authorable elements (header, footer, cookie banners, modals, etc.)
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  const { document } = payload;

  // Remove header/navigation
  element.querySelectorAll('header, nav, .abbv-header, .abbv-nav, .abbv-sticky-anchor').forEach((el) => el.remove());

  // Remove footer
  element.querySelectorAll('footer, .abbv-footer').forEach((el) => el.remove());

  // Remove cookie consent / OneTrust
  element.querySelectorAll('#onetrust-consent-sdk, .onetrust-pc-dark-filter, [class*="onetrust"]').forEach((el) => el.remove());

  // Remove safety bar / floating ISI
  element.querySelectorAll('.abbv-safety-bar, .abbv-floating-isi').forEach((el) => el.remove());

  // Remove modals
  element.querySelectorAll('.abbv-modal, [class*="modal"]').forEach((el) => el.remove());

  // Remove scripts, styles, noscript
  element.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach((el) => el.remove());

  // Remove tracking/analytics elements
  element.querySelectorAll('iframe, [class*="recaptcha"], .grecaptcha-badge').forEach((el) => el.remove());

  // Remove AEM placeholder/loading elements
  element.querySelectorAll('.cmp-adaptiveform-container-form-loading, .abbv-animation-loading').forEach((el) => el.remove());

  // Remove top banner (already in page content)
  element.querySelectorAll('.abbv-top-banner, .abbv-eyebrow').forEach((el) => el.remove());

  // Clean data attributes that aren't needed
  element.querySelectorAll('[data-cmp-is], [data-sly-resource]').forEach((el) => {
    el.removeAttribute('data-cmp-is');
    el.removeAttribute('data-sly-resource');
  });
}
