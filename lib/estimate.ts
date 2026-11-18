import { CHROME_EN } from './i18n';

/**
 * True when a match carries an estimate. Per CONTEXT.md an estimate is always
 * above zero; a $0 (or missing/invalid) figure means an unestimated match.
 */
export function hasEstimate(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * A number with en-US thousands grouping ("48,000"), regardless of the
 * visitor's locale. Does not round; callers round where they need to.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** A dollar figure with en-US grouping ("$48,000"). Does not round. */
export function formatUsd(n: number): string {
  return `$${formatNumber(n)}`;
}

/**
 * The display text for a match's annual value: "$12,000" for an estimate,
 * otherwise the "Ask the program" label (pass the translated Chrome label in
 * the UI; English surfaces use the default).
 */
export function formatEstimate(
  value: number,
  askLabel: string = CHROME_EN.askTheProgram
): string {
  return hasEstimate(value) ? formatUsd(value) : askLabel;
}
