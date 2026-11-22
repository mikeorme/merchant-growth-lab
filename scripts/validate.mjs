import Ajv from 'ajv';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const rubric = readJson(path.join(root, 'data/rubric.json'));
const dims = new Set(rubric.lenses.flatMap((l) => l.dimensions.map((d) => d.id)));
const vExp = ajv.compile(readJson(path.join(root, 'data/schema/experience.schema.json')));
const vBrief = ajv.compile(readJson(path.join(root, 'data/schema/brief.schema.json')));

let bad = 0;
const fail = (m) => { console.error('FAIL', m); bad++; };
const ids = new Set();

for (const f of fs.existsSync(path.join(root, 'data/experiences')) ? fs.readdirSync(path.join(root, 'data/experiences')) : []) {
  if (!f.endsWith('.json')) continue;
  const p = path.join(root, 'data/experiences', f);
  const d = readJson(p);
  if (!vExp(d)) fail(`${f}: ${ajv.errorsText(vExp.errors)}`);
  ids.add(d.id);
  if (d.id + '.json' !== f) fail(`${f}: id mismatch`);
  const norm = (t) => t.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
  const pageText = {};
  for (const s of d.steps ?? []) {
    if (!fs.existsSync(path.join(root, 'site/public', s.screenshot))) fail(`${f}: missing screenshot ${s.screenshot}`);
    if (s.textFile) { const tp = path.join(root, s.textFile); if (!fs.existsSync(tp)) fail(`${f}: missing page text ${s.textFile}`); else pageText[s.n] = norm(fs.readFileSync(tp, 'utf8')); }
  }
  const nSteps = (d.steps ?? []).length;
  const quoteOk = (step, q) => pageText[step] && norm(q).length > 0 && pageText[step].includes(norm(q));
  for (const c of d.claims ?? []) {
    if (c.step > nSteps) fail(`${f}: claim step ${c.step} out of range`);
    else if (pageText[c.step] && !quoteOk(c.step, c.text)) fail(`${f}: claim not found verbatim on step ${c.step}: "${c.text.slice(0, 60)}"`);
  }
  // Site messaging carries no per-fact citations, so guard against invented specifics instead:
  // every price, percentage, count and colour in a summary, key point or table cell must appear in this site's saved text or signals.
  const stripC = (t) => t.toLowerCase().replace(/(\d),(?=\d{3})/g, '$1');
  const corpusText = stripC(Object.values(pageText).join(' ') + ' ' + JSON.stringify((d.steps ?? []).map((st) => st.signals ?? {})) + ' ' + JSON.stringify(d.navMap ?? []));
  const specifics = (t) => stripC(t).match(/[$€£]\d[\d]*(?:\.\d+)?|\d+(?:\.\d+)?(?:%|¢)|\d+\.\d+|\b\d{3,}\b|#[0-9a-f]{6}/g) ?? [];
  for (const sec of d.dossier?.sections ?? []) {
    const strings = [sec.summary, ...sec.keyPoints, ...(sec.table ? sec.table.rows.flat() : []), ...(sec.gaps ?? [])];
    for (const str of strings) for (const tok of specifics(str)) if (!corpusText.includes(tok)) fail(`${f}: dossier ${sec.id} cites "${tok}", not found in captured text or signals: "${str.slice(0, 70)}"`);
    if (sec.table) for (const r of sec.table.rows) if (r.length !== sec.table.columns.length) fail(`${f}: dossier ${sec.id} table row width mismatch`);
  }
  if (d.status === 'evaluated' && d.surveyMode === 'full' && !d.dossier) fail(`${f}: full survey evaluated without a dossier`);
  for (const [k, v] of Object.entries(d.scores ?? {})) {
    if (!dims.has(k)) fail(`${f}: unknown dimension ${k}`);
    if (v.score !== null && !v.evidence) fail(`${f}: score ${k} lacks evidence`);
    if (v.step && v.step > nSteps) fail(`${f}: score ${k} step ${v.step} out of range`);
  }
}
for (const f of fs.existsSync(path.join(root, 'data/briefs')) ? fs.readdirSync(path.join(root, 'data/briefs')) : []) {
  if (!f.endsWith('.json')) continue;
  const d = readJson(path.join(root, 'data/briefs', f));
  if (!vBrief(d)) fail(`${f}: ${ajv.errorsText(vBrief.errors)}`);
  if (!ids.has(d.featured)) fail(`${f}: featured ${d.featured} has no experience file`);
}
const corpus = readJson(path.join(root, 'data/corpus.json'));
const seen = new Set();
for (const c of corpus.items) {
  if (seen.has(c.id)) fail(`corpus duplicate id ${c.id}`);
  seen.add(c.id);
}
console.log(`corpus ${corpus.items.length} items; experiences ${ids.size}; ${bad ? bad + ' problems' : 'ok'}`);
process.exit(bad ? 1 : 0);
