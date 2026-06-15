import type { MetadataRoute } from "next";

import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";

const siteUrl = PRODUCTION_APP_URL;

const DISALLOW = ["/api/", "/dashboard/", "/platform/", "/auth/", "/onboarding/", "/_next/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: DISALLOW.filter((p) => p !== "/_next/"),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
