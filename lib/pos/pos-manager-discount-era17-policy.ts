/**
 * POS manager override / discount depth — Evolution Era 17 Workstream E Cycle 21 (engineering Cycle 22).
 *
 * Action-layer RBAC for explicit discounts and COMPED checkout; service-layer discount stacking tests.
 * Does NOT claim manager discount UI, hardware POS certification, or offline POS.
 */

import { POS_BROWSER_E2E_POLICY_ID } from "@/lib/ci/pos-browser-e2e-policy";
import { POS_TABLET_UX_ERA17_POLICY_ID } from "@/lib/pos/pos-tablet-ux-era17-policy";

export const POS_MANAGER_DISCOUNT_ERA17_POLICY_ID = "era17-pos-manager-discount-v1" as const;

export const POS_MANAGER_DISCOUNT_ERA17_DECISION_DATE = "2026-05-28" as const;

export const POS_MANAGER_DISCOUNT_ERA17_EXTENDS_POLICIES = [
  POS_BROWSER_E2E_POLICY_ID,
  POS_TABLET_UX_ERA17_POLICY_ID,
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_PROOF_STATUS = "discount_guard_depth_enforced" as const;

export const POS_MANAGER_DISCOUNT_ERA17_GUARD_MODULE = "lib/pos/pos-discount-guard.ts" as const;

export const POS_MANAGER_DISCOUNT_ERA17_ACTION_MODULE = "actions/pos.ts" as const;

export const POS_MANAGER_DISCOUNT_ERA17_OPERATOR_DOC =
  "docs/pos-manager-discount-operator-guide-era17.md" as const;

export const POS_MANAGER_DISCOUNT_ERA17_REQUIRED_PERMISSION = "pos.discount.apply" as const;

export const POS_MANAGER_DISCOUNT_ERA17_EDGE_CASES = [
  "explicit discountAmount > 0 requires pos.discount.apply",
  "COMPED payment mode requires pos.discount.apply even when discountAmount is zero",
  "zero discountAmount on non-COMPED checkout skips second permission check",
  "negative discountAmount rejected at action schema",
  "gift card and loyalty redemption stack at service layer without action-layer discount gate",
  "invalid gift card or loyalty redeem fails before order creation",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_CANONICAL_MARKERS = [
  POS_MANAGER_DISCOUNT_ERA17_POLICY_ID,
  "pos-discount-guard",
  "discount_guard_depth_enforced",
  "pos.discount.apply",
  "pos.checkout.discount",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_FORBIDDEN_CLAIMS = [
  "manager discount ui shipped",
  "hardware pos certified",
  "offline pos production ready",
  "toast manager override parity",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_CI_SCRIPTS = [
  "test:ci:pos-manager-discount-era17",
  "test:ci:pos-manager-discount-era17:cert",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_UNIT_TESTS = [
  "tests/unit/pos-discount-guard.test.ts",
  "tests/unit/pos-manager-discount-era17-policy.test.ts",
  "tests/unit/pos-manager-discount-era17-cert-live.test.ts",
  "tests/unit/actions-pos-rbac.test.ts",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_CANONICAL_DOC_PATHS = [
  POS_MANAGER_DISCOUNT_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const POS_MANAGER_DISCOUNT_ERA17_REVIEW_SECTION =
  "Era 17 POS manager discount depth (2026-05-28)" as const;

export const POS_MANAGER_DISCOUNT_ERA17_BACKLOG_ID = "KOS-E17-022" as const;
