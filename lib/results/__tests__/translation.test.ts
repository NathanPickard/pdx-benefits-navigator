import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeTranslatedStrings } from '../translation.js';
import type { AnalysisOutput, MatchResult } from '../../../types/program.js';

function match(id: string, overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    program_id: id,
    eligible: true,
    confidence: 'high',
    estimated_annual_value: 3000,
    reasoning: `${id} reasoning`,
    requirements: [
      { key: 'income', met: 'yes', detail: `${id} income detail` },
      { key: 'residency', met: 'yes', detail: `${id} residency detail` },
    ],
    next_steps: [`${id} step 1`, `${id} step 2`],
    required_documents: [`${id} doc`],
    urgency_note: `${id} urgent`,
    ...overrides,
  };
}

function original(): AnalysisOutput {
  return {
    matches: [match('snap'), match('liheap', { eligible: false, estimated_annual_value: 0 })],
    total_estimated_annual_value: 3000,
    federal_only_value: 3000,
    pdx_specific_value: 0,
    priority_application_order: ['snap', 'liheap'],
    warnings: ['warning one'],
    caseworker_notes: 'notes',
  };
}

test('mergeTranslatedStrings: copies translated string fields', () => {
  const translated = {
    matches: [
      {
        program_id: 'snap',
        reasoning: 'razonamiento',
        requirements: [
          { key: 'income', detail: 'ingresos' },
          { key: 'residency', detail: 'residencia' },
        ],
        next_steps: ['paso 1', 'paso 2'],
        required_documents: ['documento'],
        urgency_note: 'urgente',
      },
    ],
    warnings: ['advertencia'],
    caseworker_notes: 'notas',
  };

  const merged = mergeTranslatedStrings(original(), translated);

  const snap = merged.matches[0];
  assert.equal(snap.reasoning, 'razonamiento');
  assert.deepEqual(
    snap.requirements?.map((r) => r.detail),
    ['ingresos', 'residencia']
  );
  assert.deepEqual(snap.next_steps, ['paso 1', 'paso 2']);
  assert.deepEqual(snap.required_documents, ['documento']);
  assert.equal(snap.urgency_note, 'urgente');
  assert.deepEqual(merged.warnings, ['advertencia']);
  assert.equal(merged.caseworker_notes, 'notas');
});

test('mergeTranslatedStrings: totals, eligibility and estimates come from the original', () => {
  const translated = {
    total_estimated_annual_value: 99999,
    federal_only_value: 1,
    pdx_specific_value: 2,
    priority_application_order: ['liheap'],
    matches: [
      { program_id: 'snap', eligible: false, estimated_annual_value: 50000, confidence: 'low' },
      { program_id: 'liheap', eligible: true, estimated_annual_value: 9000 },
    ],
  };

  const merged = mergeTranslatedStrings(original(), translated);

  assert.equal(merged.total_estimated_annual_value, 3000);
  assert.equal(merged.federal_only_value, 3000);
  assert.equal(merged.pdx_specific_value, 0);
  assert.deepEqual(merged.priority_application_order, ['snap', 'liheap']);
  assert.equal(merged.matches[0].eligible, true);
  assert.equal(merged.matches[0].estimated_annual_value, 3000);
  assert.equal(merged.matches[0].confidence, 'high');
  assert.equal(merged.matches[1].eligible, false);
  assert.equal(merged.matches[1].estimated_annual_value, 0);
});

test('mergeTranslatedStrings: a renamed or dropped program_id keeps the English strings', () => {
  const translated = {
    matches: [{ program_id: 'cupones', reasoning: 'razonamiento' }],
  };

  const merged = mergeTranslatedStrings(original(), translated);

  assert.deepEqual(
    merged.matches.map((m) => m.program_id),
    ['snap', 'liheap']
  );
  assert.equal(merged.matches[0].reasoning, 'snap reasoning');
  assert.equal(merged.matches[1].reasoning, 'liheap reasoning');
});

test('mergeTranslatedStrings: arrays of the wrong length keep the English values', () => {
  const translated = {
    matches: [
      {
        program_id: 'snap',
        next_steps: ['solo un paso'],
        required_documents: ['a', 'b'],
        requirements: [{ key: 'income', detail: 'ingresos' }],
      },
    ],
  };

  const merged = mergeTranslatedStrings(original(), translated);

  const snap = merged.matches[0];
  assert.deepEqual(snap.next_steps, ['snap step 1', 'snap step 2']);
  assert.deepEqual(snap.required_documents, ['snap doc']);
  assert.deepEqual(
    snap.requirements?.map((r) => r.detail),
    ['ingresos', 'snap residency detail']
  );
});

test('mergeTranslatedStrings: requirement detail is copied only when the key matches', () => {
  const translated = {
    matches: [
      {
        program_id: 'snap',
        requirements: [
          { key: 'ingresos', detail: 'ingresos' },
          { key: 'residency', detail: 'residencia' },
        ],
      },
    ],
  };

  const merged = mergeTranslatedStrings(original(), translated);

  assert.deepEqual(
    merged.matches[0].requirements?.map((r) => [r.key, r.met, r.detail]),
    [
      ['income', 'yes', 'snap income detail'],
      ['residency', 'yes', 'residencia'],
    ]
  );
});

test('mergeTranslatedStrings: non-string fields keep the English values', () => {
  const translated = {
    matches: [
      {
        program_id: 'snap',
        reasoning: 42,
        urgency_note: { text: 'urgente' },
        next_steps: ['paso 1', 7],
        requirements: [{ key: 'income', detail: null }],
      },
    ],
    warnings: 'advertencia',
    caseworker_notes: ['notas'],
  };

  const merged = mergeTranslatedStrings(original(), translated);

  const snap = merged.matches[0];
  assert.equal(snap.reasoning, 'snap reasoning');
  assert.equal(snap.urgency_note, 'snap urgent');
  assert.deepEqual(snap.next_steps, ['snap step 1', 'snap step 2']);
  assert.equal(snap.requirements?.[0].detail, 'snap income detail');
  assert.deepEqual(merged.warnings, ['warning one']);
  assert.equal(merged.caseworker_notes, 'notes');
});

test('mergeTranslatedStrings: a non-object translation returns the original content', () => {
  const source = original();

  assert.deepEqual(mergeTranslatedStrings(source, null), source);
  assert.deepEqual(mergeTranslatedStrings(source, 'oops'), source);
  assert.deepEqual(mergeTranslatedStrings(source, { matches: 'nope' }), source);
});

test('mergeTranslatedStrings: does not mutate the original', () => {
  const source = original();
  const snapshot = structuredClone(source);

  mergeTranslatedStrings(source, {
    matches: [{ program_id: 'snap', reasoning: 'razonamiento', next_steps: ['a', 'b'] }],
    warnings: ['advertencia'],
  });

  assert.deepEqual(source, snapshot);
});
