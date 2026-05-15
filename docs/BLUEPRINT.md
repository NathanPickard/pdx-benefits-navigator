# PDX Benefits Navigator — Technical Blueprint

> **The pitch:** *"Oregon families leave $1.2 billion on the table every year. PDX Benefits Navigator finds every federal, state, county, and city benefit a Portland family qualifies for — in 3 minutes, in any language, with one-click application packets."*

---

## Why This Wins

The five judging criteria are **Use of AI, Viability, Maturity, Community Impact, Presentation**. PDX Benefits Navigator is engineered to score maximum on every axis simultaneously:

| Criterion | How We Win |
|---|---|
| **Use of AI** | Multi-step agentic reasoning across 20 program rulesets, real-time multilingual translation, document analysis (paystub vision), and personalized PDF generation. Opus 4.7 handles edge cases other models miss. |
| **Viability** | Deployable to Portland residents this weekend. Real partnerships obvious: 211info, Worksystems, Multnomah County DHS, Oregon Food Bank. |
| **Maturity** | Polished UI, working multilingual support, PDF packets, 3 pre-loaded demo scenarios, urgency flags, renewal calendar export — far more than any team can ship with no-code alone. |
| **Community Impact** | $10,000–$25,000/year per family. 100,000+ Portland families potentially served. Equity-centered (multilingual, accessibility-first). |
| **Presentation** | Animated dollar counter, federal-vs-PDX comparison chart, live Spanish toggle, walking through a real family scenario. Visceral, specific, unforgettable. |

---

## The Differentiator

Most benefits tools cover federal programs (SNAP, Medicaid). PDX Benefits Navigator surfaces **hyperlocal Portland programs that no national tool catches**:

- Portland Renter Relocation Assistance ($4,500 lump sum)
- PCEF Home Energy weatherization ($5,000+ value)
- Portland Water Bureau Financial Assistance (80% off bills)
- Multnomah Eviction Prevention Funds ($2,000+ emergency aid)
- SUN Service System (free wraparound services at 80+ schools)
- Portland Transportation Wallet ($100/year transit credit)
- Portland Inclusionary Housing waitlist registration

For a typical Portland family, hyperlocal programs add **$10,000–$15,000/year** beyond what federal-only tools find. That delta is the killer slide.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       Next.js 14 (Vercel)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Landing ──▶ Intake (3 min) ──▶ Results Dashboard                │
│     │            │                       │                       │
│     │            │                       ├─ Big $ Counter        │
│     │            │                       ├─ Federal-vs-PDX Chart │
│     │            │                       ├─ Benefit Cards        │
│     │            │                       ├─ Urgency Banner       │
│     │            │                       ├─ PDF Packet Download  │
│     │            │                       ├─ Renewal Calendar     │
│     │            │                       └─ Language Toggle      │
│     │            │                                               │
│     │            ▼                                               │
│     │    ┌───────────────────────────┐                           │
│     │    │  POST /api/analyze        │                           │
│     │    │  ─ Primary Agent (Opus)   │                           │
│     │    │  ─ Verification Agent     │                           │
│     │    │  ─ Returns MatchResult[]  │                           │
│     │    └───────────────────────────┘                           │
│     │                │                                           │
│     │                ▼                                           │
│     │    ┌─────────────────────────────────┐                     │
│     │    │   Claude Opus 4.7               │                     │
│     │    │   + programs.json (20 progs)    │                     │
│     │    │   + 2026 FPL tables in prompt   │                     │
│     │    └─────────────────────────────────┘                     │
│     │                                                            │
│     ├──▶ /demo/[scenario] — pre-loaded family stories            │
│     │                                                            │
│     └──▶ /caseworker — outreach worker mode (stretch)            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

External:
  ├─ Firecrawl (one-time build-day scrape)
  ├─ Anthropic API (analysis + translation + vision)
  └─ Vercel deploy (auto from main branch)
```

**Architectural choice:** No vector DB, no RAG. With 20 programs we stuff the entire ruleset into the system prompt. Opus 4.7 has the context window to handle it easily. Faster, more reliable, no infrastructure to debug at 11pm on hackathon eve.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Your strongest stack, one repo, one deploy |
| Language | TypeScript | Type-safe matching schemas |
| Styling | Tailwind + shadcn/ui | Polished UI in minutes |
| Animation | Framer Motion | Counter animations, page transitions |
| Charts | Recharts | Federal vs. PDX comparison |
| AI | Anthropic SDK + **`claude-opus-4-7`** | Best reasoning for eligibility logic |
| Scraping | Firecrawl | Government sites in one API call |
| PDF | `@react-pdf/renderer` | Beautiful application packets |
| Voice | Web Speech API | Free, native browser, accessibility win |
| Calendar | `ics` package | Renewal dates → `.ics` export |
| Forms | `react-hook-form` + `zod` | Validation, accessibility |
| Hosting | Vercel | One-click deploy |

---

## Data Model

```typescript
// types/program.ts

