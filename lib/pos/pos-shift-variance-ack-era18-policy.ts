/**
 * POS shift variance acknowledgment — Evolution Era 18 Workstream F Cycle 8.
 *
 * Requires manager checkbox + note when |variance| > 0 before shift close.
 * Does NOT claim automated variance approval, manager PIN, or Toast closeout parity.
 */

import { POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-closeout-preview-era18-policy";

export const POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID =
  "era18-pos-shift-variance-ack-v1" as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_DECISION_DATE = "2026-05-28" as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_EXTENDS_POLICIES = [
  POS_SHIFT_CLOSEOUT_PREVIEW_ERA18_POLICY_ID,
] as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_PROOF_STATUS =
  "shift_variance_ack_wired" as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_UX_TARGETS = [
  "Checkbox acknowledgment when variance is short or over",
  "Required variance note (min length) before close submit",
  "Server-side validation in posCloseShiftAction",
  "Audit metadata records varianceAcknowledged + varianceNote",
] as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_FORBIDDEN_CLAIMS = [
  "automated variance approval",
  "manager pin closeout flow",
  "toast shift close parity",
] as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_UNIT_TESTS = [
  "tests/unit/pos-shift-closeout-preview.test.ts",
  "tests/unit/actions-pos-rbac.test.ts",
  "tests/unit/pos-shift-service.test.ts",
] as const;

export const POS_SHIFT_VARIANCE_ACK_ERA18_BACKLOG_ID = "KOS-E18-008" as const;
