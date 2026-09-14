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

function countUnescapedPipes(line: string): number {
  return (line.match(/(?<!\\)\|/g) ?? []).length;
}

test('renderReport escapes pipes and newlines in an error string so the table stays well-formed', () => {
  const run = makeRun();
  run.cases.push({
    id: 'broken',
    title: 'Broken case',
    error: 'boom | broken\nsecond line',
    unstable: false,
    attempts: [],
  });
  const md = renderReport(run);
  const lines = md.split('\n');
  const brokenRow = lines.find((l) => l.startsWith('| broken '));
  assert.ok(brokenRow, 'expected a scoreboard row for the broken case');
  // The raw pipe from the error text must be escaped, not a live column delimiter.
  assert.ok(brokenRow!.includes('boom \\| broken second line'));
  // Header has 8 columns → 9 unescaped pipe delimiters; the broken row must match.
  const headerRow = lines.find((l) => l.startsWith('| case '));
  assert.equal(countUnescapedPipes(brokenRow!), countUnescapedPipes(headerRow!));
});

test('renderReport renders a dash in the conf. agree column when a case declares no confidence expectations', () => {
  const run = makeRun();
  run.cases.push({
    id: 'no-confidence-case',
    title: 'No confidence expectations',
    unstable: false,
    attempts: [
      {
        output: { matches: [], total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0, priority_application_order: [], warnings: [] },
        programSet: { precision: 1, recall: 1, f1: 1, falsePositives: [], falseNegatives: [], hiddenGemMisses: [] },
        dollars: { inRangeRate: 1, checked: 3, violations: [] },
        confidence: { agreementRate: 1, checked: 0, disagreements: [] },
        reasoning: { passRate: 1, judged: 3, unjudged: 0, failures: [] },
        judgeTranscripts: [],
      },
    ],
  });
  const md = renderReport(run);
  const row = md.split('\n').find((l) => l.startsWith('| no-confidence-case '));
  assert.ok(row, 'expected a scoreboard row for the no-confidence case');
  const cells = row!.split('|').map((c) => c.trim());
  // cells: ['', label, f1, precision, recall, dollarsInRange, confAgree, reasoningPass, flags, '']
  assert.equal(cells[6], '—', 'conf. agree cell must be a dash when checked === 0, not a vacuous 100%');
  assert.notEqual(cells[6], '100%');
});

test('renderReport averages the Aggregate conf. agree column only over cases with checked > 0', () => {
  const run: RunData = {
    date: '2026-08-18T00:00:00Z',
    model: 'claude-sonnet-4-6',
    judgeModel: 'claude-haiku-4-5-20251001',
    gitSha: 'abc1234',
    runsPerCase: 1,
    cases: [
      {
        id: 'no-confidence',
        title: 'No confidence expectations',
        unstable: false,
        attempts: [
          {
            output: { matches: [], total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0, priority_application_order: [], warnings: [] },
            programSet: { precision: 1, recall: 1, f1: 1, falsePositives: [], falseNegatives: [], hiddenGemMisses: [] },
            dollars: { inRangeRate: 1, checked: 0, violations: [] },
            confidence: { agreementRate: 1, checked: 0, disagreements: [] },
            reasoning: { passRate: 1, judged: 0, unjudged: 0, failures: [] },
            judgeTranscripts: [],
          },
        ],
      },
      {
        id: 'half-agree',
        title: 'Half of declared confidence expectations agree',
        unstable: false,
        attempts: [
          {
            output: { matches: [], total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0, priority_application_order: [], warnings: [] },
            programSet: { precision: 1, recall: 1, f1: 1, falsePositives: [], falseNegatives: [], hiddenGemMisses: [] },
            dollars: { inRangeRate: 1, checked: 0, violations: [] },
            confidence: { agreementRate: 0.5, checked: 2, disagreements: [] },
            reasoning: { passRate: 1, judged: 0, unjudged: 0, failures: [] },
            judgeTranscripts: [],
          },
        ],
      },
    ],
  };
  const md = renderReport(run);
  const aggregateRow = md.split('\n').find((l) => l.startsWith('| Aggregate'));
  assert.ok(aggregateRow, 'expected an Aggregate row');
  const cells = aggregateRow!.split('|').map((c) => c.trim());
  // Only the checked > 0 case (agreementRate 0.5) should feed the mean — not diluted by the checked:0 case.
  assert.equal(cells[6], '50%', 'Aggregate conf. agree must average only checked>0 cases, not include vacuous 1.0s');
  assert.notEqual(cells[6], '75%');
});

test('renderReport renders a dash Aggregate row when every case errored', () => {
  const run: RunData = {
    date: '2026-08-18T00:00:00Z',
    model: 'claude-sonnet-4-6',
    judgeModel: 'claude-haiku-4-5-20251001',
    gitSha: 'abc1234',
    runsPerCase: 1,
    cases: [
      { id: 'maria', title: 'Maria persona', error: 'API exploded', unstable: false, attempts: [] },
      { id: 'james', title: 'James persona', error: 'timeout', unstable: false, attempts: [] },
    ],
  };
  const md = renderReport(run);
  const aggregateRow = md.split('\n').find((l) => l.startsWith('| Aggregate'));
  assert.ok(aggregateRow, 'expected an Aggregate row');
  assert.ok(!aggregateRow!.includes('0.00'));
  assert.ok(!aggregateRow!.includes('0%'));
  assert.match(aggregateRow!, /^\| Aggregate \| — \| — \| — \| — \| — \| — \|\s*\|$/);
});
