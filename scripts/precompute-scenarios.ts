/**
 * Re-bakes the pre-computed demo scenario fixtures at data/scenarios/*.json.
 *
 * Calls analyzeEligibilityStream from lib/claudeBrowser.ts directly in a Node
 * context, using ANTHROPIC_API_KEY from .env.local. The runtime app still uses
 * the same function from the browser with the user's BYOK — this script is the
 * build-time path for refreshing demo fixtures after the seed or eligibility
 * prompt changes. The server never sees an API key in production.
 *
 * Usage:
 *   npx tsx scripts/precompute-scenarios.ts                  # all scenarios
 *   npx tsx scripts/precompute-scenarios.ts maria            # one scenario
 *
 * Env (.env.local): ANTHROPIC_API_KEY
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { scenarios } from '../lib/scenarios';
import { analyzeEligibilityStream } from '../lib/claudeBrowser';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'data', 'scenarios');

/**
 * Precompute uses Sonnet rather than the runtime default (Haiku) because
 * baked fixtures are public and need tighter constraint adherence — Haiku
 * has been observed marking eligible=true while its own reasoning concludes
 * the applicant is ineligible, and making basic income-vs-threshold
 * comparison errors. Sonnet's stronger reasoning is worth the higher
 * one-time cost. Runtime BYOK still hits Haiku unless production changes
 * ELIGIBILITY_MODEL globally.
 */
const PRECOMPUTE_MODEL = 'claude-sonnet-4-6';

async function loadDotEnvLocal(): Promise<void> {
  try {
    const text = await readFile(join(ROOT, '.env.local'), 'utf8');
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // Fall back to shell env.
  }
}

async function runOne(slug: keyof typeof scenarios, apiKey: string): Promise<void> {
  const intake = scenarios[slug];
  console.log(`\n→ ${slug}`);

  let progressCount = 0;
  let output = null;
  let errorMessage: string | null = null;

  for await (const event of analyzeEligibilityStream(apiKey, intake, PRECOMPUTE_MODEL)) {
    if (event.type === 'progress') {
      progressCount++;
      process.stdout.write('.');
    } else if (event.type === 'complete') {
      output = event.output;
    } else if (event.type === 'error') {
      errorMessage = event.message;
    }
  }

  if (errorMessage) throw new Error(`${slug}: ${errorMessage}`);
  if (!output) throw new Error(`${slug}: no complete event received`);

  const eligibleCount = output.matches.filter((m) => m.eligible).length;
  console.log(
    `\n✓ ${slug}: $${output.total_estimated_annual_value.toLocaleString()} across ${eligibleCount} eligible programs (${progressCount} program IDs streamed)`
  );

  const path = join(OUT_DIR, `${slug}.json`);
  await writeFile(path, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`  wrote ${path}`);
}

async function main() {
  await loadDotEnvLocal();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY in .env.local');
    process.exit(1);
  }

  const filter = process.argv[2];
  const allSlugs = Object.keys(scenarios) as (keyof typeof scenarios)[];
  const targets = filter
    ? (allSlugs.filter((s) => s === filter) as (keyof typeof scenarios)[])
    : allSlugs;

  if (targets.length === 0) {
    console.error(`No scenario matches "${filter}". Available: ${allSlugs.join(', ')}`);
    process.exit(1);
  }

  for (const slug of targets) {
    await runOne(slug, apiKey);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
