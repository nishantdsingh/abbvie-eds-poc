/* eslint-disable */
/* global WebImporter */

/**
 * Deterministic import script for the two Linzess wellness-tips FODMAP articles.
 *
 * Rather than parsing the brittle live AbbVie DOM, this builds the target EDS
 * `main` element from verbatim-extracted content, mirroring the proven reference
 * page /linzess/healthy-routines/otc-and-prescription-treatments.
 *
 * Block palette reused from the reference page:
 *   hero (hero-container) · columns variants · safety-bar split · ISI default content · metadata
 *
 * Run via run-bulk-import.js → html2md → md2da → .plain.html
 */

const IMG_BASE = 'https://www.linzess.com';

// ---- verbatim shared ISI (copied from reference otc-and-prescription-treatments.plain.html) ----
const ISI_HTML = `
<h3>USES</h3>
<p>LINZESS&reg; (linaclotide) is a prescription medication used to treat irritable bowel syndrome with constipation (IBS-C) in adults and in children and adolescents 7 years of age and older, chronic idiopathic constipation (CIC) in adults, and functional constipation (FC) in children and adolescents 6 years of age and older. &ldquo;Idiopathic&rdquo; means the cause of the constipation is unknown. <strong>It is not known if LINZESS is safe and effective in children with functional constipation less than 6 years of age or in children with IBS-C less than 7 years of age.</strong></p>
<h3>IMPORTANT RISK INFORMATION</h3>
<ul>
 <li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li>
 <li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li>
</ul>
<h4>Before you take LINZESS, tell your doctor about your medical conditions, including if you are:</h4>
<ul>
 <li>Pregnant or plan to become pregnant. It is not known if LINZESS will harm your unborn baby.</li>
 <li>Breastfeeding or plan to breastfeed. You and your doctor should decide if you will take LINZESS and breastfeed.</li>
</ul>
<p><strong>Tell your doctor about all the medicines you take,</strong> including prescription and over-the-counter medicines, vitamins, and herbal supplements.</p>
<h5>Side Effects</h5>
<p><strong>LINZESS can cause serious side effects, including diarrhea, which is the most common side effect and can sometimes be severe.</strong> Diarrhea often begins within the first 2 weeks of LINZESS treatment. <strong>Stop taking LINZESS and call your doctor right away if you get severe diarrhea during treatment with LINZESS.</strong></p>
<p>Other common side effects of LINZESS in people with IBS-C and CIC include gas, stomach-area (abdomen) pain, and swelling, or a feeling of fullness or pressure in your abdomen (distention).</p>
<p><strong>Call your doctor or go to the nearest hospital emergency room right away if you develop unusual or severe stomach-area (abdomen) pain, especially if you also have bright red, bloody stools or black stools that look like tar.</strong></p>
<p>These are not all the possible side effects of LINZESS. For more information, ask your doctor or pharmacist.</p>
<p><strong>You are encouraged to report negative side effects of prescription drugs to the FDA. Visit <a href="https://www.fda.gov/medwatch">www.fda.gov/medwatch</a> or call <a href="tel:18003321088">1-800-FDA-1088</a>.</strong></p>
<p><strong>If you are having difficulty paying for your medicine, AbbVie and Ironwood may be able to help. Visit <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> to learn more.</strong></p>
<p><strong>Please see full <a href="/content/dam/abbvie-eds-poc/pdf/linzess_pi.pdf">Prescribing Information</a>, including Boxed Warning, and <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf#page=26">Medication Guide</a>.</strong></p>
<p>US-LIN-250121</p>`;

// safety-bar split: cell-1 (USES), cell-2 (IRI head), cell-3 (full ISI), then variant/id/lang rows
const SB_USES = `<h3>USES</h3>
<p>LINZESS&reg; (linaclotide) is a prescription medication used to treat irritable bowel syndrome with constipation (IBS-C) in adults and in children and adolescents 7 years of age and older, chronic idiopathic constipation (CIC) in adults, and functional constipation (FC) in children and adolescents 6 years of age and older. &ldquo;Idiopathic&rdquo; means the cause of the constipation is unknown. <strong>It is not known if LINZESS is safe and effective in children with functional constipation less than 6 years of age or in children with IBS-C less than 7 years of age.</strong></p>`;

const SB_IRI_HEAD = `<h3>IMPORTANT RISK INFORMATION</h3>
<ul>
 <li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li>
 <li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li>
</ul>
<h4>Before you take LINZESS, tell your doctor about your medical conditions, including if you are:</h4>`;

const SB_FULL = SB_USES + `
<h3>IMPORTANT RISK INFORMATION</h3>
<ul>
 <li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li>
 <li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li>
</ul>
<h4>Before you take LINZESS, tell your doctor about your medical conditions, including if you are:</h4>
<ul>
 <li>Pregnant or plan to become pregnant. It is not known if LINZESS will harm your unborn baby.</li>
 <li>Breastfeeding or plan to breastfeed. You and your doctor should decide if you will take LINZESS and breastfeed.</li>
</ul>
<p><strong>Tell your doctor about all the medicines you take,</strong> including prescription and over-the-counter medicines, vitamins, and herbal supplements.</p>
<h5>Side Effects</h5>
<p><strong>LINZESS can cause serious side effects, including diarrhea, which is the most common side effect and can sometimes be severe.</strong> Diarrhea often begins within the first 2 weeks of LINZESS treatment. <strong>Stop taking LINZESS and call your doctor right away if you get severe diarrhea during treatment with LINZESS.</strong></p>
<p>Other common side effects of LINZESS in people with IBS-C and CIC include gas, stomach-area (abdomen) pain, and swelling, or a feeling of fullness or pressure in your abdomen (distention).</p>
<p><strong>Call your doctor or go to the nearest hospital emergency room right away if you develop unusual or severe stomach-area (abdomen) pain, especially if you also have bright red, bloody stools or black stools that look like tar.</strong></p>
<p>These are not all the possible side effects of LINZESS. For more information, ask your doctor or pharmacist.</p>
<p><strong>You are encouraged to report negative side effects of prescription drugs to the FDA. Visit <a href="https://www.fda.gov/medwatch">www.fda.gov/medwatch</a> or call <a href="tel:18003321088">1-800-FDA-1088</a>.</strong></p>
<p><strong>If you are having difficulty paying for your medicine, AbbVie and Ironwood may be able to help. Visit <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> to learn more.</strong></p>
<p><strong>Please see full <a href="/content/dam/abbvie-eds-poc/pdf/linzess_pi.pdf">Prescribing Information</a>, including Boxed Warning, and <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf#page=26">Medication Guide</a>.</strong></p>
<p>US-LIN-250121</p>`;

