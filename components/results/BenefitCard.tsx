import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Phone,
  Sparkles,
} from 'lucide-react';

import { JurisdictionPill } from '@/components/brand/JurisdictionPill';
import type { AppStatus } from '@/lib/applicationStatus';
import type { Chrome } from '@/lib/i18n';
import type { MatchResult, Program } from '@/types/program';

const STATUS_OPTIONS: { value: AppStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'applied', label: 'Applied' },
];

const CONFIDENCE_DOT: Record<MatchResult['confidence'], string> = {
  high: 'var(--moss)',
  medium: 'var(--sun)',
  low: 'var(--ink-3)',
};

function confidenceLabel(level: MatchResult['confidence'], c: Chrome): string {
  switch (level) {
    case 'high':
      return c.confidenceHigh;
    case 'medium':
      return c.confidenceMedium;
    case 'low':
      return c.confidenceLow;
  }
}

const CATEGORY_LABEL: Record<Program['category'], string> = {
  food: 'Food',
  healthcare: 'Healthcare',
  housing: 'Housing',
  utility: 'Utility',
  childcare: 'Childcare',
  education: 'Education',
  tax: 'Tax',
  transportation: 'Transportation',
  cash: 'Cash',
  connectivity: 'Connectivity',
};

export function BenefitCard({
  match,
  program,
  chrome,
  status = 'not_started',
  onStatusChange,
  collapsed = false,
  onToggleCollapse,
}: {
  match: MatchResult;
  program: Program;
  chrome: Chrome;
  status?: AppStatus;
  onStatusChange?: (s: AppStatus) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const isApplied = status === 'applied';
  return (
    <article
      className="rc-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        opacity: isApplied ? 0.72 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <header
        className="rc-benefit-header"
        style={{ padding: 'clamp(20px, 4vw, 28px)', position: 'relative' }}
      >
        {/* Collapse toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand card' : 'Collapse card'}
            onClick={onToggleCollapse}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 28,
              height: 28,
              borderRadius: 999,
              border: '1px solid var(--rule-2)',
              background: 'var(--paper-2)',
              color: 'var(--ink-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <ChevronDown
              size={15}
              style={{
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3" style={{ paddingRight: onToggleCollapse ? 36 : 0 }}>
            <JurisdictionPill jurisdiction={program.jurisdiction} />
            {program.hidden_gem && (
              <span className="pill pill-sun">
                <Sparkles size={11} /> {chrome.hiddenGem}
              </span>
            )}
            {match.urgency_note && (
              <span className="pill pill-rose">
                <AlertTriangle size={11} /> Time-sensitive
              </span>
            )}
            <span className="pill pill-clay">{CATEGORY_LABEL[program.category]}</span>
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: '1.45rem',
              lineHeight: 1.15,
              margin: '0 0 12px',
              fontWeight: 500,
              letterSpacing: '-0.018em',
            }}
          >
            {program.name}
          </h3>
          <div
            className="rc-card-body"
            data-collapsed={collapsed ? 'true' : 'false'}
            style={{
              borderLeft: '3px solid var(--moss-soft)',
              paddingLeft: 14,
            }}
          >
            <div
              className="eyebrow mb-1"
              style={{ color: 'var(--moss-2)' }}
            >
              {chrome.whyYouQualify}
            </div>
            <p
              style={{
                margin: 0,
                color: 'var(--ink-2)',
                fontSize: '0.96rem',
                lineHeight: 1.55,
              }}
            >
              {match.reasoning}
            </p>
            {/* Per-requirement breakdown — only rendered when present (post-rebake fixtures).
                On eligible cards we show only met=yes and met=unknown rows.
                met=no rows are the near-miss domain and are not shown here.
                TODO(phase-2 i18n): eyebrow label is English-only */}
            {match.requirements && match.requirements.length > 0 && (
              <ul
                style={{
                  margin: '10px 0 0',
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                {match.requirements
                  .filter((r) => r.met === 'yes' || r.met === 'unknown')
                  .map((r, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 7,
                        fontSize: '0.82rem',
                        color: 'var(--ink-3)',
                        lineHeight: 1.45,
                      }}
                    >
                      {r.met === 'yes' ? (
                        <CheckCircle2
                          size={13}
                          style={{
                            flexShrink: 0,
                            marginTop: 2,
                            color: 'var(--moss)',
                          }}
                          aria-label="Met"
                        />
                      ) : (
                        <HelpCircle
                          size={13}
                          style={{
                            flexShrink: 0,
                            marginTop: 2,
                            color: 'var(--sun)',
                          }}
                          aria-label="Unknown"
                        />
                      )}
                      <span>{r.detail}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right" style={{ minWidth: 130 }}>
          <div
            className="font-display tabular"
            style={{
              fontSize: '2.1rem',
              lineHeight: 1,
              color: 'var(--ink)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            ${match.estimated_annual_value.toLocaleString()}
          </div>
          <div className="tag mt-1">{chrome.estimatedYear}</div>
          <div
            className="flex items-center justify-start sm:justify-end gap-1.5 mt-3"
            style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: CONFIDENCE_DOT[match.confidence],
              }}
            />
            {confidenceLabel(match.confidence, chrome)}
          </div>

          {/* Status control — always visible in header so user can track
              application status without needing to expand the card */}
          <div style={{ marginTop: 14 }}>
            <div
              className="eyebrow mb-2"
              style={{ color: 'var(--ink-3)', fontSize: '0.72rem' }}
              id={`status-label-${match.program_id}`}
            >
              My status
            </div>
            <div
              role="group"
              aria-labelledby={`status-label-${match.program_id}`}
              className="flex"
              style={{
                border: '1px solid var(--rule-2)',
                borderRadius: 999,
                padding: 3,
                background: 'var(--paper)',
                gap: 2,
              }}
            >
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onStatusChange?.(opt.value)}
                    style={{
                      flex: 1,
                      padding: '5px 6px',
                      borderRadius: 999,
                      fontSize: '0.69rem',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      background: active
                        ? opt.value === 'applied'
                          ? 'var(--moss-soft)'
                          : 'var(--card-rose)'
                        : 'transparent',
                      color: active
                        ? opt.value === 'applied'
                          ? 'var(--moss-2)'
                          : 'var(--ink)'
                        : 'var(--ink-3)',
                      border: 0,
                      cursor: active ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.15s, color 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div
        className="rc-card-body"
        data-collapsed={collapsed ? 'true' : 'false'}
        style={{
          paddingLeft: 'clamp(20px, 4vw, 28px)',
          paddingRight: 'clamp(20px, 4vw, 28px)',
          paddingBottom: 'clamp(20px, 4vw, 26px)',
          borderTop: '1px solid var(--rule)',
        }}
      >
          <div
            className="rc-benefit-detail"
            style={{ paddingTop: 22 }}
          >
            <div>
              {match.next_steps?.length > 0 && (
                <>
                  <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
                    {chrome.nextSteps}
                  </div>
                  <ol
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {match.next_steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex"
                        style={{ gap: 12, fontSize: '0.94rem', lineHeight: 1.55 }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            background: 'var(--rose-soft)',
                            color: 'var(--rose)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ paddingTop: 3 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {match.required_documents?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
                    {chrome.whatToBring}
                  </div>
                  <div className="flex flex-wrap" style={{ gap: 8 }}>
                    {match.required_documents.map((d, i) => (
                      <span
                        key={i}
                        className="pill pill-clay"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <FileText size={12} /> {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside
              style={{
                background: 'var(--paper-2)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid var(--rule)',
              }}
            >
              <div className="eyebrow mb-3" style={{ color: 'var(--moss-2)' }}>
                About this program
              </div>
              <div
                className="grid"
                style={{ gap: 12, fontSize: '0.9rem' }}
              >
                {program.contact_org && <MetaRow label="Run by" value={program.contact_org} />}
                {program.contact_phone && (
                  <MetaRow label="Call" value={program.contact_phone} icon="phone" />
                )}
                {program.processing_time && (
                  <MetaRow label="Decision" value={program.processing_time} icon="clock" />
                )}
                {program.renewal_cycle && (
                  <MetaRow label="Renews" value={program.renewal_cycle} icon="calendar" />
                )}
                {program.legal_basis && (
                  <MetaRow label="Legal basis" value={program.legal_basis} />
                )}
              </div>
              {program.source_url && (
                <a href={program.source_url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-[var(--ink-3)]">
                  Verified per official source
                </a>
              )}
              <a
                href={program.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rc-btn rc-btn-rose"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 16,
                }}
              >
                {chrome.applyNow} <ExternalLink size={13} />
              </a>
            </aside>
          </div>
      </div>
    </article>
  );
}

function MetaRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: 'phone' | 'clock' | 'calendar';
}) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
      <div className="flex items-center gap-1.5 tag">
        {icon === 'phone' && <Phone size={12} />}
        {icon === 'clock' && <Clock size={12} />}
        {icon === 'calendar' && <Calendar size={12} />}
        {label}
      </div>
      <div
        style={{
          textAlign: 'right',
          fontSize: '0.88rem',
          color: 'var(--ink-2)',
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
