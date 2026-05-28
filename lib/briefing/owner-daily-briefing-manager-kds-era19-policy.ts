/**
 * Briefing manager pack ↔ KDS priority lane — Evolution Era 19 Workstream B Cycle 25.
 */

import { KDS_PRIORITY_LANE_ERA19_POLICY_ID } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19-policy";

export const OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-manager-kds-v1" as const;

export const OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_EXTENDS_POLICIES = [
  KDS_PRIORITY_LANE_ERA19_POLICY_ID,
  OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_BACKLOG_ID = "KOS-E19-025" as const;
