// Discovery — filter chips + plate list; highlight walls, do not remove art.

import { suggestDiscoveryTags } from './curator-ai.js';

let activeTag = '';
let query = '';
let highlightIds = new Set();

export function getDiscoveryState() {
  return { activeTag, query, highlightIds: [...highlightIds] };
}

export function matchArtworks(artworks, { tag = '', q = '' } = {}) {
  const t = tag.trim().toLowerCase();
  const needle = q.trim().toLowerCase();
  return (artworks || [])
    .map((a, index) => ({ art: a, index }))
    .filter(({ art }) => !!art)
    .filter(({ art }) => {
      const tags = (art.data?.tags || art.tags || []).map((x) => String(x).toLowerCase());
      const blob = [
        art.data?.title || art.title,
        art.data?.artist || art.artist,
        art.data?.description || art.description,
        tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (t && t !== 'all' && !tags.includes(t)) return false;
      if (needle && !blob.includes(needle)) return false;
      return true;
    });
}

export function applyDiscovery(api, artworks, { tag = '', q = '' } = {}) {
  activeTag = tag;
  query = q;
  const matched = matchArtworks(artworks, { tag, q });
  highlightIds = new Set(matched.map((m) => m.index));
  if (api?.setHighlights) api.setHighlights([...highlightIds]);
  return matched.map((m) => ({
    index: m.index,
    title: m.art.data?.title || m.art.title || 'Untitled',
    artist: m.art.data?.artist || m.art.artist || '',
    tags: m.art.data?.tags || m.art.tags || [],
  }));
}

export function clearDiscovery(api) {
  activeTag = '';
  query = '';
  highlightIds = new Set();
  if (api?.setHighlights) api.setHighlights([]);
}

export function discoveryTagsFrom(artworksList) {
  // artworksList may be raw JSON or runtime artworks with .data
  const raw = (artworksList || []).map((a) => a.data || a);
  return suggestDiscoveryTags(raw);
}
