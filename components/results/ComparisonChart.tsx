'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function ComparisonChart({
  federal,
  total,
  title,
  subtitle,
  federalLabel,
  pdxLabel,
  missLabel,
}: {
  federal: number;
  total: number;
  title: string;
  subtitle: string;
  federalLabel: string;
  pdxLabel: string;
  missLabel: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  // animatedState flips true after the 180ms paint delay for the bar growth animation.
  // When reduce-motion is preferred, we derive animated=true immediately from the hook
  // without a synchronous setState call inside the effect body.
  const [animatedState, setAnimatedState] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedState(true), 180);
    return () => clearTimeout(t);
  }, []);
  // Bars are at final width immediately when user prefers reduced motion
  const animated = !!shouldReduceMotion || animatedState;

  const delta = total - federal;
  const max = Math.max(total, 1);
  const federalPct = (federal / max) * 100;
  const upliftPct = federal > 0 ? Math.round((delta / federal) * 100) : 0;

  return (
    <section
      className="rc-card"
      style={{
        padding: 'clamp(22px, 4vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 40,
      }}
    >
      <div className="flex items-end justify-between mb-6 flex-wrap" style={{ gap: 12 }}>
        <div>
          <div className="eyebrow mb-2" style={{ color: 'var(--moss-2)' }}>
            {title}
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: '1.65rem',
              lineHeight: 1.15,
              margin: 0,
              fontWeight: 500,
              letterSpacing: '-0.018em',
            }}
          >
            {subtitle}
          </h3>
        </div>
        <div className="pill pill-rose" style={{ fontSize: '0.86rem', padding: '8px 14px' }}>
          <ArrowRight size={13} />
          <span className="tabular" style={{ fontWeight: 700 }}>
            +${delta.toLocaleString()}
          </span>
          <span>{missLabel}</span>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 20 }}>
        <BarRow
          label={federalLabel}
          value={federal}
          widthPct={federalPct}
          color="var(--ink-3)"
          animated={animated}
          delay={120}
          reduceMotion={!!shouldReduceMotion}
        />
        <BarRow
          label={pdxLabel}
          value={total}
          widthPct={100}
          color="var(--rose)"
          animated={animated}
          delay={500}
          highlight
          reduceMotion={!!shouldReduceMotion}
        />
      </div>

      <div className="rc-mini-row">
        <Mini label="Federal-only finds" value={`$${federal.toLocaleString()}`} sub="the national tools" />
        <Mini
          label="Hyperlocal delta"
          value={`+$${delta.toLocaleString()}`}
          sub="what we add on top"
          tone="rose"
        />
        <Mini
          label="Total uplift"
          value={federal > 0 ? `+${upliftPct}%` : '—'}
          sub="more for your household"
          tone="moss"
        />
      </div>
    </section>
  );
}

function BarRow({
  label,
  value,
  widthPct,
  color,
  animated,
  delay,
  highlight,
  reduceMotion,
}: {
  label: string;
  value: number;
  widthPct: number;
  color: string;
  animated: boolean;
  delay: number;
  highlight?: boolean;
  reduceMotion?: boolean;
}) {
  return (
    <div>
      <div
        className="flex items-baseline justify-between mb-2 flex-wrap"
        style={{ gap: 12 }}
      >
        <span
          style={{
            fontWeight: highlight ? 600 : 500,
            color: highlight ? 'var(--ink)' : 'var(--ink-2)',
            fontSize: '0.94rem',
          }}
        >
          {label}
        </span>
        <span
          className="font-display tabular"
          style={{ fontSize: '1.45rem', color, fontWeight: 500 }}
        >
          ${value.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          height: 18,
          borderRadius: 999,
          background: 'var(--paper-2)',
          overflow: 'hidden',
          border: '1px solid var(--rule)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: animated ? `${widthPct}%` : '0%',
            background: color,
            transition: reduceMotion ? 'none' : `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'rose' | 'moss';
}) {
  const color =
    tone === 'rose' ? 'var(--rose)' : tone === 'moss' ? 'var(--moss-2)' : 'var(--ink)';
  return (
    <div>
      <div className="tag" style={{ fontWeight: 500 }}>
        {label}
      </div>
      <div
        className="font-display tabular"
        style={{
          fontSize: '1.85rem',
          lineHeight: 1.05,
          color,
          marginTop: 4,
          fontWeight: 500,
          letterSpacing: '-0.018em',
        }}
      >
        {value}
      </div>
      <div style={{ color: 'var(--ink-3)', fontSize: '0.84rem', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
