/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: linzess cleanup
 * Removes non-authorable site chrome from LINZESS pages.
 * All selectors validated against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove modals (exit-site modals, WOL modals) - found at lines 987, 1040, 1093, 1177, 1228
    WebImporter.DOMUtils.remove(element, ['.abbv-modal']);

    // Remove OneTrust cookie consent banner - found at line 2364
    WebImporter.DOMUtils.remove(element, ['#onetrust-consent-sdk']);

    // Remove floating safety bar (sticky ISI tray) - found at line 2162
    // This is the floating/sticky bar, NOT the inline ISI content (section 7)
    WebImporter.DOMUtils.remove(element, ['.abbv-safety-bar']);

    // Remove back-to-top button - found at line 980
    WebImporter.DOMUtils.remove(element, ['.abbv-back-to-top']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header/navigation - found at line 20
    WebImporter.DOMUtils.remove(element, ['header.abbv-header-v2']);

    // Remove top promotional banner - found at line 13
    WebImporter.DOMUtils.remove(element, ['.linzess-top-banner']);

    // Remove sticky anchor div - found at line 229
    WebImporter.DOMUtils.remove(element, ['.abbv-sticky-anchor']);

    // Remove footer - found at line 795
    WebImporter.DOMUtils.remove(element, ['footer.abbv-footer']);

    // Remove misc ISI anchor/container - found at line 786
    WebImporter.DOMUtils.remove(element, ['.abbv-inline-miscisi']);

    // Remove iframes (tracking, OneTrust text-resize) - found at lines 1983, 2362, 2605
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Remove empty structural divs that are not authorable
    WebImporter.DOMUtils.remove(element, ['.newpar.new.section']);
    WebImporter.DOMUtils.remove(element, ['.par.iparys_inherited']);
  }
}
