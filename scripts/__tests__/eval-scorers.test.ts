import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreProgramSet, scoreDollars, scoreConfidence } from '../eval/scorers';
import type { AnalysisOutput, Program } from '../../types/program';

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
