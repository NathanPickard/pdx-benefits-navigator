'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';

import type { Chrome } from '@/lib/i18n';
import type { EligibilityRequirement, MatchResult, Program } from '@/types/program';


function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

function failingReason(match: MatchResult, noReasonKnown: string): string {
  if (match.requirements?.length) {
    const failing = match.requirements.find(
      (r: EligibilityRequirement) => r.met === 'no'
    );
    if (failing) return failing.detail;
  }
  if (match.reasoning) return firstSentence(match.reasoning);
  return noReasonKnown;
}

interface NearMissSectionProps {
  matches: MatchResult[];
  programById: Map<string, Program>;
  chrome: Chrome;
}

export function NearMissSection({ matches, programById, chrome }: NearMissSectionProps) {
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
            {chrome.nearMissHeaderLabel}
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
            {rows.length === 1
              ? chrome.nearMissSuffixSingular
              : chrome.nearMissSuffixTemplate.replace('{count}', String(rows.length))}
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
            {chrome.nearMissIntro}
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
                        {chrome.nearMissWhyNotYet}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.88rem',
                          color: 'var(--ink-2)',
                          lineHeight: 1.5,
                        }}
                      >
                        {failingReason(match, chrome.nearMissNoReasonKnown)}
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
              {chrome.nearMissVerifyNote}
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
              <span>{chrome.nearMissReferral211}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
