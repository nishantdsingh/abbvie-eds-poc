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

  // tools/importer/import-linzess-utility.js
  var import_linzess_utility_exports = {};
  __export(import_linzess_utility_exports, {
    default: () => import_linzess_utility_default
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

  // tools/importer/transformers/linzess-utility-content.js
  function transform2(hookName, element, payload) {
    var _a;
    if (hookName !== "beforeTransform") return;
    const { document } = payload;
    element.querySelectorAll(".abbv-browser-chrome, .abbv-brand-explorer, .abbv-top-banner").forEach((el) => el.remove());
    element.querySelectorAll("p").forEach((p) => {
      if (p.querySelector('a[href*="savings-and-support"]') && p.querySelector('a[href^="tel:"]')) {
        p.remove();
      }
    });
    element.querySelectorAll('.abbv-inline-use-isi, .abbv-inline-use, .linzess-isi-iri, [class*="inline-use-isi"]').forEach((el) => el.remove());
    const sourceUrl = ((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url || "";
    if (/reminder-terms-conditions/i.test(sourceUrl)) {
      element.querySelectorAll("sup").forEach((sup) => {
        sup.replaceWith(document.createTextNode(sup.textContent));
      });
    }
  }

  // tools/importer/transformers/linzess-utility-isi.js
  function frag(doc, html) {
    const tpl = doc.createElement("div");
    tpl.innerHTML = html;
    const f = doc.createDocumentFragment();
    while (tpl.firstChild) f.appendChild(tpl.firstChild);
    return f;
  }
  var ISI_USES = '<h3>USES</h3><p>LINZESS<sup>\xAE</sup> (linaclotide) is a prescription medication used to treat irritable bowel syndrome with constipation (IBS-C) in adults and in children and adolescents 7 years of age and older, chronic idiopathic constipation (CIC) in adults, and functional constipation (FC) in children and adolescents 6 years of age and older. "Idiopathic" means the cause of the constipation is unknown. <strong>It is not known if LINZESS is safe and effective in children with functional constipation less than 6 years of age or in children with IBS-C less than 7 years of age.</strong></p>';
  var ISI_IRI_COLLAPSED = "<h3>IMPORTANT RISK INFORMATION</h3><ul><li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li><li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li></ul>";
  var ISI_FULL = ISI_USES + '<h3><strong>IMPORTANT RISK INFORMATION</strong></h3><ul><li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li><li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li></ul><p><strong>Before you take LINZESS, tell your doctor about your medical conditions, including if you are:</strong></p><ul><li>Pregnant or plan to become pregnant. It is not known if LINZESS will harm your unborn baby.</li><li>Breastfeeding or plan to breastfeed. You and your doctor should decide if you will take LINZESS and breastfeed.</li></ul><p><strong>Tell your doctor about all the medicines you take,</strong> including prescription and over-the-counter medicines, vitamins, and herbal supplements.</p><p><strong>Side Effects</strong></p><p><strong>LINZESS can cause serious side effects, including diarrhea, which is the most common side effect and can sometimes be severe.</strong> Diarrhea often begins within the first 2 weeks of LINZESS treatment. <strong>Stop taking LINZESS and call your doctor right away if you get severe diarrhea during treatment with LINZESS.</strong></p><p>Other common side effects of LINZESS in people with IBS-C and CIC include gas, stomach-area (abdomen) pain, and swelling, or a feeling of fullness or pressure in your abdomen (distention).</p><p><strong>Call your doctor or go to the nearest hospital emergency room right away if you develop unusual or severe stomach-area (abdomen) pain, especially if you also have bright red, bloody stools or black stools that look like tar.</strong></p><p>These are not all the possible side effects of LINZESS. For more information, ask your doctor or pharmacist.</p><p><strong>You are encouraged to report negative side effects of prescription drugs to the FDA. Visit <a href="https://www.fda.gov/medwatch">www.fda.gov/medwatch</a> or call <a href="tel:18003321088">1-800-FDA-1088</a>.</strong></p><p><strong>If you are having difficulty paying for your medicine, AbbVie and Ironwood may be able to help. Visit <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> to learn more.</strong></p><p><strong>Please see full</strong> <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf">Prescribing Information</a><strong>, including Boxed Warning, and</strong> <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf#page=26">Medication Guide</a>.</p><p>US-LIN-250121</p>';
  function transform3(hookName, element, payload) {
    var _a;
    if (hookName !== "afterTransform") return;
    const { document } = payload;
    const sourceUrl = ((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url || "";
    if (/reminder-terms-conditions/i.test(sourceUrl)) return;
    element.append(document.createElement("hr"));
    const isiBlock = WebImporter.Blocks.createBlock(document, {
      name: "text-container",
      cells: [
        ["isi"],
        ["-"],
        ["none"],
        ["-"],
        [frag(document, ISI_FULL)]
      ]
    });
    element.append(isiBlock);
    element.append(WebImporter.DOMUtils.createTable([
      ["Section Metadata"],
      ["style", "isi"]
    ], document));
    element.append(document.createElement("hr"));
    const sbBlock = WebImporter.Blocks.createBlock(document, {
      name: "safety-bar (split)",
      cells: [
        [frag(document, ISI_USES)],
        [frag(document, ISI_IRI_COLLAPSED)],
        [frag(document, ISI_FULL)],
        ["split"],
        ["id:"],
        ["lang:none"]
      ]
    });
    element.append(sbBlock);
    element.append(WebImporter.DOMUtils.createTable([
      ["Section Metadata"],
      ["classes_customClass", "safety-bar-source"]
    ], document));
    element.append(document.createElement("hr"));
  }

  // tools/importer/transformers/linzess-utility-metadata.js
  function transform4(hookName, element, payload) {
    var _a, _b, _c, _d;
    if (hookName !== "afterTransform") return;
    const { document } = payload;
    const title = (document.title || ((_a = document.querySelector("title")) == null ? void 0 : _a.textContent) || ((_b = element.querySelector("h1, h2, h3")) == null ? void 0 : _b.textContent) || "").trim();
    const description = (((_c = document.querySelector('meta[name="description"]')) == null ? void 0 : _c.getAttribute("content")) || "").trim();
    const sourceUrl = ((_d = payload.params) == null ? void 0 : _d.originalURL) || payload.url || "";
    const noChrome = /reminder-terms-conditions/i.test(sourceUrl);
    const cells = [
      ["Metadata"],
      ["brand", "linzess"],
      ...noChrome ? [["nav", "false"], ["footer", "false"]] : [["nav", "/linzess/nav"], ["footer", "/linzess/footer"]],
      ["title", title],
      ["description", description]
    ].filter((row) => row.length === 1 || row[1]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    element.append(table);
  }

  // tools/importer/import-linzess-utility.js
  var PAGE_TEMPLATE = {
    name: "linzess-utility",
    description: "Linzess utility pages (sitemap, SMS reminder terms, legal) \u2014 simple default-content documents",
    urls: [
      "https://www.linzess.com/sitemap",
      "https://www.linzess.com/reminder-terms-conditions"
    ],
    blocks: [],
    sections: []
  };
  var transformers = [
    transform2,
    // beforeTransform: isolate <main>, drop ISI
    transform,
    // beforeTransform: strip header/footer/cookie/scripts
    transform3,
    // afterTransform: append verbatim ISI + floating safety-bar
    transform4
    // afterTransform: append brand metadata block
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
  var import_linzess_utility_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const slug = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "").split("/").filter(Boolean).pop() || "index";
      const path = WebImporter.FileUtils.sanitizePath(`/linzess/utility/${slug}`);
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
  return __toCommonJS(import_linzess_utility_exports);
})();
