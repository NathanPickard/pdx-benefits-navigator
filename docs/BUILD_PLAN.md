
# PDX Benefits Navigator — Hour-by-Hour Build Plan

**Event window:** 8:00 AM kickoff → 3:00 PM showcase
**Build philosophy:** Demo-able product by **1:30 PM**. Then polish, stretch features, rehearsal. Never sacrifice demo readiness for new features.

---

## 🌅 8:00 – 9:00 AM — Team Formation + Setup

### 8:00–8:30 — Team formation
- Walk into the team formation session with your 60-second pitch memorized
- Ideal team composition: **you** (core build) + **1 designer/PM** (deck + demo prep + content) + **1 non-coder** (Lovable marketing site, n8n automations, content polish)
- If you can't recruit, solo is fine — this project is shippable solo

**Your 60-second pitch:**
> *"Oregon families leave $1.2 billion in unclaimed benefits on the table every year. I'm building PDX Benefits Navigator — an AI that takes a 3-minute intake and surfaces every federal, state, county, and city benefit program a Portland family qualifies for. It finds programs no national tool covers — Portland Renter Relocation, PCEF, SUN Schools — that add $10,000-15,000/year per family. Multilingual, one-click application packets. I need help with design, content, and demo prep."*

### 8:30–9:00 — Repo setup

```bash
npx create-next-app@latest pdx-benefits-navigator \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd pdx-benefits-navigator

# UI primitives
npx shadcn@latest init
npx shadcn@latest add button card input form label progress \
  badge dialog tabs select textarea sonner

# Core deps
npm install @anthropic-ai/sdk framer-motion recharts \
  @react-pdf/renderer @mendable/firecrawl-js zod \
  react-hook-form @hookform/resolvers ics qrcode \
  lucide-react

# Dev
npm install -D @types/qrcode tsx
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...
```

Push to GitHub. Connect to Vercel. Verify deploy.

**✅ Checkpoint 9:00 AM:** Empty Next.js app live at `<your-name>.vercel.app`.

---

## 🔧 9:00 – 10:00 AM — Data Pipeline

### 9:00–9:20 — Run the scraper
- Copy `scripts/scrape-programs.ts` from the deliverables
- Run `npx tsx scripts/scrape-programs.ts`
- Outputs raw markdown to `data/raw/{program_id}.md`
- Expected runtime: ~8 minutes

### 9:20–9:50 — Extract structured data
- Run the second-pass extraction script (Claude reads raw markdown, returns structured `Program` objects)
- Output: `data/programs.json`
- Spot-check Maria's hero programs (Renter Relocation, ERDC, SUN) for accuracy
- Manual fixes if needed — get to "good enough"

### 9:50–10:00 — Commit and lock
- `git add data/ && git commit -m "Lock in programs.json"`
- Do not re-scrape today

**✅ Checkpoint 10:00 AM:** `programs.json` with 20 fully structured programs. Ground truth locked.

⚠️ **Fallback:** If scraping breaks, fall back to the seed `programs.json` template in deliverables. The values are accurate enough for a demo. Move on.

---

## 🧠 10:00 – 11:00 AM — The Eligibility Engine

### 10:00–10:30 — Build `lib/claude.ts`
- Copy `SYSTEM_PROMPT` from BLUEPRINT
- Implement `analyzeEligibility(intake)` and `translateResults(output, lang)`
- Set up Anthropic client with Opus 4.7

### 10:30–10:45 — Build `/api/analyze/route.ts`
```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeEligibility } from '@/lib/claude';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const intake = await req.json();
    const result = await analyzeEligibility(intake);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

### 10:45–11:00 — Validate against demo scenarios
- Hard-code Maria, James, Rose in `lib/scenarios.ts`
- `curl` each through `/api/analyze`
- Verify dollar values are in expected ranges
- If Maria isn't hitting $24k+, debug the prompt or program values now

**✅ Checkpoint 11:00 AM:** Hit `/api/analyze` with intake JSON, get back accurate eligibility matches. The brain works.

---

## 🎨 11:00 AM – 12:00 PM — Intake Flow

### 11:00–11:30 — ConversationalForm
- 5-step form, one question per "screen": household → income → housing → demographics → review
- shadcn `Form` + `react-hook-form` + `zod` validation
- Smooth transitions with Framer Motion
- Progress bar at top
- Back/Next buttons

### 11:30–12:00 — Results page skeleton
- Route to `/results` with intake in `sessionStorage`
- Call `/api/analyze`, show loading state (spinner with rotating messages: "Checking 20 programs..." → "Calculating your benefits..." → "Surfacing hidden programs...")
- Render bare results: list of matches with dollar values

**✅ Checkpoint 12:00 PM:** End-to-end flow works. Fill form → see results. **The product exists.**

---

## 🍕 12:00 – 12:30 PM — Lunch + Pressure Test

Eat lunch. Don't skip.

While eating:
- Run all 3 demo scenarios through the live app
- Note what feels weak
- Write down what would make the demo unforgettable

---

## 💎 12:30 – 1:30 PM — The Killer Features

This is the hour where you go from "good hackathon project" to "winning hackathon project." Ship each feature before moving to the next.

### 12:30–12:50 — The Big Number (animated $ counter)
```tsx
// components/results/MoneyCounter.tsx
'use client';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

