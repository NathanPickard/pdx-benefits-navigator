// 2026 HHS Poverty Guidelines, 48 contiguous states & DC. Keep in sync with the
// FPL table in ELIGIBILITY_SYSTEM_PROMPT (lib/eligibility.ts).
export const FPL_2026 = { base: 15960, perPerson: 5680 } as const;

/** Annual 2026 Federal Poverty Level for a household of `size` people. */
export function fplFor(size: number): number {
  return FPL_2026.base + Math.max(0, size - 1) * FPL_2026.perPerson;
}
