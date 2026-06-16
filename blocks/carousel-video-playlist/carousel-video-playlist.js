import { renderBlock } from '../../scripts/multi-theme.js';

const DEFAULT_PLAYER = 'default';
const bcScripts = {};
let playerCount = 0;

function loadBrightcoveScript(account, player) {
  const key = `${account}/${player}_default`;
  if (!bcScripts[key]) {
    bcScripts[key] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://players.brightcove.net/${key}/index.min.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return bcScripts[key];
}

function getPlayer(id) {
  if (typeof window.videojs !== 'undefined') {
    return window.videojs.getPlayer(id);
  }
  return null;
}

function buildThumbnailCard(item, index, isActive, isCardsLayout) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'cvp-playlist-item';
  if (isActive) card.classList.add('is-active');
  card.setAttribute('aria-label', `Play ${item.title || `Video ${index + 1}`}`);
  card.dataset.index = index;

  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'cvp-playlist-thumb';

  if (item.thumbnail) {
    if (typeof item.thumbnail === 'string') {
      const img = document.createElement('img');
      img.src = item.thumbnail;
      img.alt = item.title || '';
      img.loading = 'lazy';
      thumbWrap.append(img);
    } else {
      thumbWrap.append(item.thumbnail.cloneNode(true));
    }
  }

  const playIcon = document.createElement('span');
  playIcon.className = 'cvp-playlist-play-icon';
  playIcon.setAttribute('aria-hidden', 'true');
  thumbWrap.append(playIcon);

  if (isCardsLayout && item.title) {
    const overlayTitle = document.createElement('span');
    overlayTitle.className = 'cvp-playlist-overlay-title';
    overlayTitle.textContent = item.title;
    thumbWrap.append(overlayTitle);
  }

  card.append(thumbWrap);

  if (!isCardsLayout && item.title) {
    const title = document.createElement('span');
    title.className = 'cvp-playlist-item-title';
    title.textContent = item.title;
    card.append(title);
  }

  return card;
}

function isItemRow(row) {
  return row.children.length >= 2 && row.querySelector('picture');
}

function readBlockConfig(block) {
  const rows = [...block.children];
  const configRows = rows.filter((r) => !isItemRow(r));
  const values = configRows.map((r) => r.firstElementChild?.textContent?.trim() || '');

  const layouts = ['cards', 'bottom', 'top', 'left', 'right'];
  const firstVal = values[0] || '';
  const firstIsNumber = /^\d{5,}$/.test(firstVal);

  // If first value is a long number, content was authored without layout field (legacy)
  // Use pattern-based detection
  if (firstIsNumber) {
    const numbers = values.filter((v) => /^\d{5,}$/.test(v));
    const layout = values.find((v) => layouts.includes(v)) || 'cards';
    const enableCaptions = values.includes('true');
    const playerId = values.find(
      (v) => v && !layouts.includes(v) && v !== 'true' && v !== 'false' && !/^\d{5,}$/.test(v),
    ) || '';

    return {
      playlistLayout: layout,
      accountId: numbers[0] || '',
      playlistId: numbers[1] || '',
      playerId,
      enableCaptions,
    };
  }

  // New model field order:
  // 0: classes, 1: sectionHeading, 2: sectionDescription,
  // 3: accountId, 4: playlistId, 5: playerId, 6: maxVisible
  //
  // Old model (no heading/desc):
  // 0: classes, 1: accountId, 2: playlistId, 3: playerId, 4: enableCaptions
  const accountIdOldPos = values[1] || '';
  const accountIdNewPos = values[3] || '';
  const isOldFormat = /^\d{8,}$/.test(accountIdOldPos);

  return {
    playlistLayout: layouts.includes(firstVal) ? firstVal : 'cards',
    sectionHeading: isOldFormat ? '' : (values[1] || ''),
    sectionDescription: isOldFormat ? '' : (values[2] || ''),
    accountId: isOldFormat ? accountIdOldPos : accountIdNewPos,
    playlistId: isOldFormat ? (values[2] || '') : (values[4] || ''),
    playerId: isOldFormat ? (values[3] || '') : (values[5] || ''),
    maxVisible: isOldFormat ? 0 : (parseInt(values[6], 10) || 0),
    enableCaptions: isOldFormat ? (values[4] === 'true') : false,
  };
}

