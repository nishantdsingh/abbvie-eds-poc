/*
 * banner-ad
 * Lazy-loading ad placement. Supports two modes:
 *
 * Mode 1 — Google Ad Manager (GPT):
 *   | banner-ad                          |
 *   | ad-unit  | /12345/brand/leaderboard |
 *   | width    | 728                      |
 *   | height   | 90                       |
 *
 * Mode 2 — Inline embed HTML (paste a third-party tag directly):
 *   | banner-ad html                     |
 *   | <paste embed code as paragraph>    |
 *
 * Variant class 'html' switches to embed mode.
 * Ad loads only when scrolled into view (IntersectionObserver).
 *
 * Anti-pattern note: No inline width/height styles — authors must NOT
 * configure visual spacing or sizing via block rows. Sizes in GPT mode
 * set the ad slot only; layout dimensions are controlled via CSS.
 */

const GPT_SCRIPT = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
let gptLoaded = false;
let gptPromise = null;

function loadGPT() {
  if (gptLoaded) return Promise.resolve();
  if (gptPromise) return gptPromise;
  gptPromise = new Promise((resolve, reject) => {
    window.googletag = window.googletag || { cmd: [] };
    const script = document.createElement('script');
    script.src = GPT_SCRIPT;
    script.async = true;
    script.onload = () => { gptLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.append(script);
  });
  return gptPromise;
}

let slotCounter = 0;

function decorateGPT(block, config) {
  slotCounter += 1;
  const slotId = `banner-ad-slot-${slotCounter}`;
  const { 'ad-unit': adUnit, width, height } = config;

  const slot = document.createElement('div');
  slot.id = slotId;
  slot.className = 'banner-ad-slot';
  block.replaceChildren(slot);

  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      try {
        await loadGPT();
        window.googletag.cmd.push(() => {
          const w = parseInt(width, 10) || 0;
          const h = parseInt(height, 10) || 0;
          const sizes = w && h ? [[w, h]] : ['fluid'];

          window.googletag
            .defineSlot(adUnit, sizes, slotId)
            ?.addService(window.googletag.pubads());
          window.googletag.pubads().enableSingleRequest();
          window.googletag.enableServices();
          window.googletag.display(slotId);
        });
      } catch {
        block.hidden = true;
      }
    },
    { rootMargin: '200px' },
  );

  observer.observe(block);
}

function decorateEmbed(block) {
  // Grab raw embed markup from the authored content
  const raw = block.innerHTML;
  block.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'banner-ad-embed';

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      // Inject embed HTML — intentionally no sanitization here since
      // ad embed code must run as-is (scripts). Authors are trusted.
      const wrapper = document.createElement('div');
      wrapper.innerHTML = raw;

      // Re-execute any <script> tags inside the embed
      wrapper.querySelectorAll('script').forEach((original) => {
        const copy = document.createElement('script');
        [...original.attributes].forEach((a) => copy.setAttribute(a.name, a.value));
        copy.textContent = original.textContent;
        original.replaceWith(copy);
      });

      container.append(wrapper);
    },
    { rootMargin: '200px' },
  );

  block.append(container);
  observer.observe(block);
}

export default function decorate(block) {
  const isEmbed = block.classList.contains('html');

  if (isEmbed) {
    decorateEmbed(block);
    return;
  }

  // Parse config rows
  const config = {};
  [...block.children].forEach((row) => {
    const [keyCell, valCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const val = valCell?.textContent.trim();
    if (key && val) config[key] = val;
  });

  if (config['ad-unit']) {
    decorateGPT(block, config);
  } else {
    // No config recognised — hide gracefully
    block.hidden = true;
  }
}
