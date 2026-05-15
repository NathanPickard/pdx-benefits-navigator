'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

import { MoneyCounter } from '@/components/results/MoneyCounter';
import { BenefitCard } from '@/components/results/BenefitCard';
import { ComparisonChart } from '@/components/results/ComparisonChart';
import programsData from '@/data/programs.json';
import type { AnalysisOutput, IntakeData, Program } from '@/types/program';

const PROGRAMS = programsData as Program[];
const PROGRAM_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

type State =
  | { kind: 'loading'; tick: number }
  | { kind: 'ok'; data: AnalysisOutput }
  | { kind: 'error'; message: string };

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading', tick: 0 });

  useEffect(() => {
    const raw = sessionStorage.getItem('pdx_intake');
    if (!raw) {
      router.replace('/intake');
      return;
    }
    const intake = JSON.parse(raw) as IntakeData;

    const ticker = setInterval(() => {
      setState((s) => (s.kind === 'loading' ? { kind: 'loading', tick: s.tick + 1 } : s));
    }, 1400);

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intake),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || json.error) throw new Error(json.error ?? `HTTP ${r.status}`);
        setState({ kind: 'ok', data: json });
      })
      .catch((e: Error) => setState({ kind: 'error', message: e.message }))
      .finally(() => clearInterval(ticker));

    return () => clearInterval(ticker);
  }, [router]);

  if (state.kind === 'loading') return <LoadingView tick={state.tick} />;
  if (state.kind === 'error') return <ErrorView message={state.message} />;
  return <ResultsView data={state.data} />;
}

function LoadingView({ tick }: { tick: number }) {
  const messages = [
    'Checking 20 programs…',
    'Calculating your benefits…',
    'Surfacing hidden Portland programs…',
    'Running eligibility logic…',
  ];
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-muted-foreground">{messages[tick % messages.length]}</p>
      </div>
    </main>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}

function ResultsView({ data }: { data: AnalysisOutput }) {
  const eligible = useMemo(() => {
    return data.matches
      .filter((m) => m.eligible)
      .map((m) => ({ match: m, program: PROGRAM_BY_ID.get(m.program_id) }))
      .filter((row): row is { match: typeof row.match; program: Program } => !!row.program)
      .sort((a, b) => {
        if (a.program.hidden_gem !== b.program.hidden_gem) return a.program.hidden_gem ? -1 : 1;
        return b.match.estimated_annual_value - a.match.estimated_annual_value;
      });
  }, [data]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-12">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          We found benefits you qualify for
        </p>
        <div className="flex items-baseline gap-2">
          <MoneyCounter value={data.total_estimated_annual_value} />
          <span className="text-base font-medium text-muted-foreground">/ year</span>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <ComparisonChart federal={data.federal_only_value} total={data.total_estimated_annual_value} />
      </motion.div>

      {data.warnings?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="flex flex-col gap-1.5">
              <h2 className="text-sm font-semibold text-amber-900">Read these first</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-amber-900/90">
                {data.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">
            {eligible.length} {eligible.length === 1 ? 'program' : 'programs'} you qualify for
          </h2>
          <p className="text-xs text-muted-foreground">Sorted by hidden gems, then value</p>
        </div>
        <div className="flex flex-col gap-4">
          {eligible.map(({ match, program }, i) => (
            <motion.div
              key={match.program_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <BenefitCard match={match} program={program} />
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t pt-6 text-xs text-muted-foreground">
        <p>
          Estimates only — not legal advice. Confirm eligibility with each program. We never store
          your answers; everything runs in this browser session.
        </p>
      </footer>
    </main>
  );
}
