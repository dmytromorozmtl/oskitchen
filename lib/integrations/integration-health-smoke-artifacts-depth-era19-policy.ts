/**
 * Integration Health smoke artifact viewer depth — Evolution Era 19 Workstream D Cycle 21.
 *
 * Child proof breakdown, GitHub run links, and prioritized next smoke action.
 * Never upgrades SKIPPED to PASS or claims LIVE without artifact evidence.
 */

import { INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID =
  "era19-integration-health-smoke-artifacts-depth-v1" as const;

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_EXTENDS_POLICIES = [
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID,
] as const;

export const INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_BACKLOG_ID =
  "KOS-E19-021" as const;

export const INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_ANCHOR =
  "#integration-health-smoke-next-action" as const;
