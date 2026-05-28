/**
 * Integration health live proof focus — Evolution Era 18 Workstream C Cycle 46.
 *
 * Surfaces Woo/Shopify pilot wizard gaps and honest engineering live-smoke posture
 * on the integration health dashboard. Does not claim live Woo/Shopify PASS.
 */

import { INTEGRATION_HEALTH_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-focus-era18-policy";
import { CHANNEL_PILOT_SETUP_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/channel-pilot-setup-focus-era18-policy";

export const INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID =
  "era18-integration-health-live-proof-focus-v1" as const;

export const INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_EXTENDS_POLICIES = [
  INTEGRATION_HEALTH_FOCUS_ERA18_POLICY_ID,
  CHANNEL_PILOT_SETUP_FOCUS_ERA18_POLICY_ID,
  "era17-channel-live-smoke-woo-v1",
  "era17-channel-live-smoke-shopify-v1",
] as const;

export const INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_PROOF_STATUS =
  "integration_health_live_proof_operator_wired" as const;

export const INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-046" as const;

export const INTEGRATION_HEALTH_LIVE_PROOF_ANCHOR = "#channel-live-proof" as const;

export const INTEGRATION_HEALTH_LIVE_PROOF_OPS_RUNBOOK_PATH =
  "/dashboard/sales-channels/health" as const;
