'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANGUAGES, type LanguageCode } from '@/lib/i18n';

export function LanguageToggle({
  current,
  pendingLanguage,
  translatedByAILabel,
  onChange,
}: {
  current: LanguageCode;
  pendingLanguage: LanguageCode | null;
  translatedByAILabel: string;
  onChange: (lang: LanguageCode) => void;
}) {
  const busy = pendingLanguage !== null;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div
        role="group"
        aria-label="Choose language"
        className="inline-flex items-center gap-0.5 rounded-full border bg-card p-1 text-xs shadow-sm"
      >
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          const isPending = pendingLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange(lang.code)}
              disabled={busy || isActive}
              aria-label={lang.label}
              aria-pressed={isActive}
              className={cn(
                'inline-flex min-w-[2.25rem] items-center justify-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                busy && !isPending && !isActive && 'opacity-50'
              )}
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : lang.short}
            </button>
          );
        })}
      </div>
      {current !== 'en' && (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {translatedByAILabel}
        </span>
      )}
    </div>
  );
}
