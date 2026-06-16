/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: linzess sections
 * Inserts section breaks (<hr>) and Section Metadata blocks based on template sections.
 * Runs in afterTransform only. Uses payload.template.sections from page-templates.json.
 * All selectors validated against migration-work/cleaned.html.
 *
 * Section selectors from cleaned.html:
 *   section-1: .savings-faq-hero (line 237)
 *   section-2: .abbv-container.background-white.background-white-arc.mb24 (line 264, first match)
 *   section-3: .abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24 (line 321, first match)
 *   section-4: .abbv-container.background-white.background-white-arc.mb24 (line 408, second match)
 *   section-5: .abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24 (line 507, second match)
 *   section-6: .abbv-container.background-dark-purple.background-dark-purple-arc.bottom-nav (line 678)
 *   section-7: .abbv-inline-use-isi (line 710)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
    const doc = element.ownerDocument || document;
    const sections = template.sections;

    // Find the first element matching each section's selector, handling duplicates via index tracking
    const selectorCounts = {};
    const sectionElements = [];

    for (const section of sections) {
      // Normalize selector to string (handle array format from page-templates.json)
      const sel = Array.isArray(section.selector) ? section.selector[0] : section.selector;

      // Track how many times we've seen this selector to handle duplicates
      if (!selectorCounts[sel]) {
        selectorCounts[sel] = 0;
      }
      const targetIndex = selectorCounts[sel];
      selectorCounts[sel] += 1;

      // Find all matches for this selector and pick the nth one
      const matches = element.querySelectorAll(sel);
      const el = matches[targetIndex] || null;
      sectionElements.push({ section, el });
    }

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const { section, el } = sectionElements[i];
      if (!el) continue;

      // Add Section Metadata block if the section has a style
      if (section.style) {
        const cells = [['Section Metadata'], ['style', section.style]];
        const table = WebImporter.DOMUtils.createTable(cells, doc);
        // Insert section metadata after the section element
        if (el.nextSibling) {
          el.parentNode.insertBefore(table, el.nextSibling);
        } else {
          el.parentNode.appendChild(table);
        }
      }

      // Insert <hr> before section element (but not for the first section)
      if (i > 0) {
        const hr = doc.createElement('hr');
        el.parentNode.insertBefore(hr, el);
      }
    }
  }
}
