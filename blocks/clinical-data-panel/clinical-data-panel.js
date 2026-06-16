export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const figure = document.createElement('figure');
  figure.className = 'clinical-data-panel-figure';

  let title = '';
  let chartAlt = '';
  let footnotes = '';
  let studyDesignLabel = '';
  let studyDesignLink = '';
  const images = { desktop: null, tablet: null, mobile: null };

  const firstRowCells = rows[0]?.children?.length || 0;
  const isTableFormat = firstRowCells > 1;

  if (isTableFormat) {
    rows.forEach((row) => {
      const cells = [...row.children];
      const img = cells[0]?.querySelector('img, picture');
      if (img) {
        if (!images.desktop) images.desktop = img.cloneNode(true);
        else if (!images.tablet) images.tablet = img.cloneNode(true);
        else if (!images.mobile) images.mobile = img.cloneNode(true);
      } else {
        const text = cells[0]?.textContent.trim() || '';
        const value = cells[1]?.innerHTML?.trim() || cells[1]?.textContent?.trim() || '';
        const key = text.toLowerCase();
        if (key === 'title') title = value;
        else if (key === 'alt' || key === 'chartalt') chartAlt = value;
        else if (key === 'footnotes') footnotes = value;
        else if (key === 'studydesignlabel') studyDesignLabel = value;
        else if (key === 'studydesignlink') studyDesignLink = value;
      }
    });
  } else {
    // Xwalk delivered format: fields in model order, one per row
    // Row order: title, chartDesktop, chartTablet, chartMobile, chartAlt,
    //            footnotes, studyDesignLabel, studyDesignLink
    rows.forEach((row, idx) => {
      const img = row.querySelector('img, picture');
      const text = row.textContent.trim();
      const html = row.querySelector(':scope > div')?.innerHTML?.trim() || '';

      switch (idx) {
        case 0:
          title = text;
          break;
        case 1:
          if (img) images.desktop = img.cloneNode(true);
          break;
        case 2:
          if (img) images.tablet = img.cloneNode(true);
          break;
        case 3:
          if (img) images.mobile = img.cloneNode(true);
          break;
        case 4:
          chartAlt = text;
          break;
        case 5:
          footnotes = html;
          break;
        case 6:
          studyDesignLabel = text;
          break;
        case 7:
          studyDesignLink = text;
          break;
        default:
          break;
      }
    });
  }

  rows.forEach((row) => { row.style.display = 'none'; });

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'clinical-data-panel-title';
    const titleRow = rows[0]?.querySelector(':scope > div');
    if (titleRow?.querySelector('sup')) {
      heading.innerHTML = titleRow.innerHTML;
    } else {
      heading.innerHTML = title.replace(/(\d+[,.*†‡§‖¶#]*)$/g, '<sup>$1</sup>');
    }
    figure.append(heading);
  }

  const picture = document.createElement('picture');

  if (images.mobile) {
    const mobileSrc = images.mobile.tagName === 'IMG' ? images.mobile : images.mobile.querySelector('img');
    if (mobileSrc) {
      const source = document.createElement('source');
      source.media = '(max-width: 600px)';
      source.srcset = mobileSrc.src;
      picture.append(source);
    }
  }

  if (images.tablet) {
    const tabletSrc = images.tablet.tagName === 'IMG' ? images.tablet : images.tablet.querySelector('img');
    if (tabletSrc) {
      const source = document.createElement('source');
      source.media = '(max-width: 984px)';
      source.srcset = tabletSrc.src;
      picture.append(source);
    }
  }

  if (images.desktop) {
    const desktopEl = images.desktop.tagName === 'IMG' ? images.desktop : images.desktop.querySelector('img');
    if (desktopEl) {
      const img = document.createElement('img');
      img.src = desktopEl.src;
      img.alt = chartAlt || desktopEl.alt || '';
      img.loading = 'lazy';
      img.className = 'clinical-data-panel-chart';
      picture.append(img);
      figure.append(picture);
    }
  }

  if (footnotes) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'clinical-data-panel-footnotes';
    figcaption.innerHTML = footnotes;
    figure.append(figcaption);
  }

  if (studyDesignLabel) {
    const cta = document.createElement('a');
    cta.className = 'clinical-data-panel-cta';
    cta.textContent = studyDesignLabel;
    if (studyDesignLink && studyDesignLink.startsWith('#')) {
      cta.href = '#';
      cta.dataset.modalId = studyDesignLink.substring(1);
    } else if (studyDesignLink) {
      cta.href = studyDesignLink;
    } else {
      cta.href = '#';
      cta.setAttribute('role', 'button');
    }
    figure.append(cta);
  }

  block.append(figure);
}
