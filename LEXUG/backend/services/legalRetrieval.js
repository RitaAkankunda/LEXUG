const fs = require('fs');
const path = require('path');
const { embed } = require('./embeddings');

const INDEX_FILE = path.join(__dirname, '..', 'data', 'law-index.json');

let indexCache = null;
function loadIndex() {
  if (!indexCache) {
    if (!fs.existsSync(INDEX_FILE)) {
      throw new Error(
        'data/law-index.json not found. Run `node scripts/buildLawIndex.js` first.'
      );
    }
    indexCache = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  }
  return indexCache;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function retrieveRelevantSections(question, topK = 4) {
  const index = loadIndex();
  const queryEmbedding = await embed(question, { isQuery: true });

  const scored = index.map((entry) => ({
    entry,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ entry, score }) => ({
    act: entry.act,
    section: entry.section,
    title: entry.title,
    text: entry.text,
    sourceUrl: entry.sourceUrl,
    score,
  }));
}

module.exports = { retrieveRelevantSections };
