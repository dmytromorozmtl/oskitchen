/**
 * P3-94 — Native payment terminals / Stripe Terminal SDK deferred.
 *
 * @see docs/native-payment-terminal-deferral-p3-94.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_POLICY_ID =
  "native-payment-terminal-deferral-p3-94-v1" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC =
  "docs/native-payment-terminal-deferral-p3-94.md" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ARTIFACT =
  "artifacts/native-payment-terminal-deferral-p3-94.json" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CONTENT_MODULE =
  "lib/marketing/native-payment-terminal-deferral-p3-94-content.ts" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_AUDIT_MODULE =
  "lib/marketing/native-payment-terminal-deferral-p3-94-audit.ts" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CHECK_NPM_SCRIPT =
  "check:native-payment-terminal-deferral-p3-94" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UNIT_TEST =
  "tests/unit/native-payment-terminal-deferral-p3-94.test.ts" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ROADMAP_ITEM_ID =
  "stripe-terminal" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_WIRING_PATHS = [
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_DOC,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_ARTIFACT,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CONTENT_MODULE,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_AUDIT_MODULE,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UNIT_TEST,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_CI_WORKFLOW,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_ROADMAP,
  NATIVE_PAYMENT_TERMINAL_DEFERRAL_P3_94_UPSTREAM_PRODUCT_ROADMAP,
] as const;
