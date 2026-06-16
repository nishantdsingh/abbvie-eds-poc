/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess site-wide cleanup.
 * Removes non-authorable content (header, footer, modals, safety bar, banners, tracking,
 * video player chrome, cookie consent, presentational elements).
 * All selectors validated against migration-work/cleaned.html for https://www.linzess.com/find-relief
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove modals that overlay content and could interfere with block parsing
    WebImporter.DOMUtils.remove(element, [
      '.abbv-modal',
    ]);

    // Remove Brightcove video player chrome (keep .vjs-poster and .vjs-dock-text for content extraction)
    WebImporter.DOMUtils.remove(element, [
      '.vjs-control-bar',
      '.vjs-modal-dialog',
      '.vjs-text-track-settings',
      '.vjs-error-display',
      '.vjs-player-info-modal',
      '.vjs-loading-spinner',
      '.vjs-text-track-display',
      '.vjs-dock-shelf',
    ]);

    // Remove video player form elements (caption settings)
    const selects = element.querySelectorAll('video-js select, video-js fieldset');
    selects.forEach((el) => el.remove());

    // Remove tracking pixel images from Brightcove metrics
    const allImgs = element.querySelectorAll('img');
    const trackingDomains = ['metrics.brightcove.com', 'dpm.demdex.net', 'adservice.google.com', 'gstatic.com/recaptcha'];
    allImgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (trackingDomains.some((domain) => src.includes(domain))) {
        img.remove();
      }
    });

    // Remove cookie consent elements
    WebImporter.DOMUtils.remove(element, [
      '[class*="onetrust"]',
      '[id*="onetrust"]',
      '[class*="optanon"]',
      '#ot-sdk-btn-floating',
    ]);

    // Remove script and style tags
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome and global elements
    WebImporter.DOMUtils.remove(element, [
      'header.abbv-header-v2',
      'footer.abbv-footer',
      '.linzess-top-banner',
      '.header-v2.parbase',
      '.footer.parbase',
      '.safety-bar.parbase',
      '.abbv-safety-bar',
      '.abbv-skip-to-main-content',
      '.abbv-sticky-anchor',
    ]);

    // Remove empty structural divs that are not authorable
    WebImporter.DOMUtils.remove(element, [
      '.newpar.new.section',
      '.par.iparys_inherited',
    ]);

    // Remove non-content elements
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'iframe',
    ]);

    // Remove modal-open trigger links (e.g., Healthcare Professionals modal trigger)
    const modalLinks = element.querySelectorAll('a.abbv-modal-open');
    modalLinks.forEach((link) => link.remove());

    // Remove presentational line breaks (desktop-only, mobile-only)
    const presentationalBrs = element.querySelectorAll('br.desktop-only, br.mobile-only');
    presentationalBrs.forEach((br) => {
      br.replaceWith(document.createTextNode(' '));
    });

    // Remove empty structural divs left over after cleanup
    const emptyDivs = element.querySelectorAll('.vjs-dock-shelf, .abbv-inline-miscisi');
    emptyDivs.forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('img')) {
        div.remove();
      }
    });
  }
}
