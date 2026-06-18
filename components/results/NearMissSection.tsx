'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';

import type { Chrome } from '@/lib/i18n';
import type { EligibilityRequirement, MatchResult, Program } from '@/types/program';

// TODO(phase-2 i18n): Near-miss section strings are English-only for now.
// Full i18n deferred to Phase 2 — see Chrome interface for the pattern.
const STRINGS = {
  headerLabel: 'Programs you just missed',
  headerSuffix: (n: number) => (n === 1 ? '1 program close but not yet qualifying' : `${n} programs close but not yet qualifying`),
  intro: "You're close on these programs. A small change in income, household size, or enrollment in another program could open the door.",
  fallbackReason: (reasoning: string) => firstSentence(reasoning),
  verifyNote: 'These are estimates — a caseworker may see options the tool missed.',
  referral211: 'Call 211 (Oregon 2-1-1) or visit 211info.org to connect with a navigator who can confirm your eligibility in person.',
  noReasonKnown: 'Specific reason not available — contact the program directly to ask.',
};

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

function failingReason(match: MatchResult): string {
  if (match.requirements?.length) {
    const failing = match.requirements.find(
      (r: EligibilityRequirement) => r.met === 'no'
    );
    if (failing) return failing.detail;
  }
  if (match.reasoning) return STRINGS.fallbackReason(match.reasoning);
  return STRINGS.noReasonKnown;
}

interface NearMissSectionProps {
  matches: MatchResult[];
  programById: Map<string, Program>;
  chrome: Chrome;
}

export function NearMissSection({ matches, programById }: NearMissSectionProps) {
  const [open, setOpen] = useState(false);

  // Caller (results/page.tsx) pre-filters to ineligible matches; map to programs here.
  const rows = matches
    .map((m) => ({ match: m, program: programById.get(m.program_id) }))
    .filter((r): r is { match: MatchResult; program: Program } => !!r.program);

  if (rows.length === 0) return null;

  return (
    <section
      className="rc-card mb-10"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--rule-2)',
        background: 'var(--paper-2)',
      }}
    >
      {/* Collapsible header */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(16px, 3vw, 22px) clamp(20px, 4vw, 28px)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow mb-1" style={{ color: 'var(--ink-3)' }}>
            {STRINGS.headerLabel}
          </div>
          <div
            className="font-display"
            style={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--ink-2)',
              letterSpacing: '-0.012em',
            }}
          >
            {STRINGS.headerSuffix(rows.length)}
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-3)',
          }}
          aria-hidden="true"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div
          style={{
            borderTop: '1px solid var(--rule)',
            padding: 'clamp(16px, 3vw, 22px) clamp(20px, 4vw, 28px)',
          }}
        >
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.94rem',
              color: 'var(--ink-2)',
              lineHeight: 1.55,
            }}
          >
            {STRINGS.intro}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map(({ match, program }) => (
              <div
                key={match.program_id}
                className="rc-card"
                style={{
                  padding: 'clamp(14px, 3vw, 18px) clamp(16px, 4vw, 22px)',
                  background: 'var(--paper)',
                  borderColor: 'var(--rule)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Program name */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div
                      className="font-display"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        letterSpacing: '-0.012em',
                        marginBottom: 6,
                        color: 'var(--ink)',
                      }}
                    >
                      {program.name}
                    </div>
                    {/* Failing reason */}
                    <div
                      style={{
                        borderLeft: '3px solid var(--rule-2)',
                        paddingLeft: 12,
                      }}
                    >
                      <div
                        className="eyebrow mb-1"
                        style={{ color: 'var(--ink-3)', fontSize: '0.7rem' }}
                      >
                        Why not yet
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.88rem',
                          color: 'var(--ink-2)',
                          lineHeight: 1.5,
                        }}
                      >
                        {failingReason(match)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reassurance footer */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.86rem',
                color: 'var(--ink-3)',
                lineHeight: 1.55,
              }}
            >
              {STRINGS.verifyNote}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: '0.86rem',
                color: 'var(--ink-2)',
                lineHeight: 1.55,
              }}
            >
              <Phone
                size={14}
                style={{ flexShrink: 0, marginTop: 2, color: 'var(--moss-2)' }}
              />
              <span>{STRINGS.referral211}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
