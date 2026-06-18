'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export function MoneyCounter({
  value,
  duration = 2.2,
  className,
  low,
  high,
}: {
  value: number;
  duration?: number;
  className?: string;
  low?: number;
  high?: number;
}) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, count]);

  const showBand = typeof low === 'number' && typeof high === 'number' && high > low;

  return (
    <div>
      <h1
        className={`font-display tabular ${className ?? ''}`}
        style={{
          fontSize: 'clamp(4rem, 10vw, 8.5rem)',
          lineHeight: 0.95,
          margin: 0,
          color: 'var(--ink)',
          letterSpacing: '-0.025em',
          fontWeight: 500,
        }}
      >
        <span style={{ color: 'var(--rose)' }}>$</span>
        <motion.span>{formatted}</motion.span>
      </h1>
      {showBand && (
        <p
          style={{
            marginTop: 8,
            fontSize: '0.88rem',
            color: 'var(--ink-3)',
            letterSpacing: '0.01em',
          }}
        >
          Estimated range ${(low as number).toLocaleString()} – ${(high as number).toLocaleString()} / year
        </p>
      )}
    </div>
  );
}
