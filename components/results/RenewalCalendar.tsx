'use client';

import { CalendarDays, Clock, Download } from 'lucide-react';

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

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth().toString().padStart(2, '0')}`;
}

function formatMonth(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
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
  const sixMonthsOut = new Date(today);
  sixMonthsOut.setUTCMonth(sixMonthsOut.getUTCMonth() + 6);

  const renderable: RenderableEntry[] = entries.map((e) => {
    const months = renewalIntervalMonths(e.program.renewal_cycle);
    const renewalDate = new Date(today);
    renewalDate.setUTCMonth(renewalDate.getUTCMonth() + months);
    return { ...e, renewalDate, intervalMonths: months };
  });
  renderable.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

  const upcoming = renderable.filter((e) => e.renewalDate <= sixMonthsOut);
  const later = renderable.filter((e) => e.renewalDate > sixMonthsOut);

  const handleExport = () => {
    const ics = buildIcsCalendar(entries);
    downloadIcsFile(ics);
  };

  const locale = LOCALE[lang];

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {chrome.renewalCalendarTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{chrome.renewalCalendarSubtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          {chrome.exportCalendar}
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
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <ol className="flex flex-col gap-3">
        {ordered.map((group) => (
          <li
            key={monthKey(group.date)}
            className="grid grid-cols-[auto_1fr] gap-4 sm:grid-cols-[8rem_1fr]"
          >
            <div className="flex shrink-0 flex-col">
              <span
                className={
                  highlight
                    ? 'text-sm font-semibold text-emerald-700'
                    : 'text-sm font-semibold'
                }
              >
                {formatMonth(group.date, locale)}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {group.items.length} {group.items.length === 1 ? 'renewal' : 'renewals'}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {group.items.map(({ match, program, renewalDate }) => (
                <li
                  key={program.id}
                  className="flex items-baseline justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium leading-tight">{program.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {program.renewal_cycle ?? 'Annual'}
                      {' · '}
                      {formatShortDate(renewalDate, locale)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold tabular-nums">
                      ${match.estimated_annual_value.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
