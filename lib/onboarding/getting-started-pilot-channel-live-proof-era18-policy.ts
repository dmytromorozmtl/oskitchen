/**
 * Getting started pilot channel live proof — Evolution Era 18 Workstream L Cycle 48.
 *
 * Surfaces Woo/Shopify pilot wizard and engineering live-smoke posture on Today
 * getting-started attention when channel onboarding is active.
 * Does not claim live Woo/Shopify PASS.
 */

import { GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID } from "@/lib/onboarding/getting-started-pilot-channel-era18-policy";
import { INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";

export const GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_POLICY_ID =
  "era18-getting-started-pilot-channel-live-proof-v1" as const;

export const GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_EXTENDS_POLICIES = [
  GETTING_STARTED_PILOT_CHANNEL_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
] as const;

export const GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_PROOF_STATUS =
  "getting_started_pilot_channel_live_proof_wired" as const;

export const GETTING_STARTED_PILOT_CHANNEL_LIVE_PROOF_ERA18_BACKLOG_ID = "KOS-E18-048" as const;
