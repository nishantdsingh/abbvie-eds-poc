/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-linzess-es-home.js
  var import_linzess_es_home_exports = {};
  __export(import_linzess_es_home_exports, {
    default: () => import_linzess_es_home_default
  });
  var IMG = "https://es.linzess.com/content/dam/linzess/images";
  var ASSETS = {
    hero: `${IMG}/homeherobanner-dt.png`,
    symptomConstipation: `${IMG}/espanol/homepage/hat-is-ibsc-constipation-icon-v2_r0_desktop.svg`,
    symptomFewer: `${IMG}/espanol/homepage/what-is-ibsc-fewer-than-icon_r0_desktop.png`,
    symptomIncomplete: `${IMG}/espanol/homepage/what-is-ibsc-incomplete-bowel-movements-icon-v2_r0_desktop.svg`,
    symptomPain: `${IMG}/espanol/homepage/what-is-ibsc-bellypain-icon_r0_desktop.png`,
    symptomDiscomfort: `${IMG}/espanol/homepage/what-is-ibsc-discomfort-icon_r0_desktop.png`,
    symptomBloating: `${IMG}/espanol/homepage/what-is-ibsc-bloating-icon_r0_desktop.png`,
    chronic: `${IMG}/espanol/homepage/congregation_r0_desktop.png`,
    dian: `${IMG}/espanol/homepage/dian_r0_desktop.png`,
    savingsBadge: `${IMG}/espanol/homepage/90-days-for-30-es_r0_desktop.png`
  };
  function frag(doc, html) {
    const tpl = doc.createElement("div");
    tpl.innerHTML = html;
    const f = doc.createDocumentFragment();
    while (tpl.firstChild) f.appendChild(tpl.firstChild);
    return f;
  }
  function picture(doc, src, alt) {
    const p = doc.createElement("picture");
    const i = doc.createElement("img");
    i.setAttribute("src", src);
    i.setAttribute("alt", alt || "");
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
        ["Section Metadata"],
        ["style", styleValue]
      ], doc);
      container.append(meta);
    }
    container.append(doc.createElement("hr"));
  }
  function build(doc) {
    const main = doc.createElement("div");
    appendBlock(doc, main, "hero (light-font)", [
      [picture(doc, ASSETS.hero, "Mujer sonriente \u2014 banner del tratamiento LINZESS")],
      // image
      [""],
      // mobileImage
      ["Para adultos con S\xEDndrome de Intestino Irritable con Estre\xF1imiento (IBS-C) o Estre\xF1imiento Idiop\xE1tico Cr\xF3nico (CIC)."],
      // eyebrow
      [frag(doc, "<p>(IBS-C y CIC respectivamente, por sus siglas en ingl\xE9s.)</p>")],
      // indication
      [frag(doc, "<h1>\xBFESTRE\xD1IMIENTO CON DOLOR ABDOMINAL CONSTANTE?</h1><p>Podr\xEDa ser el S\xEDndrome de Intestino Irritable con Estre\xF1imiento o Estre\xF1imiento Idiop\xE1tico Cr\xF3nico, condiciones m\xE9dicas que pueden requerir tratamiento.</p>")],
      // text
      [""],
      // layers
      [""],
      // video
      [""]
      // imageCaption
    ]);
    appendSectionBreak(doc, main, "hero");
    appendDefault(
      doc,
      main,
      '<h2>ESTE PODR\xCDA SER EL MOMENTO PARA HABLAR CON TU M\xC9DICO.</h2><p>LINZESS puede ayudar a tener evacuaciones intestinales m\xE1s frecuentes y completas, y a aliviar el dolor abdominal y s\xEDntomas abdominales generales* (dolor, malestar e inflamaci\xF3n) asociados con IBS\u2011C.</p><p><em>*Los s\xEDntomas abdominales se estudiaron en combinaci\xF3n, no individualmente.</em></p><p class="button-container"><a href="/porquelinzess" class="button">C\xD3MO PUEDE AYUDAR LINZESS</a></p>'
    );
    appendSectionBreak(doc, main, "white, es-center");
    appendDefault(doc, main, "<h2>\xBFTIENES ESTOS S\xCDNTOMAS?</h2>");
    const symptoms = [
      [ASSETS.symptomConstipation, "\xCDcono de estre\xF1imiento", "Estre\xF1imiento"],
      [ASSETS.symptomFewer, "\xCDcono de menos de 3 evacuaciones intestinales por semana", "Menos de 3 evacuaciones intestinales por semana"],
      [ASSETS.symptomIncomplete, "\xCDcono de evacuaciones intestinales incompletas", "Evacuaciones intestinales incompletas"],
      [ASSETS.symptomPain, "\xCDcono de dolor abdominal (del vientre)", "Dolor abdominal (del vientre)"],
      [ASSETS.symptomDiscomfort, "\xCDcono de malestar abdominal", "Malestar abdominal"],
      [ASSETS.symptomBloating, "\xCDcono de inflamaci\xF3n o hinchaz\xF3n", "Inflamaci\xF3n o hinchaz\xF3n"]
    ];
    appendBlock(
      doc,
      main,
      "cards-grid",
      symptoms.map(([src, alt, caption]) => ["", picture(doc, src, alt), caption, "", "", ""])
    );
    appendDefault(
      doc,
      main,
      '<p>Experimentar estos s\xEDntomas constantemente NO ES NORMAL ya que podr\xEDan indicar que padeces S\xEDndrome de Intestino Irritable con Estre\xF1imiento (IBS-C).</p><p class="button-container"><a href="/spanishgutcheck" class="button">REVISAR MIS S\xCDNTOMAS</a></p>'
    );
    appendSectionBreak(doc, main, "white, es-center, es-symptoms");
    appendDefault(doc, main, "<h2>\xBFSAB\xCDAS QUE EL S\xCDNDROME DE INTESTINO IRRITABLE CON ESTRE\xD1IMIENTO (IBS-C) ES UNA CONDICI\xD3N CR\xD3NICA?</h2><p>Quiz\xE1s muchas personas no consideren el estre\xF1imiento con dolor abdominal como una condici\xF3n cr\xF3nica, sino como algo normal o temporal. Pero los s\xEDntomas que reaparecen o parecen durar mucho tiempo pueden ser se\xF1ales de una CONDICI\xD3N REAL que requiere atenci\xF3n y tratamiento m\xE9dico.</p>");
    const chronicP = doc.createElement("p");
    chronicP.append(picture(doc, ASSETS.chronic, "Ilustraci\xF3n de personas afectadas por IBS-C y CIC"));
    main.append(chronicP);
    appendDefault(doc, main, "<p>Probablemente ya has probado laxantes de venta libre, fibra, remedios caseros, beber m\xE1s agua, hacer ejercicio y consejos de tu familia. Quiz\xE1 sea momento de hablar con tu m\xE9dico.</p>");
    appendSectionBreak(doc, main, "white, es-center");
    appendDefault(
      doc,
      main,
      '<h2 class="es-stat">~40 MILLONES DE PERSONAS EN LOS EE. UU.</h2><p class="es-stat-sub">AUNQUE LOS ESTIMADOS VAR\xCDAN, EL IBS-C Y EL CIC AFECTAN A MUCHOS</p>'
    );
    appendBlock(doc, main, "columns", [
      ["es-comparison-cols"],
      [frag(doc, "<h3>S\xCDNTOMAS DEL IBS-C</h3><p><strong>ESTRE\xD1IMIENTO</strong></p><ul><li>Heces fecales duras o grumosas</li><li>Evacuaciones Intestinales incompletas</li><li>Menos de 3 evacuaciones por semana</li></ul><p><strong>S\xCDNTOMAS ABDOMINALES</strong></p><ul><li>Dolor abdominal (del vientre)</li><li>Molestia</li><li>Inflamaci\xF3n o hinchaz\xF3n</li></ul><p>Los pacientes con IBS-C suelen experimentar estre\xF1imiento con s\xEDntomas abdominales (del vientre).</p>")],
      [frag(doc, "<h3>S\xCDNTOMAS DEL CIC</h3><p>Estre\xF1imiento Idiop\xE1tico Cr\xF3nico (\u201Cidiop\xE1tico\u201D significa que se desconoce la causa)</p><p><strong>ESTRE\xD1IMIENTO</strong></p><ul><li>Heces fecales duras o grumosas</li><li>Evacuaciones intestinales incompletas</li><li>Menos de 3 evacuaciones por semana</li></ul>")]
    ]);
    appendSectionBreak(doc, main, "blue, es-center, es-comparison");
    const tWrap = doc.createElement("div");
    tWrap.append(picture(doc, ASSETS.dian, "Dian, paciente real tratada con LINZESS"));
    tWrap.append(frag(doc, '<p class="es-quote">\u201CNo est\xE1s solo y no tienes que sufrir solo.\u201D</p><p><strong>Dian, 43</strong></p><p>Le recetaron LINZESS para el estre\xF1imiento idiop\xE1tico cr\xF3nico (CIC)</p>'));
    main.append(tWrap);
    appendSectionBreak(doc, main, "white, es-center, es-testimonial");
    const savingsBadge = doc.createElement("p");
    savingsBadge.className = "es-savings-badge";
    savingsBadge.append(picture(doc, ASSETS.savingsBadge, "Insignia de ahorros: 30 o 90 d\xEDas por tan solo $30"));
    appendDefault(doc, main, "<h2>PODR\xCDAS SER ELEGIBLE PARA RECIBIR 30 O 90 D\xCDAS POR TAN SOLO $30.</h2>");
    main.append(savingsBadge);
    appendDefault(
      doc,
      main,
      '<p>Ya sea que comiences con una receta de 90 o de 30 d\xEDas, podr\xEDas ser elegible para pagar tan solo $30* con el Programa de Ahorros de LINZESS. Habla con tu m\xE9dico sobre una receta de 90 d\xEDas para poder aumentar tus ahorros y disminuir las visitas a la farmacia.</p><p class="button-container"><a href="/savings-card" class="button">DESCUBRE POSIBLES AHORROS</a></p><p><em>*Se aplica el l\xEDmite m\xE1ximo de ahorro; el gasto de bolsillo del paciente puede variar. La oferta no es v\xE1lida para pacientes inscritos en Medicare, Medicaid u otros programas federales o estatales de atenci\xF3n m\xE9dica. Esta oferta no es v\xE1lida para los pacientes que pagan en efectivo.</em></p>'
    );
    appendSectionBreak(doc, main, "white, es-center, es-savings");
    const accBody = 'Esta oferta es v\xE1lida solo para pacientes con cobertura de un seguro comercial de medicamentos con receta, que tengan 6 a\xF1os o m\xE1s y que cumplan con los requisitos de elegibilidad, y solo se puede usar con una receta v\xE1lida para c\xE1psulas de 72 mcg, 145 mcg o 290 mcg de LINZESS\xAE (linaclotida) en el momento en que el farmac\xE9utico surte la receta y la entrega al paciente. Esta oferta no es v\xE1lida para el uso por parte de pacientes inscritos en Medicare, Medicaid u otros programas federales o estatales (incluidos los programas de asistencia farmac\xE9utica estatales, TRICARE y del Departamento de Defensa o de Asuntos de Veteranos), ni para planes de seguro de indemnizaci\xF3n privada o de organizaciones del mantenimiento de la salud (Health Maintenance Organization, HMO) que le reembolsen el costo total de sus medicamentos con receta o cuando lo proh\xEDba la ley o el proveedor de seguro m\xE9dico del paciente. Si en alg\xFAn momento un paciente comienza a recibir cobertura de medicamentos de venta con receta en virtud de cualquier programa de atenci\xF3n de la salud federal, estatal o financiado por el Gobierno, el paciente ya no ser\xE1 elegible para utilizar la tarjeta de ahorros de LINZESS. Es posible que los pacientes no puedan usar esta tarjeta si son elegibles para Medicare y est\xE1n inscritos en un plan de salud patrocinado por el empleador o en un programa de beneficios de medicamentos con receta para jubilados. Esta oferta no es v\xE1lida para pacientes que pagan en efectivo. Oferta v\xE1lida solo en los EE. UU., incluido Puerto Rico, en las farmacias minoristas participantes. Es posible que los pacientes que residen o reciben tratamiento en determinados estados no sean elegibles para participar en este programa. Seg\xFAn su cobertura de seguro, los pacientes elegibles pueden pagar tan solo $30 por cada suministro de 30, 60 o 90 d\xEDas de hasta doce (12) recetas por a\xF1o calendario. Un suministro para 60 d\xEDas cuenta como dos (2) surtidos y un suministro para 90 d\xEDas cuenta como tres (3) surtidos del total de doce (12) surtidos. AbbVie se reserva el derecho de rescindir, revocar o enmendar esta oferta sin previo aviso. Ser\xE1 nulo si tiene impuestos, est\xE1 restringido o prohibido por la ley. Los pacientes no pueden solicitar el reembolso del valor recibido conforme al programa de ahorros de LINZESS de cualquier tercero pagador. Esta oferta no es transferible. La venta, compra, comercializaci\xF3n o falsificaci\xF3n de esta tarjeta est\xE1 prohibida por ley. Esta oferta no tiene valor en efectivo y no puede utilizarse en combinaci\xF3n con ning\xFAn otro descuento, cup\xF3n, reembolso, prueba gratuita u oferta similar para la receta especificada. Sujeto a todos los dem\xE1s t\xE9rminos y condiciones, el beneficio anual m\xE1ximo que puede estar disponible \xFAnicamente para el beneficio del paciente en virtud del programa de asistencia para copago es de $2,280.00 por a\xF1o calendario. La aplicaci\xF3n y el uso reales del beneficio disponible en virtud del programa de asistencia para copago pueden variar de forma mensual, trimestral y/o anual seg\xFAn el plan de seguro de cada paciente individual y los costos de otros medicamentos con receta. Esta oferta no es un seguro m\xE9dico. Al canjear esta oferta, usted reconoce que es un paciente elegible y que comprende y acepta cumplir con los t\xE9rminos y condiciones de esta oferta. Para obtener informaci\xF3n sobre las pr\xE1cticas de privacidad de AbbVie y sus opciones de privacidad, visite <a href="https://abbv.ie/corpprivacy">https://abbv.ie/corpprivacy</a>.';
    appendBlock(doc, main, "accordion", [
      [""],
      // 1 blockHeading
      [""],
      // 2 classes (classes_* group — empty)
      ["Expand All"],
      // 3 expandAllLabel
      ["Collapse All"],
      // 4 collapseAllLabel
      ["plus"],
      // 5 expandAllIcon
      ["minus"],
      // 6 collapseAllIcon
      ["plus"],
      // 7 expandIcon
      ["minus"],
      // 8 collapseIcon
      [""],
      // 9 expandAllIconImage
      [""],
      // 10 collapseAllIconImage
      [""],
      // 11 expandIconImage
      [""],
      // 12 collapseIconImage
      [""],
      // 13 ariaExpandAllLabel
      [""],
      // 14 ariaCollapseAllLabel
      [""],
      // 15 analyticsId
      ["id:"],
      // 16 blockId
      ["lang:none"],
      // 17 language
      [
        // accordion-item: summary, text, fragmentPath, ariaExpandLabel,
        // ariaCollapseLabel, anchorId, image (imageAlt collapses into image) → 7 cells
        "CONSULTA LOS T\xC9RMINOS, CONDICIONES Y CRITERIOS DE ELEGIBILIDAD DEL PROGRAMA.",
        frag(doc, `<p>${accBody}</p>`),
        "",
        "",
        "",
        "",
        ""
      ]
    ]);
    appendSectionBreak(doc, main, "white, es-terms");
    const isiContent = '<h3>USOS</h3><p>LINZESS\xAE (linaclotida) es un medicamento recetado que se utiliza para tratar el s\xEDndrome del intestino irritable con estre\xF1imiento (SII-E) en adultos y en ni\xF1os y adolescentes de 7 a\xF1os en adelante, el estre\xF1imiento idiop\xE1tico cr\xF3nico (EIC) en adultos y el FC (functional constipation [estre\xF1imiento funcional]) en ni\xF1os y adolescentes de 6 a\xF1os en adelante. \u201CIdiop\xE1tico\u201D significa que se desconoce la causa del estre\xF1imiento; Se desconoce si LINZESS es seguro y eficaz en ni\xF1os menores de 6 a\xF1os con estre\xF1imiento funcional o en ni\xF1os menores de 7 a\xF1os con SII-E.</p><h3>INFORMACI\xD3N IMPORTANTE SOBRE RIESGOS</h3><ul><li>No se debe administrar LINZESS a ni\xF1os menores de 2 a\xF1os. Podr\xEDa causarles da\xF1o. LINZESS puede ocasionar diarrea grave, y su hijo podr\xEDa sufrir deshidrataci\xF3n grave (p\xE9rdida de una gran cantidad de agua y sal del cuerpo).</li><li>No tome LINZESS si un m\xE9dico le ha dicho que tiene un bloqueo intestinal (obstrucci\xF3n intestinal).</li></ul><p><strong>Antes de tomar LINZESS, informe a su m\xE9dico acerca de todas las afecciones m\xE9dicas que tenga, lo que incluye que usted:</strong></p><ul><li>estuviera embarazada o planificara quedar embarazada. Se desconoce si LINZESS puede da\xF1ar a un beb\xE9 en gestaci\xF3n.</li><li>estuviera amamantando o planificara hacerlo. Usted y su m\xE9dico deben decidir si va a recibir LINZESS y va a amamantar.</li></ul><p>Informe a su m\xE9dico acerca de todos los medicamentos que est\xE9 utilizando, incluidos medicamentos de venta con receta y de venta libre, vitaminas y suplementos a base de hierbas.</p><p><strong>Efectos secundarios</strong></p><p>LINZESS puede causar efectos secundarios graves, incluida diarrea, que es el efecto secundario m\xE1s frecuente y, a veces, puede ser grave. La diarrea a menudo comienza dentro de las primeras 2 semanas de tratamiento con LINZESS. Deje de tomar LINZESS y llame a su m\xE9dico de inmediato si tiene diarrea intensa durante el tratamiento con LINZESS.</p><p>Entre otros efectos secundarios frecuentes de LINZESS en personas que tienen IBS-C y CIC, se incluyen gases, dolor en el \xE1rea del est\xF3mago (abdomen) e hinchaz\xF3n o sensaci\xF3n de llenura o presi\xF3n en el abdomen (distensi\xF3n).</p><p>Llame a su m\xE9dico o dir\xEDjase a la sala de emergencias del hospital m\xE1s cercano de inmediato si presenta dolor inusual o intenso en el \xE1rea del est\xF3mago (abdomen), especialmente si tambi\xE9n tiene heces con sangre, rojas brillantes o heces negras que tienen el mismo aspecto que el alquitr\xE1n.</p><p>Estos no son todos los efectos secundarios posibles de LINZESS. Para obtener m\xE1s informaci\xF3n, consulte a su m\xE9dico o a su farmac\xE9utico.</p><p>Se le recomienda informar a la FDA (Food and Drug Administration [Administraci\xF3n de Alimentos y Medicamentos]) los efectos secundarios negativos de los f\xE1rmacos de venta con receta. Visite <a href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program">www.fda.gov/medwatch</a> o llame al 1-800-FDA-1088.</p><p>Si tiene dificultades para pagar su medicamento, Ironwood y AbbVie podr\xEDan brindarle ayuda. Visite <a href="https://www.abbvie.com/patients/patient-support.html">AbbVie.com/PatientAccessSupport</a> para obtener m\xE1s informaci\xF3n.</p><p>US-LIN-260103</p>';
    appendBlock(doc, main, "text-container", [
      ["isi"],
      ["-"],
      ["none"],
      ["-"],
      [frag(doc, isiContent)]
    ]);
    appendSectionBreak(doc, main, "isi");
    const sbCol1 = "<h3>USOS</h3><p>LINZESS\xAE (linaclotida) es un medicamento recetado que se utiliza para tratar el s\xEDndrome del intestino irritable con estre\xF1imiento (SII-E) en adultos y en ni\xF1os y adolescentes de 7 a\xF1os en adelante, el estre\xF1imiento idiop\xE1tico cr\xF3nico (EIC) en adultos y el FC (functional constipation [estre\xF1imiento funcional]) en ni\xF1os y adolescentes de 6 a\xF1os en adelante. \u201CIdiop\xE1tico\u201D significa que se desconoce la causa del estre\xF1imiento; Se desconoce si LINZESS es seguro y eficaz en ni\xF1os menores de 6 a\xF1os con estre\xF1imiento funcional o en ni\xF1os menores de 7 a\xF1os con SII-E.</p>";
    const sbCol2 = "<h3>INFORMACI\xD3N IMPORTANTE SOBRE RIESGOS</h3><ul><li>No se debe administrar LINZESS a ni\xF1os menores de 2 a\xF1os. Podr\xEDa causarles da\xF1o. LINZESS puede ocasionar diarrea grave, y su hijo podr\xEDa sufrir deshidrataci\xF3n grave (p\xE9rdida de una gran cantidad de agua y sal del cuerpo).</li><li>No tome LINZESS si un m\xE9dico le ha dicho que tiene un bloqueo intestinal (obstrucci\xF3n intestinal).</li></ul>";
    const sbBlock = WebImporter.Blocks.createBlock(doc, {
      name: "safety-bar (split)",
      cells: [
        [frag(doc, sbCol1)],
        // content (collapsed col 1)
        [frag(doc, sbCol2)],
        // collapsedContentCol2
        [frag(doc, isiContent)],
        // expandedContent (full verbatim Spanish ISI)
        ["split"],
        // classes_variant
        ["id:"],
        // blockId
        ["lang:none"]
        // language
      ]
    });
    const sbSection = doc.createElement("div");
    sbSection.append(sbBlock);
    const sbMeta = WebImporter.DOMUtils.createTable([
      ["Section Metadata"],
      ["classes_customClass", "safety-bar-source"]
    ], doc);
    sbSection.append(sbMeta);
    main.append(sbSection);
    main.append(doc.createElement("hr"));
    const meta = WebImporter.DOMUtils.createTable([
      ["Metadata"],
      ["brand", "linzess"],
      ["nav", "/linzess/es/nav"],
      ["footer", "/linzess/es/footer"],
      ["title", "El tratamiento de marca m\xE1s recetado para IBS-C y CIC | LINZESS (linaclotide)"],
      ["description", "Maneje los s\xEDntomas del S\xEDndrome del Intestino Irritable con Estre\xF1imiento (IBS-C) y el Estre\xF1imiento Idiop\xE1tico Cr\xF3nico (CIC) con LINZESS. Vea la Informaci\xF3n de riesgo y la Advertencia en el recuadro."],
      ["lang", "es"]
    ], doc);
    main.append(meta);
    return main;
  }
  var import_linzess_es_home_default = {
    transform: ({ document }) => [{
      element: build(document),
      path: "/linzess/utility/es-home",
      report: { title: "ES LINZESS homepage", template: "linzess-es-home", blocks: ["hero", "cards-grid", "columns", "accordion", "text-container"] }
    }]
  };
  return __toCommonJS(import_linzess_es_home_exports);
})();
