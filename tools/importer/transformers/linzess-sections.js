/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Linzess section breaks and section-metadata insertion.
 * Uses payload.template.sections from page-templates.json to identify section boundaries
 * and insert <hr> breaks and Section Metadata blocks with style and anchorId properties.
 *
 * Improved features:
 * - Supports both CSS selectors and anchor-ID-based selectors (e.g., #talktoadoctor)
 * - Falls back to finding <a id="..."> anchor elements when direct querySelector fails
 * - Inserts anchorId in Section Metadata when section defines one
 * - Handles nested containers (uses parent container as section boundary)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Find the first element matching a section's selector(s).
 * Selectors can be a string or an array of strings (tried in order).
 * Supports special handling for anchor-based selectors (#id):
 *   - First tries querySelector directly
 *   - If that fails for # selectors, looks for <a id="..."> and uses its parent container
 */
function findSectionElement(element, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    // Try direct querySelector first
    try {
      const el = element.querySelector(sel);
      if (el) {
        // If we matched an <a> anchor element (e.g., <a id="talktoadoctor">),
        // use its parent container as the section boundary
        if (el.tagName === 'A' && !el.href && el.id) {
          const parent = el.closest('.abbv-container, .container.parbase, section, [class*="container"]');
          if (parent) return parent;
          // Fallback: use the anchor's direct parent
          return el.parentElement;
        }
        return el;
      }
    } catch (e) {
      // Invalid selector, try next
    }

    // For hash-based selectors, try finding anchor elements
    if (sel.startsWith('#')) {
      const anchorId = sel.substring(1);
      // Look for <a id="anchorId"> elements
      const anchor = element.querySelector(`a[id="${anchorId}"]`);
      if (anchor) {
        // Use the closest container parent as the section element
        const parent = anchor.closest('.abbv-container, .container.parbase, section, [class*="container"]');
        if (parent) return parent;
        return anchor.parentElement;
      }
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const doc = element.ownerDocument || document;

    const sections = template.sections;

    // Process sections in reverse order to preserve DOM positions
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);

      if (!sectionEl) continue;

      // Build Section Metadata cells if style or anchorId is defined
      const hasMeta = section.style || section.anchorId;
      if (hasMeta) {
        const metaCells = {};
        if (section.style) {
          metaCells.style = section.style;
        }
        if (section.anchorId) {
          metaCells.anchorId = section.anchorId;
        }
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: metaCells,
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before section element for all non-first sections
      if (i > 0) {
        const hr = doc.createElement('hr');
        // If the section boundary is a container, look for a preceding anchor element
        const prevAnchor = sectionEl.previousElementSibling;
        if (prevAnchor && prevAnchor.tagName === 'A' && prevAnchor.id && !prevAnchor.href) {
          // Place hr before the anchor, not the container
          prevAnchor.before(hr);
        } else {
          sectionEl.before(hr);
        }
      }
    }
  }
}
