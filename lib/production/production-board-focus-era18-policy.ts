/**
 * Production board focus — Evolution Era 18 Workstream G Cycle 30.
 *
 * Prioritized attention for production command center work items.
 * Does not claim rush-hour KDS SLO or Restaurant365 production parity.
 */

import { PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID } from "@/lib/production/production-calendar-today-focus-era18-policy";

export const PRODUCTION_BOARD_FOCUS_ERA18_POLICY_ID = "era18-production-board-focus-v1" as const;

export const PRODUCTION_BOARD_FOCUS_ERA18_EXTENDS_POLICIES = [
  PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID,
] as const;

export const PRODUCTION_BOARD_FOCUS_ERA18_PROOF_STATUS =
  "production_board_focus_attention_wired" as const;

export const PRODUCTION_BOARD_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-030" as const;
