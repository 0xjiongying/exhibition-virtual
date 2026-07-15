// Boots the Phase 1 museum product layer without replacing the film/explore loop.

import { mountMuseumChrome, togglePanel, closePanels, renderPassport, renderSession, appendCurator, renderDiscoverList, renderDiscoverChips } from './museum-ui.js';
import { connectWallet, disconnectWallet, getWalletState, onWalletChange } from './wallet.js';
import { getVisitState, markExploreEntered, recordArtworkFocus } from './visit.js';
import { getPassportView, claimBadge } from './passport.js';
import { buildKnowledgeBase, askCurator } from './curator-ai.js';
import { applyDiscovery, clearDiscovery, discoveryTagsFrom } from './discovery.js';
import { startSession, trackMode, trackArtworkView, markCompletion, getSessionMetrics, exportSessionJson } from './analytics.js';

async function loadJson(url, fallback) {
  try {
    const r = await fetch(url);
    if (!r.ok) return fallback;
    return await r.json();
  } catch {
    return fallback;
  }
}

function refreshWalletButton() {
  const btn = document.getElementById('btnWallet');
  if (!btn) return;
  const w = getWalletState();
  btn.textContent = w.connected ? w.truncated : 'Wallet';
  btn.classList.toggle('active', w.connected);
  btn.title = w.connected ? 'Disconnect wallet' : 'Connect wallet';
}

function refreshPassport(badges) {
  const view = getPassportView(badges);
  renderPassport(view);
  renderSession(getSessionMetrics());
  if (view.visit.uniqueWorks >= 5 && view.visit.heroFocused) markCompletion(true);
}

export async function bootMuseumProduct(api) {
  const [exhibition, badgesDoc, notes, artworksRaw] = await Promise.all([
    loadJson('assets/exhibition.json', {}),
    loadJson('assets/badges.json', { badges: [] }),
    loadJson('assets/curator-notes.json', { notes: [] }),
    loadJson('assets/artworks.json', []),
  ]);

  const badges = badgesDoc.badges || [];
  const kb = buildKnowledgeBase({ exhibition, artworks: artworksRaw, notes });

  mountMuseumChrome();
  startSession();
  refreshWalletButton();
  refreshPassport(badges);

  // Copyright line from exhibition.json when present
  const foot = document.getElementById('copyrightPlate');
  if (foot && exhibition.copyright?.notice) {
    foot.querySelector('span').textContent = exhibition.copyright.notice;
  }

  const tags = discoveryTagsFrom(artworksRaw);
  let activeTag = '';
  let discoverQ = '';

  function runDiscovery() {
    const runtime = api?.artworks || [];
    const items = applyDiscovery(api, runtime.length ? runtime : artworksRaw.map((d) => ({ data: d })), {
      tag: activeTag,
      q: discoverQ,
    });
    renderDiscoverList(items, (index) => {
      api?.approachArtwork?.(index);
    });
    renderDiscoverChips(tags, activeTag || 'All', (tag) => {
      activeTag = tag;
      runDiscovery();
    });
  }

  document.getElementById('btnWallet')?.addEventListener('click', async () => {
    const w = getWalletState();
    if (w.connected) {
      disconnectWallet();
      refreshWalletButton();
      refreshPassport(badges);
      return;
    }
    const result = await connectWallet(exhibition.chain || {});
    if (!result.ok) {
      appendCurator('system', result.error || 'Wallet unavailable — continue as guest; badges can still be demo-claimed.');
      togglePanel('panelCurator');
    }
    refreshWalletButton();
    refreshPassport(badges);
  });

  document.getElementById('btnPassport')?.addEventListener('click', () => {
    refreshPassport(badges);
    togglePanel('panelPassport');
  });
  document.getElementById('btnCurator')?.addEventListener('click', () => togglePanel('panelCurator'));
  document.getElementById('btnDiscover')?.addEventListener('click', () => {
    runDiscovery();
    togglePanel('panelDiscover');
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      const panel = document.getElementById(id);
      if (panel) panel.hidden = true;
    });
  });

  document.getElementById('panelPassport')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-claim]');
    if (!btn || btn.disabled) return;
    const key = btn.getAttribute('data-claim');
    const badge = badges.find((b) => b.key === key);
    if (!badge) return;
    const result = await claimBadge(badge, exhibition);
    refreshPassport(badges);
    if (result.ok) {
      btn.textContent = result.mode === 'demo' ? 'Demo claimed' : 'Claimed';
    } else {
      alert(result.error || 'Could not claim.');
    }
  });

  document.getElementById('btnExportSession')?.addEventListener('click', () => {
    const blob = new Blob([exportSessionJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hand-by-hand-session.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const ask = (q) => {
    const { answer, sources } = askCurator(kb, q);
    appendCurator('user', q);
    appendCurator('curator', answer, sources);
  };

  document.getElementById('curatorForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('curatorInput');
    const q = input?.value?.trim();
    if (!q) return;
    ask(q);
    input.value = '';
  });

  document.getElementById('curatorChips')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-q]');
    if (!btn) return;
    ask(btn.getAttribute('data-q'));
  });

  document.getElementById('discoverInput')?.addEventListener('input', (e) => {
    discoverQ = e.target.value || '';
    runDiscovery();
  });

  onWalletChange(() => {
    refreshWalletButton();
    refreshPassport(badges);
  });

  // Bridge events from main.js
  window.addEventListener('hbh:mode', (e) => {
    const mode = e.detail?.mode;
    trackMode(mode);
    if (mode === 'explore') {
      markExploreEntered(getWalletState().address);
      refreshPassport(badges);
    }
  });

  window.addEventListener('hbh:focus', (e) => {
    const { art, index } = e.detail || {};
    if (!art) return;
    const addr = getWalletState().address;
    recordArtworkFocus(addr, art, index);
    trackArtworkView(art.data?.title);
    const visit = getVisitState(addr);
    if (visit.uniqueWorks >= 5 && visit.heroFocused) markCompletion(true);
    refreshPassport(badges);
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closePanels();
  });

  // Gentle intro line once
  appendCurator(
    'curator',
    `Welcome to ${exhibition.name || 'Hand by Hand'}. I answer only from the exhibition records — wall labels, identity, and curated notes.`,
    ['exhibition.json'],
  );

  console.info('[museum] Phase 1 product layer ready', {
    demo: !exhibition.contracts?.VisitorBadges,
    version: exhibition.version,
  });
}
