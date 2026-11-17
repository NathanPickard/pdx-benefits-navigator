'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clipboard, Download, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';

import { AppBar } from '@/components/brand/AppBar';
import { MoneyCounter } from '@/components/results/MoneyCounter';
import { BenefitCard } from '@/components/results/BenefitCard';
import { ComparisonChart } from '@/components/results/ComparisonChart';
import { ErrorView, LoadingView, NeedsKeyView } from '@/components/results/StatusViews';
import { HouseholdSummary } from '@/components/results/HouseholdSummary';
import { FilterChips } from '@/components/results/FilterChips';
import { LanguageToggle } from '@/components/results/LanguageToggle';
import { NearMissSection } from '@/components/results/NearMissSection';
import { ProgressBar } from '@/components/results/ProgressBar';
import { UrgencyBanner } from '@/components/results/UrgencyBanner';
import { RenewalCalendar } from '@/components/results/RenewalCalendar';
import { useApplicationStatus } from '@/lib/applicationStatus';
import { downloadBlob } from '@/lib/download';
import {
  buildPlainTextSummary,
  filterRows,
  joinPrograms,
  likelyRange,
  sortRows,
} from '@/lib/results/derive';
import { CHROME_EN, type Chrome, type LanguageCode } from '@/lib/i18n';
import { useApiKey } from '@/lib/userKey';
import { PROGRAM_BY_ID } from '@/lib/programs';
import type { AnalysisOutput, IntakeData, Program } from '@/types/program';
import { useAnalysisLoader } from './useAnalysisLoader';
import { useResultsTranslation, type TranslatedBundle } from './useResultsTranslation';

