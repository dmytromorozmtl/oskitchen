/**
 * Implementation pilot readiness focus — Evolution Era 18 Workstream P Cycle 51.
 *
 * Surfaces workspace-scoped Woo/Shopify live proof, SSO pilot, and go-live launch
 * blockers on the Implementation hub. Does not claim GO/NO-GO PASS or live smoke PASS.
 */

export const IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_POLICY_ID =
  "era18-implementation-pilot-readiness-focus-v1" as const;

export const IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_EXTENDS_POLICIES = [
  "era18-getting-started-pilot-sso-v1",
  "era18-pilot-integration-health-live-proof-v1",
  "era18-go-live-channel-pilot-focus-v1",
  "era18-go-live-sso-pilot-focus-v1",
] as const;

export const IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_PROOF_STATUS =
  "implementation_pilot_readiness_attention_wired" as const;

export const IMPLEMENTATION_PILOT_READINESS_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-051" as const;

export const IMPLEMENTATION_PILOT_READINESS_ROUTE = "/dashboard/implementation" as const;

export const IMPLEMENTATION_GO_LIVE_ROUTE = "/dashboard/go-live" as const;
