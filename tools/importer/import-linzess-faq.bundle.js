/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-linzess-faq.js
  var import_linzess_faq_exports = {};
  __export(import_linzess_faq_exports, {
    default: () => import_linzess_faq_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bgImage = element.querySelector('.abbv-image-content-container-v2 img, picture img, img[class*="hero"], img');
    const eyebrow = element.querySelector('p.eyebrow, .eyebrow, [class*="eyebrow"]');
    const heading = element.querySelector('h1, h2, h3, [class*="heading"]');
    const ctaLinks = Array.from(element.querySelectorAll('a.cta, a.button, .abbv-stretched-card-body a, a[class*="btn"]'));
    const cells = [];
    if (bgImage) {
      const imageCell = document.createElement("div");
      const imageHint = document.createComment(" field: image ");
      imageCell.appendChild(imageHint);
      imageCell.appendChild(bgImage.cloneNode(true));
      cells.push([imageCell]);
    } else {
      const emptyImageCell = document.createElement("div");
      const imageHint = document.createComment(" field: image ");
      emptyImageCell.appendChild(imageHint);
      cells.push([emptyImageCell]);
    }
    const eyebrowCell = document.createElement("div");
    const eyebrowHint = document.createComment(" field: eyebrow ");
    eyebrowCell.appendChild(eyebrowHint);
    if (eyebrow) {
      eyebrowCell.appendChild(eyebrow.cloneNode(true));
    }
    cells.push([eyebrowCell]);
    const textCell = document.createElement("div");
    const textHint = document.createComment(" field: text ");
    textCell.appendChild(textHint);
    if (heading) {
      const headingClone = heading.cloneNode(true);
      // Markdown headings are single-line, so a mid-heading <br> is dropped on
      // publish and the surrounding phrases concatenate (e.g. "QuestionsAbout").
      // Replace each <br> with a space so the heading stays readable and wraps
      // naturally on the rendered page.
      headingClone.querySelectorAll("br").forEach((br) => {
        br.replaceWith(document.createTextNode(" "));
      });
      textCell.appendChild(headingClone);
    }
    if (ctaLinks.length > 0) {
      ctaLinks.forEach((link) => {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.appendChild(link.cloneNode(true));
        p.appendChild(strong);
        textCell.appendChild(p);
      });
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse2(element, { document }) {
    if (element.dataset && element.dataset.accordionProcessed) return;
    if (!element.closest || !element.parentElement) return;
    const section = element.closest(".abbv-container") || element.parentElement;
    const allContainers = section.querySelectorAll(".abbv-accordion-container");
    if (!allContainers || allContainers.length === 0) return;
    const itemRows = [];
    allContainers.forEach((container) => {
      const questionEl = container.querySelector(".abbv-accordion-blade-text");
      const answerContainer = container.querySelector(".abbv-accordion-content .abbv-rich-text") || container.querySelector(".abbv-accordion-content .rich-text");
      const summaryFrag = document.createDocumentFragment();
      summaryFrag.appendChild(document.createComment(" field:summary "));
      if (questionEl) {
        summaryFrag.appendChild(questionEl.cloneNode(true));
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (answerContainer) {
        textFrag.appendChild(answerContainer.cloneNode(true));
      }
      itemRows.push([
        summaryFrag,
        textFrag,
        "",
        "",
        "",
        "",
        ""
      ]);
      container.setAttribute("data-accordion-processed", "true");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells: itemRows });
    element.replaceWith(block);
    allContainers.forEach((container) => {
      if (container.parentElement) {
        const parbase = container.closest(".accordion.parbase") || container.closest(".abbv-accordion") || container;
        if (parbase && parbase.parentElement) {
          parbase.remove();
        }
      }
    });
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const columnItems = element.querySelectorAll(":scope .abbv-flex-item-v2");
    const cells = [];
    const row = [];
    columnItems.forEach((col) => {
      const colContent = document.createElement("div");
      const heading = col.querySelector('p.heading-2, h2, h3, [class*="heading"]');
      if (heading) {
        const h2 = document.createElement("h2");
        h2.textContent = heading.textContent.trim();
        colContent.appendChild(h2);
      }
      const ctas = col.querySelectorAll('.cta a, a.abbv-button-primary, a[class*="abbv-button"]');
      ctas.forEach((cta) => {
        const link = document.createElement("a");
        link.href = cta.getAttribute("href") || "";
        link.textContent = cta.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(link);
        colContent.appendChild(p);
      });
      const img = col.querySelector("img");
      if (img) {
        colContent.appendChild(img.cloneNode(true));
      }
      row.push(colContent);
    });
    if (row.length > 0) {
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/linzess-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".abbv-modal"]);
      WebImporter.DOMUtils.remove(element, ["#onetrust-consent-sdk"]);
      WebImporter.DOMUtils.remove(element, [".abbv-safety-bar"]);
      WebImporter.DOMUtils.remove(element, [".abbv-back-to-top"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, ["header.abbv-header-v2"]);
      WebImporter.DOMUtils.remove(element, [".linzess-top-banner"]);
      WebImporter.DOMUtils.remove(element, [".abbv-sticky-anchor"]);
      WebImporter.DOMUtils.remove(element, ["footer.abbv-footer"]);
      WebImporter.DOMUtils.remove(element, [".abbv-inline-miscisi"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, [".newpar.new.section"]);
      WebImporter.DOMUtils.remove(element, [".par.iparys_inherited"]);
    }
  }

  // tools/importer/transformers/linzess-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const doc = element.ownerDocument || document;
      const sections = template.sections;
      const selectorCounts = {};
      const sectionElements = [];
      for (const section of sections) {
        const sel = Array.isArray(section.selector) ? section.selector[0] : section.selector;
        if (!selectorCounts[sel]) {
          selectorCounts[sel] = 0;
        }
        const targetIndex = selectorCounts[sel];
        selectorCounts[sel] += 1;
        const matches = element.querySelectorAll(sel);
        const el = matches[targetIndex] || null;
        sectionElements.push({ section, el });
      }
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { section, el } = sectionElements[i];
        if (!el) continue;
        if (section.style) {
          const cells = [["Section Metadata"], ["style", section.style]];
          const table = WebImporter.DOMUtils.createTable(cells, doc);
          if (el.nextSibling) {
            el.parentNode.insertBefore(table, el.nextSibling);
          } else {
            el.parentNode.appendChild(table);
          }
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
  }

  // tools/importer/import-linzess-faq.js
  var parsers = {
    "hero": parse,
    "accordion": parse2,
    "columns": parse3
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "linzess-faq",
    description: "FAQ page with grouped accordion-style Q&A sections, hero banner, and CTA cards",
    urls: [
      "https://www.linzess.com/savings-and-support/faqs"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".savings-faq-hero"]
      },
      {
        name: "accordion",
        instances: [".abbv-accordion-container"]
      },
      {
        name: "columns",
        instances: [".abbv-flex-container-v2"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".savings-faq-hero",
        style: "dark-purple",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "FAQ Group 1 - IBS-C, CIC & Chronic Constipation",
        selector: ".abbv-container.background-white.background-white-arc.mb24",
        style: "white",
        blocks: ["accordion"],
        defaultContent: [".heading-1.c-linz-dark-purple.margin-bottom-24"]
      },
      {
        id: "section-3",
        name: "FAQ Group 2 - What LINZESS Does & How It Can Help",
        selector: ".abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24",
        style: "off-white",
        blocks: ["accordion"],
        defaultContent: [".heading-1.c-linz-dark-purple"]
      },
      {
        id: "section-4",
        name: "FAQ Group 3 - Getting Treatment & More Resources",
        selector: [".abbv-container.background-white.background-white-arc.mb24"],
        style: "white",
        blocks: ["accordion"],
        defaultContent: [".heading-1.c-linz-dark-purple"]
      },
      {
        id: "section-5",
        name: "FAQ Group 4 - Your LINZESS Prescription",
        selector: [".abbv-container.background-off-white.background-off-white-arc.accordion-white-blades.mb24"],
        style: "off-white",
        blocks: ["accordion"],
        defaultContent: ["h2.heading-1.c-linz-dark-purple"]
      },
      {
        id: "section-6",
        name: "CTA Section",
        selector: ".abbv-container.background-dark-purple.background-dark-purple-arc.bottom-nav",
        style: "dark-purple",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "ISI Section",
        selector: ".abbv-inline-use-isi",
        style: null,
        blocks: [],
        defaultContent: [".abbv-inline-use-isi", ".linzess-isi-iri"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
  var import_linzess_faq_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_linzess_faq_exports);
})();
