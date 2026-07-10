const fs = require('fs');
const path = require('path');
const { embed } = require('../services/embeddings');

const LAWS_DIR = path.join(__dirname, '..', 'data', 'laws');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'law-index.json');

async function main() {
  const files = fs
    .readdirSync(LAWS_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

  if (files.length === 0) {
    console.error(`No law corpus files found in ${LAWS_DIR}`);
    process.exit(1);
  }

  const index = [];

  for (const file of files) {
    const sections = JSON.parse(fs.readFileSync(path.join(LAWS_DIR, file), 'utf8'));
    for (const section of sections) {
      const embedding = await embed(
        `${section.act}, Section ${section.section}: ${section.title}. ${section.text}`
      );
      index.push({
        id: `${section.act}::${section.section}`,
        act: section.act,
        section: section.section,
        title: section.title,
        text: section.text,
        sourceUrl: section.sourceUrl,
        embedding,
      });
      console.log(`Embedded ${section.act} - Section ${section.section} (${section.title})`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index));
  console.log(`\nWrote ${index.length} entries to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Failed to build law index:', error);
  process.exit(1);
});
