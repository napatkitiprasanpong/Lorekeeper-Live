(() => {
  'use strict';
  const STORAGE_KEY = 'lorekeeper-live-v2';
  const $ = (id) => document.getElementById(id);
  const seed = () => ({
    featuredId: null,
    cards: [
      { id: 'lore-flat-doomfist', title: 'Bronze Doomfist: the Spectate That Hit 1.77M', description: 'A highly viewed Flats Overwatch upload follows a Bronze spectate and frames the player as “the best Doomfist.” YouTube reported about 1.77 million views when this demo was researched.', hero: 'DOOMFIST', map: 'BRONZE SPECTATE', timestamp: '', clipUrl: 'https://www.youtube.com/watch?v=zKbeWzSP3N8', tags: ['PUBLIC SOURCE', 'SPECTATOR STORY'], votes: 0, author: 'public video source', createdAt: Date.now(), sourceNote: 'Public YouTube video · 1.77M views reported' }
    ],
    pending: [],
    chat: []
  });
  let state;
  let selectedTag = 'ALL';
  let toastTimer;
  let editorNominationId = null;
  let screenStream = null;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || seed(); } catch (_) { state = seed(); }
  state.cards = (state.cards || []).map((card) => ({ ...card, tags: card.tags || [], hero: card.hero || 'OVERWATCH', map: card.map || '', timestamp: card.timestamp || '', clipUrl: card.clipUrl || '' }));
  state.pending = state.pending || [];
  const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const safeSourceUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' && ['clips.twitch.tv', 'www.twitch.tv', 'twitch.tv', 'www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname) ? url.href : ''; } catch (_) { return ''; } };
  const timeLabel = (value) => {
    const seconds = Math.max(0, Math.floor((Date.now() - value) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  const guessTags = (text) => {
    const lower = text.toLowerCase();
    const tags = [];
    if (/ult|nano|blade|pulse|tire|bomb/.test(lower)) tags.push('ULT MOMENT');
    if (/clutch|overtime|won|surviv|one hp|1 hp/.test(lower)) tags.push('CLUTCH');
    if (/boop|map|edge|door|spawn|gibraltar|ilios|well/.test(lower)) tags.push('MAP MOMENT');
    if (/chat|meme|again|classic|😭|😂/.test(lower)) tags.push('CHAT CLASSIC');
    return tags.length ? tags.slice(0, 2) : ['COMMUNITY PICK'];
  };
  const makeTitle = (text) => {
    const cleaned = text.replace(/^!lore\s*/i, '').replace(/[.!?]+$/, '').trim();
    if (!cleaned) return 'A moment chat wants to remember';
    const words = cleaned.split(/\s+/).slice(0, 9).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const toast = (message) => {
    const el = $('toast'); el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2300);
  };
  const getHero = (cards) => {
    if (!cards.length) return '—';
    const counts = cards.reduce((all, card) => { const hero = card.hero || 'OVERWATCH'; all[hero] = (all[hero] || 0) + 1; return all; }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };
  const renderStats = () => {
    $('stat-canon').textContent = String(state.cards.length).padStart(2, '0');
    $('stat-pending').textContent = String(state.pending.length).padStart(2, '0');
    $('stat-hero').textContent = getHero(state.cards);
    $('queue-count').textContent = state.pending.length;
    $('queue-empty').classList.toggle('hidden', state.pending.length !== 0);
  };
  const renderQueue = () => {
    $('queue-list').innerHTML = state.pending.map((item) => `<article class="queue-item">${item.snapshot ? `<img class="queue-snapshot" src="${item.snapshot}" alt="Captured screen frame">` : `<div class="user-chip">▧</div>`}<div class="queue-content"><p class="queue-meta"><b>${esc(item.author)}</b> · ${timeLabel(item.time)} · <span class="tag pink">SCREEN CAPTURE</span></p><p class="queue-message">${esc(item.text)}</p><div class="queue-tags">${guessTags(item.text).map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div><div class="queue-actions"><button class="mini-button approve" data-action="approve" data-id="${esc(item.id)}">Review</button><button class="mini-button" data-action="reject" data-id="${esc(item.id)}">Dismiss</button></div></article>`).join('');
  };
  const renderTags = () => {
    const tags = ['ALL', ...new Set(state.cards.flatMap((card) => card.tags || []))];
    $('tag-row').innerHTML = tags.map((tag) => `<button class="filter-chip ${tag === selectedTag ? 'selected' : ''}" data-action="filter" data-tag="${esc(tag)}">${esc(tag)}</button>`).join('');
  };
  const renderArchive = () => {
    const query = $('search-input').value.trim().toLowerCase();
    const filtered = state.cards.filter((card) => {
      const matchText = !query || [card.title, card.description, card.hero, card.map, card.timestamp, card.author, ...(card.tags || [])].join(' ').toLowerCase().includes(query);
      return matchText && (selectedTag === 'ALL' || card.tags.includes(selectedTag));
    });
    $('lore-grid').innerHTML = filtered.map((card) => { const source = safeSourceUrl(card.clipUrl); return `<article class="lore-card ${card.id === state.featuredId ? 'featured' : ''}">${card.snapshot ? `<img class="lore-snapshot" src="${card.snapshot}" alt="Captured game screen">` : ''}<div class="lore-card-top"><span class="lore-kicker">✦ CHANNEL LORE</span><span class="votes">${card.snapshot ? 'SCREEN CAPTURE' : 'PUBLIC SOURCE'}</span></div><h3>${esc(card.title)}</h3><p>${esc(card.description)}</p><div class="card-context">${card.hero && card.hero !== 'OVERWATCH' ? `<span>${esc(card.hero)}</span>` : ''}${card.map ? `<span>⌖ ${esc(card.map)}</span>` : ''}${card.timestamp ? `<span>◷ ${esc(card.timestamp)}</span>` : ''}${source ? `<a href="${esc(source)}" target="_blank" rel="noopener">OPEN SOURCE ↗</a>` : ''}</div><div class="lore-card-bottom"><div class="card-tags">${(card.tags || []).slice(0, 2).map((tag) => `<span class="card-tag">${esc(tag)}</span>`).join('')}</div><div class="card-actions"><button class="feature-button" data-action="edit-card" data-id="${esc(card.id)}">EDIT</button><button class="feature-button" data-action="feature" data-id="${esc(card.id)}">${card.id === state.featuredId ? 'ON STREAM ✓' : 'SHOW ↗'}</button></div></div></article>`; }).join('');
    $('archive-empty').classList.toggle('hidden', filtered.length > 0);
  };
  const renderPreview = () => {
    const card = state.cards.find((item) => item.id === state.featuredId);
    $('preview-card').classList.toggle('visible', !!card);
    $('overlay-status').textContent = card ? 'ON STREAM' : 'STANDBY';
    $('overlay-status').classList.toggle('active', !!card);
    $('featured-title').textContent = card ? card.title : 'No moment featured';
    $('hide-overlay').disabled = !card;
    $('hide-overlay').classList.toggle('disabled', !card);
    $('preview-card').innerHTML = card ? `${card.snapshot ? `<img class="preview-snapshot" src="${card.snapshot}" alt="Captured screen frame">` : ''}<div class="preview-card-label">✦ ${esc((card.tags || ['CHANNEL LORE'])[0])}</div><h3>${esc(card.title)}</h3><p>${esc(card.description)}</p><div class="preview-card-foot"><span>${esc(card.hero || 'OVERWATCH')}${card.map ? ` · ${esc(card.map)}` : ''}${card.timestamp ? ` · ${esc(card.timestamp)}` : ''}</span><span>${card.snapshot ? 'SCREEN CAPTURE' : 'PUBLIC SOURCE'}</span></div>` : '';
  };
  const renderRecap = () => {
    const leaders = [...state.cards].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 3);
    $('recap-chips').innerHTML = leaders.length ? leaders.map((card, i) => `<span class="recap-chip">${[card.snapshot ? '▧ SCREEN CAPTURE' : '✦ PUBLIC SOURCE', '⌁ GAME CONTEXT', '✦ CHANNEL LORE'][i] || '✦ CHANNEL LORE'}</span>`).join('') : '<span class="recap-chip">WAITING FOR CANON</span>';
  };
  const render = () => { renderStats(); renderQueue(); renderTags(); renderArchive(); renderPreview(); renderRecap(); persist(); };
  const openEditor = (nominationId, cardId) => {
    const nomination = state.pending.find((item) => item.id === nominationId);
    const existing = state.cards.find((item) => item.id === cardId);
    editorNominationId = nomination ? nomination.id : null;
    $('moment-editor').dataset.cardId = existing?.id || '';
    $('editor-eyebrow').textContent = nomination ? 'LOCAL SCREEN CAPTURE · REVIEW' : 'CHANNEL LORE · EDIT DETAILS';
    $('moment-editor-title').textContent = nomination ? 'Make this moment canon' : 'Edit lore card';
    $('editor-source').textContent = nomination ? `${nomination.author} nominated: “${nomination.text}”` : `Editing “${existing?.title || 'lore card'}”`;
    $('editor-title').value = existing?.title || (nomination?.source === 'screen' ? 'Uncaptioned screen moment' : makeTitle(nomination?.text || ''));
    $('editor-description').value = existing?.description || 'Describe what is visible in the captured frame. Add only context you can verify.';
    $('editor-hero').value = existing?.hero && existing.hero !== 'OVERWATCH' ? existing.hero : (/lucio|boop/i.test(nomination?.text || '') ? 'LUCIO' : /ana|nano/i.test(nomination?.text || '') ? 'ANA' : /tracer|pulse/i.test(nomination?.text || '') ? 'TRACER' : '');
    $('editor-map').value = existing?.map || '';
    $('editor-timestamp').value = existing?.timestamp || '';
    $('editor-clip').value = existing?.clipUrl || nomination?.sourceUrl || '';
    $('moment-editor').dataset.snapshot = nomination?.snapshot || existing?.snapshot || '';
    $('editor-tags').value = (existing?.tags || guessTags(nomination?.text || '')).join(', ');
    $('moment-editor-backdrop').classList.remove('hidden');
    $('editor-title').focus();
  };
  const closeEditor = () => $('moment-editor-backdrop').classList.add('hidden');
  $('moment-editor').addEventListener('submit', (event) => {
    event.preventDefault();
    const tags = $('editor-tags').value.split(',').map((tag) => tag.trim().toUpperCase()).filter(Boolean).slice(0, 4);
    const clipUrl = $('editor-clip').value.trim();
    if (clipUrl && !safeSourceUrl(clipUrl)) { toast('Source links must be YouTube or Twitch over HTTPS'); $('editor-clip').focus(); return; }
    const fields = { title: $('editor-title').value.trim(), description: $('editor-description').value.trim(), hero: $('editor-hero').value.trim().toUpperCase() || 'OVERWATCH', map: $('editor-map').value.trim(), timestamp: $('editor-timestamp').value.trim(), clipUrl, tags, snapshot: $('moment-editor').dataset.snapshot || '' };
    if (editorNominationId) {
      const index = state.pending.findIndex((item) => item.id === editorNominationId); if (index < 0) return closeEditor();
      const [nomination] = state.pending.splice(index, 1);
      const card = { id: `lore-${Date.now()}`, ...fields, votes: 0, author: nomination.author, createdAt: Date.now() };
      state.cards.unshift(card); state.featuredId = card.id;
      render(); toast('Saved, enriched, and featured on stream ✦');
    } else {
      const card = state.cards.find((item) => item.id === $('moment-editor').dataset.cardId);
      if (card) Object.assign(card, fields);
      render(); toast('Lore details updated');
    }
    closeEditor();
  });
  const showRecap = () => {
    const cards = [...state.cards].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);
    $('modal-lore-list').innerHTML = cards.length ? cards.map((card, i) => `<article class="modal-lore"><div class="modal-rank">0${i + 1}</div><div><h3>${esc(card.title)}</h3><p>${esc(card.description)} <span style="color:#d9afd0">· ${esc(card.hero || 'OVERWATCH')}${card.map ? ` · ${esc(card.map)}` : ''}</span></p></div></article>`).join('') : '<p>No saved moments yet. Share a screen and capture one.</p>';
    $('modal-backdrop').classList.remove('hidden');
  };
  const stopScreenShare = () => {
    if (screenStream) screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;
    $('screen-video').srcObject = null;
    $('screen-placeholder').classList.remove('hidden');
    $('screen-state').textContent = 'NOT SHARING';
    $('screen-state').classList.remove('active');
    $('share-screen').disabled = false;
    $('stop-screen').disabled = true;
    $('capture-moment').disabled = true;
    $('screen-note').textContent = 'For the demo, open the public Flats video in another tab, then share that tab here.';
  };
  $('share-screen').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) { toast('Screen sharing needs a secure browser page, such as localhost or HTTPS'); return; }
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 10 }, audio: false });
      $('screen-video').srcObject = screenStream;
      $('screen-placeholder').classList.add('hidden');
      $('screen-state').textContent = 'SCREEN CONNECTED';
      $('screen-state').classList.add('active');
      $('share-screen').disabled = true;
      $('stop-screen').disabled = false;
      $('capture-moment').disabled = false;
      $('screen-note').textContent = 'Sharing stays on this device. Pause on a moment, then capture a frame.';
      screenStream.getVideoTracks()[0].addEventListener('ended', stopScreenShare, { once: true });
    } catch (error) {
      if (error.name !== 'NotAllowedError') toast('Could not start screen sharing. Try localhost or HTTPS.');
    }
  });
  $('stop-screen').addEventListener('click', stopScreenShare);
  $('capture-moment').addEventListener('click', () => {
    const video = $('screen-video');
    if (!screenStream || !video.videoWidth || !video.videoHeight) { toast('Wait for the shared screen to appear, then capture'); return; }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 720 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL('image/jpeg', 0.72);
    state.pending.unshift({ id: `screen-${Date.now()}`, author: 'Local screen capture', text: 'Captured frame — add a title and describe the visible moment.', time: Date.now(), votes: 0, snapshot, source: 'screen' });
    render();
    document.getElementById('queue').scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast('Screen frame captured locally. Add the context in Review.');
  });
  $('search-input').addEventListener('input', renderArchive);
  document.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-jump]'); if (jump) { document.getElementById(jump.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const button = event.target.closest('[data-action]'); if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'approve') openEditor(id, null);
    if (action === 'reject') { state.pending = state.pending.filter((item) => item.id !== id); render(); toast('Capture dismissed'); }
    if (action === 'feature') { state.featuredId = id; render(); toast('Lore card is on the overlay'); }
    if (action === 'edit-card') openEditor(null, id);
    if (action === 'filter') { selectedTag = button.dataset.tag; renderTags(); renderArchive(); }
  });
  $('recap-button').addEventListener('click', showRecap);
  $('modal-close').addEventListener('click', () => $('modal-backdrop').classList.add('hidden'));
  $('modal-done').addEventListener('click', () => $('modal-backdrop').classList.add('hidden'));
  $('modal-backdrop').addEventListener('click', (event) => { if (event.target === $('modal-backdrop')) $('modal-backdrop').classList.add('hidden'); });
  $('editor-close').addEventListener('click', closeEditor);
  $('editor-cancel').addEventListener('click', closeEditor);
  $('moment-editor-backdrop').addEventListener('click', (event) => { if (event.target === $('moment-editor-backdrop')) closeEditor(); });
  $('hide-overlay').addEventListener('click', () => { state.featuredId = null; render(); toast('Overlay card hidden'); });
  $('reset-demo').addEventListener('click', () => { state = seed(); selectedTag = 'ALL'; $('search-input').value = ''; render(); toast('Demo reset to the starting moments'); });
  window.addEventListener('beforeunload', stopScreenShare);
  render();
})();
