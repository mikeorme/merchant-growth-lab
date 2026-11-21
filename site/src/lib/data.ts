import rubric from '../../../data/rubric.json';
import corpus from '../../../data/corpus.json';

export type Step = {
  n: number; title: string; url: string; screenshot: string; mobileScreenshot?: string;
  elapsedMs?: number; clicks?: number; fieldsFilled?: number; note?: string; tags?: string[];
};
export type Experience = {
  id: string; name: string; category: string; url: string; flow: string; capturedAt: string;
  status: string; blockedReason?: string; rubricVersion: string; steps: Step[];
  claims?: { text: string; verdict: 'proven' | 'plausible' | 'unsupported'; step: number; evidenceStep: number | null }[];
  scores?: Record<string, { score: number | null; evidence: string; step: number | null }>;
  read?: any; sources?: string[];
};
export type Brief = {
  date: string; headline: string; oneLiner?: string; featured: string; batch: string[];
  newFromNews?: { name: string; url: string; why: string }[]; questionsForReader: string[]; cost?: any;
};

const exps = import.meta.glob('../../../data/experiences/*.json', { eager: true, import: 'default' }) as Record<string, Experience>;
const briefs = import.meta.glob('../../../data/briefs/*.json', { eager: true, import: 'default' }) as Record<string, Brief>;

export const experiences: Experience[] = Object.values(exps).sort((a, b) => a.id.localeCompare(b.id));
export const allBriefs: Brief[] = Object.values(briefs).sort((a, b) => b.date.localeCompare(a.date));
export const expById = (id: string) => experiences.find((e) => e.id === id);
export { rubric, corpus };
export const dims = rubric.lenses.flatMap((l) => l.dimensions.map((d) => ({ ...d, lens: l.id, lensLabel: l.label })));

export const accession = (id: string) => {
  const i = corpus.items.findIndex((c) => c.id === id);
  return 'MGL-' + String((i < 0 ? 0 : i) + 1).padStart(4, '0');
};
export const mmss = (ms = 0) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
export const overall = (e: Experience) => {
  const v = Object.values(e.scores ?? {}).map((s) => s.score).filter((s): s is number => s !== null);
  return v.length ? { mean: v.reduce((a, b) => a + b, 0) / v.length, n: v.length } : null;
};
export const base = (p = '') => (import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, ''));
export const stale = (e: Experience) => (Date.now() - new Date(e.capturedAt).getTime()) / 86400000 > 180;
