/**
 * P2-50 — POS shift open→close E2E: shift→transactions→void→refund→close→reconcile.
 *
 * @see docs/pos-shift-open-close-p2-50.md
 * @see e2e/pos-checkout-e2e.spec.ts
 * @see e2e/helpers/pos-checkout-e2e-flow.ts
 */

export const POS_SHIFT_OPEN_CLOSE_P2_50_POLICY_ID = "pos-shift-open-close-p2-50-v1" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_DOC = "docs/pos-shift-open-close-p2-50.md" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT =
  "artifacts/pos-shift-open-close-p2-50.json" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_AUDIT_MODULE =
  "lib/qa/pos-shift-open-close-p2-50-audit.ts" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_CHECK_NPM_SCRIPT =
  "check:pos-shift-open-close-p2-50" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_CI_NPM_SCRIPT =
  "test:ci:pos-shift-open-close-p2-50" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_UNIT_TEST =
  "tests/unit/pos-shift-open-close-p2-50.test.ts" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC = "e2e/pos-checkout-e2e.spec.ts" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER =
  "e2e/helpers/pos-checkout-e2e-flow.ts" as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER =
  "e2e/helpers/pos-shift-open-close-flow.ts" as const;

/** Gap P2-50 lifecycle — maps to pos-checkout-e2e + balanced history reconcile. */
export const POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_STEPS = [
  "open_shift",
  "transactions",
  "refund",
  "void",
  "close_shift",
  "reconcile_totals",
] as const;

export const POS_SHIFT_OPEN_CLOSE_P2_50_WIRING_PATHS = [
  POS_SHIFT_OPEN_CLOSE_P2_50_DOC,
  POS_SHIFT_OPEN_CLOSE_P2_50_ARTIFACT,
  POS_SHIFT_OPEN_CLOSE_P2_50_AUDIT_MODULE,
  POS_SHIFT_OPEN_CLOSE_P2_50_UNIT_TEST,
  POS_SHIFT_OPEN_CLOSE_P2_50_CI_WORKFLOW,
  POS_SHIFT_OPEN_CLOSE_P2_50_E2E_SPEC,
  POS_SHIFT_OPEN_CLOSE_P2_50_FLOW_HELPER,
  POS_SHIFT_OPEN_CLOSE_P2_50_RECONCILE_HELPER,
  "lib/pos/pos-checkout-e2e-policy.ts",
  "services/pos/pos-refund-service.ts",
  "services/pos/pos-void-service.ts",
  "lib/pos/pos-shift-closeout-math.ts",
] as const;
