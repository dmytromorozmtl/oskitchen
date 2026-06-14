export const SYNC_HEALTH_DASHBOARD_MARKETING_PATH = "/sync-health" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_META = {
  title: "Sync Health Dashboard — Per-Channel Status | OS Kitchen",
  description:
    "See sync health per channel — last sync, webhook posture, and honest BETA/SKIPPED labels for WooCommerce, Shopify, marketplaces, and owned storefront.",
  utmCampaign: "sync_health_dashboard_marketing",
} as const;

export type SyncHealthMarketingChannelId =
  | "storefront"
  | "woocommerce"
  | "shopify"
  | "doordash"
  | "uber_eats"
  | "grubhub"
  | "pos";

export type SyncHealthMarketingMaturity = "LIVE" | "BETA" | "SKIPPED" | "SETUP_READY";

export type SyncHealthMarketingBand = "healthy" | "watch" | "skipped" | "offline";

export type SyncHealthMarketingChannel = {
  id: SyncHealthMarketingChannelId;
  label: string;
  maturity: SyncHealthMarketingMaturity;
  band: SyncHealthMarketingBand;
  lastSyncLabel: string;
  webhookLabel: string;
  syncSignal: string;
  dashboardPath: string;
};

/** Illustrative per-channel rows for marketing — workspace reflects real checks after signup. */
export const SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS: SyncHealthMarketingChannel[] = [
  {
    id: "storefront",
    label: "Owned storefront",
    maturity: "LIVE",
    band: "healthy",
    lastSyncLabel: "Orders streaming",
    webhookLabel: "Native order hub",
    syncSignal: "Menu + orders in one workspace",
    dashboardPath: "/dashboard/storefront",
  },
  {
    id: "woocommerce",
    label: "WooCommerce",
    maturity: "BETA",
    band: "watch",
    lastSyncLabel: "12m ago (example)",
    webhookLabel: "Retry queue · 2 pending",
    syncSignal: "Product mapping + order import",
    dashboardPath: "/dashboard/sales-channels",
  },
  {
    id: "shopify",
    label: "Shopify",
    maturity: "BETA",
    band: "healthy",
    lastSyncLabel: "4m ago (example)",
    webhookLabel: "Verified",
    syncSignal: "Catalog sync + order webhook",
    dashboardPath: "/dashboard/sales-channels",
  },
  {
    id: "doordash",
    label: "DoorDash",
    maturity: "SKIPPED",
    band: "skipped",
    lastSyncLabel: "Not connected",
    webhookLabel: "Partner credentials missing",
    syncSignal: "Label SKIPPED — not fake green",
    dashboardPath: "/dashboard/integration-health",
  },
  {
    id: "uber_eats",
    label: "Uber Eats",
    maturity: "SKIPPED",
    band: "skipped",
    lastSyncLabel: "Not connected",
    webhookLabel: "Partner-gated",
    syncSignal: "Marketplace live ops not sold as default",
    dashboardPath: "/dashboard/integration-health",
  },
  {
    id: "grubhub",
    label: "Grubhub",
    maturity: "SKIPPED",
    band: "skipped",
    lastSyncLabel: "Not connected",
    webhookLabel: "Partner-gated",
    syncSignal: "Pilot scope only with creds",
    dashboardPath: "/dashboard/integration-health",
  },
  {
    id: "pos",
    label: "In-browser POS",
    maturity: "LIVE",
    band: "healthy",
    lastSyncLabel: "Real-time",
    webhookLabel: "N/A — native channel",
    syncSignal: "Same order hub as online channels",
    dashboardPath: "/dashboard/pos/terminal",
  },
] as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_H1 =
  "Sync Health Dashboard — Honest Status for Every Channel" as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_SUBTITLE =
  "One table for last sync, webhook posture, and maturity labels — WooCommerce, Shopify, marketplaces, and owned storefront. BETA and SKIPPED mean what they say; no blanket connected badge." as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_HONESTY_NOTE =
  "Illustrative marketing rows — your workspace shows live Integration Health Center and cross-channel inventory sync timestamps after signup. SKIPPED is not a failure state; it means partner credentials or smoke proof are missing." as const;

export const SYNC_HEALTH_DASHBOARD_MARKETING_CTA = {
  primaryHref: "/signup?redirect=/dashboard/integration-health",
  primaryLabel: "Start free trial",
  dashboardHref: "/dashboard/integration-health",
  dashboardLabel: "Open Integration Health Center",
  ihcMarketingHref: "/integration-health-center",
} as const;

export function syncHealthBandLabel(band: SyncHealthMarketingBand): string {
  if (band === "healthy") return "Healthy";
  if (band === "watch") return "Watch";
  if (band === "skipped") return "SKIPPED";
  return "Offline";
}

export function getSyncHealthMarketingChannel(
  id: SyncHealthMarketingChannelId,
): SyncHealthMarketingChannel | undefined {
  return SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.find((c) => c.id === id);
}

export type SyncHealthMarketingMaturityCounts = {
  live: number;
  beta: number;
  skipped: number;
  setupReady: number;
  total: number;
};

/** Live integration counter for homepage hero — derived from marketing channel matrix. */
export function countSyncHealthMarketingMaturity(): SyncHealthMarketingMaturityCounts {
  const counts: SyncHealthMarketingMaturityCounts = {
    live: 0,
    beta: 0,
    skipped: 0,
    setupReady: 0,
    total: SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.length,
  };

  for (const channel of SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS) {
    if (channel.maturity === "LIVE") counts.live += 1;
    else if (channel.maturity === "BETA") counts.beta += 1;
    else if (channel.maturity === "SKIPPED") counts.skipped += 1;
    else if (channel.maturity === "SETUP_READY") counts.setupReady += 1;
  }

  return counts;
}
