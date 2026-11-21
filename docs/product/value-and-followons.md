# Merchant Growth Lab: value assessment and follow-ons

Date: 2026-11-21. Inputs: the Merchant Growth Lab plan and the career recommendations doc. Confidence is stated where it is a judgment call.

## Bottom line

The Lab is worth building if it is treated as an evaluation-and-judgment project that happens to have teardowns as its content. It is weak if it becomes a daily content feed. The plan's best ideas (blind-first scoring, calibration, hypothesis cards) are also its latest-phase ideas. I would pull them forward.

## Value to the owner

**Genuinely valuable**
- Blind-first scoring plus calibration trains Mike's own judgment and produces a real artifact: "where I and the model disagree, and who was right." That matches the career doc's emphasis on evaluation sets, inspecting disagreements, and not treating LLM scores as proof.
- Hypothesis cards (metric, guardrail, decision rule) are interview-ready material and exercise the impact-equation thinking the career doc asks for.
- 100 structured teardowns in his exact domain (commerce, subscription, checkout, merchant onboarding) create fluent, specific vocabulary for interviews.
- Public and dated, so it is a durable proof of process.

**Weak or likely vanity**
- Corpus size. "100 experiences" is an output count. Hiring managers will read three, not 100.
- The daily cadence. It feeds the plan's own named anti-goal (generic commentary) and Mike's time is the bottleneck, not the model's.
- Mismatch with the career doc: it recommends one narrow, 3-4 week project with a gold set and failure log. The plan is five phases and 100 items, with no gold set. Risk of a job search consumed by building.
- Observational teardowns without any outcome data are opinion. Without an about-me link, a recruiter cannot connect the Lab to Mike (the plan defers this deliberately; the cost is that it will not help the search until the link exists).

## Value to public visitors

- Useful: filmstrips with step counts and time, the claim-vs-evidence checker, and cross-corpus patterns. These are hard to get elsewhere.
- Weak: a daily "my read" from an anonymous-feeling site. Visitors have no reason to trust or return to it. Expect a small niche audience (growth PMs, founders). Do not plan on traffic as the success measure.
- Visitors' local scoring is a nice touch but will see low use.

## Value as a durable asset

Strong parts: JSON-plus-git data, schema validation, dated captures, versioned rubric. Weak parts: flows drift, so the corpus decays within months unless re-captured, and ongoing cost and maintenance fall on Mike. Durable value lives in the rubric, the patterns, and the calibration data, not the screenshots.

## Biggest risks to usefulness

1. **Daily-brief fatigue (high likelihood).** Reading and scoring one flow a day, blind, is 15-20 minutes. Expect it to lapse within weeks. Mitigation: ship 3 per week at most, or batch weekly; let the cron skip days.
2. **Rubric subjectivity (high).** 1-5 scores on "trust signals" or "value-prop clarity" drift. The plan's evidence requirement and "can't tell" option help, but only calibration data tells us if the rubric is meaningful. Without it, scores look rigorous and are not.
3. **Legal and ethical exposure (medium, severe if it hits).** Public screenshots of named third-party products with critical scores and "persuasion tactics / urgency patterns" labels read as public criticism of companies. Fair use is plausible but not guaranteed. Likely problems: ToS on automated access, trademark and logo use, and a takedown or complaint that is awkward while job-hunting, especially if a target employer or competitor of one appears. Also a real conflict risk: Mike's current employer's competitors (Shopify, Square, Wix, etc.) are in the corpus. Mitigation: have him check his employer's outside-activity and IP policy before publishing; avoid scoring companies he is interviewing with; use cropped images; frame as product analysis with sources, not verdicts; keep the takedown contact live; consider publishing scores only for flows where text claims are quoted.
4. **Model-read quality (medium).** Reads can sound specific without being right. Screenshot-only evaluation misses behavior (latency, state, what happens after signup).
5. **Scope and time (medium).** Plan size competes with interview prep, which the career doc ranks first.

## Success metrics

| Question | Metric | Target |
|---|---|---|
| Is the rubric meaningful? | Agreement of model vs. Mike (within 1 point) per dimension | 80% or higher after 15 flows; dimensions below 60% get rewritten or dropped |
| Does Mike keep using it? | Blind scores completed / briefs published | 70% or higher over 8 weeks |
| Is it improving his search? | Hypothesis cards or Lab examples used in interviews; recruiter or hiring-manager mentions | 3 or more interview uses in 60 days |
| Is the content good? | Share of reads Mike rates "specific, I'd use this" | 60% or higher |
| Is it useful to others? | Unprompted outside mentions, shares, or replies | 5 in 90 days. Visits are a weak signal. |
| Is it sustainable? | Monthly cost and weekly time | Within the ceiling Mike sets; under 2 hours per week |

Kill or shrink condition: if blind-score completion falls below 40% for 3 weeks, cut to weekly cadence and re-scope.

## Ranked follow-on features

### 1. Rubric calibration report (recommended)
- **Problem:** Scores that look precise but are unvalidated; the plan's strongest AI-skill proof is sequenced last.
- **User:** Mike first; hiring managers reading the case study second.
- **Smallest version:** Mike blind-scores 15 flows (5 each from 3 categories). A script computes per-dimension agreement against the model's scores and lists the top disagreements with who was right. One published page: method, results, rubric changes made, failure examples. No new UI; a CSV and a script.
- **Metric:** 80% within-1-point agreement on at least 6 of the rubric's dimensions after one revision cycle, plus a documented before/after rubric diff.
- **Why first:** It validates everything else, matches the career doc's gold-set requirement, and is the most interview-credible artifact.

### 2. Hypothesis-to-experiment brief
- **Problem:** Teardowns end in opinion. The career doc wants a metric, guardrails, decision rule, and sizing (users x behavior change x value).
- **User:** Mike (interview stories); PMs reading the site.
- **Smallest version:** From 5 evaluated flows, produce a one-page experiment brief each, including a sizing line labeled measured/modeled/directional. Mike edits and accepts or rejects.
- **Metric:** Mike accepts 50% or more with light edits; at least 2 become interview stories.

### 3. Weekly pattern note (replaces some daily briefs)
- **Problem:** Daily single-flow briefs fatigue; the insight is in cross-flow patterns.
- **User:** Public growth-PM audience.
- **Smallest version:** One weekly note naming a pattern (e.g., trial gating before value) that cites 3 or more captured flows, with counts.
- **Metric:** 4 consecutive weekly notes, each citing 3 or more flows, plus 5 outside mentions in 90 days.

## Recommendation

Build #1 first, using the 3 pilot flows from Phase 1 extended to 15. It is cheap, converts the project from "I made a site" into "I measured whether my AI evaluator is any good," and it tells us whether daily briefs are worth continuing. Move cadence to 3 per week until it passes. Resolve the employer-policy and conflict-of-interest question before any public deploy.
