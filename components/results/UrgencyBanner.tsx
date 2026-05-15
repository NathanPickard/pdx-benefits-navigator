'use client';

import { AlertTriangle } from 'lucide-react';

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

  return (
    <section
      role="alert"
      className="rc-card"
      style={{
        padding: '22px 24px',
        borderColor: isCritical ? 'var(--rose)' : 'oklch(0.86 0.07 75)',
        background: isCritical ? 'var(--rose-soft)' : 'var(--sun-soft)',
        borderWidth: 2,
        borderRadius: 18,
        marginBottom: 40,
      }}
    >
      <div className="flex items-start" style={{ gap: 16 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isCritical ? 'var(--rose)' : 'var(--sun)',
            color: isCritical ? 'oklch(0.98 0.01 30)' : 'oklch(0.32 0.06 70)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} strokeWidth={2.2} />
        </span>
        <div>
          <div
            className="eyebrow mb-1"
            style={{
              color: isCritical ? 'var(--rose)' : 'oklch(0.42 0.12 70)',
            }}
          >
            {isCritical ? 'Time-critical · today' : 'Time-sensitive · this week'}
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: '1.3rem',
              margin: '0 0 6px',
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: '-0.015em',
            }}
          >
            {event.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.94rem',
              lineHeight: 1.55,
              color: 'var(--ink-2)',
            }}
          >
            {event.body}
          </p>
        </div>
      </div>
    </section>
  );
}
