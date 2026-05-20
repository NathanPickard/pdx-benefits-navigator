import programs from '@/data/programs.json';
import type { AnalysisOutput, Program } from '@/types/program';

const JURISDICTION_BY_ID: Record<string, Program['jurisdiction']> = Object.fromEntries(
  (programs as Program[]).map((p) => [p.id, p.jurisdiction])
);

export const ELIGIBILITY_MODEL = 'claude-haiku-4-5-20251001';

export const ELIGIBILITY_SYSTEM_PROMPT = `You are the eligibility engine for PDX Benefits Navigator, helping Portland, Oregon residents identify every benefit program they qualify for.

You have complete knowledge of 20 programs covering federal, Oregon state, Multnomah County, and City of Portland benefits. Your job is to analyze a person's intake data and return rigorous, well-reasoned eligibility matches.

==== 2026 FEDERAL POVERTY LEVEL (FPL) ====
1-person household: $15,650/year
2-person: $21,150
3-person: $26,650
4-person: $32,150
5-person: $37,650
6-person: $43,150
Add $5,500 per additional person.

==== PORTLAND CITY LIMITS — ZIP CODES ====
Treat any of these ZIPs as inside the City of Portland — fully eligible for Portland-jurisdiction programs (Water Bureau FA, PCEF, Renter Relocation, Transportation Wallet, Inclusionary Housing, etc.):
97201, 97202, 97203, 97204, 97205, 97206, 97209, 97210, 97211, 97212, 97213, 97214, 97215, 97216, 97217, 97218, 97219, 97220, 97221, 97227, 97229, 97230, 97231, 97232, 97233, 97236, 97239, 97266, 97267, 97286, 97290, 97292, 97293, 97294, 97296, 97298.
All of these ZIPs are also inside Multnomah County. Do NOT claim 97203, 97218, or 97266 are in Gresham, Fairview, or outside Portland — they are Portland neighborhoods (St. Johns, Cully, Lents respectively).

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

/** Recompute total / federal / PDX dollar buckets from the matches array. */
export function recomputeTotals(output: AnalysisOutput): AnalysisOutput {
  let total = 0;
  let federal = 0;
  let pdx = 0;
  for (const m of output.matches) {
    if (!m.eligible) continue;
    const v = m.estimated_annual_value || 0;
    total += v;
    const j = JURISDICTION_BY_ID[m.program_id];
    if (j === 'federal' || j === 'oregon') federal += v;
    else if (j === 'portland' || j === 'multnomah') pdx += v;
  }
  return {
    ...output,
    total_estimated_annual_value: total,
    federal_only_value: federal,
    pdx_specific_value: pdx,
  };
}

/** Extract the first complete top-level JSON object from a model response. */
export function parseJsonObject<T>(raw: string): T {
  const stripped = raw.replace(/```json\n?|```\n?/g, '').trim();
  const start = stripped.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in model response');

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return JSON.parse(stripped.slice(start, i + 1));
      }
    }
  }
  throw new Error('Unterminated JSON object in model response');
}
