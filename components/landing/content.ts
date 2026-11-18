import mariaFixture from "@/data/scenarios/maria.json";
import jamesFixture from "@/data/scenarios/james.json";
import roseFixture from "@/data/scenarios/rose.json";

const eligibleCount = (f: { matches: { eligible: boolean }[] }) =>
  f.matches.filter((m) => m.eligible).length;

export const MARIA_TOTAL = mariaFixture.total_estimated_annual_value;
export const MARIA_FEDERAL = mariaFixture.federal_only_value;
export const MARIA_ELIGIBLE = eligibleCount(mariaFixture);

export interface ScenarioSummary {
  slug: string;
  name: string;
  short: string;
  zip: string;
  blurb: string;
  total: number;
  eligibleCount: number;
  accent: "rose" | "moss" | "sun";
}

export const SCENARIO_SUMMARIES: readonly ScenarioSummary[] = [
  {
    slug: "maria",
    name: "María & family",
    short: "María",
    zip: "97218 · Cully",
    blurb:
      "Family of 4 · 2 kids · part-time at Fred Meyer · rent went up 12%.",
    total: MARIA_TOTAL,
    eligibleCount: MARIA_ELIGIBLE,
    accent: "rose",
  },
  {
    slug: "james",
    name: "James",
    short: "James",
    zip: "97203 · St. Johns",
    blurb: "Single · disabled vet · unemployed · owns home in St. Johns.",
    total: jamesFixture.total_estimated_annual_value,
    eligibleCount: eligibleCount(jamesFixture),
    accent: "moss",
  },
  {
    slug: "rose",
    name: "Rose",
    short: "Rose",
    zip: "97266 · Lents",
    blurb: "Senior · widow · Social Security only · owns home in Lents.",
    total: roseFixture.total_estimated_annual_value,
    eligibleCount: eligibleCount(roseFixture),
    accent: "sun",
  },
];
