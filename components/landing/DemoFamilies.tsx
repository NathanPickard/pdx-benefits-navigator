import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { RoseStamp, SunBadge } from "@/components/brand/RoseStamp";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SCENARIO_SUMMARIES } from "@/components/landing/content";
import { formatUsd } from "@/lib/estimate";

export function DemoFamilies() {
  return (
    <section className="rc-container rc-section-pad">
      <SectionHeading
        kicker="Meet three Portland families"
        title="Same questions. Very different answers."
      >
        <span className="tag">Click any to see their full results</span>
      </SectionHeading>

      <div className="rc-cols-3">
        {SCENARIO_SUMMARIES.map((s) => (
          <Link
            key={s.slug}
            href={`/demo/${s.slug}`}
            className="rc-card group"
            style={{
              padding: 26,
              textAlign: "left",
              textDecoration: "none",
              color: "var(--ink)",
              display: "block",
              transition: "transform 0.2s, border-color 0.2s",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "1.6rem",
                    lineHeight: 1.05,
                    fontWeight: 500,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    color: "var(--ink-3)",
                    fontSize: "0.82rem",
                    marginTop: 3,
                  }}
                >
                  {s.zip}
                </div>
              </div>
              {s.accent === "rose" && <RoseStamp size={40} />}
              {s.accent === "moss" && (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: "var(--moss-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--moss-2)",
                  }}
                >
                  <Users size={18} />
                </div>
              )}
              {s.accent === "sun" && <SunBadge size={40} />}
            </div>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                margin: "0 0 18px",
              }}
            >
              {s.blurb}
            </p>
            <div className="rc-card-soft" style={{ padding: 14 }}>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="tag">Benefits found</div>
                  <div
                    className="tabular font-display"
                    style={{
                      fontSize: "1.85rem",
                      lineHeight: 1,
                      color: "var(--rose)",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {formatUsd(s.total)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="tag">Programs</div>
                  <div
                    className="tabular"
                    style={{
                      fontSize: "1.4rem",
                      color: "var(--moss-2)",
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {s.eligibleCount}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 mt-4"
              style={{
                fontSize: "0.86rem",
                color: "var(--ink-2)",
                fontWeight: 500,
              }}
            >
              <span>See {s.short}&rsquo;s full results</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
