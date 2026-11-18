import { RoseStamp } from '@/components/brand/RoseStamp';
import { formatUsd } from '@/lib/estimate';
import type { IntakeData } from '@/types/program';

const HOUSING_LABEL: Record<IntakeData['housing_status'], string> = {
  rent: 'Renting',
  own: 'Own home',
  staying_with_others: 'With others',
  unhoused: 'Unhoused',
};

const EMPLOYMENT_LABEL: Record<IntakeData['employment_status'], string> = {
  employed_ft: 'Full-time',
  employed_pt: 'Part-time',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
  disabled: 'On disability',
};

const LANG_LABEL: Record<IntakeData['primary_language'], string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  zh: '中文',
  so: 'Soomaali',
  ar: 'العربية',
};

export function HouseholdSummary({ intake }: { intake: IntakeData }) {
  return (
    <aside className="rc-card" style={{ padding: 24 }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div
            className="font-display"
            style={{
              fontSize: '1.55rem',
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: '-0.015em',
            }}
          >
            Your household
          </div>
          <div className="tag mt-1">{intake.zip_code || '—'}</div>
        </div>
        <RoseStamp size={48} />
      </div>
      <div className="divider mb-3" />
      <div
        className="grid"
        style={{
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          fontSize: '0.86rem',
        }}
      >
        <KV k="Household" v={`${intake.household_size} people`} />
        <KV k="Children" v={String(intake.num_children)} />
        <KV
          k="Income"
          v={formatUsd(intake.annual_income || 0)}
        />
        <KV k="Housing" v={HOUSING_LABEL[intake.housing_status]} />
        <KV k="Language" v={LANG_LABEL[intake.primary_language]} />
        <KV
          k="Employment"
          v={EMPLOYMENT_LABEL[intake.employment_status]}
        />
      </div>
    </aside>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tag" style={{ fontWeight: 500 }}>
        {k}
      </div>
      <div style={{ fontWeight: 600, marginTop: 2 }}>{v}</div>
    </div>
  );
}
