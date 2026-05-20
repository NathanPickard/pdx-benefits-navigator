'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { scenarios } from '@/lib/scenarios';
import mariaFixture from '@/data/scenarios/maria.json';
import jamesFixture from '@/data/scenarios/james.json';
import roseFixture from '@/data/scenarios/rose.json';
import type { AnalysisOutput } from '@/types/program';

const SLUG_MAP: Record<
  string,
  { intakeKey: keyof typeof scenarios; output: AnalysisOutput }
> = {
  maria: { intakeKey: 'maria', output: mariaFixture as unknown as AnalysisOutput },
  james: { intakeKey: 'james', output: jamesFixture as unknown as AnalysisOutput },
  rose: { intakeKey: 'rose', output: roseFixture as unknown as AnalysisOutput },
};

export default function DemoPage() {
  const params = useParams<{ scenario: string }>();
  const router = useRouter();

  useEffect(() => {
    const entry = SLUG_MAP[params.scenario];
    if (!entry) {
      router.replace('/intake');
      return;
    }
    sessionStorage.setItem(
      'pdx_intake',
      JSON.stringify(scenarios[entry.intakeKey])
    );
    sessionStorage.setItem('pdx_prebaked', JSON.stringify(entry.output));
    sessionStorage.setItem('pdx_demo_simulate', '1');
    router.replace('/results');
  }, [params.scenario, router]);

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
