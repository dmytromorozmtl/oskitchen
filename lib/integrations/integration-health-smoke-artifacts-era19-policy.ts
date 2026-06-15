/**
 * Integration Health smoke artifact viewer — Evolution Era 19 Workstream D Cycle 7.
 *
 * Reads engineering smoke summary JSON from the repo host. Never upgrades SKIPPED to PASS
 * and never claims LIVE unless the artifact explicitly supports it.
 */

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT } from "@/lib/ci/staging-workflows-first-green-era16-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT } from "@/lib/integrations/channel-live-smoke-era16-policy";

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID =
  "era19-integration-health-smoke-artifacts-v1" as const;

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ANCHOR =
  "#engineering-smoke-artifacts" as const;

export const INTEGRATION_HEALTH_SMOKE_ARTIFACT_PATHS = {
  channelLive: CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT,
  p0Staging: P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
  stagingWorkflows: STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
} as const;

export const INTEGRATION_HEALTH_SMOKE_RECOVERY_LINKS = [
  {
    id: "import-center",
    label: "Import center",
    href: "/dashboard/import-center",
    detail: "Migrate catalog and customer CSVs before channel mapping.",
  },
  {
    id: "product-mapping",
    label: "Product mapping",
    href: "/dashboard/product-mapping",
    detail: "Resolve Woo/Shopify SKU mismatches before live smoke.",
  },
  {
    id: "webhook-queue",
    label: "Webhook queue",
    href: "/dashboard/sales-channels/webhooks",
    detail: "Review failed or unprocessed webhook deliveries.",
  },
  {
    id: "launch-wizard",
    label: "Launch wizard",
    href: "/dashboard/launch-wizard",
    detail: "Track setup steps blocking pilot cutover.",
  },
] as const;

export const INTEGRATION_HEALTH_SMOKE_OPS_CHECKLIST_DOC =
  "docs/era18-p0-staging-proof-ops-checklist.md" as const;
