'use client';

import { motion } from 'framer-motion';
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
  const delta = total - federal;
  const max = Math.max(total, 1);
  const federalPct = (federal / max) * 100;

  return (
    <section className="flex flex-col gap-5 rounded-lg border bg-card p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="flex flex-col gap-4">
        <BarRow
          label={federalLabel}
          value={federal}
          widthPct={federalPct}
          colorClass="bg-zinc-300 dark:bg-zinc-700"
          textClass="text-zinc-700 dark:text-zinc-300"
          delay={0.1}
        />
        <BarRow
          label={pdxLabel}
          value={total}
          widthPct={100}
          colorClass="bg-emerald-500"
          textClass="text-emerald-700"
          delay={0.35}
          highlight
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.6 }}
        className="flex items-center gap-2 self-end rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
      >
        <ArrowRight className="h-4 w-4" />
        <span className="tabular-nums">+${delta.toLocaleString()}</span>
        <span className="text-emerald-700/80">{missLabel}</span>
      </motion.div>
    </section>
  );
}

function BarRow({
  label,
  value,
  widthPct,
  colorClass,
  textClass,
  delay,
  highlight,
}: {
  label: string;
  value: number;
  widthPct: number;
  colorClass: string;
  textClass: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className={highlight ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
        <span className={`font-semibold tabular-nums ${textClass}`}>
          ${value.toLocaleString()}
        </span>
      </div>
      <div className="h-6 overflow-hidden rounded-md bg-muted/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          className={`h-full rounded-md ${colorClass}`}
        />
      </div>
    </div>
  );
}
