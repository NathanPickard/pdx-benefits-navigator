# PDX Benefits Navigator — Build Package

Everything you need to win the AI Portland Build Challenge.

## What's in this package

| File | Purpose | When to use |
|---|---|---|
| `BLUEPRINT.md` | Complete technical architecture | Reference all day |
| `BUILD_PLAN.md` | Hour-by-hour schedule with checkpoints | Check every hour |
| `DEMO_SCRIPT.md` | 5-minute presentation script | Memorize by 2:30 PM |
| `scrape-programs.ts` | Ready-to-run scraping pipeline | Run at 9:00 AM |
| `programs.seed.json` | Fallback program data (manually curated) | Use if scraping fails |

## The one-line pitch (memorize)

> *"Oregon families leave $1.2 billion in unclaimed benefits on the table every year. PDX Benefits Navigator finds every federal, state, county, and city benefit a Portland family qualifies for — in 3 minutes, in any language, with one-click application packets."*

## The hero numbers (drop into the deck)

- **$1.2 billion** — Oregon's annual unclaimed benefits
- **$24,400/year** — what Maria's family finds with PDX Benefits Navigator
- **$9,200/year** — what federal-only tools find for the same family
- **2.5×** — multiplier our tool delivers over federal-only tools
- **20 programs** — federal + state + Multnomah + Portland
- **6 languages** — EN, ES, VI, RU, ZH, AR

## The five judging criteria → our answers

1. **Use of AI** — Opus 4.7 multi-step reasoning + multilingual translation + vision (paystub extraction) + PDF generation. Agentic, not a wrapper.
2. **Viability** — Every program real, every URL real, every dollar value grounded. Deployable this weekend.
3. **Maturity** — Polished UI, working PDF packets, language toggle, 3 demo scenarios, mobile responsive — far past hackathon norm.
4. **Community Impact** — $10,000–$25,000/year per family × 45,000 households below 200% FPL in Portland.
5. **Presentation** — Animated dollar counter + comparison chart + live Spanish toggle + real family story. Visceral and undeniable.

## The differentiator (say this in the demo)

> *"Federal tools find $9,200 for Maria. PDX Benefits Navigator finds $24,400. The difference is hyperlocal programs no national tool surfaces — Renter Relocation Assistance, PCEF, SUN Schools, Portland Water Discount. Hidden in plain sight."*

## Critical decision points

| Time | Decision |
|---|---|
| 8:30 AM | Use Lovable for marketing site (teammate), Next.js for the app (you) |
| 9:00 AM | Scrape OR use `programs.seed.json` fallback — don't get stuck |
| 10:00 AM | If `/api/analyze` returns wrong numbers, fix prompt before adding features |
| 12:30 PM | If behind on features, ship Big Number + Comparison Chart and stop |
| 1:30 PM | Demo must be rehearsable. Stop adding features. |
| 2:45 PM | No new code. Period. |

## What makes this win vs. other teams

Other teams will ship:
- A chat wrapper around city documents (judges saw this last year)
- A no-code Lovable site with no working AI (loses on "Use of AI")
- An n8n workflow with no UI (loses on "Maturity")
- A single-program demo (loses on "Community Impact")

You ship:
- A complete, polished, multi-program, multilingual product
- With a quantified impact statement
- That works live on stage with three different family scenarios
- And could go to pilot next week

The judges have never seen this level of finish in seven hours.

## Good luck, Nate. Go win it.
