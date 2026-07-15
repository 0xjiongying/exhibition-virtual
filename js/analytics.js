// Privacy-preserving creator analytics — local only, no third-party trackers.

const SESSION_KEY = 'hbh.analytics.session';
const HISTORY_KEY = 'hbh.analytics.history';

function now() {
  return Date.now();
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(s) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function startSession() {
  const existing = loadSession();
  if (existing && !existing.endedAt) return existing;
  const session = {
    id: crypto.randomUUID?.() || `s_${now()}`,
    startedAt: new Date().toISOString(),
    startedMs: now(),
    endedAt: null,
    artworksViewed: [],
    uniqueTitles: [],
    modes: { film: 0, explore: 0 },
    completion: false,
  };
  saveSession(session);
  return session;
}

export function trackMode(mode) {
  const s = loadSession() || startSession();
  if (mode === 'film' || mode === 'explore') s.modes[mode] = (s.modes[mode] || 0) + 1;
  saveSession(s);
}

export function trackArtworkView(title) {
  const s = loadSession() || startSession();
  s.artworksViewed.push({ title, at: new Date().toISOString() });
  if (title && !s.uniqueTitles.includes(title)) s.uniqueTitles.push(title);
  saveSession(s);
}

export function markCompletion(done = true) {
  const s = loadSession() || startSession();
  s.completion = !!done;
  saveSession(s);
}

export function getSessionMetrics() {
  const s = loadSession() || startSession();
  const lengthMs = now() - (s.startedMs || now());
  return {
    ...s,
    sessionLengthMs: lengthMs,
    sessionLengthSec: Math.round(lengthMs / 1000),
    artworksViewedCount: (s.artworksViewed || []).length,
    uniqueArtworks: (s.uniqueTitles || []).length,
  };
}

export function exportSessionJson() {
  const metrics = getSessionMetrics();
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  return JSON.stringify({ current: metrics, history }, null, 2);
}

export function archiveSession() {
  const s = loadSession();
  if (!s) return;
  s.endedAt = new Date().toISOString();
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  history.push({ ...s, sessionLengthMs: now() - (s.startedMs || now()) });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-40)));
  localStorage.removeItem(SESSION_KEY);
}
