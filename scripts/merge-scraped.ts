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

type ScrapedProgram = Program & { _provenance?: Record<string, unknown> };

function isNullish(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    // Nested object like estimated_annual_value or eligibility — recurse on values.
    return Object.values(v).every(isNullish);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return true;
    // An array-of-objects is nullish if any element contains a null value
    // (e.g. benefit_schedule.amounts with value:null). Such partial data must
    // not be promoted — the scraper should not inject incomplete records.
    return v.some((el) => typeof el === 'object' && el !== null && Object.values(el).some((f) => f === null));
  }
  return false;
}

function mergeProgram(seed: Program, scraped: ScrapedProgram): Program {
  const out: Record<string, unknown> = { ...seed };
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
      }
      // Otherwise: scraped object has partial nulls and seed has no fallback — skip.
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

  await fs.writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + '\n');

  console.log();
  console.log(`Refreshed: ${refreshed}  ·  Opted-out: ${kept}  ·  Scrape failures: ${missing}`);
  console.log('Wrote data/programs.json');
  console.log('Rollback: cp data/programs.seed.json data/programs.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