function parsePlaylistItems(block) {
  const items = [];
  const rows = [...block.children];

  rows.forEach((row) => {
    if (!isItemRow(row)) return;

    const cells = [...row.children];
    const videoId = cells[0]?.textContent?.trim() || '';
    if (!videoId) return;

    const thumbnail = cells[1]?.querySelector('picture') || null;
    const title = cells[2]?.textContent?.trim() || '';
    const transcriptHref = cells[3]?.querySelector('a')?.href
      || cells[3]?.textContent?.trim() || '';

    items.push({
      videoId, thumbnail, title, transcriptHref,
    });
  });

  return items;
}

function initPlaylistPlayer(container, account, player, playlistId, enableCaptions, onReady) {
  playerCount += 1;
  const id = `cvp-player-${playerCount}`;

  const videoEl = document.createElement('video-js');
  videoEl.id = id;
  videoEl.setAttribute('data-account', account);
  videoEl.setAttribute('data-player', player);
  videoEl.setAttribute('data-embed', 'default');
  videoEl.setAttribute('data-playlist-id', playlistId);
  videoEl.setAttribute('controls', '');
  videoEl.className = 'video-js cvp-player';

  container.append(videoEl);

  loadBrightcoveScript(account, player).then(() => {
    if (typeof window.bc === 'function') {
      window.bc(videoEl);
    }

    const configure = () => {
      const bcPlayer = getPlayer(id);
      if (!bcPlayer) {
        requestAnimationFrame(configure);
        return;
      }
      bcPlayer.ready(function ready() {
        if (!enableCaptions) {
          const tracks = this.textTracks();
          if (tracks) {
            for (let i = 0; i < tracks.length; i += 1) {
              if (tracks[i].kind === 'captions' || tracks[i].kind === 'subtitles') {
                tracks[i].mode = 'disabled';
              }
            }
          }
        }
        if (typeof onReady === 'function') {
          if (typeof this.playlist !== 'function') {
            onReady(null);
            return;
          }
          const self = this;
          let attempts = 0;
          const pollPlaylist = () => {
            attempts += 1;
            const pl = self.playlist();
            if (pl && pl.length > 0) {
              onReady(self);
            } else if (attempts < 20) {
              setTimeout(pollPlaylist, 500);
            } else {
              onReady(null);
            }
          };
          setTimeout(pollPlaylist, 1000);
        }
      });
    };
    configure();
  });
}

function initSinglePlayer(container, account, player, videoId, enableCaptions) {
  if (container.querySelector('video-js')) return;

  playerCount += 1;
  const id = `cvp-player-${playerCount}`;

  const videoEl = document.createElement('video-js');
  videoEl.id = id;
  videoEl.setAttribute('data-account', account);
  videoEl.setAttribute('data-player', player);
  videoEl.setAttribute('data-embed', 'default');
  videoEl.setAttribute('data-video-id', videoId);
  videoEl.setAttribute('controls', '');
  videoEl.className = 'video-js cvp-player';

  container.append(videoEl);

  loadBrightcoveScript(account, player).then(() => {
    if (typeof window.bc === 'function') {
      window.bc(videoEl);
    }

    const configure = () => {
      const bcPlayer = getPlayer(id);
      if (!bcPlayer) {
        requestAnimationFrame(configure);
        return;
      }
      bcPlayer.ready(function ready() {
        if (!enableCaptions) {
          const tracks = this.textTracks();
          if (tracks) {
            for (let i = 0; i < tracks.length; i += 1) {
              if (tracks[i].kind === 'captions' || tracks[i].kind === 'subtitles') {
                tracks[i].mode = 'disabled';
              }
            }
          }
        }
      });
    };
    configure();
  });
}

