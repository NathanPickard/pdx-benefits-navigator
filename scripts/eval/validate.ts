/**
 * Static checks on the hand-written eval case definitions. Shared by the
 * runner (fails fast before any API call) and the unit tests.
 */

import type { EvalCase } from './types';

/** Every program id a case references across its expected fields. */
function referencedProgramIds(kase: EvalCase): string[] {
  const { eligible, uncertain, confidence, valueOverrides } = kase.expected;
  return [
    ...eligible,
    ...(uncertain ?? []),
    ...Object.keys(confidence ?? {}),
    ...Object.keys(valueOverrides ?? {}),
  ];
}

/**
 * Returns one message per problem: duplicate case ids, unknown program ids in
 * eligible, uncertain, confidence or valueOverrides, and ids listed as both
 * eligible and uncertain. An empty array means the cases are valid.
 */
export function validateCaseDefinitions(
  cases: readonly EvalCase[],
  programIds: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  const seenCaseIds = new Set<string>();

  for (const kase of cases) {
    if (seenCaseIds.has(kase.id)) {
      problems.push(`Duplicate case id in CASES: "${kase.id}"`);
    }
    seenCaseIds.add(kase.id);

    for (const programId of referencedProgramIds(kase)) {
      if (!programIds.has(programId)) {
        problems.push(`Case "${kase.id}" references unknown program id "${programId}"`);
      }
    }

    const uncertain = new Set(kase.expected.uncertain ?? []);
    for (const id of new Set(kase.expected.eligible)) {
      if (uncertain.has(id)) {
        problems.push(
          `Case "${kase.id}" lists "${id}" in both expected.eligible and expected.uncertain`,
        );
      }
    }
  }

  return problems;
}
