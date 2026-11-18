import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fplFor } from '../fpl.js';

// Mirrors the 2026 FPL table in ELIGIBILITY_SYSTEM_PROMPT (lib/eligibility.ts).
const PROMPT_TABLE_2026: Record<number, number> = {
  1: 15960,
  2: 21640,
  3: 27320,
  4: 33000,
  5: 38680,
  6: 44360,
  7: 50040,
  8: 55720,
};

test('fplFor: matches the 2026 prompt table for household sizes 1 through 8', () => {
  for (const [size, expected] of Object.entries(PROMPT_TABLE_2026)) {
    assert.equal(fplFor(Number(size)), expected, `household of ${size}`);
  }
});

test('fplFor: adds the per-person increment beyond 8', () => {
  assert.equal(fplFor(9), 55720 + 5680);
});

test('fplFor: treats sizes below 1 as a single-person household', () => {
  assert.equal(fplFor(0), 15960);
});
