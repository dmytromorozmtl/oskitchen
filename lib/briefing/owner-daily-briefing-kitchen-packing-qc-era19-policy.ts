/**
 * Briefing kitchen pack ↔ packing QC clarity — Evolution Era 19 Workstream B Cycle 33.
 *
 * Kitchen Today tiles and actions deep-link to the packing QC checklist when
 * KDS priority pressure and open pack jobs align. No scanner certification claims.
 */

import { OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19-policy";
import { PACKING_QC_CLARITY_ERA19_POLICY_ID } from "@/lib/packing/packing-qc-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_KITCHEN_PACKING_QC_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-kitchen-packing-qc-v1" as const;

export const OWNER_DAILY_BRIEFING_KITCHEN_PACKING_QC_ERA19_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID,
  PACKING_QC_CLARITY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_KITCHEN_PACKING_QC_ERA19_BACKLOG_ID = "KOS-E19-033" as const;

export const BRIEFING_KITCHEN_PACKING_QC_TILE_ID = "kitchen-packing-qc-handoff" as const;
