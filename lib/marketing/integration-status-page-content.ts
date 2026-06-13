/**
 * Public integration status page — /status fleet display.
 *
 * @see artifacts/live-integrations-staging-smoke-summary.json
 * @see docs/INTEGRATION_LAUNCH_STATUS.md
 */

import { LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT } from "@/lib/integrations/live-integrations-staging-smoke-policy";

export const INTEGRATION_STATUS_PAGE_PATH = "/status" as const;

export const INTEGRATION_STATUS_PAGE_TEST_ID = "integration-status-page" as const;

export const INTEGRATION_STATUS_PAGE_META = {
  title: "Integration Status — OS Kitchen Platform & Channel Uptime",
  description:
    "Honest integration status for 18 LIVE surfaces — platform health plus per-channel staging smoke results. No fabricated uptime percentages.",
  keywords: [
    "os kitchen status",
    "restaurant integration status",
    "integration uptime dashboard",
    "woocommerce shopify status",
  ],
  utmCampaign: "integration_status_seo",
} as const;

export const INTEGRATION_STATUS_PAGE_UPSTREAM_ARTIFACT =
  "artifacts/live-integrations-staging-smoke-summary.json" as const;

export const INTEGRATION_STATUS_PAGE_UPSTREAM_POLICY =
  "absolute-final-live-integrations-staging-v1" as const;

export const INTEGRATION_STATUS_PAGE_UPSTREAM_DOC = "docs/INTEGRATION_LAUNCH_STATUS.md" as const;

export const INTEGRATION_STATUS_PAGE_EXPECTED_COUNT =
  LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT;

export type PublicIntegrationDisplayStatus = "verified" | "monitoring_pending" | "smoke_failed";

export const PUBLIC_INTEGRATION_STATUS_LABELS: Record<PublicIntegrationDisplayStatus, string> = {
  verified: "Verified (staging)",
  monitoring_pending: "Monitoring pending",
  smoke_failed: "Smoke failed",
};

export const INTEGRATION_STATUS_PAGE_REQUIRED_SECTIONS = [
  INTEGRATION_STATUS_PAGE_TEST_ID,
  "Integration fleet",
  "Honesty disclaimer",
  "Platform health",
] as const;

export function publicIntegrationStatusCtaHref(
  base: "/book-demo" | "/roadmap" | "/restaurant-integration-health",
): string {
  return `${base}?utm_source=integration_status&utm_campaign=${INTEGRATION_STATUS_PAGE_META.utmCampaign}`;
}

export function mapSmokeStatusToDisplay(
  status: "PASSED" | "FAILED" | "SKIPPED",
): PublicIntegrationDisplayStatus {
  if (status === "PASSED") return "verified";
  if (status === "FAILED") return "smoke_failed";
  return "monitoring_pending";
}

export function publicIntegrationUptimeLabel(
  status: PublicIntegrationDisplayStatus,
): string {
  switch (status) {
    case "verified":
      return "Staging smoke passed";
    case "smoke_failed":
      return "Investigate — smoke failed";
    case "monitoring_pending":
      return "Uptime pending credentials";
  }
}
