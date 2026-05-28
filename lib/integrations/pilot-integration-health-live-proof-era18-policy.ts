/**
 * Pilot integration health live proof on Today — Evolution Era 18 Workstream C Cycle 47.
 *
 * Extends Today/operator-home pilot strip with Woo/Shopify live proof operator rows.
 * Does not claim live Woo/Shopify PASS or engineering smoke PASS.
 */

import { PILOT_INTEGRATION_HEALTH_TODAY_ERA18_POLICY_ID } from "@/lib/integrations/pilot-integration-health-today-era18-policy";
import { INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";

export const PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_POLICY_ID =
  "era18-pilot-integration-health-live-proof-v1" as const;

export const PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_EXTENDS_POLICIES = [
  PILOT_INTEGRATION_HEALTH_TODAY_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
] as const;

export const PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_PROOF_STATUS =
  "pilot_integration_health_live_proof_wired" as const;

export const PILOT_INTEGRATION_HEALTH_LIVE_PROOF_ERA18_BACKLOG_ID = "KOS-E18-047" as const;
