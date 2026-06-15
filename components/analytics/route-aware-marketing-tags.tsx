"use client";

import { usePathname } from "next/navigation";

import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import { GoogleAdsTracking } from "@/components/analytics/google-ads";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LinkedInInsightTag } from "@/components/analytics/linkedin-insight";
import { MetaPixel } from "@/components/analytics/meta-pixel";

/** Skip third-party marketing tags on operational surfaces (POS, KDS, vendor cabinet). */
function isOperationalSurface(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/platform")
  );
}

export function RouteAwareMarketingTags() {
  const pathname = usePathname();
  if (isOperationalSurface(pathname)) return null;

  return (
    <>
      <GoogleAnalytics />
      <GoogleAdsTracking />
      <MetaPixel />
      <LinkedInInsightTag />
      <CookieConsentBanner />
    </>
  );
}
