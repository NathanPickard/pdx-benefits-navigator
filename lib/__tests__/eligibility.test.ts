import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveEligibility, recomputeTotals } from '../eligibility.js';
import { officialRange } from '../benefitSchedule.js';
import type { AnalysisOutput, MatchResult, Program } from '../../types/program.js';
import programs from '../../data/programs.json';

const mk = (over: Partial<MatchResult>): MatchResult => ({
  program_id: 'x',
  eligible: true,
  confidence: 'high',
  estimated_annual_value: 100,
  reasoning: '',
  next_steps: [],
  required_documents: [],
  ...over,
});

const wrap = (matches: MatchResult[]): AnalysisOutput => ({
  matches,
  total_estimated_annual_value: 0,
  federal_only_value: 0,
  pdx_specific_value: 0,
  priority_application_order: [],
  warnings: [],
});

// ──── deriveEligibility ────

test('deriveEligibility: a met=no requirement makes ineligible and zeroes value', () => {
  const out = deriveEligibility(
    wrap([mk({ requirements: [{ key: 'income', met: 'no', detail: 'Over income limit' }] })]),
  );
  assert.equal(out.matches[0].eligible, false);
  assert.equal(out.matches[0].estimated_annual_value, 0);
});

test('deriveEligibility: unknown does NOT exclude (stays eligible)', () => {
  const out = deriveEligibility(
    wrap([mk({ requirements: [{ key: 'income', met: 'unknown', detail: 'Income not captured' }] })]),
  );
  assert.equal(out.matches[0].eligible, true);
  assert.equal(out.matches[0].estimated_annual_value, 100);
});

test('deriveEligibility: all yes stays eligible', () => {
  const out = deriveEligibility(
    wrap([mk({ requirements: [{ key: 'income', met: 'yes', detail: 'Income within limit' }] })]),
  );
  assert.equal(out.matches[0].eligible, true);
  assert.equal(out.matches[0].estimated_annual_value, 100);
});

test('deriveEligibility: NO requirements array → match untouched (demo-compat passthrough)', () => {
  // Matches without a requirements array (pre-rebake demo fixtures) must pass through unchanged.
  const input = wrap([mk({ eligible: true, estimated_annual_value: 250 })]);
  // No 'requirements' key at all
  delete (input.matches[0] as unknown as Record<string, unknown>).requirements;
  const out = deriveEligibility(input);
  assert.equal(out.matches[0].eligible, true);
  assert.equal(out.matches[0].estimated_annual_value, 250);
});

test('deriveEligibility: empty requirements array → match untouched', () => {
  // An explicitly empty requirements array also passes through (no reqs = nothing fails).
  const out = deriveEligibility(
    wrap([mk({ requirements: [] })]),
  );
  assert.equal(out.matches[0].eligible, true);
  assert.equal(out.matches[0].estimated_annual_value, 100);
});

test('deriveEligibility: does not mutate the input', () => {
  const input = wrap([mk({ requirements: [{ key: 'income', met: 'no', detail: 'Fails' }] })]);
  deriveEligibility(input);
  // Original object must be untouched
  assert.equal(input.matches[0].eligible, true);
  assert.equal(input.matches[0].estimated_annual_value, 100);
});

test('deriveEligibility: multiple requirements — any no makes ineligible', () => {
  const out = deriveEligibility(
    wrap([
      mk({
        requirements: [
          { key: 'income', met: 'yes', detail: 'Income ok' },
          { key: 'residency', met: 'no', detail: 'Not in Oregon' },
          { key: 'citizenship', met: 'unknown', detail: 'Unknown citizenship' },
        ],
      }),
    ]),
  );
  assert.equal(out.matches[0].eligible, false);
  assert.equal(out.matches[0].estimated_annual_value, 0);
});

// ──── recomputeTotals ────

test('recomputeTotals: sums only eligible values', () => {
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'snap', eligible: true, estimated_annual_value: 100 }),
      mk({ program_id: 'x', eligible: false, estimated_annual_value: 999 }),
    ]),
  );
  assert.equal(out.total_estimated_annual_value, 100);
});

