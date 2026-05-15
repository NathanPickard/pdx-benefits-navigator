'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export function StatReveal({
  target,
  decimals = 1,
  prefix = '',
  suffix = '',
  duration = 2.5,
  className,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (v) => {
    const num = decimals === 0 ? Math.round(v).toLocaleString() : v.toFixed(decimals);
    return `${prefix}${num}${suffix ? ` ${suffix}` : ''}`;
  });

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span className={className}>{formatted}</motion.span>;
}
