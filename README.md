# PDX Benefits Navigator

> A friendly AI navigator that helps Portland residents find every federal, Oregon, Multnomah County, and City of Portland benefit program they qualify for — in about three minutes, in seven languages, with a downloadable application packet.

Built for the **2026 AI Portland Build Challenge**.

---

## The problem

Oregon families leave roughly **$1.2 billion** in unclaimed benefits on the table every year. Most national benefit-screening tools only check **federal** programs (SNAP, Medicaid, WIC). They miss the layer of **state, county, and city** programs where Portland actually invests — programs like Renter Relocation Assistance, the Portland Clean Energy Fund, the SUN Service System, and the Water Bureau Discount.

For a typical Portland family, that gap is **$10,000–$25,000 per year**.

## What this does

PDX Benefits Navigator asks twelve gentle questions about a household, then uses Claude to evaluate the household against **all 20** programs in our database — federal, Oregon, Multnomah, and Portland — at the same time. It returns:

- A personalized dollar estimate, broken out per program
- Plain-language reasoning for each match
- Numbered next-step instructions per program
- A document checklist
- A renewal calendar (exportable as `.ics`)
- A downloadable PDF "application packet" you can take into a 211 office or a caseworker meeting
- Live translation into Spanish or Vietnamese

Three demo families ship with the app and showcase the breadth of coverage:

| Family | Situation | What we find |
|---|---|---|
| **María & family** | Single parent, 2 kids, part-time at Fred Meyer, renter in Cully, Spanish-speaking, 12% rent increase | ~$24,000+/yr across 13 programs |
| **James** | Single, disabled veteran, unemployed, owns home in St. Johns | ~$18,000+/yr across 12 programs |
| **Rose** | Senior widow, Social Security only, owns home in Lents, Vietnamese-speaking | ~$9,000+/yr across 11 programs |

For comparison, a federal-only tool would find ~$9,200/yr for María's family. **2.5× the dollars.**

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set the Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 3. Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

You can also jump straight to a demo scenario without filling out the intake:

