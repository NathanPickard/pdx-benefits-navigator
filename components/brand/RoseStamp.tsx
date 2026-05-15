type Props = { size?: number; className?: string };

export function RoseStamp({ size = 64, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rosepetal" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.82 0.10 150)" />
          <stop offset="100%" stopColor="oklch(0.58 0.12 150)" />
        </radialGradient>
      </defs>
      <g transform="translate(50 50)" fill="url(#rosepetal)" opacity={0.95}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-22"
            rx="13"
            ry="20"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      <g transform="translate(50 50) rotate(30)" fill="oklch(0.72 0.10 150)">
        {[0, 90, 180, 270].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-12"
            rx="9"
            ry="14"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="6" fill="oklch(0.48 0.13 150)" />
      <circle cx="50" cy="50" r="2.5" fill="oklch(0.92 0.04 150)" />
    </svg>
  );
}

export function SunBadge({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="11" fill="oklch(0.82 0.135 80)" />
      <g
        stroke="oklch(0.82 0.135 80)"
        strokeWidth={2.2}
        strokeLinecap="round"
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="30"
            y1="6"
            x2="30"
            y2="14"
            transform={`rotate(${deg} 30 30)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function SoftBlobs({ tone = "rose" }: { tone?: "rose" | "moss" }) {
  return (
    <>
      <div
        className="rc-blob"
        style={{
          width: 540,
          height: 540,
          top: -160,
          right: -120,
          background:
            tone === "rose"
              ? "oklch(0.78 0.10 150 / 0.40)"
              : "oklch(0.75 0.10 155 / 0.4)",
        }}
      />
      <div
        className="rc-blob"
        style={{
          width: 480,
          height: 480,
          bottom: -160,
          left: -120,
          background: "oklch(0.78 0.12 80 / 0.30)",
        }}
      />
    </>
  );
}
