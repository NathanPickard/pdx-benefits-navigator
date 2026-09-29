import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreProgramSet, scoreDollars, scoreConfidence } from '../eval/scorers';
import type { ScheduleUnit } from '../eval/scorers';
import type { AnalysisOutput, Program } from '../../types/program';
import programs from '../../data/programs.json';

// Minimal synthetic programs — only the fields scorers read.
function prog(id: string, hidden_gem: boolean, min = 100, max = 1000): Program {
  return { id, hidden_gem, estimated_annual_value: { min, max, median: (min + max) / 2 } } as Program;
}

function output(matches: Array<Partial<AnalysisOutput['matches'][number]>>): AnalysisOutput {
  return {
    matches: matches.map((m) => ({
      program_id: 'x',
      eligible: true,
      confidence: 'high',
      estimated_annual_value: 500,
      reasoning: '',
      next_steps: [],
      required_documents: [],
      ...m,
    })),
    total_estimated_annual_value: 0,
    federal_only_value: 0,
    pdx_specific_value: 0,
    priority_application_order: [],
    warnings: [],
  };
}

const PROGRAMS = [prog('a', false), prog('b', true), prog('c', false), prog('d', true)];

test('scoreProgramSet: perfect prediction scores 1.0 across the board', () => {
  const out = output([{ program_id: 'a' }, { program_id: 'b' }, { program_id: 'c', eligible: false }]);
  const s = scoreProgramSet(out, { eligible: ['a', 'b'] }, PROGRAMS);
  assert.equal(s.precision, 1);
  assert.equal(s.recall, 1);
  assert.equal(s.f1, 1);
  assert.deepEqual(s.falsePositives, []);
  assert.deepEqual(s.falseNegatives, []);
});

test('scoreProgramSet: false positive and hidden-gem false negative are reported', () => {
  // expected {a, d(gem)}; model says {a, c} → fp: c, fn: d, gem miss: d
  const out = output([{ program_id: 'a' }, { program_id: 'c' }]);
  const s = scoreProgramSet(out, { eligible: ['a', 'd'] }, PROGRAMS);
  assert.deepEqual(s.falsePositives, ['c']);
  assert.deepEqual(s.falseNegatives, ['d']);
  assert.deepEqual(s.hiddenGemMisses, ['d']);
  assert.equal(s.precision, 1 / 2);
  assert.equal(s.recall, 1 / 2);
});

test('scoreProgramSet: uncertain ids are excluded from scoring', () => {
  // c is uncertain — model marking it eligible must NOT count as a false positive
  const out = output([{ program_id: 'a' }, { program_id: 'c' }]);
  const s = scoreProgramSet(out, { eligible: ['a'], uncertain: ['c'] }, PROGRAMS);
  assert.deepEqual(s.falsePositives, []);
  assert.equal(s.precision, 1);
});

test('scoreProgramSet: empty expected and empty prediction is a perfect score', () => {
  const out = output([{ program_id: 'a', eligible: false }]);
  const s = scoreProgramSet(out, { eligible: [] }, PROGRAMS);
  assert.equal(s.precision, 1);
  assert.equal(s.recall, 1);
});

test('scoreDollars: flags values outside the official range, ignores ineligible', () => {
  const out = output([
    { program_id: 'a', estimated_annual_value: 500 },   // in [100,1000]
    { program_id: 'b', estimated_annual_value: 5000 },  // out of range
    { program_id: 'c', estimated_annual_value: 99999, eligible: false }, // ignored
  ]);
  const s = scoreDollars(out, PROGRAMS);
  assert.equal(s.checked, 2);
  assert.equal(s.inRangeRate, 1 / 2);
  assert.equal(s.violations.length, 1);
  assert.equal(s.violations[0].program_id, 'b');
});

test('scoreDollars: valueOverrides tighten the accepted range', () => {
  const out = output([{ program_id: 'a', estimated_annual_value: 900 }]); // in official, out of override
  const s = scoreDollars(out, PROGRAMS, { a: [100, 600] });
  assert.equal(s.violations.length, 1);
  assert.equal(s.violations[0].max, 600);
});

function withSchedule(program: Program, unit: ScheduleUnit, values: number[]): Program {
  return {
    ...program,
    benefit_schedule: {
      description: 'test schedule',
      unit,
      amounts: values.map((value, i) => ({ condition: `row ${i}`, value })),
    },
  };
}

