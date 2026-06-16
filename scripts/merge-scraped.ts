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
]);

/**
 * Eligibility sub-fields that encode human-curated POLICY — the scrape must never
 * override these even with a non-null value. The scraper has historically gotten
 * them wrong (e.g. labeling a 60%-of-State-Median-Income ceiling as "60% FPL", or
 * narrowing citizenship on a program that is immigration-status-neutral). Seed wins.
 * See data-accuracy audit, June 2026.
 */
const SEED_AUTHORITATIVE_ELIGIBILITY = new Set([
  'income_max_pct_fpl',
  'income_max_pct',
  'income_basis',
  'citizenship_status',
]);

type ScrapedProgram = Program & { _provenance?: Record<string, unknown> };

function isNullish(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    // Nested object like estimated_annual_value or eligibility — recurse on values.
    return Object.values(v).every(isNullish);
  }
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function mergeProgram(seed: Program, scraped: ScrapedProgram): Program {
  const out: Record<string, unknown> = { ...seed };
  for (const [key, scrapedValue] of Object.entries(scraped)) {
    if (key === '_provenance') continue;
    if (LOCKED_FIELDS.has(key)) continue;
    if (isNullish(scrapedValue)) continue;

    // For nested objects (estimated_annual_value, eligibility), merge field-by-field
    // so a scraped null doesn't erase a non-null seed value.
    if (
      scrapedValue &&
      typeof scrapedValue === 'object' &&
      !Array.isArray(scrapedValue) &&
      seed[key as keyof Program] &&
      typeof seed[key as keyof Program] === 'object'
    ) {
      const seedObj = seed[key as keyof Program] as Record<string, unknown>;
      const merged: Record<string, unknown> = { ...seedObj };
      for (const [subKey, subVal] of Object.entries(scrapedValue as Record<string, unknown>)) {
        if (key === 'eligibility' && SEED_AUTHORITATIVE_ELIGIBILITY.has(subKey)) continue;
        if (!isNullish(subVal)) merged[subKey] = subVal;
      }
      out[key] = merged;
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
