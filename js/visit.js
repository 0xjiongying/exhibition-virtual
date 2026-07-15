// Proof of visit — localStorage keyed by wallet or anonymous id.

const ANON_KEY = 'hbh.anonId';
const PREFIX = 'hbh.visit.';

function anonId() {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function storageKey(address) {
  return PREFIX + (address || anonId());
}

function load(address) {
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) {
      return {
        works: {},
        heroFocused: false,
        exploreEntered: false,
        firstVisitAt: null,
        lastVisitAt: null,
        visitCount: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      works: {},
      heroFocused: false,
      exploreEntered: false,
      firstVisitAt: null,
      lastVisitAt: null,
      visitCount: 0,
    };
  }
}

function save(address, data) {
  localStorage.setItem(storageKey(address), JSON.stringify(data));
}

export function getVisitState(address) {
  const data = load(address);
  const uniqueWorks = Object.keys(data.works || {}).length;
  return { ...data, uniqueWorks, subjectKey: address || anonId() };
}

let sessionVisitCounted = false;

export function markExploreEntered(address) {
  const data = load(address);
  const now = new Date().toISOString();
  if (!data.firstVisitAt) data.firstVisitAt = now;
  data.lastVisitAt = now;
  data.exploreEntered = true;
  // Count at most one explore entry per page load (mode toggles shouldn't inflate visits).
  if (!sessionVisitCounted) {
    data.visitCount = (data.visitCount || 0) + 1;
    sessionVisitCounted = true;
  }
  save(address, data);
  return getVisitState(address);
}

export function recordArtworkFocus(address, artwork, index) {
  if (!artwork?.data) return getVisitState(address);
  const data = load(address);
  const now = new Date().toISOString();
  if (!data.firstVisitAt) data.firstVisitAt = now;
  data.lastVisitAt = now;
  const key = artwork.data.src || artwork.data.title || String(index);
  data.works = data.works || {};
  data.works[key] = {
    title: artwork.data.title,
    at: now,
    index,
    hero: !!artwork.data._hero || index === 10,
  };
  // Hero slot is last in SLOTS (index 10) or flagged
  if (artwork.data._hero || /feast among friends/i.test(artwork.data.title || '')) {
    data.heroFocused = true;
  }
  save(address, data);
  return getVisitState(address);
}

export function isEligible(badge, visit, walletConnected) {
  const req = badge.requires || {};
  if (req.always) return true;
  if (req.walletConnected && !walletConnected) return false;
  if (typeof req.uniqueWorks === 'number' && visit.uniqueWorks < req.uniqueWorks) return false;
  if (req.heroFocus && !visit.heroFocused) return false;
  return true;
}

export function getAnonId() {
  return anonId();
}
