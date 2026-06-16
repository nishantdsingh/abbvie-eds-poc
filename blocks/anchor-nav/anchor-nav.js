export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Page sections');

  const links = [...block.children].map((row) => {
    const [labelCell, targetCell] = row.children;
    const label = labelCell?.textContent.trim();
    const target = targetCell?.textContent.trim().replace(/^#/, '');
    if (!label || !target) return null;

    const a = document.createElement('a');
    a.href = `#${target}`;
    a.textContent = label;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    });
    return a;
  }).filter(Boolean);

  nav.append(...links);
  block.replaceChildren(nav);

  // Sticky behaviour
  const sentinel = document.createElement('div');
  sentinel.className = 'anchor-nav-sentinel';
  block.before(sentinel);

  const stickyObserver = new IntersectionObserver(
    ([entry]) => block.classList.toggle('is-sticky', !entry.isIntersecting),
    { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64', 10)}px 0px 0px 0px` },
  );
  stickyObserver.observe(sentinel);

  // Active section tracking
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (targets.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.find((a) => a.hash === `#${entry.target.id}`);
          if (link) link.classList.toggle('is-active', entry.isIntersecting);
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );
    targets.forEach((t) => activeObserver.observe(t));
  }
}