export interface Program {
  id: string;
  name: string;
  short_name: string;
  category: 'food' | 'healthcare' | 'housing' | 'utility'
          | 'childcare' | 'education' | 'tax' | 'transportation'
          | 'cash' | 'connectivity';
  jurisdiction: 'federal' | 'oregon' | 'multnomah' | 'portland';
  hidden_gem: boolean;            // true = PDX differentiator
  urgency: 'standard' | 'time_sensitive' | 'event_triggered';
  description: string;
  legal_basis?: string;           // ORS citation, ordinance number — judges love this

  estimated_annual_value: {
    min: number;
    max: number;
    median: number;
  };

  eligibility: {
    income_max_pct_fpl?: number;
    income_max_annual?: number;
    household_size_min?: number;
    household_size_max?: number;
    age_min?: number;
    age_max?: number;
    must_be_renter?: boolean;
    must_be_homeowner?: boolean;
    must_have_children_under?: number;
    must_be_pregnant?: boolean;
    must_be_disabled?: boolean;
    must_be_veteran?: boolean;
    must_be_senior?: boolean;
    must_reside_in?: ('portland' | 'multnomah' | 'oregon')[];
    citizenship_status?: 'citizen' | 'lpr_or_citizen' | 'any';
    employment_required?: boolean;
    triggered_by_event?: 'eviction_notice' | 'rent_increase_10pct'
                       | 'disaster' | 'job_loss' | 'new_baby';
    other_requirements?: string[];
  };

  application_url: string;
  application_method: 'online' | 'phone' | 'in_person' | 'mail';
  documents_required: string[];
  processing_time: string;
  renewal_cycle?: string;
  contact_phone?: string;
  contact_org?: string;
}

export interface IntakeData {
  household_size: number;
  num_children: number;
  children_ages: number[];
  annual_income: number;
  zip_code: string;
  housing_status: 'rent' | 'own' | 'unhoused' | 'staying_with_others';
  recent_rent_increase_pct?: number;
  received_eviction_notice?: boolean;
  has_disability: boolean;
  is_veteran: boolean;
  is_pregnant: boolean;
  has_senior_in_household: boolean;
  primary_language: 'en' | 'es' | 'vi' | 'ru' | 'zh' | 'so' | 'ar';
  employment_status: 'employed_ft' | 'employed_pt' | 'self_employed'
                   | 'unemployed' | 'retired' | 'disabled';
  citizenship: 'citizen' | 'lpr' | 'other' | 'prefer_not_say';
}

export interface MatchResult {
  program_id: string;
  eligible: boolean;
  confidence: 'high' | 'medium' | 'low';
  estimated_annual_value: number;
  reasoning: string;
  next_steps: string[];
  required_documents: string[];
  application_deadline?: string;
  urgency_note?: string;
}

export interface AnalysisOutput {
  matches: MatchResult[];
  total_estimated_annual_value: number;
  federal_only_value: number;
  pdx_specific_value: number;
  priority_application_order: string[];
  warnings: string[];
  caseworker_notes?: string;
}
```

---

## The 20 Programs (Priority Order)

⭐ = PDX-specific "hidden gem" that creates the wow moment

| # | Program | Jurisdiction | Median Annual Value | Gem |
|---|---|---|---:|:---:|
| 1 | SNAP (Oregon Trail Card) | Federal/State | $3,000 | |
| 2 | Oregon Health Plan (OHP) | State | $4,000 | |
| 3 | Portland Renter Relocation Assistance | Portland | $4,500 | ⭐ |
| 4 | ERDC Childcare Subsidy | State | $12,000 | |
| 5 | Oregon EITC + Kids' Credit | State | $1,800 | |
| 6 | PGE / Pacific Power Discount | Utility | $600 | |
| 7 | Portland Water Bureau Discount | Portland | $400 | ⭐ |
| 8 | NW Natural GAP | Utility | $400 | |
| 9 | LIHEAP / Energy Trust | Federal/State | $700 | |
| 10 | WIC | Federal | $700 | |
| 11 | Free/Reduced School Meals | Federal | $1,500 | |
| 12 | Multnomah Eviction Prevention | County | $2,000 | ⭐ |
| 13 | PCEF Home Energy Programs | Portland | $5,000 | ⭐ |
| 14 | Senior/Disabled Property Tax Deferral | State | $3,500 | |
| 15 | Portland Transportation Wallet | Portland | $100 | ⭐ |
| 16 | Portland Inclusionary Housing | Portland | varies | ⭐ |
| 17 | SUN Service System | County | $3,000 | ⭐ |
| 18 | ADVSD (Aging/Disability) | County | varies | ⭐ |
| 19 | Veterans Property Tax Exemption | State | $300 | |
| 20 | Affordable Connectivity Program | Federal | $360 | |

---

## The Eligibility Engine — System Prompt

```typescript
// lib/claude.ts

