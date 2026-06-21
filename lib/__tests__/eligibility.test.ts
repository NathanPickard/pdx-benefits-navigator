import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveEligibility, recomputeTotals } from '../eligibility.js';
import type { AnalysisOutput, MatchResult } from '../../types/program.js';

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
