/**
 * Blueprint P2-94 — Packing verification (QR/label scan, allergens, delivery bag checklist).
 *
 * @see docs/packing-verification-kds.md
 * @see app/dashboard/kitchen/packing-verification/page.tsx
 */

export const PACKING_VERIFICATION_P2_94_POLICY_ID = "packing-verification-p2-94-v1" as const;

export const PACKING_VERIFICATION_P2_94_DOC = "docs/packing-verification-kds.md" as const;

export const PACKING_VERIFICATION_P2_94_LEGACY_DOC = "docs/PACKING_VERIFICATION.md" as const;

export const PACKING_VERIFICATION_P2_94_CONTENT_PATH =
  "lib/kitchen/packing-verification-p2-94-content.ts" as const;

export const PACKING_VERIFICATION_P2_94_OPERATIONS_PATH =
  "lib/kitchen/packing-verification-p2-94-operations.ts" as const;

export const PACKING_VERIFICATION_P2_94_SERVICE_PATH =
  "services/kitchen/packing-verification-p2-94-service.ts" as const;

export const PACKING_VERIFICATION_P2_94_COMPONENT =
  "components/kitchen/packing-verification-panel.tsx" as const;

export const PACKING_VERIFICATION_P2_94_PAGE =
  "app/dashboard/kitchen/packing-verification/page.tsx" as const;

export const PACKING_VERIFICATION_P2_94_ROUTE = "/dashboard/kitchen/packing-verification" as const;

export const PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT = 3 as const;

export const PACKING_VERIFICATION_P2_94_TEST_IDS = [
  "packing-verification",
  "packing-qr-label-scan",
  "packing-allergens",
  "packing-delivery-bag-checklist",
] as const;

export const PACKING_VERIFICATION_P2_94_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "packing",
  "not certified",
] as const;

export const PACKING_VERIFICATION_P2_94_SCANNER_ROUTE = "/dashboard/packing/scanner" as const;

export const PACKING_VERIFICATION_P2_94_AUDIT_SCRIPT =
  "scripts/audit-packing-verification-p2-94.ts" as const;

export const PACKING_VERIFICATION_P2_94_NPM_SCRIPT = "audit:packing-verification-p2-94" as const;

export const PACKING_VERIFICATION_P2_94_UNIT_TEST =
  "tests/unit/packing-verification-p2-94.test.ts" as const;

export const PACKING_VERIFICATION_P2_94_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PACKING_VERIFICATION_P2_94_WIRING_PATHS = [
  PACKING_VERIFICATION_P2_94_DOC,
  PACKING_VERIFICATION_P2_94_CONTENT_PATH,
  PACKING_VERIFICATION_P2_94_OPERATIONS_PATH,
  PACKING_VERIFICATION_P2_94_SERVICE_PATH,
  PACKING_VERIFICATION_P2_94_COMPONENT,
  PACKING_VERIFICATION_P2_94_PAGE,
  "lib/kitchen/packing-verification-p2-94-policy.ts",
  "lib/kitchen/packing-verification-p2-94-audit.ts",
  "actions/packing-verify.ts",
  "lib/packing/packing-focus-era18.ts",
  "services/packing/load-packing-page-data.ts",
  PACKING_VERIFICATION_P2_94_UNIT_TEST,
  PACKING_VERIFICATION_P2_94_LEGACY_DOC,
] as const;
