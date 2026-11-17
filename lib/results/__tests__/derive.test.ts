import { test } from 'node:test';
import assert from 'node:assert/strict';
import { likelyRange, type EligibleRow } from '../derive.js';
import type { MatchResult, Program } from '../../../types/program.js';

function row(id: string, estimate: number, min: number, max: number): EligibleRow {
  const match = {
    program_id: id,
    eligible: true,
    estimated_annual_value: estimate,
  } as MatchResult;
  const program = {
    id,
    estimated_annual_value: { min, max, median: (min + max) / 2 },
  } as Program;
  return { match, program };
}

test('likelyRange: sums the official ranges of estimated matches', () => {
  const rows = [row('snap', 3000, 2000, 4000), row('liheap', 600, 300, 900)];

  assert.deepEqual(likelyRange(rows), { low: 2300, high: 4900 });
});

test('likelyRange: an unestimated match does not widen the band', () => {
  const rows = [row('snap', 3000, 2000, 4000), row('pcef', 0, 500, 4000)];

  assert.deepEqual(likelyRange(rows), { low: 2000, high: 4000 });
});

test('likelyRange: no estimated matches gives a zero band', () => {
  assert.deepEqual(likelyRange([row('pcef', 0, 500, 4000)]), { low: 0, high: 0 });
  assert.deepEqual(likelyRange([]), { low: 0, high: 0 });
});
