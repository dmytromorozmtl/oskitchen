"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";

import { STOREFRONT_ANALYTICS_CONSENT_COOKIE, type FirstPartyAnalyticsMode, type StorefrontAnalyticsConsentMode } from "@/lib/storefront/consent";

import { StorefrontAnalyticsScripts } from "./storefront-analytics-scripts";

export function StorefrontConsentAndMarketingScripts({
  mode,
  firstPartyMode,
  bannerText,
  privacyPath,
  storeSlug,
  googleTagManagerId,
  googleAnalyticsId,
  metaPixelId,
}: {
  mode: StorefrontAnalyticsConsentMode;
  firstPartyMode: FirstPartyAnalyticsMode;
  bannerText: string | null;
  privacyPath: string;
  storeSlug: string;
  googleTagManagerId: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
}) {
  const [hydrated, setHydrated] = React.useState(false);
  const [granted, setGranted] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
    const m = document.cookie.match(new RegExp(`(?:^|; )${STOREFRONT_ANALYTICS_CONSENT_COOKIE}=([^;]*)`));
    const v = m?.[1] ? decodeURIComponent(m[1]) : "";
    setGranted(v === "granted");
  }, []);

  function setConsent(value: "granted" | "denied") {
    const maxAge = 60 * 60 * 24 * 180;
    document.cookie = `${STOREFRONT_ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
    setGranted(value === "granted");
  }

  const showBanner = mode === "ENABLED_WITH_CONSENT" && hydrated && !granted;
  const loadTags = mode === "ENABLED_NO_BANNER" || (mode === "ENABLED_WITH_CONSENT" && hydrated && granted);

  const gtmOk = Boolean(googleTagManagerId && /^GTM-[A-Z0-9]+$/.test(googleTagManagerId));

  const privacyHref = privacyPath.startsWith("http") ? privacyPath : `/s/${storeSlug}${privacyPath}`;

  return (
    <>
      {showBanner ? (
        <div className="border-b border-border/80 bg-muted/80 px-4 py-3 text-center text-xs text-foreground">
          <p>{bannerText?.trim() || "Analytics and marketing tags load only if you accept."}</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="rounded-full bg-primary px-3 py-1 text-primary-foreground"
              onClick={() => setConsent("granted")}
            >
              Accept
            </button>
            <button type="button" className="rounded-full border border-border px-3 py-1" onClick={() => setConsent("denied")}>
              Decline
            </button>
            <Link href={privacyHref} className="text-primary underline-offset-4 hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      ) : null}
      <p className="border-b border-border/40 px-4 py-2 text-center text-[11px] text-muted-foreground">
        {firstPartyMode === "DISABLED"
          ? "First-party storefront analytics (visits / cart events) are disabled for this site."
          : firstPartyMode === "CONSENT_REQUIRED"
            ? "First-party operational analytics waits for the same Accept choice when consent is required. Third-party marketing tags follow the mode above — not legal advice."
            : "First-party operational analytics may record visits and cart events without marketing cookies. Third-party tags still follow the mode above — not legal advice."}
      </p>
      {mode !== "DISABLED" && loadTags ? (
        <>
          {gtmOk ? (
            <Script id="gtm-bootstrap" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
            </Script>
          ) : null}
          <StorefrontAnalyticsScripts
            googleTagManagerId={googleTagManagerId}
            googleAnalyticsId={googleAnalyticsId}
            metaPixelId={metaPixelId}
          />
        </>
      ) : null}
    </>
  );
}
