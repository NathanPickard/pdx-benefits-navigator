import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReport, type RunData } from '../eval/report';

function makeRun(): RunData {
  return {
    date: '2026-08-18T00:00:00Z',
    model: 'claude-sonnet-4-6',
    judgeModel: 'claude-haiku-4-5-20251001',
    gitSha: 'abc1234',
    runsPerCase: 1,
    cases: [
      {
        id: 'maria',
        title: 'Maria persona',
        unstable: false,
        attempts: [
          {
            output: { matches: [], total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0, priority_application_order: [], warnings: [] },
            programSet: { precision: 0.9, recall: 1, f1: 0.947, falsePositives: ['snap'], falseNegatives: [], hiddenGemMisses: [] },
            dollars: { inRangeRate: 1, checked: 11, violations: [] },
            confidence: { agreementRate: 1, checked: 2, disagreements: [] },
            reasoning: { passRate: 0.9, judged: 10, unjudged: 1, failures: [{ program_id: 'ohp', issue: 'wrong FPL row' }] },
            judgeTranscripts: [],
          },
        ],
      },
    ],
  };
}

test('renderReport includes header metadata and the scoreboard row', () => {
  const md = renderReport(makeRun());
  assert.ok(md.includes('claude-sonnet-4-6'));
  assert.ok(md.includes('abc1234'));
  assert.ok(md.includes('maria'));
  assert.ok(md.includes('0.95')); // f1 rendered to two decimals
});

test('renderReport lists failures with program ids', () => {
  const md = renderReport(makeRun());
  assert.ok(md.includes('snap'));          // false positive listed
  assert.ok(md.includes('wrong FPL row')); // judge failure listed
});

test('renderReport marks errored and unstable cases', () => {
  const run = makeRun();
  run.cases.push({ id: 'broken', title: 'Broken case', error: 'API exploded', unstable: false, attempts: [] });
  run.cases[0].unstable = true;
  const md = renderReport(run);
  assert.ok(md.includes('API exploded'));
  assert.ok(md.toLowerCase().includes('unstable'));
});
