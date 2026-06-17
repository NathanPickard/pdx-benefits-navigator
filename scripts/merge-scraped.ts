/**
 * Promotes data/programs.scraped.json (evidence-based scrape output) into the
 * runtime artifact data/programs.json.
 *
 * For each program in the seed:
 *   - If the scrape produced a record AND the program isn't in KEEP_SEED,
 *     merge the scraped values over the seed values, then strip _provenance.
 *   - Otherwise, keep the seed record.
 *
 * Scraped null values are NOT promoted — the seed value is kept for that field.
 * That way the scrape can fill in real data without erasing seed values for
 * fields the page didn't cover. The audit (programs.report.md) tells you which
 * fields are still seed-derived vs. evidence-verified.
 *
 * Run: npx tsx scripts/merge-scraped.ts
 *
 * Safety: data/programs.seed.json is the immutable baseline.
 *         To roll back: cp data/programs.seed.json data/programs.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Program } from '../types/program';

const ROOT = process.cwd();
const SEED_PATH = path.join(ROOT, 'data', 'programs.seed.json');
const SCRAPED_PATH = path.join(ROOT, 'data', 'programs.scraped.json');
const OUT_PATH = path.join(ROOT, 'data', 'programs.json');

/** Programs whose seed version is kept even if scraped successfully. */
const KEEP_SEED = new Set<string>([
  // No active opt-outs. Add an id here if a scrape produces drift you can't fix
  // (e.g., wrong enum value) and you want to fall back to the seed until a fix.
]);

/** Fields the scrape must never touch — seed wins unconditionally. */
const LOCKED_FIELDS = new Set([
  'id',
  'jurisdiction',
  'category',
  'hidden_gem',
  'urgency',
  'application_url',
  'application_method',
  // Eligibility is human-curated POLICY. The scrape has repeatedly injected
  // wrong gates (a 60%-SMI ceiling labeled "FPL", a citizenship gate on an
  // immigration-neutral program, residence widened past a program's own
  // jurisdiction). Seed wins wholesale. Enforced by scripts/validate-data.ts.
  'eligibility',
]);

type ProvenanceEntry = { source_url?: string; quote?: string };
type ScrapedProgram = Program & { _provenance?: Record<string, ProvenanceEntry> };

function isNullish(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    // Nested object like estimated_annual_value or eligibility — recurse on values.
    return Object.values(v).every(isNullish);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return true;
    // Treat an array of records atomically: if any element has a null field,
    // the whole array is considered incomplete and is not promoted (we never
    // promote a partially-scraped record over the seed). This is intentional
    // and field-agnostic — a partial array is always unsafe to inject wholesale
    // regardless of which specific field contains the null.
    return v.some((el) => typeof el === 'object' && el !== null && Object.values(el).some((f) => f === null));
  }
  return false;
}

/** Derive a best source_url from _provenance (prefer benefit_schedule or eligibility fields). */
function deriveSourceUrl(provenance: Record<string, ProvenanceEntry>): string | undefined {
  const preferred = ['benefit_schedule', 'eligibility'];
  for (const pref of preferred) {
    for (const [key, entry] of Object.entries(provenance)) {
      if (key === pref || key.startsWith(`${pref}.`)) {
        if (entry?.source_url) return entry.source_url;
      }
    }
  }
  for (const entry of Object.values(provenance)) {
    if (entry?.source_url) return entry.source_url;
  }
  return undefined;
}

function mergeProgram(seed: Program, scraped: ScrapedProgram): Program {
  const out: Record<string, unknown> = { ...seed };

  // Before stripping _provenance, derive source_url if the seed doesn't already have one.
  if (!seed.source_url && scraped._provenance) {
    const derived = deriveSourceUrl(scraped._provenance);
    if (derived) out.source_url = derived;
  }

  for (const [key, scrapedValue] of Object.entries(scraped)) {
    if (key === '_provenance') continue;
    if (LOCKED_FIELDS.has(key)) continue;
    if (isNullish(scrapedValue)) continue;

    // For nested objects (estimated_annual_value, benefit_schedule, etc.), merge
    // field-by-field so a scraped null doesn't erase a non-null seed value.
    // Also applies when the seed field is absent — scraped sub-fields are only
    // promoted if they are non-nullish, preventing partial data (e.g. amounts
    // with null values) from being injected wholesale.
    if (
      scrapedValue &&
      typeof scrapedValue === 'object' &&
      !Array.isArray(scrapedValue)
    ) {
      const seedObj = (seed[key as keyof Program] ?? {}) as Record<string, unknown>;
      const merged: Record<string, unknown> = { ...seedObj };
      let skipped = 0;
      for (const [subKey, subVal] of Object.entries(scrapedValue as Record<string, unknown>)) {
        if (!isNullish(subVal)) merged[subKey] = subVal;
        else skipped++;
      }
      // If any scraped sub-field was nullish (and there's no seed fallback for it),
      // the merged object may be structurally incomplete. Only promote when the
      // scraped data was fully non-nullish or the seed already covers the gap.
      const seedHadField = seed[key as keyof Program] !== undefined && seed[key as keyof Program] !== null;
      if (skipped === 0 || seedHadField) {
        if (Object.keys(merged).length > 0) out[key] = merged;
      } else {
        // Scraped object has partial nulls and seed has no fallback — suppress and warn.
        console.warn(`  [warn] ${seed.id}: scraped '${key}' suppressed (partial nulls, no seed fallback)`);
      }
    } else {
      out[key] = scrapedValue;
    }
  }
  return out as unknown as Program;
}

async function main() {
  const seed = JSON.parse(await fs.readFile(SEED_PATH, 'utf8')) as Program[];
  const scraped = JSON.parse(await fs.readFile(SCRAPED_PATH, 'utf8')) as ScrapedProgram[];
  const scrapedById = new Map(scraped.map((p) => [p.id, p]));

  let refreshed = 0;
  let kept = 0;
  let missing = 0;

  console.log('Merge summary:');

  const merged: Program[] = seed.map((seedProgram) => {
    const scrapedProgram = scrapedById.get(seedProgram.id);
    const forcedSeed = KEEP_SEED.has(seedProgram.id);

    let tag: string;
    let result: Program;

    if (forcedSeed) {
      result = seedProgram;
      tag = '(seed — opted out)';
      kept++;
    } else if (!scrapedProgram) {
      result = seedProgram;
      tag = '(seed — scrape failed/missing)';
      missing++;
    } else {
      result = mergeProgram(seedProgram, scrapedProgram);
      tag = 'refreshed';
      refreshed++;
    }

    console.log(`  ${seedProgram.id.padEnd(28)} ${tag}`);
    return result;
  });

  const sourceUrlCount = merged.filter((p) => (p as unknown as Record<string, unknown>).source_url).length;

  await fs.writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + '\n');

  console.log();
  console.log(`Refreshed: ${refreshed}  ·  Opted-out: ${kept}  ·  Scrape failures: ${missing}`);
  console.log(`Programs that gained a source_url: ${sourceUrlCount}`);
  console.log('Wrote data/programs.json');
  console.log('Rollback: cp data/programs.seed.json data/programs.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
