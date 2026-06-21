import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAnalysis } from '../eligibilitySchema.js';

// ──── Helpers ────

const validMatch = (overrides: Record<string, unknown> = {}) => ({
  program_id: 'snap',
  eligible: true,
  confidence: 'high',
  estimated_annual_value: 1800,
  reasoning: 'Household of 3 is under 130% FPL',
  requirements: [
    { key: 'income', met: 'yes', detail: 'Annual income $24k is under the $35k limit for household of 3' },
    { key: 'residency', met: 'yes', detail: 'Oregon resident' },
  ],
  next_steps: ['Apply at oregon.gov/dhs'],
  required_documents: ['ID', 'Proof of income'],
  application_deadline: null,
  urgency_note: null,
  ...overrides,
});

const validOutput = (matchOverrides: Record<string, unknown> = {}) => ({
  matches: [validMatch(matchOverrides)],
  total_estimated_annual_value: 1800,
  federal_only_value: 1800,
  pdx_specific_value: 0,
  priority_application_order: ['snap'],
  warnings: [],
});

// ──── parseAnalysis ────

test('parseAnalysis: accepts a valid output with requirements', () => {
  const result = parseAnalysis(validOutput());
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].program_id, 'snap');
  assert.equal(result.matches[0].eligible, true);
  assert.equal(result.matches[0].requirements!.length, 2);
});

test('parseAnalysis: THROWS on a match missing requirements (schema contract)', () => {
  // requirements is required by MatchSchema — absence must throw ZodError
  const bad = validOutput();
  delete (bad.matches[0] as Record<string, unknown>).requirements;
  assert.throws(
    () => parseAnalysis(bad),
    (err: unknown) => {
      assert.ok(err instanceof Error, 'Should throw an Error');
      // Zod error messages include "Required" or "invalid_type"
      assert.ok(
        err.message.includes('Required') || err.message.includes('invalid_type'),
        `Expected Zod validation message, got: ${err.message}`,
      );
      return true;
    },
  );
});

test('parseAnalysis: accepts application_deadline: null', () => {
  const result = parseAnalysis(validOutput({ application_deadline: null }));
  assert.equal(result.matches[0].application_deadline, null);
});

test('parseAnalysis: accepts application_deadline as a string', () => {
  const result = parseAnalysis(validOutput({ application_deadline: '2026-12-31' }));
  assert.equal(result.matches[0].application_deadline, '2026-12-31');
});

test('parseAnalysis: accepts application_deadline omitted (optional)', () => {
  const out = validOutput();
  delete (out.matches[0] as Record<string, unknown>).application_deadline;
  const result = parseAnalysis(out);
  // optional field — should not throw; value is undefined
  assert.equal(result.matches[0].application_deadline, undefined);
});

test('parseAnalysis: THROWS on invalid confidence value', () => {
  assert.throws(
    () => parseAnalysis(validOutput({ confidence: 'very-high' })),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      return true;
    },
  );
});

test('parseAnalysis: THROWS on invalid requirement key', () => {
  assert.throws(
    () => parseAnalysis(validOutput({
      requirements: [{ key: 'wealth', met: 'yes', detail: 'Not a valid key' }],
    })),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      return true;
    },
  );
});

test('parseAnalysis: THROWS on invalid met value in requirement', () => {
  assert.throws(
    () => parseAnalysis(validOutput({
      requirements: [{ key: 'income', met: 'maybe', detail: 'Invalid met value' }],
    })),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      return true;
    },
  );
});

test('parseAnalysis: THROWS when estimated_annual_value is a string', () => {
  assert.throws(
    () => parseAnalysis(validOutput({ estimated_annual_value: '1800' })),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      return true;
    },
  );
});

test('parseAnalysis: accepts multiple matches', () => {
  const output = {
    ...validOutput(),
    matches: [
      validMatch({ program_id: 'snap' }),
      validMatch({ program_id: 'wic', eligible: false, estimated_annual_value: 0 }),
    ],
    total_estimated_annual_value: 1800,
    priority_application_order: ['snap', 'wic'],
  };
  const result = parseAnalysis(output);
  assert.equal(result.matches.length, 2);
  assert.equal(result.matches[1].program_id, 'wic');
});

test('parseAnalysis: accepts warnings array', () => {
  const output = { ...validOutput(), warnings: ['Eviction notice detected — urgent!'] };
  const result = parseAnalysis(output);
  assert.equal(result.warnings[0], 'Eviction notice detected — urgent!');
});
