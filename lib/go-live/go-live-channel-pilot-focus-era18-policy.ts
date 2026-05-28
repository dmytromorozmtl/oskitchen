/**
 * Go-live channel pilot focus — Evolution Era 18 Workstream O Cycle 49.
 *
 * Surfaces Woo/Shopify pilot wizard gaps on launch validation for connected channels.
 * Does not claim live Woo/Shopify PASS or engineering smoke PASS.
 */

import { GO_LIVE_FOCUS_ERA18_POLICY_ID } from "@/lib/go-live/go-live-focus-era18-policy";
import { INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID } from "@/lib/integrations/integration-health-live-proof-focus-era18-policy";

export const GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_POLICY_ID =
  "era18-go-live-channel-pilot-focus-v1" as const;

export const GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_EXTENDS_POLICIES = [
  GO_LIVE_FOCUS_ERA18_POLICY_ID,
  INTEGRATION_HEALTH_LIVE_PROOF_FOCUS_ERA18_POLICY_ID,
  "era18-channel-pilot-setup-focus-v1",
] as const;

export const GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_PROOF_STATUS =
  "go_live_channel_pilot_gate_wired" as const;

export const GO_LIVE_CHANNEL_PILOT_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-049" as const;

export const GO_LIVE_CHANNEL_PILOT_INCOMPLETE_KEY_PREFIX = "channel_pilot_incomplete_" as const;

export const GO_LIVE_CHANNEL_LIVE_SMOKE_PENDING_KEY_PREFIX = "channel_live_smoke_pending_" as const;
