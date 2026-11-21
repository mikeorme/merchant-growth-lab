// Usage: node capture/capture.mjs <corpus-id> [maxSteps=8]
// Logged-out, single-flow, polite capture. Stops at login/payment/captcha walls and records why.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const id = process.argv[2];
const maxSteps = Math.min(Number(process.argv[3] ?? 8), 12); // hard cap
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'data/corpus.json'), 'utf8'));
const item = corpus.items.find((i) => i.id === id);
if (!item) { console.error('unknown id', id); process.exit(1); }

const outDir = path.join(root, 'site/public/shots', id);
fs.mkdirSync(outDir, { recursive: true });
const CTA = /(get started|start (free|your|now|trial|selling|building)|try (it )?(free|now)|sign up|create (your )?(account|store|site)|open (a|your) shop|start selling|free trial|build (your )?(site|store))/i;
const PRIMARY = /(sign up|get started|start (for )?free|start (your|now|selling|building)|create (your )?(account|store|site)|free trial)/i;
const tried = new Set();
const WALL = /(log ?in|sign ?in|password|credit card|card number|payment method|captcha|verify you are human|are you a robot)/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: undefined });
const page = await ctx.newPage();
const mctx = await browser.newContext({ ...devices['iPhone 14'] });
const mpage = await mctx.newPage();

const steps = [];
let clicks = 0;
const t0 = Date.now();
let blockedReason;

async function shot(p, file) {
  const buf = await p.screenshot({ type: 'png' });
  await sharp(buf).resize({ width: p === page ? 1280 : 390, withoutEnlargement: true }).webp({ quality: 78 }).toFile(file);
}
async function settle(p) { await p.waitForLoadState('domcontentloaded').catch(() => {}); await p.waitForTimeout(1500); }
async function dismissBanners(p) {
  for (const t of [/accept all/i, /^accept$/i, /i agree/i, /got it/i, /allow all/i]) {
    const b = p.getByRole('button', { name: t }).first();
    if (await b.isVisible({ timeout: 300 }).catch(() => false)) { await b.click({ timeout: 1000 }).catch(() => {}); break; }
  }
}

try {
  await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page); await dismissBanners(page);
  for (let n = 1; n <= maxSteps; n++) {
    const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 4000);
    const title = (await page.title().catch(() => '')) || `Step ${n}`;
    const rel = `shots/${id}/step-${n}.webp`;
    await shot(page, path.join(root, 'site/public', rel));
    const step = { n, title: title.slice(0, 90), url: page.url(), screenshot: rel, elapsedMs: Date.now() - t0, clicks };
    if (n === 1) {
      await mpage.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await settle(mpage);
      const mrel = `shots/${id}/step-1-mobile.webp`;
      await shot(mpage, path.join(root, 'site/public', mrel));
      step.mobileScreenshot = mrel;
      step.headline = (await page.locator('h1').first().innerText().catch(() => '')).slice(0, 160);
    }
    const formUp = await page.locator('input[type=password], input[type=email]').first().isVisible().catch(() => false);
    const walled = n > 1 && (formUp || /captcha|verify you are human|are you a robot/i.test(body));
    if (walled) { step.note = 'Stopped: account form or bot check reached.'; steps.push(step); blockedReason = 'account form reached at step ' + n; break; }
    steps.push(step);
    if (n === maxSteps) break;
    const cands = page.locator('a,button').filter({ hasText: PRIMARY });
    const total = Math.min(await cands.count().catch(() => 0), 12);
    let label = '', clicked = false, before = page.url();
    for (let k = 0; k < total && !clicked; k++) {
      const c = cands.nth(k);
      if (!(await c.isVisible().catch(() => false))) continue;
      label = (await c.innerText().catch(() => '')).trim().replace(/\s+/g, ' ').slice(0, 60);
      if (tried.has(label)) continue;
      tried.add(label);
      clicked = await c.click({ timeout: 3000 }).then(() => true).catch(() => false);
      if (!clicked) clicked = await c.click({ timeout: 3000, force: true }).then(() => true).catch(() => false);
      if (!clicked) { const href = await c.getAttribute('href').catch(() => null); if (href) clicked = await page.goto(new URL(href, page.url()).href, { waitUntil: 'domcontentloaded', timeout: 20000 }).then(() => true).catch(() => false); }
    }
    if (!clicked) { blockedReason = total ? 'CTA not clickable' : 'no primary CTA found'; break; }
    clicks++;
    steps[steps.length - 1].note = `Next: clicked "${label}"`;
    await settle(page); await dismissBanners(page);
  }
} catch (e) { blockedReason = 'capture error: ' + String(e.message).slice(0, 120); }
await browser.close();

const exp = {
  id, name: item.name, category: item.category, url: item.url, flow: item.flow,
  capturedAt: new Date().toISOString().slice(0, 10), rubricVersion: '1.0.0',
  status: steps.length ? 'captured' : 'blocked',
  ...(blockedReason ? { blockedReason } : {}),
  steps: steps.map(({ headline, ...s }) => s),
  sources: [item.url]
};
if (!steps.length) exp.steps = [];
fs.mkdirSync(path.join(root, 'data/experiences'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/experiences', id + '.json'), JSON.stringify(exp, null, 2));
const ci = corpus.items.find((i) => i.id === id); ci.status = exp.status;
fs.writeFileSync(path.join(root, 'data/corpus.json'), JSON.stringify(corpus, null, 2));
console.log(id, exp.status, steps.length + ' steps', blockedReason ?? '');
