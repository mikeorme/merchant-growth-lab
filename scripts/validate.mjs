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
  for (const s of d.steps ?? []) {
    if (!fs.existsSync(path.join(root, 'site/public', s.screenshot))) fail(`${f}: missing screenshot ${s.screenshot}`);
  }
  for (const [k, v] of Object.entries(d.scores ?? {})) {
    if (!dims.has(k)) fail(`${f}: unknown dimension ${k}`);
    if (v.score !== null && !v.evidence) fail(`${f}: score ${k} lacks evidence`);
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
