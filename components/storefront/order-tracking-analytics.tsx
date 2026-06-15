"use client";

import * as React from "react";

import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";

/** Fires when a guest views public order status (tracking page). */
export function OrderTrackingAnalyticsBeacon({
  storeSlug,
  orderToken,
}: {
  storeSlug: string;
  orderToken: string;
}) {
  React.useEffect(() => {
    void ingestStorefrontFirstPartyEvent({
      storeSlug,
      eventName: "order_tracking_view",
      path: typeof window !== "undefined" ? window.location.pathname : "/order",
      metadata: { order_token_prefix: orderToken.slice(0, 8) },
    });
  }, [storeSlug, orderToken]);

  return null;
}
