"use client";

import * as React from "react";

import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";

export function OrderConfirmationAnalyticsBeacon({ storeSlug }: { storeSlug: string }) {
  React.useEffect(() => {
    void ingestStorefrontFirstPartyEvent({
      storeSlug,
      eventName: "order_confirmation_view",
      path: typeof window !== "undefined" ? window.location.pathname : "/order",
    });
  }, [storeSlug]);

  return null;
}
