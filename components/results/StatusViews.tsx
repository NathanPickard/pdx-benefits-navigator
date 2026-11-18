'use client';

import Link from 'next/link';
import { ArrowLeft, KeyRound } from 'lucide-react';

import { RoseStamp } from '@/components/brand/RoseStamp';
import { PROGRAMS, PROGRAM_BY_ID } from '@/lib/programs';
import type { LoadingProgress } from '@/app/results/useAnalysisLoader';

/* ─────────────────────── Loading ─────────────────────── */

export function LoadingView({ progress }: { progress: LoadingProgress }) {
  const total = PROGRAMS.length;
  const count = progress.evaluated.length;
  const latestId = progress.evaluated[count - 1];
  const latestProgram = latestId ? PROGRAM_BY_ID.get(latestId) : undefined;
  const pct = (count / total) * 100;

  return (
    <main
      className="rc-container"
      style={{ maxWidth: 760, paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-5" style={{ gap: 8 }}>
          <RoseStamp size={56} />
        </div>
        <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
          Just a moment
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: '2.3rem',
            lineHeight: 1.1,
            margin: '0 0 10px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          Checking every program for you…
        </h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 32px', fontSize: '1rem' }}>
          Reading 2026 poverty tables, Oregon statutes, and Portland city code.
        </p>

        <div className="rc-card" style={{ padding: 28, textAlign: 'left' }}>
          <div
            className="flex items-center justify-between mb-3 flex-wrap"
            style={{ gap: 12 }}
          >
            <div style={{ fontSize: '0.94rem' }}>
              <span style={{ color: 'var(--ink-3)' }}>Currently checking — </span>
              <strong style={{ color: 'var(--rose)' }}>
                {latestProgram?.name ?? 'Loading…'}
              </strong>
            </div>
            <div className="tag tabular">
              {count} / {total}
            </div>
          </div>

          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: 'var(--paper-2)',
              overflow: 'hidden',
              border: '1px solid var(--rule)',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--rose)',
                transition: 'width 0.3s ease-out',
                borderRadius: 999,
              }}
            />
          </div>

          <div
            className="flex flex-wrap gap-1.5 mt-5"
            style={{ minHeight: 60, gap: 6 }}
          >
            {progress.evaluated.slice(-20).map((id) => {
              const p = PROGRAM_BY_ID.get(id);
              return (
                <span
                  key={id}
                  className="pill pill-moss tabular"
                  style={{ fontSize: '0.72rem' }}
                >
                  ✓ {p?.short_name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─────────────────────── Needs-key view ─────────────────────── */

export function NeedsKeyView() {
  return (
    <main
      className="rc-container"
      style={{
        maxWidth: 620,
        paddingTop: 80,
        paddingBottom: 80,
        textAlign: 'center',
      }}
    >
      <div className="flex items-center justify-center mb-5">
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'var(--rose-soft)',
            color: 'var(--rose)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KeyRound size={22} />
        </span>
      </div>
      <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
        Bring your own key
      </div>
      <h1
        className="font-display"
        style={{
          fontSize: '2rem',
          lineHeight: 1.1,
          margin: '0 0 12px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
        }}
      >
        We need your Anthropic API key
      </h1>
      <p
        style={{
          color: 'var(--ink-2)',
          margin: '0 0 24px',
          fontSize: '1rem',
          lineHeight: 1.55,
        }}
      >
        Personalized results call Claude directly from your browser using your
        own key — it&rsquo;s never sent to our server. Tap the{' '}
        <strong style={{ color: 'var(--ink)' }}>key indicator</strong> in the
        top right to paste yours, then your results will appear here.
      </p>
      <div
        className="flex items-center justify-center flex-wrap"
        style={{ gap: 10 }}
      >
        <Link href="/" className="rc-btn rc-btn-outline">
          <ArrowLeft size={14} /> Back to landing
        </Link>
        <Link href="/demo/maria" className="rc-btn rc-btn-rose">
          Or try a demo with no key
        </Link>
      </div>
    </main>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <main
      className="flex flex-col items-center justify-center"
      style={{ padding: '120px 32px', textAlign: 'center' }}
    >
      <h1
        className="font-display"
        style={{ fontSize: '2rem', margin: 0, fontWeight: 500 }}
      >
        Something went wrong
      </h1>
      <p style={{ marginTop: 12, color: 'var(--ink-2)', maxWidth: 460 }}>{message}</p>
    </main>
  );
}
