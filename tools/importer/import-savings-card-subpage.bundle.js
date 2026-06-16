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

  // tools/importer/import-savings-card-subpage.js
  var import_savings_card_subpage_exports = {};
  __export(import_savings_card_subpage_exports, {
    default: () => import_savings_card_subpage_default
  });

  // tools/importer/transformers/linzess-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const { document } = payload;
    element.querySelectorAll("header, nav, .abbv-header, .abbv-nav, .abbv-sticky-anchor").forEach((el) => el.remove());
    element.querySelectorAll("footer, .abbv-footer").forEach((el) => el.remove());
    element.querySelectorAll('#onetrust-consent-sdk, .onetrust-pc-dark-filter, [class*="onetrust"]').forEach((el) => el.remove());
    element.querySelectorAll(".abbv-safety-bar, .abbv-floating-isi").forEach((el) => el.remove());
    element.querySelectorAll('.abbv-modal, [class*="modal"]').forEach((el) => el.remove());
    element.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach((el) => el.remove());
    element.querySelectorAll('iframe, [class*="recaptcha"], .grecaptcha-badge').forEach((el) => el.remove());
    element.querySelectorAll(".cmp-adaptiveform-container-form-loading, .abbv-animation-loading").forEach((el) => el.remove());
    element.querySelectorAll(".abbv-top-banner, .abbv-eyebrow").forEach((el) => el.remove());
    element.querySelectorAll("[data-cmp-is], [data-sly-resource]").forEach((el) => {
      el.removeAttribute("data-cmp-is");
      el.removeAttribute("data-sly-resource");
    });
  }

  // tools/importer/import-savings-card-subpage.js
  var PAGE_TEMPLATE = {
    name: "savings-card-subpage",
    description: "Linzess savings card sub-pages including terms, activation, and savings details",
    urls: [
      "https://www.linzess.com/savings-card/terms",
      "https://www.linzess.com/savings-card/activate",
      "https://www.linzess.com/savings-card/savings"
    ],
    blocks: [],
    sections: []
  };
  var transformers = [
    transform
  ];
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
  var import_savings_card_subpage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
          blocks: []
        }
      }];
    }
  };
  return __toCommonJS(import_savings_card_subpage_exports);
})();
