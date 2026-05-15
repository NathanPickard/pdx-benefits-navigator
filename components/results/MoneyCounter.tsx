'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export function MoneyCounter({ value, duration = 2.5 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (v) => `$${Math.round(v).toLocaleString()}`);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [value, duration, count]);

  return (
    <motion.span className="text-7xl font-bold tabular-nums text-emerald-600 sm:text-8xl md:text-9xl">
      {formatted}
    </motion.span>
  );
}
