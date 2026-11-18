import mariaFixture from '../data/scenarios/maria.json';
import jamesFixture from '../data/scenarios/james.json';
import roseFixture from '../data/scenarios/rose.json';
import type { scenarios } from './scenarios';
import type { AnalysisOutput } from '../types/program';

/**
 * Pre-baked demo analyses, keyed by demo slug. The JSON imports widen string
 * literals, so this is the one place that casts them to AnalysisOutput.
 * Import this only from server code: it pulls in all three fixtures.
 */
export const DEMO_FIXTURES = {
  maria: mariaFixture as unknown as AnalysisOutput,
  james: jamesFixture as unknown as AnalysisOutput,
  rose: roseFixture as unknown as AnalysisOutput,
} satisfies Record<keyof typeof scenarios, AnalysisOutput>;

export type DemoSlug = keyof typeof DEMO_FIXTURES;

export const DEMO_SLUGS = Object.keys(DEMO_FIXTURES) as DemoSlug[];

export function isDemoSlug(slug: string): slug is DemoSlug {
  return Object.hasOwn(DEMO_FIXTURES, slug);
}
