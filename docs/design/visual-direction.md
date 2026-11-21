# Merchant Growth Lab: visual direction

## Concept: the specimen cabinet, not the dashboard

The lab is a **natural-history study room that took up product analysis**. Each flow is a *specimen*: pinned, numbered, photographed in sequence on a **plate**, then described in a *field note* with a score *sheet*. Mike is the examiner; the Lab (the model) is a second examiner whose notes are sealed until he writes his own (blind-first scoring is literally "sealed envelope").

Why it fits: the product is about *observation under controlled conditions*, which is what a specimen plate is. The metaphor also gives structural answers for free: accession numbers (`MGL-0042`), plate captions, a catalogue (Archive), side-by-side plates (Compare), a marginalia column (annotations), a ledger (Calibration). It is paper-and-ink at heart, so it stays fast and static.

Not a sterile "science lab" (no beakers, no teal-on-white clinical look). Think museum label plus lab notebook plus printed journal.

## Anti-patterns (banned)

1. Purple/indigo gradients, glow, glassmorphism, blurred blobs.
2. Inter/system-sans everywhere; a single font doing every job.
3. Rounded 16px cards with soft drop shadows as the default container. Containers are ruled boxes, 0 radius, hairlines.
4. Hero with headline + two buttons + three feature cards; "Features", "How it works", "Get started".
5. Emoji or Lucide-style icon stacks as decoration. Use numerals, glyphs (`§ ¶ ↳ ◐`), and rules.
6. Gauge rings, radar charts, 5-star ratings, traffic-light red/green dots.
7. Pill badges in six pastel colors. Tags are small-caps text with a hairline underline.
8. Scroll-jacked reveals, fade-up-on-every-section, parallax, typing animations.
9. "Supercharge / unlock / AI-powered" copy; sparkle icons.
10. Pure white and pure black backgrounds; blue-black dark mode.
11. Screenshots floating in device mockups or tilted 3D frames.

## Typography (Google Fonts, self-host the WOFF2 for GitHub Pages)

- **Display and text: Newsreader** (variable, opsz 6-72, italic). Large sizes at weight 400-500 with tight tracking (-0.01em); body at opsz 16. A text serif carries the "journal" voice and reads well long-form.
- **Labels and UI: IBM Plex Sans Condensed** 500, caps, +0.08em. Used for plate captions, nav, filters, table heads.
- **Data: IBM Plex Mono** 400/500, tabular figures, for scores, timings, accession numbers, step metrics.

Scale (1.25): 12 label / 14 small / 17 body / 21 lead / 26 h3 / 30-42 h2 / 40-72 h1. Body 17px, lh 1.55, measure 66ch. Italic Newsreader for the Lab's read; roman for Mike's. Headings are sentences ("Stripe's trial asks for a card before first value"), not nouns.

## Color

Warm paper, graphite ink, **one** accent (vermilion, like a correction pen / accession stamp). Dark mode is a *darkroom*: warm black, paper-colored ink, safelight orange. Tokens are in `tokens.css` (contrast measured vs `--bg`: ink 15.2, ink-2 8.2, mute 5.7, signal 5.2; dark: 14.9 / 9.9 / 6.3 / 8.3). Signal is for the current item, the stamp, links on hover, and the Lab's data series; never for decoration or large fills. Hairline `--rule` is decorative only.

## Layout grid

12-col, 1200px max, 24px gutters (16 on mobile), with a persistent **marginalia column**: content in cols 1-8, annotations/metrics in cols 9-12 (below the content on mobile). Asymmetry is the identity: a narrow left rail carries the accession number and nav labels, set vertically on desktop. Vertical rhythm on a 4px base, section breaks are 2px rules with a section mark (`§ 03`), not whitespace plus a background-color change. Archive is a dense catalogue table with small thumbnails, not a card wall; a plate grid is secondary.

## Screenshots and filmstrips: the plate

