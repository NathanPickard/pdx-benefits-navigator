'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, KeyRound, Loader2 } from 'lucide-react';

import { AppBar } from '@/components/brand/AppBar';
import { RoseStamp } from '@/components/brand/RoseStamp';
import { MoneyCounter } from '@/components/results/MoneyCounter';
import { BenefitCard } from '@/components/results/BenefitCard';
import { ComparisonChart } from '@/components/results/ComparisonChart';
import { LanguageToggle } from '@/components/results/LanguageToggle';
import { NearMissSection } from '@/components/results/NearMissSection';
import { UrgencyBanner } from '@/components/results/UrgencyBanner';
import { RenewalCalendar } from '@/components/results/RenewalCalendar';
import { CHROME_EN, type Chrome, type LanguageCode } from '@/lib/i18n';
import { useApiKey } from '@/lib/userKey';
import { cacheAnalysis, readCachedAnalysis } from '@/lib/resultsCache';
import programsData from '@/data/programs.json';
import type { AnalysisOutput, IntakeData, Program } from '@/types/program';

const PROGRAMS = programsData as Program[];
const PROGRAM_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

type TranslatedBundle = { output: AnalysisOutput; chrome: Chrome };

type LoadingProgress = { evaluated: string[] };

type State =
  | { kind: 'loading'; progress: LoadingProgress }
  | { kind: 'ok'; data: AnalysisOutput }
  | { kind: 'error'; message: string }
  | { kind: 'needs-key' };

export default function ResultsPage() {
  const router = useRouter();
  const { apiKey, hydrated } = useApiKey();
  const [state, setState] = useState<State>({
    kind: 'loading',
    progress: { evaluated: [] },
  });
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<
    Partial<Record<Exclude<LanguageCode, 'en'>, TranslatedBundle>>
  >({});
  const [pendingLang, setPendingLang] = useState<LanguageCode | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  // This effect reads browser-only sessionStorage and orchestrates the on-mount
  // data load (demo replay or live streaming analysis), so the synchronous
  // setState calls are intentional load-once-on-mount transitions, not the
  // cascading-render anti-pattern the rule targets.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!hydrated) return; // wait for key hydration before deciding what to do

    // Demo routes stash a pre-baked AnalysisOutput here so the dashboard can
    // skip the API call entirely.
    const prebaked = sessionStorage.getItem('pdx_prebaked');
    if (prebaked) {
      let output: AnalysisOutput;
      try {
        output = JSON.parse(prebaked) as AnalysisOutput;
      } catch {
        setState({ kind: 'error', message: 'Could not load demo data.' });
        return;
      }
      const rawIntake = sessionStorage.getItem('pdx_intake');
      if (rawIntake) setIntake(JSON.parse(rawIntake) as IntakeData);

      const simulate = sessionStorage.getItem('pdx_demo_simulate') === '1';
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
            sessionStorage.removeItem('pdx_demo_simulate');
            setState({ kind: 'ok', data: output });
          }, 250);
          return;
        }
        const id = programIds[i++];
        setState((s) =>
          s.kind === 'loading'
            ? { ...s, progress: { evaluated: [...s.progress.evaluated, id] } }
            : s
        );
      }, 438);

      return () => {
        clearInterval(interval);
        if (finishTimeout) clearTimeout(finishTimeout);
      };
    }

    const rawIntake = sessionStorage.getItem('pdx_intake');
    if (!rawIntake) {
      router.replace('/intake');
      return;
    }
    const parsed = JSON.parse(rawIntake) as IntakeData;
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
          setState((s) =>
            s.kind === 'loading'
              ? { ...s, progress: { evaluated: [...s.progress.evaluated, event.programId] } }
              : s
          );
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

  const originalData = state.kind === 'ok' ? state.data : null;

  const handleLanguageChange = useCallback(
    async (next: LanguageCode) => {
      if (next === lang || pendingLang !== null) return;
      setTranslateError(null);

      if (next === 'en') {
        setLang('en');
        return;
      }
      if (translations[next]) {
        setLang(next);
        return;
      }
      if (!originalData) return;
      if (next !== 'es' && next !== 'vi') return;
      if (!apiKey) {
        setTranslateError(
          'Translation requires an Anthropic API key. Click the key indicator above to add one.'
        );
        return;
      }

      setPendingLang(next);
      try {
        const { translatePayload } = await import('@/lib/claudeBrowser');
        const translated = await translatePayload(
          apiKey,
          { output: originalData, chrome: CHROME_EN },
          next
        );
        if (!translated?.output || !translated?.chrome) {
          throw new Error('Translation response missing fields');
        }
        setTranslations((prev) => ({
          ...prev,
          [next]: translated as TranslatedBundle,
        }));
        setLang(next);
      } catch (e) {
        setTranslateError(e instanceof Error ? e.message : 'Translation failed');
      } finally {
        setPendingLang(null);
      }
    },
    [lang, pendingLang, translations, originalData, apiKey]
  );

  if (state.kind === 'loading') {
    return (
      <>
        <AppBar />
        <LoadingView progress={state.progress} />
      </>
    );
  }
  if (state.kind === 'needs-key') {
    return (
      <>
        <AppBar />
        <NeedsKeyView />
      </>
    );
  }
  if (state.kind === 'error') {
    return (
      <>
        <AppBar />
        <ErrorView message={state.message} />
      </>
    );
  }

  const bundle: TranslatedBundle =
    lang === 'en'
      ? { output: state.data, chrome: CHROME_EN }
      : translations[lang as Exclude<LanguageCode, 'en'>] ?? {
          output: state.data,
          chrome: CHROME_EN,
        };

  return (
    <>
      <AppBar>
        <LanguageToggle
          current={lang}
          pendingLanguage={pendingLang}
          translatedByAILabel={bundle.chrome.translatedByAI}
          onChange={handleLanguageChange}
        />
      </AppBar>
      <Dashboard
        data={bundle.output}
        originalData={state.data}
        intake={intake}
        chrome={bundle.chrome}
        lang={lang}
        translateError={translateError}
      />
    </>
  );
}

