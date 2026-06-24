/* eslint-disable */
/* global WebImporter */

/**
 * ES LINZESS homepage import (https://es.linzess.com/) → /linzess/utility/es-home.
 *
 * Regulated pharma marketing page. All Spanish copy is VERBATIM from
 * migration-work/verbatim-copy.json. The page is built deterministically
 * (ignores the live DOM) so block tables have exact md2jcr-safe structures.
 *
 * Blocks are emitted with WebImporter.Blocks.createBlock and sections with
 * WebImporter.DOMUtils.createTable('Section Metadata', ...) so html2md → md2da
 * round-trips them back into real block/section divs (a plain <div><div> tree
 * flattens to paragraphs instead).
 *
 * Block decisions:
 *   - hero, cards-grid, columns, accordion, text-container → real blocks
 *   - stat band, testimonial, savings badge, CTAs → styled default content
 */

const IMG = 'https://es.linzess.com/content/dam/linzess/images';
const ASSETS = {
  hero: `${IMG}/homeherobanner-dt.png`,
  symptomConstipation: `${IMG}/espanol/homepage/hat-is-ibsc-constipation-icon-v2_r0_desktop.svg`,
  symptomFewer: `${IMG}/espanol/homepage/what-is-ibsc-fewer-than-icon_r0_desktop.png`,
  symptomIncomplete: `${IMG}/espanol/homepage/what-is-ibsc-incomplete-bowel-movements-icon-v2_r0_desktop.svg`,
  symptomPain: `${IMG}/espanol/homepage/what-is-ibsc-bellypain-icon_r0_desktop.png`,
  symptomDiscomfort: `${IMG}/espanol/homepage/what-is-ibsc-discomfort-icon_r0_desktop.png`,
  symptomBloating: `${IMG}/espanol/homepage/what-is-ibsc-bloating-icon_r0_desktop.png`,
  chronic: `${IMG}/espanol/homepage/congregation_r0_desktop.png`,
  dian: `${IMG}/espanol/homepage/dian_r0_desktop.png`,
  savingsBadge: `${IMG}/espanol/homepage/90-days-for-30-es_r0_desktop.png`,
};

// ---- helpers -------------------------------------------------------------

function frag(doc, html) {
  const tpl = doc.createElement('div');
  tpl.innerHTML = html;
  const f = doc.createDocumentFragment();
  while (tpl.firstChild) f.appendChild(tpl.firstChild);
  return f;
}

function picture(doc, src, alt) {
  const p = doc.createElement('picture');
  const i = doc.createElement('img');
  i.setAttribute('src', src);
  i.setAttribute('alt', alt || '');
  p.append(i);
  return p;
}

function appendBlock(doc, container, name, cells) {
  const block = WebImporter.Blocks.createBlock(doc, { name, cells });
  container.append(block);
}

function appendDefault(doc, container, html) {
  container.append(frag(doc, html));
}

function appendSectionBreak(doc, container, styleValue) {
  if (styleValue) {
    const meta = WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', styleValue],
    ], doc);
    container.append(meta);
  }
  container.append(doc.createElement('hr'));
}

// ---- build ---------------------------------------------------------------

