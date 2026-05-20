import Link from "next/link";
import { ArrowRight, Check, Heart, Play, Sparkles, Users } from "lucide-react";

import { AppBar } from "@/components/brand/AppBar";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  RoseStamp,
  SoftBlobs,
  SunBadge,
} from "@/components/brand/RoseStamp";
import { JurisdictionPill } from "@/components/brand/JurisdictionPill";
import { StatReveal } from "@/components/landing/StatReveal";

const HIDDEN_GEMS = [
  {
    id: "renter",
    name: "Portland Renter Relocation",
    value: "$2,900 – $4,500",
    jurisdiction: "portland" as const,
    blurb:
      "When your rent goes up more than 10% in a year, your landlord owes you a lump sum.",
  },
  {
    id: "pcef",
    name: "PCEF Home Energy",
    value: "up to $15,000",
    jurisdiction: "portland" as const,
    blurb:
      "Free heat pumps, weatherization, and AC — funded by Portland's tax on large retailers.",
  },
  {
    id: "sun",
    name: "SUN Service System",
    value: "$1,000 – $6,000",
    jurisdiction: "multnomah" as const,
    blurb:
      "After-school, family meals, mental health, and basic-needs case management.",
  },
  {
    id: "evict",
    name: "Multnomah Eviction Prevention",
    value: "up to $5,000",
    jurisdiction: "multnomah" as const,
    blurb: "Emergency rent paid directly to landlords — within days.",
  },
  {
    id: "water",
    name: "Water Bureau Discount",
    value: "80% off bill",
    jurisdiction: "portland" as const,
    blurb:
      "Up to 80% off water + sewer for households under 60% State Median Income.",
  },
  {
    id: "wallet",
    name: "Transportation Wallet",
    value: "$100 – $308 / yr",
    jurisdiction: "portland" as const,
    blurb:
      "TriMet, BIKETOWN, and parking credits for income-qualified residents.",
  },
];

const SCENARIO_SUMMARIES = [
  {
    slug: "maria",
    name: "María & family",
    short: "María",
    zip: "97218 · Cully",
    blurb:
      "Single parent · 2 kids · part-time at Fred Meyer · rent went up 12%.",
    total: 40308,
    eligibleCount: 13,
    accent: "rose" as const,
  },
  {
    slug: "james",
    name: "James",
    short: "James",
    zip: "97203 · St. Johns",
    blurb: "Single · disabled vet · unemployed · owns home in St. Johns.",
    total: 24448,
    eligibleCount: 12,
    accent: "moss" as const,
  },
  {
    slug: "rose",
    name: "Rose",
    short: "Rose",
    zip: "97266 · Lents",
    blurb: "Senior · widow · Social Security only · owns home in Lents.",
    total: 19620,
    eligibleCount: 11,
    accent: "sun" as const,
  },
];

const MARQUEE_ITEMS = [
  ["Portland Renter Relocation", "$4,500"],
  ["PCEF Home Energy", "up to $15,000"],
  ["SUN Service System", "$3,000"],
  ["Multnomah Eviction Prevention", "$2,000"],
  ["Water Bureau Discount", "80% off"],
  ["Transportation Wallet", "$308 / yr"],
  ["Inclusionary Housing", "$9,000 / yr"],
];

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
                  <span className="pill pill-sky">7 languages</span>
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
                  Portland has set aside{" "}
                  <span style={{ color: "var(--rose)" }}>
                    <StatReveal
                      target={1.2}
                      decimals={1}
                      prefix="$"
                      duration={2.4}
                    />{" "}
                    billion
                  </span>{" "}
                  for families who never claim it.
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
                  <strong style={{ color: "var(--ink)" }}>all twenty</strong> —
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
                    Single parent · 2 kids · part-time at Fred Meyer · rent
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
                      $40,308
                    </div>
                    <div
                      className="flex items-center gap-2 mt-3"
                      style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}
                    >
                      <span
                        className="pill pill-sun"
                        style={{ fontSize: "0.72rem" }}
                      >
                        <Sparkles size={11} /> 13 programs
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
                  {MARQUEE_ITEMS.map(([n, v]) => (
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
              body="Twelve gentle questions: size, income, ZIP, what's going on. Your answers stay in this browser."
            />
            <Step
              n="2"
              tone="moss"
              title="We check all 20 programs at once"
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

        {/* ─────────────────────── Hidden gems ─────────────────────── */}
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
              These nine hyperlocal programs alone add{" "}
              <strong style={{ color: "var(--rose)" }}>
                $10–25K a year
              </strong>{" "}
              for the average family.
            </p>
          </SectionHeading>

          <div className="rc-cols-3">
            {HIDDEN_GEMS.map((g) => (
              <article key={g.id} className="rc-card" style={{ padding: 24 }}>
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

        {/* ─────────────────────── Demo families ─────────────────────── */}
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
                        ${s.total.toLocaleString()}
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
                  Federal tools find{" "}
                  <span style={{ color: "var(--ink-3)" }}>$9,200</span>.
                  <br />
                  We find <span style={{ color: "var(--rose)" }}>$24,400</span>.
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
        <footer
          className="rc-container"
          style={{ padding: "48px 16px 24px", marginTop: 24 }}
        >
          <div className="rc-footer-grid">
            <div>
              <Wordmark />
              <p
                style={{
                  color: "var(--ink-3)",
                  fontSize: "0.86rem",
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  maxWidth: 460,
                }}
              >
                Estimates only — not legal advice. Confirm eligibility with
                each program before applying. We never store your data;
                everything runs in your browser session.
              </p>
            </div>
            <div>
              <div
                className="tag"
                style={{
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Built with
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.86rem",
                  lineHeight: 1.9,
                  color: "var(--ink-2)",
                }}
              >
                <li>2026 Federal Poverty Level</li>
                <li>Oregon Revised Statutes</li>
                <li>Portland & Multnomah codes</li>
              </ul>
            </div>
            <div>
              <div
                className="tag"
                style={{
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Friends we&rsquo;d love
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.86rem",
                  lineHeight: 1.9,
                  color: "var(--ink-2)",
                }}
              >
                <li>211info</li>
                <li>Multnomah County DCHS</li>
                <li>Oregon Food Bank</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function SectionHeading({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-6 flex-wrap mb-8">
      <div>
        <div className="eyebrow mb-2">{kicker}</div>
        <h2
          className="font-display"
          style={{
            fontSize: "2.2rem",
            lineHeight: 1.1,
            margin: 0,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </header>
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
