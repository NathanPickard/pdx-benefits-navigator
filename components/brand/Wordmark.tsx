import Link from "next/link";
import { RoseStamp } from "./RoseStamp";

export function Wordmark() {
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
        whiteSpace: "nowrap",
        textDecoration: "none",
        color: "var(--ink)",
      }}
    >
      <RoseStamp size={36} />
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span
          className="font-display"
          style={{
            fontSize: "1.2rem",
            lineHeight: 1,
            letterSpacing: "-0.015em",
            fontWeight: 500,
          }}
        >
          PDX Benefits Navigator
        </span>
        <span
          className="rc-hide-sm"
          style={{
            fontSize: "0.72rem",
            marginTop: 4,
            color: "var(--ink-3)",
          }}
        >
          A friendly navigator for Portland
        </span>
      </span>
    </Link>
  );
}
