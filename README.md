# Merchant Growth Lab

A research instrument for studying merchant-growth products. Each specimen is a real, public, logged-out flow (onboarding, signup, checkout, pricing), captured step by step, scored against a written rubric, and presented so a reader can form their own judgment before opening the Lab's notes.

Live site: https://mikeorme.github.io/merchant-growth-lab/

## How it works
- `data/corpus.json`: the 100-item queue. `data/experiences/`: captured and examined flows. `data/briefs/`: one brief per day.
- `data/rubric.json`: three lenses (the product, the flow, how it sells), each dimension scored 1 to 5 with cited evidence, or "n/t" when it can't be told.
- `capture/capture.mjs`: Playwright capture of one flow. Logged-out only, no purchases or real accounts, stops at an account form or bot check.
- `site/`: Astro static site. Blind-first scoring, filmstrip scrubber, compare, calibration. A reader's marks stay in their own browser.
- `scripts/validate.mjs`: schema and evidence checks, run before every deploy.

## Commands
```
npm install && npm --prefix site install
npx playwright install chromium
node capture/capture.mjs <corpus-id> [maxSteps]
npm run validate
npm run site:build
```

## Ground rules
Public pages only, cropped and attributed, dated at capture. Flows change. To request a correction or takedown, open an issue.

Design notes: `docs/design/`. Value assessment and follow-on features: `docs/product/`.
