# ARCHITECTURE.md

Machine-oriented blueprint. Read this before touching code. Prose rationale lives in `README.md` and `CASE_STUDY.md`; rules live in `CLAUDE.md`. This file is the map.

## 0. Identity

```
what:     BYOK eligibility screener for Portland, OR benefit programs (federal → city)
stack:    Next.js 16 App Router · React 19 · TS · Tailwind 4 · shadcn · zod 4 · @anthropic-ai/sdk
runtime:  Vercel (Node), one server route. All AI calls run in the browser with the user's key.
data:     24 programs in JSON, embedded whole into the system prompt. No DB. No vector store.
model:    ELIGIBILITY_MODEL in lib/eligibility.ts (shared by runtime, bake, eval)
verify:   npm run lint && npm run typecheck && npm run validate:data && npm test && npm run build   (== CI)
```

## 1. Layers

```
┌ app/            routes (pages + 1 API route)                                  ─┐
├ components/     brand/ intake/ landing/ results/ ui/(shadcn)                   │ UI, client-only
├ lib/            engine: prompt, browser client, schema, cache, i18n, pdf, ics  ┘
├ types/          program.ts = the shared vocabulary (Program, IntakeData, AnalysisOutput)
├ data/           programs.seed.json → programs.json (runtime) ; scenarios/*.json (demo fixtures)
├ scripts/        data pipeline (scrape/merge/validate), bake, eval harness
└ evals/          REPORT.md scoreboard (runs/ is gitignored)
```

Dependency direction: `app → components → lib → types/data`. `scripts` import `lib` directly (Node, via tsx). Nothing imports from `app`.

## 2. Request flow (live path)

```
/intake  ConversationalForm ──writes──▶ sessionStorage.pdx_intake (IntakeData)
                                       clears pdx_prebaked, pdx_demo_simulate
   │ router.push
   ▼
/results  app/results/page.tsx   decision order in the mount effect:
   1. pdx_prebaked present?     → demo path (§3), never calls Claude
   2. no pdx_intake?            → redirect /intake
   3. no apiKey (useApiKey)?    → state 'needs-key' (ApiKeyControl UI)
   4. resultsCache hit?         → state 'ok' (hash(intake) == cached hash)
   5. else analyzeEligibilityStream(apiKey, intake)
         'progress' {programId} → progress bar, ids regex-sniffed from streamed JSON
         'complete' {output}    → cacheAnalysis + state 'ok'
         'error'    {message}   → state 'error'
   ▼
dashboard: MoneyCounter · FilterChips · BenefitCard[] · ComparisonChart · NearMissSection ·
           UrgencyBanner · RenewalCalendar(.ics via lib/calendar) · LanguageToggle
   ├ "Download packet"  POST /api/packet {intake, analysis} → PDF (lib/packet.tsx + QR codes)
   └ LanguageToggle es/vi → translatePayload() (browser, same key) rewrites string values only
```

`lib/claudeBrowser.ts::analyzeEligibilityStream` internals:

```
messages.stream(model, system=[PROMPT w/ cache_control ephemeral], user=JSON(intake),
                output_config=zodOutputFormat(AnalysisOutputSchema), max_tokens=64000)
→ parsed_output (structured) ?? parseAnalysis(JSON.parse(buffer))
→ retry ONCE on stop_reason=max_tokens or parse/validation failure; API errors are NOT retried
→ deriveEligibility → assertConsistency (warn only) → recomputeTotals → yield complete
```

Post-processing contract (`lib/eligibility.ts`):
- `deriveEligibility`: `eligible = requirements.every(r => r.met !== 'no')`; ineligible ⇒ value 0. Requirements are the audit trail; the model's own `eligible` flag is overridden when requirements exist.
- `recomputeTotals`: total / federal_only (federal+oregon) / pdx_specific (portland+multnomah) are recomputed from matches. Never trust model-supplied totals.
- `parseJsonObject`: translation path only. Eligibility uses structured output.

## 3. Demo path (no key)

```
/demo/[scenario]  (maria|james|rose)
   sessionStorage.pdx_intake        ← lib/scenarios.ts (IntakeData fixture)
   sessionStorage.pdx_prebaked      ← data/scenarios/<name>.json (AnalysisOutput fixture)
   sessionStorage.pdx_demo_simulate ← '1'   (results page fakes streaming progress, then clears)
   router.replace('/results')
```

Fixtures go stale whenever the prompt, model, or programs change. Re-bake: `npm run bake` (needs `ANTHROPIC_API_KEY` in `.env.local`; runs `analyzeEligibilityStream` in Node).

## 4. Browser state (complete list)

| key | store | shape | writer | reader |
|---|---|---|---|---|
| `pdx_anthropic_key` | localStorage | string | lib/userKey.tsx | `useApiKey()` everywhere |
| `pdx_intake` | sessionStorage | IntakeData | ConversationalForm, demo route | results page, packet download |
| `pdx_analysis` | sessionStorage | `{hash, output}` | lib/resultsCache.ts | results page |
| `pdx_prebaked` | sessionStorage | AnalysisOutput | demo route | results page |
| `pdx_demo_simulate` | sessionStorage | `'1'` | demo route | results page (clears after simulation) |

