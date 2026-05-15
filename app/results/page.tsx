'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AnalysisOutput, IntakeData } from '@/types/program';

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<
    | { kind: 'loading'; tick: number }
    | { kind: 'ok'; data: AnalysisOutput }
    | { kind: 'error'; message: string }
  >({ kind: 'loading', tick: 0 });

  useEffect(() => {
    const raw = sessionStorage.getItem('pdx_intake');
    if (!raw) {
      router.replace('/intake');
      return;
    }
    const intake = JSON.parse(raw) as IntakeData;

    const ticker = setInterval(() => {
      setState((s) => (s.kind === 'loading' ? { kind: 'loading', tick: s.tick + 1 } : s));
    }, 1200);

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

  if (state.kind === 'loading') {
    const messages = [
      'Checking 20 programs…',
      'Calculating your benefits…',
      'Surfacing hidden Portland programs…',
      'Running eligibility logic…',
    ];
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <p className="text-muted-foreground">{messages[state.tick % messages.length]}</p>
        </div>
      </main>
    );
  }

  if (state.kind === 'error') {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </main>
    );
  }

  const { data } = state;
  const eligible = data.matches.filter((m) => m.eligible);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          We found benefits you qualify for
        </p>
        <h1 className="text-6xl font-bold tabular-nums text-emerald-600">
          ${data.total_estimated_annual_value.toLocaleString()}
          <span className="ml-2 text-base font-medium text-muted-foreground">/year</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Federal/state tools find ${data.federal_only_value.toLocaleString()} · Portland adds $
          {data.pdx_specific_value.toLocaleString()} in hyperlocal programs.
        </p>
      </header>

      {data.warnings?.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
          <strong className="block">Heads up</strong>
          <ul className="mt-2 list-disc pl-5">
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{eligible.length} programs</h2>
        {eligible.map((m) => (
          <div key={m.program_id} className="rounded-md border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-medium">{m.program_id}</h3>
              <span className="font-semibold tabular-nums">
                ${m.estimated_annual_value.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {m.confidence} confidence — {m.reasoning}
            </p>
          </div>
        ))}
      </section>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">Raw response (debug)</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-muted p-3">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </main>
  );
}
