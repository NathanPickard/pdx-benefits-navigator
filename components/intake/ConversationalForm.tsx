'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

import type { IntakeData } from '@/types/program';

const schema = z.object({
  household_size: z.number().int().min(1).max(12),
  num_children: z.number().int().min(0).max(10),
  children_ages: z.array(z.number().int().min(0).max(17)),
  annual_income: z.number().min(0).max(500000),
  zip_code: z.string().regex(/^\d{5}$/, '5-digit ZIP'),
  housing_status: z.enum(['rent', 'own', 'unhoused', 'staying_with_others']),
  recent_rent_increase_pct: z.number().min(0).max(100).optional(),
  received_eviction_notice: z.boolean().optional(),
  has_disability: z.boolean(),
  is_veteran: z.boolean(),
  is_pregnant: z.boolean(),
  has_senior_in_household: z.boolean(),
  primary_language: z.enum(['en', 'es', 'vi', 'ru', 'zh', 'so', 'ar']),
  employment_status: z.enum([
    'employed_ft',
    'employed_pt',
    'self_employed',
    'unemployed',
    'retired',
    'disabled',
  ]),
  citizenship: z.enum(['citizen', 'lpr', 'other', 'prefer_not_say']),
});

type FormValues = z.infer<typeof schema>;
type Form = UseFormReturn<FormValues>;

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

