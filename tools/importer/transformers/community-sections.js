/* eslint-disable */
/* global WebImporter */

/**
 * Community-support sections transformer
 * Adds section breaks and section-metadata based on .abbv-container backgrounds
 *
 * Sections:
 * 1. Hero (no style - hero block handles its own bg)
 * 2. Healthy Routines (.background-white) -> style: white
 * 3. Wellness Tips (.background-dark-purple) -> style: dark-purple
 * 4. Community Resources (.background-off-white) -> style: off-white
 * 5. Bottom Nav (.background-dark-purple.bottom-nav) -> style: dark-purple
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  const { document } = payload;

  // Find all section containers and inject section boundaries + metadata
  // This runs BEFORE parsers, so .abbv-container elements still exist
  const containers = element.querySelectorAll('.abbv-container[class*="background-"]');

  containers.forEach((container, index) => {
    const cls = container.className;

    let style = null;
    if (cls.includes('background-dark-purple')) style = 'dark-purple';
    else if (cls.includes('background-off-white')) style = 'off-white';
    else if (cls.includes('background-white')) style = 'white';

    // Add hr before each section (section break)
    const hr = document.createElement('hr');
    container.before(hr);

    // Add section-metadata div as last child of container
    if (style) {
      const metaTable = document.createElement('div');
      metaTable.className = 'section-metadata';
      const rowWrapper = document.createElement('div');
      const row = document.createElement('div');
      const keyCell = document.createElement('div');
      keyCell.textContent = 'style';
      const valCell = document.createElement('div');
      valCell.textContent = style;
      row.appendChild(keyCell);
      row.appendChild(valCell);
      rowWrapper.appendChild(row);
      metaTable.appendChild(rowWrapper);
      container.appendChild(metaTable);
    }
  });

  // Add section break before ISI
  const isi = element.querySelector('.abbv-inline-use-isi');
  if (isi) {
    const hr = document.createElement('hr');
    isi.before(hr);
  }
}
