import Link from "next/link";

import { ApiKeyControl } from "./ApiKeyControl";
import { Wordmark } from "./Wordmark";

export function AppBar({ children }: { children?: React.ReactNode }) {
  return (
    <header
      className="w-full"
      data-print="hide"
      style={{
        background: "oklch(0.99 0.014 70 / 0.85)",
        borderBottom: "1px solid var(--rule)",
        backdropFilter: "saturate(140%) blur(6px)",
        WebkitBackdropFilter: "saturate(140%) blur(6px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        className="rc-container rc-appbar-pad flex items-center justify-between gap-3"
      >
        <Wordmark />
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            style={{
              fontSize: "0.88rem",
              fontWeight: 500,
              color: "var(--ink-2)",
              textDecoration: "none",
              padding: "0.35rem 0.7rem",
              borderRadius: 999,
              transition: "color 0.15s, background 0.15s",
            }}
            className="rc-nav-link"
          >
            About
          </Link>
          {children}
          <ApiKeyControl />
        </div>
      </div>
    </header>
  );
}
