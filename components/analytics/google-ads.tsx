'use client';

import Script from 'next/script';

import { useMarketingConsentGranted } from '@/components/analytics/use-marketing-consent';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

/**
 * Optional Google Ads tag — set NEXT_PUBLIC_GOOGLE_ADS_ID (e.g. AW-XXXXXXXXX).
 * Shares dataLayer with GA4 when both use gtag.js.
 */
export function GoogleAdsTracking() {
  const consentGranted = useMarketingConsentGranted();
  if (!GOOGLE_ADS_ID || !/^AW-/.test(GOOGLE_ADS_ID) || !consentGranted) return null;

  return (
    <Script
      id="google-ads-config"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('config', '${GOOGLE_ADS_ID}');
        `,
      }}
    />
  );
}
