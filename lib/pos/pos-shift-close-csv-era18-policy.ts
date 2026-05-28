/**
 * POS closed shift CSV export — Evolution Era 18 Workstream F Cycle 10.
 *
 * Bookkeeper handoff CSV from /api/pos/shifts/export — bounded row limit.
 * Does NOT claim full accounting export or Toast payroll parity.
 */

import { POS_SHIFT_CLOSE_HISTORY_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-close-history-era18-policy";

export const POS_SHIFT_CLOSE_CSV_ERA18_POLICY_ID =
  "era18-pos-shift-close-csv-v1" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_DECISION_DATE = "2026-05-28" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_EXTENDS_POLICIES = [
  POS_SHIFT_CLOSE_HISTORY_ERA18_POLICY_ID,
] as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_PROOF_STATUS = "shift_close_csv_wired" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_EXPORT_ROUTE =
  "app/api/pos/shifts/export/route.ts" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_CSV_MODULE =
  "lib/pos/pos-shift-close-csv-era18.ts" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_REQUIRED_PERMISSION = "pos.shift.close" as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_FORBIDDEN_CLAIMS = [
  "full accounting export",
  "toast shift report parity",
  "payroll certified export",
] as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_UNIT_TESTS = [
  "tests/unit/pos-shift-close-csv-era18.test.ts",
  "tests/unit/pos-shifts-export-rbac.test.ts",
] as const;

export const POS_SHIFT_CLOSE_CSV_ERA18_BACKLOG_ID = "KOS-E18-010" as const;
