'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { mergeTranslatedStrings } from '@/lib/results/translation';
import { CHROME_EN, LANGUAGES, type Chrome, type LanguageCode } from '@/lib/i18n';
import type { AnalysisOutput, IntakeData } from '@/types/program';

// Languages supported by the results translation path (en/es/vi).
// Used to guard the intake-language auto-select so unsupported languages
// (ru/zh/so/ar) fall back to English rather than causing a runtime error.
const SUPPORTED_RESULT_LANGS = new Set(LANGUAGES.map((l) => l.code));

export type TranslatedBundle = { output: AnalysisOutput; chrome: Chrome };

type TranslationLang = Exclude<LanguageCode, 'en'>;

export interface ResultsTranslation {
  lang: LanguageCode;
  pendingLang: LanguageCode | null;
  translateError: string | null;
  translations: Partial<Record<TranslationLang, TranslatedBundle>>;
  handleLanguageChange: (next: LanguageCode) => Promise<void>;
}

/**
 * Owns the results language: the active language, cached translations, the
 * in-flight translation, and the one-time auto-select from the intake.
 */
export function useResultsTranslation(
  originalData: AnalysisOutput | null,
  intake: IntakeData | null,
  apiKey: string | null
): ResultsTranslation {
  const [lang, setLang] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<
    Partial<Record<TranslationLang, TranslatedBundle>>
  >({});
  const [pendingLang, setPendingLang] = useState<LanguageCode | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  // Sync <html lang> with the active results language so screen readers and
  // the browser's speech engine use the correct language for translated content.
  // Arabic is not a supported results language yet so no dir="rtl" is needed
  // here — add that when ar/fa support is added to the translation pipeline.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
      // 'en' returned above, so TypeScript narrows next to a translation target.
      const target: TranslationLang = next;
      if (!apiKey) {
        setTranslateError(
          'Translation requires an Anthropic API key. Click the key indicator above to add one.'
        );
        return;
      }

      setPendingLang(target);
      try {
        const { translatePayload } = await import('@/lib/claudeBrowser');
        const translated = await translatePayload(
          apiKey,
          { output: originalData, chrome: CHROME_EN },
          target
        );
        if (!translated?.output || !translated?.chrome) {
          throw new Error('Translation response missing fields');
        }
        // Keep numbers, eligibility and ids from the English analysis; take
        // only translated strings. The model may drop a Chrome key; fall back
        // to English rather than render blank.
        const bundle: TranslatedBundle = {
          output: mergeTranslatedStrings(originalData, translated.output),
          chrome: { ...CHROME_EN, ...translated.chrome },
        };
        setTranslations((prev) => ({ ...prev, [target]: bundle }));
        setLang(target);
      } catch (e) {
        setTranslateError(e instanceof Error ? e.message : 'Translation failed');
      } finally {
        setPendingLang(null);
      }
    },
    [lang, pendingLang, translations, originalData, apiKey]
  );

  // Auto-select the results language from the intake's primary_language.
  // Fires once when originalData first becomes available and an API key is
  // present (so the translation pipeline can run). A ref gates it to initial
  // load only — subsequent manual toggles via handleLanguageChange win.
  // Silently skips when no API key is present (demo path) to avoid surfacing
  // a translation-requires-key error the user didn't ask for.
  const autoSelectFiredRef = useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (autoSelectFiredRef.current || !originalData || !intake || !apiKey) return;
    autoSelectFiredRef.current = true;
    const intakeLang = intake.primary_language;
    if (intakeLang !== 'en' && SUPPORTED_RESULT_LANGS.has(intakeLang as LanguageCode)) {
      // handleLanguageChange fetches the translation and then calls setLang.
      void handleLanguageChange(intakeLang as LanguageCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalData, intake, apiKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { lang, pendingLang, translateError, translations, handleLanguageChange };
}
