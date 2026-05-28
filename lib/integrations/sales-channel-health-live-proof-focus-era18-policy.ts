/**
 * Sales channel health live proof focus — Evolution Era 18 Workstream C Cycle 50.
 *
 * Woo/Shopify pilot + engineering smoke parity on /dashboard/sales-channels/health.
 * Does not claim live Woo/Shopify PASS or engineering smoke proof_passed.
 */

import { INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";
import { SALES_CHANNEL_HEALTH_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-focus-era18-policy";

export const SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID =
  "era18-sales-channel-health-live-proof-focus-v1" as const;

export const SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_EXTENDS_POLICIES = [
  SALES_CHANNEL_HEALTH_FOCUS_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
] as const;

export const SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS =
  "sales_channel_health_live_proof_operator_wired" as const;

export const SALES_CHANNEL_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-050" as const;

export const SALES_CHANNEL_HEALTH_LIVE_PROOF_ROUTE =
  "/dashboard/sales-channels/health" as const;
