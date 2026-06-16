export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cell = row.querySelector(':scope > div');
  if (cell) {
    // Move rich-text content directly onto the block element,
    // removing the EDS block table wrapper divs so CSS selectors
    // on .rich-text apply directly to the authored content nodes.
    while (cell.firstChild) {
      row.parentElement.insertBefore(cell.firstChild, row);
    }
    row.remove();
  }
}
