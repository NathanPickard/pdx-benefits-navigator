import { Controller, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import { Sparkles } from 'lucide-react';

import { fplFor } from '@/lib/fpl';
import { formatUsd } from '@/lib/estimate';
import { PROGRAM_COUNT } from '@/lib/programs';
import type { IntakeSchema } from '@/lib/intakeSchema';

import { Choices, Field, NumStepper, StepHeading, YesNo } from './fields';

export type FormValues = z.infer<typeof IntakeSchema>;
type Form = UseFormReturn<FormValues>;

/* ─────────────────────── Step bodies ─────────────────────── */

export function Household({ form }: { form: Form }) {
  const num_children = form.watch('num_children');
  const children_ages = form.watch('children_ages') ?? [];

  return (
    <>
      <StepHeading
        title="Who's in your household?"
        sub="We use this for programs that depend on household size."
      />
      <div className="rc-cols-2">
        <Field label="People in your household">
          <Controller
            control={form.control}
            name="household_size"
            render={({ field }) => (
              <NumStepper
                value={field.value}
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
                value={field.value}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

export function Income({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const annual_income = form.watch('annual_income') ?? 0;
  const household_size = form.watch('household_size') ?? 1;

  const pctFpl = Math.round((annual_income / fplFor(household_size)) * 100);

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

export function Housing({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const housing = form.watch('housing_status');
  const zip = form.watch('zip_code');

  return (
    <>
      <StepHeading
        title="Where do you live?"
        sub="Some of Portland's most valuable programs are housing-triggered."
      />
      <div className="rc-housing-grid">
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
          <div className="rc-cols-2">
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

export function AboutYou({ form }: { form: Form }) {
  return (
    <>
      <StepHeading
        title="A few more details."
        sub="These unlock programs many Portlanders don't know they qualify for."
      />
      <div className="rc-cols-2">
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

export function Review({ values }: { values: FormValues }) {
  const lines: [string, string][] = [
    ['Household', `${values.household_size} people · ${values.num_children} children`],
    ['Annual income', formatUsd(values.annual_income || 0)],
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
        sub={`We'll check all ${PROGRAM_COUNT} federal, state, county, and Portland programs. The analysis can take a few minutes.`}
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
