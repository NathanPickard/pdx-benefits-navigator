/**
 * Generates an RFC 5545 .ics file of benefit-program renewal reminders.
 * Pure string builder — no external dependencies.
 */

import type { MatchResult, Program } from '@/types/program';

export interface CalendarEntry {
  match: MatchResult;
  program: Program;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function formatDateTime(d: Date): string {
  return `${formatDate(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(
    d.getUTCSeconds()
  )}Z`;
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// Per RFC 5545, lines should be folded at 75 octets. Most clients handle long
// lines fine, but folding keeps strict parsers happy.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunkSize = i === 0 ? 75 : 74;
    const chunk = line.slice(i, i + chunkSize);
    chunks.push(i === 0 ? chunk : ' ' + chunk);
    i += chunkSize;
  }
  return chunks.join('\r\n');
}

export function renewalIntervalMonths(cycle: string | undefined): number {
  if (!cycle) return 12;
  const lower = cycle.toLowerCase();
  if (/monthly|every month/.test(lower)) return 1;
  if (/quarterly/.test(lower)) return 3;
  if (/6.{0,6}month|biannual|twice a year/.test(lower)) return 6;
  if (/annual|yearly|every year|year\b/.test(lower)) return 12;
  return 12;
}

export function buildIcsCalendar(entries: CalendarEntry[]): string {
  const now = new Date();
  const stamp = formatDateTime(now);

  const events = entries.map(({ match, program }) => {
    const months = renewalIntervalMonths(program.renewal_cycle);
    const start = new Date(now);
    start.setUTCMonth(start.getUTCMonth() + months);

    const descParts: string[] = [];
    descParts.push(`Estimated value: $${match.estimated_annual_value.toLocaleString()}/year`);
    if (program.renewal_cycle) descParts.push(`Renewal cycle: ${program.renewal_cycle}`);
    if (program.contact_org) descParts.push(`Contact: ${program.contact_org}`);
    if (program.contact_phone) descParts.push(`Phone: ${program.contact_phone}`);
    if (program.application_url) descParts.push(`Apply: ${program.application_url}`);
    if (match.reasoning) descParts.push(`\n${match.reasoning}`);

    const lines: string[] = [
      'BEGIN:VEVENT',
      `UID:${program.id}-renewal-${start.getUTCFullYear()}@pdxbenefits.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatDate(start)}`,
      fold(`SUMMARY:${escapeText('Renew: ' + program.name)}`),
      fold(`DESCRIPTION:${escapeText(descParts.join('\n'))}`),
    ];
    if (program.application_url) lines.push(fold(`URL:${program.application_url}`));
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-P14D',
      'ACTION:DISPLAY',
      fold(`DESCRIPTION:${escapeText('Renew ' + program.name + ' in 2 weeks')}`),
      'END:VALARM',
      'END:VEVENT'
    );
    return lines.join('\r\n');
  });

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PDX Benefits Navigator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PDX Benefits — Renewals',
    'X-WR-CALDESC:Renewal reminders for your benefits programs',
    ...events,
    'END:VCALENDAR',
    '',
  ];

  return calendar.join('\r\n');
}

export function downloadIcsFile(ics: string, filename = 'pdx-benefits-renewals.ics'): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
