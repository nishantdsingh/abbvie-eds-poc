export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row, index) => {
    row.classList.add('step');
    row.setAttribute('data-step', index + 1);
  });
}
