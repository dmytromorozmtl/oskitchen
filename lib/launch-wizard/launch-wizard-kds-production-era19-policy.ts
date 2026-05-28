/**
 * Launch Wizard KDS/production operator cross-links — Evolution Era 19 Workstream C Cycle 28.
 *
 * Connects wizard KDS step to kitchen priority lane and POS manager override flows.
 * No rush-hour SLO, Toast expo, or offline POS claims.
 */

import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { LAUNCH_WIZARD_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import {
  POS_MANAGER_OVERRIDE_ANCHOR,
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID,
} from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import { POS_CASHIER_SPEED_MODE_ROUTE } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

export const LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID =
  "era19-launch-wizard-kds-production-v1" as const;

export const LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_BACKLOG_ID = "KOS-E19-028" as const;

export const LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_PROOF_STATUS =
  "launch_wizard_kds_production_crosslink_wired" as const;

export const LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_EXTENDS_POLICIES = [
  LAUNCH_WIZARD_ERA19_POLICY_ID,
  POS_MANAGER_OVERRIDE_CLARITY_ERA19_POLICY_ID,
] as const;

export const LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR =
  "launch-wizard-kds-production-links" as const;

export const LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF =
  `${POS_CASHIER_SPEED_MODE_ROUTE}#${POS_MANAGER_OVERRIDE_ANCHOR}` as const;

export const LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF = BRIEFING_KDS_PRIORITY_LANE_HREF;

export const LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE =
  "/dashboard/production/calendar" as const;

export const LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE = "/dashboard/production" as const;
