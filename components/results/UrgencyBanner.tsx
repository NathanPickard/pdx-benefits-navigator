'use client';

import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle } from 'lucide-react';

import type { Chrome } from '@/lib/i18n';
import type { IntakeData } from '@/types/program';

type Severity = 'critical' | 'high';

interface UrgentEvent {
  severity: Severity;
  title: string;
  body: string;
}

function detectUrgentEvent(intake: IntakeData, chrome: Chrome): UrgentEvent | null {
  if (intake.received_eviction_notice) {
    return {
      severity: 'critical',
      title: chrome.urgencyEvictionTitle,
      body: chrome.urgencyEvictionBody,
    };
  }
  if ((intake.recent_rent_increase_pct ?? 0) >= 10) {
    return {
      severity: 'high',
      title: chrome.urgencyRentIncreaseTitle,
      body: chrome.urgencyRentIncreaseBodyTemplate.replace(
        '{pct}',
        String(intake.recent_rent_increase_pct ?? 0)
      ),
    };
  }
  return null;
}

export function UrgencyBanner({
  intake,
  chrome,
}: {
  intake: IntakeData;
  chrome: Chrome;
}) {
  const event = detectUrgentEvent(intake, chrome);
  if (!event) return null;

  const isCritical = event.severity === 'critical';
  const Icon = isCritical ? AlertOctagon : AlertTriangle;

  return (
    <motion.aside
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className={
        isCritical
          ? 'flex items-start gap-3 rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-950 shadow-sm'
          : 'flex items-start gap-3 rounded-lg border-2 border-amber-500 bg-amber-50 p-4 text-amber-950 shadow-sm'
      }
    >
      <Icon
        className={
          isCritical
            ? 'mt-0.5 h-5 w-5 shrink-0 text-red-600'
            : 'mt-0.5 h-5 w-5 shrink-0 text-amber-600'
        }
      />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider">{event.title}</h2>
        <p className="text-sm leading-relaxed">{event.body}</p>
      </div>
    </motion.aside>
  );
}