// ---------------- DOM helpers ----------------
function el(document, html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  return wrap;
}

function nodes(document, html) {
  // returns array of child nodes parsed from html
  return [...el(document, html).childNodes];
}

function decodeEntities(document, str) {
  if (!str) return '';
  const ta = document.createElement('textarea');
  ta.innerHTML = str;
  return ta.value;
}

function img(document, src, alt) {
  const picture = document.createElement('picture');
  const im = document.createElement('img');
  // Project DAM assets stay host-relative so cards.js' optimized URLs resolve
  // locally and on delivery; live-site DAM assets get the linzess.com host.
  const isProjectDam = src.startsWith('/content/dam/abbvie-eds-poc');
  im.setAttribute('src', (src.startsWith('http') || isProjectDam) ? src : IMG_BASE + src);
  im.setAttribute('alt', decodeEntities(document, alt || ''));
  picture.appendChild(im);
  return picture;
}

// Build a section wrapper: appends content nodes + a Section Metadata block, then <hr>
function section(document, main, contentNodes, metaRows) {
  contentNodes.forEach((n) => main.appendChild(n));
  if (metaRows && metaRows.length) {
    const sm = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: metaRows,
    });
    main.appendChild(sm);
  }
  main.appendChild(document.createElement('hr'));
}

// Build a hero block (8 content rows) + hero-container section
function heroSection(document, main, { desktop, mobile, eyebrow, h1 }) {
  const cells = [
    [img(document, desktop, '')],
    [img(document, mobile, '')],
    [eyebrow],
    [''],
    nodes(document, h1),
    [''],
    [''],
    [''],
  ];
  const hero = WebImporter.Blocks.createBlock(document, {
    name: 'hero (no-padding, text-left, linzess-behind-nav-linzess-editorial-hero)',
    cells,
  });
  main.appendChild(hero);
  const sm = WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [['classes_customClass', 'hero-container']],
  });
  main.appendChild(sm);
  main.appendChild(document.createElement('hr'));
}

/**
 * Build a columns block. variant = class suffix (e.g. 'how-they-work').
 * items = array of cell-node-arrays (each becomes one column item row).
 * First body row is the anchorId/variant cell (matches reference).
 */
function columnsBlock(document, variant, items) {
  const cells = [[variant]];
  items.forEach((itemNodes) => cells.push([itemNodes]));
  return WebImporter.Blocks.createBlock(document, {
    name: `columns (${variant})`,
    cells,
  });
}

