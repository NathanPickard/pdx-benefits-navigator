'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

import { IntakeSchema, parseStoredIntakeFields } from '@/lib/intakeSchema';
import { SESSION_KEYS } from '@/lib/sessionState';

import { NoKeyBanner } from './NoKeyBanner';
import { AboutYou, Household, Housing, Income, Review, type FormValues } from './steps';

const STEPS = ['Household', 'Income', 'Housing', 'About you', 'Review'] as const;

const stepFields: Record<number, (keyof FormValues)[]> = {
  0: ['household_size', 'num_children', 'children_ages'],
  1: ['annual_income', 'employment_status'],
  2: ['zip_code', 'housing_status', 'recent_rent_increase_pct', 'received_eviction_notice'],
  3: [
    'has_disability',
    'is_veteran',
    'is_pregnant',
    'has_senior_in_household',
    'primary_language',
    'citizenship',
  ],
  4: [],
};

const AUTOSAVE_DEBOUNCE_MS = 500;

const DEFAULT_VALUES: FormValues = {
  household_size: 1,
  num_children: 0,
  children_ages: [],
  annual_income: 0,
  zip_code: '',
  housing_status: 'rent',
  received_eviction_notice: false,
  has_disability: false,
  is_veteran: false,
  is_pregnant: false,
  has_senior_in_household: false,
  primary_language: 'en',
  employment_status: 'employed_ft',
  citizenship: 'citizen',
};

// Reads a saved intake from sessionStorage: the autosaved draft first, then
// the last submitted intake. Returns null when there is neither, so the form
// keeps DEFAULT_VALUES. Called only after mount, never during render, so
// server and client render the same initial markup.
function seedFromStorage(): FormValues | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.intakeDraft)
      ?? sessionStorage.getItem(SESSION_KEYS.intake);
    if (!raw) return null;
    return parseStoredIntakeFields(JSON.parse(raw), DEFAULT_VALUES);
  } catch {
    return null;
  }
}

interface ConversationalFormProps {
  /** Passed from the server page so the programs database stays out of the client bundle. */
  programCount: number;
}

export function ConversationalForm({ programCount }: ConversationalFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(IntakeSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    const seeded = seedFromStorage();
    if (seeded) form.reset(seeded);
  }, [form]);

  // Held in a ref so onSubmit can cancel a pending autosave; otherwise a save
  // queued just before submit would write the draft back after it is cleared.
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
          try { sessionStorage.setItem(SESSION_KEYS.intakeDraft, JSON.stringify(values)); } catch { /* non-fatal */ }
        }, AUTOSAVE_DEBOUNCE_MS);
      },
    });
    return () => { unsubscribe(); clearTimeout(autosaveTimer.current); };
  }, [form]);

  const next = async () => {
    const fields = stepFields[step];
    const ok = fields.length === 0 ? true : await form.trigger(fields);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    clearTimeout(autosaveTimer.current);
    // Rent fields stay in form state if the user switches away from Rent;
    // drop them from the submitted copy so they don't reach the analysis.
    const submitted: FormValues = values.housing_status === 'rent'
      ? values
      : { ...values, recent_rent_increase_pct: undefined, received_eviction_notice: false };
    sessionStorage.setItem(SESSION_KEYS.intake, JSON.stringify(submitted));
    sessionStorage.removeItem(SESSION_KEYS.intakeDraft);
    // Clear any leftover demo state so a prior demo run doesn't hijack this scan.
    sessionStorage.removeItem(SESSION_KEYS.prebaked);
    sessionStorage.removeItem(SESSION_KEYS.demoSimulate);
    router.push('/results');
  };

  return (
    <main
      className="rc-container rc-page-pad"
      style={{ maxWidth: 880 }}
    >
      <Link href="/" className="rc-btn rc-btn-ghost rc-btn-sm mb-6" style={{ marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to navigator
      </Link>

      <NoKeyBanner />

      <header style={{ marginBottom: 32 }}>
        <div className="flex items-center justify-between flex-wrap mb-5" style={{ gap: 12 }}>
          <div>
            <div className="eyebrow mb-1">A short, friendly intake</div>
            <h1
              className="font-display"
              style={{
                fontSize: '2.2rem',
                margin: 0,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Tell us a little about your household.
            </h1>
          </div>
          <span className="pill pill-clay">
            Step {step + 1} of {STEPS.length} · ~3 min
          </span>
        </div>
        <StepNumerals current={step} />
      </header>

      <form onSubmit={(e) => form.handleSubmit(onSubmit)(e)}>
        <div className="rc-card rc-card-pad-lg">
          <div className="rc-enter" key={step}>
            {step === 0 && <Household form={form} />}
            {step === 1 && <Income form={form} />}
            {step === 2 && <Housing form={form} />}
            {step === 3 && <AboutYou form={form} />}
            {step === 4 && <Review values={form.getValues()} programCount={programCount} />}
          </div>

          <div
            className="flex items-center justify-between"
            style={{
              borderTop: '1px solid var(--rule)',
              marginTop: 32,
              paddingTop: 22,
            }}
          >
            <button
              type="button"
              className="rc-btn rc-btn-ghost"
              onClick={back}
              disabled={step === 0}
              style={{
                opacity: step === 0 ? 0.4 : 1,
                pointerEvents: step === 0 ? 'none' : 'auto',
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="rc-btn rc-btn-primary" onClick={next}>
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button type="submit" className="rc-btn rc-btn-rose" disabled={submitting}>
                <Sparkles size={14} />
                {submitting ? 'Analyzing…' : 'Find my benefits'}
              </button>
            )}
          </div>
        </div>
      </form>

      <p
        style={{
          marginTop: 18,
          color: 'var(--ink-3)',
          fontSize: '0.8rem',
          textAlign: 'center',
        }}
      >
        Your answers stay in this browser session and go to Anthropic only for your analysis. Nothing is saved on our server.
      </p>
    </main>
  );
}

/* ─────────────────────── Step numerals ─────────────────────── */

function StepNumerals({ current }: { current: number }) {
  return (
    <div className="flex items-center" style={{ width: '100%', gap: 12 }}>
      {STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'next';
        const bg =
          state === 'active'
            ? 'var(--rose)'
            : state === 'done'
              ? 'var(--moss-soft)'
              : 'var(--paper-2)';
        const fg =
          state === 'active'
            ? 'oklch(0.98 0.01 30)'
            : state === 'done'
              ? 'var(--moss-2)'
              : 'var(--ink-3)';
        return (
          <div
            key={s}
            className="flex items-center"
            style={{ flex: 1, minWidth: 0, gap: 8 }}
          >
            <span
              style={{
                display: 'inline-flex',
                width: 26,
                height: 26,
                borderRadius: 999,
                background: bg,
                color: fg,
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {state === 'done' ? <Check size={13} strokeWidth={2.4} /> : i + 1}
            </span>
            <span
              className="rc-hide-sm"
              style={{
                fontSize: '0.86rem',
                color:
                  state === 'next'
                    ? 'var(--ink-3)'
                    : state === 'active'
                      ? 'var(--ink)'
                      : 'var(--ink-2)',
                fontWeight: state === 'active' ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <span
                style={{
                  flex: 1,
                  height: 2,
                  minWidth: 8,
                  borderRadius: 999,
                  background: state === 'done' ? 'var(--moss)' : 'var(--rule)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