export function ConversationalForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
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
    },
  });

  const next = async () => {
    const fields = stepFields[step];
    const ok = fields.length === 0 ? true : await form.trigger(fields);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (values: FormValues) => {
    setSubmitting(true);
    sessionStorage.setItem('pdx_intake', JSON.stringify(values as IntakeData));
    router.push('/results');
  };

  return (
    <main className="mx-auto" style={{ maxWidth: 880, padding: '48px 32px 96px' }}>
      <Link href="/" className="rc-btn rc-btn-ghost rc-btn-sm mb-6" style={{ marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to navigator
      </Link>

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

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="rc-card" style={{ padding: '32px 36px' }}>
          <div className="rc-enter" key={step}>
            {step === 0 && <Household form={form} />}
            {step === 1 && <Income form={form} />}
            {step === 2 && <Housing form={form} />}
            {step === 3 && <AboutYou form={form} />}
            {step === 4 && <Review values={form.getValues()} />}
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
        Nothing is stored. Your answers stay in this browser session.
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

/* ─────────────────────── Atoms ─────────────────────── */

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        className="font-display"
        style={{
          fontSize: '2rem',
          lineHeight: 1.1,
          margin: '0 0 8px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ color: 'var(--ink-2)', margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label
        className="block"
        style={{
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'var(--ink)',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p
          style={{
            marginTop: 6,
            color: 'var(--ink-3)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          style={{
            marginTop: 6,
            color: 'oklch(0.55 0.18 25)',
            fontSize: '0.82rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Choices<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rc-choice ${selected ? 'selected' : ''}`}
          >
            <span style={{ fontWeight: 500 }}>{opt.label}</span>
            {opt.hint && <span className="hint">{opt.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Choices<'yes' | 'no'>
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  );
}

function NumStepper({
  value,
  onChange,
  min = 0,
  max = 12,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const btn: React.CSSProperties = {
    width: 44,
    height: 44,
    padding: 0,
    justifyContent: 'center',
    borderRadius: 999,
    fontSize: '1.2rem',
    fontWeight: 500,
  };
  return (
    <div className="flex items-center" style={{ gap: 12 }}>
      <button
        type="button"
        className="rc-btn rc-btn-outline rc-btn-sm"
        onClick={() => onChange(Math.max(min, value - 1))}
        style={btn}
      >
        −
      </button>
      <div
        className="tabular font-display flex-1 text-center"
        style={{
          fontSize: '1.9rem',
          padding: '0.5rem 1rem',
          border: '1px solid var(--rule-2)',
          borderRadius: 14,
          background: 'var(--card-rose)',
          fontWeight: 500,
        }}
      >
        {value}
      </div>
      <button
        type="button"
        className="rc-btn rc-btn-outline rc-btn-sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        style={btn}
      >
        +
      </button>
    </div>
  );
}

/* ─────────────────────── Step bodies ─────────────────────── */

function Household({ form }: { form: Form }) {
  const num_children = form.watch('num_children');
  const children_ages = form.watch('children_ages') ?? [];
  const household_size = form.watch('household_size');

  return (
    <>
      <StepHeading
        title="Who's in your household?"
        sub="We use this for programs that depend on household size."
      />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Field label="People in your household">
          <Controller
            control={form.control}
            name="household_size"
            render={({ field }) => (
              <NumStepper
                value={household_size}
                onChange={field.onChange}
                min={1}
                max={12}
              />
            )}
          />
        </Field>
        <Field label="Children under 18">
          <Controller
            control={form.control}
            name="num_children"
            render={({ field }) => (
              <NumStepper
                value={num_children}
                onChange={(n) => {
                  field.onChange(n);
                  const ages = Array.from({ length: n }, (_, i) => children_ages[i] ?? 0);
                  form.setValue('children_ages', ages);
                }}
                min={0}
                max={10}
              />
            )}
          />
        </Field>
      </div>
      {num_children > 0 && (
        <Field
          label="Ages of children"
          hint="Type each child's age — we use this for school-age, WIC, and ERDC eligibility."
        >
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {Array.from({ length: num_children }).map((_, i) => (
              <input
                key={i}
                className="rc-input tabular"
                type="number"
                min={0}
                max={17}
                placeholder={`Child ${i + 1}`}
                value={children_ages[i] ?? ''}
                onChange={(e) => {
                  const ages = [...children_ages];
                  ages[i] = Number(e.target.value);
                  form.setValue('children_ages', ages, { shouldValidate: true });
                }}
              />
            ))}
          </div>
        </Field>
      )}
    </>
  );
}

function Income({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const annual_income = form.watch('annual_income') ?? 0;
  const household_size = form.watch('household_size') ?? 1;

  const pctFpl = useMemo(() => {
    const fpl = 15650 + Math.max(0, household_size - 1) * 5500;
    if (!fpl) return 0;
    return Math.round((annual_income / fpl) * 100);
  }, [annual_income, household_size]);

  return (
    <>
      <StepHeading
        title="Tell us about your income."
        sub="Pre-tax, all earners combined. Best estimate — we just need to know the ballpark."
      />
      <Field
        label="Total household annual income (USD)"
        hint={`That's about ${pctFpl}% of the 2026 Federal Poverty Level for a household of ${household_size}.`}
        error={errors.annual_income?.message}
      >
        <div
          className="flex items-center"
          style={{
            gap: 12,
            border: '1px solid var(--rule-2)',
            borderRadius: 12,
            background: 'var(--card-rose)',
            padding: '0 16px',
          }}
        >
          <span
            className="font-display tabular"
            style={{ fontSize: '1.6rem', color: 'var(--rose)' }}
          >
            $
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            value={annual_income || ''}
            onChange={(e) =>
              form.setValue('annual_income', Number(e.target.value) || 0, {
                shouldValidate: true,
              })
            }
            placeholder="0"
            className="tabular"
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              background: 'transparent',
              padding: '16px 0',
              fontSize: '1.6rem',
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
            }}
          />
          <span style={{ color: 'var(--ink-3)', fontSize: '0.86rem' }}>/ year</span>
        </div>
      </Field>
      <Field label="What's your employment situation?">
        <Controller
          control={form.control}
          name="employment_status"
          render={({ field }) => (
            <Choices
              value={field.value}
              onChange={field.onChange}
              columns={3}
              options={[
                { value: 'employed_ft', label: 'Full-time' },
                { value: 'employed_pt', label: 'Part-time' },
                { value: 'self_employed', label: 'Self-employed' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'retired', label: 'Retired' },
                { value: 'disabled', label: 'On disability' },
              ]}
            />
          )}
        />
      </Field>
    </>
  );
}

function Housing({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const housing = form.watch('housing_status');
  const zip = form.watch('zip_code');

  return (
    <>
      <StepHeading
        title="Where do you live?"
        sub="Some of Portland's most valuable programs are housing-triggered."
      />
      <div
        className="grid"
        style={{ gridTemplateColumns: '180px 1fr', gap: 18, alignItems: 'start' }}
      >
        <Field label="ZIP code" error={errors.zip_code?.message}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            className="rc-input tabular"
            value={zip}
            onChange={(e) =>
              form.setValue('zip_code', e.target.value.replace(/\D/g, ''), {
                shouldValidate: true,
              })
            }
            placeholder="97218"
          />
        </Field>
        <Field label="Housing situation">
          <Controller
            control={form.control}
            name="housing_status"
            render={({ field }) => (
              <Choices
                value={field.value}
                onChange={field.onChange}
                columns={4}
                options={[
                  { value: 'rent', label: 'Renting' },
                  { value: 'own', label: 'Own home' },
                  { value: 'staying_with_others', label: 'With others' },
                  { value: 'unhoused', label: 'Unhoused' },
                ]}
              />
            )}
          />
        </Field>
      </div>
      {housing === 'rent' && (
        <div
          className="rc-card-soft rc-enter"
          style={{ padding: 22, marginTop: 8 }}
        >
          <div className="eyebrow mb-3" style={{ color: 'var(--rose)' }}>
            <Sparkles size={11} /> Two questions that unlock the hidden gems
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field
              label="Rent increase in the past 12 months"
              hint="Renters with increases over 10% in a year qualify for $2,900–$4,500 in relocation assistance."
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <Controller
                  control={form.control}
                  name="recent_rent_increase_pct"
                  render={({ field }) => (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                      className="rc-input tabular"
                      placeholder="0"
                      style={{ width: 100 }}
                    />
                  )}
                />
                <span style={{ color: 'var(--ink-3)' }}>%</span>
              </div>
            </Field>
            <Field label="Have you received an eviction notice?">
              <Controller
                control={form.control}
                name="received_eviction_notice"
                render={({ field }) => (
                  <YesNo value={!!field.value} onChange={field.onChange} />
                )}
              />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}

function AboutYou({ form }: { form: Form }) {
  return (
    <>
      <StepHeading
        title="A few more details."
        sub="These unlock programs many Portlanders don't know they qualify for."
      />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Field label="Anyone in your household have a disability?">
          <Controller
            control={form.control}
            name="has_disability"
            render={({ field }) => <YesNo value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Anyone a U.S. veteran?">
          <Controller
            control={form.control}
            name="is_veteran"
            render={({ field }) => <YesNo value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Anyone currently pregnant?">
          <Controller
            control={form.control}
            name="is_pregnant"
            render={({ field }) => <YesNo value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label="Anyone 60 or older?">
          <Controller
            control={form.control}
            name="has_senior_in_household"
            render={({ field }) => <YesNo value={field.value} onChange={field.onChange} />}
          />
        </Field>
      </div>
      <Field label="Primary language">
        <Controller
          control={form.control}
          name="primary_language"
          render={({ field }) => (
            <Choices
              value={field.value}
              onChange={field.onChange}
              columns={4}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'vi', label: 'Tiếng Việt' },
                { value: 'ru', label: 'Русский' },
                { value: 'zh', label: '中文' },
                { value: 'so', label: 'Soomaali' },
                { value: 'ar', label: 'العربية' },
              ]}
            />
          )}
        />
      </Field>
      <Field label="Citizenship status">
        <Controller
          control={form.control}
          name="citizenship"
          render={({ field }) => (
            <Choices
              value={field.value}
              onChange={field.onChange}
              columns={4}
              options={[
                { value: 'citizen', label: 'U.S. citizen' },
                { value: 'lpr', label: 'LPR' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_say', label: 'Prefer not to say' },
              ]}
            />
          )}
        />
      </Field>
    </>
  );
}

const HOUSING_LABEL: Record<FormValues['housing_status'], string> = {
  rent: 'Renting',
  own: 'Own home',
  staying_with_others: 'Staying with others',
  unhoused: 'Unhoused',
};

const EMPLOYMENT_LABEL: Record<FormValues['employment_status'], string> = {
  employed_ft: 'Employed full-time',
  employed_pt: 'Employed part-time',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
  disabled: 'On disability',
};

const LANG_LABEL: Record<FormValues['primary_language'], string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  zh: '中文',
  so: 'Soomaali',
  ar: 'العربية',
};

const CITIZENSHIP_LABEL: Record<FormValues['citizenship'], string> = {
  citizen: 'U.S. citizen',
  lpr: 'Lawful permanent resident',
  other: 'Other',
  prefer_not_say: 'Prefer not to say',
};

function Review({ values }: { values: FormValues }) {
  const lines: [string, string][] = [
    ['Household', `${values.household_size} people · ${values.num_children} children`],
    ['Annual income', `$${(values.annual_income || 0).toLocaleString()}`],
    ['Employment', EMPLOYMENT_LABEL[values.employment_status]],
    ['Location', `${values.zip_code || '—'} · ${HOUSING_LABEL[values.housing_status]}`],
    ['Language', LANG_LABEL[values.primary_language]],
    ['Citizenship', CITIZENSHIP_LABEL[values.citizenship]],
  ];
  if (values.housing_status === 'rent') {
    lines.push([
      'Rent change',
      `${values.recent_rent_increase_pct ?? 0}%${values.received_eviction_notice ? ' · eviction notice received' : ''}`,
    ]);
  }
  const flags: string[] = [];
  if (values.has_disability) flags.push('disability');
  if (values.is_veteran) flags.push('veteran');
  if (values.is_pregnant) flags.push('pregnant');
  if (values.has_senior_in_household) flags.push('senior in household');
  if (flags.length) lines.push(['Includes', flags.join(', ')]);

  return (
    <>
      <StepHeading
        title="Ready to find what you're owed."
        sub="We'll check all 20 federal, state, county, and Portland programs in about 5 seconds."
      />
      <div className="rc-card-flat" style={{ padding: '8px 0' }}>
        <dl style={{ margin: 0 }}>
          {lines.map(([k, v], i) => (
            <div
              key={k}
              className="flex items-baseline justify-between"
              style={{
                padding: '14px 24px',
                borderBottom: i < lines.length - 1 ? '1px solid var(--rule)' : '0',
                gap: 24,
              }}
            >
              <dt
                style={{
                  color: 'var(--ink-3)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}
              >
                {k}
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, textAlign: 'right' }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
