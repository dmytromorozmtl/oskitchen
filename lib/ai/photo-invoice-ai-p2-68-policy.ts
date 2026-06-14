/**
 * P2-68 — Photo invoice AI: paper receipt → supplier document (Poster POS parity).
 *
 * @see docs/photo-invoice-ai-p2-68.md
 */

export const PHOTO_INVOICE_AI_P2_68_POLICY_ID = "photo-invoice-ai-p2-68-v1" as const;

export const PHOTO_INVOICE_AI_P2_68_DOC = "docs/photo-invoice-ai-p2-68.md" as const;

export const PHOTO_INVOICE_AI_P2_68_ARTIFACT = "artifacts/photo-invoice-ai-p2-68.json" as const;

export const PHOTO_INVOICE_AI_P2_68_PAGE = "app/dashboard/inventory/photo-invoice/page.tsx" as const;

export const PHOTO_INVOICE_AI_P2_68_SCANNER_PAGE =
  "app/dashboard/inventory/invoice-scanner/page.tsx" as const;

export const PHOTO_INVOICE_AI_P2_68_PANEL =
  "components/inventory/invoice-scanner-mobile.tsx" as const;

export const PHOTO_INVOICE_AI_P2_68_BUILDER = "lib/ai/photo-invoice-ai-p2-68-builder.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_SERVICE =
  "services/ai/photo-invoice-ai-p2-68-service.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_SCANNER_SERVICE =
  "services/ai/invoice-scanner-service.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_ACTION = "actions/inventory/invoice-scanner.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_CORPUS_MODULE = "lib/ai/photo-invoice-ai-p2-68-corpus.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_SCORING_MODULE = "lib/ai/photo-invoice-ai-p2-68-scoring.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_AUDIT_MODULE = "lib/ai/photo-invoice-ai-p2-68-audit.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_ROUTE = "/dashboard/inventory/photo-invoice" as const;

export const PHOTO_INVOICE_AI_P2_68_PANEL_TEST_ID = "photo-invoice-supplier-document-panel" as const;

export const PHOTO_INVOICE_AI_P2_68_CAMERA_TEST_ID = "photo-invoice-receipt-camera-btn" as const;

export const PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_TEST_ID = "photo-invoice-supplier-doc-btn" as const;

export const PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT = 12 as const;

export const PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT = 100 as const;

export const PHOTO_INVOICE_AI_P2_68_SUPPLIER_DOC_STATUS = "PENDING" as const;

export const PHOTO_INVOICE_AI_P2_68_CHECK_NPM_SCRIPT = "check:photo-invoice-ai-p2-68" as const;

export const PHOTO_INVOICE_AI_P2_68_CI_NPM_SCRIPT = "test:ci:photo-invoice-ai-p2-68" as const;

export const PHOTO_INVOICE_AI_P2_68_UNIT_TEST =
  "tests/unit/photo-invoice-ai-p2-68.test.ts" as const;

export const PHOTO_INVOICE_AI_P2_68_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PHOTO_INVOICE_AI_P2_68_FLOW_STEPS = [
  "paper-receipt-capture",
  "ai-line-extraction",
  "supplier-document",
] as const;

export const PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES = [
  "photo_capture",
  "ai_line_extraction",
  "supplier_resolution",
  "supplier_document_creation",
  "receipt_image_attachment",
  "pending_status",
  "line_item_mapping",
  "confidence_review",
] as const;

export type PhotoInvoiceDocumentCapability =
  (typeof PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES)[number];

export const PHOTO_INVOICE_AI_P2_68_POSTER_POS_PARITY_NOTE =
  "Paper receipt photo → AI line items → PENDING supplier invoice document — comparable to Poster POS receipt capture, without claiming certified parity." as const;

export const PHOTO_INVOICE_AI_P2_68_WIRING_PATHS = [
  PHOTO_INVOICE_AI_P2_68_DOC,
  PHOTO_INVOICE_AI_P2_68_ARTIFACT,
  PHOTO_INVOICE_AI_P2_68_CORPUS_MODULE,
  PHOTO_INVOICE_AI_P2_68_SCORING_MODULE,
  PHOTO_INVOICE_AI_P2_68_AUDIT_MODULE,
  PHOTO_INVOICE_AI_P2_68_BUILDER,
  PHOTO_INVOICE_AI_P2_68_SERVICE,
  PHOTO_INVOICE_AI_P2_68_SCANNER_SERVICE,
  PHOTO_INVOICE_AI_P2_68_ACTION,
  PHOTO_INVOICE_AI_P2_68_PAGE,
  PHOTO_INVOICE_AI_P2_68_PANEL,
  PHOTO_INVOICE_AI_P2_68_UNIT_TEST,
  PHOTO_INVOICE_AI_P2_68_CI_WORKFLOW,
  "lib/inventory/invoice-scanner-types.ts",
] as const;
