export function ProgressBar({ applied, total }: { applied: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((applied / total) * 100);

  return (
    <div
      style={{
        background: 'var(--paper-2)',
        border: '1px solid var(--rule)',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 20,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8, gap: 8 }}
      >
        <span
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--ink-2)',
          }}
        >
          Application progress
        </span>
        <span
          className="tag tabular"
          style={{ color: applied === total ? 'var(--moss-2)' : 'var(--ink-3)' }}
        >
          {applied} of {total} applied
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={applied}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${applied} of ${total} programs applied for`}
        style={{
          height: 7,
          borderRadius: 999,
          background: 'var(--rule-2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: applied === total ? 'var(--moss)' : 'var(--rose)',
            borderRadius: 999,
            transition: 'width 0.35s ease-out',
          }}
        />
      </div>
    </div>
  );
}
