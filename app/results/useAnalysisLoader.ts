'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cacheAnalysis, readCachedAnalysis } from '@/lib/resultsCache';
import { SESSION_KEYS, readPrebaked, readStoredIntake } from '@/lib/sessionState';
import { PROGRAMS } from '@/lib/programs';
import type { AnalysisOutput, IntakeData } from '@/types/program';

export type LoadingProgress = { evaluated: string[] };

export type State =
  | { kind: 'loading'; progress: LoadingProgress }
  | { kind: 'ok'; data: AnalysisOutput }
  | { kind: 'error'; message: string }
  | { kind: 'needs-key' };

// Demo replay pacing: one program ticks off every DEMO_TICK_MS, then the
// results appear DEMO_FINISH_DELAY_MS after the last one.
const DEMO_TICK_MS = 438;
const DEMO_FINISH_DELAY_MS = 250;

// State updater that records one more evaluated program while loading.
function appendEvaluated(id: string): (s: State) => State {
  return (s) =>
    s.kind === 'loading'
      ? { ...s, progress: { evaluated: [...s.progress.evaluated, id] } }
      : s;
}

/**
 * Loads the analysis on mount: a pre-baked demo (optionally replayed), a
 * cached live result, or a fresh streamed analysis using the user's key.
 */
export function useAnalysisLoader(
  apiKey: string | null,
  hydrated: boolean
): { state: State; intake: IntakeData | null } {
  const router = useRouter();
  const [state, setState] = useState<State>({
    kind: 'loading',
    progress: { evaluated: [] },
  });
  const [intake, setIntake] = useState<IntakeData | null>(null);

  // This effect reads browser-only sessionStorage and orchestrates the on-mount
  // data load (demo replay or live streaming analysis), so the synchronous
  // setState calls are intentional load-once-on-mount transitions, not the
  // cascading-render anti-pattern the rule targets.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!hydrated) return; // wait for key hydration before deciding what to do

    // Demo routes stash a pre-baked AnalysisOutput here so the dashboard can
    // skip the API call entirely.
    if (sessionStorage.getItem(SESSION_KEYS.prebaked)) {
      const output = readPrebaked();
      if (!output) {
        setState({ kind: 'error', message: 'Could not load demo data.' });
        return;
      }
      setIntake(readStoredIntake());

      const simulate = sessionStorage.getItem(SESSION_KEYS.demoSimulate) === '1';
      if (!simulate) {
        setState({ kind: 'ok', data: output });
        return;
      }

      // Defer removing the flag until the simulation finishes — otherwise
      // StrictMode's double-effect-invocation eats it on the first cleanup
      // and the second run shows results instantly.
      const programIds = PROGRAMS.map((p) => p.id);
      let i = 0;
      let finishTimeout: ReturnType<typeof setTimeout> | null = null;
      const interval = setInterval(() => {
        if (i >= programIds.length) {
          clearInterval(interval);
          finishTimeout = setTimeout(() => {
            sessionStorage.removeItem(SESSION_KEYS.demoSimulate);
            setState({ kind: 'ok', data: output });
          }, DEMO_FINISH_DELAY_MS);
          return;
        }
        setState(appendEvaluated(programIds[i++]));
      }, DEMO_TICK_MS);

      return () => {
        clearInterval(interval);
        if (finishTimeout) clearTimeout(finishTimeout);
      };
    }

    // A missing, partial or corrupt intake sends the user back to the form.
    const parsed = readStoredIntake();
    if (!parsed) {
      router.replace('/intake');
      return;
    }
    setIntake(parsed);

    if (!apiKey) {
      setState({ kind: 'needs-key' });
      return;
    }

    const cached = readCachedAnalysis(parsed);
    if (cached) {
      setState({ kind: 'ok', data: cached });
      return;
    }

    let cancelled = false;
    (async () => {
      const { analyzeEligibilityStream } = await import('@/lib/claudeBrowser');
      for await (const event of analyzeEligibilityStream(apiKey, parsed)) {
        if (cancelled) return;
        if (event.type === 'progress') {
          setState(appendEvaluated(event.programId));
        } else if (event.type === 'complete') {
          cacheAnalysis(parsed, event.output);
          setState({ kind: 'ok', data: event.output });
        } else {
          setState({ kind: 'error', message: event.message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, apiKey, hydrated]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { state, intake };
}
