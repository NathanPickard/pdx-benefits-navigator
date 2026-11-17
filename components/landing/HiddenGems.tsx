import { Sparkles } from "lucide-react";

import { JurisdictionPill } from "@/components/brand/JurisdictionPill";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { HIDDEN_GEM_HIGHLIGHTS } from "@/lib/hiddenGemHighlights";
import { HIDDEN_GEM_COUNT } from "@/lib/programs";

export function HiddenGems() {
  return (
    <section className="rc-container rc-section-pad">
      <SectionHeading
        kicker="The hidden gems"
        title="Programs Portland built — but most tools miss."
      >
        <p
          style={{
            maxWidth: 380,
            color: "var(--ink-3)",
            margin: 0,
            fontSize: "0.94rem",
          }}
        >
          Portland&rsquo;s {HIDDEN_GEM_COUNT} hidden-gem programs alone add{" "}
          <strong style={{ color: "var(--rose)" }}>
            $10–25K a year
          </strong>{" "}
          for the average family.
        </p>
      </SectionHeading>

      <div className="rc-cols-3">
        {HIDDEN_GEM_HIGHLIGHTS.map((g) => (
          <article key={g.programId} className="rc-card" style={{ padding: 24 }}>
            <div
              className="flex items-center justify-between mb-3 flex-wrap"
              style={{ gap: 6 }}
            >
              <JurisdictionPill jurisdiction={g.jurisdiction} />
              <span
                className="pill pill-sun"
                style={{ fontSize: "0.72rem" }}
              >
                <Sparkles size={11} /> Hidden gem
              </span>
            </div>
            <h3
              className="font-display"
              style={{
                fontSize: "1.3rem",
                lineHeight: 1.2,
                margin: "0 0 8px",
                fontWeight: 500,
                letterSpacing: "-0.015em",
              }}
            >
              {g.name}
            </h3>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "0.92rem",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {g.blurb}
            </p>
            <div className="divider my-4" />
            <div className="flex items-end justify-between">
              <span
                className="tabular"
                style={{
                  fontSize: "1.1rem",
                  color: "var(--rose)",
                  fontWeight: 600,
                }}
              >
                {g.value}
              </span>
              <span className="tag">per year</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
