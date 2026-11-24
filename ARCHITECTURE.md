# ARCHITECTURE.md

Machine-oriented blueprint. Read this before touching code. Prose rationale lives in `README.md` and `CASE_STUDY.md`; rules live in `CLAUDE.md`. This file is the map.

## 0. Identity

```
what:     BYOK eligibility screener for Portland, OR benefit programs (federal → city)
stack:    Next.js 16 App Router · React 19 · TS · Tailwind 4 · Base UI · zod 4 · @anthropic-ai/sdk
runtime:  Vercel (Node), one server route. All AI calls run in the browser with the user's key.
data:     24 programs in JSON, embedded whole into the system prompt. No DB. No vector store.
model:    ELIGIBILITY_MODEL in lib/eligibility.ts (shared by runtime, bake, eval)
verify:   npm run lint && npm run typecheck && npm run validate:data && npm test && npm run build && npm run test:e2e
          (CI also fails on README drift from fixtures and on high/critical npm audit advisories in prod deps)
```

## 1. Layers

```
┌ app/            routes (pages + 1 API route)                                  ─┐
├ components/     brand/ demo/ intake/ landing/ results/ ui/(button, sonner)     │ UI, mostly client
├ lib/            engine: prompt, browser client, schemas, session state, cache, ┘
│                 i18n, pdf, ics, shared helpers; lib/results/ = pure results derivation
├ types/          program.ts = the shared vocabulary (Program, IntakeData, AnalysisOutput)
├ data/           programs.seed.json → programs.json (runtime) ; scenarios/*.json (demo fixtures)
├ scripts/        data pipeline (scrape/merge/validate), bake, eval harness
└ evals/          REPORT.md scoreboard (runs/ is gitignored)
```

Dependency direction: `app → components → lib → types/data`. `scripts` import `lib` directly (Node, via tsx); shared script helpers live in `scripts/lib/` (`loadDotEnvLocal`, `collectAnalysis`). Nothing imports from `app`.

Shared modules (use these instead of re-deriving):

| need | module |
|---|---|
| program list, lookup, counts, gem-first sort | `lib/programs.ts` (`PROGRAMS`, `PROGRAM_BY_ID`, `PROGRAM_COUNT`, `HIDDEN_GEM_COUNT`, `compareGemThenValue`) |
| money and number formatting (en-US) | `lib/estimate.ts` (`formatUsd`, `formatNumber`, `formatEstimate`, `hasEstimate`) |
| sessionStorage keys and validated readers | `lib/sessionState.ts` (`SESSION_KEYS`, `readStoredIntake`, `readPrebaked`) |
| intake zod schema | `lib/intakeSchema.ts` (`IntakeSchema`, `parseStoredIntakeFields`) |
| results joins, filters, sorts, likely range, text summary | `lib/results/derive.ts` |
| translation merge (strings only) | `lib/results/translation.ts` (`mergeTranslatedStrings`) |
| 2026 FPL for UI hints | `lib/fpl.ts` (`fplFor`) |
| site URL, name, description | `lib/site.ts` |
| landing hidden-gem and marquee copy | `lib/hiddenGemHighlights.ts` (drift-tested against programs.json) |
| demo fixture registry | `lib/demoFixtures.ts` (`DEMO_FIXTURES`, `isDemoSlug`) |
| program category labels, file download | `lib/programLabels.ts`, `lib/download.ts` |

Program counts and dollar figures in copy come from these modules, not literals. Keep `lib/programs.ts` out of client components where possible: it pulls the whole programs JSON into the bundle. Pass counts down from a server page instead (see `app/intake/page.tsx`).

## 2. Request flow (live path)

```
/intake  app/intake/page.tsx (server) → ConversationalForm (client; steps.tsx, fields.tsx)
         seeds from pdx_intake_draft ?? pdx_intake after mount (never during render: no hydration mismatch)
         ──autosaves (debounced)──▶ sessionStorage.pdx_intake_draft (partial answers)
         ──on submit──▶ sessionStorage.pdx_intake (IntakeData; rent fields dropped for non-renters)
                        cancels pending autosave; clears pdx_intake_draft, pdx_prebaked, pdx_demo_simulate
   │ router.push
   ▼
/results  app/results/page.tsx (dashboard) + useAnalysisLoader.ts (state machine), decision order:
   1. pdx_prebaked present?     → demo path (§3), never calls Claude (readPrebaked validates with zod)
   2. no valid pdx_intake?      → redirect /intake (readStoredIntake validates with zod)
   3. no apiKey (useApiKey)?    → state 'needs-key' (ApiKeyControl UI)
   4. resultsCache hit?         → state 'ok' (hash(intake) == cached hash; hash is key-order independent)
   5. else analyzeEligibilityStream(apiKey, intake)
         'progress' {programId} → progress bar, yielded live as ids are regex-sniffed from the stream
         'complete' {output}    → cacheAnalysis + state 'ok'
         'error'    {message}   → state 'error'
   ▼
dashboard: MoneyCounter · FilterChips · BenefitCard[] · ComparisonChart · NearMissSection ·
           UrgencyBanner · RenewalCalendar(.ics via lib/calendar) · LanguageToggle
           (rows derived by lib/results/derive.ts; status views in components/results/StatusViews)
   ├ "Download packet"  POST /api/packet {intake, analysis} → zod-validated (400 on bad body) → PDF
   └ LanguageToggle es/vi → useResultsTranslation → translatePayload() (browser, same key)
                           → mergeTranslatedStrings: only string fields are taken from the translation
```