Nothing else persists. No cookies, no server storage, no analytics on answers.

## 5. Data pipeline

```
programs.seed.json (curated, source of truth)
      │  scripts/scrape-programs.ts (Firecrawl, optional)  →  programs.scraped.json (+_provenance)
      ▼
scripts/merge-scraped.ts  ──▶  programs.json (runtime artifact; scraped nulls never overwrite seed)
      │                         KEEP_SEED set = per-program opt-out of merge
      ▼
scripts/validate-data.ts  (npm run validate:data, in CI)
   asserts: zod schema on BOTH files · merge did not change curated eligibility policy ·
            SMI/AMI percentages never stored in income_max_pct_fpl
```

Edit programs in the seed, run `npm run merge` then `npm run validate:data`, then re-bake fixtures. `data/programs.report.md` records which fields are evidence-verified vs seed-derived.

Program schema essentials (`types/program.ts`): `id`, `jurisdiction` (federal|oregon|multnomah|portland), `hidden_gem`, `urgency`, `estimated_annual_value{min,max,median}`, optional `benefit_schedule` (authoritative when present), `eligibility.*` (income by `income_basis` fpl|smi|ami; boolean status gates; `triggered_by_event`).

## 6. Eval harness

```
npm run eval [-- caseId ...] [-- --runs N]      scripts/eval/run-eval.ts
   cases/     14 ground-truth EvalCase (personas + income-cliff pairs + trap cases)
   scorers.ts pure: program-set F1, dollar in-range vs programs.json, confidence agreement
   judge.ts   LLM judge (Haiku) grades reasoning per match
   report.ts  → evals/REPORT.md scoreboard (+ evals/runs/*.json, gitignored)
```

Run it after any prompt or model change. The scoreboard in `evals/REPORT.md` is the merge evidence.

## 7. Invariants (break these and the product is wrong)

1. All 24 programs go to Claude on every analysis. No pre-filtering. `hidden_gem` programs are the product.
2. Dollar estimates must fall inside the program's `estimated_annual_value` or `benefit_schedule`. The eval dollar scorer enforces this.
3. Only server route is `/api/packet` and it does PDF rendering. No `ANTHROPIC_API_KEY` on the server hot path.
4. Intake never leaves the browser except inside the Anthropic request and the packet POST.
5. Demos work with no key. Re-bake after prompt, model, or data changes.
6. Output is framed as estimates requiring caseworker verification.

## 8. Gotchas the code does not confess

- `ELIGIBILITY_MODEL` is advertised in the README badge. `npm run sync:readme` syncs numeric claims; change model and badge together.
- Adaptive thinking was tried and removed: multi-minute streams, no accuracy gain. Do not re-add without eval evidence.
- Progress events come from regex-sniffing `"program_id"` in the partial stream, so progress order equals model output order, not program order.
- Results page effect is guarded against React StrictMode double-invocation; `pdx_demo_simulate` is removed only after the fake stream finishes.
- `translatePayload` returns a full re-parsed object; program ids and numbers must survive untouched. `LanguageToggle` keeps the English original and swaps views.
- ES/VI chrome strings are AI-generated at runtime via the same key. `lib/i18n.ts` only ships English.
- `app/opengraph-image.tsx` runs under Satori: flexbox only, explicit `display:flex` on every wrapper, WOFF/TTF fonts from `app/_fonts/`.
- `docs/`, `evals/runs/`, `.env.local` are gitignored. Plans and specs under `docs/superpowers/` are local-only.
- `v1.0-hackathon` tag and the `-hackathon` Vercel alias are frozen. Ongoing work is `main`.

## 9. Where to edit for common changes

| change | touch | then |
|---|---|---|
| eligibility rule or wording | `lib/eligibility.ts` (prompt) | `npm test`, `npm run eval`, `npm run bake` |
| add/edit program | `data/programs.seed.json` | `npm run merge && npm run validate:data && npm run bake` |
| output shape | `types/program.ts` + `lib/eligibilitySchema.ts` + prompt schema block | tests in `lib/__tests__` |
| results UI | `app/results/page.tsx`, `components/results/*` | `/demo/maria` for keyless visual check |
| intake question | `components/intake/ConversationalForm.tsx`, `IntakeData` type, `lib/scenarios.ts` | re-bake |
| PDF | `lib/packet.tsx` | POST `/api/packet` locally |
| model | `ELIGIBILITY_MODEL` + README badge | eval + bake |

## 10. Size map (largest files, for context budgeting)

```
app/results/page.tsx                  ~1200 lines   dashboard + state machine
components/intake/ConversationalForm  ~1000         wizard, validation, sessionStorage writes
app/page.tsx / app/about/page.tsx     ~850 / ~800   landing + about, mostly markup
scripts/scrape-programs.ts             ~550         Firecrawl, not on the runtime path
components/results/BenefitCard.tsx     ~500
lib/packet.tsx                         ~360         react-pdf document
```

Read `types/program.ts` and `lib/eligibility.ts` first. Read the results page only for UI work.
