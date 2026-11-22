import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  annualizedBenefitRange,
  officialRange,
  scheduleRangeProblem,
} from '../benefitSchedule.js';
import type { BenefitSchedule, BenefitScheduleKind, Program } from '../../types/program';
import programs from '../../data/programs.json';

function prog(min: number, max: number, schedule?: BenefitSchedule): Program {
  return {
    id: 'p',
    estimated_annual_value: { min, max, median: (min + max) / 2 },
    benefit_schedule: schedule,
  } as Program;
}

function schedule(
  unit: BenefitSchedule['unit'],
  values: number[],
  kind?: BenefitScheduleKind,
): BenefitSchedule {
  return {
    description: 'test schedule',
    unit,
    ...(kind ? { kind } : {}),
    amounts: values.map((value, i) => ({ condition: `row ${i}`, value })),
  };
}

test('annualizedBenefitRange: monthly rows are multiplied by 12', () => {
  assert.deepEqual(annualizedBenefitRange(schedule('usd_monthly', [100, 50])), [600, 1200]);
});

test('annualizedBenefitRange: annual and one-time rows are taken as-is', () => {
  assert.deepEqual(annualizedBenefitRange(schedule('usd_annual', [400, 900])), [400, 900]);
  assert.deepEqual(annualizedBenefitRange(schedule('usd_one_time', [3000])), [3000, 3000]);
});

test('annualizedBenefitRange: a missing kind means benefit dollars', () => {
  assert.deepEqual(annualizedBenefitRange(schedule('usd_annual', [500], 'benefit')), [500, 500]);
  assert.deepEqual(annualizedBenefitRange(schedule('usd_annual', [500])), [500, 500]);
});

test('annualizedBenefitRange: copay and assessed-value schedules are not benefit dollars', () => {
  assert.equal(annualizedBenefitRange(schedule('usd_monthly', [0, 130], 'copay')), null);
  assert.equal(
    annualizedBenefitRange(schedule('usd_annual', [27092], 'assessed_value_exemption')),
    null,
  );
});

test('annualizedBenefitRange: percent discounts and empty schedules have no dollar range', () => {
  assert.equal(annualizedBenefitRange(schedule('percent_discount', [50, 80])), null);
  assert.equal(annualizedBenefitRange(schedule('usd_monthly', [])), null);
});

test('officialRange: no schedule means the published range', () => {
  assert.deepEqual(officialRange(prog(200, 600)), [200, 600]);
});

test('officialRange: a benefit schedule widens the published range', () => {
  // SNAP-shaped: the household-of-4 allotment ($994/mo) sits above the $9,000 cap.
  const snap = prog(1200, 9000, schedule('usd_monthly', [298, 994]));
  assert.deepEqual(officialRange(snap), [1200, 994 * 12]);
});

test('officialRange: a copay schedule leaves the published range alone', () => {
  const erdc = prog(8000, 18000, schedule('usd_monthly', [0, 5, 130], 'copay'));
  assert.deepEqual(officialRange(erdc), [8000, 18000]);
});

test('scheduleRangeProblem: a benefit schedule that overlaps the range is fine', () => {
  assert.equal(scheduleRangeProblem(prog(1200, 9000, schedule('usd_monthly', [298, 994]))), null);
});

test('scheduleRangeProblem: touching the range edge counts as overlapping', () => {
  assert.equal(scheduleRangeProblem(prog(100, 1000, schedule('usd_annual', [1000, 2000]))), null);
  assert.equal(scheduleRangeProblem(prog(100, 1000, schedule('usd_annual', [50, 100]))), null);
});

test('scheduleRangeProblem: an unlabeled copay table is flagged with a fix hint', () => {
  const problem = scheduleRangeProblem(prog(8000, 18000, schedule('usd_monthly', [0, 130])));
  assert.ok(problem);
  assert.match(problem, /\$0–\$1,560/);
  assert.match(problem, /\$8,000–\$18,000/);
  assert.match(problem, /kind/);
});

test('scheduleRangeProblem: labeled non-benefit schedules and percent discounts are not checked', () => {
  assert.equal(scheduleRangeProblem(prog(8000, 18000, schedule('usd_monthly', [0], 'copay'))), null);
  assert.equal(scheduleRangeProblem(prog(300, 1500, schedule('percent_discount', [50, 80]))), null);
  assert.equal(scheduleRangeProblem(prog(300, 1500)), null);
});

test('real programs.json: every schedule passes, and the two non-benefit ones are labeled', () => {
  const all = programs as unknown as Program[];
  assert.deepEqual(all.map(scheduleRangeProblem).filter(Boolean), []);
  const kindOf = (id: string) => all.find((p) => p.id === id)?.benefit_schedule?.kind;
  assert.equal(kindOf('erdc'), 'copay');
  assert.equal(kindOf('veterans-prop-tax-exempt'), 'assessed_value_exemption');
});
