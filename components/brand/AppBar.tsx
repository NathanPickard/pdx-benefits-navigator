import { Wordmark } from "./Wordmark";

export function AppBar({ children }: { children?: React.ReactNode }) {
  return (
    <header
      className="w-full"
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
        className="mx-auto flex items-center justify-between gap-4"
        style={{ maxWidth: 1240, padding: "14px 32px" }}
      >
        <Wordmark />
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
