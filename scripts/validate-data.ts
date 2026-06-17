/**
 * Schema + invariant gate for the programs database.
 * Validates BOTH the curated seed and the merged runtime artifact, and
 * asserts the merge did not alter curated eligibility policy.
 *
 * Run: npm run validate:data   (exits non-zero on any violation)
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const ROOT = process.cwd();
const SEED_PATH = path.join(ROOT, 'data', 'programs.seed.json');
const MERGED_PATH = path.join(ROOT, 'data', 'programs.json');

const Eligibility = z.object({
  income_max_pct_fpl: z.number().optional(),
  income_basis: z.enum(['fpl', 'smi', 'ami']).optional(),
  income_max_pct: z.number().optional(),
  income_max_annual: z.number().optional(),
  household_size_min: z.number().optional(),
  household_size_max: z.number().optional(),
  age_min: z.number().optional(),
  age_max: z.number().optional(),
  must_be_renter: z.boolean().optional(),
  must_be_homeowner: z.boolean().optional(),
  must_have_children_under: z.number().optional(),
  must_be_pregnant: z.boolean().optional(),
  must_be_disabled: z.boolean().optional(),
  must_be_veteran: z.boolean().optional(),
  must_be_senior: z.boolean().optional(),
  must_reside_in: z.array(z.enum(['portland', 'multnomah', 'oregon'])).optional(),
  citizenship_status: z.enum(['citizen', 'lpr_or_citizen', 'any']).optional(),
  employment_required: z.boolean().optional(),
  triggered_by_event: z
    .enum(['eviction_notice', 'rent_increase_10pct', 'disaster', 'job_loss', 'new_baby'])
    .optional(),
  other_requirements: z.array(z.string()).optional(),
});

const ProgramSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  short_name: z.string().min(1),
  category: z.enum([
    'food', 'healthcare', 'housing', 'utility', 'childcare',
    'education', 'tax', 'transportation', 'cash', 'connectivity',
  ]),
  jurisdiction: z.enum(['federal', 'oregon', 'multnomah', 'portland']),
  hidden_gem: z.boolean(),
  urgency: z.enum(['standard', 'time_sensitive', 'event_triggered']),
  description: z.string().min(1),
  legal_basis: z.string().optional(),
  estimated_annual_value: z.object({
    min: z.number(),
    max: z.number(),
    median: z.number(),
  }),
  benefit_schedule: z
    .object({
      description: z.string(),
      unit: z.enum(['usd_monthly', 'usd_annual', 'usd_one_time', 'percent_discount']),
      amounts: z.array(z.object({ condition: z.string(), value: z.number().finite() })),
    })
    .optional(),
  eligibility: Eligibility,
  source_url: z.string().url().optional(),
  last_verified: z.string().optional(),
  application_url: z.string().url(),
  info_urls: z.array(z.string().url()).optional(),
  application_method: z.enum(['online', 'phone', 'in_person', 'mail']),
  documents_required: z.array(z.string()),
  processing_time: z.string(),
  renewal_cycle: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_org: z.string().optional(),
});

type Program = z.infer<typeof ProgramSchema>;

/** Stable JSON (recursively sorted keys) for deep-equality comparison. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)));
    }
    return v;
  });
}

const errors: string[] = [];
const fail = (id: string, msg: string) => errors.push(`  [${id}] ${msg}`);

function load(file: string): unknown[] {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as unknown[];
}

function validateList(label: string, list: unknown[]): Program[] {
  const parsed: Program[] = [];
  list.forEach((raw, i) => {
    const r = ProgramSchema.safeParse(raw);
    if (!r.success) {
      const id = (raw as { id?: string })?.id ?? `${label}#${i}`;
      fail(id, `schema: ${r.error.issues.map((x) => `${x.path.join('.')} ${x.message}`).join('; ')}`);
      return;
    }
    parsed.push(r.data);
  });
  return parsed;
}

function checkInvariants(label: string, programs: Program[]): void {
  for (const p of programs) {
    const e = p.eligibility;
    // Income-basis state machine.
    if (e.income_basis === 'smi' || e.income_basis === 'ami') {
      if (e.income_max_pct === undefined)
        fail(p.id, `${label}: income_basis='${e.income_basis}' requires income_max_pct`);
      if (e.income_max_pct_fpl !== undefined)
        fail(p.id, `${label}: income_basis='${e.income_basis}' must not also carry income_max_pct_fpl`);
    }
    if (e.income_max_pct !== undefined && e.income_basis !== 'smi' && e.income_basis !== 'ami')
      fail(p.id, `${label}: income_max_pct set without an 'smi'/'ami' income_basis`);

    // OR-logic guard: both status flags explicitly false is the contradictory bug.
    if (e.must_be_disabled === false && e.must_be_senior === false)
      fail(p.id, `${label}: both must_be_disabled and must_be_senior are explicitly false (use undefined for OR-style rules)`);

    // Jurisdiction vs residence: a local program must not be widened past its own jurisdiction.
    if ((p.jurisdiction === 'portland' || p.jurisdiction === 'multnomah') && e.must_reside_in)
      if (!e.must_reside_in.includes(p.jurisdiction))
        fail(p.id, `${label}: jurisdiction='${p.jurisdiction}' but must_reside_in=${JSON.stringify(e.must_reside_in)} omits it`);

    // benefit_schedule amounts must be finite single numbers (schema enforces .finite()).
    // hidden_gem programs must cite a source.
    if (p.hidden_gem && !p.application_url)
      fail(p.id, `${label}: hidden_gem program missing application_url citation`);
  }
}

const seed = validateList('seed', load(SEED_PATH));
const merged = validateList('merged', load(MERGED_PATH));
checkInvariants('seed', seed);
checkInvariants('merged', merged);

// The merge must never alter curated eligibility policy.
const seedById = new Map(seed.map((p) => [p.id, p]));
for (const m of merged) {
  const s = seedById.get(m.id);
  if (!s) {
    fail(m.id, 'merged: program id not present in seed');
    continue;
  }
  if (canonical(m.eligibility) !== canonical(s.eligibility))
    fail(
      m.id,
      `merged: eligibility differs from seed (scrape must not touch eligibility policy)\n      seed:   ${canonical(s.eligibility)}\n      merged: ${canonical(m.eligibility)}`,
    );
}

if (errors.length) {
  console.error(`\n✗ validate:data found ${errors.length} violation(s):\n`);
  console.error(errors.join('\n'));
  console.error('');
  process.exit(1);
}
console.log(`✓ validate:data passed (${seed.length} seed, ${merged.length} merged programs).`);
