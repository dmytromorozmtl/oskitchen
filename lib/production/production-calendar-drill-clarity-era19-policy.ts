/**
 * Production calendar operator drill clarity — Evolution Era 19 Workstream E Cycle 30.
 *
 * In-app 4-step drill checklist on the production calendar page.
 * Does not claim staging drill PASS, drag-and-drop, KDS sync, or rush-hour certification.
 */

import { PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID } from "@/lib/production/production-calendar-operator-drill-era17-policy";
import { PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID } from "@/lib/production/production-calendar-today-focus-era18-policy";

export const PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID =
  "era19-production-calendar-drill-clarity-v1" as const;

export const PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_BACKLOG_ID = "KOS-E19-030" as const;

export const PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_PROOF_STATUS =
  "production_calendar_drill_clarity_wired" as const;

export const PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_EXTENDS_POLICIES = [
  PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID,
] as const;

export const PRODUCTION_CALENDAR_DRILL_ANCHOR = "production-calendar-drill" as const;

export const PRODUCTION_CALENDAR_DRILL_ROUTE = "/dashboard/production/calendar" as const;
