// AI Curator — retrieval over local knowledge only. Never invents facts.

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Question scaffolding that must not count as a knowledge match —
// otherwise every English question weakly matches every entry and the
// honest "I do not have that" reply never fires.
const STOPWORDS = new Set([
  'the', 'and', 'was', 'were', 'what', 'when', 'where', 'which', 'who', 'why',
  'how', 'does', 'did', 'has', 'have', 'had', 'are', 'is', 'can', 'could',
  'would', 'should', 'will', 'may', 'might', 'been', 'being', 'this', 'that',
  'these', 'those', 'there', 'here', 'about', 'tell', 'show', 'please', 'you',
  'your', 'they', 'them', 'their', 'its', 'his', 'her', 'our', 'ours', 'mine',
  'with', 'from', 'for', 'into', 'onto', 'over', 'under', 'some', 'any', 'all',
]);

// Fold simple plurals so "artworks" matches "artwork" without letting
// substrings match ("mona" must not match "Monad").
function stem(w) {
  return w.length > 3 ? w.replace(/e?s$/, '') : w;
}

function scoreText(query, text) {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;
  const tWords = new Set(t.split(' ').map(stem));
  let score = 0;
  const words = q.split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w));
  for (const w of words) {
    if (tWords.has(stem(w))) score += 2;
  }
  if (words.length && t.includes(q)) score += 5;
  return score;
}

export function buildKnowledgeBase({ exhibition, artworks, notes }) {
  const entries = [];

  if (exhibition) {
    entries.push({
      source: 'exhibition.json',
      title: exhibition.name,
      text: [
        exhibition.name,
        exhibition.subtitle,
        exhibition.description,
        exhibition.theme,
        exhibition.creator,
        exhibition.curator,
        exhibition.copyright?.notice,
      ]
        .filter(Boolean)
        .join(' '),
      fact:
        `${exhibition.name}: ${exhibition.description} Creator: ${exhibition.creator}. Curator: ${exhibition.curator}. ` +
        (exhibition.copyright?.notice || ''),
    });
  }

  for (const note of notes?.notes || []) {
    entries.push({
      source: 'curator-notes.json',
      title: note.id,
      text: `${(note.topics || []).join(' ')} ${note.fact}`,
      fact: note.fact,
      topics: note.topics,
    });
  }

  for (const art of artworks || []) {
    if (!art?.title) continue;
    entries.push({
      source: 'artworks.json',
      title: art.title,
      text: [art.title, art.artist, art.year, art.description, ...(art.tags || [])].join(' '),
      fact: `${art.title}${art.artist ? ` by ${art.artist}` : ''}${art.year ? ` (${art.year})` : ''}. ${art.description || ''}`.trim(),
      tags: art.tags || [],
    });
  }

  return {
    entries,
    unknownReply:
      notes?.unknownReply ||
      'I do not have that in the exhibition knowledge base.',
  };
}

export function askCurator(kb, question) {
  const q = String(question || '').trim();
  if (!q) {
    return {
      answer: 'Ask about a wall label, the exhibition theme, copyright posture, or how visiting works.',
      sources: [],
    };
  }

  const scored = kb.entries
    .map((e) => ({ e, score: Math.max(scoreText(q, e.text), scoreText(q, (e.topics || []).join(' '))) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length || scored[0].score < 2) {
    return { answer: kb.unknownReply, sources: [] };
  }

  const top = scored.slice(0, 3).filter((x) => x.score >= scored[0].score - 2);
  const parts = top.map((x) => x.e.fact);
  const sources = [...new Set(top.map((x) => x.e.source))];

  return {
    answer: parts.join(' '),
    sources,
  };
}

export function suggestDiscoveryTags(artworks) {
  const set = new Set();
  for (const a of artworks || []) {
    for (const t of a.tags || []) set.add(t);
  }
  return [...set].sort();
}
