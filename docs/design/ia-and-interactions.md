# Merchant Growth Lab: IA and Interaction Spec (v1)

Source: docs/merchant-growth-lab/2026-11-21-plan.md. Static Astro, GitHub Pages, base `/merchant-growth-lab/`. All internal links use `import.meta.env.BASE_URL`; never hardcode a leading `/`.

## 1. Routes
| Route | View |
|---|---|
| `/` | Today (latest brief) |
| `/briefs/YYYY-MM-DD/` | Past brief (same layout as Today) |
| `/archive/` | Grid + filters (state in query string) |
| `/experience/<id>/` | Full experience |
| `/compare/?ids=a,b,c,d` | 2-4 side by side (client-read query) |
| `/patterns/`, `/patterns/<tag>/` | Pattern index and detail |
| `/calibration/` | Divergence dashboard |
| `/data/` | Export, import, reset, rubric-feedback export, takedown contact |
| `404.astro` | Not found with link to Archive |

Global nav: Today, Archive, Patterns, Compare, Calibration, Data. Footer: takedown contact, rubric version, capture-date note.

## 2. Page hierarchy
- **Today**: H1 = flow in one sentence (product, flow, capture date). 1) Three pre-read questions + scorecard (blind). 2) Filmstrip scrubber. 3) "What it's trying to do." 4) Locked "My read" panel (pros/cons/how it sells, hypothesis card, claims) revealed after submit. 5) Sources. Read content is never rendered above the lock.
- **Archive**: filter bar (category, lens, score range, status: unseen / scored by you / backlog / captured / evaluated), sort, count. Cards: thumbnail, name, category, capture date, my overall score (hidden until you've scored, per setting), your-score chip.
- **Experience**: header (name, flow, date, confidence, unknowns), filmstrip, scorecard, my read, rubric table (dimension, my score, cited screenshot/quote, yours), claims, pros/cons with feedback buttons, hypothesis, pattern tags, sources, link to Compare.
- **Compare**: picker, sticky dimension rows x experience columns, deltas highlighted, step-count/click/time summary row, your scores overlaid.
- **Patterns**: tag list with counts, definition, example screens (linked to experience step), anti-pattern flag.
- **Calibration**: headline agreement %, per-dimension gap bars (signed), time series, list of biggest divergences, "can't tell" excluded and counted separately.

## 3. Blind-first scoring
State machine per experience (`scoreState`): `unscored -> scoring -> submitted -> revealed`. 
- `unscored`: scorecard shown, read locked. Edit starts `scoring`.
- `scoring`: draft autosaves (debounced 500ms). Submit enabled when verdict (1 line, required) and at least one dimension scored; others may be "can't tell". Per dimension: 1-5 or can't tell, optional note, optional cited step.
- `submitted`: scores frozen (edit via explicit "Revise" which keeps `revisedAt`, and marks the diff vs. original). Reveal button appears; auto-reveal is not done.
- `revealed`: read unlocks; agreements (|delta|<=0) vs gaps (|delta|>=2 flagged) shown per dimension; "Revisit your score" offered but original is retained for calibration.
- Reload restores the state. Reveal without scoring: "Skip, just show me" allowed; sets `skipped:true`, excluded from calibration.

localStorage key `mgl:v1` (single JSON blob, wrapped in try/catch, in-memory fallback with banner when unavailable):
```json
{
  "schemaVersion": 1,
  "rubricVersion": "1.0.0",
  "settings": {"persona":"solo","viewport":"desktop","hideMyScores":true},
  "scores": {
    "<experienceId>": {
      "state":"revealed","skipped":false,
      "startedAt":"ISO","submittedAt":"ISO","revealedAt":"ISO","revisedAt":null,
      "verdict":"string",
      "dims": {"<dimId>":{"score":4,"cantTell":false,"note":"","step":3}},
      "fiveSecond": {"answers":{"does":"","for":"","cost":""},"at":"ISO"},
      "questions": {"q1":"","q2":"","q3":""}
    }
  },
  "claims": {"<experienceId>": {"<claimId>":{"agree":true,"yourTag":"unsupported"}}},
  "hypotheses": {"<experienceId>":{"status":"accepted|rejected|edited|pending","edited":{"metric":"","guardrail":"","rule":""}}},
  "tags": {"<experienceId>": [{"step":2,"tag":"default-plan"}]},
  "feedback": [{"experienceId":"","target":"pro:2","vote":"down","comment":"","at":"ISO"}]
}
```
Migrations: `migrate(blob)` steps by `schemaVersion`; unknown newer version is refused (read-only, prompt to export). Draft scores keyed by `rubricVersion`; on rubric change old scores are kept and marked "scored on 1.0.0".

Export: `{"app":"merchant-growth-lab","exportedAt":"ISO","schemaVersion":1,"data":<blob>}` downloaded as `mgl-export-YYYY-MM-DD.json`. Import: validate shape, show summary (n scores, n feedback), choose Merge (newer `submittedAt` wins per experience) or Replace; always offer a pre-import backup download.

## 4. Filmstrip scrubber
- Horizontal thumbnails + large stage. Viewport toggle desktop/mobile (separate capture sets).
- Metric ribbon (aria-live polite, throttled): Step n/N, clicks so far, elapsed (mm:ss from step log), fields filled so far. Cumulative values come from the capture step log, not computed in the browser.
- Scrub: drag handle, click thumbnail, Left/Right, Home/End. Step change updates URL hash `#step=3` (shareable).
- Per-step: caption, my annotation pins (numbered, tab-focusable, popover on Enter), wall/blocked marker, friction flag, tag button.
- Sparkline under the strip of cumulative clicks/time with step-jump spikes marked.
- Preload next image; WebP with explicit width/height; alt text = step caption.

## 5. Claim vs evidence checker
List of extracted claims (verbatim quote, source step). Tag: proven / plausible / unsupported plus "evidence at step N" link (jumps and highlights in scrubber) or "no evidence found" with the steps searched. Filter by tag; summary bar (counts). Hidden behind reveal. User can mark "I disagree" and set their own tag (stored); disagreements feed Calibration.

## 6. Hypothesis cards
Fields: statement, metric, guardrail, decision rule, expected direction. Actions: Accept, Edit (inline, three fields, Save/Cancel), Reject (optional reason). Status chip persists. "Accepted" cards are listable on `/data/` and copyable as Markdown.

## 7. Keyboard and accessibility
- Skip link, landmarks, one H1, logical heading order. Visible focus ring, 3:1 minimum.
- Scrubber: `role="slider"` with `aria-valuenow/valuetext` ("Step 3 of 10, 2 clicks, 0:42"); thumbnails as buttons in a `listbox`; Left/Right, Home/End, PageUp/PageDown jump 3. Do not hijack arrows globally.
- Score inputs: radio groups (1-5 + Can't tell), labeled with rubric descriptor text; number keys 1-5 only while group focused.
- Reveal: focus moves to the read heading; announce via polite live region. Locked panel uses `inert` + visible text, not just CSS blur.
- Dialogs (import, compare picker) trap focus and restore it. Esc closes.
- Light/dark/system toggle (radiogroup), no FOUC: inline head script. `prefers-reduced-motion` disables scrub animation and transitions. Color never sole signal (tags carry text/icon). Contrast AA. Touch targets 44px.
- No-JS: all read-only content renders; interactive islands show a "needs JavaScript" note and the read is visible only via a plain "Show read without scoring" link (progressive enhancement).

## 8. Mobile
- Single column; nav collapses to a menu button. Scorecard is a sticky bottom sheet with step-through one dimension at a time.
- Filmstrip: stage full-width, swipe to scrub, thumbnails in a snap-scroll row; metric ribbon pinned beneath stage. Pinch-zoom allowed on stage.
- Compare: max 2 columns on phones, horizontal scroll with sticky label column. Archive filters in a drawer.
- Images use `srcset`; lazy-load all but the first.

## 9. Empty and error states
- No brief yet / brief failed: Today shows the logged failure message from the day's brief JSON, links to the last good brief.
- Archive empty or no filter match: "No matches" + Clear filters. No scored items: Calibration says "Score 5 experiences to see divergence" with progress count.
- Experience with blocked flow: wall shown as finding, remaining steps absent, scores limited.
- Image fails: placeholder with caption and "open source" link. Unknown `id`: 404.
- localStorage unavailable/quota: persistent banner, scores kept in memory, Export prompt. Corrupt blob: quarantine copy to `mgl:v1:corrupt`, start fresh, offer download. Bad import: list the first 5 validation errors; nothing is written.
- Stale capture (>180 days): "Captured <date>, this flow may have changed" badge.

## 10. Components (Astro islands)
Static Astro: `Layout`, `Nav`, `ThemeToggle`(tiny inline script), `ExperienceCard`, `RubricTable`, `SourceList`, `Footer`.
Islands (`client:load` unless stated):
- `ScoreCard` props: `experienceId, rubric, steps, readSlot` (the locked read is a slot rendered in HTML but `inert`).
- `Filmstrip` props: `steps[{n,img,caption,clicks,elapsedMs,fields,annotations,blocked}], viewport, initialStep`.
- `MetricRibbon` props: `step, steps`.
- `ClaimChecker` props: `experienceId, claims[{id,quote,tag,evidenceStep}]`.
- `HypothesisCard` props: `experienceId, hypothesis`.
- `FiveSecondTest` props: `image, durationMs=5000, questions` (`client:visible`).
- `ArchiveFilters` props: `items, initialQuery` (`client:load`), `CompareTray` props: `max=4`.
- `CalibrationChart` props: `experiences, rubric` (`client:visible`).
- `DataPanel` (export/import/reset). `useStore` shared module: load/migrate/save, `subscribe`, cross-tab via `storage` event.

## 11. Weak or missing in the plan
1. **Today vs blind-first conflict**: plan says Today shows "my read"; must be locked by default. Also the brief's three questions and the rubric scorecard overlap; unify (questions become the verdict + five-second prompts).
2. **Spoilers in a static site**: the read ships in HTML, so blind-first is an honor system. Acceptable; say so, don't claim enforcement. Alternative is a separate read JSON fetched on reveal (still visible in network tab).
3. **Calibration is starved**: one brief a day, and scoring is per visit. Needs Archive "score this one" entry and a minimum-sample threshold, or the view is empty for months.
4. **Rubric feedback has no path back to me**: export file sits on Mike's disk. Need a defined handoff (drop file in repo `feedback/`, or a GitHub issue template).
5. **Cross-device**: localStorage is per browser; Mike on phone and laptop diverge. Export/import is manual friction; consider a "copy sync code" or documenting this limit.
6. **Persona toggle (4) and five-second test (5)** need per-persona annotation data or extra model tokens; the plan defers them but doesn't say where persona data lives. Schema should reserve `personas` now.
7. **Rubric versioning vs stored scores**: unspecified. Handled above, but needs a decision whether calibration spans versions.
8. **Pattern tagging ownership**: unclear whether tags are mine, yours, or both; and whether Patterns aggregates only my tags (public) or includes local ones.
9. **Missing**: permalinks for steps, mobile-viewport capture view, print/copy-hypothesis export for interview stories, staleness handling, and a settings option to hide my scores in Archive to avoid anchoring.
10. **Public visitors**: plan says visitors' notes stay local, but Archive "scored by you" and Calibration frame the UI for one person. Decide if it's single-user tooling with a public face, and word copy accordingly.
