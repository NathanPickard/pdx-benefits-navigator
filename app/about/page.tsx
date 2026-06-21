import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Code2, ExternalLink, Heart, Lock, MapPin, Sparkles, Users } from "lucide-react";

import { AppBar } from "@/components/brand/AppBar";
import { Wordmark } from "@/components/brand/Wordmark";
import { RoseStamp, SoftBlobs } from "@/components/brand/RoseStamp";
import { JurisdictionPill } from "@/components/brand/JurisdictionPill";

export const metadata: Metadata = {
  title: "About — PDX Benefits Navigator",
  description:
    "The story behind PDX Benefits Navigator — why Portland built it, how it protects your privacy, and how the AI analysis works. Built for the 2026 AI Portland Build Challenge.",
};

const HIDDEN_GEM_PROGRAMS = [
  { name: "Portland Renter Relocation", value: "$2,900 – $4,500", jurisdiction: "portland" as const },
  { name: "PCEF Home Energy", value: "up to $15,000", jurisdiction: "portland" as const },
  { name: "SUN Service System", value: "$1,000 – $6,000", jurisdiction: "multnomah" as const },
  { name: "Multnomah Eviction Prevention", value: "up to $5,000", jurisdiction: "multnomah" as const },
  { name: "Water Bureau Discount", value: "80% off bill", jurisdiction: "portland" as const },
  { name: "Transportation Wallet", value: "$100 – $308 / yr", jurisdiction: "portland" as const },
];

