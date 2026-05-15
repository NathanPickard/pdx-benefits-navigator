'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';

import { MoneyCounter } from '@/components/results/MoneyCounter';
import { BenefitCard } from '@/components/results/BenefitCard';
import { ComparisonChart } from '@/components/results/ComparisonChart';
import { LanguageToggle } from '@/components/results/LanguageToggle';
import { UrgencyBanner } from '@/components/results/UrgencyBanner';
import { CHROME_EN, type Chrome, type LanguageCode } from '@/lib/i18n';
import programsData from '@/data/programs.json';
import type { AnalysisOutput, IntakeData, Program } from '@/types/program';

const PROGRAMS = programsData as Program[];
const PROGRAM_BY_ID = new Map(PROGRAMS.map((p) => [p.id, p]));

type TranslatedBundle = { output: AnalysisOutput; chrome: Chrome };

type State =
  | { kind: 'loading'; tick: number }
  | { kind: 'ok'; data: AnalysisOutput }
  | { kind: 'error'; message: string };

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading', tick: 0 });
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [lang, setLang] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<
    Partial<Record<Exclude<LanguageCode, 'en'>, TranslatedBundle>>
  >({});
  const [pendingLang, setPendingLang] = useState<LanguageCode | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('pdx_intake');
    if (!raw) {
      router.replace('/intake');
      return;
    }
    const intake = JSON.parse(raw) as IntakeData;
    setIntake(intake);

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

      setPendingLang(next);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: { output: originalData, chrome: CHROME_EN },
            language: next,
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`);
        if (!json.translated?.output || !json.translated?.chrome) {
          throw new Error('Translation response missing fields');
        }
        setTranslations((prev) => ({
          ...prev,
          [next]: json.translated as TranslatedBundle,
        }));
        setLang(next);
      } catch (e) {
        setTranslateError(e instanceof Error ? e.message : 'Translation failed');
      } finally {
        setPendingLang(null);
      }
    },
    [lang, pendingLang, translations, originalData]
  );

  if (state.kind === 'loading') return <LoadingView tick={state.tick} />;
  if (state.kind === 'error') return <ErrorView message={state.message} />;

  const bundle: TranslatedBundle =
    lang === 'en'
      ? { output: state.data, chrome: CHROME_EN }
      : translations[lang as Exclude<LanguageCode, 'en'>] ?? {
          output: state.data,
          chrome: CHROME_EN,
        };

  return (
    <ResultsView
      data={bundle.output}
      originalData={state.data}
      intake={intake}
      chrome={bundle.chrome}
      lang={lang}
      pendingLang={pendingLang}
      onLanguageChange={handleLanguageChange}
      translateError={translateError}
    />
  );
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

function ResultsView({
  data,
  originalData,
  intake,
  chrome,
  lang,
  pendingLang,
  onLanguageChange,
  translateError,
}: {
  data: AnalysisOutput;
  originalData: AnalysisOutput;
  intake: IntakeData | null;
  chrome: Chrome;
  lang: LanguageCode;
  pendingLang: LanguageCode | null;
  onLanguageChange: (lang: LanguageCode) => void;
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

  const programsHeading = chrome.programsCountTemplate.replace(
    '{count}',
    String(eligible.length)
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleDownloadPacket}
          disabled={packetState === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
        >
          {packetState === 'loading' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {packetState === 'loading' ? 'Building packet…' : 'Download packet (PDF)'}
        </button>
        <LanguageToggle
          current={lang}
          pendingLanguage={pendingLang}
          translatedByAILabel={chrome.translatedByAI}
          onChange={onLanguageChange}
        />
      </div>

      {packetError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Packet download failed: {packetError}
        </div>
      )}

      {translateError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {translateError}
        </div>
      )}

      <motion.header
        key={lang + '-header'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {chrome.resultsKicker}
        </p>
        <div className="flex items-baseline gap-2">
          <MoneyCounter value={data.total_estimated_annual_value} />
          <span className="text-base font-medium text-muted-foreground">{chrome.perYear}</span>
        </div>
      </motion.header>

      {intake && <UrgencyBanner key={lang + '-urgency'} intake={intake} chrome={chrome} />}

      <motion.div
        key={lang + '-chart'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <ComparisonChart
          federal={data.federal_only_value}
          total={data.total_estimated_annual_value}
          title={chrome.howWeCompare}
          subtitle={chrome.mostToolsOnly}
          federalLabel={chrome.federalStateBarLabel}
          pdxLabel={chrome.pdxNavigatorBarLabel}
          missLabel={chrome.youdMiss}
        />
      </motion.div>

      {data.warnings?.length > 0 && (
        <motion.section
          key={lang + '-warnings'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="flex flex-col gap-1.5">
              <h2 className="text-sm font-semibold text-amber-900">{chrome.readFirst}</h2>
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
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">{programsHeading}</h2>
          <p className="text-xs text-muted-foreground">{chrome.sortNote}</p>
        </div>
        <div className="flex flex-col gap-4">
          {eligible.map(({ match, program }, i) => (
            <motion.div
              key={lang + '-' + match.program_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <BenefitCard match={match} program={program} chrome={chrome} />
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t pt-6 text-xs text-muted-foreground">
        <p>{chrome.disclaimer}</p>
      </footer>
    </main>
  );
}