test('recomputeTotals: federal programs (wic, lifeline, school-meals) → federal_only_value', () => {
  // 'wic' and 'lifeline' are both federal jurisdiction programs in programs.json
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'wic', eligible: true, estimated_annual_value: 500 }),
      mk({ program_id: 'lifeline', eligible: true, estimated_annual_value: 300 }),
    ]),
  );
  assert.equal(out.federal_only_value, 800);
  assert.equal(out.pdx_specific_value, 0);
  assert.equal(out.total_estimated_annual_value, 800);
});

test('recomputeTotals: oregon programs (snap, ohp) → federal_only_value bucket', () => {
  // 'snap' and 'ohp' are oregon jurisdiction — they go into federal_only_value
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'snap', eligible: true, estimated_annual_value: 200 }),
      mk({ program_id: 'ohp', eligible: true, estimated_annual_value: 400 }),
    ]),
  );
  assert.equal(out.federal_only_value, 600);
  assert.equal(out.pdx_specific_value, 0);
});

test('recomputeTotals: portland programs → pdx_specific_value bucket', () => {
  // 'pdx-renter-relocation' and 'pdx-water-fa' are portland jurisdiction
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'pdx-renter-relocation', eligible: true, estimated_annual_value: 1000 }),
      mk({ program_id: 'pdx-water-fa', eligible: true, estimated_annual_value: 200 }),
    ]),
  );
  assert.equal(out.pdx_specific_value, 1200);
  assert.equal(out.federal_only_value, 0);
});

test('recomputeTotals: multnomah programs → pdx_specific_value bucket', () => {
  // 'multco-eviction-prev' and 'sun-service-system' are multnomah jurisdiction
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'multco-eviction-prev', eligible: true, estimated_annual_value: 750 }),
      mk({ program_id: 'sun-service-system', eligible: true, estimated_annual_value: 250 }),
    ]),
  );
  assert.equal(out.pdx_specific_value, 1000);
  assert.equal(out.federal_only_value, 0);
});

test('recomputeTotals: mixed jurisdictions bucket correctly', () => {
  const out = recomputeTotals(
    wrap([
      mk({ program_id: 'snap', eligible: true, estimated_annual_value: 100 }),         // oregon → federal_only_value
      mk({ program_id: 'wic', eligible: true, estimated_annual_value: 200 }),          // federal → federal_only_value
      mk({ program_id: 'pdx-water-fa', eligible: true, estimated_annual_value: 300 }), // portland → pdx_specific_value
      mk({ program_id: 'advsd', eligible: true, estimated_annual_value: 400 }),        // multnomah → pdx_specific_value
    ]),
  );
  assert.equal(out.total_estimated_annual_value, 1000);
  assert.equal(out.federal_only_value, 300);
  assert.equal(out.pdx_specific_value, 700);
});

test('recomputeTotals: unknown program_id goes into neither bucket', () => {
  const out = recomputeTotals(
    wrap([mk({ program_id: 'unknown-program-xyz', eligible: true, estimated_annual_value: 100 })]),
  );
  assert.equal(out.total_estimated_annual_value, 100);
  assert.equal(out.federal_only_value, 0);
  assert.equal(out.pdx_specific_value, 0);
});

// ──── deriveEligibility: zero-value guard ────

const allMet = [{ key: 'income' as const, met: 'yes' as const, detail: 'Within limit' }];

test('deriveEligibility: eligible at $0 falls back to the published median', () => {
  const out = deriveEligibility(
    wrap([mk({ program_id: 'erdc', estimated_annual_value: 0, requirements: allMet })]),
  );
  // Derived, not hardcoded: a data refresh that moves ERDC's median must not
  // fail this test.
  const erdc = (programs as Program[]).find((p) => p.id === 'erdc');
  assert.ok(erdc, 'erdc must exist in programs.json');
  assert.ok(erdc.estimated_annual_value.min > 0, 'fixture assumes a range above $0');
  assert.equal(out.matches[0].eligible, true);
  assert.equal(out.matches[0].estimated_annual_value, erdc.estimated_annual_value.median);
});

