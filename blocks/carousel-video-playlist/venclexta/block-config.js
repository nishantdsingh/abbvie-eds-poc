import { loadScript } from '../../../scripts/aem.js';

const bcScripts = {};
let playerCount = 0;
let transcriptModal = null;

function loadBrightcoveScript(account, player) {
  if (!/^\d+$/.test(account) || !/^[a-zA-Z0-9_-]+$/.test(player)) {
    return Promise.reject(new Error('Invalid Brightcove account or player ID'));
  }
  const key = `${account}/${player}_default`;
  if (!bcScripts[key]) {
    bcScripts[key] = loadScript(`https://players.brightcove.net/${key}/index.min.js`);
  }
  return bcScripts[key];
}

function getTranscriptModal(block) {
  if (transcriptModal) {
    if (block && !block.contains(transcriptModal.overlay)) {
      transcriptModal.destroy();
      transcriptModal = null;
    } else {
      return transcriptModal;
    }
  }

  const ac = new AbortController();
  const { signal } = ac;

  const overlay = document.createElement('div');
  overlay.className = 'cvp-transcript-modal-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'cvp-transcript-modal-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Transcript');

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'cvp-transcript-modal-close';
  closeBtn.textContent = 'Close Transcript';

  const body = document.createElement('div');
  body.className = 'cvp-transcript-modal-body';

  dialog.append(closeBtn, body);
  overlay.append(dialog);
  block.append(overlay);

  const close = () => {
    overlay.classList.remove('is-open');
  };

  closeBtn.addEventListener('click', close, { signal });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  }, { signal });
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  }, { signal });

  transcriptModal = {
    overlay,
    body,
    destroy: () => { ac.abort(); overlay.remove(); },
  };
  return transcriptModal;
}

function openTranscript(content, block) {
  const modal = getTranscriptModal(block);
  modal.body.innerHTML = '';
  if (content?.nodeType) {
    modal.body.append(content.cloneNode(true));
  } else if (typeof content === 'string') {
    modal.body.textContent = content;
  }
  modal.overlay.classList.add('is-open');
}

function isItemRow(row) {
  if (row.children.length < 2) return false;
  if (row.querySelector('picture')) return true;
  const first = row.firstElementChild?.textContent?.trim();
  return /^\d{8,}$/.test(first);
}

function readConfig(block) {
  const rows = [...block.children];
  const cfgRows = rows.filter((r) => !isItemRow(r));
  const val = (i) => {
    const t = cfgRows[i]?.firstElementChild?.textContent?.trim();
    return t || '';
  };
  const layouts = ['cards', 'bottom', 'top', 'left', 'right'];
  const first = val(0);
  const cl = layouts.find((l) => block.classList.contains(l));
  return {
    layout: layouts.includes(first) ? first : (cl || 'cards'),
    accountId: val(3) || val(1) || '',
    playerId: val(5) || 'default',
    piUrl: val(7) || '',
  };
}

function parseItems(block) {
  return [...block.children]
    .filter(isItemRow)
    .map((row) => {
      const cells = [...row.children];
      const get = (i) => cells[i]?.textContent?.trim() ?? '';
      return {
        videoId: get(0),
        title: get(1),
        transcriptHref: get(2),
        transcript: cells[3] ?? null,
        description: cells[7] ?? null,
      };
    })
    .filter(({ videoId }) => videoId);
}

