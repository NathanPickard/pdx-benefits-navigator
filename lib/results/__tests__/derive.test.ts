import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlainTextSummary,
  filterRows,
  joinPrograms,
  likelyRange,
  sortRows,
  type EligibleRow,
} from '../derive.js';
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

function fullRow(
  id: string,
  estimate: number,
  overProgram: Partial<Program> = {},
  overMatch: Partial<MatchResult> = {}
): EligibleRow {
  const match = {
    program_id: id,
    eligible: true,
    estimated_annual_value: estimate,
    next_steps: [`${id} step`],
    ...overMatch,
  } as MatchResult;
  const program = {
    id,
    name: `${id} name`,
    short_name: id.toUpperCase(),
    hidden_gem: false,
    category: 'food',
    jurisdiction: 'federal',
    estimated_annual_value: { min: 0, max: 0, median: 0 },
    ...overProgram,
  } as Program;
  return { match, program };
}

test('joinPrograms: pairs matches with programs in order and drops unknown ids', () => {
  const a = fullRow('snap', 3000);
  const b = fullRow('pcef', 500);
  const programById = new Map([
    ['snap', a.program],
    ['pcef', b.program],
  ]);

  const rows = joinPrograms([b.match, { ...a.match, program_id: 'ghost' }, a.match], programById);

  assert.deepEqual(
    rows.map((r) => [r.match.program_id, r.program.id]),
    [
      ['pcef', 'pcef'],
      ['snap', 'snap'],
    ]
  );
});

test('filterRows: null filters keep every row', () => {
  const rows = [fullRow('a', 1), fullRow('b', 2)];

  assert.deepEqual(filterRows(rows, { category: null, jurisdiction: null }), rows);
});

test('filterRows: applies category and jurisdiction together', () => {
  const rows = [
    fullRow('a', 1, { category: 'food', jurisdiction: 'federal' }),
    fullRow('b', 1, { category: 'food', jurisdiction: 'portland' }),
    fullRow('c', 1, { category: 'housing', jurisdiction: 'portland' }),
  ];

  const ids = filterRows(rows, { category: 'food', jurisdiction: 'portland' }).map(
    (r) => r.program.id
  );

  assert.deepEqual(ids, ['b']);
});

test('sortRows: gems mode puts hidden gems first, then by value', () => {
  const rows = [
    fullRow('big', 5000),
    fullRow('gemSmall', 100, { hidden_gem: true }),
    fullRow('gemBig', 900, { hidden_gem: true }),
    fullRow('small', 200),
  ];

  const ids = sortRows(rows, 'gems').map((r) => r.program.id);

  assert.deepEqual(ids, ['gemBig', 'gemSmall', 'big', 'small']);
});

test('sortRows: amount mode sorts by value only and does not mutate the input', () => {
  const rows = [fullRow('small', 100), fullRow('gem', 200, { hidden_gem: true }), fullRow('big', 900)];
  const before = rows.map((r) => r.program.id);

  const ids = sortRows(rows, 'amount').map((r) => r.program.id);

  assert.deepEqual(ids, ['big', 'gem', 'small']);
  assert.deepEqual(
    rows.map((r) => r.program.id),
    before
  );
});

test('buildPlainTextSummary: header, blank line, and one bullet per row', () => {
  const rows = [
    fullRow('snap', 4800),
    fullRow('pcef', 0, {}, { next_steps: [] }),
  ];

  const text = buildPlainTextSummary(48000, rows);

  assert.equal(
    text,
    [
      'PDX Benefits Navigator — estimated $48,000/year across 2 programs',
      '',
      '• snap name — ~$4,800/yr — snap step',
      '• pcef name — Ask the program — PCEF',
    ].join('\n')
  );
});

test('buildPlainTextSummary: singular "program" for one row', () => {
  const text = buildPlainTextSummary(4800, [fullRow('snap', 4800)]);

  assert.ok(text.startsWith('PDX Benefits Navigator — estimated $4,800/year across 1 program\n'));
});
