// Usage: node capture/capture.mjs <corpus-id> [maxPages=14] [--lite]
// Discovery survey, logged-out and polite. Phases:
//   1. Home: screenshot (desktop + phone), nav map, tech-stack signals.
//   2. Discover: follow the site's own top-level nav by kind (pricing, products, platform/docs,
//      solutions, customers, company, resources). Per page: screenshot, headings, CTAs, price points, text.
//   3. Signup funnel: click the primary CTA up to 3 steps; stop at an account form or bot check.
// Page text is saved to data/captures/<id>/page-N.txt so claims can be verified against it.
// Never creates accounts, never enters data, never buys.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const lite = args.includes('--lite');
const signupOnly = args.includes('--signup-only'); // redo only the signup step of an existing survey
const homeOnly = args.includes('--home-only'); // redo only the home page (step 1) of an existing survey
const redo = signupOnly || homeOnly;
const [id, maxArg] = args.filter((a) => !a.startsWith('--'));
const maxPages = Math.min(Number(maxArg ?? (lite ? 6 : 14)), 16); // hard cap on discovery pages
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'data/corpus.json'), 'utf8'));
const item = corpus.items.find((i) => i.id === id);
if (!item) { console.error('unknown id', id); process.exit(1); }

const shotDir = path.join(root, 'site/public/shots', id);
const textDir = path.join(root, 'data/captures', id);
if (!redo) { fs.rmSync(shotDir, { recursive: true, force: true }); fs.rmSync(textDir, { recursive: true, force: true }); }
fs.mkdirSync(shotDir, { recursive: true }); fs.mkdirSync(textDir, { recursive: true });