`lib/claudeBrowser.ts::analyzeEligibilityStream` internals:

```
messages.stream(model, system=[PROMPT w/ cache_control ephemeral], user=JSON(intake),
                output_config=zodOutputFormat(AnalysisOutputSchema), max_tokens=64000)
→ parsed_output (structured) ?? parseAnalysis(JSON.parse(buffer))
→ up to MAX_ATTEMPTS=2: retry on stop_reason=max_tokens, parse/validation failure, or server error
  (5xx or mid-stream, no status). Client errors (status < 500: bad key, rate limit) are NOT retried.
  Attempts share one seenIds set, so no program_id progress event is emitted twice.
→ deriveEligibility → assertConsistency (warn only) → recomputeTotals → yield complete
```

Post-processing contract (`lib/eligibility.ts`):
- `deriveEligibility`: `eligible = requirements.every(r => r.met !== 'no')`; ineligible ⇒ value 0. Eligible at $0 ⇒ the program's published median, unless its published range starts at $0 (the model sometimes reports $0 for eligible programs). Requirements are the audit trail; the model's own `eligible` flag is overridden when requirements exist.
- `recomputeTotals`: total / federal_only (federal+oregon) / pdx_specific (portland+multnomah) are recomputed from matches. Never trust model-supplied totals.
- `parseJsonObject`: translation path only. Eligibility uses structured output.

## 3. Demo path (no key)

```
/demo/[scenario]  server page, generateStaticParams over DEMO_SLUGS (maria|james|rose)
   unknown slug → redirect('/intake')
   passes ONLY the chosen fixture to components/demo/DemoLoader (client):
   sessionStorage.pdx_intake        ← lib/scenarios.ts (IntakeData fixture)
   sessionStorage.pdx_prebaked      ← data/scenarios/<name>.json via lib/demoFixtures.ts
   sessionStorage.pdx_demo_simulate ← '1'   (results page fakes streaming progress, then clears)
   router.replace('/results')   (storage write failure → /intake)
```

Fixtures go stale whenever the prompt, model, or programs change. Re-bake: `npm run bake` (needs `ANTHROPIC_API_KEY` in `.env.local`; runs `analyzeEligibilityStream` in Node).

## 4. Browser state (complete list)

| key | store | shape | writer | reader |
|---|---|---|---|---|
| `pdx_anthropic_key` | localStorage | string | lib/userKey.tsx | `useApiKey()` everywhere |
| `pdx_intake` | sessionStorage | IntakeData | ConversationalForm (on submit), DemoLoader | useAnalysisLoader, packet download, ConversationalForm (seed fallback) |
| `pdx_intake_draft` | sessionStorage | in-progress form values | ConversationalForm (debounced autosave; cleared on submit) | ConversationalForm only (seeds the form first; never starts an analysis) |
| `pdx_analysis` | sessionStorage | `{hash, output}` | lib/resultsCache.ts | useAnalysisLoader |
| `pdx_prebaked` | sessionStorage | AnalysisOutput | DemoLoader | useAnalysisLoader |
| `pdx_demo_simulate` | sessionStorage | `'1'` | DemoLoader | useAnalysisLoader (clears after simulation) |

All sessionStorage key names live in `SESSION_KEYS` (`lib/sessionState.ts`); never write the string literals. Stored values are untrusted: read them through the zod-validated readers there (or `readCachedAnalysis`). Nothing else persists. No cookies, no server storage, no analytics on answers.

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
            SMI/AMI percentages never stored in income_max_pct_fpl ·
            benefit-kind schedules overlap the published range (else label kind)
