# 🌹 PDX Benefits Navigator

> An AI navigator that helps Portland residents discover every federal, Oregon, Multnomah County, and City of Portland benefit program they qualify for — in about three minutes, with a downloadable application packet.

<p align="center">
  <a href="https://pdx-benefits-navigator.vercel.app/"><strong>🚀 Live demo</strong></a>
  &nbsp;·&nbsp;
  <a href="CASE_STUDY.md"><strong>📖 Engineering case study</strong></a>
  &nbsp;·&nbsp;
  <a href="evals/REPORT.md"><strong>📊 Eval scoreboard</strong></a>
  &nbsp;·&nbsp;
  <a href="ARCHITECTURE.md"><strong>🗺️ Architecture</strong></a>
</p>

<p align="center">
  <a href="https://github.com/NathanPickard/pdx-benefits-navigator/actions/workflows/ci.yml"><img src="https://github.com/NathanPickard/pdx-benefits-navigator/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Claude-Sonnet%204.6-d97757?logo=anthropic" alt="Claude Sonnet 4.6">
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

<p align="center">
  <em>Built for the 2026 AI Portland Build Challenge, then hardened with an eval harness and data-integrity gates. Solo project.</em>
</p>

---

## For engineering reviewers

If you have five minutes, this is what the repo is meant to show:

