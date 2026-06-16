/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import communityHeroParser from './parsers/community-hero.js';
import communityCardsParser from './parsers/community-cards.js';
import communityVideoParser from './parsers/community-video.js';
import communityColumnsParser from './parsers/community-columns.js';

// TRANSFORMER IMPORTS
import linzessCleanupTransformer from './transformers/linzess-cleanup.js';
import communitySectionsTransformer from './transformers/community-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': communityHeroParser,
  'cards': communityCardsParser,
  'brightcove-video': communityVideoParser,
  'columns': communityColumnsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  linzessCleanupTransformer,
  communitySectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'linzess-community-support',
  description: 'Community support and resources page with article cards, wellness tips, video, and promotional touts',
  urls: ['https://www.linzess.com/savings-and-support/community-support'],
  blocks: [
    {
      name: 'hero',
      instances: ['.hero-container']
    },
    {
      name: 'cards',
      instances: [
        '.abbv-flex-container-v2.flexbox-article-cards',
        '.abbv-flex-container-v2.wellness-tips-cards',
        '.abbv-flex-container-v2.resources-page'
      ]
    },
    {
      name: 'brightcove-video',
      instances: ['.abbv-video-player']
    },
    {
      name: 'columns',
      instances: ['.abbv-flex-container-v2.flexbox-column-mobile']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.hero-container',
      style: null,
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Healthy Routines',
      selector: '.abbv-container.background-white.pb155',
      style: 'white',
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-3',
      name: 'Wellness Tips',
      selector: '.abbv-container.background-dark-purple.pb155',
      style: 'dark-purple',
      blocks: ['cards', 'columns'],
      defaultContent: []
    },
    {
      id: 'section-4',
      name: 'Community Resources',
      selector: '.abbv-container.background-off-white',
      style: 'off-white',
      blocks: ['cards', 'brightcove-video', 'columns'],
      defaultContent: []
    },
    {
      id: 'section-5',
      name: 'Bottom Navigation',
      selector: '.abbv-container.background-dark-purple.bottom-nav',
      style: 'dark-purple',
      blocks: ['columns'],
      defaultContent: []
    }
  ]
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (cards parser handles article, wellness, and resource cards)
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 4b. Add section breaks and section-metadata AFTER all parsing
    // Locate parsed blocks to insert sections between them
    const allBlocks = main.querySelectorAll('.hero, .cards, .brightcove-video, .columns');
    const sectionStyles = ['white', 'dark-purple', 'off-white', 'dark-purple'];
    let sectionIndex = 0;

    allBlocks.forEach((block, i) => {
      // Add section break before cards blocks (they start new sections)
      if (block.classList.contains('hero')) {
        // After hero, add break + white section for "Healthy Routines"
        const hr = document.createElement('hr');
        block.parentElement.insertBefore(hr, block.nextSibling);
      }
    });

    // Simpler approach: find all top-level divs in main and add section breaks
    // based on the known page structure
    const addSectionMeta = (afterEl, style) => {
      if (!afterEl || !afterEl.parentElement) return;
      const metaDiv = document.createElement('div');
      metaDiv.className = 'section-metadata';
      const row = document.createElement('div');
      const keyCell = document.createElement('div');
      keyCell.textContent = 'style';
      const valCell = document.createElement('div');
      valCell.textContent = style;
      row.appendChild(keyCell);
      row.appendChild(valCell);
      const rowWrapper = document.createElement('div');
      rowWrapper.appendChild(row);
      metaDiv.appendChild(rowWrapper);
      afterEl.parentElement.insertBefore(metaDiv, afterEl.nextSibling);
    };

    // Find the parsed blocks and add sections
    const heroBlock = main.querySelector('.hero');
    const cardsBlocks = main.querySelectorAll('.cards');
    const videoBlock = main.querySelector('.brightcove-video');
    const columnsBlock = main.querySelector('.columns');

    // After the first cards block (Healthy Routines section): style white
    if (cardsBlocks[0]) {
      addSectionMeta(cardsBlocks[0], 'white');
      // Add hr after section-metadata to start new section
      const hr = document.createElement('hr');
      cardsBlocks[0].parentElement.insertBefore(hr, cardsBlocks[0].nextSibling?.nextSibling);
    }

    // After the third cards block (end of Wellness Tips dark-purple section)
    if (cardsBlocks[2]) {
      addSectionMeta(cardsBlocks[2], 'dark-purple');
      const hr = document.createElement('hr');
      const meta = cardsBlocks[2].nextSibling;
      if (meta) cardsBlocks[2].parentElement.insertBefore(hr, meta.nextSibling);
    }

    // After video block or last cards in community resources: style off-white
    if (videoBlock) {
      addSectionMeta(videoBlock, 'off-white');
      const hr = document.createElement('hr');
      const meta = videoBlock.nextSibling;
      if (meta) videoBlock.parentElement.insertBefore(hr, meta.nextSibling);
    }

    // After columns block (bottom nav): style dark-purple
    if (columnsBlock) {
      addSectionMeta(columnsBlock, 'dark-purple');
    }

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      }
    }];
  }
};
