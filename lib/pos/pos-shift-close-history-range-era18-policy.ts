/**
 * POS shift close history date range — Evolution Era 18 Workstream F Cycle 12.
 *
 * Bounded 7/30/90-day filter on history panel and CSV export.
 * Does NOT claim full accounting period reporting or Toast payroll parity.
 */

import { POS_SHIFT_CLOSE_CSV_ERA18_POLICY_ID } from "@/lib/pos/pos-shift-close-csv-era18-policy";

export const POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_POLICY_ID =
  "era18-pos-shift-close-history-range-v1" as const;

export const POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_PROOF_STATUS =
  "shift_close_history_range_wired" as const;

export const POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_EXTENDS_POLICIES = [
  POS_SHIFT_CLOSE_CSV_ERA18_POLICY_ID,
] as const;

export const POS_SHIFT_CLOSE_HISTORY_RANGE_ERA18_BACKLOG_ID = "KOS-E18-012" as const;
