const { pipeline } = require('@xenova/transformers');

const MODEL = 'Xenova/bge-small-en-v1.5';
// BGE models are trained asymmetrically: queries need this instruction
// prefix for retrieval to work well, passages/documents do not.
const QUERY_INSTRUCTION = 'Represent this sentence for searching relevant passages: ';

let embedderPromise = null;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', MODEL);
  }
  return embedderPromise;
}

async function embed(text, { isQuery = false } = {}) {
  const embedder = await getEmbedder();
  const input = isQuery ? QUERY_INSTRUCTION + text : text;
  const output = await embedder(input, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

module.exports = { embed };
