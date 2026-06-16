import { resolveImageReference, moveInstrumentation } from '../../scripts/scripts.js';
import decorateExternalLinksUtility, { applyCommonProps } from '../../scripts/utils.js';
/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function getIconImage(row) {
  if (!row) return null;
  resolveImageReference(row.firstElementChild || row);
  return row.querySelector('picture');
}

/**
 * Main accordion properties order:
 * 0: blockHeading
 * 1: expandAllText
 * 2: collapseAllText
 * 3: expandAllIcon
 * 4: collapseAllIcon
 * 5: expandIcon
 * 6: collapseIcon
 * 7: expandAllIconImage
 * 8: collapseAllIconImage
 * 9: expandIconImage
 * 10: collapseIconImage
 * 11: ariaExpandAllLabel
 * 12: ariaCollapseAllLabel
 * 13: analyticsId (optional)
 */
function gteConfigIcons(block) {
  const headingText = block.children[0].textContent.trim();
  const expandAllText = block.children[1].textContent.trim();
  const collapseAllText = block.children[2].textContent.trim();
  const expandAllIcon = `icon-${block.children[3].textContent.trim()}`;
  const collapseAllIcon = `icon-${block.children[4].textContent.trim()}`;
  const expandIcon = `item-icon-${block.children[5].textContent.trim()}`;
  const collapseIcon = `item-icon-${block.children[6].textContent.trim()}`;
  const expandAllIconImage = getIconImage(block.children[7]);
  const collapseAllIconImage = getIconImage(block.children[8]);
  const expandIconImage = getIconImage(block.children[9]);
  const collapseIconImage = getIconImage(block.children[10]);
  const ariaExpandAllLabel = block.children[11].textContent.trim();
  const ariaCollapseAllLabel = block.children[12].textContent.trim();
  const analyticsId = block.children[13]?.textContent.trim() || '';

  // clean config rows
  [...block.children].forEach((child, index) => {
    if (index <= 13) {
      child.remove();
    }
  });

  return {
    headingText,
    expandAllText,
    collapseAllText,
    expandAllIcon,
    collapseAllIcon,
    expandIcon,
    collapseIcon,
    expandAllIconImage,
    collapseAllIconImage,
    expandIconImage,
    collapseIconImage,
    ariaExpandAllLabel,
    ariaCollapseAllLabel,
    analyticsId,
  };
}

function decorateHeading(block, headingText) {
  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'accordion-block-heading-wrapper';
  if (headingText) {
    const span = document.createElement('span');
    span.className = 'accordion-block-heading';
    span.textContent = headingText;
    headingWrapper.appendChild(span);
  }
  block.prepend(headingWrapper);
}

function addExpandCollapseAllButton(block, cfg) {
  const headingWrapper = block.querySelector('.accordion-block-heading-wrapper');
  const expandAllBtn = document.createElement('button');
  expandAllBtn.className = `accordion-expand-all ${cfg.expandAllIcon}`;
  expandAllBtn.type = 'button';
  expandAllBtn.textContent = cfg.expandAllText;
  expandAllBtn.setAttribute('aria-label', cfg.ariaExpandAllLabel);
  if (block.classList.contains('accordion-icon-image')) {
    const buttonWrapper = document.createElement('span');
    buttonWrapper.className = 'accordion-expand-all-wrapper';
    if (cfg.expandAllIconImage) {
      cfg.expandAllIconImage.classList.add('accordion-expand-all-image-icon');
      buttonWrapper.appendChild(expandAllBtn);
      buttonWrapper.appendChild(cfg.expandAllIconImage);
    } if (cfg.collapseAllIconImage) {
      cfg.collapseAllIconImage.classList.add('accordion-collapse-all-image-icon');
      buttonWrapper.appendChild(cfg.collapseAllIconImage);
    }
    headingWrapper.append(buttonWrapper);
  } else {
    headingWrapper.append(expandAllBtn);
  }

  expandAllBtn.addEventListener('click', () => {
    const allDetails = block.querySelectorAll('details.accordion-item');
    const allOpen = [...allDetails].every((d) => d.open);
    allDetails.forEach((d) => { d.open = !allOpen; });
    expandAllBtn.classList.toggle('expanded', !allOpen);
    expandAllBtn.classList.toggle(cfg.expandAllIcon, allOpen);
    expandAllBtn.classList.toggle(cfg.collapseAllIcon, !allOpen);
    expandAllBtn.textContent = allOpen ? cfg.expandAllText : cfg.collapseAllText;
    expandAllBtn.setAttribute('aria-label', allOpen ? cfg.ariaCollapseAllLabel : cfg.ariaExpandAllLabel);
  });

  // Update button text when individual items are toggled
  block.addEventListener('toggle', () => {
    const allDetails = block.querySelectorAll('details.accordion-item');
    [...allDetails].forEach((e) => {
      e.firstElementChild.classList.toggle('open', e.open);
    });
    const allOpen = [...allDetails].every((d) => d.open);
    expandAllBtn.textContent = allOpen ? cfg.collapseAllText : cfg.expandAllText;
    expandAllBtn.classList.toggle('expanded', allOpen);
    expandAllBtn.classList.toggle(cfg.expandAllIcon, !allOpen);
    expandAllBtn.classList.toggle(cfg.collapseAllIcon, allOpen);
  }, true);
}

function closeAllExceptCurrent(block) {
  const multiOpen = block.classList.contains('allowmultipleopen') || block.classList.contains('accordion-multi');
  if (!multiOpen) {
    const details = block.querySelectorAll('details.accordion-item');
    details.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (detail.open) {
          details.forEach((d) => {
            if (d !== detail) d.open = false;
          });
        }
      });
    });
  }
}

