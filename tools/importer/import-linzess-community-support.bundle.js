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

  // tools/importer/import-linzess-community-support.js
  var import_linzess_community_support_exports = {};
  __export(import_linzess_community_support_exports, {
    default: () => import_linzess_community_support_default
  });

  // tools/importer/parsers/community-hero.js
  function parse(element, { document }) {
    const img = element.querySelector("img");
    const imgSrc = img ? img.getAttribute("src") : "";
    const eyebrowEl = element.querySelector(".abbv-stretched-card-body p:first-child");
    const eyebrow = eyebrowEl ? eyebrowEl.textContent.trim() : "";
    const headingEl = element.querySelector("h1");
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(" field:image "));
    if (img) {
      const pic = document.createElement("picture");
      const newImg = document.createElement("img");
      newImg.src = imgSrc;
      newImg.alt = "";
      pic.appendChild(newImg);
      const p = document.createElement("p");
      p.appendChild(pic);
      imageFrag.appendChild(p);
    }
    const eyebrowFrag = document.createDocumentFragment();
    eyebrowFrag.appendChild(document.createComment(" field:eyebrow "));
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow;
      eyebrowFrag.appendChild(p);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (headingEl) {
      textFrag.appendChild(headingEl.cloneNode(true));
    }
    const cells = [
      [imageFrag],
      [eyebrowFrag],
      [textFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/community-cards.js
  function parse2(element, { document }) {
    const items = element.querySelectorAll(".abbv-flex-item-v2");
    if (!items || items.length === 0) return;
    const rows = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const title = item.querySelector(".abbv-stretched-card-body p b") || item.querySelector(".abbv-stretched-card-body p:first-child");
      const descEl = item.querySelector(".abbv-stretched-card-body p:nth-child(2)");
      const ctaEl = item.querySelector(".abbv-stretched-card-body a");
      const iconImg = item.querySelector(".abbv-image-content-container-v2 img") || item.querySelector("img");
      const headingEl = item.querySelector(".abbv-stretched-card-body p b") || item.querySelector("p.heading-2") || item.querySelector("h2");
      const listEl = item.querySelector("ul");
      const imageFrag = document.createDocumentFragment();
      imageFrag.appendChild(document.createComment(" field:image "));
      if (iconImg || img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = (iconImg || img).getAttribute("src") || "";
        newImg.alt = (iconImg || img).getAttribute("alt") || "";
        pic.appendChild(newImg);
        const p = document.createElement("p");
        p.appendChild(pic);
        imageFrag.appendChild(p);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const titleText = title ? title.textContent.trim() : headingEl ? headingEl.textContent.trim() : "";
      if (titleText) {
        const h = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = titleText;
        h.appendChild(strong);
        textFrag.appendChild(h);
      }
      if (listEl) {
        textFrag.appendChild(listEl.cloneNode(true));
      } else if (descEl && descEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        textFrag.appendChild(p);
      }
      if (ctaEl) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = ctaEl.getAttribute("href") || "";
        a.textContent = ctaEl.textContent.trim();
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      rows.push([imageFrag, textFrag]);
    });
    if (rows.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/parsers/community-video.js
  function parse3(element, { document }) {
    const titleEl = element.querySelector("h3") || element.querySelector(".heading-2");
    const title = titleEl ? titleEl.textContent.trim() : "SEEKING THE RIGHT TREATMENT";
    const playerClass = element.querySelector('[class*="bc-player-"]');
    let playerId = "Mcp9TXMkPT";
    if (playerClass) {
      const match = playerClass.className.match(/bc-player-(\w+)_default/);
      if (match) playerId = match[1];
    }
    const cells = [
      [""],
      // projectNumber
      [title],
      // overlayTitle
      [""],
      // overlayDescription
      [""],
      // posterType
      [""],
      // posterImage
      [""],
      // posterAlt
      [""],
      // colorOverlay
      [""],
      // overlayButtonText
      [""],
      // overlayButtonIconType
      [""],
      // overlayButtonFontIcon
      [""],
      // overlayButtonImageIcon
      [""],
      // iconPosition
      [""],
      // playerType
      ["1029485116001"],
      // accountId
      [playerId],
      // playerId
      ["6391878936112"],
      // videoId
      [""],
      // playlistId
      [""],
      // defaultPlaylistVideoId
      [""],
      // playlistType
      [""],
      // videoContentLayout
      [""],
      // playlistLayout
      [""],
      // enablePlaylistThumbnailMetadata
      [""],
      // enableAutoplay
      [""],
      // enableLoop
      [""],
      // enableCaptions
      [""],
      // enableVideoChapters
      [""],
      // enableRecommendedVideo
      [""],
      // enablePlayerControls
      [""],
      // enableSocialShare
      [""],
      // enableTranscript
      [""],
      // transcriptType
      [""],
      // showTranscriptLabel
      [""],
      // hideTranscriptLabel
      [""],
      // transcriptClickBehavior
      [""],
      // modalHiddenPanelId
      [""],
      // transcriptLink
      [""],
      // transcriptButtonIconType
      [""],
      // transcriptShowFontIcon
      [""],
      // transcriptShowImageIcon
      [""],
      // transcriptHideFontIcon
      [""],
      // transcriptHideImageIcon
      [""],
      // transcriptLinkIconPosition
      [""],
      // playButtonAriaLabel
      [""]
      // videoCaption
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "brightcove-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/community-columns.js
  function parse4(element, { document }) {
    if (element.classList.contains("flexbox-cards") || element.className.includes("article-flashcards") || element.className.includes("wellness-tips") || element.className.includes("resources-page") || element.className.includes("flexbox-video-cards")) {
      return;
    }
    const items = element.querySelectorAll(".abbv-flex-item-v2");
    if (!items || items.length === 0) return;
    const row = [];
    items.forEach((item) => {
      const contentFrag = document.createDocumentFragment();
      const img = item.querySelector("img");
      if (img) {
        const pic = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.getAttribute("src") || "";
        newImg.alt = img.getAttribute("alt") || "";
        pic.appendChild(newImg);
        const p = document.createElement("p");
        p.appendChild(pic);
        contentFrag.appendChild(p);
      }
      const textContainer = item.querySelector(".abbv-stretched-card-body") || item.querySelector(".abbv-image-text-content-v2") || item.querySelector(".abbv-rich-text");
      if (textContainer) {
        const headings = textContainer.querySelectorAll("h1, h2, h3, p.heading-1, p.heading-2");
        headings.forEach((h) => {
          const newH = document.createElement("h2");
          newH.textContent = h.textContent.trim();
          contentFrag.appendChild(newH);
        });
        const paras = textContainer.querySelectorAll('p:not([class*="heading"])');
        paras.forEach((p) => {
          var _a;
          if (p.textContent.trim() && !((_a = p.querySelector("b")) == null ? void 0 : _a.textContent.match(/heading/i))) {
            const newP = document.createElement("p");
            newP.innerHTML = p.innerHTML;
            contentFrag.appendChild(newP);
          }
        });
        const links = textContainer.querySelectorAll('a.abbv-button-primary, a.abbv-button-secondary, a[class*="button"]');
        links.forEach((a) => {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = a.getAttribute("href") || "";
          link.textContent = a.textContent.trim();
          p.appendChild(link);
          contentFrag.appendChild(p);
        });
      } else {
        const heading = item.querySelector("h2, p.heading-2");
        if (heading) {
          const h = document.createElement("h2");
          h.textContent = heading.textContent.trim();
          contentFrag.appendChild(h);
        }
        const link = item.querySelector("a");
        if (link) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = link.getAttribute("href") || "";
          a.textContent = link.textContent.trim();
          p.appendChild(a);
          contentFrag.appendChild(p);
        }
      }
      row.push(contentFrag);
    });
    if (row.length === 0) return;
    const cells = [row];
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

  // tools/importer/transformers/community-sections.js
  function transform2(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const { document } = payload;
    const containers = element.querySelectorAll('.abbv-container[class*="background-"]');
    containers.forEach((container, index) => {
      const cls = container.className;
      let style = null;
      if (cls.includes("background-dark-purple")) style = "dark-purple";
      else if (cls.includes("background-off-white")) style = "off-white";
      else if (cls.includes("background-white")) style = "white";
      const hr = document.createElement("hr");
      container.before(hr);
      if (style) {
        const metaTable = document.createElement("div");
        metaTable.className = "section-metadata";
        const rowWrapper = document.createElement("div");
        const row = document.createElement("div");
        const keyCell = document.createElement("div");
        keyCell.textContent = "style";
        const valCell = document.createElement("div");
        valCell.textContent = style;
        row.appendChild(keyCell);
        row.appendChild(valCell);
        rowWrapper.appendChild(row);
        metaTable.appendChild(rowWrapper);
        container.appendChild(metaTable);
      }
    });
    const isi = element.querySelector(".abbv-inline-use-isi");
    if (isi) {
      const hr = document.createElement("hr");
      isi.before(hr);
    }
  }

  // tools/importer/import-linzess-community-support.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "brightcove-video": parse3,
    "columns": parse4
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "linzess-community-support",
    description: "Community support and resources page with article cards, wellness tips, video, and promotional touts",
    urls: ["https://www.linzess.com/savings-and-support/community-support"],
    blocks: [
      {
        name: "hero",
        instances: [".hero-container"]
      },
      {
        name: "cards",
        instances: [
          ".abbv-flex-container-v2.flexbox-article-cards",
          ".abbv-flex-container-v2.wellness-tips-cards",
          ".abbv-flex-container-v2.resources-page"
        ]
      },
      {
        name: "brightcove-video",
        instances: [".abbv-video-player"]
      },
      {
        name: "columns",
        instances: [".abbv-flex-container-v2.flexbox-column-mobile"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".hero-container",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Healthy Routines",
        selector: ".abbv-container.background-white.pb155",
        style: "white",
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Wellness Tips",
        selector: ".abbv-container.background-dark-purple.pb155",
        style: "dark-purple",
        blocks: ["cards", "columns"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Community Resources",
        selector: ".abbv-container.background-off-white",
        style: "off-white",
        blocks: ["cards", "brightcove-video", "columns"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Bottom Navigation",
        selector: ".abbv-container.background-dark-purple.bottom-nav",
        style: "dark-purple",
        blocks: ["columns"],
        defaultContent: []
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_linzess_community_support_default = {
    transform: (payload) => {
      var _a;
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
        }
      });
      executeTransformers("afterTransform", main, payload);
      const allBlocks = main.querySelectorAll(".hero, .cards, .brightcove-video, .columns");
      const sectionStyles = ["white", "dark-purple", "off-white", "dark-purple"];
      let sectionIndex = 0;
      allBlocks.forEach((block, i) => {
        if (block.classList.contains("hero")) {
          const hr2 = document.createElement("hr");
          block.parentElement.insertBefore(hr2, block.nextSibling);
        }
      });
      const addSectionMeta = (afterEl, style) => {
        if (!afterEl || !afterEl.parentElement) return;
        const metaDiv = document.createElement("div");
        metaDiv.className = "section-metadata";
        const row = document.createElement("div");
        const keyCell = document.createElement("div");
        keyCell.textContent = "style";
        const valCell = document.createElement("div");
        valCell.textContent = style;
        row.appendChild(keyCell);
        row.appendChild(valCell);
        const rowWrapper = document.createElement("div");
        rowWrapper.appendChild(row);
        metaDiv.appendChild(rowWrapper);
        afterEl.parentElement.insertBefore(metaDiv, afterEl.nextSibling);
      };
      const heroBlock = main.querySelector(".hero");
      const cardsBlocks = main.querySelectorAll(".cards");
      const videoBlock = main.querySelector(".brightcove-video");
      const columnsBlock = main.querySelector(".columns");
      if (cardsBlocks[0]) {
        addSectionMeta(cardsBlocks[0], "white");
        const hr2 = document.createElement("hr");
        cardsBlocks[0].parentElement.insertBefore(hr2, (_a = cardsBlocks[0].nextSibling) == null ? void 0 : _a.nextSibling);
      }
      if (cardsBlocks[2]) {
        addSectionMeta(cardsBlocks[2], "dark-purple");
        const hr2 = document.createElement("hr");
        const meta = cardsBlocks[2].nextSibling;
        if (meta) cardsBlocks[2].parentElement.insertBefore(hr2, meta.nextSibling);
      }
      if (videoBlock) {
        addSectionMeta(videoBlock, "off-white");
        const hr2 = document.createElement("hr");
        const meta = videoBlock.nextSibling;
        if (meta) videoBlock.parentElement.insertBefore(hr2, meta.nextSibling);
      }
      if (columnsBlock) {
        addSectionMeta(columnsBlock, "dark-purple");
      }
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
  return __toCommonJS(import_linzess_community_support_exports);
})();
