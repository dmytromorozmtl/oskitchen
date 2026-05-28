/**
 * POS receipt / shift closeout spot check — Evolution Era 17 Workstream E Cycle 24 (engineering Cycle 25).
 *
 * Documents and test-backs shift variance math and receipt total consistency.
 * Does NOT claim manager variance approval UI or hardware closeout certification.
 */

import { POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID } from "@/lib/pos/pos-operator-runbook-era17-policy";

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID =
  "era17-pos-receipt-shift-spotcheck-v1" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_EXTENDS_POLICIES = [
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_PROOF_STATUS =
  "closeout_math_spotcheck_documented" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_MATH_MODULE =
  "lib/pos/pos-shift-closeout-math.ts" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_OPERATOR_DOC =
  "docs/pos-receipt-shift-spotcheck-era17.md" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-receipt-shift-spotcheck-era17.ts" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pos-receipt-shift-spotcheck-summary.json" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_NPM_SCRIPT =
  "smoke:pos-receipt-shift-spotcheck" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SPOTCHECK_STEPS = [
  "Run one CASH sale on an open shift — note receipt subtotal, tax, discount, total",
  "Verify receipt line totals sum to subtotal on /dashboard/pos/receipts",
  "Confirm CARD or terminal-placeholder sales are excluded from shift cash expected total",
  "Close shift with counted closing cash — compare expected vs variance on shifts page",
  "Document non-zero variance in shift notes before close (manager review)",
  "Run npm run smoke:pos-receipt-shift-spotcheck — review pos-receipt-shift-spotcheck-summary.json",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_EDGE_CASES = [
  "expectedCash = openingCash + sum(CASH COMPLETED transaction totals)",
  "card and terminal-placeholder modes excluded from cash closeout sum",
  "variance = closingCash - expectedCash",
  "receipt total = subtotal - discount + tax (within rounding epsilon)",
  "line item totals sum to subtotal when spot-checking receipt",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_MARKERS = [
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
  "smoke:pos-receipt-shift-spotcheck",
  "closeout_math_spotcheck_documented",
  "pos-shift-closeout-math",
  "receiptTotalsConsistent",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_FORBIDDEN_CLAIMS = [
  "automated variance approval",
  "hardware drawer certification",
  "rush-hour closeout certification",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CI_SCRIPTS = [
  "test:ci:pos-receipt-shift-spotcheck-era17",
  "test:ci:pos-receipt-shift-spotcheck-era17:cert",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_UNIT_TESTS = [
  "tests/unit/pos-shift-closeout-math.test.ts",
  "tests/unit/pos-receipt-shift-spotcheck-era17-policy.test.ts",
  "tests/unit/pos-receipt-shift-spotcheck-era17-cert-live.test.ts",
  "tests/unit/pos-shift-service.test.ts",
  "tests/unit/pos-receipt-service.test.ts",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS = [
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/POS_REGISTER_SHIFTS.md",
] as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_REVIEW_SECTION =
  "Era 17 POS receipt / shift spot check (2026-05-28)" as const;

export const POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_BACKLOG_ID = "KOS-E17-025" as const;