// ---------------- TEMPLATES ----------------
const TEMPLATES = {
  'recipes': {
    documentPath: '/linzess/starting-linzess/wellness-tips/5-holiday-low-fodmap-recipes',
    build(document, main) {
      // 1. HERO
      heroSection(document, main, {
        desktop: '/content/dam/linzess/images/5-Holiday_Recipes_Hero_Desktop.jpg',
        mobile: '/content/dam/linzess/images/5-Holiday_Recipes_Hero_Mobile.jpg',
        eyebrow: 'Resources / Wellness Tips',
        h1: '<h1 id="5-holiday-low-fodmap-recipes">5 Holiday Low FODMAP Recipes</h1>',
      });

      // 2. INTRO (otc-intro-section style) + recipe grid
      const introNodes = nodes(document, `<p class="heading-1">Low FODMAP, Big Taste</p>
<p>Enjoying a special holiday meal doesn&rsquo;t have to mean interrupting your routine&mdash;or the fun. These <a href="/linzess/starting-linzess/wellness-tips/your-map-to-a-low-fodmap-diet">Low FODMAP</a> recipes are soon-to-be favorites for you to share and enjoy.</p>`);
      // Recipe images migrated into the project DAM so cards.js' optimized
      // (host-stripped) /content/dam URLs resolve locally and on delivery.
      const RDAM = '/content/dam/abbvie-eds-poc/linzess/images';
      const recipes = [
        ['Prosciutto Wrapped Scallops with Spinach', `${RDAM}/4.2.1-d-5-holiday_low-fodmap-recipes-scallops@2x.jpg`, 'Win over foodie friends with this tempting appetizer fit for any occasion. Make plenty&mdash;they&rsquo;ll definitely want seconds.', '/content/dam/linzess/pdf/14-comfort-food-classics.pdf#page=3'],
        ['Moroccan-Style Stuffed Peppers', `${RDAM}/4.2.1-d-5-holiday_low-fodmap-recipes-stuffed-peppers@2x.jpg`, 'Invite folks over for a memorable meal that&rsquo;s sure to impress. Aromatic cumin, currants, and cinnamon make this dish both sweet and savory.', '/content/dam/linzess/pdf/10-fast-and-fresh-recipes.pdf#page=3'],
        ['Cheese &amp; Vegetable Rice Casserole', `${RDAM}/4.2.1-d-5-holiday_low-fodmap-recipes-rice-casserole@2x.jpg`, 'This vegetarian recipe is perfect for taking on the road, and its mouth-watering mix of roasted peppers, corn, and chiles is sure to be a crowd-pleaser.', '/content/dam/linzess/pdf/14-comfort-food-classics.pdf#page=5'],
        ['Maple-Roasted Sweet Potatoes', `${RDAM}/4.2.1-d-5-holiday_low-fodmap-recipes-sweet-potatoes@2x.jpg`, 'They say the sides make the meal. Roasting makes it easy, and the sweet and savory glaze makes it unforgettable.', '/content/dam/linzess/pdf/9-new-recipes-to-tempt-your-taste-buds.pdf#page=9'],
        ['Flourless Chocolate Cookies', `${RDAM}/4.2.1-d-5-holiday_low-fodmap-recipes-cookies@2x.jpg`, 'They may look sinful, but these sweet treats are made with gut-friendly goodness. They&rsquo;re sure to delight any holiday sweet tooth.', '/content/dam/linzess/pdf/desserts-recipes.pdf#page=5'],
      ];
      // cards-grid (cards-grid-recipe-cards): each grid-card = link / image /
      // line1=title / line2=description / line3=CTA. The linzess recipe-cards
      // decoration builds the live image-left rows.
      const recipeRows = recipes.map(([title, src, desc, href]) => [
        [''],
        [img(document, src, title)],
        [el(document, `<p>${title}</p>`).firstChild],
        [el(document, `<p>${desc}</p>`).firstChild],
        [el(document, `<p><a href="${href}">Get the recipe</a></p>`).firstChild],
      ]);
      const recipeGrid = WebImporter.Blocks.createBlock(document, {
        name: 'cards-grid (cards-grid-recipe-cards)',
        cells: recipeRows,
      });
      section(document, main, [...introNodes, recipeGrid], [['classes_customClass', 'otc-intro-section']]);

      // 3. MORE LIKE THIS
      moreLikeThis(document, main, [
        ['Good for Your Gut&mdash;Flavorful Food Swaps', '/content/dam/linzess/images/Article-FoodSwap-card.jpg', '/linzess/starting-linzess/wellness-tips/good-for-your-gut-flavorful-food-swaps'],
        ['Your Map to a Low FODMAP Diet', '/content/dam/linzess/images/article-thumb-fodmap.jpg', '/linzess/starting-linzess/wellness-tips/your-map-to-a-low-fodmap-diet'],
        ['Is Your Pantry FODMAP-Friendly?', '/content/dam/linzess/images/Article-Pantry-card.jpg', '/linzess/starting-linzess/wellness-tips/is-your-pantry-fodmap-friendly'],
      ]);

      // 4. CTA cards
      ctaCards(document, main);
      // 5. ISI + 6. safety-bar + 7. metadata
      isiSection(document, main);
      safetyBarSection(document, main, 'sb-fodmap-recipes');
      metadataSection(document, main, {
        title: '5 Low FODMAP Holiday Recipes | LINZESS&reg; (linaclotide)',
        description: 'Learn more about Low FODMAP recipes. See Important Risk Info and Boxed Warning.',
      });
    },
  },

  'pantry': {
    documentPath: '/linzess/starting-linzess/wellness-tips/is-your-pantry-fodmap-friendly',
    build(document, main) {
      // 1. HERO
      heroSection(document, main, {
        desktop: '/content/dam/linzess/images/article-fodmap-friendly-desktop.jpg',
        mobile: '/content/dam/linzess/images/article-fodmap-friendly-mobile.jpg',
        eyebrow: 'Resources / Wellness Tips',
        h1: '<h1 id="is-your-pantry-fodmap-friendly">Is Your Pantry FODMAP-Friendly?</h1>',
      });

      // 2. INTRO + 4-col grid (how-they-work style)
      const introNodes = nodes(document, `<p class="heading-1">Your Low FODMAP Shopping List</p>
<p>FODMAPs are carbohydrates that your small intestine doesn&rsquo;t absorb well. They can aggravate constipation and trigger those all-too-familiar symptoms: gas, bloating, and belly pain. A treatment plan and a healthy routine can help you manage your symptoms. And a little prep before hitting the grocery store can help you stock your pantry with Low FODMAP, gut-friendly choices to help keep you on track.</p>`);
      const foods = [
        ['Produce', '/content/dam/linzess/images/4.2.3-d-is-your-pantry-fodmap-friendly-produce@2x.png', 'Fruits and vegetables like bananas, blueberries, and broccoli.'],
        ['Protein', '/content/dam/linzess/images/4.2.3-d-is-your-pantry-fodmap-friendly-protein@2x.png', 'Meats and seafood like chicken, pork chops, and salmon.'],
        ['Grains', '/content/dam/linzess/images/4.2.3-d-is-your-pantry-fodmap-friendly-grains@2x.png', 'Wheat alternatives like brown rice, corn tortillas, and gluten-free pasta.'],
        ['Snacks', '/content/dam/linzess/images/4.2.3-d-is-your-pantry-fodmap-friendly-snacks@2x.png', 'Tasty treats like baked potato chips, corn chips, and gluten-free cookies.'],
      ];
      const foodItems = foods.map(([title, src, body]) => {
        const div = document.createElement('div');
        div.appendChild(img(document, src, title));
        div.appendChild(el(document, `<p><strong>${title}</strong></p>`).firstChild);
        div.appendChild(el(document, `<p>${body}</p>`).firstChild);
        return [...div.childNodes];
      });
      const foodGrid = columnsBlock(document, 'how-they-work', foodItems);
      section(document, main, [...introNodes, foodGrid], [['classes_customClass', 'otc-intro-section']]);

      // 3. PRO TIP (what-is-linzess 2-col style) + Sources
      const proTipHeading = nodes(document, `<p class="heading-1">Pro Tip: Read the Label</p>`);
      // 2-col: left = checklist text, right = nutrition image
      const checklistCol = document.createElement('div');
      checklistCol.innerHTML = `<p><strong>Here&rsquo;s a handy list of what to check for when you&rsquo;re looking over labels:</strong></p>
<p><strong>Common High FODMAP Ingredients</strong></p>
<p>FODMAPs hide in many unexpected foods. Avoid high fructose corn syrup, garlic, onion, and sweeteners ending in &ldquo;-ol.&rdquo;</p>
<p><strong>Ingredient Order</strong></p>
<p>The order of ingredients matters! FODMAPs that are listed higher up on the nutrition label are higher in quantity and may be harder to tolerate.</p>
<p><strong>Serving Sizes</strong></p>
<p>Keep in mind that serving sizes may not be the same as a Low FODMAP serving.</p>`;
      const imageCol = document.createElement('div');
      imageCol.appendChild(img(document, '/content/dam/linzess/images/4.2.3-d-is-your-pantry-fodmap-friendly-nutrition-facts@2x.png', 'Nutrition Facts label'));
      const proTip = columnsBlock(document, 'what-is-linzess', [[...imageCol.childNodes], [...checklistCol.childNodes]]);
      const sources = nodes(document, `<p class="footnote"><strong>Sources:</strong></p>
<ol class="footnote">
<li>&ldquo;High and low FODMAP foods.&rdquo; <em>Monash University</em>. Accessed March 2022. www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/</li>
<li>&ldquo;Food Labeling Guide.&rdquo; <em>Food and Drug Administration</em>. Accessed March 2022. https://www.fda.gov/files/food/published/Food-Labeling-Guide-%28PDF%29.pdf</li>
<li>Eswaran, Shanti. &ldquo;Low-FODMAP (Fermentable, Oligo-, Di-, Mono-saccharides and Polyols) Diet.&rdquo; <em>American College of Gastroenterology</em>. Accessed 29 Sept. 2025. https://gi.org/topics/low-fodmap-diet/#tabs2</li>
<li>&ldquo;Label reading - how to spot the FODMAPs.&rdquo; <em>Monash University</em>. Accessed March 2022. https://monashfodmap.com/blog/label-reading/</li>
</ol>`);
      section(document, main, [...proTipHeading, proTip, ...sources], [['classes_customClass', 'what-is-linzess-section']]);

      // 4. MORE LIKE THIS
      moreLikeThis(document, main, [
        ['Good for Your Gut&mdash;Flavorful Food Swaps', '/content/dam/linzess/images/Article-FoodSwap-card.jpg', '/linzess/starting-linzess/wellness-tips/good-for-your-gut-flavorful-food-swaps'],
        ['Your Map to a Low FODMAP Diet', '/content/dam/linzess/images/article-thumb-fodmap.jpg', '/linzess/starting-linzess/wellness-tips/your-map-to-a-low-fodmap-diet'],
        ['5 Holiday Low FODMAP Recipes', '/content/dam/linzess/images/article-thumb-holiday.jpg', '/linzess/starting-linzess/wellness-tips/5-holiday-low-fodmap-recipes'],
      ]);

      ctaCards(document, main);
      isiSection(document, main);
      safetyBarSection(document, main, 'sb-pantry-fodmap');
      metadataSection(document, main, {
        title: 'Is Your Pantry FODMAP-Friendly? | LINZESS&reg; (linaclotide)',
        description: 'Use this Low FODMAP shopping guide to help you identify and eliminate triggers and create a diet plan that works for you. See Important Risk Info and Boxed Warning.',
      });
    },
  },

  'game-plan': {
    documentPath: '/linzess/starting-linzess/wellness-tips/make-a-game-plan-for-ibs-c',
    build(document, main) {
      // 1. HERO (hero JPGs stay on the linzess.com host — proven to render from
      // the CDN on the recipes page).
      heroSection(document, main, {
        desktop: '/content/dam/linzess/images/article-wellness-gameplan-desktop.jpg',
        mobile: '/content/dam/linzess/images/article-wellness-gameplan-mobile.jpg',
        eyebrow: 'Resources / Wellness Tips',
        h1: '<h1 id="make-a-game-plan-for-ibs-c">Make a Game Plan for IBS-C</h1>',
      });

      // 2. INTRO (otc-intro-section) + 4 strategy rows (image-left / text-right)
      // reusing the cards-grid-recipe-cards variant. Strategy images migrated
      // into the project DAM so cards.js optimized URLs resolve locally.
      const introNodes = nodes(document, `<p class="heading-1">Your Game Plan Helps Put You in Control</p>
<p>Along with treatment, healthy diet and lifestyle habits can help with managing your symptoms. But when it&rsquo;s tough to stick to your routine, it doesn&rsquo;t hurt to be prepared. Consider these strategies so you can be confident and comfortable no matter what life throws your way.</p>`);
      const GDAM = '/content/dam/abbvie-eds-poc/linzess/images';
      const strategies = [
        ['Don&rsquo;t Miss a Meal', `${GDAM}/4.2.5-d-make-a-game-plan-for-ibsc-meal@2x.png`, 'There&rsquo;s no need to fret when it comes to eating out. Check out the menu ahead of time, keep an eye on portion control, and consider passing on rich and fried foods. Many restaurants now offer gluten-free and dairy-free options&mdash;opt for one of these and indulge without the worry. Bon App&eacute;tit!'],
        ['A Night on the Town', `${GDAM}/4.2.5-d-make-a-game-plan-for-ibsc-night_on_the_town@2x.png`, 'Hanging out with friends is a great way to blow off steam, and you don&rsquo;t have to miss out on the fun just because you have IBS-C. Yes, certain beverages can be triggers, but that&rsquo;s not to say they can&rsquo;t be enjoyed within reason. Swap sugary sodas for unsweetened cranberry juice, a Low FODMAP fave for cocktails (or mocktails!).'],
        ['Stay on Track When You&rsquo;re on the Go-Go-Go', `${GDAM}/4.2.5-d-make-a-game-plan-for-ibsc-stay-on-track@2x.png`, 'Running around town with a full day of errands can throw your schedule&mdash;and eating habits&mdash;out of whack. There&rsquo;s no need to go hungry. In fact, it&rsquo;s much better for your digestion to eat small meals regularly. Pack a gut-friendly snack pack and remember to take quick meal breaks. Forgot to pack your healthy snacks? Swap the burger for a grilled chicken wrap at your local fast-food joint if you&rsquo;re in a pinch.'],
        ['Manage Your Symptoms and Your Workload', `${GDAM}/4.2.5-d-make-a-game-plan-for-ibsc-workload@2x.png`, 'Staying on track while on the job shouldn&rsquo;t be a problem. Mid-morning slump? Keep in mind when heading to the coffee cart that caffeine can be a trigger. You might want to reconsider that second cup of coffee, or even better, swap it for green tea when you need a pick-me-up. And while you wait, deep breaths can be a great distraction, and a great de-stresser. Keep calm and work on.'],
      ];
      // grid-card cells: [link] / image / line1=title / line2=description /
      // line3=CTA (left EMPTY — strategy rows have no CTA; the linzess
      // decoration skips the empty cell).
      const strategyRows = strategies.map(([title, src, desc]) => [
        [''],
        [img(document, src, decodeEntities(document, title))],
        [el(document, `<p>${title}</p>`).firstChild],
        [el(document, `<p>${desc}</p>`).firstChild],
        [''],
      ]);
      const strategyGrid = WebImporter.Blocks.createBlock(document, {
        name: 'cards-grid (cards-grid-recipe-cards)',
        cells: strategyRows,
      });
      const sources = nodes(document, `<p class="footnote"><strong>Sources:</strong></p>
<ol class="footnote">
<li>Smith, Jennifer. &ldquo;IBS at Work: How to Manage &amp; Prevent IBS Attacks in the Workplace.&rdquo; <em>Matter</em>. 2 Dec. 2020. Accessed 3 Nov. 2021. www.mindsethealth.com/matter/ibs-at-work</li>
<li>&ldquo;A Diet for IBS With Constipation (IBS-C).&rdquo; <em>WebMD</em>. 9 Aug. 2025. Accessed 6 Oct. 2025. www.webmd.com/ibs/diet-solution-ibs</li>
<li>Wilson, D&eacute;d&eacute;. &ldquo;Strategies for Dining Out with IBS.&rdquo; <em>FODMAP Everyday</em>. 8 Nov. 2024. Accessed 30 Sept. 2025. https://www.fodmapeveryday.com/strategies-for-dining-out-with-ibs/</li>
</ol>`);
      section(document, main, [...introNodes, strategyGrid, ...sources], [['classes_customClass', 'otc-intro-section']]);

      // 3. MORE LIKE THIS
      moreLikeThis(document, main, [
        ['Tackling IBS-C Triggers', '/content/dam/linzess/images/Article-TacklingIBS-card.jpg', '/linzess/starting-linzess/healthy-routines/tackling-ibs-c-triggers'],
        ['Keeping in Touch with Your Doctor', '/content/dam/linzess/images/Article-KeepInTouch-card.jpg', '/linzess/starting-linzess/healthy-routines/keeping-in-touch-with-your-doctor'],
        ['Good for Your Gut&mdash;Flavorful Food Swaps', '/content/dam/linzess/images/Article-FoodSwap-card.jpg', '/linzess/starting-linzess/wellness-tips/good-for-your-gut-flavorful-food-swaps'],
      ]);

      ctaCards(document, main);
      isiSection(document, main);
      safetyBarSection(document, main, 'sb-game-plan');
      metadataSection(document, main, {
        title: 'Make a Game Plan for IBS-C | LINZESS&reg; (linaclotide)',
        description: 'Build a game plan for managing IBS-C with simple strategies for dining out, socializing, running errands, and staying on track at work. See Important Risk Info and Boxed Warning.',
      });
    },
  },

  'food-swaps': {
    documentPath: '/linzess/starting-linzess/wellness-tips/good-for-your-gut-flavorful-food-swaps',
    build(document, main) {
      // 1. HERO (hero JPGs stay on the linzess.com host).
      heroSection(document, main, {
        desktop: '/content/dam/linzess/images/article-wellness-goodgut-desktop.jpg',
        mobile: '/content/dam/linzess/images/article-wellness-goodgut-mobile.jpg',
        eyebrow: 'Resources / Wellness Tips',
        h1: '<h1 id="good-for-your-gut-flavorful-food-swaps">Good for Your Gut&mdash;Flavorful Food Swaps</h1>',
      });

      // 2. INTRO (white otc-intro-section) — intro paragraph only, no heading.
      const introNodes = nodes(document, `<p>The taste buds want what the taste buds want, but it&rsquo;s possible to find foods that are both smart and satisfying. Check out these appetizing alternatives to some possible trigger foods you should avoid.</p>`);
      section(document, main, introNodes, [['classes_customClass', 'otc-intro-section, food-swaps-intro']]);

      // 3. FOOD SWAPS comparison — two light-purple panels ("Try These:" /
      // "When Craving These:"), each a header + 5 image-cards (circular food
      // illustration + label below). The live colored callout badges (teal on
      // the left, dark-purple on the right) are baked into the *-callout PNGs,
      // so no CSS overlay is needed; the callout wording is preserved in alt
      // text for accessibility. md2jcr strips non-semantic classes, so the
      // header is an <h3> and each card is a <picture> + <p> — both survive
      // publish and are styled structurally by the food-swaps CSS.
      const FSDAM = '/content/dam/abbvie-eds-poc/linzess/images';
      const FSP = '4.2.2-d-good-for-your-gut-flavorful-food-swaps';
      // [imageBaseName, label, callout (for alt only; '' = none)]
      const tryFoods = [
        ['yogurt-callout', 'Almond milk, yogurt, brie, or camembert', 'Yogurt contains good bacteria your gut loves.'],
        ['kiwi-callout', 'Bananas, berries, citrus fruits, or kiwi', 'Kiwi acts as a natural laxative.'],
        ['maple-syrup', 'Treats made with molasses or maple syrup', ''],
        ['popcorn', 'Baked chips, rice cakes, or popcorn', ''],
        ['rice_bowl_callout', 'Whole-grain bread, oats, brown rice, or quinoa', 'Brown rice provides 4 grams of fiber per cup.'],
      ];
      const craveFoods = [
        ['milk', 'Milk, cream cheese, or sour cream', ''],
        ['apple', 'Apples, pears, watermelon, or dried fruit', ''],
        ['honey-callout', 'Treats made with honey or artificial sweeteners that end in &ldquo;-ol&rdquo;', 'Honey is high in fructose, which can cause flare-ups.'],
        ['chips-callout', 'Potato chips or fried foods', 'Fatty foods slow digestion and can bring on the bloat.'],
        ['white-bread', 'Pasta, crackers, white rice and white wheat, or rye bread', ''],
      ];
      const foodColumn = (header, foods) => {
        const col = document.createElement('div');
        col.appendChild(el(document, `<h3>${header}</h3>`).firstChild);
        foods.forEach(([base, label, callout]) => {
          const altText = callout ? `${label}. ${callout}` : label;
          const picture = img(document, `${FSDAM}/${FSP}-${base}@2x.png`, altText);
          if (callout) {
            // Live overlays the bubble copy (white, centered) on the colored
            // circle baked into the -callout PNG. Keep the text in the same
            // paragraph as the picture so that <p> is the positioning context;
            // <em> survives md2jcr and is styled/positioned by the food-swaps CSS.
            const p = document.createElement('p');
            p.appendChild(picture);
            p.appendChild(el(document, `<em>${callout}</em>`).firstChild);
            col.appendChild(p);
          } else {
            col.appendChild(picture);
          }
          col.appendChild(el(document, `<p>${label}</p>`).firstChild);
        });
        return [...col.childNodes];
      };
      const swapBlock = columnsBlock(document, 'food-swaps', [foodColumn('Try These:', tryFoods), foodColumn('When Craving These:', craveFoods)]);
      section(document, main, [swapBlock], [['classes_customClass', 'otc-intro-section, food-swaps-section']]);

      // 4. SOME COMMON GUT-FRIENDLY DIETS — light-purple band (dedicated
      // gut-diets-section class), heading + intro + 4 icon cards (icon + body,
      // no visible title) reusing the how-they-work columns variant, then
      // Sources footnote.
      const GDDAM = '/content/dam/abbvie-eds-poc/linzess/images';
      const dietHeading = nodes(document, `<p class="heading-1">Some Common Gut-Friendly Diets</p>
<p>Your meal plan should be about finding what works best for your needs, lifestyle&mdash;and taste. Always <a href="/linzess/find-relief#talktoadoctor">seek your doctor&rsquo;s advice</a> to determine which diet is best for you. Along with a treatment plan, there are a few IBS-C and CIC-friendly diets you might want to consider:</p>`);
      const diets = [
        ['Low FODMAP diet', `${GDDAM}/4.2.2-d-good-for-your-gut-flavorful-food-swaps-low-fodmap-diet@2x.png`, 'High FODMAP foods are difficult for your body to digest and often lead to flare-ups.'],
        ['Gluten-free diet', `${GDDAM}/4.2.2-d-good-for-your-gut-flavorful-food-swaps-gluten-free-diet@2x.png`, 'Cut out barley, rye, and wheat and look for a &ldquo;Certified Gluten-Free&rdquo; label.'],
        ['High fiber diet', `${GDDAM}/4.2.2-d-good-for-your-gut-flavorful-food-swaps-high-fiber-diet@2x.png`, 'Fiber helps move things along. It&rsquo;s best to eat 22&ndash;34 grams each day. (Most of us eat only 16!)'],
        ['Low fat diet', `${GDDAM}/4.2.2-d-good-for-your-gut-flavorful-food-swaps-low-fat-diet@2x.png`, 'High fat foods are usually low in fiber. Swap fatty foods for lean meats, fruits, and veggies.'],
      ];
      const dietItems = diets.map(([alt, src, body]) => {
        const div = document.createElement('div');
        div.appendChild(img(document, src, alt));
        div.appendChild(el(document, `<p>${body}</p>`).firstChild);
        return [...div.childNodes];
      });
      const dietGrid = columnsBlock(document, 'how-they-work', dietItems);
      const sources = nodes(document, `<p class="footnote"><strong>Sources:</strong></p>
<ol class="footnote">
<li>&ldquo;A Diet for IBS With Constipation (IBS-C).&rdquo; <em>WebMD</em>. 9 Aug. 2025. Accessed 6 Oct. 2025. https://www.webmd.com/ibs/diet-solution-ibs</li>
<li>&ldquo;FODMAPs and Irritable Bowel Syndrome.&rdquo; <em>Monash University</em>. Accessed 7 March 2022. www.monashfodmap.com/about-fodmap-and-ibs</li>
<li>Cherney, Kristeen and Klein, Erika. &ldquo;Types of Diets and Tips on What to Eat with IBS.&rdquo; <em>Healthline</em>. 30 June 2025. Accessed 7 Oct. 2025. https://www.healthline.com/health/ibs/ibs-diet</li>
<li>&ldquo;Try A FODMAPs Diet To Manage Irritable Bowel Syndrome.&rdquo; <em>Harvard Health Publishing</em>. Accessed 7 Oct. 2025. https://www.health.harvard.edu/diseases-and-conditions/a-new-diet-to-manage-irritable-bowel-syndrome</li>
</ol>`);
      section(document, main, [...dietHeading, dietGrid, ...sources], [['classes_customClass', 'otc-intro-section, gut-diets-section']]);

      // 5. MORE LIKE THIS
      moreLikeThis(document, main, [
        ['Your Map to a Low FODMAP Diet', '/content/dam/linzess/images/article-thumb-fodmap.jpg', '/linzess/starting-linzess/wellness-tips/your-map-to-a-low-fodmap-diet'],
        ['Is Your Pantry FODMAP-Friendly?', '/content/dam/linzess/images/Article-Pantry-card.jpg', '/linzess/starting-linzess/wellness-tips/is-your-pantry-fodmap-friendly'],
        ['5 Holiday Low FODMAP Recipes', '/content/dam/linzess/images/article-thumb-holiday.jpg', '/linzess/starting-linzess/wellness-tips/5-holiday-low-fodmap-recipes'],
      ]);

      ctaCards(document, main);
      isiSection(document, main);
      safetyBarSection(document, main, 'sb-food-swaps');
      metadataSection(document, main, {
        title: 'Helpful Foods for Constipation | LINZESS&reg; (linaclotide)',
        description: 'Discover flavorful food swaps and gut-friendly diets to help manage IBS-C and CIC symptoms. See Important Risk Info and Boxed Warning.',
      });
    },
  },

  'low-fodmap-diet': {
    documentPath: '/linzess/starting-linzess/wellness-tips/your-map-to-a-low-fodmap-diet',
    build(document, main) {
      // 1. HERO (hero JPGs stay on the linzess.com host).
      heroSection(document, main, {
        desktop: '/content/dam/linzess/images/Low_Food_diet_Desktop.jpg',
        mobile: '/content/dam/linzess/images/Low_Food_Diet_Mobile.jpg',
        eyebrow: 'Resources / Wellness Tips',
        h1: '<h1 id="your-map-to-a-low-fodmap-diet">Your Map to a Low FODMAP Diet</h1>',
      });

      // 2. BREAKING DOWN FODMAP (white otc-intro-section) — intro + 4 FODMAP
      // category icon cards (icon + title + body) via the how-they-work variant.
      const introNodes = nodes(document, `<p class="heading-1">Breaking Down &ldquo;FODMAP&rdquo;</p>
<p>In addition to a treatment plan, a Low FODMAP diet can help you manage constipation and the unwanted symptoms that go along with it: gas, bloating, and belly pain. Eating fewer FODMAPs can go a long way in improving your gut health. But what exactly are FODMAPs?</p>
<p>FODMAP stands for &ldquo;Fermentable Oligosaccharides Disaccharides Monosaccharides and Polyols.&rdquo; Don&rsquo;t worry&mdash;there won&rsquo;t be a quiz! Simply put, FODMAPs are carbs that your small intestine doesn&rsquo;t absorb well&mdash;so do your best to avoid them whenever possible. Here&rsquo;s a look at the FODMAPs:</p>`);
      const LFDAM = '/content/dam/abbvie-eds-poc/linzess/images';
      const LFP = '4.2.4-d-your-map-to-a-low-fodmap-diet';
      const categories = [
        ['Oligosaccharides', `${LFDAM}/${LFP}-oligosaccharides@2x.png`, 'Wheat, rye, legumes, and fruits and veggies such as garlic and onions.'],
        ['Disaccharides', `${LFDAM}/${LFP}-disaccharides@2x.png`, 'Milk, yogurt, and soft cheese&mdash;lactose is the main carb here.'],
        ['Monosaccharides', `${LFDAM}/${LFP}-monosaccharides@2x.png`, 'Fruits like apples and pears and sweeteners that are chock-full of fructose.'],
        ['Polyols', `${LFDAM}/${LFP}-polyols@2x.png`, 'Fruits like peaches and blackberries and low-cal sweeteners that end in &ldquo;-ol.&rdquo;'],
      ];
      const categoryItems = categories.map(([title, src, body]) => {
        const div = document.createElement('div');
        div.appendChild(img(document, src, title));
        div.appendChild(el(document, `<p><strong>${title}</strong></p>`).firstChild);
        div.appendChild(el(document, `<p>${body}</p>`).firstChild);
        return [...div.childNodes];
      });
      const categoryGrid = columnsBlock(document, 'how-they-work', categoryItems);
      section(document, main, [...introNodes, categoryGrid], [['classes_customClass', 'otc-intro-section, fodmap-categories-section']]);

      // 3. MAPPING OUT A LOW FODMAP DIET (periwinkle band) — heading + a 2-col
      // image-text: the vertical "map" infographic image (left) + 6 numbered
      // steps (right). Authored via an additive fodmap-map columns variant.
      // Steps use <strong> titles (survive md2jcr) so the CSS can style them.
      const mapHeading = nodes(document, `<p class="heading-1">Mapping Out a Low FODMAP Diet</p>`);
      const mapImageCol = document.createElement('div');
      mapImageCol.appendChild(img(document, `${LFDAM}/4.2.4-d-your-map-to-a-low-fodmap-diet-map-infographic-no-bkg@2x.png`, 'Low FODMAP diet map infographic'));
      const steps = [
        ['The FODMAP Swap', 'Replace High FODMAPs with Low FODMAPs for 2&ndash;6 weeks. This part&rsquo;s only temporary.'],
        ['Read the Labels', 'Look for unexpected FODMAPs hidden in the ingredients of certain foods.'],
        ['Know Your Portions', 'Low FODMAPs in higher quantities can still trigger symptoms.'],
        ['Be Prepared', 'Pack Low FODMAP options when on-the-go to avoid spontaneous snacking.'],
        ['Be Patient', 'Slowly reintroduce High FODMAP foods and take note of any change in symptoms.'],
        ['Identify Your Triggers', 'Most people find that only 1 or 2 foods were the culprits. Cut those long-term to keep symptoms in check.'],
      ];
      const mapStepsCol = document.createElement('div');
      // One <p> per step (title <strong> + <br> + body), mirroring the live DOM
      // so the 6 steps can be overlaid as 6 elements on the full-width map image.
      steps.forEach(([title, body]) => {
        mapStepsCol.appendChild(el(document, `<p><strong>${title}</strong><br>${body}</p>`).firstChild);
      });
      const mapBlock = columnsBlock(document, 'fodmap-map', [[...mapImageCol.childNodes], [...mapStepsCol.childNodes]]);
      const sources = nodes(document, `<p class="footnote"><strong>Sources:</strong></p>
<ol class="footnote">
<li>&ldquo;FODMAPs and Irritable Bowel Syndrome.&rdquo; <em>Monash University</em>. Accessed 3 Nov. 2021. www.monashfodmap.com/about-fodmap-and-ibs/</li>
<li>&ldquo;Starting the Low FODMAP Diet.&rdquo; <em>Monash University</em>. Accessed 29 Sept. 2025. https://www.monashfodmap.com/ibs-central/i-have-ibs/starting-the-low-fodmap-diet/</li>
<li>Eswaran, Shanti. &ldquo;Low-FODMAP (Fermentable, Oligo-, Di-, Mono-saccharides and Polyols) Diet.&rdquo; <em>American College of Gastroenterology</em>. Accessed 29 Sept. 2025. https://gi.org/topics/low-fodmap-diet/</li>
</ol>`);
      section(document, main, [...mapHeading, mapBlock, ...sources], [['classes_customClass', 'otc-intro-section, fodmap-map-section']]);

      // 4. MORE LIKE THIS
      moreLikeThis(document, main, [
        ['Is Your Pantry FODMAP-Friendly?', '/content/dam/linzess/images/Article-Pantry-card.jpg', '/linzess/starting-linzess/wellness-tips/is-your-pantry-fodmap-friendly'],
        ['Good for Your Gut&mdash;Flavorful Food Swaps', '/content/dam/linzess/images/Article-FoodSwap-card.jpg', '/linzess/starting-linzess/wellness-tips/good-for-your-gut-flavorful-food-swaps'],
        ['Tackling IBS-C Triggers', '/content/dam/linzess/images/Article-TacklingIBS-card.jpg', '/linzess/starting-linzess/healthy-routines/tackling-ibs-c-triggers'],
      ]);

      ctaCards(document, main);
      isiSection(document, main);
      safetyBarSection(document, main, 'sb-low-fodmap-diet');
      metadataSection(document, main, {
        title: 'Your Map to a Low FODMAP Diet | LINZESS&reg; (linaclotide)',
        description: 'Make the most of a Low FODMAP diet by learning what it means, what to expect, and how to enjoy your snacks and meals while you&rsquo;re eating Low FODMAP. See Important Risk Info and Boxed Warning.',
      });
    },
  },
};

