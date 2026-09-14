import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CASES } from '../eval/cases';

const programs = JSON.parse(
  readFileSync(join(process.cwd(), 'data', 'programs.json'), 'utf8'),
) as Array<{ id: string }>;
const PROGRAM_IDS = new Set(programs.map((p) => p.id));

test('eval cases: ids are unique and non-empty', () => {
  const ids = CASES.map((c) => c.id);
  assert.ok(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
});

test('eval cases: every referenced program id exists in data/programs.json', () => {
  for (const c of CASES) {
    const referenced = [
      ...c.expected.eligible,
      ...(c.expected.uncertain ?? []),
      ...Object.keys(c.expected.confidence ?? {}),
      ...Object.keys(c.expected.valueOverrides ?? {}),
    ];
    for (const id of referenced) {
      assert.ok(PROGRAM_IDS.has(id), `${c.id}: unknown program id "${id}"`);
    }
  }
});

test('eval cases: eligible and uncertain sets are disjoint', () => {
  for (const c of CASES) {
    const uncertain = new Set(c.expected.uncertain ?? []);
    for (const id of c.expected.eligible) {
      assert.ok(!uncertain.has(id), `${c.id}: "${id}" is in both eligible and uncertain`);
    }
  }
});

test('eval cases: every case documents its derivation', () => {
  for (const c of CASES) {
    assert.ok(c.notes.trim().length >= 40, `${c.id}: notes too thin to audit`);
  }
});
