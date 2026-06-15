/**
 * Briefing owner pack ↔ KDS priority lane — Evolution Era 19 Workstream B Cycle 26.
 */

import { KDS_PRIORITY_LANE_ERA19_POLICY_ID } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19-policy";

export const OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-owner-kds-v1" as const;

export const OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_EXTENDS_POLICIES = [
  KDS_PRIORITY_LANE_ERA19_POLICY_ID,
  OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_BACKLOG_ID = "KOS-E19-026" as const;