test('scoreDollars: an annualized schedule row above the coarse range is accepted', () => {
  // SNAP-shaped: range tops out at $9,000 but the official household-of-4 row is $994/mo.
  const snap = withSchedule(prog('snap', false, 1200, 9000), 'usd_monthly', [298, 785, 994]);
  const out = output([{ program_id: 'snap', estimated_annual_value: 994 * 12 }]);
  const s = scoreDollars(out, [snap]);
  assert.deepEqual(s.violations, []);
});

test('scoreDollars: a schedule that never overlaps the range is ignored', () => {
  // ERDC-shaped: the schedule is a monthly copay table, not the benefit value.
  const erdc = withSchedule(prog('erdc', false, 8000, 18000), 'usd_monthly', [0, 5, 130]);
  const out = output([{ program_id: 'erdc', estimated_annual_value: 0 }]);
  const s = scoreDollars(out, [erdc]);
  assert.equal(s.violations.length, 1);
  assert.equal(s.violations[0].min, 8000);
});

test('scoreDollars: percent_discount schedules fall back to the range', () => {
  // Rows overlap the range, so they would widen it to 3000 if percents were read as dollars.
  const pge = withSchedule(prog('pge', false, 300, 1500), 'percent_discount', [1000, 3000]);
  const out = output([{ program_id: 'pge', estimated_annual_value: 2500 }]);
  const s = scoreDollars(out, [pge]);
  assert.equal(s.violations.length, 1);
});

test('scoreDollars: usd_annual and usd_one_time rows are taken as-is, not multiplied', () => {
  const annual = withSchedule(prog('annual', false, 200, 600), 'usd_annual', [400, 900]);
  const oneTime = withSchedule(prog('once', false, 2900, 4500), 'usd_one_time', [3000, 5000]);
  const out = output([
    { program_id: 'annual', estimated_annual_value: 900 },
    { program_id: 'once', estimated_annual_value: 5000 },
  ]);
  const s = scoreDollars(out, [annual, oneTime]);
  assert.deepEqual(s.violations, []);
});

test('scoreDollars: a schedule that only touches the range edge still counts as overlapping', () => {
  const touchesMax = withSchedule(prog('hi', false, 100, 1000), 'usd_annual', [1000, 2000]);
  const touchesMin = withSchedule(prog('lo', false, 100, 1000), 'usd_annual', [50, 100]);
  const out = output([
    { program_id: 'hi', estimated_annual_value: 2000 },
    { program_id: 'lo', estimated_annual_value: 50 },
  ]);
  const s = scoreDollars(out, [touchesMax, touchesMin]);
  assert.deepEqual(s.violations, []);
});

test('scoreDollars: valueOverrides still win over a schedule', () => {
  const snap = withSchedule(prog('snap', false, 1200, 9000), 'usd_monthly', [994]);
  const out = output([{ program_id: 'snap', estimated_annual_value: 994 * 12 }]);
  const s = scoreDollars(out, [snap], { snap: [1200, 9000] });
  assert.equal(s.violations.length, 1);
});

test('scoreDollars: real programs.json — SNAP/WIC schedule rows pass, ERDC copays and veterans assessed values do not', () => {
  const all = programs as unknown as Program[];
  // Derived, not hardcoded: WIC amounts change each fiscal year.
  const wicRows = all.find((p) => p.id === 'wic')?.benefit_schedule?.amounts ?? [];
  const lowestWicAnnual = Math.min(...wicRows.map((row) => row.value)) * 12;
  const out = output([
    { program_id: 'snap', estimated_annual_value: 785 * 12 },
    { program_id: 'wic', estimated_annual_value: lowestWicAnnual },
    { program_id: 'erdc', estimated_annual_value: 0 },
    { program_id: 'veterans-prop-tax-exempt', estimated_annual_value: 27092 },
  ]);
  const s = scoreDollars(out, all);
  assert.deepEqual(
    s.violations.map((v) => v.program_id).sort(),
    ['erdc', 'veterans-prop-tax-exempt'],
  );
});

test('scoreConfidence: only declared programs are checked', () => {
  const out = output([
    { program_id: 'a', confidence: 'high' },
    { program_id: 'b', confidence: 'low' },
  ]);
  const s = scoreConfidence(out, { a: ['high', 'medium'], b: ['high'] });
  assert.equal(s.checked, 2);
  assert.equal(s.agreementRate, 1 / 2);
  assert.equal(s.disagreements[0].program_id, 'b');
});

test('scoreConfidence: no declarations means vacuous pass', () => {
  const s = scoreConfidence(output([{ program_id: 'a' }]));
  assert.equal(s.checked, 0);
  assert.equal(s.agreementRate, 1);
});
