// One-off migration (2026-11-22): whole-site surveys replace flow-style queue items.
// Merges sub-surface items (pricing, capital, hardware, AI features) into one entry per company,
// logs retired ids in data/corpus-retired.json, then tops the corpus back up to 100 with new sites.
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const cp = root + 'data/corpus.json';
const c = JSON.parse(fs.readFileSync(cp, 'utf8'));
const byId = new Map(c.items.map((i) => [i.id, i]));
const groups = [
  { keep: 'shopify', merge: ['shopify-pricing', 'shopify-capital', 'shopify-magic-sidekick', 'shopify-pos'] },
  { keep: 'stripe', merge: ['stripe-capital', 'stripe-terminal'] },
  { keep: 'klaviyo', merge: ['klaviyo-pricing', 'klaviyo-ai'] },
  { keep: 'squarespace', merge: ['squarespace-pricing', 'squarespace-blueprint-ai'] },
  { keep: 'square-payments', rename: { id: 'square', name: 'Square', url: 'https://squareup.com' }, merge: ['square-pos', 'square-loans', 'square-online'] },
  { keep: 'paypal-business', rename: { name: 'PayPal' }, merge: ['paypal-working-capital', 'paypal-zettle'] },
  { keep: 'mailchimp', merge: ['mailchimp-pricing'] },
  { keep: 'amazon-seller-central', merge: ['amazon-lending'] },
  { keep: 'wix', merge: ['wix-ai-site-builder', 'wix-pricing'] },
  { keep: 'godaddy-websites-marketing', rename: { id: 'godaddy', name: 'GoDaddy', url: 'https://www.godaddy.com' }, merge: ['godaddy-airo', 'poynt-godaddy-smart-terminal'] },
  { keep: 'gorgias', merge: ['gorgias-ai-agent'] },
  { keep: 'canva-magic-studio', rename: { id: 'canva', name: 'Canva', url: 'https://www.canva.com' }, merge: ['canva-pricing'] },
  { keep: 'tidio', merge: ['tidio-lyro'] }
];
const retired = [];
for (const g of groups) {
  const parent = byId.get(g.keep);
  const kids = g.merge.map((m) => byId.get(m)).filter(Boolean);
  const focus = [parent.focus ?? parent.flow, ...kids.map((k) => k.flow)];
  parent.priority = Math.min(parent.priority, ...kids.map((k) => k.priority));
  if (g.rename) Object.assign(parent, g.rename);
  parent.focus = [...new Set(focus)].join('; ');
  parent.flow = 'site survey';
  parent.mergedFrom = g.merge;
  for (const k of kids) retired.push({ id: k.id, name: k.name, flow: k.flow, mergedInto: parent.id });
}
const gone = new Set(retired.map((r) => r.id));
c.items = c.items.filter((i) => !gone.has(i.id));
for (const i of c.items) if (i.flow !== 'site survey') { i.focus = i.focus ?? i.flow; i.flow = 'site survey'; }
const add = [
  ['nosto', 'Nosto', 'search-merchandising', 'https://www.nosto.com'],
  ['rebuy', 'Rebuy', 'search-merchandising', 'https://www.rebuyengine.com'],
  ['algolia', 'Algolia', 'search-merchandising', 'https://www.algolia.com'],
  ['searchspring', 'Searchspring', 'search-merchandising', 'https://searchspring.com'],
  ['bloomreach', 'Bloomreach', 'search-merchandising', 'https://www.bloomreach.com'],
  ['constructor', 'Constructor', 'search-merchandising', 'https://constructor.com'],
  ['klevu', 'Klevu', 'search-merchandising', 'https://www.klevu.com'],
  ['affirm', 'Affirm', 'checkout-risk-bnpl', 'https://www.affirm.com'],
  ['klarna', 'Klarna', 'checkout-risk-bnpl', 'https://www.klarna.com'],
  ['signifyd', 'Signifyd', 'checkout-risk-bnpl', 'https://www.signifyd.com'],
  ['riskified', 'Riskified', 'checkout-risk-bnpl', 'https://www.riskified.com'],
  ['shipstation', 'ShipStation', 'shipping-fulfillment', 'https://www.shipstation.com'],
  ['shippo', 'Shippo', 'shipping-fulfillment', 'https://goshippo.com'],
  ['shipbob', 'ShipBob', 'shipping-fulfillment', 'https://www.shipbob.com'],
  ['easyship', 'Easyship', 'shipping-fulfillment', 'https://www.easyship.com'],
  ['loox', 'Loox', 'reviews-loyalty', 'https://loox.io'],
  ['privy', 'Privy', 'retention-messaging', 'https://www.privy.com'],
  ['activecampaign', 'ActiveCampaign', 'retention-messaging', 'https://www.activecampaign.com'],
  ['mailerlite', 'MailerLite', 'retention-messaging', 'https://www.mailerlite.com'],
  ['triple-whale', 'Triple Whale', 'ai-for-merchants', 'https://www.triplewhale.com'],
  ['wayflyer', 'Wayflyer', 'merchant-capital-banking', 'https://wayflyer.com'],
  ['hostinger-website-builder', 'Hostinger Website Builder', 'store-builders', 'https://www.hostinger.com/website-builder'],
  ['duda', 'Duda', 'store-builders', 'https://www.duda.co'],
  ['shopware', 'Shopware', 'store-builders', 'https://www.shopware.com']
];
let p = Math.max(...c.items.map((i) => i.priority));
for (const [id, name, category, url] of add) c.items.push({ id, name, category, url, flow: 'site survey', focus: 'whole-site survey', priority: ++p, status: 'backlog', source: 'seed-2026-11-22' });
// keep priorities dense and unique
c.items.sort((a, b) => a.priority - b.priority).forEach((i, n) => (i.priority = n + 1));
fs.writeFileSync(cp, JSON.stringify(c, null, 2));
fs.writeFileSync(root + 'data/corpus-retired.json', JSON.stringify({ retiredAt: '2026-11-22', reason: 'Whole-site surveys replace flow-style items; sub-surfaces merged into one entry per company.', items: retired }, null, 2));
console.log('corpus', c.items.length, 'retired', retired.length);
