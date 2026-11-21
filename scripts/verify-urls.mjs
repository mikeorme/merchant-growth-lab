import fs from 'node:fs';
const p = new URL('../data/corpus.json', import.meta.url);
const corpus = JSON.parse(fs.readFileSync(p, 'utf8'));
const ua = 'Mozilla/5.0 (compatible; MerchantGrowthLab/1.0; research)';
async function check(it) {
  try {
    const r = await fetch(it.url, { redirect: 'follow', headers: { 'user-agent': ua }, signal: AbortSignal.timeout(15000) });
    it.urlVerified = r.ok ? 'ok' : `http-${r.status}`;
    it.finalUrl = r.url;
  } catch (e) { it.urlVerified = 'error'; }
}
const q = [...corpus.items];
await Promise.all(Array.from({ length: 8 }, async () => { while (q.length) await check(q.shift()); }));
fs.writeFileSync(p, JSON.stringify(corpus, null, 2));
const bad = corpus.items.filter((i) => i.urlVerified !== 'ok');
console.log('ok', corpus.items.length - bad.length, 'not ok', bad.length);
for (const b of bad) console.log(b.id, b.urlVerified, b.url);
