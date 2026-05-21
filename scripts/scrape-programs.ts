/**
 * Evidence-based scrape of program data from live government sources.
 *
 * For every non-locked field, Claude must either:
 *   - Provide a value AND a verbatim quote from the scraped page (`quote`), OR
 *   - Set the value to null AND provide a reason (`reason`).
 *
 * Locked fields (id, jurisdiction, category, hidden_gem, urgency, application_url)
 * are owned by human curation in programs.seed.json and never overwritten.
 *
 * Output: data/programs.scraped.json — each program carries its standard fields
 * plus a `_provenance` map: { "field.path": { quote } | { reason } }.
 *
 * A markdown audit summary is written to data/programs.report.md.
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
const SEED_PATH = path.join(ROOT, 'data', 'programs.seed.json');
const OUT_PATH = path.join(ROOT, 'data', 'programs.scraped.json');
const REPORT_PATH = path.join(ROOT, 'data', 'programs.report.md');
const MODEL = 'claude-haiku-4-5-20251001';

/**
 * Fields whose seed values are authoritative are echoed directly in scrapeOne()
 * below (id, jurisdiction, category, hidden_gem, urgency, application_url).
 * The prompt also omits them from the extraction schema so the model can't drift.
 */

/**
 * Flat path → { quote, source_url } | { reason }.
 * When multiple source pages are scraped per program, source_url tells you
 * which page the quote came from. Pages are fetched in the order:
 * application_url first, then any info_urls in order.
 */
type ProvenanceEntry =
  | { quote: string; source_url: string }
  | { reason: string };
type Provenance = Record<string, ProvenanceEntry>;

type ScrapedProgram = Program & { _provenance: Provenance };

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
    // Fall back to shell env.
  }
}

async function loadSeed(): Promise<Program[]> {
  const text = await fs.readFile(SEED_PATH, 'utf8');
  return JSON.parse(text) as Program[];
}

function extractJson(raw: string): unknown {
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
      if (depth === 0) return JSON.parse(stripped.slice(start, i + 1));
    }
  }
  throw new Error('extract: unterminated JSON');
}

