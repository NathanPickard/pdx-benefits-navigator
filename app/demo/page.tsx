import Link from 'next/link';
import { ArrowRight, Briefcase, Heart, ShieldCheck } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import mariaFixture from '@/data/scenarios/maria.json';
import jamesFixture from '@/data/scenarios/james.json';
import roseFixture from '@/data/scenarios/rose.json';
import programs from '@/data/programs.json';

type Fixture = {
  total_estimated_annual_value: number;
  matches: { program_id: string; eligible: boolean; estimated_annual_value: number }[];
};

const SHORT_BY_ID: Record<string, string> = Object.fromEntries(
  (programs as { id: string; short_name: string }[]).map((p) => [p.id, p.short_name]),
);

const GEM_BY_ID: Record<string, boolean> = Object.fromEntries(
  (programs as { id: string; hidden_gem: boolean }[]).map((p) => [p.id, p.hidden_gem]),
);

/**
 * Hero programs for a persona, derived from the fixture: eligible hidden-gem
 * programs first (the differentiator), then the highest-value other eligible
 * programs, capped at n. Always real and always eligible.
 */
const heroPrograms = (f: Fixture, n = 4): string[] => {
  const eligible = f.matches.filter((m) => m.eligible);
  const byValueDesc = (a: Fixture['matches'][number], b: Fixture['matches'][number]) =>
    b.estimated_annual_value - a.estimated_annual_value;
  const gems = eligible.filter((m) => GEM_BY_ID[m.program_id]).sort(byValueDesc);
  const others = eligible.filter((m) => !GEM_BY_ID[m.program_id]).sort(byValueDesc);
  return [...gems, ...others].slice(0, n).map((m) => SHORT_BY_ID[m.program_id] ?? m.program_id);
};

const expectedFromFixture = (f: Fixture) =>
  `~$${f.total_estimated_annual_value.toLocaleString()}/year`;

interface ScenarioCard {
  slug: string;
  name: string;
  tagline: string;
  facts: { label: string; value: string }[];
  hero: string[];
  expected: string;
  icon: React.ReactNode;
  accentClass: string;
}

const SCENARIOS: ScenarioCard[] = [
  {
    slug: 'maria',
    name: 'Maria & family',
    tagline: 'Working family, recent 12% rent increase',
    facts: [
      { label: 'Household', value: '4 people · 2 kids (5 & 8)' },
      { label: 'Income', value: '$48,000 / year, part-time' },
      { label: 'Where', value: 'Cully (97218) · renting' },
      { label: 'Language', value: 'Spanish · LPR status' },
    ],
    hero: heroPrograms(mariaFixture),
    expected: expectedFromFixture(mariaFixture),
    icon: <Heart className="h-5 w-5" />,
    accentClass: 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300',
  },
  {
    slug: 'james',
    name: 'James',
    tagline: 'Veteran with a disability, lost his job',
    facts: [
      { label: 'Household', value: '1 person, no kids' },
      { label: 'Income', value: '$0 / year, unemployed' },
      { label: 'Where', value: 'St. Johns (97203) · homeowner' },
      { label: 'Status', value: 'Veteran · service-connected disability' },
    ],
    hero: heroPrograms(jamesFixture),
    expected: expectedFromFixture(jamesFixture),
    icon: <ShieldCheck className="h-5 w-5" />,
    accentClass: 'border-blue-200 bg-blue-50/40 hover:border-blue-300',
  },
  {
    slug: 'rose',
    name: 'Rose',
    tagline: 'Senior on Social Security, owns her home',
    facts: [
      { label: 'Household', value: '1 person, age 73' },
      { label: 'Income', value: '$21,600 / year (SS only)' },
      { label: 'Where', value: 'Lents (97266) · homeowner' },
      { label: 'Language', value: 'Vietnamese' },
    ],
    hero: heroPrograms(roseFixture),
    expected: expectedFromFixture(roseFixture),
    icon: <Briefcase className="h-5 w-5" />,
    accentClass: 'border-amber-200 bg-amber-50/40 hover:border-amber-300',
  },
];

export const metadata = {
  title: 'Demo scenarios — PDX Benefits Navigator',
};

export default function DemoHubPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
          Live demo scenarios
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Three real Portland situations.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Each scenario runs against all 20 federal, Oregon, Multnomah County, and Portland
          programs in a single pass. Pick one — we&rsquo;ll show exactly what they qualify
          for and how to apply.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {SCENARIOS.map((s) => (
          <Link
            key={s.slug}
            href={`/demo/${s.slug}`}
            className={cn(
              'group flex flex-col gap-4 rounded-lg border-2 bg-card p-5 shadow-sm transition-colors',
              s.accentClass
            )}
          >
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                  {s.icon}
                </span>
                <h2 className="text-lg font-semibold">{s.name}</h2>
              </div>
            </header>
            <p className="text-sm text-muted-foreground">{s.tagline}</p>
            <dl className="flex flex-col gap-1.5 text-xs">
              {s.facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-1 border-t pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Hero programs
              </p>
              <ul className="flex flex-col gap-0.5 text-xs">
                {s.hero.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            </div>
            <footer className="mt-auto flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">Expected</span>
              <span className="text-sm font-bold text-emerald-700">{s.expected}</span>
            </footer>
            <span
              className={cn(
                buttonVariants({ size: 'sm' }),
                'w-full justify-center transition-transform group-hover:translate-x-0.5'
              )}
            >
              Run scenario
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <footer className="border-t pt-6 text-xs text-muted-foreground">
        <p>
          Or{' '}
          <Link href="/intake" className="font-medium text-foreground underline">
            answer your own intake
          </Link>{' '}
          and run a personalized analysis.
        </p>
      </footer>
    </main>
  );
}
