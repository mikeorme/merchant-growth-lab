// Usage: node scripts/apply-evaluation.mjs <id>
// Merges data/evaluations/<id>.json ({dossier, scores, read, claims}) into data/experiences/<id>.json
// and marks it evaluated. Evaluations are kept separate from captures so a recapture never destroys them
// (a recapture renumbers pages, so re-check step references afterwards: `npm run validate` does).
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const id = process.argv[2];
const ev = JSON.parse(fs.readFileSync(path.join(root, 'data/evaluations', id + '.json'), 'utf8'));
const p = path.join(root, 'data/experiences', id + '.json');
const e = JSON.parse(fs.readFileSync(p, 'utf8'));
for (const k of ['dossier', 'scores', 'read', 'claims']) if (ev[k] !== undefined) e[k] = ev[k]; else delete e[k];
e.status = 'evaluated';
fs.writeFileSync(p, JSON.stringify(e, null, 2));
const c = JSON.parse(fs.readFileSync(path.join(root, 'data/corpus.json'), 'utf8'));
const it = c.items.find((i) => i.id === id); if (it) { it.status = 'evaluated'; fs.writeFileSync(path.join(root, 'data/corpus.json'), JSON.stringify(c, null, 2)); }
console.log('applied', id);