function buildPrompt(
  program: Program,
  sources: { url: string; markdown: string }[]
): string {
  const sourceBlocks = sources
    .map(
      (s, i) =>
        `==== SOURCE ${i + 1}: ${s.url} ====\n${s.markdown}`
    )
    .join('\n\n');
  const sourceUrlList = sources.map((s, i) => `${i + 1}. ${s.url}`).join('\n');

  return `You are extracting structured benefits-program data from one or more US government / utility webpages.

Your job: for each EXTRACTABLE field listed in the schema below, output EITHER:
  (a) The value AND a verbatim quote from one of the scraped pages that supports it, AND the source URL the quote came from, OR
  (b) The value as null AND a one-line reason (e.g., "Not on any page", "Mentioned but no specific number given").

Hard rules:
  1. DO NOT invent values. If no page contains a clear, specific value for a field, return null with a reason.
  2. DO NOT copy values from the CURRENT DATA below. It is provided ONLY so you understand the program identity. Page text is the only acceptable evidence.
  3. Every non-null value MUST be supported by a verbatim quote from one of the pages AND attributed to a specific source URL. The quote can be a short phrase (5-30 words).
  4. For numeric fields (FPL %, dollar amounts, ages, etc.), the page must state the number explicitly. Do not derive or compute.
  5. For enum fields (application_method, citizenship_status, triggered_by_event), pick the closest match only if the page describes it; otherwise null.
  6. For array fields (documents_required, other_requirements, must_reside_in), include only items a page mentions; empty array if none.
  7. When multiple pages provide evidence for the same field, prefer the most specific/authoritative source.
  8. benefit_schedule: extract whenever the page publishes 2 or more SPECIFIC NUMERIC amounts tied to distinguishable conditions, regardless of formatting. This includes:
       - Tables (e.g. SNAP max monthly allotment by household size)
       - Short discrete lists (e.g. Lifeline $9.25 / $34.25 Tribal)
       - Prose stating specific tiers (e.g. "Tier I discount is 50% for qualifying low-income customers; Tier II discount is 80% for extremely low-income customers" → two rows)
       - Per-unit-size amounts even when written prose (e.g. "$2,900 studio / $3,300 1-bedroom / $4,200 2-bedroom / $4,500 3-bedroom" → four rows)
     Set null only when the page truly has no specific amounts (only ranges, prose like "may receive up to", or no dollar information). Every row's value must be a single number. In provenance, include a "benefit_schedule" entry with { "quote": "<short verbatim text proving one of the rows or the schedule's caption>", "source_url": "<URL>" } when populated, or { "reason": "..." } when null.

Source URLs (referenced by source_url in provenance):
${sourceUrlList}

Output format (one JSON object, no prose, no markdown fences):
{
  "program": {
    "name": "..." | null,
    "short_name": "..." | null,
    "description": "..." | null,
    "legal_basis": "..." | null,
    "estimated_annual_value": { "min": <num> | null, "max": <num> | null, "median": <num> | null },
    "benefit_schedule": {
      "description": "<short label, e.g. Max monthly SNAP allotment by household size, FY 2026>",
      "unit": "usd_monthly" | "usd_annual" | "usd_one_time" | "percent_discount",
      "amounts": [
        { "condition": "<e.g. Household of 1, Tribal lands, Tier I (<=60% MFI)>", "value": <num> }
      ]
    } | null,
    "eligibility": {
      "income_max_pct_fpl": <num> | null,
      "income_max_annual": <num> | null,
      "household_size_min": <num> | null,
      "household_size_max": <num> | null,
      "age_min": <num> | null,
      "age_max": <num> | null,
      "must_be_renter": <bool> | null,
      "must_be_homeowner": <bool> | null,
      "must_have_children_under": <num> | null,
      "must_be_pregnant": <bool> | null,
      "must_be_disabled": <bool> | null,
      "must_be_veteran": <bool> | null,
      "must_be_senior": <bool> | null,
      "must_reside_in": ["portland" | "multnomah" | "oregon"] | null,
      "citizenship_status": "citizen" | "lpr_or_citizen" | "any" | null,
      "employment_required": <bool> | null,
      "triggered_by_event": "eviction_notice" | "rent_increase_10pct" | "disaster" | "job_loss" | "new_baby" | null,
      "other_requirements": [string] | null
    },
    "application_method": "online" | "phone" | "in_person" | "mail" | null,
    "documents_required": [string] | null,
    "processing_time": "..." | null,
    "renewal_cycle": "..." | null,
    "contact_phone": "..." | null,
    "contact_org": "..." | null
  },
  "provenance": {
    "<field.path>": { "quote": "..." } | { "reason": "..." }
  }
}

Provenance keys must include EVERY field listed in "program" above (use dot notation for nested fields, e.g. "eligibility.income_max_pct_fpl"). For non-null values, supply { "quote": "<verbatim text>", "source_url": "<one of the URLs listed above>" }. For null values, supply { "reason": "<short reason>" }.

==== CURRENT DATA (identity reference only — DO NOT copy values) ====
${JSON.stringify(
  {
    id: program.id,
    name: program.name,
    application_url: program.application_url,
    jurisdiction: program.jurisdiction,
  },
  null,
  2
)}

${sourceBlocks}`;
}

interface ExtractionResponse {
  program: Record<string, unknown>;
  provenance: Provenance;
}

function isExtraction(value: unknown): value is ExtractionResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.program === 'object' && typeof v.provenance === 'object';
}

function getPath(obj: unknown, dotPath: string): unknown {
  let cur: unknown = obj;
  for (const seg of dotPath.split('.')) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return cur;
}

async function fetchSource(
  firecrawl: Firecrawl,
  url: string
): Promise<{ url: string; markdown: string } | null> {
  try {
    const doc = await firecrawl.scrape(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      timeout: 30000,
    });
    if (!doc.markdown || doc.markdown.length < 200) return null;
    // Government landing pages can carry 15-20k of nav chrome before the actual
    // content. With multiple URLs we share an 80k budget so each gets ~40k —
    // still ample for typical program pages within Haiku 4.5's 200K window.
    return { url, markdown: doc.markdown.slice(0, 40000) };
  } catch {
    return null;
  }
}

