// Versioned localStorage store for the examiner's own scores. Everything wrapped in try/catch.
const KEY = 'mgl:v1';
const SCHEMA = 1;
let mem = null;
export let persistent = true;
const listeners = new Set();

const fresh = () => ({
  schemaVersion: SCHEMA, rubricVersion: '1.0.0',
  settings: { hideMyScores: true }, scores: {}, hypotheses: {}, feedback: [],
});
function migrate(b) {
  if (!b || typeof b !== 'object') return fresh();
  if (b.schemaVersion > SCHEMA) { persistent = false; b.__readonly = true; return b; }
  const f = fresh();
  return { ...f, ...b, settings: { ...f.settings, ...(b.settings ?? {}) }, schemaVersion: SCHEMA };
}
export function load() {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { mem = fresh(); return mem; }
    try { mem = migrate(JSON.parse(raw)); }
    catch { localStorage.setItem(KEY + ':corrupt', raw); mem = fresh(); }
  } catch { persistent = false; mem = fresh(); }
  return mem;
}
export function save() {
  if (!mem || mem.__readonly) return false;
  try { localStorage.setItem(KEY, JSON.stringify(mem)); persistent = true; }
  catch { persistent = false; }
  listeners.forEach((fn) => fn(mem));
  return persistent;
}
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export function exportJson() {
  return JSON.stringify({ app: 'merchant-growth-lab', exportedAt: new Date().toISOString(), schemaVersion: SCHEMA, data: load() }, null, 2);
}
export function validateImport(obj) {
  const errs = [];
  if (!obj || obj.app !== 'merchant-growth-lab') errs.push('Not a merchant-growth-lab export.');
  if (obj && obj.schemaVersion !== SCHEMA) errs.push(`Unsupported schemaVersion ${obj?.schemaVersion}.`);
  if (!obj?.data || typeof obj.data.scores !== 'object') errs.push('Missing data.scores.');
  return errs.slice(0, 5);
}
export function importData(obj, mode) {
  const incoming = migrate(obj.data);
  if (mode === 'replace') { mem = incoming; }
  else {
    const cur = load();
    for (const [id, s] of Object.entries(incoming.scores)) {
      const c = cur.scores[id];
      if (!c || (s.submittedAt ?? '') > (c.submittedAt ?? '')) cur.scores[id] = s;
    }
    Object.assign(cur.hypotheses, incoming.hypotheses);
    cur.feedback = [...cur.feedback, ...incoming.feedback];
  }
  return save();
}
export function reset() { mem = fresh(); try { localStorage.removeItem(KEY); } catch {} listeners.forEach((fn) => fn(mem)); }
addEventListener?.('storage', (e) => { if (e.key === KEY) { mem = null; load(); listeners.forEach((fn) => fn(mem)); } });
