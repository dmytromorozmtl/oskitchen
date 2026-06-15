/**
 * Briefing integration recovery convergence — Evolution Era 19 Convergence Cycle 39.
 *
 * Unifies Today integration-health tile, smoke next-action, and risk radar
 * deep-links to one recovery path on Integration Health Center.
 */

import { OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import { OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
import { INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-recovery-era19-policy";

export const OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-integration-recovery-convergence-v1" as const;

export const OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_ERA19_POLICY_ID,
  OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_RECOVERY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_BACKLOG_ID =
  "KOS-E19-039" as const;

export const BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_TILE_ID = "integration-health" as const;
