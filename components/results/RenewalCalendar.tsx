'use client';

import { Calendar, Download } from 'lucide-react';

import { buildIcsCalendar, downloadIcsFile, renewalIntervalMonths } from '@/lib/calendar';
import type { Chrome, LanguageCode } from '@/lib/i18n';
import type { MatchResult, Program } from '@/types/program';

interface Entry {
  match: MatchResult;
  program: Program;
}

interface RenderableEntry extends Entry {
  renewalDate: Date;
  intervalMonths: number;
}

const LOCALE: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-US',
  vi: 'vi-VN',
};

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth().toString().padStart(2, '0')}`;
}

function formatYear(d: Date): string {
  return String(d.getUTCFullYear());
}

function formatShortDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function RenewalCalendar({
  entries,
  chrome,
  lang,
}: {
  entries: Entry[];
  chrome: Chrome;
  lang: LanguageCode;
}) {
  if (entries.length === 0) return null;

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const oneYearOut = new Date(today);
  oneYearOut.setUTCFullYear(oneYearOut.getUTCFullYear() + 1);

  const renderable: RenderableEntry[] = entries
    .map((e) => {
      const months = renewalIntervalMonths(e.program.renewal_cycle);
      const renewalDate = new Date(today);
      renewalDate.setUTCMonth(renewalDate.getUTCMonth() + months);
      return { ...e, renewalDate, intervalMonths: months };
    })
    .filter((e) => e.intervalMonths > 0);

  if (renderable.length === 0) return null;

  renderable.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

  const upcoming = renderable.filter((e) => e.renewalDate <= oneYearOut);
  const later = renderable.filter((e) => e.renewalDate > oneYearOut);

  const handleExport = () => {
    const ics = buildIcsCalendar(entries);
    downloadIcsFile(ics);
  };

  const locale = LOCALE[lang];

  return (
    <section className="rc-card" style={{ padding: 28 }}>
      <header
        className="flex items-start justify-between mb-6 flex-wrap"
        style={{ gap: 12 }}
      >
        <div className="flex items-start" style={{ gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--moss-soft)',
              color: 'var(--moss-2)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={18} strokeWidth={2} />
          </span>
          <div>
            <div className="eyebrow mb-1" style={{ color: 'var(--moss-2)' }}>
              {chrome.renewalCalendarTitle}
            </div>
            <h3
              className="font-display"
              style={{
                fontSize: '1.55rem',
                margin: 0,
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: '-0.018em',
              }}
            >
              {chrome.renewalCalendarSubtitle}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rc-btn rc-btn-outline rc-btn-sm"
        >
          <Download size={13} /> {chrome.exportCalendar}
        </button>
      </header>

      {upcoming.length > 0 && (
        <CalendarBucket
          label={chrome.renewalUpcoming}
          entries={upcoming}
          locale={locale}
          highlight
        />
      )}
      {later.length > 0 && (
        <CalendarBucket label={chrome.renewalLater} entries={later} locale={locale} />
      )}
    </section>
  );
}

function CalendarBucket({
  label,
  entries,
  locale,
  highlight,
}: {
  label: string;
  entries: RenderableEntry[];
  locale: string;
  highlight?: boolean;
}) {
  const groups = new Map<string, { date: Date; items: RenderableEntry[] }>();
  for (const e of entries) {
    const key = monthKey(e.renewalDate);
    let group = groups.get(key);
    if (!group) {
      group = { date: startOfMonth(e.renewalDate), items: [] };
      groups.set(key, group);
    }
    group.items.push(e);
  }
  const ordered = Array.from(groups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow mb-3">{label}</div>
      <div
        className="grid"
        style={{ gridTemplateColumns: '180px 1fr', gap: 14 }}
      >
        {ordered.map((group) => (
          <div key={monthKey(group.date)} style={{ display: 'contents' }}>
            <div>
              <div
                className="font-display tabular"
                style={{
                  fontSize: '1.7rem',
                  lineHeight: 1,
                  fontWeight: 500,
                  color: highlight ? 'var(--rose)' : 'var(--ink)',
                }}
              >
                {SHORT_MONTH[group.date.getUTCMonth()]}
              </div>
              <div className="tag" style={{ marginTop: 4 }}>
                {formatYear(group.date)} · {group.items.length}{' '}
                {group.items.length === 1 ? 'renewal' : 'renewals'}
              </div>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {group.items.map(({ match, program, renewalDate }) => (
                <li
                  key={program.id}
                  className="rc-card-flat flex items-baseline justify-between"
                  style={{ padding: '12px 16px', fontSize: '0.92rem' }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{program.name}</div>
                    <div
                      style={{
                        color: 'var(--ink-3)',
                        fontSize: '0.78rem',
                        marginTop: 2,
                      }}
                    >
                      {program.renewal_cycle ?? 'Annual'} ·{' '}
                      {formatShortDate(renewalDate, locale)}
                    </div>
                  </div>
                  <div
                    className="tabular"
                    style={{ color: 'var(--moss-2)', fontWeight: 600 }}
                  >
                    ${match.estimated_annual_value.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