export default function ResultsPage() {
  const { apiKey, hydrated } = useApiKey();
  const { state, intake } = useAnalysisLoader(apiKey, hydrated);
  const originalData = state.kind === 'ok' ? state.data : null;
  const { lang, pendingLang, translateError, translations, handleLanguageChange } =
    useResultsTranslation(originalData, intake, apiKey);

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

  const bundle: TranslatedBundle = (lang !== 'en' ? translations[lang] : undefined) ?? {
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

/* ─────────────────────── Dashboard ─────────────────────── */

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
  const { statusFor, setStatus, clearAll, hasAny } = useApplicationStatus();

  const handleDownloadPacket = useCallback(async () => {
    if (packetState === 'loading' || !intake) return;
    setPacketState('loading');
    setPacketError(null);
    try {
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
      downloadBlob(blob, 'pdx-benefits-packet.pdf');
      setPacketState('idle');
    } catch (e) {
      setPacketError(e instanceof Error ? e.message : 'Download failed');
      setPacketState('error');
    }
  }, [packetState, originalData, intake]);

  const [sortMode, setSortMode] = useState<'gems' | 'amount'>('gems');
  const [filterCategory, setFilterCategory] = useState<Program['category'] | null>(null);
  const [filterJurisdiction, setFilterJurisdiction] = useState<Program['jurisdiction'] | null>(null);
  // collapsed: Set of program_ids that are collapsed; default = all expanded
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // All eligible rows (unfiltered) — used for ProgressBar denominator + hero totals
  const allEligible = useMemo(
    () => joinPrograms(data.matches.filter((m) => m.eligible), PROGRAM_BY_ID),
    [data]
  );

  // Filtered + sorted eligible rows shown in the card grid
  const eligible = useMemo(
    () =>
      sortRows(
        filterRows(allEligible, { category: filterCategory, jurisdiction: filterJurisdiction }),
        sortMode
      ),
    [allEligible, sortMode, filterCategory, filterJurisdiction]
  );

  // Likely range: official ranges summed over all eligible rows with an
  // estimate (unfiltered, so it brackets the hero total).
  const { low: bandLow, high: bandHigh } = useMemo(
    () => likelyRange(allEligible),
    [allEligible]
  );

  // Near-misses: ineligible matches. Computed separately so they can be
  // surfaced below the eligible card grid — or front-and-center in the
  // zero-eligible empty state. Pre-rebake fixtures have no requirements[]
  // arrays; NearMissSection falls back to match.reasoning for the reason.
  const nearMissRows = useMemo(
    () => joinPrograms(data.matches.filter((m) => !m.eligible), PROGRAM_BY_ID),
    [data]
  );

  const handleCopySummary = useCallback(async () => {
    const text = buildPlainTextSummary(data.total_estimated_annual_value, allEligible);
    try {
      if (!navigator.clipboard) throw new Error('unavailable');
      await navigator.clipboard.writeText(text);
      toast.success(chrome.copySummarySuccess);
    } catch {
      toast.error(chrome.copySummaryFallback);
    }
  }, [data, allEligible, chrome]);

  // Use allEligible for hero/progress so counts are stable under filtering
  const gemCount = allEligible.filter((e) => e.program.hidden_gem).length;
  const appliedCount = allEligible.filter((r) => statusFor(r.match.program_id) === 'applied').length;
  const programsHeading = chrome.programsCountTemplate.replace(
    '{count}',
    String(allEligible.length)
  );
  const isFiltered = filterCategory !== null || filterJurisdiction !== null;

  return (
    <main className="rc-container rc-page-pad">
      <Link
        href="/"
        data-print="hide"
        className="rc-btn rc-btn-ghost rc-btn-sm mb-6"
        style={{ marginBottom: 24 }}
      >
        <ArrowLeft size={14} /> Back to navigator
      </Link>

      {/* Top action strip */}
      <div
        data-print="hide"
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
            disabled={packetState === 'loading' || !intake}
            className="rc-btn rc-btn-outline rc-btn-sm"
          >
            {packetState === 'loading' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            {packetState === 'loading' ? chrome.buildingPacket : chrome.downloadPacket}
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="rc-btn rc-btn-outline rc-btn-sm"
            aria-label="Copy plain-text summary to clipboard"
          >
            <Clipboard size={13} />
            {chrome.copySummary}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rc-btn rc-btn-outline rc-btn-sm"
            aria-label="Print this page"
          >
            <Printer size={13} />
            {chrome.print}
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
      {allEligible.length > 0 && (
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
              <strong style={{ color: 'var(--ink)' }}>{allEligible.length} program{allEligible.length !== 1 ? 's' : ''}</strong>
              {gemCount > 0 && (
                <>
                  , including{' '}
                  <strong style={{ color: 'var(--rose)' }}>
                    {gemCount} hyperlocal Portland gem{gemCount !== 1 ? 's' : ''}
                  </strong>{' '}
                  that national tools would miss
                </>
              )}
              .
            </p>
          </div>

          {intake && <HouseholdSummary intake={intake} />}
        </section>
      )}

      {/* UrgencyBanner and warnings are shown on both paths — a household with
          an eviction notice but zero eligible programs still needs the warning. */}
      {intake && <UrgencyBanner intake={intake} chrome={chrome} />}

      {/* ComparisonChart is only meaningful when there are eligible programs;
          a 0-vs-0 chart is misleading on the zero-eligible path. */}
      {allEligible.length > 0 && (
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

      {allEligible.length === 0 ? (
        /* ── Zero-eligible empty state ── */
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
              {chrome.emptyStateHeading}
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
              {chrome.emptyStateBody}
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
              <span>{chrome.emptyStateCta}</span>
            </div>
          </div>

          {nearMissRows.length > 0 && (
            <NearMissSection rows={nearMissRows} chrome={chrome} />
          )}
        </section>
      ) : (
        /* ── Normal layout: eligible cards + near-misses below ── */
        <>
          <section className="mb-10">
            <header className="flex items-end justify-between gap-6 flex-wrap mb-8">
              <div>
                <div className="eyebrow mb-2">
                  {allEligible.length} program{allEligible.length !== 1 ? 's' : ''} ·{' '}
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

            {/* ProgressBar denominator = all eligible (stable under filtering) */}
            <div data-print="hide">
              <ProgressBar applied={appliedCount} total={allEligible.length} chrome={chrome} />
              <div
                className="flex items-center justify-between flex-wrap"
                style={{ gap: 8, marginBottom: 16, fontSize: '0.82rem' }}
              >
                <span style={{ color: 'var(--ink-3)' }}>
                  {chrome.savedOnDevice}
                </span>
                {hasAny && (
                  <button
                    type="button"
                    onClick={clearAll}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: 'var(--ink-3)',
                      textDecoration: 'underline',
                    }}
                  >
                    {chrome.clearProgress}
                  </button>
                )}
              </div>
            </div>

            {/* Filter chips — category and jurisdiction */}
            <div data-print="hide">
              <FilterChips
                rows={allEligible}
                activeCategory={filterCategory}
                activeJurisdiction={filterJurisdiction}
                onCategory={setFilterCategory}
                onJurisdiction={setFilterJurisdiction}
                chrome={chrome}
              />
            </div>

            {/* Showing N of M count */}
            {isFiltered && (
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--ink-3)',
                  marginBottom: 12,
                }}
              >
                {chrome.showingNofMTemplate
                  .replace('{shown}', String(eligible.length))
                  .replace('{total}', String(allEligible.length))}
              </div>
            )}

            {/* Filtered-to-zero: distinct from zero-eligible empty state */}
            {isFiltered && eligible.length === 0 ? (
              <div
                style={{
                  padding: 'clamp(20px, 4vw, 28px)',
                  borderRadius: 16,
                  border: '1px solid var(--rule-2)',
                  background: 'var(--paper-2)',
                  textAlign: 'center',
                  fontSize: '0.96rem',
                  color: 'var(--ink-2)',
                }}
              >
                {chrome.noFilterMatch}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory(null);
                    setFilterJurisdiction(null);
                  }}
                  style={{
                    background: 'none',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    color: 'var(--rose)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  {chrome.clearFilters}
                </button>
              </div>
            ) : (
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
                    status={statusFor(match.program_id)}
                    onStatusChange={(s) => setStatus(match.program_id, s)}
                    collapsed={collapsed.has(match.program_id)}
                    onToggleCollapse={() => toggleCollapse(match.program_id)}
                  />
                ))}
              </div>
            )}
          </section>

          <RenewalCalendar entries={allEligible} chrome={chrome} lang={lang} />

          {nearMissRows.length > 0 && (
            <NearMissSection rows={nearMissRows} chrome={chrome} />
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