async function scrapeOne(
  firecrawl: Firecrawl,
  anthropic: Anthropic,
  program: Program
): Promise<ScrapedProgram> {
  const urls = [program.application_url, ...(program.info_urls ?? [])];

  const sources: { url: string; markdown: string }[] = [];
  for (const url of urls) {
    const s = await fetchSource(firecrawl, url);
    if (s) sources.push(s);
  }

  if (sources.length === 0) {
    throw new Error('no usable content from any source URL');
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: 'user', content: buildPrompt(program, sources) }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const parsed = extractJson(text);
  if (!isExtraction(parsed)) {
    throw new Error('extract: response did not match {program, provenance} shape');
  }

  // Models sometimes prefix provenance keys with "program." (mirroring the
  // example schema). Normalize to bare dotted paths.
  const provenance: Provenance = {};
  for (const [k, v] of Object.entries(parsed.provenance)) {
    const key = k.startsWith('program.') ? k.slice('program.'.length) : k;
    provenance[key] = v;
  }

  const result: ScrapedProgram = {
    // Locked fields echoed straight from the seed.
    id: program.id,
    jurisdiction: program.jurisdiction,
    category: program.category,
    hidden_gem: program.hidden_gem,
    urgency: program.urgency,
    application_url: program.application_url,
    // Extracted fields — coerced through the seed's Program type via spread.
    ...(parsed.program as Partial<Program>),
    _provenance: provenance,
  } as ScrapedProgram;

  return result;
}

function countProvenance(
  prov: Provenance,
  fields: string[]
): { verified: number; gaps: number; total: number; missingProvenance: string[] } {
  let verified = 0;
  let gaps = 0;
  const missingProvenance: string[] = [];

  for (const f of fields) {
    const entry = prov[f];
    if (!entry) {
      missingProvenance.push(f);
      continue;
    }
    if ('quote' in entry) verified++;
    else if ('reason' in entry) gaps++;
  }

  return { verified, gaps, total: fields.length, missingProvenance };
}

const PROVENANCE_FIELDS = [
  'name',
  'short_name',
  'description',
  'legal_basis',
  'estimated_annual_value.min',
  'estimated_annual_value.max',
  'estimated_annual_value.median',
  'benefit_schedule',
  'eligibility.income_max_pct_fpl',
  'eligibility.income_max_annual',
  'eligibility.household_size_min',
  'eligibility.household_size_max',
  'eligibility.age_min',
  'eligibility.age_max',
  'eligibility.must_be_renter',
  'eligibility.must_be_homeowner',
  'eligibility.must_have_children_under',
  'eligibility.must_be_pregnant',
  'eligibility.must_be_disabled',
  'eligibility.must_be_veteran',
  'eligibility.must_be_senior',
  'eligibility.must_reside_in',
  'eligibility.citizenship_status',
  'eligibility.employment_required',
  'eligibility.triggered_by_event',
  'eligibility.other_requirements',
  'application_method',
  'documents_required',
  'processing_time',
  'renewal_cycle',
  'contact_phone',
  'contact_org',
];

interface ProgramOutcome {
  id: string;
  status: 'ok' | 'failed';
  error?: string;
  verified: number;
  gaps: number;
  total: number;
  missingProvenance: string[];
}

