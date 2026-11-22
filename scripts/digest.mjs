// Usage: node scripts/digest.mjs <id> [charsPerPage=1400] [pagesCsv]
// Compact, text-first view of a survey for evaluation. Prints nav map summary, then per page: kind, url, headings, price points, text head.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const [id, chars = '1400', only] = process.argv.slice(2);
const e = JSON.parse(fs.readFileSync(path.join(root, 'data/experiences', id + '.json'), 'utf8'));
const want = only ? new Set(only.split(',').map(Number)) : null;
console.log(`# ${e.name} (${e.steps.length} pages, ${e.surveyMode}) stack=${JSON.stringify(e.stack)}`);
const byKind = {};
for (const l of e.navMap ?? []) (byKind[l.kind] ??= []).push(l.label);
for (const [k, v] of Object.entries(byKind)) console.log(`nav/${k}: ${[...new Set(v)].slice(0, 14).join(' | ')}`);
for (const s of e.steps) {
  if (want && !want.has(s.n)) continue;
  let t = fs.readFileSync(path.join(root, s.textFile), 'utf8').split('\n\n').slice(1).join('\n\n').replace(/\n+/g, ' ¶ ');
  console.log(`\n## [${s.n}] ${s.kind} ${s.url} (${s.via})`);
  console.log('H:', s.headings.slice(0, 10).join(' / '));
  const g = s.signals?.design, m = s.signals?.merch;
  if (g) console.log(`DESIGN: font ${g.fonts?.h1}/${g.fonts?.body} | h1 ${g.h1Px}px body ${g.bodyPx}px | bg ${(g.backgrounds ?? []).join(' ')} | accent ${(g.accents ?? []).join(' ') || '-'} | btn r=${g.buttonRadius} h=${g.buttonHeightPx} | img ${g.images} vid ${g.videos} svg ${g.svgs} | sticky ${g.stickyHeader} | page ${g.pageHeightPx}px`);
  if (m && (m.planCards || m.badges?.length || m.billingToggles?.length || m.tables || m.promos?.length)) console.log(`MERCH: planCards ${m.planCards} badges [${(m.badges ?? []).join(', ')}] toggles [${(m.billingToggles ?? []).join(', ')}] tables ${m.tables} promos [${(m.promos ?? []).slice(0, 3).join(' | ')}]`);
  if (s.prices.length) console.log('$:', [...new Set(s.prices.map((p) => p.replace(/\s+/g, ' ')))].filter((p, i, a) => !a.slice(0, i).some((q) => q.includes(p.slice(20, 40)))).slice(0, 6).join(' || '));
  console.log('T:', t.slice(0, Number(chars)));
}
