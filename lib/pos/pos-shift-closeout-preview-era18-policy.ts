/**
 * POS shift closeout live preview — Evolution Era 18 Workstream F Cycle 6.
 *
 * Shows expected cash and variance before shift close on /dashboard/pos/shifts.
 * Does NOT claim automated variance approval, manager PIN, or hardware drawer certification.
 */

import { POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID } from "@/lib/pos/pos-receipt-shift-spotcheck-era17-policy";

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID =
  "era18-pos-shift-closeout-preview-v1" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_DECISION_DATE = "2026-05-28" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_EXTENDS_POLICIES = [
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
] as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_PROOF_STATUS =
  "shift_closeout_preview_wired" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_SHIFTS_PAGE =
  "app/dashboard/pos/shifts/page.tsx" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_CLOSE_FORM_MODULE =
  "components/dashboard/pos-shift-close-form.tsx" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_PREVIEW_MODULE =
  "lib/pos/pos-shift-closeout-preview.ts" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_UX_TARGETS = [
  "Opening cash + cash sales + expected cash summary before close",
  "Live variance as manager enters counted closing cash",
  "Short/over/balanced tone with note prompt for non-zero variance",
  "Card and terminal-placeholder sales excluded from cash expected (Era 17 math)",
] as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_FORBIDDEN_CLAIMS = [
  "automated variance approval",
  "manager pin closeout flow",
  "hardware drawer certification",
  "toast shift close parity",
] as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_UNIT_TESTS = [
  "tests/unit/pos-shift-closeout-preview.test.ts",
  "tests/unit/pos-shift-closeout-math.test.ts",
  "tests/unit/pos-shift-service.test.ts",
] as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_BACKLOG_ID = "KOS-E18-006" as const;
