/**
 * Go-live pilot readiness focus — Evolution Era 18 Workstream P Cycle 58.
 *
 * Surfaces Woo/Shopify live proof, SSO pilot, and launch validation on go-live surfaces.
 * Reuses implementation pilot readiness model — does not claim GO/NO-GO PASS or live smoke PASS.
 */

import { IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_POLICY_ID } from "@/lib/implementation/implementation-pilot-readiness-focus-era18-policy";

export const GO_LIVE_PILOT_READINESS_FOCUS_ERA18_POLICY_ID =
  "era18-go-live-pilot-readiness-focus-v1" as const;

export const GO_LIVE_PILOT_READINESS_FOCUS_ERA18_EXTENDS_POLICIES = [
  IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_POLICY_ID,
] as const;

export const GO_LIVE_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS =
  "go_live_pilot_readiness_attention_wired" as const;

export const GO_LIVE_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-058" as const;

export const GO_LIVE_PILOT_READINESS_COMMAND_CENTER_ROUTE = "/dashboard/go-live" as const;
