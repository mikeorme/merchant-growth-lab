import fs from 'node:fs';
const R = {
shopify: {
  scores: {
    jtbd_fit: [3, 'Hero says "Dream big and build fast on Shopify. The world\'s best commerce platform." Names commerce but not the merchant\'s job.', 1],
    capability_visible: [2, 'Step 1 hero is a dark lifestyle video with no product UI.', 1],
    pricing_transparency: [null, 'Not visible in captured steps; "Pricing" sits in nav only.', null],
    time_to_value: [null, 'Flow stopped before account creation; cannot judge.', null],
    friction: [2, 'The hero "Start for free" leads to /start, a second page with the same CTA again (step 2). One extra click for the same intent.', 2],
    trust: [null, 'No trust signals in the captured viewport.', null],
    mobile: [null, 'Mobile capture exists for step 1 but was not assessed.', null],
    states: [null, 'No error or empty states reached.', null],
    a11y_basics: [null, 'Not tested in this run.', null],
    value_prop_clarity: [2, 'Headline "Be the next AI all-star" does not say what a merchant gets; the clear line is the subhead.', 1],
    proof_quality: [2, '"The world\'s best commerce platform" is stated with no evidence on the screen.', 1],
    persuasion_integrity: [4, 'No fake urgency or pressure visible; the promise is speed ("Be selling by tomorrow").', 2],
    cta_logic: [3, 'One consistent label, "Start for free", in nav and hero, but it is repeated on an interstitial.', 2]
  },
  read: {
    summary: 'A confident, brand-led landing that asks for the click before showing the product. The path to signup is consistent in wording but takes an extra interstitial.',
    pros: ['One CTA wording everywhere ("Start for free") keeps the decision simple.', '"Be selling by tomorrow" is a concrete, merchant-relevant speed promise.', 'No visible urgency or pressure tactics in these steps.'],
    cons: ['Hero headline is about AI ambition rather than the merchant\'s job.', 'No product UI or proof on the first screen.', 'The /start page re-asks for the same click.'],
    howItSells: 'Sells identity and momentum ("be the next all-star", "start today") with a low-commitment free start. Relies on brand authority more than shown evidence.',
    copy: ['Speed-framed promise next to a single, repeated CTA.'], avoid: ['Leading with an abstract headline and holding back the product.', 'An interstitial that repeats the CTA.'],
    tactics: ['authority', 'commitment_ladder'], confidence: 'low',
    unknowns: ['What the real account form asks for.', 'Trial length and plan terms.', 'Mobile experience.', 'Whether /start varies by visitor or campaign.'],
    hypothesis: { statement: 'Showing a short product demo above the fold will lift hero-to-signup click rate without hurting signup completion.', metric: 'Hero CTA click-through to account-created rate', guardrail: 'Page load time and bounce rate', decisionRule: 'Ship if CTA-to-account rises with no guardrail regression after a two-week split test.' }
  },
  claims: [
    ['The world\'s best commerce platform', 'unsupported', 1, null],
    ['Be selling by tomorrow', 'plausible', 2, null]
  ]
},
stripe: {
  scores: {
    jtbd_fit: [4, 'Hero lists the jobs: "Accept payments, handle business banking, and implement custom revenue models".', 1],
    capability_visible: [4, 'Step 2 shows a real-looking dashboard (Balances, Transactions, Customers) behind the signup modal.', 2],
    pricing_transparency: [null, 'Pricing is only a nav link in the captured steps.', null],
    time_to_value: [null, 'Flow stopped at the account form.', null],
    friction: [4, 'Account form has four fields (email, name, password, country) plus Google sign-up.', 2],
    trust: [4, 'Named logo wall: OpenAI, Amazon, Nvidia, Ford, Coinbase, Google, Shopify.', 1],
    mobile: [null, 'Mobile capture exists for step 1 but was not assessed.', null],
    states: [null, 'No error or empty states reached.', null],
    a11y_basics: [null, 'Not tested in this run.', null],
    value_prop_clarity: [3, 'Clear to a developer or finance lead. "Financial infrastructure" and "custom revenue models" are harder for a small merchant.', 1],
    proof_quality: [3, 'Logos are specific, but "Global GDP running on Stripe: 1.75356688%" has no visible source.', 1],
    persuasion_integrity: [4, 'No urgency or scarcity. The banner announces news instead of pushing a deal.', 1],
    cta_logic: [4, '"Get started" is primary, Google sign-up secondary, "Contact sales" separated top-right.', 1]
  },
  read: {
    summary: 'A clear, credible start for builders and finance teams. The signup modal over a live-looking dashboard is the strongest move in the flow.',
    pros: ['Signup appears over the product dashboard, so the visitor sees where they are going.', 'Logo wall uses specific, recognisable brands.', 'Primary and secondary CTAs are clearly ranked.'],
    cons: ['Copy skews toward technical and enterprise readers; a first-time small merchant may not see themselves.', 'The GDP counter is an unsourced, attention-grabbing claim.', 'Four required fields before seeing anything inside the product.'],
    howItSells: 'Sells scale and credibility ("first transaction to your billionth") through named customers and an ambitious stat. Positions Stripe as infrastructure rather than a store tool.',
    copy: ['Show the product behind the signup modal.', 'Rank CTAs: self-serve primary, sales secondary.'], avoid: ['An unsourced headline statistic.'],
    tactics: ['authority', 'social_proof', 'commitment_ladder'], confidence: 'medium',
    unknowns: ['Pricing clarity beyond the nav.', 'What happens after account creation.', 'Mobile experience.'],
    hypothesis: { statement: 'A segment-specific headline for small merchants ("Take your first payment today") will improve signup rate among non-developer visitors.', metric: 'Signup start to account-created rate for small-merchant traffic', guardrail: 'Developer-segment signup rate', decisionRule: 'Ship to the small-merchant segment if completion rises by a pre-agreed margin and developer rate holds.' }
  },
  claims: [
    ['Global GDP running on Stripe: 1.75356688%', 'unsupported', 1, null],
    ['From your first transaction to your billionth', 'plausible', 1, null],
    ['Accept payments, handle business banking', 'plausible', 2, 2]
  ]
},
klaviyo: {
  scores: {
    jtbd_fit: [4, 'Subhead: "Composer turns customer data into revenue. You approve the plan, and every result is measured."', 1],
    capability_visible: [4, 'Hero shows product UI with a revenue summary and an AI recommendations panel.', 1],
    pricing_transparency: [null, 'Pricing is a nav link only in captured steps.', null],
    time_to_value: [null, 'Flow stopped at the signup form.', null],
    friction: [5, 'Signup is one email field or Google, nothing else (step 2).', 2],
    trust: [4, 'Named brands (Funko, Dollar Shave Club, Glossier, Dermalogica) and a customer count.', 1],
    mobile: [null, 'Mobile capture exists for step 1 but was not assessed.', null],
    states: [null, 'No error or empty states reached.', null],
    a11y_basics: [null, 'Not tested in this run.', null],
    value_prop_clarity: [3, 'Two category labels compete: "The autonomous B2C CRM" eyebrow and "AI marketing agent" headline.', 1],
    proof_quality: [3, '"Powering 200,000+ relationship-driven brands across 100 countries" is unsourced; dashboard figures look like demo data and are not labelled as such.', 1],
    persuasion_integrity: [4, '"You approve the plan" frames AI as supervised, not magic.', 1],
    cta_logic: [4, '"Sign up" and "Sign up with Google" are clear. A promo banner ("Try it now") competes for the click.', 1]
  },
  read: {
    summary: 'A product-led pitch with the lightest signup of the three pilots. The AI-agent framing is current, but category labels compete.',
    pros: ['Signup asks for one email or Google, the lowest friction here.', 'Hero shows real product UI and a concrete recommendation.', '"You approve the plan" addresses fear of an autonomous agent.'],
    cons: ['Eyebrow and headline describe the product in two different ways.', 'Demo dashboard numbers are not labelled as sample data.', 'A promo banner adds a second competing CTA.'],
    howItSells: 'Sells outcome (revenue) with supervised automation, supported by well-known DTC brands and scale. The AI framing is the hook; the proof is the logo bar.',
    copy: ['Single-field signup.', 'Say what the human still controls.'], avoid: ['Two competing category names in the hero.', 'Unlabelled demo figures.'],
    tactics: ['social_proof', 'authority', 'commitment_ladder'], confidence: 'medium',
    unknowns: ['What the first-run experience asks next.', 'Pricing and plan limits.', 'Whether "Composer" is available on the free plan.', 'Mobile experience.'],
    hypothesis: { statement: 'Labelling the hero dashboard as sample data and removing the promo banner will increase trust and signup completion.', metric: 'Signup completion rate', guardrail: 'Banner-driven feature awareness (click rate on the announcement)', decisionRule: 'Ship if completion rises and the announcement loses no more than an agreed share of clicks.' }
  },
  claims: [
    ['Powering 200,000+ relationship-driven brands across 100 countries', 'unsupported', 1, null],
    ['Composer turns customer data into revenue', 'plausible', 1, 1],
    ['Every result is measured', 'plausible', 1, 1]
  ]
}};
for (const [id, r] of Object.entries(R)) {
  const p = new URL(`../data/experiences/${id}.json`, import.meta.url);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  d.scores = Object.fromEntries(Object.entries(r.scores).map(([k, [score, evidence, step]]) => [k, { score, evidence, step }]));
  d.read = r.read;
  d.claims = r.claims.map(([text, verdict, step, evidenceStep]) => ({ text, verdict, step, evidenceStep }));
  d.status = 'evaluated';
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
}
