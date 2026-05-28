/**
 * KDS priority lane — Evolution Era 19 Workstream E Cycle 23.
 *
 * Allergen + overdue scoring for prep and expo columns.
 * Does not claim rush-hour SLO certification or Toast expo parity.
 */

import { KDS_TICKET_FOCUS_ERA18_POLICY_ID } from "@/lib/kitchen/kds-ticket-focus-era18-policy";

export const KDS_PRIORITY_LANE_ERA19_POLICY_ID = "era19-kds-priority-lane-v1" as const;

export const KDS_PRIORITY_LANE_ERA19_PROOF_STATUS = "kds_priority_lane_wired" as const;

export const KDS_PRIORITY_LANE_ERA19_BACKLOG_ID = "KOS-E19-023" as const;

export const KDS_PRIORITY_LANE_ERA19_EXTENDS_POLICIES = [
  KDS_TICKET_FOCUS_ERA18_POLICY_ID,
] as const;

export const KDS_PRIORITY_LANE_MAX_ITEMS = 3 as const;

export const KDS_PRIORITY_LANE_ANCHOR = "kds-priority-lane-strip" as const;

export const KDS_KITCHEN_ROUTE = "/dashboard/kitchen" as const;

export const BRIEFING_KDS_PRIORITY_LANE_HREF =
  `${KDS_KITCHEN_ROUTE}#${KDS_PRIORITY_LANE_ANCHOR}` as const;
