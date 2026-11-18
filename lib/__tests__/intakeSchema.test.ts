import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IntakeSchema, parseStoredIntakeFields } from '../intakeSchema.js';
import { scenarios } from '../scenarios.js';

const FALLBACK = scenarios.maria;

test('IntakeSchema: every demo scenario intake passes', () => {
  for (const [slug, intake] of Object.entries(scenarios)) {
    const result = IntakeSchema.safeParse(intake);
    assert.ok(result.success, `${slug}: ${result.success ? '' : result.error.message}`);
  }
});

test('IntakeSchema: rejects a malformed ZIP code', () => {
  const result = IntakeSchema.safeParse({ ...FALLBACK, zip_code: '9720' });
  assert.equal(result.success, false);
});

test('parseStoredIntakeFields: keeps valid fields and resets only the bad one', () => {
  const stored = { ...scenarios.maria, household_size: 'four' };
  const seeded = parseStoredIntakeFields(stored, scenarios.james);
  assert.deepEqual(seeded, { ...scenarios.maria, household_size: scenarios.james.household_size });
});

test('parseStoredIntakeFields: a missing field takes the fallback value', () => {
  const stored: Record<string, unknown> = { ...scenarios.james };
  delete stored.received_eviction_notice;
  const seeded = parseStoredIntakeFields(stored, { ...scenarios.james, received_eviction_notice: true });
  assert.equal(seeded.received_eviction_notice, true);
});

test('parseStoredIntakeFields: falls back for every field when input is not an object', () => {
  assert.deepEqual(parseStoredIntakeFields('garbage', FALLBACK), FALLBACK);
  assert.deepEqual(parseStoredIntakeFields(null, FALLBACK), FALLBACK);
});

test('parseStoredIntakeFields: an out-of-range value falls back', () => {
  const seeded = parseStoredIntakeFields({ ...FALLBACK, primary_language: 'fr' }, scenarios.rose);
  assert.equal(seeded.primary_language, scenarios.rose.primary_language);
});
