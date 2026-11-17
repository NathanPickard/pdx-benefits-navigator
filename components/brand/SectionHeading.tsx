interface SectionHeadingProps {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}

export function SectionHeading({ kicker, title, children }: SectionHeadingProps) {
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
