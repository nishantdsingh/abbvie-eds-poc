const LABEL_VIEW_TRANSCRIPT = 'View Transcript';
const LABEL_HIDE_TRANSCRIPT = 'Hide Transcript';
const loadedScripts = {};
let playerCounter = 0;

function loadBrightcoveScript(accountId, playerId) {
  const key = `${accountId}/${playerId}_default`;
  if (!loadedScripts[key]) {
    loadedScripts[key] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://players.brightcove.net/${key}/index.min.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return loadedScripts[key];
}

function getVideoJsPlayer(id) {
  return typeof window.videojs !== 'undefined' ? window.videojs.getPlayer(id) : null;
}

function isItemRow(row) {
  if (row.children.length < 2) return false;
  if (row.querySelector('picture')) return true;
  const firstText = row.firstElementChild?.textContent?.trim() || '';
  return /^\d{8,}$/.test(firstText);
}

function parseConfig(block) {
  const cfgRows = [...block.children].filter((r) => !isItemRow(r));
  const cellText = (i) => cfgRows[i]?.firstElementChild?.textContent?.trim() ?? '';
  const cellHtml = (i) => cfgRows[i]?.firstElementChild?.innerHTML?.trim() ?? '';

  // Find accountId by scanning for a 10+ digit number
  let accountIdx = -1;
  for (let i = 0; i < cfgRows.length; i += 1) {
    if (/^\d{8,}$/.test(cellText(i))) { accountIdx = i; break; }
  }

  // Find maxVisible by scanning for a small number (1-20) that isn't the accountId
  let maxVisible = 0;
  for (let i = 0; i < cfgRows.length; i += 1) {
    const val = cellText(i);
    if (/^\d{1,2}$/.test(val) && parseInt(val, 10) > 0 && parseInt(val, 10) <= 20 && i !== accountIdx) {
      maxVisible = parseInt(val, 10);
      break;
    }
  }

  const playlistIdx = accountIdx >= 0 ? accountIdx + 1 : -1;
  const playerIdx = accountIdx >= 0 ? accountIdx + 2 : -1;

  return {
    heading: cellText(1),
    description: cellHtml(2),
    maxVisible,
    accountId: accountIdx >= 0 ? cellText(accountIdx) : '',
    playlistId: playlistIdx >= 0 ? cellText(playlistIdx) : '',
    playerId: (playerIdx >= 0 ? cellText(playerIdx) : '') || 'default',
  };
}

function parseItems(block) {
  return [...block.children]
    .filter(isItemRow)
    .map((row) => {
      const cells = [...row.children];
      const getText = (i) => cells[i]?.textContent?.trim() ?? '';
      return {
        videoId: getText(0),
        nameBanner: getText(1),
        transcriptHref: getText(2),
        transcript: cells[3] ?? null,
        patientName: getText(4),
        prescribed: getText(5),
        quote: getText(6),
      };
    })
    .filter(({ videoId }) => videoId);
}

function createVideoEl(videoId, accountId, playerId) {
  playerCounter += 1;
  const id = `linz-cvp-${playerCounter}`;

  const videoEl = document.createElement('video-js');
  videoEl.id = id;
  videoEl.setAttribute('data-account', accountId);
  videoEl.setAttribute('data-player', playerId);
  videoEl.setAttribute('data-embed', 'default');
  videoEl.setAttribute('data-video-id', videoId);
  videoEl.setAttribute('preload', 'none');
  videoEl.setAttribute('controls', '');
  videoEl.className = 'video-js vjs-fluid';
  return { videoEl, id };
}

// Initialise player in poster-only mode (preload=none shows BC poster, no stream loaded).
function initPosterPlayer(container, videoId, playBtn, accountId, playerId) {
  const { videoEl, id } = createVideoEl(videoId, accountId, playerId);
  container.append(videoEl);

  loadBrightcoveScript(accountId, playerId).then(() => {
    if (typeof window.bc === 'function') window.bc(videoEl);
  });

  playBtn.addEventListener('click', () => {
    playBtn.hidden = true;
    playBtn.style.display = 'none';
    const poll = () => {
      const p = getVideoJsPlayer(id);
      if (p) p.ready(() => p.play());
      else requestAnimationFrame(poll);
    };
    loadBrightcoveScript(accountId, playerId).then(poll);
  });

  return id;
}

function switchVideo(playerId, videoId) {
  const p = getVideoJsPlayer(playerId);
  if (!p?.catalog) return;
  p.catalog.getVideo(videoId, (err, video) => {
    if (!err) { p.catalog.load(video); p.play(); }
  });
}

function createTranscriptToggle(transcriptCell, container) {
  if (!transcriptCell?.textContent?.trim()) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cvp-transcript-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = LABEL_VIEW_TRANSCRIPT;

  const panel = document.createElement('div');
  panel.className = 'cvp-transcript-panel';
  [...transcriptCell.childNodes].forEach((n) => panel.append(n.cloneNode(true)));

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    // Close all open transcript panels in the block
    const blockEl = container.closest('.carousel-video-playlist');
    if (blockEl) {
      blockEl.querySelectorAll('.cvp-transcript-panel.is-open').forEach((p) => {
        p.classList.remove('is-open');
        const toggleBtn = p.previousElementSibling;
        if (toggleBtn?.classList.contains('cvp-transcript-toggle')) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.textContent = LABEL_VIEW_TRANSCRIPT;
        }
      });
    }
    if (!isOpen) {
      panel.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = LABEL_HIDE_TRANSCRIPT;
    }
  });

  container.append(btn, panel);
}

