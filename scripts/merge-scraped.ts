/**
 * Selective merge of data/programs.scraped.json into data/programs.json.
 *
 * Programs in KEEP_SEED are excluded — their seed version is preserved
 * (use this for programs with schema drift or scrape failures).
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

// Programs whose seed version is kept even if scraped successfully.
const KEEP_SEED = new Set<string>([
  // triggered_by_event drifted to `true` (boolean) in the scrape; would
  // break the urgency-detection enum. Median value also shifted.
  'pdx-renter-relocation',
]);

async function main() {
  const seed = JSON.parse(await fs.readFile(SEED_PATH, 'utf8')) as Program[];
  const scraped = JSON.parse(await fs.readFile(SCRAPED_PATH, 'utf8')) as Program[];
  const scrapedById = new Map(scraped.map((p) => [p.id, p]));

  const merged: Program[] = seed.map((seedProgram) => {
    if (KEEP_SEED.has(seedProgram.id)) return seedProgram;
    const scrapedProgram = scrapedById.get(seedProgram.id);
    return scrapedProgram ?? seedProgram;
  });

  await fs.writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + '\n');

  let refreshed = 0;
  let kept = 0;
  let missing = 0;

  console.log('Merge summary:');
  for (const p of merged) {
    const wasScraped = scrapedById.has(p.id);
    const forcedSeed = KEEP_SEED.has(p.id);
    let tag: string;
    if (forcedSeed) {
      tag = '(seed — opted out)';
      kept++;
    } else if (!wasScraped) {
      tag = '(seed — scrape failed)';
      missing++;
    } else {
      tag = 'refreshed';
      refreshed++;
    }
    console.log(`  ${p.id.padEnd(28)} ${tag}`);
  }

  console.log();
  console.log(`Refreshed: ${refreshed}  ·  Opted-out: ${kept}  ·  Scrape failures: ${missing}`);
  console.log('Wrote data/programs.json');
  console.log('Rollback: cp data/programs.seed.json data/programs.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
