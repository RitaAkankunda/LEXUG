const axios = require('axios');
const { retrieveRelevantSections } = require('./legalRetrieval');

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Gemini has a genuinely free tier (no billing required), Claude does not -
// so prefer Gemini when both are configured. Either can be removed from
// .env independently; the app falls through to demo mode if neither is set.
const PROVIDER = GEMINI_API_KEY ? 'gemini' : CLAUDE_API_KEY ? 'claude' : 'demo';

// Below this cosine similarity, a retrieved section is treated as unrelated
// noise rather than a real match (the corpus is small and topic-limited, so
// forcing a topK match on an unrelated question would fabricate relevance).
// Calibrated against bge-small-en-v1.5 over the combined Employment Act +
// Constitution corpus: off-topic questions top out ~0.52 (lexical overlap
// like "weather" <-> Article 39 "clean and healthy environment" is the
// worst offender), on-topic questions start ~0.56 - 0.53 sits in that gap.
// This is a coarse recall/precision tradeoff, not a hard guarantee: some
// genuine matches with weak lexical overlap (e.g. a plainly-worded arrest
// question that doesn't score highly against Article 23) will fall below
// this bar and correctly report "no source found" rather than guess wrong.
const RELEVANCE_THRESHOLD = 0.53;

function isChatMessage(message) {
  return (
    message &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
}

function getLatestQuestion(messages) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return latestUserMessage?.content || '';
}

// The Constitution is cited by "Article", every other Act by "Section" - and
// since section numbers aren't unique across Acts (Employment Act Section 23
// and Constitution Article 23 are unrelated), citations must always pair the
// Act name with the correctly-labelled unit, never the number alone.
function citationUnit(act) {
  return act.startsWith('Constitution') ? 'Article' : 'Section';
}

function formatCitation(s) {
  return `${s.act}, ${citationUnit(s.act)} ${s.section} (${s.title})`;
}

// Source text is one dense paragraph with inline "(1) ... (2) ... (3)"
// clause markers. Splitting on a sentence boundary immediately before each
// top-level "(N)" marker (not sub-clause letters like "(a)") turns it into
// a readable list without altering a single word of the actual law text.
function formatLawText(text) {
  const parts = text.split(/(?<=[.;])\s+(?=\(\d+\)\s)/);
  return parts.length > 1 ? parts.map((p) => p.trim()).join('\n\n') : text;
}

function buildGroundedSystemPrompt(sections) {
  if (sections.length === 0) {
    return [
      'You are LexUg, a civic-education assistant for Ugandan law. You are not a lawyer and this is not legal advice.',
      'No matching section of Ugandan law was found in the knowledge base for this question.',
      'Say clearly that you do not have a verified source covering this specific question, and recommend the user consult a qualified Ugandan lawyer or the relevant government office.',
      'Do not answer from general knowledge and do not invent section numbers or citations.',
    ].join(' ');
  }

  const sourceBlocks = sections
    .map((s) => `[${formatCitation(s)}]\n${s.text}`)
    .join('\n\n');

  return [
    "You are LexUg, a civic-education assistant for Ugandan law. You are not a lawyer and this is not legal advice.",
    "Answer the user's question in clear, plain language, using ONLY the law sections provided below.",
    'Some of the sources below may not actually be relevant to this specific question - they were retrieved by similarity search, not guaranteed relevance. Use your own judgement: only cite a source if it genuinely supports your answer. Ignore sources that do not fit.',
    'Every factual claim about the law must be traceable to one of the provided sources you actually used. Cite it inline exactly as labelled, for example "Employment Act, 2006, Section 58" or "Constitution of the Republic of Uganda, Article 23".',
    'If none of the provided sources fully answer the question, say so explicitly rather than filling the gap from general knowledge or citing a weak match.',
    'Always end with a reminder to consult a qualified Ugandan lawyer for their specific situation.',
    '',
    'SOURCES:',
    sourceBlocks,
  ].join('\n');
}

// The retrieval step over-fetches (it's similarity search, not a relevance
// judge), so the UI's citation list should reflect what the model actually
// cited in its answer, not everything that scored above the threshold.
function citationsMentionedIn(text, sections) {
  return sections.filter((s) => text.includes(`${s.act}, ${citationUnit(s.act)} ${s.section}`));
}

async function callClaude(system, safeMessages) {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      system,
      messages: safeMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    },
    {
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
      },
      timeout: 30000,
    }
  );

  const text = (response.data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  return { text, model: response.data.model || ANTHROPIC_MODEL };
}

async function callGemini(system, safeMessages) {
  // Gemini has no "assistant" role - it calls the model's own turns "model".
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: safeMessages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
    },
    {
      headers: { 'content-type': 'application/json' },
      timeout: 30000,
    }
  );

  const parts = response.data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || '').join('');

  return { text, model: GEMINI_MODEL };
}

async function getChatAnswer(messages) {
  const safeMessages = messages.filter(isChatMessage);
  const question = getLatestQuestion(safeMessages);

  // Fetch a wider candidate pool than we expect to use - the true best
  // match for a query is not always in the top few by raw cosine score
  // (e.g. the most legally precise section for an eviction question has
  // ranked as low as 6th/7th in testing). The relevance threshold below,
  // plus the model's own judgement in the real-answer path, filters this
  // down; a small topK here would silently exclude the right answer.
  const retrieved = await retrieveRelevantSections(question, 8);
  const sections = retrieved.filter((s) => s.score >= RELEVANCE_THRESHOLD);
  const system = buildGroundedSystemPrompt(sections);

  if (PROVIDER === 'demo') {
    // No LLM available to judge relevance or paraphrase, so demo mode only
    // ever trusts the single best match - but it should still surface the
    // actual verbatim law text, not just a citation pointer with nothing to
    // read. This is real legal text, unedited, not a plain-language
    // explanation of it (that needs the LLM path), so say so.
    const top = sections[0];
    const citation = top ? formatCitation(top) : null;
    const body = top ? formatLawText(top.text) : null;
    const note = top
      ? 'Demo mode: this is the exact text of the closest matching law, not a plain-language explanation. This is not legal advice - consult a qualified Ugandan lawyer for your specific situation.'
      : 'No matching section of Ugandan law was found for this question. (Demo mode: no AI key configured.)';

    // content/text stays as a single flat string too, so any client that
    // hasn't adopted the structured fields yet still renders something sane.
    const text = [citation, citation && '', body, body && '', note].filter((line) => line !== null).join('\n');

    return {
      content: [{ type: 'text', text }],
      model: 'lexug-demo',
      source: 'demo',
      sources: top ? [top].map(({ act, section, title, sourceUrl }) => ({ act, section, title, sourceUrl })) : [],
      isDemo: true,
      citation,
      body,
      note,
    };
  }

  const { text: answerText, model } =
    PROVIDER === 'gemini' ? await callGemini(system, safeMessages) : await callClaude(system, safeMessages);

  const citedSections = citationsMentionedIn(answerText, sections);

  return {
    content: [{ type: 'text', text: answerText }],
    model,
    source: PROVIDER,
    sources: citedSections.map(({ act, section, title, sourceUrl }) => ({ act, section, title, sourceUrl })),
    isDemo: false,
    citation: null,
    body: null,
    note: null,
  };
}

module.exports = {
  getChatAnswer,
  isChatMessage,
  activeProvider: PROVIDER,
  activeModel: PROVIDER === 'gemini' ? GEMINI_MODEL : PROVIDER === 'claude' ? ANTHROPIC_MODEL : 'lexug-demo',
};
