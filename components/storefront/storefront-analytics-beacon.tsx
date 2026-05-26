"use client";

import * as React from "react";

import type { FirstPartyAnalyticsMode } from "@/lib/storefront/consent";
import { readThemeExperimentArmFromCookie } from "@/lib/storefront/experiment-arm-client";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";

export function StorefrontAnalyticsBeacon({
  storeSlug,
  firstPartyMode,
  ingestDisabled,
}: {
  storeSlug: string;
  firstPartyMode: FirstPartyAnalyticsMode;
  /** Strict signed ingest without a signing secret — skip beacon (SSR still works). */
  ingestDisabled?: boolean;
}) {
  React.useEffect(() => {
    if (ingestDisabled) return;
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const arm = readThemeExperimentArmFromCookie();
    void ingestStorefrontFirstPartyEvent(
      {
        storeSlug,
        eventName: "page_view",
        path,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
        metadata: arm ? { experimentArm: arm } : undefined,
      },
      { firstPartyMode },
    );
  }, [storeSlug, firstPartyMode, ingestDisabled]);

  return null;
}
