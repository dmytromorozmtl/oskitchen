/**
 * Briefing production calendar today tile — Evolution Era 19 Workstream B Cycle 3.
 *
 * Real productionPlanTask focus for Today briefing; deep-links to calendar day anchors
 * and operator drill when batches are overdue. No drag-and-drop or KDS sync claims.
 */

import { PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID } from "@/lib/production/production-calendar-drill-clarity-era19-policy";
import { PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID } from "@/lib/production/production-calendar-today-focus-era18-policy";

export const OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-production-calendar-v1" as const;

export const OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_EXTENDS_POLICIES = [
  PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_BACKLOG_ID = "KOS-E19-003" as const;
