import { test } from 'node:test';
import assert from 'node:assert/strict';
import programsData from '../../data/programs.json';
import {
  HIDDEN_GEM_COUNT,
  PROGRAMS,
  PROGRAM_BY_ID,
  PROGRAM_COUNT,
  compareGemThenValue,
} from '../programs.js';

// ──── list, lookup and counts ────

test('PROGRAMS mirrors programs.json in order', () => {
  assert.deepEqual(
    PROGRAMS.map((p) => p.id),
    (programsData as { id: string }[]).map((p) => p.id)
  );
});

test('PROGRAM_COUNT is the number of programs', () => {
  assert.equal(PROGRAM_COUNT, PROGRAMS.length);
  assert.ok(PROGRAM_COUNT > 0);
});

test('HIDDEN_GEM_COUNT counts programs flagged hidden_gem', () => {
  const expected = PROGRAMS.filter((p) => p.hidden_gem).length;
  assert.equal(HIDDEN_GEM_COUNT, expected);
  assert.ok(HIDDEN_GEM_COUNT > 0);
});

test('PROGRAM_BY_ID finds every program by id', () => {
  assert.equal(PROGRAM_BY_ID.size, PROGRAM_COUNT);
  for (const p of PROGRAMS) assert.equal(PROGRAM_BY_ID.get(p.id), p);
  assert.equal(PROGRAM_BY_ID.get('not-a-program'), undefined);
});

// ──── compareGemThenValue ────

const row = (id: string, hiddenGem: boolean, value: number) => ({
  id,
  match: { estimated_annual_value: value },
  program: { hidden_gem: hiddenGem },
});

test('compareGemThenValue: hidden gems come first, then higher value', () => {
  // Arrange
  const rows = [
    row('federal-small', false, 500),
    row('gem-small', true, 100),
    row('federal-big', false, 9000),
    row('gem-big', true, 3000),
  ];

  // Act
  const ordered = [...rows].sort(compareGemThenValue).map((r) => r.id);

  // Assert
  assert.deepEqual(ordered, ['gem-big', 'gem-small', 'federal-big', 'federal-small']);
});

test('compareGemThenValue: equal rows compare as 0 so sort stays stable', () => {
  assert.equal(compareGemThenValue(row('a', true, 10), row('b', true, 10)), 0);
});