function writeReport(outcomes: ProgramOutcome[], programs: ScrapedProgram[]): string {
  const byId = new Map(programs.map((p) => [p.id, p]));
  const ok = outcomes.filter((o) => o.status === 'ok');
  const failed = outcomes.filter((o) => o.status === 'failed');

  const lines: string[] = [];
  lines.push('# Programs scrape audit');
  lines.push('');
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push('');
  lines.push(`Programs scraped: ${ok.length} / ${outcomes.length}`);
  if (failed.length) {
    lines.push(`Failed: ${failed.length}`);
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Program | Verified | Gaps | Missing provenance |');
  lines.push('|---|---|---|---|');
  for (const o of outcomes) {
    if (o.status === 'failed') {
      lines.push(`| \`${o.id}\` | — | — | — (FAILED: ${o.error}) |`);
    } else {
      lines.push(
        `| \`${o.id}\` | ${o.verified}/${o.total} | ${o.gaps} | ${o.missingProvenance.length} |`
      );
    }
  }
  lines.push('');

  lines.push('## Per-program detail');
  lines.push('');
  for (const o of outcomes) {
    lines.push(`### \`${o.id}\``);
    if (o.status === 'failed') {
      lines.push('');
      lines.push(`**FAILED:** ${o.error}`);
      lines.push('');
      continue;
    }
    const p = byId.get(o.id);
    if (!p) continue;
    lines.push('');
    const urls = [p.application_url, ...(p.info_urls ?? [])];
    lines.push(`**Sources:**`);
    for (const u of urls) lines.push(`- ${u}`);
    lines.push('');
    lines.push('| Field | Value | Evidence | Source |');
    lines.push('|---|---|---|---|');
    for (const field of PROVENANCE_FIELDS) {
      const value = getPath(p, field);
      const entry = p._provenance[field];
      let valueCell: string;
      if (value === undefined || value === null) {
        valueCell = '—';
      } else if (field === 'benefit_schedule' && typeof value === 'object') {
        const v = value as { description?: string; unit?: string; amounts?: unknown[] };
        const rowCount = Array.isArray(v.amounts) ? v.amounts.length : 0;
        valueCell = `${v.description ?? '?'} (${rowCount} rows, ${v.unit ?? '?'})`;
      } else {
        valueCell = JSON.stringify(value);
      }
      if (valueCell.length > 60) valueCell = valueCell.slice(0, 57) + '…';
      let evidenceCell: string;
      let sourceCell = '';
      if (!entry) {
        evidenceCell = '⚠️ no provenance';
      } else if ('quote' in entry) {
        const q = entry.quote.length > 80 ? entry.quote.slice(0, 77) + '…' : entry.quote;
        evidenceCell = `✅ "${q.replace(/\|/g, '\\|')}"`;
        sourceCell = entry.source_url
          ? `[link](${entry.source_url})`
          : '';
      } else {
        evidenceCell = `❌ ${entry.reason}`;
      }
      lines.push(
        `| \`${field}\` | ${valueCell.replace(/\|/g, '\\|')} | ${evidenceCell} | ${sourceCell} |`
      );
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

async function main() {
  await loadDotEnvLocal();

  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('Missing FIRECRAWL_API_KEY in .env.local');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env.local');
    process.exit(1);
  }

  const filter = process.argv[2];
  const all = await loadSeed();
  const targets = filter ? all.filter((p) => p.id === filter) : all;

  if (targets.length === 0) {
    console.error(`No program matches id "${filter}"`);
    console.error(`Available: ${all.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`Scraping ${targets.length} program${targets.length === 1 ? '' : 's'}\n`);

  const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  const anthropic = new Anthropic();

  const outcomes: ProgramOutcome[] = [];
  const scraped: ScrapedProgram[] = [];

  for (const program of targets) {
    process.stdout.write(`  ${program.id.padEnd(28)} `);
    try {
      const out = await scrapeOne(firecrawl, anthropic, program);
      scraped.push(out);
      const counts = countProvenance(out._provenance, PROVENANCE_FIELDS);
      outcomes.push({
        id: program.id,
        status: 'ok',
        verified: counts.verified,
        gaps: counts.gaps,
        total: counts.total,
        missingProvenance: counts.missingProvenance,
      });
      console.log(
        `OK  ${counts.verified}/${counts.total} verified, ${counts.gaps} gaps` +
          (counts.missingProvenance.length
            ? `, ${counts.missingProvenance.length} missing provenance`
            : '')
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      outcomes.push({
        id: program.id,
        status: 'failed',
        error: message,
        verified: 0,
        gaps: 0,
        total: 0,
        missingProvenance: [],
      });
      console.log(`FAIL  ${message.slice(0, 80)}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  await fs.writeFile(OUT_PATH, JSON.stringify(scraped, null, 2) + '\n');
  await fs.writeFile(REPORT_PATH, writeReport(outcomes, scraped));

  const okCount = outcomes.filter((o) => o.status === 'ok').length;
  const failCount = outcomes.length - okCount;

  console.log('\n' + '-'.repeat(60));
  console.log(`Wrote ${okCount} program${okCount === 1 ? '' : 's'} to ${path.relative(ROOT, OUT_PATH)}`);
  console.log(`Audit report: ${path.relative(ROOT, REPORT_PATH)}`);
  if (failCount) {
    console.log(`Failures: ${failCount}`);
  }
  console.log('\nNothing in data/programs.json was changed. Review the audit, then run merge-scraped.ts.');
}

main().catch((err) => {
  console.error('\nfatal:', err);
  process.exit(1);
});
