"use client";

import { usePathname } from "next/navigation";

import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import { GoogleAdsTracking } from "@/components/analytics/google-ads";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LinkedInInsightTag } from "@/components/analytics/linkedin-insight";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { isOperationalSurface } from "@/lib/navigation/operational-surface";

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
