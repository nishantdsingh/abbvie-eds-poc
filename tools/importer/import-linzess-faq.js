/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import accordionParser from './parsers/accordion.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import linzessCleanupTransformer from './transformers/linzess-cleanup.js';
import linzessSectionsTransformer from './transformers/linzess-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'accordion': accordionParser,
  'columns': columnsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  linzessCleanupTransformer,
  linzessSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'linzess-faq',
  description: 'FAQ page with grouped accordion-style Q&A sections, hero banner, and CTA cards',
  urls: [
    'https://www.linzess.com/savings-and-support/faqs'
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.savings-faq-hero']
    },
    {
      name: 'accordion',
      instances: ['.abbv-accordion-container']
    },
    {
      name: 'columns',
      instances: ['.abbv-flex-container-v2']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.savings-faq-hero',
      style: 'dark-purple',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'FAQ Group 1 - IBS-C, CIC & Chronic Constipation',
      selector: '.abbv-container.background-white.background-white-arc.mb24',
      style: 'white',
      blocks: ['accordion'],
      defaultContent: ['.heading-1.c-linz-dark-purple.margin-bottom-24']
    },
    {
      id: 'section-3',
      name: 'FAQ Group 2 - What LINZESS Does & How It Can Help',
      selector: '.abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24',
      style: 'off-white',
      blocks: ['accordion'],
      defaultContent: ['.heading-1.c-linz-dark-purple']
    },
    {
      id: 'section-4',
      name: 'FAQ Group 3 - Getting Treatment & More Resources',
      selector: ['.abbv-container.background-white.background-white-arc.mb24'],
      style: 'white',
      blocks: ['accordion'],
      defaultContent: ['.heading-1.c-linz-dark-purple']
    },
    {
      id: 'section-5',
      name: 'FAQ Group 4 - Your LINZESS Prescription',
      selector: ['.abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24'],
      style: 'off-white',
      blocks: ['accordion'],
      defaultContent: ['h2.heading-1.c-linz-dark-purple']
    },
    {
      id: 'section-6',
      name: 'CTA Section',
      selector: '.abbv-container.background-dark-purple.background-dark-purple-arc.bottom-nav',
      style: 'dark-purple',
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-7',
      name: 'ISI Section',
      selector: '.abbv-inline-use-isi',
      style: null,
      blocks: [],
      defaultContent: ['.abbv-inline-use-isi', '.linzess-isi-iri']
    }
  ]
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

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
