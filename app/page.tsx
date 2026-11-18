import Link from "next/link";
import { ArrowRight, Check, Heart, Play, Sparkles } from "lucide-react";

import { AppBar } from "@/components/brand/AppBar";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { RoseStamp, SoftBlobs } from "@/components/brand/RoseStamp";
import { DemoFamilies } from "@/components/landing/DemoFamilies";
import { HiddenGems } from "@/components/landing/HiddenGems";
import { StatReveal } from "@/components/landing/StatReveal";
import {
  MARIA_ELIGIBLE,
  MARIA_FEDERAL,
  MARIA_TOTAL,
} from "@/components/landing/content";
import { formatUsd } from "@/lib/estimate";
import { HIDDEN_GEM_COUNT, PROGRAM_COUNT } from "@/lib/programs";
import { MARQUEE_ITEMS } from "@/lib/hiddenGemHighlights";

const STEP_TONES = {
  rose: { bg: "var(--rose-soft)", text: "oklch(0.40 0.10 150)" },
  moss: { bg: "var(--moss-soft)", text: "var(--moss-2)" },
  sun: { bg: "var(--sun-soft)", text: "oklch(0.46 0.12 65)" },
} as const;

export default function HomePage() {
  return (
    <>
      <AppBar />
      <main className="w-full" style={{ paddingBottom: 96 }}>
        {/* ─────────────────────── Hero ─────────────────────── */}
        <section style={{ position: "relative", overflow: "hidden" }}>
          <SoftBlobs />

          <div
            className="rc-container rc-hero-pad"
            style={{ position: "relative" }}
          >
            <div className="rc-hero-grid">
              <div className="rc-enter">
                <div className="flex items-center gap-2 mb-7 flex-wrap">
                  <span className="pill pill-rose">
                    <Heart size={12} /> Made in Portland · 2026 Hackathon
                  </span>
                  <span className="pill pill-sky">3 languages</span>
                  <span className="pill pill-moss">Nothing stored</span>
                </div>

                <h1
                  className="font-display"
                  style={{
                    fontSize: "clamp(3rem, 6.5vw, 5.4rem)",
                    lineHeight: 1.02,
                    margin: 0,
                    letterSpacing: "-0.025em",
                    fontWeight: 500,
                  }}
                >
                  Most screeners skip{" "}
                  <span style={{ color: "var(--rose)" }}>
                    <StatReveal
                      target={HIDDEN_GEM_COUNT}
                      decimals={0}
                      duration={2.4}
                    />{" "}
                    benefits
                  </span>{" "}
                  Portland families can get.
                </h1>

                <p
                  style={{
                    fontSize: "1.15rem",
                    lineHeight: 1.55,
                    color: "var(--ink-2)",
                    maxWidth: 580,
                    margin: "28px 0 32px",
                  }}
                >
                  Most national tools only check federal benefits. We check{" "}
                  <strong style={{ color: "var(--ink)" }}>all {PROGRAM_COUNT}</strong> —
                  federal, Oregon, Multnomah County, and the City of Portland —
                  and put together a kind, useful packet for you in about three
                  minutes.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/intake"
                    className="rc-btn rc-btn-rose"
                    style={{ padding: "0.95rem 1.6rem", fontSize: "1.02rem" }}
                  >
                    Find what you&rsquo;re owed
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/demo" className="rc-btn rc-btn-outline">
                    <Play size={13} />
                    Try a demo first
                  </Link>
                </div>

                <div
                  className="flex items-center gap-4 mt-8 flex-wrap"
                  style={{ color: "var(--ink-3)", fontSize: "0.86rem" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={14} strokeWidth={2.2} /> No login
                  </span>
                  <span style={{ color: "var(--rule-2)" }}>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={14} strokeWidth={2.2} /> ~3 minutes
                  </span>
                  <span style={{ color: "var(--rule-2)" }}>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={14} strokeWidth={2.2} /> Built by neighbors
                  </span>
                </div>
              </div>

              <aside
                className="rc-enter"
                style={{ animationDelay: "120ms" }}
              >
                <div
                  className="rc-card"
                  style={{ padding: 30, position: "relative", overflow: "hidden" }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div
                        className="eyebrow mb-1"
                        style={{ color: "var(--moss-2)" }}
                      >
                        For a family like
                      </div>
                      <div
                        className="font-display"
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: 500,
                          lineHeight: 1.05,
                        }}
                      >
                        María, in Cully
                      </div>
                    </div>
                    <RoseStamp size={56} />
                  </div>

                  <p
                    style={{
                      color: "var(--ink-2)",
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                      margin: "0 0 18px",
                    }}
                  >
                    Family of 4 · 2 kids · part-time at Fred Meyer · rent
                    went up 12%.
                  </p>

                  <div className="rc-card-soft" style={{ padding: 20 }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="tag">We could find</span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--ink-3)",
                        }}
                      >
                        per year
                      </span>
                    </div>
                    <div
                      className="font-display tabular"
                      style={{
                        fontSize: "3rem",
                        lineHeight: 1,
                        color: "var(--rose)",
                        fontWeight: 500,
                      }}
                    >
                      {formatUsd(MARIA_TOTAL)}
                    </div>
                    <div
                      className="flex items-center gap-2 mt-3"
                      style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}
                    >
                      <span
                        className="pill pill-sun"
                        style={{ fontSize: "0.72rem" }}
                      >
                        <Sparkles size={11} /> {MARIA_ELIGIBLE} programs
                      </span>
                      <span style={{ color: "var(--ink-3)" }}>·</span>
                      <span>5 only Portland tools find</span>
                    </div>
                  </div>

                  <Link
                    href="/demo/maria"
                    className="rc-btn rc-btn-outline mt-4"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    See María&rsquo;s full results
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </aside>
            </div>
          </div>

          {/* Marquee */}
          <div
            style={{
              borderTop: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
              background: "var(--paper-2)",
              overflow: "hidden",
              padding: "16px 0",
            }}
          >
            <div className="rc-marquee-track">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-12"
                  style={{ flexShrink: 0 }}
                >
                  {MARQUEE_ITEMS.map(({ name: n, value: v }) => (
                    <span
                      key={n}
                      className="flex items-center gap-3"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "var(--rose)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="font-display"
                        style={{ fontSize: "1.25rem", fontWeight: 500 }}
                      >
                        {n}
                      </span>
                      <span
                        className="tabular"
                        style={{
                          color: "var(--moss-2)",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {v}
                      </span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────── How it works ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="How it works"
            title="Three short steps. One useful packet."
          >
            <p
              style={{
                color: "var(--ink-3)",
                margin: 0,
                fontSize: "0.94rem",
                maxWidth: 320,
              }}
            >
              Designed to be the friendliest part of your week.
            </p>
          </SectionHeading>

          <div className="rc-cols-3">
            <Step
              n="1"
              tone="rose"
              title="Tell us about your household"
              body="Five short steps: household, income, ZIP, and what's going on. Nothing is saved on our server."
            />
            <Step
              n="2"
              tone="moss"
              title={`We check all ${PROGRAM_COUNT} programs at once`}
              body="An AI reads the 2026 poverty tables and every active rule — ORS, City Code, county ordinances — and writes you a brief in plain language."
            />
            <Step
              n="3"
              tone="sun"
              title="Apply with one stack of links"
              body="Dollar estimates, deadlines, document checklists, and a renewal calendar you can drop into Google or Apple."
            />
          </div>
        </section>

        <HiddenGems />

        <DemoFamilies />

        {/* ─────────────────────── Closing CTA ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <div
            className="rc-card"
            style={{
              padding: "32px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <SoftBlobs tone="moss" />
            <div
              className="rc-cta-grid"
              style={{ position: "relative" }}
            >
              <div>
                <div
                  className="eyebrow mb-3"
                  style={{ color: "var(--moss-2)" }}
                >
                  The whole point
                </div>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
                    lineHeight: 1.1,
                    margin: "0 0 12px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Federal &amp; state tools find{" "}
                  <span style={{ color: "var(--ink-3)" }}>
                    {formatUsd(MARIA_FEDERAL)}
                  </span>
                  .
                  <br />
                  We find{" "}
                  <span style={{ color: "var(--rose)" }}>
                    {formatUsd(MARIA_TOTAL)}
                  </span>
                  .
                </h3>
                <p
                  style={{
                    color: "var(--ink-2)",
                    margin: 0,
                    fontSize: "1rem",
                    maxWidth: 580,
                  }}
                >
                  That difference is rent. It&rsquo;s groceries through August.
                  It&rsquo;s a heat pump that doesn&rsquo;t cost anything.
                </p>
              </div>
              <Link
                href="/intake"
                className="rc-btn rc-btn-rose"
                style={{ padding: "1rem 1.6rem", fontSize: "1.02rem" }}
              >
                Start my questions
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────── Footer ─────────────────────── */}
        <SiteFooter
          thirdColumn={{
            title: "Friends we’d love",
            children: (
              <>
                <li>211info</li>
                <li>Multnomah County DCHS</li>
                <li>Oregon Food Bank</li>
              </>
            ),
          }}
        />
      </main>
    </>
  );
}

function Step({
  n,
  title,
  body,
  tone,
}: {
  n: string;
  title: string;
  body: string;
  tone: keyof typeof STEP_TONES;
}) {
  const t = STEP_TONES[tone];
  return (
    <article className="rc-card" style={{ padding: 26 }}>
      <div className="flex items-center gap-3 mb-4">
        <span
          style={{
            display: "inline-flex",
            width: 38,
            height: 38,
            borderRadius: 12,
            background: t.bg,
            color: t.text,
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1.05rem",
          }}
        >
          {n}
        </span>
        <span
          style={{ flex: 1, height: 1, background: "var(--rule)" }}
        />
      </div>
      <h3
        className="font-display"
        style={{
          fontSize: "1.45rem",
          lineHeight: 1.15,
          margin: "0 0 10px",
          fontWeight: 500,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--ink-2)",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {body}
      </p>
    </article>
  );
}