test('deriveEligibility: keeps $0 when the published range starts at $0', () => {
  const out = deriveEligibility(
    wrap([mk({ program_id: 'advsd', estimated_annual_value: 0, requirements: allMet })]),
  );
  assert.equal(out.matches[0].estimated_annual_value, 0);
});

test('deriveEligibility: ineligible stays $0 (no median fallback)', () => {
  const out = deriveEligibility(
    wrap([
      mk({
        program_id: 'erdc',
        estimated_annual_value: 0,
        requirements: [{ key: 'income', met: 'no', detail: 'Over limit' }],
      }),
    ]),
  );
  assert.equal(out.matches[0].eligible, false);
  assert.equal(out.matches[0].estimated_annual_value, 0);
});

test('deriveEligibility: a nonzero model estimate is kept as-is', () => {
  const out = deriveEligibility(
    wrap([mk({ program_id: 'erdc', estimated_annual_value: 9000, requirements: allMet })]),
  );
  assert.equal(out.matches[0].estimated_annual_value, 9000);
});

test('deriveEligibility: unknown program id at $0 stays $0', () => {
  const out = deriveEligibility(
    wrap([mk({ program_id: 'not-a-program', estimated_annual_value: 0, requirements: allMet })]),
  );
  assert.equal(out.matches[0].estimated_annual_value, 0);
});

// ──── deriveEligibility: official-range clamp (hard rule #2) ────

function programById(id: string): Program {
  const program = (programs as Program[]).find((p) => p.id === id);
  assert.ok(program, `${id} must exist in programs.json`);
  return program;
}

const deriveOne = (over: Partial<MatchResult>) =>
  deriveEligibility(wrap([mk({ requirements: allMet, ...over })])).matches[0];

test('deriveEligibility: an eligible estimate above the official range is clamped to the max', () => {
  const [, max] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: max * 2 });
  assert.equal(out.estimated_annual_value, max);
});

test('deriveEligibility: an eligible estimate below the official range is raised to the min', () => {
  const [min] = officialRange(programById('ohp'));
  assert.ok(min > 1, 'test needs an OHP official minimum above $1');
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: 1 });
  assert.equal(out.estimated_annual_value, min);
});

test('deriveEligibility: an estimate inside the official range is unchanged', () => {
  const [min, max] = officialRange(programById('ohp'));
  const inside = Math.round((min + max) / 2);
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: inside });
  assert.equal(out.estimated_annual_value, inside);
});

test('deriveEligibility: the clamp uses the schedule-widened official range', () => {
  const snap = programById('snap');
  const [, max] = officialRange(snap);
  assert.ok(max > snap.estimated_annual_value.max, 'test needs a SNAP schedule above the published max');
  const out = deriveOne({ program_id: 'snap', estimated_annual_value: max });
  assert.equal(out.estimated_annual_value, max);
});

test('deriveEligibility: a negative estimate is treated as $0', () => {
  const advsd = programById('advsd');
  assert.equal(advsd.estimated_annual_value.min, 0, 'test needs a range starting at $0');
  const out = deriveOne({ program_id: 'advsd', estimated_annual_value: -500 });
  assert.equal(out.estimated_annual_value, 0);
});

test('deriveEligibility: a negative estimate falls back to the median when the range starts above $0', () => {
  const erdc = programById('erdc');
  const out = deriveOne({ program_id: 'erdc', estimated_annual_value: -1 });
  assert.equal(out.estimated_annual_value, erdc.estimated_annual_value.median);
});

test('deriveEligibility: an unknown program id is not clamped', () => {
  const out = deriveOne({ program_id: 'not-a-program', estimated_annual_value: 999_999 });
  assert.equal(out.estimated_annual_value, 999_999);
});

// ──── deriveEligibility: adjusted_from records the model's value ────

