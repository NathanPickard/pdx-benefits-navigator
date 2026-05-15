/**
 * Refreshes program data from live government sources via Firecrawl + Claude.
 * Writes to data/programs.scraped.json — does NOT replace programs.json.
 *
 * Usage:
 *   npx tsx scripts/scrape-programs.ts                  # all programs
 *   npx tsx scripts/scrape-programs.ts <program-id>     # one program by id
 *
 * Env (.env.local): FIRECRAWL_API_KEY, ANTHROPIC_API_KEY
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import Firecrawl from '@mendable/firecrawl-js';
import Anthropic from '@anthropic-ai/sdk';

import type { Program } from '../types/program';

const ROOT = process.cwd();
const PROGRAMS_PATH = path.join(ROOT, 'data', 'programs.json');
const OUT_PATH = path.join(ROOT, 'data', 'programs.scraped.json');
const MODEL = 'claude-haiku-4-5-20251001';

async function loadDotEnvLocal(): Promise<void> {
  try {
    const text = await fs.readFile(path.join(ROOT, '.env.local'), 'utf8');
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
    // No .env.local — fall back to shell env.
  }
}

async function loadPrograms(): Promise<Program[]> {
  const text = await fs.readFile(PROGRAMS_PATH, 'utf8');
  return JSON.parse(text) as Program[];
}

function extractJson(raw: string): Program {
  const stripped = raw.replace(/```json\n?|```\n?/g, '').trim();
  const start = stripped.indexOf('{');
  if (start === -1) throw new Error('extract: no JSON object found');
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const c = stripped[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === '\\' && inStr) {
      escaped = true;
      continue;
    }
    if (c === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return JSON.parse(stripped.slice(start, i + 1)) as Program;
    }
  }
  throw new Error('extract: unterminated JSON');
}

async function scrapeAndExtract(
  firecrawl: Firecrawl,
  anthropic: Anthropic,
  program: Program
): Promise<Program> {
  const doc = await firecrawl.scrape(program.application_url, {
    formats: ['markdown'],
    onlyMainContent: true,
    timeout: 30000,
  });

  if (!doc.markdown || doc.markdown.length < 200) {
    throw new Error('scrape returned no usable content');
  }

  const markdown = doc.markdown.slice(0, 12000);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [
      {
        role: 'user',
        content: `You are extracting structured benefits-program data from a US government webpage.

Below is the current data we have for this program, followed by a fresh scrape of the source page. Update fields ONLY where the scraped page provides clear, contradicting evidence. If a field is not covered by the scrape, KEEP THE CURRENT VALUE. Do NOT invent numbers. Do NOT translate names of programs.

Output ONLY a JSON object matching the Program schema below. No prose, no markdown fences.

Schema (same keys, same enum values):
  id, name, short_name, category, jurisdiction, hidden_gem, urgency,
  description, legal_basis,
  estimated_annual_value: { min, max, median },
  eligibility: {
    income_max_pct_fpl, income_max_annual,
    household_size_min, household_size_max, age_min, age_max,
    must_be_renter, must_be_homeowner, must_have_children_under,
    must_be_pregnant, must_be_disabled, must_be_veteran, must_be_senior,
    must_reside_in: array of 'portland' | 'multnomah' | 'oregon',
    citizenship_status: 'citizen' | 'lpr_or_citizen' | 'any',
    employment_required, triggered_by_event, other_requirements: string[]
  },
  application_url, application_method, documents_required: string[],
  processing_time, renewal_cycle, contact_phone, contact_org

==== CURRENT DATA ====
${JSON.stringify(program, null, 2)}

==== SCRAPED PAGE (markdown, possibly truncated) ====
${markdown}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const parsed = extractJson(text);

  // Defensive: lock fields that must NEVER drift.
  parsed.id = program.id;
  parsed.application_url = program.application_url;
  parsed.jurisdiction = program.jurisdiction;
  parsed.hidden_gem = program.hidden_gem;

  return parsed;
}

function summarizeDiff(a: Program, b: Program): string {
  const changes: string[] = [];
  if (a.estimated_annual_value.median !== b.estimated_annual_value.median) {
    changes.push(`$${a.estimated_annual_value.median}→$${b.estimated_annual_value.median}`);
  }
  if (a.eligibility.income_max_pct_fpl !== b.eligibility.income_max_pct_fpl) {
    changes.push(
      `fpl% ${a.eligibility.income_max_pct_fpl ?? '-'}→${b.eligibility.income_max_pct_fpl ?? '-'}`
    );
  }
  if (a.contact_phone !== b.contact_phone) {
    changes.push(`phone changed`);
  }
  if (a.application_method !== b.application_method) {
    changes.push(`method ${a.application_method}→${b.application_method}`);
  }
  return changes.join(', ');
}

async function main() {
  await loadDotEnvLocal();

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('Missing FIRECRAWL_API_KEY in .env.local — sign up at https://firecrawl.dev');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env.local');
    process.exit(1);
  }

  const filter = process.argv[2];
  const all = await loadPrograms();
  const targets = filter ? all.filter((p) => p.id === filter) : all;

  if (targets.length === 0) {
    console.error(`No program matches id "${filter}"`);
    console.error(`Available: ${all.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`Scraping ${targets.length} program${targets.length === 1 ? '' : 's'}\n`);

  const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  const anthropic = new Anthropic();

  const ok: Program[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const program of targets) {
    process.stdout.write(`  ${program.id.padEnd(28)} `);
    try {
      const updated = await scrapeAndExtract(firecrawl, anthropic, program);
      ok.push(updated);
      const diff = summarizeDiff(program, updated);
      console.log(diff ? `OK  ${diff}` : 'OK  (no changes)');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failed.push({ id: program.id, error: message });
      console.log(`FAIL  ${message.slice(0, 80)}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  await fs.writeFile(OUT_PATH, JSON.stringify(ok, null, 2) + '\n');

  console.log('\n' + '-'.repeat(60));
  console.log(`Wrote ${ok.length} program${ok.length === 1 ? '' : 's'} to ${path.relative(ROOT, OUT_PATH)}`);
  if (failed.length) {
    console.log(`Failed: ${failed.length}`);
    for (const f of failed) console.log(`  ${f.id}: ${f.error}`);
  }
  console.log('\nNothing was replaced. Diff against data/programs.json before promoting.');
}

main().catch((err) => {
  console.error('\nfatal:', err);
  process.exit(1);
});
