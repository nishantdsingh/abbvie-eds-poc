/* eslint-disable */
/* global WebImporter */

/**
 * Appends the verbatim English ISI (text-container) + floating safety-bar
 * (split) to Linzess utility pages that carry brand chrome (e.g. /sitemap).
 *
 * Regulated pharma content — copy is byte-for-byte identical to the live
 * LINZESS ISI as authored on /linzess/savings-card (job code US-LIN-250121).
 * Do NOT paraphrase. The text-container(isi) section + safety-bar(split)
 * section mirror the known-good savings-card structure so md2jcr round-trips
 * the block tables correctly.
 *
 * No-chrome standalone pages (reminder-terms-conditions) are skipped — they
 * render without header/footer and therefore without ISI.
 */

function frag(doc, html) {
  const tpl = doc.createElement('div');
  tpl.innerHTML = html;
  const f = doc.createDocumentFragment();
  while (tpl.firstChild) f.appendChild(tpl.firstChild);
  return f;
}

const ISI_USES = '<h3>USES</h3>'
  + '<p>LINZESS<sup>®</sup> (linaclotide) is a prescription medication used to treat irritable bowel syndrome with constipation (IBS-C) in adults and in children and adolescents 7 years of age and older, chronic idiopathic constipation (CIC) in adults, and functional constipation (FC) in children and adolescents 6 years of age and older. "Idiopathic" means the cause of the constipation is unknown. <strong>It is not known if LINZESS is safe and effective in children with functional constipation less than 6 years of age or in children with IBS-C less than 7 years of age.</strong></p>';

const ISI_IRI_COLLAPSED = '<h3>IMPORTANT RISK INFORMATION</h3>'
  + '<ul>'
  + '<li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li>'
  + '<li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li>'
  + '</ul>';

const ISI_FULL = ISI_USES
  + '<h3><strong>IMPORTANT RISK INFORMATION</strong></h3>'
  + '<ul>'
  + '<li><strong>Do not give LINZESS to children who are less than 2 years of age. It may harm them.</strong> LINZESS can cause severe diarrhea and your child could get severe dehydration (loss of a large amount of body water and salt).</li>'
  + '<li>Do not take LINZESS if a doctor has told you that you have a bowel blockage (intestinal obstruction).</li>'
  + '</ul>'
  + '<p><strong>Before you take LINZESS, tell your doctor about your medical conditions, including if you are:</strong></p>'
  + '<ul>'
  + '<li>Pregnant or plan to become pregnant. It is not known if LINZESS will harm your unborn baby.</li>'
  + '<li>Breastfeeding or plan to breastfeed. You and your doctor should decide if you will take LINZESS and breastfeed.</li>'
  + '</ul>'
  + '<p><strong>Tell your doctor about all the medicines you take,</strong> including prescription and over-the-counter medicines, vitamins, and herbal supplements.</p>'
  + '<p><strong>Side Effects</strong></p>'
  + '<p><strong>LINZESS can cause serious side effects, including diarrhea, which is the most common side effect and can sometimes be severe.</strong> Diarrhea often begins within the first 2 weeks of LINZESS treatment. <strong>Stop taking LINZESS and call your doctor right away if you get severe diarrhea during treatment with LINZESS.</strong></p>'
  + '<p>Other common side effects of LINZESS in people with IBS-C and CIC include gas, stomach-area (abdomen) pain, and swelling, or a feeling of fullness or pressure in your abdomen (distention).</p>'
  + '<p><strong>Call your doctor or go to the nearest hospital emergency room right away if you develop unusual or severe stomach-area (abdomen) pain, especially if you also have bright red, bloody stools or black stools that look like tar.</strong></p>'
  + '<p>These are not all the possible side effects of LINZESS. For more information, ask your doctor or pharmacist.</p>'
  + '<p><strong>You are encouraged to report negative side effects of prescription drugs to the FDA. Visit <a href="https://www.fda.gov/medwatch">www.fda.gov/medwatch</a> or call <a href="tel:18003321088">1-800-FDA-1088</a>.</strong></p>'
  + '<p><strong>If you are having difficulty paying for your medicine, AbbVie and Ironwood may be able to help. Visit <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> to learn more.</strong></p>'
  + '<p><strong>Please see full</strong> <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf">Prescribing Information</a><strong>, including Boxed Warning, and</strong> <a href="https://www.rxabbvie.com/pdf/linzess_pi.pdf#page=26">Medication Guide</a>.</p>'
  + '<p>US-LIN-250121</p>';

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const { document } = payload;

  // Only chrome-bearing utility pages get the ISI. Standalone no-chrome pages
  // (reminder-terms-conditions) render without header/footer and without ISI.
  const sourceUrl = payload.params?.originalURL || payload.url || '';
  if (/reminder-terms-conditions/i.test(sourceUrl)) return;

  // --- Inline ISI section (text-container: 4 parent rows + 1 item richtext) ---
  element.append(document.createElement('hr'));
  const isiBlock = WebImporter.Blocks.createBlock(document, {
    name: 'text-container',
    cells: [
      ['isi'],
      ['-'],
      ['none'],
      ['-'],
      [frag(document, ISI_FULL)],
    ],
  });
  element.append(isiBlock);
  element.append(WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', 'isi'],
  ], document));

  // --- Floating safety bar (split): collapsed col1 (USES), collapsed col2
  // (abbreviated IRI), expanded (full ISI). Mirrors savings-card safety-bar. ---
  element.append(document.createElement('hr'));
  const sbBlock = WebImporter.Blocks.createBlock(document, {
    name: 'safety-bar (split)',
    cells: [
      [frag(document, ISI_USES)],
      [frag(document, ISI_IRI_COLLAPSED)],
      [frag(document, ISI_FULL)],
      ['split'],
      ['id:'],
      ['lang:none'],
    ],
  });
  element.append(sbBlock);
  element.append(WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['classes_customClass', 'safety-bar-source'],
  ], document));
  // Trailing break so the page Metadata block lands in its own section rather
  // than being absorbed into the safety-bar section.
  element.append(document.createElement('hr'));
}
