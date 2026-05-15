'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export function MoneyCounter({
  value,
  duration = 2.2,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, count]);

  return (
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
  );
}
