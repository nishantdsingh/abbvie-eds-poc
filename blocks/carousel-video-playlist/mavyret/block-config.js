const loadedScripts = {};
let playerCount = 0;

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

function isItemRow(row) {
  if (row.children.length < 2) return false;
  if (row.querySelector('picture')) return true;
  const firstText = row.firstElementChild?.textContent?.trim() || '';
  return /^\d{8,}$/.test(firstText);
}

function parseConfig(block) {
  const cfgRows = [...block.children].filter((r) => !isItemRow(r));
  const cellText = (i) => cfgRows[i]?.firstElementChild?.textContent?.trim() ?? '';

  // Detect playMode field — scan for "inline" value
  let playMode = '';
  for (let i = 0; i < cfgRows.length; i += 1) {
    if (cellText(i) === 'inline') { playMode = 'inline'; break; }
  }

  // Find maxVisible — scan for small number (1-20)
  let maxVisible = 0;
  for (let i = 0; i < cfgRows.length; i += 1) {
    const val = cellText(i);
    if (/^\d{1,2}$/.test(val) && parseInt(val, 10) > 0 && parseInt(val, 10) <= 20) {
      maxVisible = parseInt(val, 10);
      break;
    }
  }

  // Find accountId by scanning for 10+ digit number
  let accountIdx = -1;
  for (let i = 0; i < cfgRows.length; i += 1) {
    if (/^\d{8,}$/.test(cellText(i))) { accountIdx = i; break; }
  }
  const playerIdx = accountIdx >= 0 ? accountIdx + 2 : -1;

  return {
    accountId: accountIdx >= 0 ? cellText(accountIdx) : '',
    playerId: (playerIdx >= 0 ? cellText(playerIdx) : '') || 'default',
    playMode,
    maxVisible,
  };
}

function parseItems(block) {
  return [...block.children]
    .filter(isItemRow)
    .map((row) => {
      const cells = [...row.children];
      return {
        videoId: cells[0]?.textContent?.trim() ?? '',
        title: cells[1]?.textContent?.trim() ?? '',
        transcriptHref: cells[2]?.textContent?.trim() ?? '',
        transcript: cells[3] ?? null,
        description: cells[4]?.textContent?.trim() ?? '',
      };
    })
    .filter(({ videoId }) => videoId);
}

// ── Modal overlay (shared singleton) ──
let modal = null;

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('cvp-modal-is-open');
  const content = modal.querySelector('.cvp-modal-content');
  content.innerHTML = '';
}

function getModal() {
  if (modal) return modal;

  modal = document.createElement('div');
  modal.className = 'cvp-modal-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'cvp-modal-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'cvp-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeModal);

  const content = document.createElement('div');
  content.className = 'cvp-modal-content';

  dialog.append(closeBtn, content);
  modal.append(dialog);
  document.body.append(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  return modal;
}

function openVideoModal(item, accountId, playerId) {
  const m = getModal();
  const content = m.querySelector('.cvp-modal-content');
  content.innerHTML = '';

  // Video player
  playerCount += 1;
  const id = `mavyret-cvp-${playerCount}`;
  const videoEl = document.createElement('video-js');
  videoEl.id = id;
  videoEl.setAttribute('data-account', accountId);
  videoEl.setAttribute('data-player', playerId);
  videoEl.setAttribute('data-embed', 'default');
  videoEl.setAttribute('data-video-id', item.videoId);
  videoEl.setAttribute('controls', '');
  videoEl.className = 'video-js vjs-fluid';
  content.append(videoEl);

  // Inline transcript toggle (Mavyret shows transcript inside modal)
  if (item.transcript) {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'cvp-modal-transcript-toggle';
    toggleBtn.textContent = 'View Transcript';
    toggleBtn.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('div');
    panel.className = 'cvp-modal-transcript-panel';
    panel.hidden = true;
    if (typeof item.transcript === 'string') {
      panel.innerHTML = item.transcript;
    } else if (item.transcript.innerHTML) {
      panel.innerHTML = item.transcript.innerHTML;
    } else {
      [...item.transcript.childNodes].forEach((n) => panel.append(n.cloneNode(true)));
    }

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      toggleBtn.textContent = expanded ? 'View Transcript' : 'Hide Transcript';
      panel.hidden = expanded;
    });

    content.append(toggleBtn, panel);
  } else if (item.transcriptHref) {
    const link = document.createElement('a');
    link.className = 'cvp-modal-transcript';
    link.href = item.transcriptHref;
    link.textContent = 'View Transcript';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    content.append(link);
  }

  m.classList.add('is-open');
  document.body.classList.add('cvp-modal-is-open');

  loadBrightcoveScript(accountId, playerId).then(() => {
    if (typeof window.bc === 'function') window.bc(videoEl);
  });
}

