/**
 * Briefing cashier pack ↔ POS manager override — Evolution Era 19 Workstream B Cycle 29.
 *
 * Cashier Today tiles and actions deep-link to the manager override checklist.
 * No manager PIN flow, Toast override parity, or offline POS claims.
 */

import { OWNER_DAILY_BRIEFING_CASHIER_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import { POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID } from "@/lib/pos/pos-manager-override-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-cashier-manager-override-v1" as const;

export const OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_CASHIER_ERA19_POLICY_ID,
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_BACKLOG_ID =
  "KOS-E19-029" as const;

export const BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID =
  "pos-manager-override-handoff" as const;