function buildCard(item, cfg, single, block) {
  const { accountId, playerId, piUrl } = cfg;
  const card = document.createElement('div');
  card.className = 'cvp-venclexta-card';

  const playerWrap = document.createElement('div');
  playerWrap.className = 'cvp-player-wrap';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'cvp-play-btn';
  playBtn.setAttribute('aria-label', `Play ${item.title}`);
  playerWrap.append(playBtn);

  card.append(playerWrap);

  const content = document.createElement('div');
  content.className = 'cvp-card-content';

  if (single && item.title) {
    const heading = document.createElement('h3');
    heading.className = 'cvp-card-heading';
    heading.textContent = item.title;
    content.append(heading);
  }

  const desc = document.createElement('div');
  desc.className = 'cvp-card-desc';
  if (item.description?.nodeType) {
    desc.append(item.description.cloneNode(true));
  } else if (item.description?.textContent?.trim()) {
    desc.textContent = item.description.textContent.trim();
  }
  content.append(desc);

  const hasTranscript = item.transcript
    ?.textContent?.trim();
  const link = document.createElement('button');
  link.type = 'button';
  link.className = 'cvp-transcript-link';
  link.textContent = 'View Transcript';
  link.classList.toggle('is-hidden', !(hasTranscript || item.transcriptHref));
  if (item.transcriptHref && /^https?:\/\//i.test(item.transcriptHref)) {
    link.dataset.transcriptUrl = item.transcriptHref;
  }
  link.addEventListener('click', () => {
    if (hasTranscript) {
      openTranscript(item.transcript, block);
    } else if (link.dataset.transcriptUrl) {
      window.open(link.dataset.transcriptUrl, '_blank', 'noopener,noreferrer');
    }
  });

  if (single) {
    const linksRow = document.createElement('div');
    linksRow.className = 'cvp-links-row';
    linksRow.append(link);

    if (/^https?:\/\//i.test(piUrl)) {
      const piLink = document.createElement('a');
      piLink.className = 'cvp-transcript-link cvp-pi-link';
      piLink.textContent = 'View Full Prescribing Information';
      piLink.href = piUrl;
      piLink.target = '_blank';
      piLink.rel = 'noopener noreferrer';
      linksRow.append(piLink);
    }

    content.append(linksRow);
  } else {
    content.append(link);
  }

  card.append(content);

  playerCount += 1;
  const id = `venclexta-cvp-${playerCount}`;
  const vid = document.createElement('video-js');
  vid.id = id;
  vid.setAttribute('data-account', accountId);
  vid.setAttribute('data-player', playerId);
  vid.setAttribute('data-embed', 'default');
  vid.setAttribute('data-video-id', item.videoId);
  vid.setAttribute('preload', 'metadata');
  vid.setAttribute('controls', '');
  vid.className = 'video-js cvp-poster-video';
  playerWrap.prepend(vid);

  function initPlayer() {
    return loadBrightcoveScript(accountId, playerId).then(() => {
      if (typeof window.bc === 'function') window.bc(vid);
      return new Promise((resolve) => {
        let retries = 300;
        const poll = () => {
          const p = window.videojs?.getPlayer(id);
          if (!p) {
            retries -= 1;
            if (retries <= 0) { resolve(); return; }
            requestAnimationFrame(poll);
            return;
          }
          p.ready(function onReady() {
            const mi = this.mediainfo;
            if (mi?.longDescription
              && /^https?:\/\//.test(mi.longDescription)
              && !hasTranscript && !link.dataset.transcriptUrl) {
              link.dataset.transcriptUrl = mi.longDescription;
              link.classList.remove('is-hidden');
            }
            resolve();
          });
        };
        poll();
      });
    });
  }
  card.initPlayer = initPlayer;

  playBtn.addEventListener('click', () => {
    playBtn.hidden = true;
    const videoEl = playerWrap.querySelector('video-js');
    if (!videoEl) return;
    let playRetries = 300;
    const startPlay = () => {
      const p = window.videojs?.getPlayer(videoEl.id);
      if (p) { p.ready(() => p.play()); return; }
      playRetries -= 1;
      if (playRetries > 0) requestAnimationFrame(startPlay);
    };
    loadBrightcoveScript(accountId, playerId).then(startPlay).catch(() => {
      playBtn.hidden = false;
    });
  });

  return card;
}

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (block) => {
        const isEditor = window.self !== window.top;
        const cfg = readConfig(block);
        const items = parseItems(block);
        const { accountId } = cfg;

        block.textContent = '';
        block.classList.add('cvp-venclexta-stories');

        if (!items.length || !accountId) {
          const msg = document.createElement('p');
          msg.className = 'cvp-placeholder';
          msg.textContent = 'No videos configured.';
          block.append(msg);
          return;
        }

        const single = items.length === 1;
        const grid = document.createElement('div');
        grid.className = single ? 'cvp-grid cvp-single' : 'cvp-grid';

        const cards = items.map((item) => {
          const card = buildCard(item, cfg, single, block);
          grid.append(card);
          return card;
        });

        block.append(grid);

        if (isEditor) return;

        // Lazy-init BC players when cards enter the viewport
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            observer.unobserve(card);
            if (card.initPlayer) card.initPlayer().catch(() => {});
          });
        }, { rootMargin: '200px' });

        cards.forEach((card) => observer.observe(card));
      },
    },
  };
}