// ── Build grid of clickable cards ──
function buildGrid(block, items, accountId, playerId, playMode) {
  const grid = document.createElement('div');
  grid.className = 'cvp-grid';

  items.forEach((item) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'cvp-card';
    card.setAttribute('aria-label', `Play ${item.title || 'video'}`);

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'cvp-thumb-wrap';

    // Play icon
    const playIcon = document.createElement('span');
    playIcon.className = 'cvp-play-btn';
    playIcon.setAttribute('aria-hidden', 'true');
    thumbWrap.append(playIcon);

    // Description overlay at bottom
    if (item.description) {
      const desc = document.createElement('div');
      desc.className = 'cvp-card-desc';
      desc.textContent = item.description;
      thumbWrap.append(desc);
    }

    card.append(thumbWrap);

    // Delay Brightcove poster load — wait 3s to avoid Lighthouse penalty
    setTimeout(() => {
      const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const vid = document.createElement('video-js');
        vid.setAttribute('data-account', accountId);
        vid.setAttribute('data-player', playerId);
        vid.setAttribute('data-embed', 'default');
        vid.setAttribute('data-video-id', item.videoId);
        vid.setAttribute('preload', 'none');
        vid.className = 'video-js cvp-poster-video';
        thumbWrap.prepend(vid);
        loadBrightcoveScript(accountId, playerId).then(() => {
          if (typeof window.bc === 'function') window.bc(vid);
        });
      }, { rootMargin: '0px' });
      obs.observe(card);
    }, 3000);

    // Click: modal or inline depending on playMode
    if (playMode === 'inline') {
      const handleInlinePlay = () => {
        const existing = thumbWrap.querySelector('.cvp-poster-video');
        if (existing) {
          const player = window.videojs?.getPlayer(existing.id);
          if (player) {
            player.controls(true);
            player.play()?.catch((e) => { if (e.name !== 'AbortError') throw e; });
            playIcon.hidden = true;
            card.removeEventListener('click', handleInlinePlay);
          }
        }
      };
      card.addEventListener('click', handleInlinePlay);
    } else {
      card.addEventListener('click', () => {
        openVideoModal(item, accountId, playerId);
      });
    }

    grid.append(card);
  });

  block.append(grid);
}

// ── Main decorate ──
async function decorateBlock(block) {
  if (window.self !== window.top) return;

  block.classList.add('mavyret-modal-grid');

  const cfg = parseConfig(block);
  if (cfg.playMode === 'inline') block.classList.add('mavyret-inline');
  if (cfg.maxVisible > 0) block.dataset.maxVisible = cfg.maxVisible;
  const items = parseItems(block);

  block.textContent = '';

  if (!items.length) {
    const msg = document.createElement('p');
    msg.className = 'cvp-placeholder';
    msg.textContent = 'Add video items: Video ID | Title | Transcript URL | Description';
    block.append(msg);
    return;
  }

  buildGrid(block, items, cfg.accountId, cfg.playerId, cfg.playMode);
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
