'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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
    const intake: IntakeData = values as IntakeData;
    sessionStorage.setItem('pdx_intake', JSON.stringify(intake));
    router.push('/results');
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span>~3 minutes</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            {step === 0 && <HouseholdStep form={form} />}
            {step === 1 && <IncomeStep form={form} />}
            {step === 2 && <HousingStep form={form} />}
            {step === 3 && <AboutYouStep form={form} />}
            {step === 4 && <ReviewStep values={form.getValues()} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              <Sparkles className="mr-2 h-4 w-4" />
              {submitting ? 'Analyzing…' : 'Find my benefits'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

type Form = ReturnType<typeof useForm<FormValues>>;

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div className={cn('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left text-sm transition-colors',
              selected
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:bg-muted'
            )}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.hint && (
              <span className={cn('text-xs', selected ? 'opacity-80' : 'text-muted-foreground')}>
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <ChoiceGroup<'yes' | 'no'>
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  );
}

function HouseholdStep({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const numChildren = form.watch('num_children');
  const childrenAges = form.watch('children_ages') ?? [];

  const setChildAge = (idx: number, age: number) => {
    const next = [...childrenAges];
    next[idx] = age;
    form.setValue('children_ages', next, { shouldValidate: true });
  };

  return (
    <>
      <StepHeading
        title="Who's in your household?"
        subtitle="We use this to check programs that depend on household size."
      />
      <Field
        label="How many people live in your household?"
        htmlFor="household_size"
        error={errors.household_size?.message}
      >
        <NumberField id="household_size" register={form.register} name="household_size" min={1} />
      </Field>
      <Field
        label="How many of them are children under 18?"
        htmlFor="num_children"
        error={errors.num_children?.message}
      >
        <NumberField
          id="num_children"
          register={form.register}
          name="num_children"
          min={0}
          onChange={(n) => {
            const arr = Array.from({ length: n }, (_, i) => childrenAges[i] ?? 0);
            form.setValue('children_ages', arr);
          }}
        />
      </Field>
      {numChildren > 0 && (
        <Field label="Ages of children">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: numChildren }).map((_, i) => (
              <Input
                key={i}
                type="number"
                min={0}
                max={17}
                placeholder={`Child ${i + 1}`}
                value={childrenAges[i] ?? ''}
                onChange={(e) => setChildAge(i, Number(e.target.value))}
              />
            ))}
          </div>
        </Field>
      )}
    </>
  );
}

function IncomeStep({ form }: { form: Form }) {
  const errors = form.formState.errors;
  return (
    <>
      <StepHeading
        title="Tell us about your income"
        subtitle="Most benefits use total household income — pre-tax, all earners combined."
      />
      <Field
        label="Total household annual income (USD)"
        htmlFor="annual_income"
        hint="Best estimate of gross income from all sources for the year."
        error={errors.annual_income?.message}
      >
        <NumberField
          id="annual_income"
          register={form.register}
          name="annual_income"
          min={0}
          step={500}
        />
      </Field>
      <Field label="What's your employment situation?" error={errors.employment_status?.message}>
        <Controller
          control={form.control}
          name="employment_status"
          render={({ field }) => (
            <ChoiceGroup
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'employed_ft', label: 'Employed full-time' },
                { value: 'employed_pt', label: 'Employed part-time' },
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

function HousingStep({ form }: { form: Form }) {
  const errors = form.formState.errors;
  const housing = form.watch('housing_status');
  return (
    <>
      <StepHeading
        title="Where do you live?"
        subtitle="Some of Portland's most valuable programs are housing-triggered."
      />
      <Field label="ZIP code" htmlFor="zip_code" error={errors.zip_code?.message}>
        <Input id="zip_code" inputMode="numeric" maxLength={5} {...form.register('zip_code')} />
      </Field>
      <Field label="Housing situation" error={errors.housing_status?.message}>
        <Controller
          control={form.control}
          name="housing_status"
          render={({ field }) => (
            <ChoiceGroup
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'rent', label: 'Renting' },
                { value: 'own', label: 'Own my home' },
                { value: 'staying_with_others', label: 'Staying with others' },
                { value: 'unhoused', label: 'Unhoused' },
              ]}
            />
          )}
        />
      </Field>
      {housing === 'rent' && (
        <>
          <Field
            label="Rent increase in the past 12 months (%)"
            htmlFor="recent_rent_increase_pct"
            hint="Portland renters with increases >10% may qualify for $2,900–$4,500 in relocation assistance."
            error={errors.recent_rent_increase_pct?.message}
          >
            <NumberField
              id="recent_rent_increase_pct"
              register={form.register}
              name="recent_rent_increase_pct"
              min={0}
              max={100}
            />
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
        </>
      )}
    </>
  );
}

function AboutYouStep({ form }: { form: Form }) {
  const errors = form.formState.errors;
  return (
    <>
      <StepHeading
        title="A few more details"
        subtitle="These unlock programs many Portlanders don't know they qualify for."
      />
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
      <Field label="Primary language" error={errors.primary_language?.message}>
        <Controller
          control={form.control}
          name="primary_language"
          render={({ field }) => (
            <ChoiceGroup
              value={field.value}
              onChange={field.onChange}
              columns={3}
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
      <Field label="Citizenship status" error={errors.citizenship?.message}>
        <Controller
          control={form.control}
          name="citizenship"
          render={({ field }) => (
            <ChoiceGroup
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'citizen', label: 'U.S. citizen' },
                { value: 'lpr', label: 'Lawful permanent resident' },
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

function ReviewStep({ values }: { values: FormValues }) {
  const lines: [string, string][] = [
    ['Household', `${values.household_size} people, ${values.num_children} children`],
    ['Annual income', `$${values.annual_income.toLocaleString()}`],
    ['Employment', values.employment_status.replace(/_/g, ' ')],
    ['ZIP / Housing', `${values.zip_code} · ${values.housing_status.replace(/_/g, ' ')}`],
    ['Language', values.primary_language.toUpperCase()],
    ['Citizenship', values.citizenship.replace(/_/g, ' ')],
  ];
  if (values.housing_status === 'rent') {
    lines.push([
      'Rent change',
      `${values.recent_rent_increase_pct ?? 0}%${values.received_eviction_notice ? ' · eviction notice' : ''}`,
    ]);
  }
  const flags: string[] = [];
  if (values.has_disability) flags.push('disability');
  if (values.is_veteran) flags.push('veteran');
  if (values.is_pregnant) flags.push('pregnant');
  if (values.has_senior_in_household) flags.push('senior in household');
  if (flags.length) lines.push(['Household includes', flags.join(', ')]);

  return (
    <>
      <StepHeading
        title="Ready to find what you're owed."
        subtitle="We'll check all 20 federal, state, county, and Portland programs in about 5 seconds."
      />
      <div className="rounded-lg border bg-muted/30 p-4">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {lines.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border/40 py-2 last:border-0 sm:border-0 sm:py-1">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-xs text-muted-foreground">
        Nothing is stored. Your answers stay in this browser session.
      </p>
    </>
  );
}

function NumberField({
  id,
  register,
  name,
  min,
  max,
  step,
  onChange,
}: {
  id?: string;
  register: UseFormRegister<FormValues>;
  name: keyof FormValues;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (n: number) => void;
}) {
  const props = register(name, { valueAsNumber: true });
  return (
    <Input
      id={id}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      {...props}
      onChange={(e) => {
        props.onChange(e);
        if (onChange) onChange(Number(e.target.value) || 0);
      }}
    />
  );
}

