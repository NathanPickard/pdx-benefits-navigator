import type { BenefitSchedule, Program } from '../types/program';
import { formatUsd } from './estimate';

type ScheduleUnit = BenefitSchedule['unit'];
export type DollarRange = [min: number, max: number];

/** Multiplier that turns one schedule row into an annual dollar amount. */
const ANNUAL_MULTIPLIER: Partial<Record<ScheduleUnit, number>> = {
  usd_monthly: 12,
  usd_annual: 1,
  usd_one_time: 1,
};

/**
 * The lowest and highest annual benefit a schedule publishes, or null when its
 * rows are not benefit dollars: percent discounts, copays the household pays,
 * or assessed value exempt from tax.
 */
export function annualizedBenefitRange(schedule: BenefitSchedule): DollarRange | null {
  if ((schedule.kind ?? 'benefit') !== 'benefit') return null;
  const multiplier = ANNUAL_MULTIPLIER[schedule.unit];
  if (multiplier === undefined || schedule.amounts.length === 0) return null;

  const annual = schedule.amounts.map((row) => row.value * multiplier);
  return [Math.min(...annual), Math.max(...annual)];
}

/**
 * A program's official range (CONTEXT.md): the published estimated_annual_value
 * range, widened to include its benefit schedule. scheduleRangeProblem keeps
 * every benefit schedule overlapping the published range, so widening is safe.
 */
export function officialRange(program: Program): DollarRange {
  const { min, max } = program.estimated_annual_value;
  const schedule = program.benefit_schedule;
  const benefit = schedule ? annualizedBenefitRange(schedule) : null;
  if (!benefit) return [min, max];
  return [Math.min(min, benefit[0]), Math.max(max, benefit[1])];
}

/**
 * A data-validation message when a benefit schedule does not overlap the
 * published range: the usual sign that its rows are copays or assessed values
 * that need a `kind` label. Null when the schedule is fine or not in dollars.
 */
export function scheduleRangeProblem(program: Program): string | null {
  const schedule = program.benefit_schedule;
  const benefit = schedule ? annualizedBenefitRange(schedule) : null;
  if (!benefit) return null;

  const { min, max } = program.estimated_annual_value;
  const [low, high] = benefit;
  if (low <= max && high >= min) return null;

  return (
    `benefit_schedule annualizes to ${formatUsd(low)}–${formatUsd(high)}, outside ` +
    `estimated_annual_value ${formatUsd(min)}–${formatUsd(max)}. If the rows are not ` +
    `benefit dollars, set benefit_schedule.kind ('copay' or 'assessed_value_exemption').`
  );
}
