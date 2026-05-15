'use client';

import { Loader2, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col items-end" style={{ gap: 6 }}>
      <div
        role="group"
        aria-label="Choose language"
        className="flex items-center"
        style={{
          border: '1px solid var(--rule-2)',
          borderRadius: 999,
          padding: 3,
          background: 'var(--paper-2)',
        }}
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
              className="tabular"
              style={{
                padding: '5px 11px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 600,
                background: isActive ? 'var(--card-rose)' : 'transparent',
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                border: 0,
                cursor: busy ? 'wait' : isActive ? 'default' : 'pointer',
                boxShadow: isActive
                  ? '0 1px 2px oklch(0.5 0.06 50 / 0.15)'
                  : 'none',
                opacity: busy && !isPending && !isActive ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                minWidth: '2.25rem',
                justifyContent: 'center',
              }}
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : lang.short}
            </button>
          );
        })}
      </div>
      {current !== 'en' && (
        <span
          className="inline-flex items-center"
          style={{
            gap: 4,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--ink-3)',
          }}
        >
          <Sparkles size={11} />
          {translatedByAILabel}
        </span>
      )}
    </div>
  );
}
