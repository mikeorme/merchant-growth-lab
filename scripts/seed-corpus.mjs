import fs from 'node:fs';
// [name, url, flow]
const C = {
  'store-builders': [
    ['Shopify','https://www.shopify.com','free trial start to first product added'],
    ['Squarespace','https://www.squarespace.com','start trial to template chosen'],
    ['Wix','https://www.wix.com','online store signup to first product'],
    ['BigCommerce','https://www.bigcommerce.com','start trial to store setup'],
    ['GoDaddy Websites + Marketing','https://www.godaddy.com/websites/website-builder','builder start to published site'],
    ['Square Online','https://squareup.com/us/en/online-store','signup to online store'],
    ['Webflow Ecommerce','https://webflow.com/ecommerce','signup to store template'],
    ['Weebly','https://www.weebly.com','signup to site start'],
    ['Ecwid','https://www.ecwid.com','free plan signup to first product'],
    ['Big Cartel','https://www.bigcartel.com','signup to first product listed']],
  'payments-checkout': [
    ['Stripe','https://stripe.com','create account to first payment link'],
    ['PayPal Business','https://www.paypal.com/us/business','business signup start'],
    ['Square Payments','https://squareup.com/us/en/payments','signup to accept first payment'],
    ['Shop Pay','https://shop.app/shop-pay','merchant-facing explanation and buyer flow'],
    ['Adyen','https://www.adyen.com','contact/pricing path for new merchant'],
    ['Braintree','https://www.braintreepayments.com','get started path'],
    ['Checkout.com','https://www.checkout.com','get started path'],
    ['Lemon Squeezy','https://www.lemonsqueezy.com','signup to first product'],
    ['Paddle','https://www.paddle.com','get started path'],
    ['Authorize.net','https://www.authorize.net','pricing and signup path']],
  'pos-hardware': [
    ['Square POS','https://squareup.com/us/en/point-of-sale','hardware selection to cart'],
    ['Clover','https://www.clover.com','pos selection and quote path'],
    ['Toast','https://pos.toasttab.com','get pricing path'],
    ['Lightspeed','https://www.lightspeedhq.com','demo request path'],
    ['Shopify POS','https://www.shopify.com/pos','hardware selection to cart'],
    ['SumUp','https://www.sumup.com/en-us','card reader purchase flow'],
    ['Stripe Terminal','https://stripe.com/terminal','hardware shop path'],
    ['PayPal Zettle','https://www.paypal.com/us/business/pos','signup to hardware'],
    ['Revel Systems','https://revelsystems.com','pricing and demo path'],
    ['Poynt (GoDaddy Smart Terminal)','https://www.godaddy.com/payments/smart-terminal','hardware purchase path']],
  'subscription-commerce': [
    ['Recharge','https://rechargepayments.com','get started path'],
    ['Loop Subscriptions','https://www.loopwork.co','install and onboarding path'],
    ['Skio','https://skio.com','get started path'],
    ['Bold Subscriptions','https://boldcommerce.com/subscriptions','install path'],
    ['Seal Subscriptions','https://www.sealsubscriptions.com','install path'],
    ['Stay AI','https://stay.ai','demo and onboarding path'],
    ['Chargebee','https://www.chargebee.com','free trial start'],
    ['Zuora','https://www.zuora.com','get started path'],
    ['Recurly','https://recurly.com','trial start'],
    ['Ordergroove','https://www.ordergroove.com','demo path']],
  'pricing-pages': [
    ['Shopify pricing','https://www.shopify.com/pricing','plan selection'],
    ['Squarespace pricing','https://www.squarespace.com/pricing','plan selection'],
    ['Wix pricing','https://www.wix.com/premium-purchase-plans/plans','plan selection'],
    ['Klaviyo pricing','https://www.klaviyo.com/pricing','plan selection and slider'],
    ['Mailchimp pricing','https://mailchimp.com/pricing','plan selection'],
    ['HubSpot pricing','https://www.hubspot.com/pricing','plan selection'],
    ['Notion pricing','https://www.notion.com/pricing','plan selection'],
    ['Canva pricing','https://www.canva.com/pricing','plan selection'],
    ['Gusto pricing','https://gusto.com/product/pricing','plan selection'],
    ['QuickBooks pricing','https://quickbooks.intuit.com/pricing','plan selection and promo']],
  'retention-messaging': [
    ['Klaviyo','https://www.klaviyo.com','signup to first flow'],
    ['Mailchimp','https://mailchimp.com','signup to first campaign'],
    ['Omnisend','https://www.omnisend.com','signup to first automation'],
    ['Postscript','https://postscript.io','get started path'],
    ['Attentive','https://www.attentive.com','demo path'],
    ['Drip','https://www.drip.com','trial start'],
    ['Constant Contact','https://www.constantcontact.com','trial start to first email'],
    ['Brevo','https://www.brevo.com','signup to first campaign'],
    ['Iterable','https://iterable.com','demo path'],
    ['Customer.io','https://customer.io','signup to first workflow']],
  'reviews-loyalty': [
    ['Yotpo','https://www.yotpo.com','get started path'],
    ['Judge.me','https://judge.me','install and first widget'],
    ['Smile.io','https://smile.io','install path'],
    ['Okendo','https://okendo.io','get started path'],
    ['Gorgias','https://www.gorgias.com','trial start'],
    ['Stamped','https://stamped.io','install path'],
    ['LoyaltyLion','https://loyaltylion.com','get started path'],
    ['Trustpilot Business','https://business.trustpilot.com','signup path'],
    ['Zendesk (SMB)','https://www.zendesk.com','trial start'],
    ['Tidio','https://www.tidio.com','signup to chat widget']],
  'marketplaces-channels': [
    ['Etsy seller onboarding','https://www.etsy.com/sell','open a shop flow'],
    ['Amazon Seller Central','https://sell.amazon.com','sign up to sell'],
    ['TikTok Shop Seller','https://seller-us.tiktok.com','seller signup'],
    ['Faire (brand)','https://www.faire.com/brand','apply as brand'],
    ['eBay seller','https://www.ebay.com/sl/sell','start selling'],
    ['Walmart Marketplace','https://marketplace.walmart.com','apply to sell'],
    ['Instagram Shopping','https://business.instagram.com/shopping','setup explanation path'],
    ['Pinterest for Business','https://business.pinterest.com','get started path'],
    ['Google Merchant Center','https://www.google.com/retail','get started path'],
    ['Mercari seller','https://www.mercari.com/sell','start selling']],
  'merchant-capital-banking': [
    ['Shopify Capital','https://www.shopify.com/capital','eligibility explanation'],
    ['Stripe Capital','https://stripe.com/capital','eligibility explanation'],
    ['Square Loans','https://squareup.com/us/en/banking/loans','eligibility explanation'],
    ['PayPal Working Capital','https://www.paypal.com/us/business/financing','explanation and apply path'],
    ['Mercury','https://mercury.com','open account path'],
    ['Brex','https://www.brex.com','get started path'],
    ['Novo','https://www.novo.co','open account path'],
    ['Bluevine','https://www.bluevine.com','apply path'],
    ['Amazon Lending','https://sell.amazon.com/programs/amazon-lending','explanation path'],
    ['Wise Business','https://wise.com/business','open account path']],
  'ai-for-merchants': [
    ['Shopify Magic / Sidekick','https://www.shopify.com/magic','feature explanation and entry'],
    ['Wix AI Site Builder','https://www.wix.com/ai-website-builder','generate site flow'],
    ['Squarespace Blueprint AI','https://www.squarespace.com/ai-website-builder','generate site flow'],
    ['GoDaddy Airo','https://www.godaddy.com/airo','getting started flow'],
    ['Canva Magic Studio','https://www.canva.com/magic','feature entry'],
    ['Jasper','https://www.jasper.ai','trial start'],
    ['Gorgias AI Agent','https://www.gorgias.com/products/ai-agent','explanation and trial'],
    ['Tidio Lyro','https://www.tidio.com/lyro','explanation and trial'],
    ['Intercom Fin','https://www.intercom.com/fin','explanation and trial'],
    ['Klaviyo AI','https://www.klaviyo.com/features/ai','feature explanation']]
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const items = [];
let prio = 1;
// interleave categories so every batch spans categories
const cats = Object.keys(C);
for (let i = 0; i < 10; i++) for (const c of cats) {
  const [name, url, flow] = C[c][i];
  items.push({ id: slug(name), name, category: c, url, flow, priority: prio++, status: 'backlog', urlVerified: null });
}
fs.writeFileSync(new URL('../data/corpus.json', import.meta.url), JSON.stringify({ version: 1, seededAt: '2026-11-21', items }, null, 2));
console.log(items.length);
