/**
 * Briefing ↔ Integration Health smoke action cross-link — Evolution Era 19 Workstream B Cycle 22.
 */

import { INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19-policy";

export const OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-smoke-action-v1" as const;

export const OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_EXTENDS_POLICIES = [
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_DEPTH_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_BACKLOG_ID = "KOS-E19-022" as const;

export const BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF =
  "/dashboard/integration-health#integration-health-smoke-next-action" as const;