// ---- shared section builders ----
function moreLikeThis(document, main, cards) {
  const heading = nodes(document, `<h2 id="more-like-this">More Like This</h2>`);
  const items = cards.map(([title, src, href]) => {
    const div = document.createElement('div');
    div.appendChild(img(document, src, title));
    div.appendChild(el(document, `<p>${title}</p>`).firstChild);
    div.appendChild(el(document, `<p><a href="${href}">Read the article</a></p>`).firstChild);
    return [...div.childNodes];
  });
  const block = columnsBlock(document, 'more-like-this', items);
  section(document, main, [...heading, block], [['classes_customClass', 'more-like-this-section']]);
}

function ctaCards(document, main) {
  const items = [
    ['Check My Symptoms', '/linzess/find-relief/gutcheck'],
    ['Savings &amp; Support', '/linzess/savings-and-support'],
  ].map(([label, href]) => {
    const div = document.createElement('div');
    div.appendChild(el(document, `<p>${label}</p>`).firstChild);
    div.appendChild(el(document, `<p><a href="${href}">Learn More</a></p>`).firstChild);
    return [...div.childNodes];
  });
  const block = columnsBlock(document, 'cta-cards', items);
  section(document, main, [block], [['classes_customClass', 'cta-cards-section']]);
}

function isiSection(document, main) {
  const isi = nodes(document, ISI_HTML);
  section(document, main, isi, [['classes_customClass', 'isi'], ['language', 'none']]);
}

