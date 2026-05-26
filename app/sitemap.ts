import type { MetadataRoute } from "next";

import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import { GOOGLE_ADS_LANDINGS } from "@/lib/marketing/google-ads-landings";
import { marketingSitemapPaths } from "@/lib/marketing/sitemap-urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = PRODUCTION_APP_URL;
  const lastModified = new Date();

  const adPages = GOOGLE_ADS_LANDINGS.map((landing) => ({
    path: landing.path,
    priority: 0.5,
    changeFrequency: "monthly" as const,
  }));

  const pages = [...marketingSitemapPaths(), ...adPages];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: path ? `${siteUrl}${path}` : siteUrl,
    lastModified,
    changeFrequency,
    priority,
  }));
}
