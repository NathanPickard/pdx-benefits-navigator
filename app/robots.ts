import type { MetadataRoute } from "next";

const SITE_URL = "https://pdx-benefits-navigator.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/results",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
