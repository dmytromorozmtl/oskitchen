/**
 * Briefing production calendar drill convergence — Evolution Era 19 Convergence Cycle 36.
 *
 * Unifies overdue production deep-links across briefing tiles, actions, and risk radar.
 */

import { OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19-policy";
import { PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID } from "@/lib/production/production-calendar-drill-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_PRODUCTION_DRILL_CONVERGENCE_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-production-drill-convergence-v1" as const;

export const OWNER_DAILY_BRIEFING_PRODUCTION_DRILL_CONVERGENCE_ERA19_EXTENDS_POLICIES = [
  OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
] as const;

export const OWNER_DAILY_BRIEFING_PRODUCTION_DRILL_CONVERGENCE_ERA19_BACKLOG_ID =
  "KOS-E19-036" as const;
