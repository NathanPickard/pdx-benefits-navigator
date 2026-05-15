# PDX Benefits Navigator — Project Context for Claude Code

## What we're building
An AI tool for Portland residents to discover every federal, state, county, and city
benefit program they qualify for. Demo at 3 PM at the AI Portland Build Challenge.

## Critical reference docs (read these first)
- `docs/BLUEPRINT.md` — Full technical architecture, data models, prompts
- `docs/BUILD_PLAN.md` — Hour-by-hour build schedule
- `docs/DEMO_SCRIPT.md` — 5-minute presentation script

## Current state (10:00 AM)
- Next.js 16 App Router scaffold deployed to Vercel
- shadcn/ui installed with base components
- `data/programs.json` populated with 20 PDX-area benefit programs
- `ANTHROPIC_API_KEY` set in `.env.local` and Vercel

## Stack decisions (locked)
- Model for dev: `claude-haiku-4-5-20251001` (fast iteration)
- Model for final demo: `claude-sonnet-4-6` (flip the constant at 2:15 PM)
- NO vector DB — stuff programs.json into the system prompt
- NO n8n — pure Next.js, single repo
- Solo build, not team

## Next steps in order
1. Build `types/program.ts` from BLUEPRINT data model
2. Build `lib/claude.ts` with system prompt and `analyzeEligibility()`
3. Build `lib/scenarios.ts` with Maria, James, Rose hardcoded
4. Build `app/api/analyze/route.ts`
5. Test all 3 scenarios — verify Maria $24k+, James $18k+, Rose $9k+
6. Then move to intake form

## Hard rules
- Do NOT add features beyond BLUEPRINT scope without permission
- Hidden gem programs (Renter Relocation, PCEF, SUN, etc.) MUST be evaluated for every user — this is the differentiator
- All dollar values must be grounded in `data/programs.json` ranges
- No new code after 2:45 PM