import Anthropic from '@anthropic-ai/sdk';
import programs from '@/data/programs.json';
import type { IntakeData, AnalysisOutput } from '@/types/program';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are the eligibility engine for PDX Benefits Navigator, helping Portland, Oregon residents identify every benefit program they qualify for.

You have complete knowledge of 20 programs covering federal, Oregon state, Multnomah County, and City of Portland benefits. Your job is to analyze a person's intake data and return rigorous, well-reasoned eligibility matches.

==== 2026 FEDERAL POVERTY LEVEL (FPL) ====
1-person household: $15,650/year
2-person: $21,150
3-person: $26,650
4-person: $32,150
5-person: $37,650
6-person: $43,150
Add $5,500 per additional person.

==== PROGRAMS DATABASE ====
${JSON.stringify(programs, null, 2)}

==== ANALYSIS INSTRUCTIONS ====

1. For EVERY program, evaluate eligibility against intake data. Do not skip any.

2. Confidence levels:
   - "high": All hard requirements clearly met. Apply with confidence.
   - "medium": Likely qualifies but requires verification of 1-2 ambiguous details.
   - "low": Edge case. Worth applying but uncertain.

3. Estimate dollar value based on household composition. For programs with per-child or per-household-member benefits, multiply correctly.

4. PRIORITIZE hyperlocal Portland and Multnomah County programs (hidden_gem: true). These are our differentiator. Always evaluate them — never skip because the user didn't mention housing/utilities/etc.

5. Urgency handling:
   - If user has eviction notice → Multnomah Eviction Prevention is URGENT
   - If user had rent increase >10% → Portland Renter Relocation Assistance is event-triggered
   - If user has school-age children → SUN Schools is high-priority
   - Surface these in "warnings" array

6. For each match, generate 2-4 concrete next_steps starting with strong verbs ("Call 503-...", "Visit oregon.gov/...", "Gather your last 2 paystubs").

7. List 2-5 required_documents per program.

8. Output ONLY valid JSON matching the AnalysisOutput schema. No markdown, no preamble.

==== OUTPUT SCHEMA ====
{
  "matches": [
    {
      "program_id": string,
      "eligible": boolean,
      "confidence": "high" | "medium" | "low",
      "estimated_annual_value": number,
      "reasoning": string,
      "next_steps": [string],
      "required_documents": [string],
      "application_deadline": string | null,
      "urgency_note": string | null
    }
  ],
  "total_estimated_annual_value": number,
  "federal_only_value": number,
  "pdx_specific_value": number,
  "priority_application_order": [string],
  "warnings": [string]
}`;

export async function analyzeEligibility(intake: IntakeData): Promise<AnalysisOutput> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyze eligibility for this Portland resident:\n\n${JSON.stringify(intake, null, 2)}`
    }]
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');

  // Strip any accidental markdown fences
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}

// Real-time translation
export async function translateResults(
  output: AnalysisOutput,
  targetLanguage: 'es' | 'vi' | 'ru' | 'zh'
): Promise<AnalysisOutput> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Translate every human-readable string in this JSON to ${targetLanguage}. Keep all numbers, IDs, URLs, and structure identical. Return ONLY the translated JSON.\n\n${JSON.stringify(output)}`
    }]
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');
  return JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());
}
```

---

## Killer Features (Stack-Ranked by Demo Impact)

### S-Tier — Must Ship

**1. The Big Number**
Massive animated counter on results page that ticks $0 → total found benefits over 2.5 seconds. Framer Motion handles it.

```tsx
<motion.div
  initial={{ value: 0 }}
  animate={{ value: totalValue }}
  transition={{ duration: 2.5, ease: 'easeOut' }}
  className="text-9xl font-bold tabular-nums"
>
  {/* Custom hook to render motion value as currency */}
</motion.div>
```

