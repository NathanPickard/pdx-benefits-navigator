import type { Chrome } from '@/lib/i18n';
import type { Program } from '@/types/program';

const CATEGORY_LABEL: Record<Program['category'], string> = {
  food: 'Food',
  healthcare: 'Healthcare',
  housing: 'Housing',
  utility: 'Utility',
  childcare: 'Childcare',
  education: 'Education',
  tax: 'Tax',
  transportation: 'Transportation',
  cash: 'Cash',
  connectivity: 'Connectivity',
};

const JURISDICTION_LABEL: Record<Program['jurisdiction'], string> = {
  federal: 'Federal',
  oregon: 'Oregon',
  multnomah: 'Multnomah Co.',
  portland: 'Portland',
};

export function FilterChips({
  rows,
  activeCategory,
  activeJurisdiction,
  onCategory,
  onJurisdiction,
  chrome,
}: {
  rows: { program: Program }[];
  activeCategory: Program['category'] | null;
  activeJurisdiction: Program['jurisdiction'] | null;
  onCategory: (v: Program['category'] | null) => void;
  onJurisdiction: (v: Program['jurisdiction'] | null) => void;
  chrome: Chrome;
}) {
  // Derive distinct values present in the eligible set (preserve insertion order,
  // deduplicated via Set iteration).
  const categories = Array.from(
    new Set(rows.map((r) => r.program.category))
  ) as Program['category'][];

  const jurisdictions = Array.from(
    new Set(rows.map((r) => r.program.jurisdiction))
  ) as Program['jurisdiction'][];

  if (categories.length <= 1 && jurisdictions.length <= 1) {
    // Only one value in each dimension — chips would be noise, skip them.
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 12,
      }}
      aria-label="Filter benefits"
    >
      {categories.length > 1 && (
        <ChipRow
          label={chrome.filterCategory}
          allLabel={chrome.filterAll}
          options={categories.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
          active={activeCategory}
          onSelect={(v) => onCategory(v as Program['category'] | null)}
        />
      )}
      {jurisdictions.length > 1 && (
        <ChipRow
          label={chrome.filterJurisdiction}
          allLabel={chrome.filterAll}
          options={jurisdictions.map((j) => ({ value: j, label: JURISDICTION_LABEL[j] }))}
          active={activeJurisdiction}
          onSelect={(v) => onJurisdiction(v as Program['jurisdiction'] | null)}
        />
      )}
    </div>
  );
}

function ChipRow({
  label,
  allLabel,
  options,
  active,
  onSelect,
}: {
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
  active: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
      <span
        className="tag"
        style={{ marginRight: 2, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}
      >
        {label}:
      </span>
      <Chip label={allLabel} active={active === null} onClick={() => onSelect(null)} />
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          active={active === opt.value}
          onClick={() => onSelect(active === opt.value ? null : opt.value)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: '0.76rem',
        fontWeight: 600,
        border: active ? '1.5px solid var(--rose)' : '1.5px solid var(--rule-2)',
        background: active ? 'var(--card-rose)' : 'var(--paper-2)',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
      }}
    >
      {label}
    </button>
  );
}
