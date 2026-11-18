import { Wordmark } from "@/components/brand/Wordmark";

const FOOTER_HEADING_STYLE: React.CSSProperties = {
  marginBottom: 8,
  fontWeight: 600,
  color: "var(--ink-2)",
};

const FOOTER_LIST_STYLE: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  fontSize: "0.86rem",
  lineHeight: 1.9,
  color: "var(--ink-2)",
};

interface SiteFooterProps {
  /** The third column, which differs per page (e.g. partners or navigation). */
  thirdColumn: {
    title: string;
    children: React.ReactNode;
  };
}

export function SiteFooter({ thirdColumn }: SiteFooterProps) {
  return (
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
            Estimates only — not legal advice. Confirm eligibility with each
            program before applying. We never store your data; everything runs
            in your browser session.
          </p>
        </div>
        <FooterColumn title="Built with">
          <li>2026 Federal Poverty Level</li>
          <li>Oregon Revised Statutes</li>
          <li>Portland &amp; Multnomah codes</li>
        </FooterColumn>
        <FooterColumn title={thirdColumn.title}>
          {thirdColumn.children}
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="tag" style={FOOTER_HEADING_STYLE}>
        {title}
      </div>
      <ul style={FOOTER_LIST_STYLE}>{children}</ul>
    </div>
  );
}
