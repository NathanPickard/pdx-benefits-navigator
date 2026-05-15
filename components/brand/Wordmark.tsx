import Link from "next/link";
import { RoseStamp } from "./RoseStamp";

type Props = { size?: "md" | "lg"; href?: string };

export function Wordmark({ size = "md", href = "/" }: Props) {
  const isLg = size === "lg";
  return (
    <Link
      href={href}
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
      <RoseStamp size={isLg ? 44 : 36} />
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
            fontSize: isLg ? "1.55rem" : "1.2rem",
            lineHeight: 1,
            letterSpacing: "-0.015em",
            fontWeight: 500,
          }}
        >
          PDX Benefits Navigator
        </span>
        <span
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
