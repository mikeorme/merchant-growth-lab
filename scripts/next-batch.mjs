// Usage: node scripts/next-batch.mjs [batchSize=5]
// Picks today's featured specimen (news-driven first, else next in the queue) plus a small backlog batch.
// Prints JSON. Capture itself is a plain script (no model tokens); only evaluation costs tokens.
import fs from 'node:fs';
const corpus = JSON.parse(fs.readFileSync(new URL('../data/corpus.json', import.meta.url), 'utf8'));
const size = Math.min(Number(process.argv[2] ?? 5), 10);
const todo = corpus.items.filter((i) => i.status === 'backlog' && !['http-404','http-410'].includes(i.urlVerified)).sort((a, b) => (b.source === 'news') - (a.source === 'news') || a.priority - b.priority);
const [featured, ...rest] = todo;
console.log(JSON.stringify({ featured: featured?.id ?? null, batch: rest.slice(0, size).map((i) => i.id), remaining: todo.length - 1 - Math.min(size, rest.length) }, null, 1));
