# Engineering Case Study — PDX Benefits Navigator

PDX Benefits Navigator helps Portland residents find every benefit program they
qualify for — federal, Oregon, Multnomah County, and City of Portland — in about
three minutes. National screening tools stop at the federal and state layer; the
local layer is where most of the unclaimed money lives, and surfacing it is the
whole point of this app. ([Try the live demo](https://pdx-benefits-navigator.vercel.app/)
— no API key needed.)

This document covers the four engineering decisions that shaped the project, and
what each one cost. The [README](README.md) covers what the app does; this is
about why it's built the way it is.

## 1. The whole database is the prompt

There is no vector database, no retrieval step, and no rules engine. All 24
programs — income limits, jurisdiction requirements, trigger events, official
dollar ranges — are embedded in the system prompt, along with the 2026 Federal
Poverty Level, Oregon SMI, and Portland-area AMI tables. Claude sees the entire
eligibility picture on every request.

At this scale, retrieval would only add failure modes. The database is a few
thousand tokens; the one unforgivable error for this product is *not checking a
program someone qualifies for*, and RAG's characteristic failure is exactly
that — silently not retrieving the relevant document. Putting everything in
context makes that failure structurally impossible, and it means iterating on
eligibility rules is editing JSON, not tuning a pipeline.

The trade-off is that the prompt is the source of truth: eligibility logic lives
in natural language, not a deterministic state machine. That's a real cost (see
section 3 for how I measure it), and the approach has a ceiling — somewhere well
past 24 programs, context quality or cost would force a retrieval layer. I'd
rather cross that bridge when the program count demands it than pay for it now.

## 2. The server never sees anything

Personalized analyses run in the browser, streamed directly to Anthropic with an
API key the user pastes in. The app's server has no AI route, no database, and
no logging of responses; intake answers live in `sessionStorage`, the key in
`localStorage`, and the only server endpoint renders a PDF from data the browser
POSTs back.

For an app that asks about income, immigration status, disability, and
pregnancy, "we never see your data" isn't a policy promise — it's an
architectural fact. It also makes the app free to operate at any scale.

The honest cost: pasting an API key is a real adoption barrier for exactly the
audience this tool serves. Pre-baked demo personas soften that (the demos work
with no key at all), but the long-term answer is sponsor-funded server-side
analysis, which trades this architecture's purity for reach.

## 3. Grading the AI with receipts

An AI eligibility engine is a claim: *the model applies the rules correctly.*
The eval harness ([`npm run eval`](scripts/eval/run-eval.ts)) tests that claim.
I hand-derived ground truth for 14 households — working program-by-program
through the official rules, arithmetic documented in every case file — and
designed them adversarially: incomes a few hundred dollars on either side of the
SNAP and OHP cutoffs, a Gresham address baited with a 12% rent increase (inside
the county, outside the city — Portland programs must NOT match), a veteran who
rents (the property-tax exemption requires owning), a senior renter (same trap).
Each run scores program-set precision/recall, dollar plausibility against
official ranges, confidence calibration, and reasoning quality via an LLM judge
whose full transcripts are saved for audit.

The current scoreboard ([`evals/REPORT.md`](evals/REPORT.md)):

| case | F1 | precision | recall | $ in-range |
| --- | --- | --- | --- | --- |
| zip-gresham (jurisdiction trap) | 1.00 | 1.00 | 1.00 | 79% |
| veteran-renter (false-positive trap) | 1.00 | 1.00 | 1.00 | 92% |
| cliff-snap-over ($484 over the cutoff) | 0.87 | 0.77 | 1.00 | 88% |
| **Aggregate (14 cases)** | **0.97** | **0.96** | **0.99** | **93%** |

The eval earns its keep by what it caught. The model let SNAP through for a
household $484 *over* the 130% FPL cutoff — with an arithmetic error the judge
flagged. It repeatedly overrides the database's Oregon EITC income cap with its
own world knowledge. And it sometimes invents dollar figures outside official
ranges (a $16,000 OHP estimate against a $3,000–$6,000 published range) —
directly violating a project hard rule, now visible instead of anecdotal.

Two of my own mistakes are part of the record. First, the judge originally
graded reasoning without the FPL/SMI/AMI tables the engine sees, so it called
*correct* table citations "fabricated" — a 45% pass rate that was noise. Grading
the grader is part of eval engineering. Second, the first run proved my answer
key wrong twice: I had scored prospective OHP eligibility as satisfying
Lifeline's "enrolled in a qualifying program" path (enrolled ≠ eligible), and
I'd marked a senior household SNAP-ineligible when the model correctly applied
the federal elderly-household income-test waiver my database doesn't encode.
Both moved to the eval's `uncertain` bucket, which exists precisely so ambiguous
calls never inflate or deflate the score.

## 4. Keeping the numbers honest

The same discipline applies to the data underneath the model. A Zod schema and
invariant gate ([`npm run validate:data`](scripts/validate-data.ts)) validates
both the hand-curated seed and the merged runtime database, and fails CI if the
merge ever alters curated eligibility policy. Fixture regression tests pin each
demo persona's totals and signature programs. Every dollar figure in the
README's persona table is rewritten by a script from the baked fixtures — never
hand-typed. Lint, typecheck, data validation, tests, and a production build run
on every push.

## What I'd do differently

The eval surfaced two bugs in my *data*, not just the model: the EITC income cap
is too coarse (real limits for families run far higher), and the seed doesn't
encode the elderly-household SNAP waiver. Fixing rules beats fixing prompts.
Beyond that, the known next problem is the BYOK barrier — the architecture's
best property is also its biggest adoption cost, and a funded server-side path
is the likely successor.

---

*Built with [Claude Code](https://claude.com/claude-code) as a pair programmer.
The eval harness, including its ground-truth derivations, is in
[`scripts/eval/`](scripts/eval/).*