export default function AboutPage() {
  return (
    <>
      <AppBar />
      <main className="w-full" style={{ paddingBottom: 96 }}>

        {/* ─────────────────────── Page hero ─────────────────────── */}
        <section style={{ position: "relative", overflow: "hidden" }}>
          <SoftBlobs />
          <div className="rc-container rc-hero-pad" style={{ position: "relative" }}>
            <div style={{ maxWidth: 720 }}>
              <div className="flex items-center gap-2 mb-7 flex-wrap">
                <span className="pill pill-rose">
                  <Heart size={12} /> Made in Portland
                </span>
                <span className="pill pill-moss">
                  <Sparkles size={12} /> 2026 AI Portland Build Challenge
                </span>
                <span className="pill pill-sky">Nothing stored</span>
              </div>

              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
                  lineHeight: 1.05,
                  margin: "0 0 24px",
                  letterSpacing: "-0.025em",
                  fontWeight: 500,
                }}
              >
                Portland has the programs.
                <br />
                <span style={{ color: "var(--rose)" }}>We help you find them.</span>
              </h1>

              <p
                style={{
                  fontSize: "1.12rem",
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  margin: 0,
                  maxWidth: 600,
                }}
              >
                PDX Benefits Navigator is a free, browser-based tool that checks every
                federal, Oregon, Multnomah County, and City of Portland benefit program
                against your household's situation — and hands you a clear, actionable
                packet in about three minutes.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────── 1. The project ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="The project"
            title="The breadth problem — and how we fix it."
          />

          <div className="rc-cols-2" style={{ alignItems: "start" }}>
            <div>
              <p style={{ color: "var(--ink-2)", lineHeight: 1.7, margin: "0 0 20px", fontSize: "1rem" }}>
                Most national screening tools check federal programs — SNAP, Medicaid, WIC — and stop
                there. That leaves a significant gap. Portland and Multnomah County have funded a layer
                of locally-targeted programs that can add{" "}
                <strong style={{ color: "var(--ink)" }}>$10,000 – $25,000 a year</strong> for an
                average family, and most residents never hear about them.
              </p>
              <p style={{ color: "var(--ink-2)", lineHeight: 1.7, margin: "0 0 20px", fontSize: "1rem" }}>
                We built this to close that gap. We check all{" "}
                <strong style={{ color: "var(--ink)" }}>20 programs</strong> — federal, state, county,
                and city — in a single session. Eight of those 20 are flagged as{" "}
                <span className="pill pill-sun" style={{ fontSize: "0.78rem", verticalAlign: "middle" }}>
                  <Sparkles size={11} /> Hidden gems
                </span>{" "}
                — locally-funded programs that virtually no national tool will surface.
              </p>
              <p style={{ color: "var(--ink-2)", lineHeight: 1.7, margin: 0, fontSize: "1rem" }}>
                This tool was built for the{" "}
                <strong style={{ color: "var(--ink)" }}>2026 AI Portland Build Challenge</strong> — a
                hackathon asking builders to use AI for genuine community good.
              </p>
            </div>

            <div
              className="rc-card"
              style={{ padding: 24 }}
              aria-label="Examples of hidden-gem programs"
            >
              <div className="eyebrow mb-4" style={{ color: "var(--rose)" }}>
                6 of 8 hidden gems
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {HIDDEN_GEM_PROGRAMS.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-3 flex-wrap"
                    style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 10 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <JurisdictionPill jurisdiction={p.jurisdiction} />
                      <span style={{ fontSize: "0.9rem", color: "var(--ink)", fontWeight: 500 }}>
                        {p.name}
                      </span>
                    </div>
                    <span
                      className="tabular"
                      style={{ fontSize: "0.9rem", color: "var(--rose)", fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--ink-3)",
                  margin: "14px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Values are annual estimates. Confirm eligibility with each program before applying.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────── 2. The maker (bio slot) ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="The maker"
            title="Built by a Portlander, for Portland."
          />

          {/* ===== AUTHOR BIO — replace this block with Nathan's bio + links ===== */}
          <div
            className="rc-card"
            style={{
              padding: "32px 28px",
              maxWidth: 640,
              position: "relative",
              overflow: "hidden",
              borderStyle: "dashed",
            }}
            aria-label="Author bio coming soon"
          >
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "var(--sun-soft)",
                color: "oklch(0.46 0.12 65)",
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: "0.72rem",
                fontWeight: 600,
                border: "1px solid oklch(0.86 0.07 75)",
              }}
            >
              Coming soon
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "var(--rose-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "oklch(0.40 0.10 150)",
                  flexShrink: 0,
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <div
                  className="font-display"
                  style={{ fontSize: "1.4rem", fontWeight: 500, letterSpacing: "-0.015em" }}
                >
                  Nathan Pickard
                </div>
                <div
                  className="flex items-center gap-1.5"
                  style={{ color: "var(--ink-3)", fontSize: "0.84rem", marginTop: 2 }}
                >
                  <MapPin size={12} />
                  Portland, Oregon
                </div>
              </div>
            </div>

            <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", lineHeight: 1.65, margin: "0 0 16px" }}>
              Bio and personal links coming soon. Nathan built this tool during the 2026 AI Portland
              Build Challenge to help Portland residents navigate the city&rsquo;s often-overlooked
              local benefit programs.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://github.com/NathanPickard/pdx-benefits-navigator"
                target="_blank"
                rel="noopener noreferrer"
                className="rc-btn rc-btn-outline rc-btn-sm"
              >
                <Code2 size={14} />
                GitHub
              </a>
              {/* ── additional personal links go here ── */}
            </div>
          </div>
          {/* ===== END AUTHOR BIO SLOT ===== */}
        </section>

        {/* ─────────────────────── 3. How it works ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="How it works"
            title="Your key. Your browser. Your analysis."
          />

          <div className="rc-cols-3">
            <HowItWorksCard
              n="1"
              tone="rose"
              title="Bring your own API key"
              body={
                <>
                  You paste your own Anthropic API key into the app. The analysis is streamed
                  directly from <strong>your browser</strong> to Anthropic — our server never
                  sees the key, the answers, or the results.
                </>
              }
            />
            <HowItWorksCard
              n="2"
              tone="moss"
              title="The full programs database in context"
              body={
                <>
                  Instead of a rules engine, we embed every program&rsquo;s eligibility rules in a
                  system prompt. Claude reads the whole picture at once — federal poverty tables,
                  Oregon statutes, city and county ordinances — and writes you a plain-language brief.
                </>
              }
            />
            <HowItWorksCard
              n="3"
              tone="sun"
              title="Dollar figures from official data"
              body={
                <>
                  Every estimate is drawn from each program&rsquo;s official{" "}
                  <code
                    style={{
                      background: "var(--paper-2)",
                      borderRadius: 6,
                      padding: "1px 5px",
                      fontSize: "0.85em",
                    }}
                  >
                    amount_range
                  </code>{" "}
                  in <strong>programs.json</strong>. Claude is never allowed to invent
                  dollar figures — only to apply the official ranges to your situation.
                </>
              }
            />
          </div>

          <div
            className="rc-card-soft"
            style={{
              padding: "18px 24px",
              marginTop: 24,
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                background: "var(--sun-soft)",
                border: "1px solid oklch(0.86 0.07 75)",
                borderRadius: 10,
                padding: "8px 10px",
                color: "oklch(0.46 0.12 65)",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              ⚖️
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: "0.94rem", color: "var(--ink)", marginBottom: 4 }}
              >
                Estimates only — not legal advice
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                Results are a starting point to identify programs worth applying for — not a
                determination of legal eligibility. Always confirm with each program&rsquo;s
                caseworker or official source before applying.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────── 4. Privacy ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="Privacy"
            title="Nothing leaves your browser."
          />

          <div
            className="rc-card"
            style={{ padding: "32px 28px", maxWidth: 740, position: "relative", overflow: "hidden" }}
          >
            <SoftBlobs tone="moss" />
            <div style={{ position: "relative" }}>
              <div className="rc-cols-2" style={{ gap: 20 }}>
                <PrivacyItem
                  icon={<Lock size={18} />}
                  title="No server-side key"
                  body="Your Anthropic API key is stored only in your browser's localStorage. Our server never sees it — not even for a millisecond."
                />
                <PrivacyItem
                  icon={<span style={{ fontSize: 18 }}>🗄️</span>}
                  title="No database"
                  body="There is no backend database. Your intake answers exist only in your browser's sessionStorage for the duration of your session."
                />
                <PrivacyItem
                  icon={<span style={{ fontSize: 18 }}>📡</span>}
                  title="No analytics"
                  body="We run no analytics scripts, no tracking pixels, no third-party telemetry. The only external request is your browser → Anthropic."
                />
                <PrivacyItem
                  icon={<span style={{ fontSize: 18 }}>🧹</span>}
                  title="Nothing stored on our servers"
                  body="The one server route (/api/packet) renders a PDF from data you POST to it — it is stateless and stores nothing."
                />
              </div>

              <div
                style={{
                  marginTop: 28,
                  borderTop: "1px solid var(--rule)",
                  paddingTop: 20,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span
                  className="pill pill-moss"
                  style={{ fontSize: "0.82rem" }}
                >
                  <Check size={13} /> No tracking
                </span>
                <span
                  className="pill pill-moss"
                  style={{ fontSize: "0.82rem" }}
                >
                  <Check size={13} /> No cookies
                </span>
                <span
                  className="pill pill-moss"
                  style={{ fontSize: "0.82rem" }}
                >
                  <Check size={13} /> Nothing stored on our servers
                </span>
                <span
                  className="pill pill-moss"
                  style={{ fontSize: "0.82rem" }}
                >
                  <Check size={13} /> Session only
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── 5. Links / get involved ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <SectionHeading
            kicker="Get involved"
            title="Open source. Open doors."
          />

          <div className="rc-cols-2" style={{ alignItems: "start" }}>
            <div
              className="rc-card"
              style={{ padding: "28px 24px" }}
            >
              <div
                className="flex items-center gap-3 mb-4"
                style={{ color: "var(--ink)" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "var(--paper-2)",
                    border: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Code2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Source code</div>
                  <div style={{ color: "var(--ink-3)", fontSize: "0.82rem" }}>
                    github.com/NathanPickard
                  </div>
                </div>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: "0.93rem", lineHeight: 1.65, margin: "0 0 18px" }}>
                The full codebase — intake form, AI prompt, programs database, PDF renderer — is open
                source. File an issue, submit a PR, or fork it for your own city.
              </p>
              <a
                href="https://github.com/NathanPickard/pdx-benefits-navigator"
                target="_blank"
                rel="noopener noreferrer"
                className="rc-btn rc-btn-outline"
              >
                <ExternalLink size={15} />
                View on GitHub
                <ArrowRight size={14} />
              </a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="rc-card" style={{ padding: "24px 22px" }}>
                <div className="eyebrow mb-2" style={{ color: "var(--moss-2)" }}>
                  Contribute
                </div>
                <p style={{ color: "var(--ink-2)", fontSize: "0.93rem", lineHeight: 1.65, margin: "0 0 16px" }}>
                  Know a program we&rsquo;re missing? Spot a dollar figure that&rsquo;s out of date?
                  Adding a program is as simple as editing a JSON file — no rules engine to update.
                </p>
                <a
                  href="https://github.com/NathanPickard/pdx-benefits-navigator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rc-btn rc-btn-outline rc-btn-sm"
                >
                  Open an issue
                  <ArrowRight size={13} />
                </a>
              </div>

              <div
                className="rc-card"
                style={{ padding: "24px 22px", position: "relative", overflow: "hidden" }}
              >
                <div className="eyebrow mb-2" style={{ color: "var(--rose)" }}>
                  Partner with us
                </div>
                <p style={{ color: "var(--ink-2)", fontSize: "0.93rem", lineHeight: 1.65, margin: "0 0 16px" }}>
                  Are you a social services org, housing nonprofit, or city agency? We&rsquo;d love
                  to discuss integration, co-branding, or translation help.
                </p>
                {/* ── Partner / contact link goes here — to be filled in by Nathan ── */}
                <span
                  className="pill"
                  style={{ fontSize: "0.82rem", color: "var(--ink-3)" }}
                >
                  Contact link coming soon
                </span>
              </div>

              <div className="rc-card-soft" style={{ padding: "20px 22px", borderRadius: 16 }}>
                <div
                  style={{ fontSize: "0.84rem", color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}
                >
                  <strong style={{ color: "var(--ink-2)" }}>Friends we&rsquo;d love:</strong>{" "}
                  211info · Multnomah County DCHS · Oregon Food Bank · JOIN PDX · Community
                  Alliance of Tenants
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── Closing CTA ─────────────────────── */}
        <section className="rc-container rc-section-pad">
          <div
            className="rc-card"
            style={{ padding: "32px 24px", position: "relative", overflow: "hidden" }}
          >
            <SoftBlobs tone="moss" />
            <div className="rc-cta-grid" style={{ position: "relative" }}>
              <div>
                <div className="eyebrow mb-3" style={{ color: "var(--rose)" }}>
                  Ready to find what you&rsquo;re owed?
                </div>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                    lineHeight: 1.1,
                    margin: "0 0 12px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Three minutes. No login. Nothing stored.
                </h3>
                <p style={{ color: "var(--ink-2)", margin: 0, fontSize: "1rem", maxWidth: 520 }}>
                  The screening is free, runs entirely in your browser, and gives you a plain-language
                  packet with every program you may qualify for — including the ones national tools miss.
                </p>
              </div>
              <Link
                href="/intake"
                className="rc-btn rc-btn-rose"
                style={{ padding: "1rem 1.6rem", fontSize: "1.02rem" }}
              >
                Find what you&rsquo;re owed
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────── Footer ─────────────────────── */}
        <footer className="rc-container" style={{ padding: "48px 16px 24px", marginTop: 24 }}>
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
                Estimates only — not legal advice. Confirm eligibility with each program before
                applying. We never store your data; everything runs in your browser session.
              </p>
            </div>
            <div>
              <div className="tag" style={{ marginBottom: 8, fontWeight: 600, color: "var(--ink-2)" }}>
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
                <li>Portland &amp; Multnomah codes</li>
              </ul>
            </div>
            <div>
              <div className="tag" style={{ marginBottom: 8, fontWeight: 600, color: "var(--ink-2)" }}>
                Navigate
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
                <li>
                  <Link href="/intake" style={{ color: "var(--ink-2)", textDecoration: "none" }}>
                    Get screened
                  </Link>
                </li>
                <li>
                  <Link href="/demo/maria" style={{ color: "var(--ink-2)", textDecoration: "none" }}>
                    See a demo
                  </Link>
                </li>
                <li>
                  <Link href="/about" style={{ color: "var(--rose)", textDecoration: "none" }}>
                    About
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/NathanPickard/pdx-benefits-navigator"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--ink-2)", textDecoration: "none" }}
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ─────────────────────── Sub-components ─────────────────────── */

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

const HOW_TONES = {
  rose: { bg: "var(--rose-soft)", text: "oklch(0.40 0.10 150)" },
  moss: { bg: "var(--moss-soft)", text: "var(--moss-2)" },
  sun:  { bg: "var(--sun-soft)",  text: "oklch(0.46 0.12 65)" },
} as const;

function HowItWorksCard({
  n,
  title,
  body,
  tone,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
  tone: keyof typeof HOW_TONES;
}) {
  const t = HOW_TONES[tone];
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
        <span style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>
      <h3
        className="font-display"
        style={{
          fontSize: "1.35rem",
          lineHeight: 1.15,
          margin: "0 0 10px",
          fontWeight: 500,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
        {body}
      </p>
    </article>
  );
}

function PrivacyItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: "var(--moss-soft)",
          border: "1px solid oklch(0.85 0.05 150)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--moss-2)",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.94rem", color: "var(--ink)", marginBottom: 4 }}>
          {title}
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
          {body}
        </p>
      </div>
    </div>
  );
}
