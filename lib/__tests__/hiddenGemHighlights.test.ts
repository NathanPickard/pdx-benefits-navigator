import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HIDDEN_GEM_HIGHLIGHTS, MARQUEE_ITEMS } from '../hiddenGemHighlights.js';
import { PROGRAM_BY_ID } from '../programs.js';

/** Every dollar figure in a display string, e.g. "$2,900 – $4,500" → [2900, 4500]. */
function dollarFigures(value: string): number[] {
  return [...value.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, '')));
}

function assertGroundedDollars(programId: string, value: string): void {
  const program = PROGRAM_BY_ID.get(programId);
  assert.ok(program, `unknown programId "${programId}"`);
  const { min, max, median } = program.estimated_annual_value;
  for (const n of dollarFigures(value)) {
    assert.ok(
      [min, max, median].includes(n),
      `"${value}" for ${programId}: $${n} is not the program's min (${min}), max (${max}) or median (${median})`
    );
  }
}

test('dollarFigures extracts grouped dollar amounts', () => {
  assert.deepEqual(dollarFigures('$2,900 – $4,500'), [2900, 4500]);
  assert.deepEqual(dollarFigures('up to $15,000'), [15000]);
  assert.deepEqual(dollarFigures('80% off bill'), []);
});

test('every hidden-gem highlight is a hidden-gem program in programs.json', () => {
  for (const h of HIDDEN_GEM_HIGHLIGHTS) {
    const program = PROGRAM_BY_ID.get(h.programId);
    assert.ok(program, `unknown programId "${h.programId}"`);
    assert.equal(program.hidden_gem, true, `${h.programId} is not flagged hidden_gem`);
  }
});

test('hidden-gem highlight dollar figures match the program range', () => {
  for (const h of HIDDEN_GEM_HIGHLIGHTS) assertGroundedDollars(h.programId, h.value);
});

test('marquee dollar figures match the program range', () => {
  for (const m of MARQUEE_ITEMS) assertGroundedDollars(m.programId, m.value);
});
