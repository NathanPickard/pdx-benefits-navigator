import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildJudgePrompt, parseJudgeResponse } from '../eval/judge';
import type { IntakeData, MatchResult, Program } from '../../types/program';

const intake = { household_size: 3, annual_income: 32000, zip_code: '97216' } as IntakeData;
const program = {
  id: 'snap', name: 'SNAP', hidden_gem: false,
  estimated_annual_value: { min: 1000, max: 12000, median: 4000 },
  eligibility: { income_max_pct_fpl: 130 },
} as Program;
const match = {
  program_id: 'snap', eligible: true, confidence: 'high',
  estimated_annual_value: 4800,
  reasoning: 'Income $32,000 is under the $35,516 limit (130% FPL) for a household of 3.',
  next_steps: [], required_documents: [],
} as MatchResult;

test('buildJudgePrompt includes the facts the judge needs', () => {
  const p = buildJudgePrompt(intake, program, match);
  assert.ok(p.includes('32000') || p.includes('32,000'));
  assert.ok(p.includes('SNAP'));
  assert.ok(p.includes(match.reasoning));
  assert.ok(p.includes('income_max_pct_fpl'));
});

test('buildJudgePrompt includes the official reference tables from the eligibility engine', () => {
  const p = buildJudgePrompt(intake, program, match);
  assert.ok(p.includes('OFFICIAL REFERENCE TABLES'));
  assert.ok(p.includes('$38,384'));
});

test('buildJudgePrompt states the tightened contradiction-only failure standard', () => {
  const p = buildJudgePrompt(intake, program, match);
  assert.ok(p.includes('AFFIRMATIVELY CONTRADICT'));
  assert.ok(p.includes('Unverifiable-but-plausible is a pass'));
});

test('parseJudgeResponse handles clean JSON', () => {
  assert.deepEqual(parseJudgeResponse('{"verdict":"pass"}'), { verdict: 'pass', issue: undefined });
});

test('parseJudgeResponse extracts JSON embedded in prose', () => {
  const r = parseJudgeResponse('Here is my judgment:\n{"verdict": "fail", "issue": "cites 185% not 130%"}');
  assert.equal(r?.verdict, 'fail');
  assert.equal(r?.issue, 'cites 185% not 130%');
});

test('parseJudgeResponse returns null on garbage or invalid verdicts', () => {
  assert.equal(parseJudgeResponse('no json here'), null);
  assert.equal(parseJudgeResponse('{"verdict":"maybe"}'), null);
});
