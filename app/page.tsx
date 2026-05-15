import Link from 'next/link';
import { ArrowRight, Sparkles, FileSearch, ListChecks } from 'lucide-react';

import { StatReveal } from '@/components/landing/StatReveal';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HIDDEN_GEMS = [
  { name: 'Portland Renter Relocation', value: '$2,900–$4,500' },
  { name: 'PCEF Home Energy', value: 'up to $5,000' },
  { name: 'SUN Service System', value: '$3,000' },
  { name: 'Multnomah Eviction Prevention', value: '$2,000+' },
  { name: 'Portland Water Bureau Discount', value: '80% off' },
  { name: 'Transportation Wallet', value: '$100/yr' },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 px-6 pb-16 pt-20 sm:pt-28">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            PDX Benefits Navigator
          </p>
          <p className="text-base text-muted-foreground">
            Oregon families leave behind, every year:
          </p>
        </div>

        <StatReveal
          target={1.2}
          decimals={1}
          prefix="$"
          suffix="billion"
          className="text-6xl font-bold tracking-tight tabular-nums text-emerald-600 sm:text-7xl md:text-8xl"
        />

        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Find what you&rsquo;re owed.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Most Portlanders qualify for thousands in benefits they don&rsquo;t know exist. Federal,
          Oregon, Multnomah County, and the City of Portland each run their own programs —{' '}
          <span className="font-medium text-foreground">most tools only check federal.</span>{' '}
          Answer a few questions, and we&rsquo;ll check all 20.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/intake"
            className={cn(buttonVariants({ size: 'lg' }), 'text-base')}
          >
            Find my benefits
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <p className="text-sm text-muted-foreground">
            ~3 minutes · Nothing is stored · 7 languages
          </p>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            <Step
              icon={<FileSearch className="h-5 w-5" />}
              n={1}
              title="Tell us about you"
              body="Household size, income, ZIP code, situation. Answers stay in your browser."
            />
            <Step
              icon={<ListChecks className="h-5 w-5" />}
              n={2}
              title="We check 20 programs"
              body="Federal, Oregon, Multnomah County, and the City of Portland — graded against the 2026 Federal Poverty Level."
            />
            <Step
              icon={<Sparkles className="h-5 w-5" />}
              n={3}
              title="Get apply-now links"
              body="Personalized dollar estimates, deadlines, document checklists, and direct links to every application."
            />
          </ol>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Where the money is hiding</h2>
          <p className="text-muted-foreground">
            National tools only check SNAP, Medicaid, and a few federal programs. We surface
            hyperlocal Portland and Multnomah programs that add{' '}
            <span className="font-semibold text-foreground">$10,000–$25,000 a year</span> for the
            average family.
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {HIDDEN_GEMS.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between gap-3 rounded-md border bg-card px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-medium">{g.name}</span>
              </span>
              <span className="font-semibold tabular-nums text-emerald-700">{g.value}</span>
            </li>
          ))}
        </ul>
        <div>
          <Link
            href="/intake"
            className={cn(buttonVariants({ size: 'lg' }), 'mt-2 text-base')}
          >
            See what you qualify for
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 text-xs text-muted-foreground">
          Estimates only — not legal advice. Confirm eligibility with each program before applying.
          We never store your data; everything runs in your browser session.
        </div>
      </footer>
    </main>
  );
}

function Step({
  icon,
  n,
  title,
  body,
}: {
  icon: React.ReactNode;
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step {n}
        </span>
      </div>
      <h3 className="font-semibold leading-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </li>
  );
}