export default function decorate(block) {
  applyCommonProps(block);
  const cfg = gteConfigIcons(block);

  if (cfg.analyticsId) {
    block.setAttribute('data-analytics-id', cfg.analyticsId);
  }

  [...block.children].forEach((row) => {
    // decorate accordion item label
    if (!row.children[0] || !row.children[1]) return;
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (summary.firstElementChild) {
      summary.firstElementChild.classList.add('accordion-item-label-text');
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (body.firstElementChild) {
      body.firstElementChild.classList.add('accordion-item-body-text');
    }

    // Fragment path detection: UE always has fragmentPath at children[2] (may be empty).
    // Detect UE-authored rows by data-aue-type attribute presence.
    const isUEAuthored = row.hasAttribute('data-aue-type');
    const col2Text = row.children[2]?.textContent.trim() || '';
    const isFragmentPath = /^\/(?!\/)/.test(col2Text);
    const offset = (isUEAuthored || isFragmentPath) ? 1 : 0;
    const fragmentPath = isFragmentPath ? col2Text : '';

    if (isFragmentPath) {
      body.dataset.fragmentPath = fragmentPath;
      // Preserve original content as fallback
      const fallbackNodes = [...body.childNodes].map((n) => n.cloneNode(true));
      body.textContent = '';
      body.classList.add('accordion-fragment-loading');
      fetch(`${fragmentPath}.plain.html`)
        .then((resp) => (resp.ok ? resp.text() : ''))
        .then((html) => {
          if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            doc.querySelectorAll('script, style, iframe, object, embed, base, link').forEach((el) => el.remove());
            // eslint-disable-next-line no-script-url
            const dangerousSchemes = ['javascript:', 'data:', 'vbscript:'];
            const urlAttrs = ['href', 'action', 'formaction', 'src', 'xlink:href', 'srcset', 'poster'];
            doc.querySelectorAll('*').forEach((el) => {
              [...el.attributes].forEach((attr) => {
                const val = attr.value.trim().toLowerCase();
                const isEventHandler = attr.name.startsWith('on');
                const isUnsafeUrl = urlAttrs.includes(attr.name)
                  && dangerousSchemes.some((scheme) => val.startsWith(scheme));
                const isInlineStyle = attr.name === 'style';
                if (isEventHandler || isUnsafeUrl || isInlineStyle) {
                  el.removeAttribute(attr.name);
                }
              });
            });
            body.textContent = '';
            body.classList.remove('accordion-fragment-loading');
            const fragmentContent = document.createElement('div');
            fragmentContent.className = 'accordion-item-body-text';
            fragmentContent.append(...doc.body.childNodes);
            body.append(fragmentContent);
          } else {
            // Restore original content on empty response
            body.textContent = '';
            body.classList.remove('accordion-fragment-loading');
            body.append(...fallbackNodes);
          }
        })
        .catch(() => {
          // Restore original content on network error
          body.textContent = '';
          body.classList.remove('accordion-fragment-loading');
          body.append(...fallbackNodes);
        });
    }

    const ariaExpandLabel = row.children[3 + offset]?.textContent.trim() || '';
    const ariaCollapseLabel = row.children[4 + offset]?.textContent.trim() || '';
    const anchorId = row.children[5 + offset]?.textContent.trim() || '';
    const itemImage = row.children[6 + offset]?.querySelector('picture') || null;
    const imageAlt = row.children[7 + offset]?.textContent.trim() || '';

    if (itemImage && imageAlt) {
      itemImage.querySelector('img')?.setAttribute('alt', imageAlt);
    }

    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    // Use the third column for additional classes on the details element
    details.className = `${row.children[2 + offset]?.textContent.trim().replaceAll(',', '') || ''}`;
    if (anchorId) details.setAttribute('id', anchorId);
    if (details.classList.contains('defaultopen')) {
      summary.classList.add(cfg.collapseIcon);
      details.setAttribute('open', '');
      details.setAttribute('aria-label', ariaExpandLabel);
    } else {
      summary.classList.add(cfg.expandIcon);
      summary.setAttribute('aria-label', ariaCollapseLabel);
    }
    if (block.classList.contains('accordion-icon-image')) {
      if (cfg.expandIconImage) {
        const expandIcon = cfg.expandIconImage.cloneNode(true);
        expandIcon.classList.add('accordion-expand-image-icon');
        summary.appendChild(expandIcon);
      }
      if (cfg.collapseIconImage) {
        const collapseIcon = cfg.collapseIconImage.cloneNode(true);
        collapseIcon.classList.add('accordion-collapse-image-icon');
        summary.appendChild(collapseIcon);
      }
    }

    details.addEventListener('toggle', () => {
      details.setAttribute('aria-label', details.open ? ariaExpandLabel : ariaCollapseLabel);
      summary.classList.toggle(cfg.collapseIcon, details.open);
      summary.classList.toggle(cfg.expandIcon, !details.open);
    });

    if (itemImage) body.appendChild(itemImage);
    details.append(summary, body);
    row.replaceWith(details);
  });

  // decorate accordion heading
  decorateHeading(block, cfg.headingText);

  // Add Expand All / Collapse All button
  const showExpandAll = block.classList.contains('showexpandcollapseall') || block.classList.contains('accordion-expand-all');
  if (showExpandAll) {
    addExpandCollapseAllButton(block, cfg);
  }

  // multiple accordion items open at the same time if "allowmultipleopen" class is present
  closeAllExceptCurrent(block);

  // Decorate external links across the entire block
  decorateExternalLinksUtility(block);
}