test('deriveEligibility: a clamped estimate records the model value in adjusted_from', () => {
  const [, max] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: max * 2 });
  assert.equal(out.estimated_annual_value, max);
  assert.equal(out.adjusted_from, max * 2);
});

test('deriveEligibility: the $0 median fallback records adjusted_from = 0', () => {
  const out = deriveOne({ program_id: 'erdc', estimated_annual_value: 0 });
  assert.equal(out.adjusted_from, 0);
});

test('deriveEligibility: an unchanged estimate has no adjusted_from', () => {
  const [min, max] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: Math.round((min + max) / 2) });
  assert.equal('adjusted_from' in out, false);
});

test('deriveEligibility: zeroing an ineligible match is not an adjustment', () => {
  const out = deriveEligibility(
    wrap([mk({ program_id: 'ohp', estimated_annual_value: 4000, requirements: [{ key: 'income', met: 'no', detail: 'Over limit' }] })]),
  ).matches[0];
  assert.equal(out.estimated_annual_value, 0);
  assert.equal('adjusted_from' in out, false);
});

// ──── deriveEligibility: $0 with an unknown requirement is the model's caution ────

const enrollmentUnknown = [
  { key: 'income' as const, met: 'yes' as const, detail: 'Within limit' },
  { key: 'enrollment' as const, met: 'unknown' as const, detail: 'SNAP enrollment not confirmed' },
];

test('deriveEligibility: $0 with an unknown requirement stays $0 (no median fallback)', () => {
  const out = deriveOne({ program_id: 'erdc', estimated_annual_value: 0, requirements: enrollmentUnknown });
  assert.equal(out.eligible, true);
  assert.equal(out.estimated_annual_value, 0);
  assert.equal('adjusted_from' in out, false);
});

test('deriveEligibility: a negative estimate with an unknown requirement becomes $0', () => {
  const out = deriveOne({ program_id: 'erdc', estimated_annual_value: -50, requirements: enrollmentUnknown });
  assert.equal(out.estimated_annual_value, 0);
  assert.equal(out.adjusted_from, -50);
});

test('deriveEligibility: a positive estimate with an unknown requirement is still clamped', () => {
  const [, max] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: max * 2, requirements: enrollmentUnknown });
  assert.equal(out.estimated_annual_value, max);
});

// ──── deriveEligibility: matches without requirements are still grounded ────

test('deriveEligibility: an empty requirements array still clamps an eligible estimate', () => {
  const [, max] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: max * 2, requirements: [] });
  assert.equal(out.eligible, true);
  assert.equal(out.estimated_annual_value, max);
  assert.equal(out.adjusted_from, max * 2);
});

test('deriveEligibility: a missing requirements array still clamps an eligible estimate', () => {
  const [, max] = officialRange(programById('ohp'));
  const input = wrap([mk({ program_id: 'ohp', estimated_annual_value: max * 2 })]);
  delete (input.matches[0] as unknown as Record<string, unknown>).requirements;
  assert.equal(deriveEligibility(input).matches[0].estimated_annual_value, max);
});

test('deriveEligibility: without requirements, $0 stays $0 (nothing shows every requirement met)', () => {
  const out = deriveOne({ program_id: 'erdc', estimated_annual_value: 0, requirements: [] });
  assert.equal(out.estimated_annual_value, 0);
});

test('deriveEligibility: without requirements, the model’s ineligible verdict is kept', () => {
  const out = deriveOne({ program_id: 'ohp', eligible: false, estimated_annual_value: 0, requirements: [] });
  assert.equal(out.eligible, false);
  assert.equal(out.estimated_annual_value, 0);
});

test('deriveEligibility: a small positive estimate with an unknown requirement is raised to the official minimum', () => {
  // Intended: the official minimum is the smallest real benefit, so a positive
  // estimate below it is a model error, not caution. Only $0 signals caution.
  const [min] = officialRange(programById('ohp'));
  const out = deriveOne({ program_id: 'ohp', estimated_annual_value: 1, requirements: enrollmentUnknown });
  assert.equal(out.estimated_annual_value, min);
  assert.equal(out.adjusted_from, 1);
});
