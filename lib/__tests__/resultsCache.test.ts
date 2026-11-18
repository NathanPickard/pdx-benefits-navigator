import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashIntake } from '../resultsCache';
import type { IntakeData } from '@/types/program';

test('hashIntake ignores key order', () => {
  // Arrange: the same intake with keys in a different order, as happens when
  // the stored JSON is re-parsed through the zod schema.
  const a = { zip: '97206', household_size: 3, child_ages: [4, 9] } as unknown as IntakeData;
  const b = { child_ages: [4, 9], household_size: 3, zip: '97206' } as unknown as IntakeData;

  // Act + Assert
  assert.equal(hashIntake(a), hashIntake(b));
});

test('hashIntake changes when a value changes', () => {
  const a = { zip: '97206', household_size: 3 } as unknown as IntakeData;
  const b = { zip: '97206', household_size: 4 } as unknown as IntakeData;
  assert.notEqual(hashIntake(a), hashIntake(b));
});

test('hashIntake keeps array order significant', () => {
  const a = { child_ages: [4, 9] } as unknown as IntakeData;
  const b = { child_ages: [9, 4] } as unknown as IntakeData;
  assert.notEqual(hashIntake(a), hashIntake(b));
});