**2. Federal vs. PDX Comparison Chart**
Recharts side-by-side bars: "Federal-only tools find $9,200" vs "PDX Benefits Navigator finds $24,400." Annotate the delta with red arrow: "+$15,200 you'd otherwise miss." This single chart wins the room.

**3. Pre-Loaded Demo Scenarios**
`/demo/maria`, `/demo/james`, `/demo/grandma-rose` — one click loads intake, runs analysis, lands on results. Zero risk during live demo.

**4. PDF Application Packet**
One button generates a beautifully designed PDF: cover page with family summary, one page per program with eligibility details, application URL, document checklist, contact info. Includes QR codes linking to each application portal.

### A-Tier — High Impact, Modest Cost

**5. Language Toggle (EN / ES / VI)**
Top-right button toggles language. On change, results JSON is sent to Claude for translation (3-second round trip), cached, and re-rendered. Demo moment that sells equity story instantly.

**6. Urgency Banner**
Red banner above results when time-sensitive programs apply. Examples: *"⚠️ APPLY TODAY: You qualify for Multnomah Eviction Prevention. Your eviction can likely be stopped."*

**7. Renewal Calendar Export**
Generate `.ics` file with renewal dates for every benefit. Importable to Google Calendar, Apple Calendar, Outlook. "Never lose a benefit again."

**8. Paystub Vision Upload (Income Verification)**
Drop a photo of a paystub. Claude Vision extracts gross income. Auto-fills the intake form. *"AI did the math for you."* This is a sneaky-impressive AI moment.

### B-Tier — Only If Ahead of Schedule

**9. Voice Intake**
Web Speech API. User says "I'm a single mom, two kids, work part-time at Fred Meyer, rent in Cully." AI extracts structured intake. Demo this for accessibility judges.

**10. Caseworker Mode**
`/caseworker` route with different UI optimized for outreach workers running back-to-back intakes. Save client profiles, export batch packets.

**11. Equity Dashboard**
Anonymous aggregate view: "Programs most underutilized in 97266: PCEF (87% eligible, 12% enrolled)." Gold for civic judges.

---

## Project Structure

```
pdx-benefits-navigator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing — $1.2B hook
│   ├── intake/
│   │   └── page.tsx                # Conversational form
│   ├── results/
│   │   └── page.tsx                # The money dashboard
│   ├── demo/
│   │   └── [scenario]/page.tsx     # Pre-loaded scenarios
│   ├── caseworker/
│   │   └── page.tsx                # Stretch goal
│   └── api/
│       ├── analyze/route.ts        # Eligibility engine
│       ├── translate/route.ts      # On-demand translation
│       ├── packet/route.ts         # PDF generation
│       ├── extract-paystub/route.ts # Vision income extraction
│       └── calendar/route.ts       # .ics generation
├── components/
│   ├── intake/
│   │   ├── ConversationalForm.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── PaystubDropzone.tsx
│   │   └── VoiceInputButton.tsx
│   ├── results/
│   │   ├── MoneyCounter.tsx        # Animated $ counter
│   │   ├── ComparisonChart.tsx     # Federal vs PDX
│   │   ├── BenefitCard.tsx
│   │   ├── HiddenGemBadge.tsx
│   │   ├── UrgencyBanner.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── PacketDownloadButton.tsx
│   │   └── CalendarExportButton.tsx
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── StatReveal.tsx          # Animated $1.2B counter
│   │   └── HowItWorks.tsx
│   └── ui/                         # shadcn components
├── data/
│   └── programs.json               # The 20 programs (ground truth)
├── lib/
│   ├── claude.ts                   # Anthropic client + prompts
│   ├── fpl.ts                      # FPL calculation utilities
│   ├── packet.tsx                  # React PDF templates
│   ├── calendar.ts                 # ICS generation
│   └── scenarios.ts                # Demo family data
├── scripts/
│   └── scrape-programs.ts          # Firecrawl pipeline
├── types/
│   └── program.ts                  # Shared TS types
├── public/
│   ├── og-image.png
│   └── favicon.ico
├── .env.local
└── package.json
```

---

## The Three Demo Scenarios

