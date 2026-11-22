// Tiny versioned localStorage store for hypothesis decisions (accept / edit / reject) on this device.
// Everything is wrapped in try/catch; the page works without storage.
const KEY = 'mgl:v2';
let mem = null;
export let persistent = true;
const fresh = () => ({ schemaVersion: 2, hypotheses: {} });
export function load() {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(KEY);
    mem = raw ? { ...fresh(), ...JSON.parse(raw) } : fresh();
  } catch { persistent = false; mem = fresh(); }
  return mem;
}
export function save() {
  if (!mem) return false;
  try { localStorage.setItem(KEY, JSON.stringify(mem)); persistent = true; }
  catch { persistent = false; }
  return persistent;
}
