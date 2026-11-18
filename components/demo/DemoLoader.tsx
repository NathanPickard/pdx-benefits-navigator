'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { SESSION_KEYS } from '@/lib/sessionState';
import type { AnalysisOutput, IntakeData } from '@/types/program';

interface DemoLoaderProps {
  intake: IntakeData;
  analysis: AnalysisOutput;
}

/**
 * Seeds sessionStorage with one demo persona's intake and pre-baked analysis,
 * then hands off to /results. Falls back to /intake if storage is unavailable.
 */
export function DemoLoader({ intake, analysis }: DemoLoaderProps) {
  const router = useRouter();
  const hasStarted = useRef(false);

  useEffect(() => {
    // Run once even if the router identity changes or the effect re-fires.
    if (hasStarted.current) return;
    hasStarted.current = true;
    try {
      sessionStorage.setItem(SESSION_KEYS.intake, JSON.stringify(intake));
      sessionStorage.setItem(SESSION_KEYS.prebaked, JSON.stringify(analysis));
      sessionStorage.setItem(SESSION_KEYS.demoSimulate, '1');
    } catch {
      router.replace('/intake');
      return;
    }
    router.replace('/results');
  }, [intake, analysis, router]);

  return (
    <main
      className="flex flex-1 items-center justify-center"
      style={{ padding: 32 }}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--ink)',
            borderTopColor: 'transparent',
            borderRadius: 999,
            animation: 'rcSpin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.86rem', color: 'var(--ink-3)' }}>
          Loading demo scenario…
        </p>
      </div>
      <style>{`@keyframes rcSpin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
