import { ExternalLink, Sparkles, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Chrome } from '@/lib/i18n';
import type { MatchResult, Program } from '@/types/program';

const JURISDICTION_CLASS: Record<Program['jurisdiction'], string> = {
  federal: 'bg-slate-100 text-slate-700 border-slate-200',
  oregon: 'bg-blue-50 text-blue-700 border-blue-200',
  multnomah: 'bg-green-50 text-green-700 border-green-200',
  portland: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const CONFIDENCE_DOT: Record<MatchResult['confidence'], string> = {
  high: 'bg-emerald-500',
  medium: 'bg-amber-500',
  low: 'bg-zinc-400',
};

function jurisdictionLabel(j: Program['jurisdiction'], c: Chrome): string {
  switch (j) {
    case 'federal':
      return c.jurisdictionFederal;
    case 'oregon':
      return c.jurisdictionOregon;
    case 'multnomah':
      return c.jurisdictionMultnomah;
    case 'portland':
      return c.jurisdictionPortland;
  }
}

function confidenceLabel(level: MatchResult['confidence'], c: Chrome): string {
  switch (level) {
    case 'high':
      return c.confidenceHigh;
    case 'medium':
      return c.confidenceMedium;
    case 'low':
      return c.confidenceLow;
  }
}

export function BenefitCard({
  match,
  program,
  chrome,
}: {
  match: MatchResult;
  program: Program;
  chrome: Chrome;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">{program.name}</h3>
            {program.hidden_gem && (
              <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                <Sparkles className="mr-1 h-3 w-3" />
                {chrome.hiddenGem}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
                JURISDICTION_CLASS[program.jurisdiction]
              )}
            >
              {jurisdictionLabel(program.jurisdiction, chrome)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', CONFIDENCE_DOT[match.confidence])} />
              {confidenceLabel(match.confidence, chrome)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums">
            ${match.estimated_annual_value.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">{chrome.estimatedYear}</div>
        </div>
      </header>

      <p className="text-sm text-foreground/80">{match.reasoning}</p>

      {match.urgency_note && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{match.urgency_note}</span>
        </div>
      )}

      {match.next_steps?.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {chrome.nextSteps}
          </h4>
          <ol className="flex flex-col gap-1.5 text-sm">
            {match.next_steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-medium text-muted-foreground tabular-nums">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {match.required_documents?.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {chrome.whatToBring}
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {match.required_documents.map((doc, i) => (
              <li
                key={i}
                className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-foreground/80"
              >
                {doc}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {program.contact_org}
          {program.contact_phone && <> · {program.contact_phone}</>}
          {program.processing_time && <> · {program.processing_time}</>}
        </div>
        <a
          href={program.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'sm', variant: 'default' })}
        >
          {chrome.applyNow}
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </a>
      </footer>
    </article>
  );
}