function switchVideo(container, videoId) {
  const videoEl = container.querySelector('video-js');
  if (!videoEl) return;

  const bcPlayer = getPlayer(videoEl.id);
  if (!bcPlayer) return;

  bcPlayer.catalog.getVideo(videoId, (error, video) => {
    if (!error) {
      bcPlayer.catalog.load(video);
      bcPlayer.play();
    }
  });
}

function renderPlaylist(opts) {
  const {
    items, isCardsLayout, videoContainer, activeTitle, transcriptLink,
  } = opts;
  const playlistArea = document.createElement('div');
  playlistArea.className = 'cvp-playlist';
  playlistArea.setAttribute('role', 'tablist');
  playlistArea.setAttribute('aria-label', 'Video playlist');

  items.forEach((item, index) => {
    const card = buildThumbnailCard(item, index, index === 0, isCardsLayout);
    card.setAttribute('role', 'tab');
    card.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    card.id = `cvp-tab-${playerCount + 1}-${index}`;

    card.addEventListener('click', () => {
      playlistArea.querySelectorAll('.cvp-playlist-item').forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      card.classList.add('is-active');
      card.setAttribute('aria-selected', 'true');

      switchVideo(videoContainer, item.videoId);
      activeTitle.textContent = item.title || '';

      if (item.transcriptHref) {
        transcriptLink.href = item.transcriptHref;
        transcriptLink.hidden = false;
      } else {
        transcriptLink.hidden = true;
      }
    });

    playlistArea.append(card);
  });

  // Keyboard navigation
  playlistArea.addEventListener('keydown', (e) => {
    const tabs = [...playlistArea.querySelectorAll('.cvp-playlist-item')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;

    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (current + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (current - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = tabs.length - 1;
    }

    if (next >= 0) {
      e.preventDefault();
      tabs[next].focus();
    }
  });

  return playlistArea;
}

function assembleLayout(block, playlistArea, playerArea, playlistLayout, isCardsLayout) {
  if (isCardsLayout) {
    block.append(playlistArea, playerArea);
  } else if (playlistLayout === 'top' || playlistLayout === 'bottom') {
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'cvp-playlist-scroll-wrapper';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'cvp-playlist-nav cvp-playlist-prev';
    prevBtn.setAttribute('aria-label', 'Previous videos');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'cvp-playlist-nav cvp-playlist-next';
    nextBtn.setAttribute('aria-label', 'Next videos');

    const scrollAmount = 240;
    prevBtn.addEventListener('click', () => {
      playlistArea.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      playlistArea.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    scrollWrapper.append(prevBtn, playlistArea, nextBtn);

    if (playlistLayout === 'top') {
      block.append(scrollWrapper, playerArea);
    } else {
      block.append(playerArea, scrollWrapper);
    }
  } else if (playlistLayout === 'left') {
    block.append(playlistArea, playerArea);
  } else {
    block.append(playerArea, playlistArea);
  }
}

export async function decorateBlock(block) {
  const cfg = readBlockConfig(block);
  const {
    accountId, playlistId, enableCaptions, playlistLayout,
  } = cfg;
  const player = cfg.playerId || DEFAULT_PLAYER;
  const isCardsLayout = playlistLayout === 'cards';

  block.classList.add(`cvp-layout-${playlistLayout}`);

  // Player area
  const playerArea = document.createElement('div');
  playerArea.className = 'cvp-player-area';

  const videoContainer = document.createElement('div');
  videoContainer.className = 'cvp-video-container';
  playerArea.append(videoContainer);

  const activeTitle = document.createElement('h3');
  activeTitle.className = 'cvp-active-title';
  playerArea.append(activeTitle);

  const activeDesc = document.createElement('p');
  activeDesc.className = 'cvp-active-desc';
  playerArea.append(activeDesc);

  const transcriptLink = document.createElement('a');
  transcriptLink.className = 'cvp-transcript-link';
  transcriptLink.target = '_blank';
  transcriptLink.rel = 'noopener noreferrer';
  transcriptLink.textContent = 'View transcript';
  transcriptLink.hidden = true;
  playerArea.append(transcriptLink);

  // Mode A: Brightcove Playlist ID — fetch videos from Brightcove
  if (accountId && playlistId) {
    block.textContent = '';

    const loadingEl = document.createElement('div');
    loadingEl.className = 'cvp-placeholder';
    loadingEl.textContent = 'Loading playlist...';
    videoContainer.append(loadingEl);

    block.append(playerArea);

    // Defer Brightcove SDK load — 3s delay + IntersectionObserver
    setTimeout(() => {
      const blockObs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        blockObs.disconnect();
        initPlaylistPlayer(videoContainer, accountId, player, playlistId, enableCaptions, (bcPlayer) => { // eslint-disable-line max-len
          loadingEl.remove();

          if (!bcPlayer) {
            const msg = document.createElement('div');
            msg.className = 'cvp-placeholder';
            msg.textContent = 'Playlist plugin not available — check Player ID';
            videoContainer.append(msg);
            return;
          }

          const playlist = bcPlayer.playlist() || [];
          if (!playlist.length) return;

          const items = playlist.map((video) => ({
            videoId: video.id,
            thumbnail: video.thumbnail || video.poster || '',
            title: video.name || '',
            description: video.description || '',
            transcriptHref: '',
          }));

          activeTitle.textContent = items[0].title;
          activeDesc.textContent = items[0].description;

          const playlistArea = renderPlaylist({
            items, isCardsLayout, videoContainer, activeTitle, transcriptLink,
          });

          // Override card click to use Brightcove playlist index
          playlistArea.querySelectorAll('.cvp-playlist-item').forEach((card, idx) => {
            card.addEventListener('click', () => {
              bcPlayer.playlist.currentItem(idx);
              activeTitle.textContent = items[idx].title;
              activeDesc.textContent = items[idx].description;
            });
          });

          assembleLayout(block, playlistArea, playerArea, playlistLayout, isCardsLayout);

          // Listen for playlist item changes
          bcPlayer.on('playlistitem', () => {
            const currentIdx = bcPlayer.playlist.currentItem();
            if (currentIdx >= 0 && items[currentIdx]) {
              activeTitle.textContent = items[currentIdx].title;
              activeDesc.textContent = items[currentIdx].description;

              playlistArea.querySelectorAll('.cvp-playlist-item').forEach((btn, i) => {
                btn.classList.toggle('is-active', i === currentIdx);
                btn.setAttribute('aria-selected', i === currentIdx ? 'true' : 'false');
              });
            }
          });
        });
      }, { rootMargin: '0px' });
      blockObs.observe(block);
    }, 3000);
    return;
  }

  // Mode B: Authored items — fallback when no playlistId
  const items = parsePlaylistItems(block);
  if (!items.length) {
    block.textContent = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'cvp-placeholder';
    placeholder.textContent = 'Add video items or configure a Brightcove Playlist ID';
    block.append(placeholder);
    return;
  }

  block.textContent = '';

  activeTitle.textContent = items[0].title || '';
  if (items[0].transcriptHref) {
    transcriptLink.href = items[0].transcriptHref;
    transcriptLink.hidden = false;
  }

  const playlistArea = renderPlaylist({
    items, isCardsLayout, videoContainer, activeTitle, transcriptLink,
  });

  assembleLayout(block, playlistArea, playerArea, playlistLayout, isCardsLayout);

  if (accountId && items[0].videoId) {
    initSinglePlayer(videoContainer, accountId, player, items[0].videoId, enableCaptions);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'cvp-placeholder';
    placeholder.textContent = 'Video player — configure Brightcove account to enable playback';
    videoContainer.append(placeholder);
  }
}

export default async function decorate(block) {
  renderBlock(block);
}