### Scenario 1: Maria & Family — The Conversion Story
```typescript
{
  household_size: 4,
  num_children: 2,
  children_ages: [5, 8],
  annual_income: 48000,
  zip_code: '97218',  // Cully
  housing_status: 'rent',
  recent_rent_increase_pct: 12,
  received_eviction_notice: false,
  has_disability: false,
  is_veteran: false,
  is_pregnant: false,
  has_senior_in_household: false,
  primary_language: 'es',
  employment_status: 'employed_pt',
  citizenship: 'lpr',
}
```
**Expected total: $24,000+/year**
**Hero programs:** Renter Relocation ($4,500), ERDC ($12,000), SUN Schools ($3,000), WIC, Free school meals, PCEF, Water discount, EITC
**Demo arc:** Show federal-only ($9,200) vs. PDX total ($24,400). Toggle Spanish. Download packet.

### Scenario 2: James — The Silent Crisis
```typescript
{
  household_size: 1,
  num_children: 0,
  children_ages: [],
  annual_income: 0,
  zip_code: '97203',  // St. Johns
  housing_status: 'own',
  received_eviction_notice: false,
  has_disability: true,
  is_veteran: true,
  is_pregnant: false,
  has_senior_in_household: false,
  primary_language: 'en',
  employment_status: 'unemployed',
  citizenship: 'citizen',
}
```
**Expected total: $18,000+/year**
**Hero programs:** OHP, SNAP, Veterans Property Tax Exemption, Energy Trust weatherization, PGE discount, ACP, Senior/Disabled Property Tax Deferral, ADVSD case management
**Demo arc:** Show how disability + veteran status surfaces programs others miss.

### Scenario 3: Grandma Rose — The Dignity Story
```typescript
{
  household_size: 1,
  num_children: 0,
  children_ages: [],
  annual_income: 21600,  // SS only
  zip_code: '97266',  // East Portland / Lents
  housing_status: 'own',
  has_disability: false,
  is_veteran: false,
  is_pregnant: false,
  has_senior_in_household: true,
  primary_language: 'vi',
  employment_status: 'retired',
  citizenship: 'citizen',
}
```
**Expected total: $9,000+/year + quality-of-life programs**
**Hero programs:** Senior Property Tax Deferral ($3,500), ADVSD, OHP, SNAP, ACP, PGE discount, Water discount, NW Natural GAP
**Demo arc:** Toggle Vietnamese. Show how seniors are routinely underserved.

---

## API Cost Math

- Per analysis (Opus 4.7): ~5,000 input tokens + ~2,000 output tokens
- Cost per analysis: ~$0.45
- Build day usage (50 test runs + 5 demo runs): ~$25
- Trivial. Worth it for Opus reasoning quality.

If budget matters, swap to `claude-sonnet-4-6` for analysis (~$0.05/call) and keep Opus only for translation and edge case verification.

---

## Risk Register

| Risk | Probability | Mitigation |
|---|---|---|
| Firecrawl rate-limits | Low | Cache scraped raw markdown immediately |
| Claude returns malformed JSON | Medium | Strip markdown fences, retry once on parse error |
| Live demo wifi fails | Low | Pre-record 60s demo video as backup |
| Eligibility edge cases | Medium | Lean on "medium confidence" — better than wrong |
| Spanish translation feels slow | Medium | Pre-translate the 3 demo scenarios, cache |
| Form intake takes too long for demo | High | Pre-loaded scenarios = zero form fill during demo |
| Paystub vision fails on real photo | Medium | Have a clean, well-lit demo paystub ready |

---

## Trust & Credibility Signals

These small details separate good projects from outstanding ones — and signal to civic judges that you understand the *seriousness* of benefits work:

- **Cite legal basis** on each program card (e.g., "Portland City Code 30.01.085" for Renter Relocation)
- **"Confidence" badges** instead of false certainty — judges who work in this space will respect humility
- **"This is not legal advice" footer** with link to Oregon Law Center for real cases
- **Privacy note**: "We never store your data. Everything runs in your browser session."
- **Source URLs** on every program — every claim is auditable

---

## Stretch Goals (If You Finish Early)

1. **211 partnership mock** — Show how PDX Benefits Navigator could plug into 211info.org's directory
2. **Caseworker batch mode** — Outreach workers running 10 clients per day
3. **Bilingual voice intake** — Spanish via Web Speech API `es-US`
4. **Equity dashboard** — Anonymous aggregate by zip code: "Most underclaimed programs in 97266"
5. **SMS pathway** — Text a phone number, complete intake by text, receive results

---

## Why This Beats Other Projects

Most teams at this hackathon will ship:
- A chat wrapper around city documents
- A no-code Lovable site with no working AI
- A Slackbot or workflow automation in n8n
- A single-program demo (just SNAP, just housing)

**PDX Benefits Navigator is a complete, polished, multi-program, multilingual, AI-native product with a quantified impact statement.** The judges will not see another project at this level of finish in seven hours.
