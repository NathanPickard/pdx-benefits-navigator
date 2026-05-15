import type { Program } from "@/types/program";

const LABEL: Record<Program["jurisdiction"], string> = {
  federal: "Federal",
  oregon: "Oregon",
  multnomah: "Multnomah County",
  portland: "Portland",
};

const CLASS: Record<Program["jurisdiction"], string> = {
  federal: "pill-clay",
  oregon: "pill-sky",
  multnomah: "pill-moss",
  portland: "pill-rose",
};

export function JurisdictionPill({
  jurisdiction,
}: {
  jurisdiction: Program["jurisdiction"];
}) {
  return (
    <span className={`pill ${CLASS[jurisdiction]}`}>{LABEL[jurisdiction]}</span>
  );
}
