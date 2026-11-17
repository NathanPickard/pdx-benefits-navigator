import type { CSSProperties, ReactNode } from 'react';

/* ─────────────────────── Atoms ─────────────────────── */

export function StepHeading({ title, sub }: { title: string; sub?: string }) {
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

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
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

export function Choices<T extends string>({
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
  // mobile: 2 cols max; desktop: requested column count
  const gridClass =
    columns === 4
      ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5'
      : columns === 3
        ? 'grid grid-cols-2 sm:grid-cols-3 gap-2.5'
        : 'grid grid-cols-2 gap-2.5';
  return (
    <div className={gridClass}>
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

export function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

export function NumStepper({
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
  const btn: CSSProperties = {
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
