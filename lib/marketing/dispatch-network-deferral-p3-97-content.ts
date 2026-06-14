/**
 * P3-97 — Honest dispatch network deferral copy and banned phrases.
 *
 * @see docs/dispatch-network-deferral-p3-97.md
 */

export const DISPATCH_NETWORK_DEFERRAL_P3_97_STATUS = "DEFERRED_NO_CALENDAR_DATE" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_PUBLIC_LINE =
  "No proprietary dispatch or driver network — manual delivery routes, third-party courier integrations, and delivery zones on your existing stack today." as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_HONESTY_NOTE =
  "OS Kitchen does not operate a nationwide driver fleet or Olo-style dispatch network. Delivery orchestration modules are BETA pilot scope only." as const;

/** Delivery workflows without an OS Kitchen-owned driver network. */
export const DISPATCH_NETWORK_DEFERRAL_P3_97_ALTERNATIVES = [
  {
    id: "delivery-routes",
    title: "Manual delivery routes (BETA)",
    path: "/dashboard/delivery/route-optimization",
    maturity: "BETA",
  },
  {
    id: "delivery-orchestration",
    title: "Delivery orchestration (BETA)",
    path: "/dashboard/delivery/orchestration",
    maturity: "BETA",
  },
  {
    id: "delivery-zones",
    title: "Delivery zones configuration",
    path: "/dashboard/settings/delivery-zones",
    maturity: "BETA",
  },
  {
    id: "channel-integrations",
    title: "Third-party channel integrations",
    path: "/dashboard/integrations",
    maturity: "LIVE",
  },
] as const;

/** Banned in GTM/marketing — dispatch network is deferred, not teased. */
export const DISPATCH_NETWORK_DEFERRAL_P3_97_BANNED_PHRASES = [
  "dispatch network coming soon",
  "Dispatch network coming soon",
  "OS Kitchen driver network",
  "OS Kitchen delivery fleet",
  "nationwide dispatch network from OS Kitchen",
  "our own courier fleet",
  "OS Kitchen logistics network",
  "driver fleet coming soon",
  "national dispatch network from OS Kitchen",
] as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_PATHS = [
  "lib/marketing",
  "components/marketing",
  "docs/PRODUCT_ROADMAP_2026.md",
  "docs/public-roadmap-p3-69.md",
  "marketing/forbidden-claims-training.md",
] as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_SCAN_EXCLUDE_FILES = [
  "lib/marketing/dispatch-network-deferral-p3-97-content.ts",
  "lib/marketing/dispatch-network-deferral-p3-97-policy.ts",
  "lib/marketing/dispatch-network-deferral-p3-97-audit.ts",
  "tests/unit/dispatch-network-deferral-p3-97.test.ts",
] as const;
