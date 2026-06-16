# PDX Benefits Navigator — Project Context

An AI navigator for Portland residents to discover federal, Oregon, Multnomah County, and City of Portland benefit programs they qualify for. The differentiator is **breadth**: federal-only tools miss the local layer (Renter Relocation, PCEF, SUN, Water Bureau Discount) where most of the dollar gap lives.

Built for the 2026 AI Portland Build Challenge. The hackathon submission is frozen at the `v1.0-hackathon` git tag and at the `pdx-benefits-navigator-hackathon.vercel.app` Vercel alias; ongoing development continues on `main` and the `pdx-benefits-navigator.vercel.app` alias.

## Architecture

**Bring-your-own-key, browser-side.** Personalized eligibility analyses are streamed directly from the user's browser to Anthropic with a key they paste into the UI. The app server never sees the key or the intake answers. The only server route is `/api/packet`, which renders a PDF from data POSTed back.

**No vector DB, no workflow engine.** The full programs database is embedded in the system prompt. Claude has the entire eligibility picture in context for every request. Iterate on rules by editing JSON, not pipelines.

**Three demo personas are pre-baked.** `data/scenarios/{maria,james,rose}.json` contain pre-computed analyses. `/demo/[scenario]` loads the fixture into `sessionStorage` and skips the API call — so demos work without an API key.

## Where things live

| Concern | File |
|---|---|
| Runtime model | `ELIGIBILITY_MODEL` constant in `lib/eligibility.ts` |
| System prompt | `lib/eligibility.ts` |
| Browser Anthropic client | `lib/claudeBrowser.ts` |
| BYOK localStorage + provider | `lib/userKey.tsx` |
| Programs database (source of truth) | `data/programs.seed.json` |
| Programs database (live build artifact) | `data/programs.json` |
| Demo intake fixtures | `lib/scenarios.ts` |
| Demo analysis fixtures | `data/scenarios/*.json` |
| UI chrome strings + language list | `lib/i18n.ts` |
| PDF packet | `lib/packet.tsx` |
| `.ics` renewal calendar | `lib/calendar.ts` |
| Social card (Open Graph image) | `app/opengraph-image.tsx` |

## Hard rules

1. **Hidden-gem programs always evaluated.** 8 of the 20 programs are flagged `hidden_gem: true` — they're the differentiator. Never narrow the evaluation set based on heuristics; always send the full database to Claude.
2. **Dollar values grounded in `programs.json`.** Every estimate must come from the official `amount_range` of a program. Never let Claude invent dollar figures.
3. **No server-side `ANTHROPIC_API_KEY` in the hot path.** Personalized analysis runs in the browser with the user's key. Adding a server-side AI route reintroduces cost and privacy concerns. `/api/packet` is the only server route and it does PDF rendering, not AI.
4. **Intake answers never persist server-side.** Stored only in `sessionStorage`. No database, no logging, no analytics on responses.
5. **Demos must work without an API key.** `/demo/[scenario]` reads pre-baked fixtures from `data/scenarios/`. When changing the prompt or programs, re-bake fixtures or the demo path silently serves stale data.
6. **Estimates only — never legal advice.** Always frame results as a starting point requiring caseworker verification.

## Common tasks

**Adding a new program.** Edit `data/programs.seed.json` following the schema in `types/program.ts`. Include a citation to the official program page. Mark `hidden_gem: true` if it's locally-funded and unlikely to be on national screening tools. The merge script reconciles seed + scraped data into `data/programs.json`.

**Changing the runtime model.** Edit `ELIGIBILITY_MODEL` in `lib/eligibility.ts`. The README badge advertises the current value — update both together.

**Re-baking demo fixtures.** After changing the system prompt, the model, or the programs database, the pre-baked fixtures in `data/scenarios/*.json` go stale. Run `npm run bake` (alias for `scripts/precompute-scenarios.ts`), which calls `analyzeEligibilityStream()` from `lib/claudeBrowser.ts` directly in Node using `ANTHROPIC_API_KEY` from `.env.local`. It uses the same `ELIGIBILITY_MODEL` as the runtime, so demos match live results. Do NOT add a server-side AI route — that would violate hard rule #3.

**Refreshing program data from official sites.** `scripts/scrape-programs.ts` uses Firecrawl. The seed file is the source of truth; scrape output is opportunistic enrichment.

**Updating the social card.** `app/opengraph-image.tsx` generates the OG image via `next/og` (Satori). Fonts live in `app/_fonts/` (Lora Bold WOFF, Plus Jakarta Sans Bold + Regular TTF). Satori is flexbox-only, doesn't support WOFF2 or unreliable SVG gradients, and requires explicit `display: 'flex'` on every wrapper.

## What's deliberately not here

- **A deterministic rules engine.** Eligibility logic lives in the system prompt (natural language). This was a deliberate hackathon trade-off — fast to iterate, but it means the prompt is the source of truth, not a state machine.
- **A backend database.** Intake and analysis are stateless. Adding storage would also mean adding privacy/compliance considerations the project deliberately avoids.
- **Professional translations.** ES and VI bundles are AI-generated at runtime. Curated translations would be welcome contributions but aren't shipped today.
