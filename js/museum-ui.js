// Smoked-glass museum product UI — passport, curator, discovery, session.

export function mountMuseumChrome() {
  if (document.getElementById('museumProduct')) return document.getElementById('museumProduct');

  const root = document.createElement('div');
  root.id = 'museumProduct';
  root.innerHTML = `
    <button type="button" id="btnWallet" class="mp-btn" title="Connect wallet">Wallet</button>
    <button type="button" id="btnPassport" class="mp-btn" title="Visitor passport">Passport</button>
    <button type="button" id="btnCurator" class="mp-btn" title="AI Curator">Curator</button>
    <button type="button" id="btnDiscover" class="mp-btn" title="Discover works">Discover</button>

    <footer id="copyrightPlate" class="mp-footer">
      <span>Works on view are attributed for exhibition viewing only — they are not tokenized.</span>
    </footer>

    <aside id="panelPassport" class="mp-panel" role="dialog" aria-label="Visitor passport" hidden>
      <header class="mp-panel-h">
        <h3>Visitor Passport</h3>
        <button type="button" class="mp-close" data-close="panelPassport" aria-label="Close">×</button>
      </header>
      <p class="mp-muted" id="passportAddr">Not connected — exploring as guest</p>
      <div class="mp-block">
        <h4>Visits</h4>
        <p id="passportVisits" class="mp-body">—</p>
      </div>
      <div class="mp-block">
        <h4>Badges</h4>
        <ul id="passportBadges" class="mp-list"></ul>
      </div>
      <div class="mp-block mp-advanced">
        <h4>Session <span class="mp-pill">local</span></h4>
        <p id="sessionReadout" class="mp-body">—</p>
        <button type="button" id="btnExportSession" class="mp-btn mp-btn-inline">Export JSON</button>
      </div>
      <p class="mp-fine" id="passportNote" aria-live="polite">Demo mode stores claims on this device until contracts are deployed on Monad.</p>
    </aside>

    <aside id="panelCurator" class="mp-panel" role="dialog" aria-label="AI curator" hidden>
      <header class="mp-panel-h">
        <h3>AI Curator</h3>
        <button type="button" class="mp-close" data-close="panelCurator" aria-label="Close">×</button>
      </header>
      <p class="mp-muted">Answers only from exhibition records. If it is not documented, the curator will say so.</p>
      <div id="curatorLog" class="mp-log" aria-live="polite"></div>
      <form id="curatorForm" class="mp-form">
        <input id="curatorInput" type="text" autocomplete="off" placeholder="Ask about a work, the theme, or copyright…" />
        <button type="submit" class="mp-btn mp-btn-inline">Ask</button>
      </form>
      <div class="mp-chips" id="curatorChips">
        <button type="button" data-q="What does the Exhibition NFT represent?">Exhibition NFT</button>
        <button type="button" data-q="What is the copyright posture?">Copyright</button>
        <button type="button" data-q="Tell me about the hero wall">Hero wall</button>
        <button type="button" data-q="How do Film and Explore work?">Modes</button>
      </div>
    </aside>

    <aside id="panelDiscover" class="mp-panel" role="dialog" aria-label="Discover artworks" hidden>
      <header class="mp-panel-h">
        <h3>Discover</h3>
        <button type="button" class="mp-close" data-close="panelDiscover" aria-label="Close">×</button>
      </header>
      <p class="mp-muted">Filter highlights walls gently. Art stays in the hall.</p>
      <input id="discoverInput" type="search" placeholder="Search titles, artists, tags…" class="mp-search" />
      <div class="mp-chips" id="discoverChips"></div>
      <ul id="discoverList" class="mp-list mp-navlist"></ul>
    </aside>
  `;

  // Place wallet/passport near existing controls via a strip above #controls
  const strip = document.createElement('div');
  strip.id = 'productControls';
  strip.append(
    root.querySelector('#btnWallet'),
    root.querySelector('#btnPassport'),
    root.querySelector('#btnCurator'),
    root.querySelector('#btnDiscover'),
  );

  const controls = document.getElementById('controls');
  if (controls?.parentNode) {
    controls.parentNode.insertBefore(strip, controls);
  } else {
    document.body.appendChild(strip);
  }

  document.body.appendChild(root.querySelector('#copyrightPlate'));
  document.body.appendChild(root.querySelector('#panelPassport'));
  document.body.appendChild(root.querySelector('#panelCurator'));
  document.body.appendChild(root.querySelector('#panelDiscover'));
  // leftover empty root not needed
  root.remove();

  return {
    btnWallet: document.getElementById('btnWallet'),
    btnPassport: document.getElementById('btnPassport'),
    btnCurator: document.getElementById('btnCurator'),
    btnDiscover: document.getElementById('btnDiscover'),
    panelPassport: document.getElementById('panelPassport'),
    panelCurator: document.getElementById('panelCurator'),
    panelDiscover: document.getElementById('panelDiscover'),
  };
}