/* ─────────────────────── Loading ─────────────────────── */

function LoadingView({ progress }: { progress: LoadingProgress }) {
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

function NeedsKeyView() {
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

function ErrorView({ message }: { message: string }) {
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

/* ─────────────────────── Dashboard ─────────────────────── */

const HOUSING_LABEL: Record<IntakeData['housing_status'], string> = {
  rent: 'Renting',
  own: 'Own home',
  staying_with_others: 'With others',
  unhoused: 'Unhoused',
};

const EMPLOYMENT_LABEL: Record<IntakeData['employment_status'], string> = {
  employed_ft: 'Full-time',
  employed_pt: 'Part-time',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
  disabled: 'On disability',
};

const LANG_LABEL: Record<IntakeData['primary_language'], string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  zh: '中文',
  so: 'Soomaali',
  ar: 'العربية',
};

function Dashboard({
  data,
  originalData,
  intake,
  chrome,
  lang,
  translateError,
}: {
  data: AnalysisOutput;
  originalData: AnalysisOutput;
  intake: IntakeData | null;
  chrome: Chrome;
  lang: LanguageCode;
  translateError: string | null;
}) {
  const [packetState, setPacketState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [packetError, setPacketError] = useState<string | null>(null);

  const handleDownloadPacket = useCallback(async () => {
    if (packetState === 'loading') return;
    setPacketState('loading');
    setPacketError(null);
    try {
      const raw = sessionStorage.getItem('pdx_intake');
      if (!raw) throw new Error('Missing intake data');
      const intake = JSON.parse(raw) as IntakeData;
      const res = await fetch('/api/packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake, analysis: originalData }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdx-benefits-packet.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPacketState('idle');
    } catch (e) {
      setPacketError(e instanceof Error ? e.message : 'Download failed');
      setPacketState('error');
    }
  }, [packetState, originalData]);

  const [sortMode, setSortMode] = useState<'gems' | 'amount'>('gems');

  const eligible = useMemo(() => {
    const rows = data.matches
      .filter((m) => m.eligible)
      .map((m) => ({ match: m, program: PROGRAM_BY_ID.get(m.program_id) }))
      .filter((row): row is { match: typeof row.match; program: Program } => !!row.program);

    if (sortMode === 'amount') {
      return rows.sort(
        (a, b) => b.match.estimated_annual_value - a.match.estimated_annual_value
      );
    }
    return rows.sort((a, b) => {
      if (a.program.hidden_gem !== b.program.hidden_gem) return a.program.hidden_gem ? -1 : 1;
      return b.match.estimated_annual_value - a.match.estimated_annual_value;
    });
  }, [data, sortMode]);

  // Confidence band: sum the program-level min/max ranges over eligible rows.
  // Falls back to the match's point-value for both low and high when the
  // program's structured range is somehow absent (defensive; the type requires
  // it, but translated bundles may vary).
  const { bandLow, bandHigh } = useMemo(() => {
    let low = 0;
    let high = 0;
    for (const { match, program } of eligible) {
      const range = program?.estimated_annual_value;
      if (range && typeof range.min === 'number' && typeof range.max === 'number') {
        low += range.min;
        high += range.max;
      } else {
        low += match.estimated_annual_value;
        high += match.estimated_annual_value;
      }
    }
    return { bandLow: low, bandHigh: high };
  }, [eligible]);

  // Near-misses: ineligible matches. Computed separately so they can be
  // surfaced below the eligible card grid — or front-and-center in the
  // zero-eligible empty state. Pre-rebake fixtures have no requirements[]
  // arrays; NearMissSection falls back to match.reasoning for the reason.
  const nearMisses = useMemo(
    () => data.matches.filter((m) => !m.eligible),
    [data]
  );

  const gemCount = eligible.filter((e) => e.program.hidden_gem).length;
  const programsHeading = chrome.programsCountTemplate.replace(
    '{count}',
    String(eligible.length)
  );

  return (
    <main className="rc-container rc-page-pad">
      <Link
        href="/"
        className="rc-btn rc-btn-ghost rc-btn-sm mb-6"
        style={{ marginBottom: 24 }}
      >
        <ArrowLeft size={14} /> Back to navigator
      </Link>

      {/* Top action strip */}
      <div
        className="flex items-center justify-between flex-wrap mb-8"
        style={{ gap: 12 }}
      >
        <div className="eyebrow" style={{ color: 'var(--moss-2)' }}>
          Personal benefits brief
        </div>
        <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={handleDownloadPacket}
            disabled={packetState === 'loading'}
            className="rc-btn rc-btn-outline rc-btn-sm"
          >
            {packetState === 'loading' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            {packetState === 'loading' ? chrome.buildingPacket : chrome.downloadPacket}
          </button>
        </div>
      </div>

      {packetError && (
        <div
          className="rc-card"
          style={{
            padding: 12,
            fontSize: '0.86rem',
            color: 'oklch(0.45 0.18 25)',
            background: 'var(--rose-soft)',
            borderColor: 'var(--rose)',
            marginBottom: 24,
          }}
        >
          Packet download failed: {packetError}
        </div>
      )}

      {translateError && (
        <div
          className="rc-card"
          style={{
            padding: 12,
            fontSize: '0.86rem',
            color: 'oklch(0.45 0.18 25)',
            background: 'var(--rose-soft)',
            borderColor: 'var(--rose)',
            marginBottom: 24,
          }}
        >
          {translateError}
        </div>
      )}

      {/* Hero — only shown when there are eligible programs; the $0/0-program
          state is degenerate and replaced by the empty state below. */}
      {eligible.length > 0 && (
        <section className="rc-results-hero mb-10">
          <div>
            <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
              {chrome.resultsKicker}
            </div>
            <MoneyCounter
              value={data.total_estimated_annual_value}
              low={bandLow}
              high={bandHigh}
            />
            <p
              style={{
                marginTop: 16,
                fontSize: '1.05rem',
                color: 'var(--ink-2)',
                lineHeight: 1.55,
              }}
            >
              across{' '}
              <strong style={{ color: 'var(--ink)' }}>{eligible.length} programs</strong>
              {gemCount > 0 && (
                <>
                  , including{' '}
                  <strong style={{ color: 'var(--rose)' }}>
                    {gemCount} hyperlocal Portland gem{gemCount > 1 ? 's' : ''}
                  </strong>{' '}
                  that national tools would miss
                </>
              )}
              .
            </p>
          </div>

          {intake && (
            <aside className="rc-card" style={{ padding: 24 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: '1.55rem',
                      lineHeight: 1.1,
                      fontWeight: 500,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Your household
                  </div>
                  <div className="tag mt-1">{intake.zip_code || '—'}</div>
                </div>
                <RoseStamp size={48} />
              </div>
              <div className="divider mb-3" />
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  fontSize: '0.86rem',
                }}
              >
                <KV k="Household" v={`${intake.household_size} people`} />
                <KV k="Children" v={String(intake.num_children)} />
                <KV
                  k="Income"
                  v={`$${(intake.annual_income || 0).toLocaleString()}`}
                />
                <KV k="Housing" v={HOUSING_LABEL[intake.housing_status]} />
                <KV k="Language" v={LANG_LABEL[intake.primary_language]} />
                <KV
                  k="Employment"
                  v={EMPLOYMENT_LABEL[intake.employment_status]}
                />
              </div>
            </aside>
          )}
        </section>
      )}

      {/* UrgencyBanner and warnings are shown on both paths — a household with
          an eviction notice but zero eligible programs still needs the warning. */}
      {intake && <UrgencyBanner intake={intake} chrome={chrome} />}

      {/* ComparisonChart is only meaningful when there are eligible programs;
          a 0-vs-0 chart is misleading on the zero-eligible path. */}
      {eligible.length > 0 && (
        <ComparisonChart
          federal={data.federal_only_value}
          total={data.total_estimated_annual_value}
          title={chrome.howWeCompare}
          subtitle={chrome.mostToolsOnly}
          federalLabel={chrome.federalStateBarLabel}
          pdxLabel={chrome.pdxNavigatorBarLabel}
          missLabel={chrome.youdMiss}
        />
      )}

      {data.warnings?.length > 0 && (
        <section
          className="rc-card mb-10"
          style={{
            padding: 'clamp(18px, 4vw, 22px)',
            borderColor: 'oklch(0.86 0.07 75)',
            background: 'var(--sun-soft)',
          }}
        >
          <div className="flex items-start" style={{ gap: 12 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: 'var(--sun)',
                color: 'oklch(0.30 0.06 70)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              !
            </span>
            <div>
              <h3
                className="font-display"
                style={{
                  fontSize: '1.2rem',
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                }}
              >
                {chrome.readFirst}
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: '0.94rem',
                  lineHeight: 1.55,
                  color: 'var(--ink-2)',
                }}
              >
                {data.warnings.map((w, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {eligible.length === 0 ? (
        /* ── Zero-eligible empty state ── */
        // TODO(phase-2 i18n): strings below are English-only; Phase 2 will
        // wire them into the Chrome bundle and translation pipeline.
        <section className="mb-10">
          <div
            className="rc-card"
            style={{
              padding: 'clamp(24px, 5vw, 40px)',
              textAlign: 'center',
              marginBottom: 24,
              background: 'var(--paper-2)',
              borderColor: 'var(--rule-2)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 12 }} aria-hidden="true">
              🌧️
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: '1.6rem',
                fontWeight: 500,
                letterSpacing: '-0.018em',
                margin: '0 0 10px',
              }}
            >
              No programs matched this time
            </h2>
            <p
              style={{
                margin: '0 auto 16px',
                maxWidth: 500,
                color: 'var(--ink-2)',
                fontSize: '0.96rem',
                lineHeight: 1.6,
              }}
            >
              That can change — income, household size, and life events all affect eligibility. A local caseworker often finds options the tool misses, especially for locally-funded programs.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--moss-soft)',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: '0.9rem',
                color: 'var(--moss-2)',
                fontWeight: 500,
              }}
            >
              <span>📞</span>
              <span>Call <strong>211</strong> or visit <strong>211info.org</strong> — free, confidential, available in your language</span>
            </div>
          </div>

          {nearMisses.length > 0 && (
            <NearMissSection
              matches={nearMisses}
              programById={PROGRAM_BY_ID}
              chrome={chrome}
            />
          )}
        </section>
      ) : (
        /* ── Normal layout: eligible cards + near-misses below ── */
        <>
          <section className="mb-10">
            <header className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div>
                <div className="eyebrow mb-2">
                  {eligible.length} programs ·{' '}
                  {sortMode === 'gems' ? 'hidden gems first' : 'largest amount first'}
                </div>
                <h2
                  className="font-display"
                  style={{
                    fontSize: '2.2rem',
                    lineHeight: 1.1,
                    margin: 0,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {programsHeading}
                </h2>
              </div>
              <SortToggle value={sortMode} onChange={setSortMode} />
            </header>

            <div
              className="grid"
              style={{ gridTemplateColumns: '1fr', gap: 16 }}
            >
              {eligible.map(({ match, program }) => (
                <BenefitCard
                  key={lang + '-' + match.program_id}
                  match={match}
                  program={program}
                  chrome={chrome}
                />
              ))}
            </div>
          </section>

          <RenewalCalendar entries={eligible} chrome={chrome} lang={lang} />

          {nearMisses.length > 0 && (
            <NearMissSection
              matches={nearMisses}
              programById={PROGRAM_BY_ID}
              chrome={chrome}
            />
          )}
        </>
      )}

      <footer
        className="mt-12 pt-6"
        style={{
          borderTop: '1px solid var(--rule)',
          color: 'var(--ink-3)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          marginTop: 48,
        }}
      >
        {chrome.disclaimer}
      </footer>
    </main>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tag" style={{ fontWeight: 500 }}>
        {k}
      </div>
      <div style={{ fontWeight: 600, marginTop: 2 }}>{v}</div>
    </div>
  );
}

function SortToggle({
  value,
  onChange,
}: {
  value: 'gems' | 'amount';
  onChange: (v: 'gems' | 'amount') => void;
}) {
  return (
    <div
      role="group"
      aria-label="Sort benefits"
      className="flex items-center"
      style={{
        border: '1px solid var(--rule-2)',
        borderRadius: 999,
        padding: 3,
        background: 'var(--paper-2)',
      }}
    >
      {(
        [
          { v: 'gems', label: 'Hidden gems first' },
          { v: 'amount', label: 'Largest amount' },
        ] as const
      ).map((opt) => {
        const active = value === opt.v;
        return (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            disabled={active}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: '0.78rem',
              fontWeight: 600,
              background: active ? 'var(--card-rose)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-3)',
              border: 0,
              cursor: active ? 'default' : 'pointer',
              boxShadow: active ? '0 1px 2px oklch(0.5 0.06 50 / 0.15)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