| Claim | Evidence |
|---|---|
| **The AI is graded, not trusted.** 14 hand-derived ground-truth households (income cliffs, jurisdiction traps, trigger events) score the live engine on program-set F1, dollar plausibility, confidence calibration, and LLM-judged reasoning. | [`evals/REPORT.md`](evals/REPORT.md) — aggregate F1 0.97, precision 0.96, recall 0.99, 93% of dollar estimates inside official ranges. Failures are listed, not hidden. |
| **Eligibility is derived, not declared.** The model must emit a per-requirement audit trail; code computes `eligible` from it and recomputes every dollar total. The model's own verdict is overridden. | [`lib/eligibility.ts`](lib/eligibility.ts) `deriveEligibility` / `recomputeTotals`, structured output via Zod in [`lib/claudeBrowser.ts`](lib/claudeBrowser.ts) |
| **Privacy by architecture.** Bring-your-own-key, browser-to-Anthropic streaming. The server has one route, and it renders a PDF. No database, no logging, nothing to breach. | [BYOK trust model](#-the-byok-trust-model), [`app/api/packet/route.ts`](app/api/packet/route.ts) |
| **Data integrity is a CI gate.** A Zod schema plus invariant checks guard both the curated seed and the merged runtime database, and assert the merge never altered eligibility policy. README dollar figures are script-generated from fixtures. | [`scripts/validate-data.ts`](scripts/validate-data.ts), [`scripts/sync-readme-numbers.ts`](scripts/sync-readme-numbers.ts), [CI workflow](.github/workflows/ci.yml) |
| **Trade-offs are written down.** Why the whole database is the prompt, what the eval caught, and what I would do differently. | [`CASE_STUDY.md`](CASE_STUDY.md), [`ARCHITECTURE.md`](ARCHITECTURE.md) |

Fastest way to see it working without a key: [María's demo](https://pdx-benefits-navigator.vercel.app/demo/maria).

---

## 📸 A quick look

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/landing.png" alt="Landing page" />
      <br/>
      <sub><b>Landing</b> — the $1.2B opening hook, a live preview showing what's possible for María's family, and a three-step explainer of how the navigator works.</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/demo-hub.png" alt="Demo hub" />
      <br/>
      <sub><b>Demo hub</b> — three pre-baked personas with their hero programs and expected annual benefits, all explorable without an API key.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/results.png" alt="Results overview" />
      <br/>
      <sub><b>Results overview</b> — total annual benefits found, side-by-side comparison vs. federal-only tools, time-sensitive urgency banners, priority briefs, and one-click PDF/calendar export.</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <img src="public/screenshots/results2.png" alt="Results detail" />
      <br/>
      <sub><b>Results detail</b> — per-program cards with confidence labels, plain-language eligibility reasoning, numbered application steps, document checklist, and the relevant city/state code citation.</sub>
    </td>
  </tr>
</table>

---

## 💸 The problem

Oregon families leave roughly **$1.2 billion** in unclaimed benefits on the table every year.

Most national benefit-screening tools only check **federal** programs (SNAP, Medicaid, WIC). They miss the layer of **state, county, and city** programs where Portland actually invests — programs like Renter Relocation Assistance, the Portland Clean Energy Fund, the SUN Service System, and the Water Bureau Discount.

For a typical Portland family, that gap is **$10,000–$25,000 per year**.

<!-- README:HOOK:START -->
> A federal-and-state screener gets María's family to **$33,039/yr**.
> PDX Benefits Navigator adds the local layer — Multnomah County + City of Portland — and brings the total to **$52,811/yr**. That's **$19,772 more** her family is owed but most tools never surface.
<!-- README:HOOK:END -->

---

## ✨ What it does

- 🤖 **Evaluates all 24 programs at once** — federal + state + county + city, in a single Claude call
- 🌍 **Speaks 3 languages** — English, Spanish, and Vietnamese, with AI-generated translation of the full results page
- 📋 **Conversational intake** — a 5-step, mobile-first wizard that takes about 3 minutes
- 💰 **Per-program dollar estimates** — grounded in official program ranges, with plain-language reasoning
- 📄 **Printable application packet** — server-rendered PDF you can take to a 211 office or a caseworker
- 📅 **Renewal calendar** — `.ics` export so you never miss a re-enrollment deadline
- 🔑 **Bring your own Anthropic key** — the app server never sees your data or your bill

---

## 🚀 Try it in 30 seconds

**No install required.** The three demo personas are pre-baked and load instantly — no API key needed:

- 👉 **[Open the app](https://pdx-benefits-navigator.vercel.app/)** (latest) · **[Hackathon snapshot](https://pdx-benefits-navigator-hackathon.vercel.app/)** (frozen at v1.0)
- 👉 [María — single parent, 2 kids, 12% rent increase](https://pdx-benefits-navigator.vercel.app/demo/maria)
- 👉 [James — disabled veteran, unemployed homeowner](https://pdx-benefits-navigator.vercel.app/demo/james)
- 👉 [Rose — senior on Social Security, Vietnamese-speaking](https://pdx-benefits-navigator.vercel.app/demo/rose)

To run the full intake with your own answers, click the **key icon** in the top right and paste an [Anthropic API key](https://console.anthropic.com/settings/keys). Your key is stored only in your browser.

---

## 👨‍👩‍👧 The three demo families

<!-- README:TABLE:START -->
| Family | Situation | Federal & state programs | PDX Benefits Navigator (full local layer) |
|---|---|---|---|
| **María & family** | Single parent, 2 kids, part-time at Fred Meyer, renter in Cully, Spanish-speaking, 12% rent increase | $33,039/yr | **$52,811/yr** across 18 programs |
| **James** | Single, disabled veteran, unemployed, owns home in St. Johns | $13,867/yr | **$22,695/yr** across 14 programs |
| **Rose** | Senior widow, Social Security only, owns home in Lents, Vietnamese-speaking | $12,887/yr | **$21,507/yr** across 13 programs |
<!-- README:TABLE:END -->

The gap comes from **hidden-gem** programs — 11 of our 24 are flagged this way, and no national tool surfaces them. Numbers are pulled directly from the [`data/scenarios/*.json`](data/scenarios/) fixtures by `npm run sync:readme`; the source of truth for ranges is [`data/programs.seed.json`](data/programs.seed.json).

---

## 🔐 The BYOK trust model

```
   ┌───────────────┐                       ┌──────────────┐
   │  Your browser │  ──── direct ─────▶  │ Anthropic API │
   │  (your key)   │                       └──────────────┘
   └───────────────┘
        ▲  │
        │  │ stored in localStorage only
        │  ▼
   ┌───────────────┐
   │ This app's    │  ⛔ never sees your key
   │ server        │  ⛔ never sees your intake
   └───────────────┘
```

Personalized analyses run **client-side** with a key you provide. The browser-side Claude client uses `dangerouslyAllowBrowser: true` — which is safe here because the key belongs to the end user, not the app operator.

- ✅ Your API key never leaves your browser (`localStorage`)
- ✅ Your intake answers never leave your browser (`sessionStorage`)
- ✅ No database, no logging of your responses
- ✅ The only server route is `/api/packet`, which renders the PDF from data you POST back — it isn't stored

---

## 🏗️ How it works

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  /            ── landing                                        │
│  /intake      ── 5-step wizard ──┐                              │
│  /demo/[id]   ── load pre-baked fixture from data/scenarios/    │
│                            │                                    │
│                            ▼ sessionStorage                     │
│  /results     ── streams analysis (via user's key) OR           │
│                  loads pre-baked fixture                        │
│                            │                       │            │
│                            ▼                       │            │
│                   Anthropic API                    │            │
│                   (streamed directly               │            │
│                    from browser)                   │            │
│                                                    │            │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                                     ▼
                                            ┌──────────────┐
                                            │ /api/packet  │
                                            │ (PDF render, │
                                            │  no AI)      │
                                            └──────────────┘
```

### Eligibility engine

[`lib/claudeBrowser.ts`](lib/claudeBrowser.ts) wraps the official Anthropic SDK and streams a structured analysis with a Zod output schema. The system prompt in [`lib/eligibility.ts`](lib/eligibility.ts) encodes:

- 2026 Federal Poverty Level, Oregon State Median Income, and HUD Area Median Income tables
- Portland ZIP-code map (so Claude knows `97203` = St. Johns, not Gresham)
- All 24 program rules — income limits, jurisdiction requirements, event triggers
- Confidence-level guidance (`high` / `medium` / `low`)

After the stream completes, code takes over: `eligible` is derived from the per-requirement audit trail, dollar totals are recomputed from the matches, and a truncated or invalid response is retried once. Prompt caching is applied to the system prompt, so repeat requests on the same key are cheap.

### No vector DB. No workflow engine.

The full programs database is embedded in the system prompt. Claude has the entire eligibility picture in context for every request — which means rules are iterated by editing JSON, not by re-plumbing pipelines. The case study explains [why this beat retrieval](CASE_STUDY.md#1-the-whole-database-is-the-prompt) for a 24-program corpus.

### Pre-baked demo fixtures

[`data/scenarios/maria.json`](data/scenarios/maria.json), `james.json`, and `rose.json` contain pre-computed `AnalysisOutput` payloads generated by the same engine and model as production. The `/demo/[scenario]` route loads the matching fixture into `sessionStorage`, then redirects to `/results`, which skips the API call when it sees the fixture key. **Demos work for everyone, with no key required and no API spend.**

---

## ✅ Keeping the numbers honest

An AI eligibility tool is only as trustworthy as its data, so the repo gates itself:

- **Eligibility evals** — [`npm run eval`](scripts/eval/run-eval.ts) scores the live engine against 14 hand-derived ground-truth households (income cliffs, jurisdiction traps, trigger events) across program-set accuracy, dollar plausibility, confidence calibration, and LLM-judged reasoning quality. The latest run is committed at [`evals/REPORT.md`](evals/REPORT.md), including every failure the scorers and judge flagged.
- **Schema + invariant gate** — [`npm run validate:data`](scripts/validate-data.ts) validates both the curated seed and the merged runtime database with Zod, and asserts the merge step never altered curated eligibility policy (income bases, thresholds, flags). CI fails if it does.
- **Fixture regression tests** — the test suite checks each demo persona's totals add up, that every match points at a real program, and that signature programs (like Renter Relocation for María) stay eligible after prompt or data changes.
- **Script-maintained README numbers** — every dollar figure in this README's persona table is rewritten from the baked fixtures by [`npm run sync:readme`](scripts/sync-readme-numbers.ts), never hand-typed.
- **CI on every push** — lint, typecheck, data validation, tests, and a production build ([workflow](.github/workflows/ci.yml)).

What the eval actually caught, and what changed because of it, is in the [engineering case study](CASE_STUDY.md#3-grading-the-ai-with-receipts).

---

## 🛠️ Tech stack

- **[Next.js 16](https://nextjs.org/)** App Router on **[Vercel](https://vercel.com/)**
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Anthropic Claude](https://www.anthropic.com/api)** — `claude-sonnet-4-6` for eligibility analysis (configurable in [`lib/eligibility.ts`](lib/eligibility.ts)), structured output via the SDK's Zod helper
- **[Tailwind CSS v4](https://tailwindcss.com/)** + custom **Rose City** design tokens (OKLCH palette, Lora + Plus Jakarta Sans pairing)
- **[shadcn/ui](https://ui.shadcn.com/)** + **[Base UI](https://base-ui.com/)** primitives
- **[react-hook-form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** for the intake wizard
- **[framer-motion](https://www.framer.com/motion/)** for the money counter + bar animations
- **[@react-pdf/renderer](https://react-pdf.org/)** for the printable application packet
- **[Firecrawl](https://www.firecrawl.dev/)** for the optional program-data scrape pipeline
- **Node test runner** (no test framework dependency) for unit and fixture tests

---

## 📋 The 24 programs

| Jurisdiction | Programs |
|---|---|
| **Federal** | SNAP · OHP/Medicaid · WIC · School Meals · ACP Internet |
| **Oregon** | ERDC childcare · Oregon EITC + Kids' Credit · PGE Income Discount · NW Natural GAP · LIHEAP + Energy Trust · Senior/Disabled Property Tax Deferral · Veterans Property Tax Exemption · Oregon TANF · 💎 Double Up Food Bucks |
| **Multnomah County** | Eviction Prevention Funds · SUN Service System · ADVSD case management · 💎 Multnomah Preschool for All · 💎 TriMet Low-Income Fare |
| **City of Portland** | 💎 Renter Relocation Assistance · 💎 Water Bureau Discount · 💎 PCEF Home Energy · 💎 Transportation Wallet · 💎 Inclusionary Housing |

💎 = **hidden gem** — 11 of the 24 programs are flagged this way. They're the ones no national tool surfaces, and they drive most of the dollar gap.

---

## 💻 Local development

```bash
git clone https://github.com/NathanPickard/pdx-benefits-navigator.git
cd pdx-benefits-navigator
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). Click the **key icon** in the top right to paste your Anthropic API key, or jump straight to a `/demo/*` route (no key required).

The full verification chain, identical to CI:

```bash
npm run lint && npm run typecheck && npm run validate:data && npm test && npm run build
```

### Environment variables

| Variable | Required? | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | Only for re-baking demo fixtures and running evals (`.env.local`) | [`scripts/precompute-scenarios.ts`](scripts/precompute-scenarios.ts), [`scripts/eval/run-eval.ts`](scripts/eval/run-eval.ts) |
| `FIRECRAWL_API_KEY` | Only for re-scraping program data | [`scripts/scrape-programs.ts`](scripts/scrape-programs.ts) |

No server-side `ANTHROPIC_API_KEY` is needed for normal operation. The personalized analysis path uses a key the user provides in their browser.

<details>
<summary><strong>Advanced: re-baking the demo fixtures</strong></summary>

If you change the system prompt, the model, or the program data, regenerate `data/scenarios/*.json` so the demos match live results:

```bash
npm run bake
npm run sync:readme
```

The bake script ([`scripts/precompute-scenarios.ts`](scripts/precompute-scenarios.ts)) calls `analyzeEligibilityStream()` from [`lib/claudeBrowser.ts`](lib/claudeBrowser.ts) directly in Node, using `ANTHROPIC_API_KEY` from `.env.local` and the same `ELIGIBILITY_MODEL` as the runtime. The sync script then rewrites the persona dollar figures in this README from the fresh fixtures.

The seed file [`data/programs.seed.json`](data/programs.seed.json) is the source of truth for program rules — `data/programs.json` is the live build artifact.
</details>

---

## 🚢 Deploy your own

The app is built for Vercel with zero configuration. Because AI calls happen client-side with user-provided keys, you can deploy publicly without any AI-related env vars — your account never pays for visitor analyses.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNathanPickard%2Fpdx-benefits-navigator)

The only server route is `/api/packet` (PDF generation), which has no AI cost. Demo scenarios are served from static JSON bundled with the build.

---

## 📂 Project structure

```
app/                          # Routes: landing, intake, results, demo, /api/packet
components/                   # brand/ intake/ landing/ results/ ui/ (shadcn)
lib/                          # Engine: prompt, browser client, Zod schema, cache, PDF, .ics
types/program.ts              # Shared vocabulary: Program, IntakeData, AnalysisOutput
data/                         # programs.seed.json → programs.json; scenarios/ fixtures
scripts/                      # Data pipeline (scrape/merge/validate), bake, eval harness
evals/                        # Committed eval scoreboard
```

[`ARCHITECTURE.md`](ARCHITECTURE.md) has the full map: request flows, every browser-state key, the data pipeline, invariants, and a where-to-edit table for common changes.

---

## ❓ FAQ

<details>
<summary><strong>Is this an official Portland or Multnomah County tool?</strong></summary>

No. This is an independent project built for the AI Portland Build Challenge. It's a discovery aid — always verify eligibility through the official program or a caseworker before applying.
</details>

<details>
<summary><strong>Is it free to use?</strong></summary>

The hosted app is free. Personalized analyses use an Anthropic API key you provide, and a single analysis costs well under a dollar. The three demo scenarios are pre-baked and cost nothing.
</details>

<details>
<summary><strong>Is my information private?</strong></summary>

Yes. Your intake answers live in your browser's `sessionStorage` only — they never reach our server, and there's no database. Your Anthropic API key is stored in `localStorage` and used to call Anthropic directly from your browser.
</details>

<details>
<summary><strong>How accurate are the dollar estimates?</strong></summary>

Every estimate is checked against the official benefit range published by the administering agency, and the eval harness reports how often the model stays inside it. Actual amounts depend on caseworker review and current funding cycles. Treat the results as a starting point, not a guarantee.
</details>

<details>
<summary><strong>Can I add a program?</strong></summary>

Yes — please! Open a PR against [`data/programs.seed.json`](data/programs.seed.json). The schema is in [`types/program.ts`](types/program.ts). New programs should include a citation to the official program page.
</details>

<details>
<summary><strong>Why "bring your own key"?</strong></summary>

Three reasons: (1) it keeps the project free for me to host, (2) visitor data never touches my server, and (3) it scales — any number of people can use the tool concurrently without rate-limit collisions. The trade-off is a real adoption barrier for the people who need this most, which the Limitations section owns.
</details>

---

## ⚠️ Limitations

- **Estimates only — not legal advice.** Verify with the program before applying.
- **Programs database is a snapshot.** Federal Poverty Levels update annually; local programs change funding cycles. Refresh `data/programs.seed.json` when rules change.
- **Eligibility logic is in the prompt.** A deliberate trade-off — makes the engine fast to iterate on, but rules are encoded in natural language rather than a deterministic engine. The eval harness is the guardrail.
- **AI-generated translations.** Spanish and Vietnamese bundles are produced live by Claude. Good, but not professionally certified.
- **BYOK is a barrier.** Pasting an API key is fine for reviewers and caseworkers, not for a family in crisis. A sponsored server-side key is the obvious next step and would need the privacy story reworked.

---

## 🤝 Contributing

PRs welcome, especially:

- New programs to add to the database
- Corrections to program rules or income thresholds
- Additional curated (non-AI) language translations
- Accessibility improvements

---

## 🙏 Credits & data sources

- **2026 Federal Poverty Level** tables (HHS)
- **Oregon Revised Statutes** for state-program rules
- **Portland City Code** + **Multnomah County** ordinances for local programs
- **211info**, **Multnomah County DCHS**, and **Oregon Food Bank** for community context

Built in Portland with **[Claude Code](https://claude.com/claude-code)** as a pair-programmer, a lot of coffee, and gratitude for the people who actually run these programs day to day.

---

## 📄 License

[MIT](LICENSE) © 2026 Nathan Pickard
