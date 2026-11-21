// Usage: node scripts/add-news.mjs "<name>" "<url>" "<category>" "<flow>" "<why>"
// Adds a news-driven candidate to the front of the queue. Dedupes by id and URL host+path.
import fs from 'node:fs';
const [name, url, category, flow, why] = process.argv.slice(2);
if (!name || !url) { console.error('need name and url'); process.exit(1); }
const p = new URL('../data/corpus.json', import.meta.url);
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
if (c.items.some((i) => i.id === id || norm(i.url) === norm(url))) { console.log('exists', id); process.exit(0); }
c.items.push({ id, name, category: category || 'ai-for-merchants', url, flow: flow || 'get started path', priority: 0, status: 'backlog', urlVerified: null, source: 'news', why: why || '', addedAt: new Date().toISOString().slice(0, 10) });
fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('added', id);