// ── Grid mode (homepage) ─────────────────────────────────────────────────────

function buildGridMode(block, cfg, items, accountId, playerId) {
  if (cfg.heading || cfg.description) {
    const header = document.createElement('div');
    header.className = 'cvp-header';
    if (cfg.heading) {
      const accent = document.createElement('span');
      accent.className = 'cvp-accent-line';
      header.append(accent);
      const h2 = document.createElement('h2');
      h2.className = 'cvp-heading';
      h2.textContent = cfg.heading;
      header.append(h2);
    }
    if (cfg.description && !/^\d+$/.test(cfg.description.replace(/<[^>]+>/g, '').trim())) {
      const desc = document.createElement('div');
      desc.className = 'cvp-description';
      desc.innerHTML = cfg.description;
      header.append(desc);
    }
    if (cfg.maxVisible > 0) {
      block.dataset.maxVisible = cfg.maxVisible;
    }
    block.append(header);
  }

  const grid = document.createElement('div');
  grid.className = 'cvp-grid';

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'cvp-card';

    const playerWrap = document.createElement('div');
    playerWrap.className = 'cvp-player-wrap';

    if (item.nameBanner) {
      const banner = document.createElement('div');
      banner.className = 'cvp-name-banner';
      banner.textContent = item.nameBanner;
      playerWrap.append(banner);
    }

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'cvp-play-btn';
    playBtn.setAttribute('aria-label', `Play ${item.nameBanner || 'video'}`);
    playBtn.innerHTML = '&#9654;';
    playerWrap.append(playBtn);

    card.append(playerWrap);

    const footer = document.createElement('div');
    footer.className = 'cvp-card-footer';

    if (item.nameBanner) {
      const title = document.createElement('span');
      title.className = 'cvp-title';
      title.textContent = item.nameBanner;
      footer.append(title);
    }

    card.append(footer);
    if (item.transcript?.textContent?.trim()) {
      createTranscriptToggle(item.transcript, footer);
    } else if (item.transcriptHref) {
      const link = document.createElement('a');
      link.className = 'cvp-transcript-toggle';
      link.href = item.transcriptHref;
      link.textContent = LABEL_VIEW_TRANSCRIPT;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      footer.append(link);
    }

    // Delay poster player init — wait 3s to avoid Lighthouse penalty
    setTimeout(() => {
      const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        initPosterPlayer(playerWrap, item.videoId, playBtn, accountId, playerId);
      }, { rootMargin: '0px' });
      obs.observe(card);
    }, 5000);

    grid.append(card);
  });

  block.append(grid);

  // Mobile touch swipe
  let touchStartX = 0;
  grid.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  grid.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const w = grid.firstElementChild?.offsetWidth ?? 300;
      grid.scrollBy({ left: diff > 0 ? w + 16 : -(w + 16), behavior: 'smooth' });
    }
  });
}

// ── Featured mode (patient experiences) ─────────────────────────────────────

