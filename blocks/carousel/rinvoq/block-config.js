import { showSlide } from '../carousel.js';

function stopAutoPlay(block) {
  if (block.autoPlayTimer) {
    clearInterval(block.autoPlayTimer);
    block.autoPlayTimer = null;
  }
}

function startAutoPlay(block, interval = 5000) {
  stopAutoPlay(block);
  if (document.hidden) return;
  block.autoPlayTimer = setInterval(() => {
    const current = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, current + 1);
  }, interval);
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      afterDecorate: async (block) => {
        const slides = block.querySelectorAll('.carousel-slide');
        if (slides.length < 2) return;

        // Guard against duplicate registration on re-render
        if (block.autoPlayInitialized) return;
        block.autoPlayInitialized = true;

        if (!block.dataset.activeSlide) {
          block.dataset.activeSlide = '0';
        }

        startAutoPlay(block);

        block.addEventListener('mouseenter', () => stopAutoPlay(block));
        block.addEventListener('mouseleave', () => startAutoPlay(block));
        block.addEventListener('focusin', () => stopAutoPlay(block));
        block.addEventListener('focusout', (e) => {
          if (!block.contains(e.relatedTarget)) startAutoPlay(block);
        });

        const onVisibilityChange = () => {
          if (document.hidden) {
            stopAutoPlay(block);
          } else {
            startAutoPlay(block);
          }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Cleanup on block removal (MutationObserver)
        const observer = new MutationObserver(() => {
          if (!block.isConnected) {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            stopAutoPlay(block);
            observer.disconnect();
          }
        });
        observer.observe(block.parentElement || document.body, { childList: true });
      },
    },
  };
}
