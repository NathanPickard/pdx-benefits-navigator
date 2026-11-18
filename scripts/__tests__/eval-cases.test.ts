import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CASES } from '../eval/cases';
import { validateCaseDefinitions } from '../eval/validate';
import type { EvalCase } from '../eval/types';
import { scenarios } from '../../lib/scenarios';

const programs = JSON.parse(
  readFileSync(join(process.cwd(), 'data', 'programs.json'), 'utf8'),
) as Array<{ id: string }>;
const PROGRAM_IDS = new Set(programs.map((p) => p.id));

function makeCase(id: string, expected: Partial<EvalCase['expected']> = {}): EvalCase {
  return {
    id,
    title: id,
    intake: scenarios.maria,
    expected: { eligible: [], ...expected },
    notes: '',
  };
}

test('eval cases: CASES pass validateCaseDefinitions', () => {
  assert.ok(CASES.length > 0);
  assert.deepEqual(validateCaseDefinitions(CASES, PROGRAM_IDS), []);
});

test('validateCaseDefinitions: reports duplicate case ids', () => {
  const problems = validateCaseDefinitions([makeCase('a'), makeCase('a')], PROGRAM_IDS);
  assert.deepEqual(problems, ['Duplicate case id in CASES: "a"']);
});

test('validateCaseDefinitions: reports unknown ids in every expected field', () => {
  const kase = makeCase('a', {
    eligible: ['nope-eligible'],
    uncertain: ['nope-uncertain'],
    confidence: { 'nope-confidence': ['high'] },
    valueOverrides: { 'nope-override': [0, 1] },
  });
  const problems = validateCaseDefinitions([kase], PROGRAM_IDS);
  assert.equal(problems.length, 4);
  for (const id of ['nope-eligible', 'nope-uncertain', 'nope-confidence', 'nope-override']) {
    assert.ok(problems.some((p) => p.includes(`"${id}"`)), `missing problem for ${id}`);
  }
});

test('validateCaseDefinitions: reports eligible/uncertain overlap', () => {
  const kase = makeCase('a', { eligible: ['ohp'], uncertain: ['ohp'] });
  const problems = validateCaseDefinitions([kase], PROGRAM_IDS);
  assert.deepEqual(problems, [
    'Case "a" lists "ohp" in both expected.eligible and expected.uncertain',
  ]);
});

test('eval cases: every case documents its derivation', () => {
  for (const c of CASES) {
    assert.ok(c.notes.trim().length >= 40, `${c.id}: notes too thin to audit`);
  }
});

test('eval cases: persona intakes match the demo scenarios in lib/scenarios.ts', () => {
  for (const [slug, intake] of Object.entries(scenarios)) {
    const kase = CASES.find((c) => c.id === slug);
    assert.ok(kase, `no eval case for persona "${slug}"`);
    assert.deepEqual(
      kase.intake,
      intake,
      `${slug}: eval intake drifted from lib/scenarios.ts; update one to match and re-derive the expected sets`,
    );
  }
});