- [/demo/maria](http://localhost:3000/demo/maria)
- [/demo/james](http://localhost:3000/demo/james)
- [/demo/rose](http://localhost:3000/demo/rose)

### Environment variables

| Variable | Required | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | `/api/analyze`, `/api/translate` |
| `FIRECRAWL_API_KEY` | only for re-scraping program data | `scripts/scrape-programs.ts` |

---

## Stack

- **[Next.js 16](https://nextjs.org/)** App Router, deployed to Vercel
- **[React 19](https://react.dev/)** + **TypeScript**
- **[Anthropic Claude](https://www.anthropic.com/api)** — Haiku 4.5 for fast iteration, Sonnet 4.6 for the demo (swap the constant in [`lib/claude.ts`](lib/claude.ts))
- **[Tailwind CSS v4](https://tailwindcss.com/)** + custom **Rose City** design tokens (OKLCH palette, Lora + Plus Jakarta Sans pairing)
- **[shadcn/ui](https://ui.shadcn.com/)** + **[Base UI](https://base-ui.com/)** primitives where helpful
- **[react-hook-form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** for the intake form
- **[framer-motion](https://www.framer.com/motion/)** for the count-up + bar animations
- **[@react-pdf/renderer](https://react-pdf.org/)** for server-side PDF packets
- **[Firecrawl](https://www.firecrawl.dev/)** for the (optional) program-data scrape pipeline

No vector DB. No external workflow engine. Programs data is stuffed into the system prompt — Claude has the whole eligibility picture in context for every request.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  /            ── landing                                        │
│  /intake      ── 5-step wizard ──┐                              │
│  /demo/[id]   ── prefill scenario ┘                             │
│                            │                                    │
│                            ▼ sessionStorage                     │
│  /results     ── streams /api/analyze, renders dashboard        │
│                            │           │           │            │
└────────────────────────────┼───────────┼───────────┼────────────┘
                             ▼           ▼           ▼
                    ┌────────────┐ ┌──────────┐ ┌──────────┐
                    │ /api/      │ │ /api/    │ │ /api/    │
                    │ analyze    │ │ translate│ │ packet   │
                    └─────┬──────┘ └────┬─────┘ └────┬─────┘
                          │             │            │
                          ▼             ▼            ▼
                  ┌──────────────────────────────────────┐
                  │ Anthropic API  ·  Claude Haiku 4.5   │
                  │ (system prompt = all 20 programs +   │
                  │  2026 FPL tables + PDX ZIP map)      │
                  └──────────────────────────────────────┘
```

### `/api/analyze` (streaming)

The hot path. Server-Sent Events stream `progress` events as Claude evaluates each program, then a final `complete` event with the full `AnalysisOutput`. Implementation in [`app/api/analyze/route.ts`](app/api/analyze/route.ts) and [`lib/claude.ts`](lib/claude.ts).

The system prompt encodes:

- 2026 Federal Poverty Level tables
- Portland ZIP-code map (so Claude knows 97203 = St. Johns, not Gresham)
- All 20 program rules (income limits, jurisdiction requirements, event triggers)
- Confidence-level guidance (`high` / `medium` / `low`)

### `/api/translate`

On-demand translation. Takes the assembled `AnalysisOutput` + UI chrome strings and returns a fully-translated bundle for ES or VI. Cached per-language on the client. The English bundle is the source of truth and is never overwritten.

### `/api/packet`

Renders a multi-page PDF using `@react-pdf/renderer`. Includes the dollar summary, every eligible program, next steps, document checklists, and a calendar of renewals. Designed to be printable and shareable with caseworkers.

### Optional: program data scrape

[`scripts/scrape-programs.ts`](scripts/scrape-programs.ts) uses Firecrawl to refresh the program database from official agency pages, then [`scripts/merge-scraped.ts`](scripts/merge-scraped.ts) reconciles updates against the curated seed file. Output lands in [`data/programs.json`](data/programs.json). The seed file is the source of truth — scraping is opportunistic enrichment.

---

## Project structure

```
app/
├── page.tsx                  # Landing
├── layout.tsx                # Root layout (fonts + theme class)
├── globals.css               # Rose City design tokens + utilities
├── intake/                   # 5-step intake wizard
├── results/                  # Loading view + dashboard
├── demo/
│   ├── page.tsx              # Demo hub
│   └── [scenario]/page.tsx   # Prefill scenario → /results
└── api/
    ├── analyze/route.ts      # SSE-streamed eligibility check
    ├── translate/route.ts    # ES / VI translation
    └── packet/route.ts       # PDF generation

components/
├── brand/                    # Wordmark, RoseStamp, AppBar, JurisdictionPill
├── intake/ConversationalForm.tsx
├── landing/StatReveal.tsx
├── results/                  # MoneyCounter, BenefitCard, ComparisonChart,
│                             # UrgencyBanner, RenewalCalendar, LanguageToggle
└── ui/                       # shadcn primitives

data/
├── programs.json             # 20 programs (the live database)
├── programs.seed.json        # Hand-curated source of truth
└── programs.scraped.json     # Last Firecrawl pass

lib/
├── claude.ts                 # Anthropic client + system prompt
├── scenarios.ts              # María / James / Rose intake fixtures
├── i18n.ts                   # Chrome strings + language list
├── packet.tsx                # PDF document
└── calendar.ts               # .ics export

types/
└── program.ts                # Program, IntakeData, MatchResult, AnalysisOutput
```

---

## Design system

The visual identity lives in [`app/globals.css`](app/globals.css) and [`components/brand/`](components/brand/).

- **Palette** — OKLCH-based; warm peach default, with `.theme-forest` (cool greens) and `.theme-sunset` (deep blush) variants you can apply to `<html>`
- **Type** — Lora for display, Plus Jakarta Sans for body, both via `next/font`
- **Components** — `.rc-card`, `.rc-card-soft`, `.rc-btn-rose`, `.rc-btn-outline`, `.rc-choice`, `.pill-rose`, `.pill-moss`, `.pill-sun`, `.pill-clay`, `.pill-sky`
- **Mark** — A friendly geometric "rose stamp" (`<RoseStamp />`) instead of a civic seal

Tailwind v4 + shadcn coexist with the namespaced `.rc-*` classes — the design system was added without disrupting the existing component library.

---

## The 20 programs

| Jurisdiction | Programs |
|---|---|
| **Federal** | SNAP, OHP/Medicaid (federal funding), WIC, School Meals, ACP Internet |
| **Oregon** | ERDC childcare, Oregon EITC + Kids' Credit, PGE Income Discount, NW Natural GAP, LIHEAP + Energy Trust, Senior/Disabled Property Tax Deferral, Veterans Property Tax Exemption |
| **Multnomah County** | Eviction Prevention Funds, SUN Service System, ADVSD case management |
| **City of Portland** | Renter Relocation Assistance, Water Bureau Discount, PCEF Home Energy, Transportation Wallet, Inclusionary Housing |

Eight of these are flagged `hidden_gem: true` — programs that no national tool surfaces and that drive the bulk of the dollar gap.

---

## Deploying

The app is designed for **Vercel**. No special config needed beyond the env vars above.

```bash
vercel
```

Set `ANTHROPIC_API_KEY` in the Vercel project settings (Production + Preview). The streaming `/api/analyze` route runs on Fluid Compute by default.

---

## Hard rules and known limitations

- **Estimates only — not legal advice.** Every dollar value comes from official program ranges, but actual benefits depend on case-worker review. Always verify before applying.
- **Nothing is stored.** Intake answers live in `sessionStorage` only — they never hit our server, and there is no database. PDF generation happens server-side from posted-back data, not from a stored record.
- **Programs database is a snapshot.** Federal Poverty Levels update annually; Portland and county programs change funding cycles. The scrape pipeline is the long-term answer; today, refresh the JSON when rules change.
- **Translation is AI-generated.** ES and VI bundles are produced live by Claude on first request. They are good but not professionally certified.
- **Eligibility logic is in the prompt.** This is a deliberate hackathon trade-off — it makes the engine fast to iterate on, but means rules are encoded in natural language rather than a deterministic engine.

---

## Credits & data sources

- **2026 Federal Poverty Level** tables (HHS)
- **Oregon Revised Statutes** for state-program rules
- **Portland City Code** + **Multnomah County** ordinances for local programs
- **211info**, **Multnomah County DCHS**, and **Oregon Food Bank** for community context

Built in Portland with a lot of coffee and gratitude for the people who actually run these programs day to day.
