'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

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
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const formatted = useTransform(count, (v) => {
    const num = decimals === 0 ? Math.round(v).toLocaleString() : v.toFixed(decimals);
    return `${prefix}${num}${suffix ? ` ${suffix}` : ''}`;
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      // Skip animation — jump straight to final value
      count.set(target);
      return;
    }
    const controls = animate(count, target, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [target, duration, count, shouldReduceMotion]);

  return <motion.span className={className}>{formatted}</motion.span>;
}