const host0 = new URL(item.url).hostname.replace(/^www\./, '');
const brand = host0.split('.').slice(-2, -1)[0];
const PRIMARY = /(sign up|get started|start (for )?free|start (your|now|selling|building)|create (your )?(account|store|site)|free trial)/i;
const SKIP = /(log ?in|sign ?in|login|signin|privacy|terms|legal|cookie|status\.|mailto:|tel:|\/locale|language|investor|careers\/|jobs\.|\.pdf$|\/search)/i;
// Quotas per kind, in visiting order. Lite mode trims them.
const KINDS = [
  ['pricing', /(pricing|\bfees?\b|price)/i, lite ? 1 : 2],
  ['product', /(product|payments?|billing|checkout|connect|terminal|tax|radar|email|sms|automation|flows?|features?|store|pos\b|capital|how-it-works|marketing|analytics|segmentation|subscriptions?)/i, lite ? 2 : 4],
  ['platform', /(developers?|docs|api|platform|integrations?|apps?\b|app-store|extensib|marketplace|partners?|sdk|webhooks?)/i, lite ? 1 : 2],
  ['solutions', /(solutions?|industr|use-cases?|enterprise|startups?|small-business|by-(size|industry)|for-[a-z]+)/i, lite ? 0 : 2],
  ['customers', /(case-stud|customer-stor|success-stor|stories|showcase|testimonial|\/customers\/?$|^customers?$)/i, lite ? 0 : 1],
  ['company', /(about|company|press|newsroom|mission|why-)/i, lite ? 0 : 1],
  ['resources', /(blog|resources|learn|guides|academy|events|webinar|community|support|help|changelog|releases)/i, lite ? 0 : 1]
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const mctx = await browser.newContext({ ...devices['iPhone 14'] });
const mpage = await mctx.newPage();
const t0 = Date.now();
let prior = null;
const steps = [];
let blockedReason, stack = {}, navMap = [];

const settle = async (p, ms = 1500) => { await p.waitForLoadState('domcontentloaded').catch(() => {}); await p.waitForTimeout(ms); };
async function dismissBanners(p) {
  for (const t of [/accept all/i, /^accept$/i, /i agree/i, /got it/i, /allow all/i, /^ok$/i]) {
    const b = p.getByRole('button', { name: t }).first();
    if (await b.isVisible({ timeout: 300 }).catch(() => false)) { await b.click({ timeout: 1000 }).catch(() => {}); break; }
  }
}
async function shot(p, file, w) {
  const buf = await p.screenshot({ type: 'png' });
  await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(file);
}
async function lazyScroll(p) {
  await p.evaluate(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 9000); y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); }).catch(() => {});
  await p.waitForTimeout(400);
}
async function extract(p, keepChrome = false) {
  return p.evaluate((keepChrome) => {
    const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    // Page body only: hide site chrome (header/nav/footer) while reading, so repeated mega-menus don't bury the content.
    const chrome = keepChrome ? [] : [...document.querySelectorAll('header,nav,footer,[role=banner],[role=navigation],[role=contentinfo]')];
    const prev = chrome.map((e) => e.style.display); chrome.forEach((e) => (e.style.display = 'none'));
    let text = (document.body.innerText ?? '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    chrome.forEach((e, i) => (e.style.display = prev[i]));
    if (text.length < 400) text = (document.body.innerText ?? '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const headings = [...document.querySelectorAll('h1,h2,h3')].filter(vis).map((h) => `${h.tagName.toLowerCase()}: ${clean(h.innerText)}`).filter((h) => h.length > 8 && h.length < 200).slice(0, 40);
    const ctaRe = /(get started|start|try|sign up|free|buy|contact|demo|talk to|book|learn more|see (pricing|plans)|explore)/i;
    const ctas = [...new Set([...document.querySelectorAll('a,button')].filter(vis).map((e) => clean(e.innerText)).filter((t) => t.length > 2 && t.length < 40 && ctaRe.test(t)))].slice(0, 14);
    const priceRe = /((?:US)?[$€£]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:\/|per)\s?[a-z]+)?|\b\d+(?:\.\d+)?\s?%(?:\s?\+\s?[$€£]?\d+(?:\.\d+)?¢?)?|\b\d+¢)/gi;
    const prices = []; let m;
    while ((m = priceRe.exec(text)) && prices.length < 30) { const a = Math.max(0, m.index - 50), b = Math.min(text.length, m.index + m[0].length + 50); prices.push(clean(text.slice(a, b))); }
    return { title: clean(document.title), description: clean(document.querySelector('meta[name=description],meta[property="og:description"]')?.content), headings, ctas, prices: [...new Set(prices)].slice(0, 25), text: text.slice(0, 10000) };
  }, keepChrome).catch(() => ({ title: '', headings: [], ctas: [], prices: [], text: '' }));
}
async function navLinks(p) {
  return p.evaluate(() => {
    const out = []; const seen = new Set();
    for (const a of document.querySelectorAll('header a[href], nav a[href], [role=banner] a[href], footer a[href]')) {
      const label = (a.textContent ?? '').replace(/\s+/g, ' ').trim();
      let href; try { href = new URL(a.href, location.href); } catch { continue; }
      if (!label || label.length > 50 || !/^https?:$/.test(href.protocol)) continue;
      href.hash = ''; const k = href.href; if (seen.has(k)) continue; seen.add(k);
      out.push({ label, href: k, area: a.closest('footer') ? 'footer' : 'header' });
    }
    return out;
  }).catch(() => []);
}
const sameBrand = (u) => { try { return new URL(u).hostname.includes(brand); } catch { return false; } };

async function record(p, kind, via, keepChrome = false) {
  const n = steps.length + 1;
  await lazyScroll(p);
  const x = await extract(p, keepChrome);
  const rel = `shots/${id}/step-${n}.webp`;
  await shot(p, path.join(root, 'site/public', rel), 1280);
  const textFile = `data/captures/${id}/page-${n}.txt`;
  fs.writeFileSync(path.join(root, textFile), `URL: ${p.url()}\nTITLE: ${x.title}\nDESCRIPTION: ${x.description ?? ''}\n\n${x.text}\n`);
  const step = { n, kind, title: (x.title || `Page ${n}`).slice(0, 110), url: p.url(), screenshot: rel, textFile, elapsedMs: Date.now() - t0, clicks: 0, via, headings: x.headings, ctas: x.ctas, prices: x.prices };
  if (x.description) step.description = x.description.slice(0, 300);
  steps.push(step);
  return step;
}

