# Daily brief procedure (runs 5:00 a.m. Mountain, in a cloud session)

You are producing today's Merchant Growth Lab brief. Work from the repo root. Be efficient: every image you view and every retry costs tokens. Prefer plain scripts to model work wherever a script exists.

## Budget rules (hard)
- The owner wants this run to stay well under their usage allocation. Default batch is **5** backlog specimens plus **1** featured. Drop to **3** if `data/cost-log.json` shows the previous run had retries, errors, or `partial: true`.
- Featured specimen: full evaluation, view up to 12 step images.
- Batch specimens: quick read. View **only step 1 and the last step**. Score only dimensions you can evidence from those; everything else `null`. Two pros, two cons, one hypothesis, `confidence: "low"`.
- Stop expanding and publish what you have if: more than **30 images** viewed in total, more than **2 capture retries**, or you see any rate-limit or usage warning. Mark the cost entry `partial: true`.
- At most **one** WebSearch (standard mode) for news, at most **3** news candidates added.

## Steps
1. **Setup.** `npm ci && npm --prefix site ci && npx playwright install --with-deps chromium` (if `--with-deps` fails, retry without it). If Playwright cannot run at all, skip to step 8 and report the failure.
2. **Pick.** `node scripts/next-batch.mjs <batch size>`. Output gives `featured` and `batch` ids. If `featured` is null, the queue is empty: do the news scan and stop.
3. **News scan (one search).** Search for newly launched or newly changed merchant-growth products or flows in the news from the last 48 hours (store builders, payments/checkout, POS, subscriptions, retention, marketplaces, merchant finance, AI for merchants). Add up to 3 genuinely new, publicly accessible candidates: `node scripts/add-news.mjs "<name>" "<url>" "<category>" "<flow>" "<why>"`. Record them in the brief's `newFromNews`. If a news item is clearly more important than the next queued item, you may re-run `next-batch.mjs` once so it becomes today's featured specimen.
4. **Capture.** For each id (featured first): `node capture/capture.mjs <id> 8`. One retry maximum per id. If an id ends `blocked` or has fewer than 2 steps, say so in its file's `blockedReason` and move on; do not work around bot checks, logins, or paywalls. Logged-out public pages only. Never create real accounts, never enter personal data, never purchase.
5. **Evaluate.** For each captured id, edit `data/experiences/<id>.json`: add `scores`, `read`, `claims`, set `status: "evaluated"`. Use `data/experiences/stripe.json` as the exact format exemplar and `data/rubric.json` for dimensions. Rules:
   - Every non-null score needs an `evidence` string citing what is visible on a specific `step`.
   - Use `null` when you cannot tell from what was captured. Never guess pricing, trial terms, or anything behind the form.
   - Mobile quality and accessibility are `null` unless you actually assessed them.
   - Be specific to this product and flow. No generic marketing-critique filler. Plain, dry, evidence-first voice. Numbers over adjectives.
   - Claims: quote the claim as written on the page, tag `proven | plausible | unsupported`, with the step where seen.
   - Hypothesis must have statement, metric, guardrail, decision rule.
6. **Brief.** Write `data/briefs/<YYYY-MM-DD>.json` (date in America/Denver: `TZ=America/Denver date +%F`) following `data/schema/brief.schema.json`. `featured` is the featured id; `batch` the others. Headline: one specific sentence about what is notable in the featured flow (not "X teardown"). Exactly three `questionsForReader`, answerable from the screenshots. Include `cost: {imagesViewed, retries, batchSize, partial}`.
7. **Validate and publish.** `npm run validate` then `npm run site:build`. Both must pass; if validation fails, fix the data or revert that specimen's evaluation to `status: "captured"` and remove its scores. Append one line to `data/cost-log.json` (array; create if missing) with date, imagesViewed, retries, batchSize, partial. Then `git add -A && git commit -m "Brief <date>: <featured>" && git push origin main`. The deploy workflow publishes the site. Poll `https://mikeorme.github.io/merchant-growth-lab/briefs/<date>/` up to 6 times, 20 seconds apart, until it returns 200.
8. **Notify.** Message: "Today's Merchant Growth Lab brief: <headline>" plus the link `https://mikeorme.github.io/merchant-growth-lab/briefs/<date>/`. First try a push/app notification tool if you have one. If you do not have one or it fails, send an email with the Gmail connector (`send_message`) to the repo owner's own address, mikeorme@gmail.com, subject "Lab brief <date>: <headline>", body containing the headline, one-line summary, and the link. If the run failed, send the same way with the subject "Lab brief <date>: FAILED" and one line on why. Send exactly one notification.

## Do not
- Do not change the rubric, schemas, site code, or this file during a daily run.
- Do not edit or delete other specimens' data.
- Do not publish a specimen whose screenshots show a personal email, name, or card number (re-capture or mark blocked).
