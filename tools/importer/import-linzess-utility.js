/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/linzess-cleanup.js';
import contentTransformer from './transformers/linzess-utility-content.js';
import isiTransformer from './transformers/linzess-utility-isi.js';
import metadataTransformer from './transformers/linzess-utility-metadata.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'linzess-utility',
  description: 'Linzess utility pages (sitemap, SMS reminder terms, legal) — simple default-content documents',
  urls: [
    'https://www.linzess.com/sitemap',
    'https://www.linzess.com/reminder-terms-conditions',
  ],
  blocks: [],
  sections: [],
};

// TRANSFORMER REGISTRY (order matters)
const transformers = [
  contentTransformer, // beforeTransform: isolate <main>, drop ISI
  cleanupTransformer, // beforeTransform: strip header/footer/cookie/scripts
  isiTransformer, // afterTransform: append verbatim ISI + floating safety-bar
  metadataTransformer, // afterTransform: append brand metadata block
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);
    executeTransformers('afterTransform', main, payload);

    // NOTE: metadata is appended explicitly by metadataTransformer, so we do
    // NOT call WebImporter.rules.createMetadata (it would emit a duplicate block).
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const slug = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '')
      .split('/')
      .filter(Boolean)
      .pop() || 'index';
    const path = WebImporter.FileUtils.sanitizePath(`/linzess/utility/${slug}`);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: [],
      },
    }];
  },
};
