import type { MetadataRoute } from "next";

// Rose City palette — hex approximations of the OKLCH design tokens
// --rose: oklch(0.60 0.11 150)  ≈ #4a9e7a (muted green-rose accent)
// --paper: oklch(0.972 0.020 70) ≈ #faf5ef (warm cream background)
const THEME_COLOR = "#4a9e7a"; // rose accent (primary brand color)
const BG_COLOR = "#faf5ef"; // paper (warm cream)

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDX Benefits Navigator",
    short_name: "PDX Benefits",
    description:
      "A friendly Portland-built navigator for federal, Oregon, Multnomah County, and City of Portland benefits. Three minutes, no login, nothing stored.",
    start_url: "/",
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: BG_COLOR,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