function safetyBarSection(document, main, blockId) {
  const cells = [
    [nodes(document, SB_USES)],
    [nodes(document, SB_IRI_HEAD)],
    [nodes(document, SB_FULL)],
    ['split'],
    [`id:${blockId || ''}`],
    [''],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'safety-bar (split)', cells });
  main.appendChild(block);
  main.appendChild(document.createElement('hr'));
}

function metadataSection(document, main, { title, description }) {
  const cells = [
    ['brand', 'linzess'],
    ['nav', '/linzess/nav'],
    ['footer', '/linzess/footer'],
    ['title', title],
    ['description', description],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'metadata', cells });
  main.appendChild(block);
}

function resolveTemplate(url) {
  if (url.includes('pantry')) return TEMPLATES.pantry;
  if (url.includes('make-a-game-plan')) return TEMPLATES['game-plan'];
  if (url.includes('good-for-your-gut')) return TEMPLATES['food-swaps'];
  if (url.includes('your-map-to-a-low-fodmap')) return TEMPLATES['low-fodmap-diet'];
  return TEMPLATES.recipes;
}

export default {
  transform: ({ document, url }) => {
    const template = resolveTemplate(url);
    const main = document.createElement('div');
    template.build(document, main);
    // strip the trailing <hr> if present (metadata is last)
    return [{
      element: main,
      path: template.documentPath,
      report: { template: template.documentPath },
    }];
  },
};
