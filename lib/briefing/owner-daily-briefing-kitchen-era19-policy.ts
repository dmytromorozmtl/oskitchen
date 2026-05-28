/**
 * Briefing kitchen pack ↔ KDS priority lane — Evolution Era 19 Workstream B Cycle 24.
 */

import { KDS_PRIORITY_LANE_ERA19_POLICY_ID } from "@/lib/kitchen/kds-priority-lane-era19-policy";

export const OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-kitchen-v1" as const;

export const OWNER_DAILY_BRIEFING_KITCHEN_ERA19_EXTENDS_POLICIES = [
  KDS_PRIORITY_LANE_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_KITCHEN_ERA19_BACKLOG_ID = "KOS-E19-024" as const;
