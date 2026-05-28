/**
 * POS shift close focus — Evolution Era 18 Workstream F Cycle 27.
 *
 * Operator guidance for open shifts, variance closeout, and history review.
 * Does NOT claim Toast closeout parity, automated variance approval, or manager PIN.
 */

import { POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-variance-ack-era18-policy";

export const POS_SHIFT_CLOSE_FOCUS_ERA18_POLICY_ID = "era18-pos-shift-close-focus-v1" as const;

export const POS_SHIFT_CLOSE_FOCUS_ERA18_EXTENDS_POLICIES = [
  POS_SHIFT_VARIANCE_ACK_ERA18_POLICY_ID,
] as const;

export const POS_SHIFT_CLOSE_FOCUS_ERA18_PROOF_STATUS =
  "pos_shift_close_focus_attention_wired" as const;

export const POS_SHIFT_CLOSE_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-027" as const;
