/**
 * P1-29 — Invoice AI photo-first capture: photo → line items → draft PO.
 *
 * @see docs/invoice-ai-photo-first-p1-29.md
 */

export const INVOICE_AI_PHOTO_FIRST_P1_29_POLICY_ID = "invoice-ai-photo-first-p1-29-v1" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_DOC = "docs/invoice-ai-photo-first-p1-29.md" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_ARTIFACT =
  "artifacts/invoice-ai-photo-first-p1-29.json" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_SERVICE =
  "services/ai/invoice-scanner-service.ts" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_ACTION =
  "actions/inventory/invoice-scanner.ts" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_COMPONENT =
  "components/inventory/invoice-scanner-mobile.tsx" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_INVOICES_PAGE =
  "app/dashboard/accounting/invoices/page.tsx" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_PAGE =
  "app/dashboard/inventory/invoice-scanner/page.tsx" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_PANEL_TEST_ID = "invoice-scanner-panel" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_CAMERA_TEST_ID = "invoice-scan-camera-btn" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_CONFIRM_TEST_ID = "invoice-scan-confirm-btn" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_DRAFT_PO_STATUS = "DRAFT" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_CHECK_NPM_SCRIPT =
  "check:invoice-ai-photo-first-p1-29" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_CI_NPM_SCRIPT =
  "test:ci:invoice-ai-photo-first-p1-29" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_UNIT_TEST =
  "tests/unit/invoice-ai-photo-first-p1-29.test.ts" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_FLOW_STEPS = [
  "photo-capture",
  "ai-line-items",
  "draft-po",
] as const;

export const INVOICE_AI_PHOTO_FIRST_P1_29_WIRING_PATHS = [
  INVOICE_AI_PHOTO_FIRST_P1_29_DOC,
  INVOICE_AI_PHOTO_FIRST_P1_29_SERVICE,
  INVOICE_AI_PHOTO_FIRST_P1_29_ACTION,
  INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_COMPONENT,
  INVOICE_AI_PHOTO_FIRST_P1_29_INVOICES_PAGE,
  INVOICE_AI_PHOTO_FIRST_P1_29_SCANNER_PAGE,
  INVOICE_AI_PHOTO_FIRST_P1_29_UNIT_TEST,
  INVOICE_AI_PHOTO_FIRST_P1_29_ARTIFACT,
  INVOICE_AI_PHOTO_FIRST_P1_29_CI_WORKFLOW,
] as const;