- Each frame is a **mounted print**: 1px ink keyline, 12px paper mat (`--panel`), no radius, no shadow. Caption below in label type: `PL. 3 / 7 · STEP 3 · 00:41 · 6 CLICKS`.
- Filmstrip is a horizontal contact sheet: frames separated by a thin ruled gutter with the step number set in mono; the active frame gets a 2px `--signal` underline, not a glow.
- Annotations are **numbered callouts** (small mono numerals in a 1px circle on the image, matching a list in the marginalia column), plus hairline leader lines. Pro/con markers use `+` and `-` glyphs.
- Mobile screenshots are shown at true aspect in a narrow plate beside the caption, never stretched. Always set width/height and alt text; lazy-load below the fold. Redacted regions are solid ink blocks labelled `REDACTED`.
- Scrubber ribbon is a ruler: tick per step, mono readouts.

## Data viz (follows the dataviz skill)

- Rubric scores are 1-5 ordinal, so use a **dot plot on a ruled 1-5 scale** per dimension (one row each, grouped by Lens), not radar/gauge. Common baseline, zero distortion, direct value in mono at row end.
- Two series only: **Mike = blue (`--d-you`), Lab = vermilion (`--d-lab`)**. Validated: CVD dE >= 21, normal dE 28, both pass lightness/chroma/3:1 on light and dark surfaces. Shapes also differ (Mike filled circle, Lab open diamond) and rows are directly labelled, so color is never the sole encoding.
- Gap between the two = a 2px connector line; the divergence is the story (Calibration view). Annotate only outliers with text.
- Sequential heat (Archive scores) uses the single teal ramp `--d-seq-1..5`, light to dark. Numerals printed in cells.
- "Can't tell" is a **hatched** hollow cell (45 degrees, `--d-na`) with the text `n/t`, never zero or blank. Confidence is shown as a stated word, not a shrinking opacity.
- Good/bad use `--d-good`/`--d-bad` only with `+`/`-` and a word. Every chart has a table view toggle and tooltips/hover on dots (hit target 24px).

## Texture and motion

- Texture: static paper grain (SVG noise, `--grain-opacity` .05/.07, fixed, under content only), 1px rules, optional registration crop-marks on plate corners (CSS pseudo-elements). No texture behind text blocks that lowers contrast.
- Motion is *mechanical, short, purposeful*: filmstrip advance 160ms `--ease` linear slide; reveal of the Lab's read is a 240ms "unseal" (clip-path wipe of a ruled band); focus/hover are 120ms color changes. Nothing loops, nothing animates on scroll.
- `prefers-reduced-motion`: all transitions collapse to instant (see tokens.css); the unseal becomes a plain state change with an `aria-live` announcement. Respect `prefers-color-scheme` first, with a manual toggle stored in localStorage (try/catch).

## Microcopy tone

Dry, specific, first-person examiner. Past-tense observations, hedged claims, numbers over adjectives. "Card requested at step 2, before any value shown." "Unsupported: '10,000 merchants' has no source on the page." Buttons are verbs in lowercase-ish plain words: "Score blind", "Reveal the Lab's read", "Add to compare". Empty states explain the next action ("No plates yet. Today's brief files at 5:00."). Errors say what happened and what to do. No exclamation marks, no "Oops", no "Let's".

## Finish gate (reviewer checklist; all must pass)

- [ ] Squint test: the page is recognizably *this* site with the logo removed (paper, ruled sections, plate frames, serif display).
- [ ] No banned pattern from the list above present; no hero-plus-three-cards; no emoji.
- [ ] Three type roles (serif, condensed caps, mono) are used consistently; no stray sans body text.
- [ ] Only one accent hue outside data; signal never used as a large fill.
- [ ] All text >= 4.5:1 in BOTH themes (checked, not assumed); focus ring visible on every control; 44px touch targets.
- [ ] Every screenshot has caption, accession/step number, alt text, explicit dimensions.
- [ ] Charts: common baseline, two-series validation holds, direct labels, a table view, no color-only meaning, `n/t` rendered hatched.
- [ ] Reduced motion tested; no scroll-triggered animation; works with JS disabled for the Today and Experience pages.
- [ ] 320px width has no horizontal page scroll (filmstrip scrolls inside its own container, keyboard-reachable).
- [ ] Copy read aloud: no marketing adjectives, every claim has a number or a plate reference.
- [ ] Lighthouse a11y >= 95 and no layout shift from images or font swap (`font-display: swap` plus size-adjust fallback).