let keep = [];
if (redo) {
  prior = JSON.parse(fs.readFileSync(path.join(root, 'data/experiences', id + '.json'), 'utf8'));
  if (signupOnly) for (const st of prior.steps.filter((x) => x.kind !== 'signup')) steps.push(st);
  else keep = prior.steps.slice(1); // home-only: record home as step 1, then re-append the rest
}
try {
  if (!signupOnly) {
  // ---- 1. Home
  const homeResp = await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page, 2000); await dismissBanners(page);
  const links = await navLinks(page);
  // Hover top-level triggers so lazy mega-menus render their links, then re-read.
  const triggers = await page.locator('header [aria-haspopup], header button[aria-expanded], nav button[aria-expanded]').all().catch(() => []);
  for (const t of triggers.slice(0, 8)) { await t.hover({ timeout: 500 }).catch(() => {}); await page.waitForTimeout(150); }
  await page.mouse.move(2, 2); await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(400); // close any open mega-menu before the screenshot
  const links2 = await navLinks(page);
  const all = [...new Map([...links, ...links2].map((l) => [l.href, l])).values()];
  const headers = homeResp ? homeResp.headers() : {};
  stack = await page.evaluate(() => ({
    generator: document.querySelector('meta[name=generator]')?.content ?? null,
    scriptHosts: [...new Set([...document.scripts].map((s) => { try { return new URL(s.src).hostname; } catch { return null; } }).filter(Boolean))].slice(0, 14),
    signals: [window.Shopify && 'Shopify global', window.__NEXT_DATA__ && 'Next.js', window.__NUXT__ && 'Nuxt', window.React && 'React global', window.dataLayer && 'Google Tag Manager dataLayer', window.analytics && 'Segment analytics', window.Stripe && 'Stripe.js'].filter(Boolean)
  })).catch(() => ({}));
  stack.server = headers['server'] ?? null; stack.poweredBy = headers['x-powered-by'] ?? null;
  const home = await record(page, 'home', 'entry');
  await mpage.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}); await settle(mpage); await dismissBanners(mpage);
  await shot(mpage, path.join(root, 'site/public', `shots/${id}/step-1-mobile.webp`), 390);
  home.mobileScreenshot = `shots/${id}/step-1-mobile.webp`;

  if (homeOnly) steps.push(...keep);
  if (!redo) {
  // ---- 2. Discover
  const origin = new URL(page.url()).origin;
  const cand = all.filter((l) => sameBrand(l.href) && !SKIP.test(l.href + ' ' + l.label) && !(new URL(l.href).pathname === '/' && new URL(l.href).hostname.replace(/^www\./, '') === host0) && !/^(dashboard|admin|accounts?)\./i.test(new URL(l.href).hostname));
  const kindOf = (l) => { const pa = new URL(l.href).pathname; if (/^\/(blog|articles?)\//i.test(pa)) return 'resources'; for (const [k, re] of KINDS) if (re.test(new URL(l.href).pathname + ' ' + l.label)) return k; return null; };
  navMap = cand.map((l) => ({ label: l.label, href: l.href, area: l.area, kind: kindOf(l) ?? 'other' })).slice(0, 80);
  const used = new Set([page.url()]);
  // Within a kind, rank the pages that answer the key question first: dev docs/API for platform, the pricing page itself for pricing.
  const pref = (k, l) => {
    const t = new URL(l.href).hostname + new URL(l.href).pathname + ' ' + l.label;
    if (k === 'platform') return /(^|\.)(docs|developers?|dev)\.|\/docs|\/api|api reference|developer/i.test(t) ? 0 : /integrations?|app-?store|marketplace/i.test(t) ? 1 : 2;
    if (k === 'pricing') return /^pricing$/i.test(l.label.trim()) || /\/pricing\/?$/i.test(new URL(l.href).pathname) ? 0 : 1;
    return 0;
  };
  const pools = KINDS.map(([k, , quota]) => ({ k, quota, pool: cand.filter((l) => kindOf(l) === k)
    .sort((a, b) => pref(k, a) - pref(k, b) || (a.area === 'header' ? 0 : 1) - (b.area === 'header' ? 0 : 1) || new URL(a.href).pathname.split('/').length - new URL(b.href).pathname.split('/').length) }));
  const picks = [];
  // Round-robin: one page per kind first, then second picks, so no kind is crowded out by the page cap.
  for (let round = 0; round < 4; round++) for (const { k, quota, pool } of pools) {
    if (round >= quota) continue;
    const l = pool.find((x) => !used.has(x.href));
    if (l) { used.add(l.href); picks.push({ ...l, k }); }
  }
  // Fallback probes: if the nav never linked a kind, try its conventional paths.
  const PROBES = { customers: ['/customers', '/customer-stories', '/case-studies'], company: ['/about', '/company'], pricing: ['/pricing'] };
  if (!lite) for (const [k, paths] of Object.entries(PROBES)) {
    if (picks.some((p) => p.k === k)) continue;
    for (const pa of paths) { const href = new URL(pa, origin).href; if (!used.has(href)) { used.add(href); picks.push({ label: `probe ${pa}`, href, area: 'probe', k }); break; } }
  }
  for (const pk of picks.slice(0, maxPages - 1)) {
    const resp = await page.goto(pk.href, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => null);
    if (!resp || (pk.area === 'probe' && (resp.status() >= 400 || !new URL(page.url()).pathname.startsWith(new URL(pk.href).pathname)))) continue; // probe must land where it asked
    await settle(page, 1200); await dismissBanners(page);
    const finalUrl = page.url().replace(/[#?].*$/, '').replace(/\/$/, '');
    if (steps.some((x) => x.url.replace(/[#?].*$/, '').replace(/\/$/, '') === finalUrl)) continue; // redirected to a page already captured
    const s = await record(page, pk.k, `nav: ${pk.label}`);
    if (pk.k === 'pricing' && !steps.some((x) => x.n > 1 && x.mobileScreenshot)) {
      await mpage.goto(pk.href, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {}); await settle(mpage); await dismissBanners(mpage);
      await shot(mpage, path.join(root, 'site/public', `shots/${id}/step-${s.n}-mobile.webp`), 390); s.mobileScreenshot = `shots/${id}/step-${s.n}-mobile.webp`;
    }
    await page.waitForTimeout(700); // polite pacing
  }

  }
  }
  if (!homeOnly) {
  // ---- 3. Signup funnel from home
  await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 }); await settle(page); await dismissBanners(page);
  const tried = new Set(); let funnelClicks = 0; const tf = Date.now();
  for (let f = 0; f < 3; f++) {
    const cands = page.locator('a,button').filter({ hasText: PRIMARY });
    const total = Math.min(await cands.count().catch(() => 0), 12);
    let label = '', clicked = false;
    for (let k = 0; k < total && !clicked; k++) {
      const c = cands.nth(k);
      if (!(await c.isVisible().catch(() => false))) continue;
      label = (await c.innerText().catch(() => '')).trim().replace(/\s+/g, ' ').slice(0, 60);
      if (!label || tried.has(label)) continue; tried.add(label);
      clicked = await c.click({ timeout: 3000 }).then(() => true).catch(() => false);
      if (!clicked) clicked = await c.click({ timeout: 3000, force: true }).then(() => true).catch(() => false);
      if (!clicked) { const href = await c.getAttribute('href').catch(() => null); if (href) clicked = await page.goto(new URL(href, page.url()).href, { waitUntil: 'domcontentloaded', timeout: 20000 }).then(() => true).catch(() => false); }
    }
    if (!clicked) { blockedReason = blockedReason ?? (total ? 'signup CTA not clickable' : 'no signup CTA found'); break; }
    funnelClicks++; await settle(page); await dismissBanners(page);
    const formUp = await page.locator('input[type=password], input[type=email]').first().isVisible().catch(() => false);
    const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 3000);
    const wall = formUp || /captcha|verify you are human|are you a robot/i.test(body);
    const s = await record(page, 'signup', `click: "${label}"`, true); // keep chrome: the form may live in a dialog/header
    s.elapsedMs = Date.now() - tf; s.clicks = funnelClicks;
    if (wall) { s.note = 'Stopped: account form or bot check reached.'; blockedReason = `account form reached after ${funnelClicks} click${funnelClicks > 1 ? 's' : ''} from home`; break; }
  }
  }
} catch (e) { blockedReason = 'capture error: ' + String(e.message).slice(0, 140); }
await browser.close();

const exp = {
  id, name: item.name, category: item.category, url: item.url, flow: item.flow,
  capturedAt: prior?.capturedAt ?? new Date().toISOString().slice(0, 10), rubricVersion: '1.1.0',
  status: steps.length ? 'captured' : 'blocked',
  ...((blockedReason ?? prior?.blockedReason) ? { blockedReason: blockedReason ?? prior.blockedReason } : {}),
  surveyMode: lite ? 'lite' : 'full',
  steps, navMap: prior?.navMap ?? navMap, stack: prior?.stack ?? stack, sources: [item.url]
};
fs.mkdirSync(path.join(root, 'data/experiences'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/experiences', id + '.json'), JSON.stringify(exp, null, 2));
item.status = exp.status;
fs.writeFileSync(path.join(root, 'data/corpus.json'), JSON.stringify(corpus, null, 2));
console.log(id, exp.status, `${steps.length} pages:`, steps.map((s) => s.kind).join(','), blockedReason ?? '');