function build(doc) {
  const main = doc.createElement('div');

  // --- Section 1: hero (8 FieldGroups) ---
  appendBlock(doc, main, 'hero (light-font)', [
    [picture(doc, ASSETS.hero, 'Mujer sonriente — banner del tratamiento LINZESS')], // image
    [''], // mobileImage
    ['Para adultos con Síndrome de Intestino Irritable con Estreñimiento (IBS-C) o Estreñimiento Idiopático Crónico (CIC).'], // eyebrow
    [frag(doc, '<p>(IBS-C y CIC respectivamente, por sus siglas en inglés.)</p>')], // indication
    [frag(doc, '<h1>¿ESTREÑIMIENTO CON DOLOR ABDOMINAL CONSTANTE?</h1><p>Podría ser el Síndrome de Intestino Irritable con Estreñimiento o Estreñimiento Idiopático Crónico, condiciones médicas que pueden requerir tratamiento.</p>')], // text
    [''], // layers
    [''], // video
    [''], // imageCaption
  ]);
  appendSectionBreak(doc, main, 'hero');

  // --- Section 2: intro + CTA (default content) ---
  appendDefault(doc, main,
    '<h2>ESTE PODRÍA SER EL MOMENTO PARA HABLAR CON TU MÉDICO.</h2>'
    + '<p>LINZESS puede ayudar a tener evacuaciones intestinales más frecuentes y completas, y a aliviar el dolor abdominal y síntomas abdominales generales* (dolor, malestar e inflamación) asociados con IBS‑C.</p>'
    + '<p><em>*Los síntomas abdominales se estudiaron en combinación, no individualmente.</em></p>'
    + '<p class="button-container"><a href="/porquelinzess" class="button">CÓMO PUEDE AYUDAR LINZESS</a></p>');
  appendSectionBreak(doc, main, 'white, es-center');

  // --- Section 3: symptoms grid (cards-grid, 6 items × 6 cells) ---
  appendDefault(doc, main, '<h2>¿TIENES ESTOS SÍNTOMAS?</h2>');
  const symptoms = [
    [ASSETS.symptomConstipation, 'Ícono de estreñimiento', 'Estreñimiento'],
    [ASSETS.symptomFewer, 'Ícono de menos de 3 evacuaciones intestinales por semana', 'Menos de 3 evacuaciones intestinales por semana'],
    [ASSETS.symptomIncomplete, 'Ícono de evacuaciones intestinales incompletas', 'Evacuaciones intestinales incompletas'],
    [ASSETS.symptomPain, 'Ícono de dolor abdominal (del vientre)', 'Dolor abdominal (del vientre)'],
    [ASSETS.symptomDiscomfort, 'Ícono de malestar abdominal', 'Malestar abdominal'],
    [ASSETS.symptomBloating, 'Ícono de inflamación o hinchazón', 'Inflamación o hinchazón'],
  ];
  appendBlock(doc, main, 'cards-grid',
    symptoms.map(([src, alt, caption]) => ['', picture(doc, src, alt), caption, '', '', '']));
  appendDefault(doc, main,
    '<p>Experimentar estos síntomas constantemente NO ES NORMAL ya que podrían indicar que padeces Síndrome de Intestino Irritable con Estreñimiento (IBS-C).</p>'
    + '<p class="button-container"><a href="/spanishgutcheck" class="button">REVISAR MIS SÍNTOMAS</a></p>');
  appendSectionBreak(doc, main, 'white, es-center, es-symptoms');

  // --- Section 4: chronic explainer (default content + image) ---
  appendDefault(doc, main, '<h2>¿SABÍAS QUE EL SÍNDROME DE INTESTINO IRRITABLE CON ESTREÑIMIENTO (IBS-C) ES UNA CONDICIÓN CRÓNICA?</h2>'
    + '<p>Quizás muchas personas no consideren el estreñimiento con dolor abdominal como una condición crónica, sino como algo normal o temporal. Pero los síntomas que reaparecen o parecen durar mucho tiempo pueden ser señales de una CONDICIÓN REAL que requiere atención y tratamiento médico.</p>');
  const chronicP = doc.createElement('p');
  chronicP.append(picture(doc, ASSETS.chronic, 'Ilustración de personas afectadas por IBS-C y CIC'));
  main.append(chronicP);
  appendDefault(doc, main, '<p>Probablemente ya has probado laxantes de venta libre, fibra, remedios caseros, beber más agua, hacer ejercicio y consejos de tu familia. Quizá sea momento de hablar con tu médico.</p>');
  appendSectionBreak(doc, main, 'white, es-center');

  // --- Section 5: comparison (stat default content + columns block) ---
  appendDefault(doc, main,
    '<h2 class="es-stat">~40 MILLONES DE PERSONAS EN LOS EE. UU.</h2>'
    + '<p class="es-stat-sub">AUNQUE LOS ESTIMADOS VARÍAN, EL IBS-C Y EL CIC AFECTAN A MUCHOS</p>');
  // columns block: row 0 = anchorId (consumed/removed by columns.js when non-empty),
  // then ONE row per column. Give it a real anchor so the empty row is removed.
  appendBlock(doc, main, 'columns', [
    ['es-comparison-cols'],
    [frag(doc, '<h3>SÍNTOMAS DEL IBS-C</h3>'
      + '<p><strong>ESTREÑIMIENTO</strong></p>'
      + '<ul><li>Heces fecales duras o grumosas</li><li>Evacuaciones Intestinales incompletas</li><li>Menos de 3 evacuaciones por semana</li></ul>'
      + '<p><strong>SÍNTOMAS ABDOMINALES</strong></p>'
      + '<ul><li>Dolor abdominal (del vientre)</li><li>Molestia</li><li>Inflamación o hinchazón</li></ul>'
      + '<p>Los pacientes con IBS-C suelen experimentar estreñimiento con síntomas abdominales (del vientre).</p>')],
    [frag(doc, '<h3>SÍNTOMAS DEL CIC</h3>'
      + '<p>Estreñimiento Idiopático Crónico (“idiopático” significa que se desconoce la causa)</p>'
      + '<p><strong>ESTREÑIMIENTO</strong></p>'
      + '<ul><li>Heces fecales duras o grumosas</li><li>Evacuaciones intestinales incompletas</li><li>Menos de 3 evacuaciones por semana</li></ul>')],
  ]);
  appendSectionBreak(doc, main, 'blue, es-center, es-comparison');

  // --- Section 6: testimonial (default content) ---
  const tWrap = doc.createElement('div');
  tWrap.append(picture(doc, ASSETS.dian, 'Dian, paciente real tratada con LINZESS'));
  tWrap.append(frag(doc, '<p class="es-quote">“No estás solo y no tienes que sufrir solo.”</p>'
    + '<p><strong>Dian, 43</strong></p>'
    + '<p>Le recetaron LINZESS para el estreñimiento idiopático crónico (CIC)</p>'));
  main.append(tWrap);
  appendSectionBreak(doc, main, 'white, es-center, es-testimonial');

  // --- Section 7: savings CTA (default content) ---
  const savingsBadge = doc.createElement('p');
  savingsBadge.className = 'es-savings-badge';
  savingsBadge.append(picture(doc, ASSETS.savingsBadge, 'Insignia de ahorros: 30 o 90 días por tan solo $30'));
  appendDefault(doc, main, '<h2>PODRÍAS SER ELEGIBLE PARA RECIBIR 30 O 90 DÍAS POR TAN SOLO $30.</h2>');
  main.append(savingsBadge);
  appendDefault(doc, main,
    '<p>Ya sea que comiences con una receta de 90 o de 30 días, podrías ser elegible para pagar tan solo $30* con el Programa de Ahorros de LINZESS. Habla con tu médico sobre una receta de 90 días para poder aumentar tus ahorros y disminuir las visitas a la farmacia.</p>'
    + '<p class="button-container"><a href="/savings-card" class="button">DESCUBRE POSIBLES AHORROS</a></p>'
    + '<p><em>*Se aplica el límite máximo de ahorro; el gasto de bolsillo del paciente puede variar. La oferta no es válida para pacientes inscritos en Medicare, Medicaid u otros programas federales o estatales de atención médica. Esta oferta no es válida para los pacientes que pagan en efectivo.</em></p>');
  appendSectionBreak(doc, main, 'white, es-center, es-savings');

  // --- Section 8: accordion terms (17 parent rows + 1 item × 7 cells) ---
  const accBody = 'Esta oferta es válida solo para pacientes con cobertura de un seguro comercial de medicamentos con receta, que tengan 6 años o más y que cumplan con los requisitos de elegibilidad, y solo se puede usar con una receta válida para cápsulas de 72 mcg, 145 mcg o 290 mcg de LINZESS® (linaclotida) en el momento en que el farmacéutico surte la receta y la entrega al paciente. Esta oferta no es válida para el uso por parte de pacientes inscritos en Medicare, Medicaid u otros programas federales o estatales (incluidos los programas de asistencia farmacéutica estatales, TRICARE y del Departamento de Defensa o de Asuntos de Veteranos), ni para planes de seguro de indemnización privada o de organizaciones del mantenimiento de la salud (Health Maintenance Organization, HMO) que le reembolsen el costo total de sus medicamentos con receta o cuando lo prohíba la ley o el proveedor de seguro médico del paciente. Si en algún momento un paciente comienza a recibir cobertura de medicamentos de venta con receta en virtud de cualquier programa de atención de la salud federal, estatal o financiado por el Gobierno, el paciente ya no será elegible para utilizar la tarjeta de ahorros de LINZESS. Es posible que los pacientes no puedan usar esta tarjeta si son elegibles para Medicare y están inscritos en un plan de salud patrocinado por el empleador o en un programa de beneficios de medicamentos con receta para jubilados. Esta oferta no es válida para pacientes que pagan en efectivo. Oferta válida solo en los EE. UU., incluido Puerto Rico, en las farmacias minoristas participantes. Es posible que los pacientes que residen o reciben tratamiento en determinados estados no sean elegibles para participar en este programa. Según su cobertura de seguro, los pacientes elegibles pueden pagar tan solo $30 por cada suministro de 30, 60 o 90 días de hasta doce (12) recetas por año calendario. Un suministro para 60 días cuenta como dos (2) surtidos y un suministro para 90 días cuenta como tres (3) surtidos del total de doce (12) surtidos. AbbVie se reserva el derecho de rescindir, revocar o enmendar esta oferta sin previo aviso. Será nulo si tiene impuestos, está restringido o prohibido por la ley. Los pacientes no pueden solicitar el reembolso del valor recibido conforme al programa de ahorros de LINZESS de cualquier tercero pagador. Esta oferta no es transferible. La venta, compra, comercialización o falsificación de esta tarjeta está prohibida por ley. Esta oferta no tiene valor en efectivo y no puede utilizarse en combinación con ningún otro descuento, cupón, reembolso, prueba gratuita u oferta similar para la receta especificada. Sujeto a todos los demás términos y condiciones, el beneficio anual máximo que puede estar disponible únicamente para el beneficio del paciente en virtud del programa de asistencia para copago es de $2,280.00 por año calendario. La aplicación y el uso reales del beneficio disponible en virtud del programa de asistencia para copago pueden variar de forma mensual, trimestral y/o anual según el plan de seguro de cada paciente individual y los costos de otros medicamentos con receta. Esta oferta no es un seguro médico. Al canjear esta oferta, usted reconoce que es un paciente elegible y que comprende y acepta cumplir con los términos y condiciones de esta oferta. Para obtener información sobre las prácticas de privacidad de AbbVie y sus opciones de privacidad, visite <a href="https://abbv.ie/corpprivacy">https://abbv.ie/corpprivacy</a>.';
  // Parent FieldGroups in order (17 rows), matching _accordion.json after
  // _groupFields(): blockHeading, classes (all classes_* collapse to 1 group),
  // expandAllLabel, collapseAllLabel, expandAllIcon, collapseAllIcon, expandIcon,
  // collapseIcon, expandAllIconImage, collapseAllIconImage, expandIconImage,
  // collapseIconImage, ariaExpandAllLabel, ariaCollapseAllLabel, analyticsId,
  // blockId (id:), language (lang:none). Then the 7-cell accordion-item.
  appendBlock(doc, main, 'accordion', [
    [''], // 1 blockHeading
    [''], // 2 classes (classes_* group — empty)
    ['Expand All'], // 3 expandAllLabel
    ['Collapse All'], // 4 collapseAllLabel
    ['plus'], // 5 expandAllIcon
    ['minus'], // 6 collapseAllIcon
    ['plus'], // 7 expandIcon
    ['minus'], // 8 collapseIcon
    [''], // 9 expandAllIconImage
    [''], // 10 collapseAllIconImage
    [''], // 11 expandIconImage
    [''], // 12 collapseIconImage
    [''], // 13 ariaExpandAllLabel
    [''], // 14 ariaCollapseAllLabel
    [''], // 15 analyticsId
    ['id:'], // 16 blockId
    ['lang:none'], // 17 language
    [
      // accordion-item: summary, text, fragmentPath, ariaExpandLabel,
      // ariaCollapseLabel, anchorId, image (imageAlt collapses into image) → 7 cells
      'CONSULTA LOS TÉRMINOS, CONDICIONES Y CRITERIOS DE ELEGIBILIDAD DEL PROGRAMA.',
      frag(doc, `<p>${accBody}</p>`),
      '', '', '', '', '',
    ],
  ]);
  appendSectionBreak(doc, main, 'white, es-terms');

  // --- Section 9: ISI (text-container: 4 parent rows + 1 item richtext) ---
  const isiContent = '<h3>USOS</h3>'
    + '<p>LINZESS® (linaclotida) es un medicamento recetado que se utiliza para tratar el síndrome del intestino irritable con estreñimiento (SII-E) en adultos y en niños y adolescentes de 7 años en adelante, el estreñimiento idiopático crónico (EIC) en adultos y el FC (functional constipation [estreñimiento funcional]) en niños y adolescentes de 6 años en adelante. “Idiopático” significa que se desconoce la causa del estreñimiento; Se desconoce si LINZESS es seguro y eficaz en niños menores de 6 años con estreñimiento funcional o en niños menores de 7 años con SII-E.</p>'
    + '<h3>INFORMACIÓN IMPORTANTE SOBRE RIESGOS</h3>'
    + '<ul><li>No se debe administrar LINZESS a niños menores de 2 años. Podría causarles daño. LINZESS puede ocasionar diarrea grave, y su hijo podría sufrir deshidratación grave (pérdida de una gran cantidad de agua y sal del cuerpo).</li>'
    + '<li>No tome LINZESS si un médico le ha dicho que tiene un bloqueo intestinal (obstrucción intestinal).</li></ul>'
    + '<p><strong>Antes de tomar LINZESS, informe a su médico acerca de todas las afecciones médicas que tenga, lo que incluye que usted:</strong></p>'
    + '<ul><li>estuviera embarazada o planificara quedar embarazada. Se desconoce si LINZESS puede dañar a un bebé en gestación.</li>'
    + '<li>estuviera amamantando o planificara hacerlo. Usted y su médico deben decidir si va a recibir LINZESS y va a amamantar.</li></ul>'
    + '<p>Informe a su médico acerca de todos los medicamentos que esté utilizando, incluidos medicamentos de venta con receta y de venta libre, vitaminas y suplementos a base de hierbas.</p>'
    + '<p><strong>Efectos secundarios</strong></p>'
    + '<p>LINZESS puede causar efectos secundarios graves, incluida diarrea, que es el efecto secundario más frecuente y, a veces, puede ser grave. La diarrea a menudo comienza dentro de las primeras 2 semanas de tratamiento con LINZESS. Deje de tomar LINZESS y llame a su médico de inmediato si tiene diarrea intensa durante el tratamiento con LINZESS.</p>'
    + '<p>Entre otros efectos secundarios frecuentes de LINZESS en personas que tienen IBS-C y CIC, se incluyen gases, dolor en el área del estómago (abdomen) e hinchazón o sensación de llenura o presión en el abdomen (distensión).</p>'
    + '<p>Llame a su médico o diríjase a la sala de emergencias del hospital más cercano de inmediato si presenta dolor inusual o intenso en el área del estómago (abdomen), especialmente si también tiene heces con sangre, rojas brillantes o heces negras que tienen el mismo aspecto que el alquitrán.</p>'
    + '<p>Estos no son todos los efectos secundarios posibles de LINZESS. Para obtener más información, consulte a su médico o a su farmacéutico.</p>'
    + '<p>Se le recomienda informar a la FDA (Food and Drug Administration [Administración de Alimentos y Medicamentos]) los efectos secundarios negativos de los fármacos de venta con receta. Visite <a href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program">www.fda.gov/medwatch</a> o llame al 1-800-FDA-1088.</p>'
    + '<p>Si tiene dificultades para pagar su medicamento, Ironwood y AbbVie podrían brindarle ayuda. Visite <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> para obtener más información.</p>'
    + '<p>US-LIN-260103</p>';
  appendBlock(doc, main, 'text-container', [
    ['isi'],
    ['-'],
    ['none'],
    ['-'],
    [frag(doc, isiContent)],
  ]);
  appendSectionBreak(doc, main, 'isi');

  // --- Section 10: floating safety bar (sticky bottom bar w/ Expand button) ---
  // safety-bar model = 6 FieldGroups: collapsed col1 (USOS), collapsed col2
  // (abbreviated IISR), expanded (full ISI), classes_variant (split), blockId
  // (id:), language (lang:none). Mirrors the known-good savings-card safety-bar.
  // Lives in its own section with classes_customClass=safety-bar-source.
  const sbCol1 = '<h3>USOS</h3>'
    + '<p>LINZESS® (linaclotida) es un medicamento recetado que se utiliza para tratar el síndrome del intestino irritable con estreñimiento (SII-E) en adultos y en niños y adolescentes de 7 años en adelante, el estreñimiento idiopático crónico (EIC) en adultos y el FC (functional constipation [estreñimiento funcional]) en niños y adolescentes de 6 años en adelante. “Idiopático” significa que se desconoce la causa del estreñimiento; Se desconoce si LINZESS es seguro y eficaz en niños menores de 6 años con estreñimiento funcional o en niños menores de 7 años con SII-E.</p>';
  const sbCol2 = '<h3>INFORMACIÓN IMPORTANTE SOBRE RIESGOS</h3>'
    + '<ul><li>No se debe administrar LINZESS a niños menores de 2 años. Podría causarles daño. LINZESS puede ocasionar diarrea grave, y su hijo podría sufrir deshidratación grave (pérdida de una gran cantidad de agua y sal del cuerpo).</li>'
    + '<li>No tome LINZESS si un médico le ha dicho que tiene un bloqueo intestinal (obstrucción intestinal).</li></ul>';
  const sbBlock = WebImporter.Blocks.createBlock(doc, {
    name: 'safety-bar (split)',
    cells: [
      [frag(doc, sbCol1)], // content (collapsed col 1)
      [frag(doc, sbCol2)], // collapsedContentCol2
      [frag(doc, isiContent)], // expandedContent (full verbatim Spanish ISI)
      ['split'], // classes_variant
      ['id:'], // blockId
      ['lang:none'], // language
    ],
  });
  const sbSection = doc.createElement('div');
  sbSection.append(sbBlock);
  const sbMeta = WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['classes_customClass', 'safety-bar-source'],
  ], doc);
  sbSection.append(sbMeta);
  main.append(sbSection);
  main.append(doc.createElement('hr'));

  // --- Page metadata ---
  const meta = WebImporter.DOMUtils.createTable([
    ['Metadata'],
    ['brand', 'linzess'],
    ['nav', '/linzess/es/nav'],
    ['footer', '/linzess/es/footer'],
    ['title', 'El tratamiento de marca más recetado para IBS-C y CIC | LINZESS (linaclotide)'],
    ['description', 'Maneje los síntomas del Síndrome del Intestino Irritable con Estreñimiento (IBS-C) y el Estreñimiento Idiopático Crónico (CIC) con LINZESS. Vea la Información de riesgo y la Advertencia en el recuadro.'],
    ['lang', 'es'],
  ], doc);
  main.append(meta);

  return main;
}

export default {
  transform: ({ document }) => [{
    element: build(document),
    path: '/linzess/utility/es-home',
    report: { title: 'ES LINZESS homepage', template: 'linzess-es-home', blocks: ['hero', 'cards-grid', 'columns', 'accordion', 'text-container'] },
  }],
};