export function MoneyCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    `$${Math.round(v).toLocaleString()}`
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2.5, ease: 'easeOut',
    });
    return controls.stop;
  }, [value]);

  return (
    <motion.div className="text-8xl md:text-9xl font-bold tabular-nums text-emerald-600">
      {rounded}
    </motion.div>
  );
}
```

### 12:50–1:10 — Federal vs. PDX Comparison Chart
- Recharts `BarChart` with two bars
- Bar 1: gray, "Federal-only tools" with `federal_only_value`
- Bar 2: emerald, "PDX Benefits Navigator" with `total_estimated_annual_value`
- Annotation showing delta and arrow
- This is THE slide for the judges

### 1:10–1:25 — Beautiful Benefit Cards
- Each match becomes a card with:
  - Program name + jurisdiction badge
  - Dollar value (large)
  - Why you qualify (the `reasoning`)
  - 2-4 next steps (numbered)
  - Hidden gem ⭐ badge if applicable
  - "Apply Now" link

### 1:25–1:30 — Demo routes
- `/demo/maria`, `/demo/james`, `/demo/rose`
- Each pre-loads intake, calls `/api/analyze`, lands on results
- One click during presentation = zero risk

**✅ Checkpoint 1:30 PM:** Live demo would be genuinely impressive RIGHT NOW.

---

## 🚀 1:30 – 2:15 PM — Stretch Features

Ship each before moving to next. Priority order:

### 1:30–1:50 — PDF Application Packet
- `/api/packet` endpoint generates PDF via `@react-pdf/renderer`
- Cover page: family summary, total benefits found, generated date
- One page per program: eligibility details, application URL, documents needed, QR code linking to application
- "Download Application Packet" button on results

### 1:50–2:05 — Language Toggle
- Top-right: "EN | ES | VI" buttons
- On toggle, POST results to `/api/translate`
- Cache translations in state to prevent re-calls
- Show small "Translated by AI" badge for transparency

### 2:05–2:15 — Polish pass
- Landing page that doesn't look generic
  - Animated "$1.2 billion" reveal as hero stat
  - 3-step "How it works" section
  - "Start in 3 minutes" CTA
- Favicon, og:image, real `<title>` and meta description
- Empty states and error states
- Mobile responsive (judges may pull this up on phones)
- Urgency banner component for eviction/rent-increase scenarios

**✅ Checkpoint 2:15 PM:** All features done. Production-quality polish.

---

## 🎤 2:15 – 2:45 PM — Demo Rehearsal

### 2:15–2:30 — First run-through
- Open laptop, do the exact demo flow
- Time it — must be **under 4 minutes** of demo (leave 60s for problem framing + closing)
- Note every place it feels slow, awkward, or unclear

### 2:30–2:40 — Second run-through
- Apply fixes
- Practice opening hook until tight: *"Oregon families leave $1.2 billion in unclaimed benefits on the table every year."*
- Practice closing line: *"PDX Benefits Navigator is ready for Portland. Today."*
- If team demo: assign exactly who says what

### 2:40–2:45 — Final run-through
- Whole team watches
- Each gives one piece of feedback
- Lock the demo

**✅ Checkpoint 2:45 PM:** Demo is muscle memory.

---

## 🛡️ 2:45 – 3:00 PM — Final Buffer

### Preparation checklist
- [ ] Open `/demo/maria` in tab 1
- [ ] Open `/demo/james` in tab 2
- [ ] Open `/demo/rose` in tab 3
- [ ] Open slide deck in tab 4 (just the $1.2B headline + closing slide)
- [ ] Open backup screencast video in tab 5 (record this earlier as insurance)
- [ ] Phone hotspot ready in case venue wifi dies
- [ ] Charger plugged in
- [ ] Browser zoom set to 125% (visibility from back of room)
- [ ] Notifications muted

### Hard rule
**No new code after 2:45 PM.** Anything broken at 2:45 stays broken. Working > impressive.

### Pre-demo ritual
- Bathroom
- Water
- 60 seconds of slow breathing
- Read the opening line three times out loud
- Walk to the stage

---

## Decision Tree if Behind Schedule

| If at 11 AM you're behind on… | Cut this | Keep this |
|---|---|---|
| Eligibility engine | Translation, paystub upload | Demo scenarios, Big Number, comparison chart |
| Intake form | Voice input, paystub upload | Pre-loaded scenarios |
| Results page | PDF packet, calendar export | Big Number, comparison chart, benefit cards |
| Time is just gone | Stretch features (1:30+) | Locked demo, rehearsal |

If at 12:00 PM the analysis engine isn't returning correct results, **stop adding features and fix the engine.** A polished demo with wrong numbers is worse than a simple demo with right numbers.

---

## Hour Score Card

| Hour | Most Important Output |
|---|---|
| 8–9 | Deployed empty Next.js app |
| 9–10 | `programs.json` with 20 programs |
| 10–11 | Working `/api/analyze` returning correct matches |
| 11–12 | End-to-end intake → results flow |
| 12–12:30 | Lunch + pressure test |
| 12:30–1:30 | Big Number, comparison chart, benefit cards, demo routes |
| 1:30–2:15 | PDF packet, language toggle, polish |
| 2:15–2:45 | Demo locked + rehearsed |
| 2:45–3:00 | Final prep, no new code |
| **3:00** | **🎤 Demo time** |

---

## Post-Demo (Win or Lose)

- **Document the build** — Twitter/X thread showing the timeline. AI-native engineering audience eats this up.
- **LinkedIn post** — Your positioning as "AI-native full-stack engineer with civic tech chops" gets a real artifact
- **Open-source the repo** — Public GitHub repo is portfolio gold for your job search
- **Pitch a real pilot** — Reach out to 211info, Multnomah County DCHS, or Worksystems within 48 hours
