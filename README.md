# Merchant Growth Lab

A research instrument for studying merchant-growth products. Each specimen is a real, public site surveyed logged-out the way a buyer would: products, pricing, developer platform, solutions, customers, company, then signup. Pages are captured, their text saved, and the site scored against a written rubric, and presented as a site survey: the pages, a summary of the site's messaging, and the Lab's notes.

Live site: https://mikeorme.github.io/merchant-growth-lab/

## How it works
- `data/corpus.json`: the 100-item queue. `data/experiences/`: captured and examined flows. `data/briefs/`: one brief per day.
- `data/rubric.json`: three lenses (the product, the flow, how it sells), each dimension scored 1 to 5 with cited evidence, or "n/t" when it can't be told.
- `capture/capture.mjs`: Playwright survey of one site. Follows the site's own top-level nav (about 14 pages full, about 6 with `--lite`), saves each page's screenshot and text, then the signup path. Logged-out only, no purchases or real accounts, stops at an account form or bot check.
- `data/captures/<id>/page-N.txt`: saved page text. `data/evaluations/<id>.json`: the Lab's dossier, scores, notes and claims; `scripts/apply-evaluation.mjs` merges it into the experience. `npm run validate` checks that every claim appears verbatim on its page and that every price, percentage, count and colour in the Site messaging summaries appears in the captured text or measurements.
- `scripts/digest.mjs`: compact text view of a survey (page text plus measured design and merchandising signals). `scripts/montage.mjs`: one image of several pages' tops for design review.
- `data/corpus-retired.json`: flow-style queue items merged into whole-site entries on 2026-11-22.
- `site/`: Astro static site. Page-by-page survey viewer, site messaging summaries, the Lab's notes and scores, archive and compare.
- `scripts/validate.mjs`: schema and evidence checks, run before every deploy.

## Commands
```
npm install && npm --prefix site install
npx playwright install chromium
node capture/capture.mjs <corpus-id> [maxPages] [--lite | --home-only | --signup-only | --signals-only]
npm run validate
npm run site:build
```

## Ground rules
Public pages only, cropped and attributed, dated at capture. Flows change. To request a correction or takedown, open an issue.

Design notes: `docs/design/`. Value assessment and follow-on features: `docs/product/`.