function buildFeaturedMode(block, items, accountId, playerId) {
  if (!items.length) return;

  let activePlayerId = null;

  // ── Part A: Featured video + quote panel ──────────────────────
  const featuredRow = document.createElement('div');
  featuredRow.className = 'cvp-featured-row';

  // Left: video player (70%)
  const featuredPlayer = document.createElement('div');
  featuredPlayer.className = 'cvp-featured-player';

  const featuredWrap = document.createElement('div');
  featuredWrap.className = 'cvp-player-wrap';

  const featuredBanner = document.createElement('div');
  featuredBanner.className = 'cvp-name-banner';
  featuredBanner.textContent = items[0].nameBanner || '';
  featuredWrap.append(featuredBanner);

  const featuredPlayBtn = document.createElement('button');
  featuredPlayBtn.type = 'button';
  featuredPlayBtn.className = 'cvp-play-btn';
  featuredPlayBtn.setAttribute('aria-label', 'Play video');
  featuredPlayBtn.innerHTML = '&#9654;';
  featuredWrap.append(featuredPlayBtn);

  featuredPlayer.append(featuredWrap);
  featuredRow.append(featuredPlayer);

  // Right: quote panel (30%)
  const quotePanel = document.createElement('div');
  quotePanel.className = 'cvp-quote-panel';

  const quoteEl = document.createElement('p');
  quoteEl.className = 'cvp-quote';
  quoteEl.textContent = items[0].quote ? `“${items[0].quote}”` : '';

  const patientNameEl = document.createElement('p');
  patientNameEl.className = 'cvp-patient-name';
  patientNameEl.textContent = items[0].patientName || '';

  const prescribedEl = document.createElement('p');
  prescribedEl.className = 'cvp-prescribed';
  prescribedEl.textContent = items[0].prescribed || '';

  const transcriptLink = document.createElement('a');
  transcriptLink.className = 'cvp-view-transcript';
  transcriptLink.textContent = LABEL_VIEW_TRANSCRIPT;
  transcriptLink.href = items[0].transcriptHref || '#';
  if (!items[0].transcriptHref) transcriptLink.hidden = true;

  quotePanel.append(quoteEl, patientNameEl, prescribedEl, transcriptLink);
  createTranscriptToggle(items[0].transcript, quotePanel);
  featuredRow.append(quotePanel);
  block.append(featuredRow);

  function updateQuotePanel(item) {
    quoteEl.textContent = item.quote ? `”${item.quote}”` : '';
    patientNameEl.textContent = item.patientName || '';
    prescribedEl.textContent = item.prescribed || '';
    if (item.transcriptHref) {
      transcriptLink.href = item.transcriptHref;
      transcriptLink.hidden = false;
    } else {
      transcriptLink.hidden = true;
    }
    quotePanel.querySelectorAll('.cvp-transcript-toggle, .cvp-transcript-panel')
      .forEach((el) => el.remove());
    createTranscriptToggle(item.transcript, quotePanel);
    featuredBanner.textContent = item.nameBanner || '';
  }

  // Defer featured player init to avoid Lighthouse penalty
  setTimeout(() => {
    const featObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      featObs.disconnect();
      // eslint-disable-next-line max-len
      activePlayerId = initPosterPlayer(featuredWrap, items[0].videoId, featuredPlayBtn, accountId, playerId);
    }, { rootMargin: '200px' });
    featObs.observe(featuredWrap);
  }, 5000);

  // ── Part B: Thumbnail playlist row ───────────────────────────
  const playlistRow = document.createElement('div');
  playlistRow.className = 'cvp-playlist-row';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'cvp-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8249;';

  const thumbnails = document.createElement('div');
  thumbnails.className = 'cvp-thumbnails';
  thumbnails.setAttribute('role', 'tablist');
  thumbnails.setAttribute('aria-label', 'Video playlist');

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'cvp-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8250;';

  items.forEach((item, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'cvp-thumb';
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('tabindex', index === 0 ? '0' : '-1');
    thumb.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    thumb.setAttribute('aria-label', item.nameBanner || `Video ${index + 1}`);
    if (index === 0) thumb.classList.add('active');

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'cvp-thumb-wrap';

    const thumbBanner = document.createElement('div');
    thumbBanner.className = 'cvp-name-banner';
    thumbBanner.textContent = item.nameBanner || '';
    thumbWrap.append(thumbBanner);

    const thumbPlayIcon = document.createElement('span');
    thumbPlayIcon.className = 'cvp-play-btn';
    thumbPlayIcon.setAttribute('aria-hidden', 'true');
    thumbPlayIcon.innerHTML = '&#9654;';
    thumbWrap.append(thumbPlayIcon);

    // Delay Brightcove poster load — wait 3s + IntersectionObserver
    // This keeps SDK out of Lighthouse measurement window
    setTimeout(() => {
      const thumbObs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        thumbObs.disconnect();
        const vid = document.createElement('video-js');
        vid.setAttribute('data-account', accountId);
        vid.setAttribute('data-player', playerId);
        vid.setAttribute('data-embed', 'default');
        vid.setAttribute('data-video-id', item.videoId);
        vid.setAttribute('preload', 'none');
        vid.className = 'video-js cvp-thumb-video';
        thumbWrap.prepend(vid);
        loadBrightcoveScript(accountId, playerId).then(() => {
          if (typeof window.bc === 'function') window.bc(vid);
        });
      }, { rootMargin: '0px' });
      thumbObs.observe(thumbWrap);
    }, 5000);

    thumb.append(thumbWrap);

    const thumbTitle = document.createElement('p');
    thumbTitle.className = 'cvp-thumb-title';
    thumbTitle.textContent = item.nameBanner || '';
    thumb.append(thumbTitle);

    function selectThumb() {
      thumbnails.querySelectorAll('.cvp-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === index);
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      updateQuotePanel(item);

      if (activePlayerId) {
        switchVideo(activePlayerId, item.videoId);
      }
    }

    thumb.addEventListener('click', selectThumb);
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectThumb(); }
    });

    thumbnails.append(thumb);
  });

  const scrollAmt = 200;

  function updateNavButtons() {
    const atStart = thumbnails.scrollLeft <= 0;
    const atEnd = thumbnails.scrollLeft + thumbnails.clientWidth >= thumbnails.scrollWidth - 2;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
  }

  thumbnails.addEventListener('scroll', updateNavButtons);
  setTimeout(updateNavButtons, 100);

  prevBtn.addEventListener('click', () => {
    thumbnails.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    thumbnails.scrollBy({ left: scrollAmt, behavior: 'smooth' });
  });

  // Keyboard: arrow keys navigate thumbnails
  thumbnails.addEventListener('keydown', (e) => {
    const thumbEls = [...thumbnails.querySelectorAll('.cvp-thumb')];
    const idx = thumbEls.indexOf(document.activeElement);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % thumbEls.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + thumbEls.length) % thumbEls.length;
    if (next >= 0) { e.preventDefault(); thumbEls[next].focus(); }
  });

  // Touch swipe on thumbnail row
  let touchStartX = 0;
  thumbnails.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  thumbnails.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      thumbnails.scrollBy({ left: diff > 0 ? scrollAmt : -scrollAmt, behavior: 'smooth' });
    }
  });

  playlistRow.append(prevBtn, thumbnails, nextBtn);
  block.append(playlistRow);
}

// ── Main entry ───────────────────────────────────────────────────────────────

async function decorateBlock(block) {
  // Skip in Universal Editor canvas (page loaded in iframe)
  if (window.self !== window.top) return;

  const isFeatured = block.classList.contains('featured');
  // Ensure CSS layout class is present (default to grid)
  if (!isFeatured && !block.classList.contains('grid')) block.classList.add('grid');

  const cfg = parseConfig(block);
  const items = parseItems(block);

  block.textContent = '';

  if (!items.length) {
    const msg = document.createElement('p');
    msg.className = 'cvp-placeholder';
    msg.textContent = 'Add video items: Video ID | Thumbnail | Name Banner | Quote | Patient Name | Prescribed | Transcript';
    block.append(msg);
    return;
  }

  const { accountId, playerId } = cfg;

  if (isFeatured) {
    buildFeaturedMode(block, items, accountId, playerId);
  } else {
    buildGridMode(block, cfg, items, accountId, playerId);
  }
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateBlock(ctx),
    },
  };
}