```

Edit programs in the seed, run `npm run merge` then `npm run validate:data`, then re-bake fixtures. `data/programs.report.md` records which fields are evidence-verified vs seed-derived.

Program schema essentials (`types/program.ts`): `id`, `jurisdiction` (federal|oregon|multnomah|portland), `hidden_gem`, `urgency`, `estimated_annual_value{min,max,median}`, optional `benefit_schedule` (authoritative when its `kind` is `benefit`, the default; `copay` and `assessed_value_exemption` rows are context, not dollar values), `eligibility.*` (income by `income_basis` fpl|smi|ami; boolean status gates; `triggered_by_event`).

## 6. Eval harness

```
npm run eval [-- caseId ...] [-- --runs N]      scripts/eval/run-eval.ts
   cases/     14 ground-truth EvalCase (personas + income-cliff pairs + trap cases)
   scorers.ts pure: program-set F1, dollar in-range vs the official range (lib/benefitSchedule.ts:
              published range widened by a benefit-kind dollar schedule), confidence agreement
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
- Progress events come from regex-sniffing `"program_id"` in the partial stream, so progress order equals model output order, not program order. Because progress is yielded from inside the stream loop, leaving the results page stops the analysis at the next streamed event (the loader returns from its `for await`, which closes the SDK stream).
- The loader effect in `app/results/useAnalysisLoader.ts` is guarded against React StrictMode double-invocation; `pdx_demo_simulate` is removed only after the fake stream finishes.
- `translatePayload` returns whatever the model sends back. Never store it directly: `mergeTranslatedStrings` starts from the English analysis and copies only string fields, so totals, `eligible`, estimates and program ids can't drift. `LanguageToggle` keeps the English original and swaps views.
- `lib/fpl.ts` duplicates the 2026 FPL table in the system prompt (for the intake hint only). When the prompt's FPL year changes, update `FPL_2026` and `lib/__tests__/fpl.test.ts` with it.
- `IntakeData` (`types/program.ts`) and `IntakeSchema` (`lib/intakeSchema.ts`) are kept in sync by a compile-time equality check; adding an intake field means editing both.
- The `npm test` script lists test globs explicitly. A test in a new `__tests__` directory won't run until its glob is added to `package.json`.
- ES/VI chrome strings are AI-generated at runtime via the same key. `lib/i18n.ts` only ships English.
- CSP in `next.config.ts` limits `connect-src` to `'self'` and `https://api.anthropic.com`. A new external host is silently blocked in the browser until it is added there.
- Tests run on Node's built-in runner (`node:test` + `node:assert/strict` via `tsx`), not Jest or Vitest. Client components cannot be imported in these tests; `scripts/__tests__/fixtures.test.ts` asserts the `SLUG_MAP` invariant as a contract check instead.
- `app/opengraph-image.tsx` runs under Satori: flexbox only, explicit `display:flex` on every wrapper, WOFF/TTF fonts from `app/_fonts/`.
- `docs/`, `evals/runs/`, `.env.local` are gitignored. Plans and specs under `docs/superpowers/` are local-only.
- `v1.0-hackathon` tag and the `-hackathon` Vercel alias are frozen. Ongoing work is `main`.

## 9. Where to edit for common changes

| change | touch | then |
|---|---|---|
| eligibility rule or wording | `lib/eligibility.ts` (prompt) | `npm test`, `npm run eval`, `npm run bake` |
| add/edit program | `data/programs.seed.json` | `npm run merge && npm run validate:data && npm run bake` |
| output shape | `types/program.ts` + `lib/eligibilitySchema.ts` + prompt schema block | tests in `lib/__tests__` |
| results UI | `app/results/page.tsx`, `components/results/*`; data shaping in `lib/results/derive.ts`; loading in `app/results/useAnalysisLoader.ts` | `/demo/maria` for keyless visual check |
| intake question | `components/intake/steps.tsx` (+ `fields.tsx`), `IntakeData` type, `lib/intakeSchema.ts`, `lib/scenarios.ts`, matching eval persona in `scripts/eval/cases/` | `npm test` (drift checks), re-bake |
| landing / about copy with numbers | `components/landing/content.ts`, `lib/hiddenGemHighlights.ts`; counts from `lib/programs.ts` | `npm test` (highlight drift test) |
| PDF | `lib/packet.tsx` | POST `/api/packet` locally |
| model | `ELIGIBILITY_MODEL` + README badge | eval + bake |

## 10. Size map (largest files, for context budgeting)

```
app/about/page.tsx                     ~700 lines   about, mostly markup
app/results/page.tsx                   ~680         dashboard (state machine is useAnalysisLoader.ts)
scripts/scrape-programs.ts             ~550         Firecrawl, not on the runtime path
components/results/BenefitCard.tsx     ~490
app/page.tsx                           ~460         landing (sections in components/landing/)
components/intake/steps.tsx            ~450         the five intake steps (wizard shell is ConversationalForm, ~300)
lib/packet.tsx                         ~360         react-pdf document
```

Read `types/program.ts` and `lib/eligibility.ts` first. Read the results page only for UI work.
