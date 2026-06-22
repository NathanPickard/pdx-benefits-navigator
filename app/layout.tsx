import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import { ApiKeyProvider } from "@/lib/userKey";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const SITE_URL = "https://pdx-benefits-navigator.vercel.app";
const SITE_TITLE = "PDX Benefits Navigator — Find what you're owed";
const SITE_DESCRIPTION =
  "A friendly Portland-built navigator for federal, Oregon, Multnomah County, and City of Portland benefits. Three minutes, no login, nothing stored.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "PDX Benefits Navigator",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Static JSON-LD — WebApplication structured data for search engines
const LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDX Benefits Navigator",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "GovernmentBenefitsApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  inLanguage: ["en", "es", "vi"],
  featureList: [
    "Screens all 24 federal, Oregon, Multnomah County, and City of Portland benefit programs",
    "Highlights 11 locally-funded hidden-gem programs most national tools miss",
    "No login required — answers stay in your browser session",
    "AI-powered eligibility analysis in plain language",
    "Printable PDF packet with program links, deadlines, and document checklists",
    "Renewal calendar download (.ics)",
    "Available in English, Spanish, and Vietnamese",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiKeyProvider>{children}</ApiKeyProvider>
        <Toaster />
        {/* No-tracking badge — site-wide, truthful: no analytics, no cookies, no server storage */}
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            background: "var(--paper-2)",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "var(--ink-4)",
            letterSpacing: "0.01em",
          }}
          data-print="hide"
        >
          No tracking · No cookies · Nothing stored on our servers
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }}
        />
      </body>
    </html>
  );
}