export function openPanel(id) {
  for (const el of document.querySelectorAll('.mp-panel')) {
    el.hidden = el.id !== id ? true : false;
  }
  // if toggling same, allow close via caller
}

export function closePanels() {
  for (const el of document.querySelectorAll('.mp-panel')) el.hidden = true;
}

export function togglePanel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const opening = el.hidden;
  closePanels();
  el.hidden = !opening;
}

export function renderPassport(view) {
  const addr = document.getElementById('passportAddr');
  const visits = document.getElementById('passportVisits');
  const list = document.getElementById('passportBadges');
  if (!addr || !visits || !list) return;

  addr.textContent = view.connected
    ? `Wallet ${view.truncated}`
    : `Guest · ${String(view.visit.subjectKey || '').slice(0, 18)}…`;

  visits.textContent =
    `${view.visit.uniqueWorks} works approached · ` +
    `${view.visit.visitCount || 0} explore entries` +
    (view.visit.heroFocused ? ' · hero visited' : '');

  list.innerHTML = '';
  for (const b of view.badges) {
    const li = document.createElement('li');
    li.className = 'mp-badge';
    const status = b.claimed
      ? b.claimMode === 'demo'
        ? 'Demo claimed'
        : 'Claimed'
      : b.eligible
        ? 'Ready'
        : 'Locked';
    // badge catalog is data, not markup — escape everything, constrain the key
    const safeKey = String(b.key || '').replace(/[^\w-]/g, '');
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(b.name)}</strong>
        <span class="mp-muted">${escapeHtml(b.description)}</span>
      </div>
      <button type="button" class="mp-btn mp-btn-inline" data-claim="${safeKey}" ${b.claimed || !b.eligible ? 'disabled' : ''}>${status}</button>
    `;
    list.appendChild(li);
  }
}

// quiet inline feedback in the passport panel — never a blocking dialog
let noteTimer = null;
export function showPassportNote(message) {
  const el = document.getElementById('passportNote');
  if (!el) return;
  if (!el.dataset.defaultText) el.dataset.defaultText = el.textContent;
  el.textContent = message;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => { el.textContent = el.dataset.defaultText; }, 6000);
}

export function renderSession(metrics) {
  const el = document.getElementById('sessionReadout');
  if (!el) return;
  el.textContent =
    `${metrics.sessionLengthSec}s · ${metrics.uniqueArtworks} unique works · ` +
    `completion ${metrics.completion ? 'yes' : 'no'} · film×${metrics.modes?.film || 0} explore×${metrics.modes?.explore || 0}`;
}

export function appendCurator(role, text, sources = []) {
  const log = document.getElementById('curatorLog');
  if (!log) return;
  const div = document.createElement('div');
  div.className = `mp-msg mp-${role}`;
  div.innerHTML = `<p>${escapeHtml(text)}</p>${
    sources.length ? `<small class="mp-muted">Sources: ${sources.map(escapeHtml).join(', ')}</small>` : ''
  }`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

export function renderDiscoverList(items, onFocus) {
  const list = document.getElementById('discoverList');
  if (!list) return;
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = '<li class="mp-muted">No matches — clear filters to see all walls.</li>';
    return;
  }
  for (const item of items) {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="mp-link"><strong>${escapeHtml(item.title)}</strong><span class="mp-muted">${escapeHtml(item.artist)}</span></button>`;
    li.querySelector('button').addEventListener('click', () => onFocus(item.index));
    list.appendChild(li);
  }
}

export function renderDiscoverChips(tags, active, onPick) {
  const wrap = document.getElementById('discoverChips');
  if (!wrap) return;
  wrap.innerHTML = '';
  const all = ['All', ...tags];
  for (const tag of all) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tag;
    const isActive = (tag === 'All' && (!active || active === 'All')) || tag === active;
    if (isActive) btn.classList.add('active');
    btn.addEventListener('click', () => onPick(tag === 'All' ? '' : tag));
    wrap.appendChild(btn);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
