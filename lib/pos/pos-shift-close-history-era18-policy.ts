/**
 * POS shift close history — Evolution Era 18 Workstream F Cycle 9.
 *
 * Recent closed shifts with variance badges on /dashboard/pos/shifts.
 * Does NOT claim full labor/payroll reporting or Toast shift report parity.
 */

import { POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-variance-ack-era18-policy";

export const POS_SHIFT_CLOSE_HISTORY_ERA18_POLICY_ID =
  "era18-pos-shift-close-history-v1" as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_DECISION_DATE = "2026-05-28" as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_EXTENDS_POLICIES = [
  POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID,
] as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_PROOF_STATUS =
  "shift_close_history_wired" as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_SHIFTS_PAGE =
  "app/dashboard/pos/shifts/page.tsx" as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_PANEL_MODULE =
  "components/dashboard/pos-shift-close-history-panel.tsx" as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_DEFAULT_LIMIT = 10;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_FORBIDDEN_CLAIMS = [
  "full labor payroll reporting",
  "toast shift report parity",
  "automated variance approval",
] as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_UNIT_TESTS = [
  "tests/unit/pos-shift-close-history-era18.test.ts",
  "tests/unit/pos-shift-service.test.ts",
] as const;

export const POS_SHIFT_CLOSE_HISTORY_ERA18_BACKLOG_ID = "KOS-E18-009" as const;
