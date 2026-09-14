import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvalArgs, eligibleSetsMatch } from '../eval/run-eval';
import type { AnalysisOutput } from '../../types/program';

function out(ids: string[]): AnalysisOutput {
  return {
    matches: ids.map((id) => ({
      program_id: id, eligible: true, confidence: 'high' as const,
      estimated_annual_value: 0, reasoning: '', next_steps: [], required_documents: [],
    })),
    total_estimated_annual_value: 0, federal_only_value: 0, pdx_specific_value: 0,
    priority_application_order: [], warnings: [],
  };
}

test('parseEvalArgs: defaults to all cases, 1 run', () => {
  assert.deepEqual(parseEvalArgs([]), { caseIds: [], runs: 1 });
});

test('parseEvalArgs: picks up case ids and --runs N', () => {
  assert.deepEqual(parseEvalArgs(['maria', 'rose', '--runs', '3']), { caseIds: ['maria', 'rose'], runs: 3 });
});

test('eligibleSetsMatch: order-insensitive equality across attempts', () => {
  assert.equal(eligibleSetsMatch([out(['a', 'b']), out(['b', 'a'])]), true);
  assert.equal(eligibleSetsMatch([out(['a', 'b']), out(['a'])]), false);
  assert.equal(eligibleSetsMatch([out(['a'])]), true); // single attempt = stable
});
