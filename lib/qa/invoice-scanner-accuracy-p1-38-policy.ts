/**
 * P1-38 — AI invoice scanner accuracy: 100 invoices with ground truth → field-level accuracy.
 *
 * @see docs/invoice-scanner-accuracy-p1-38.md
 * @see lib/qa/invoice-scanner-accuracy-corpus.ts
 */

export {
  INVOICE_OCR_ACCURACY_CORPUS_P2_96_COUNT,
  buildInvoiceOcrAccuracyCorpusP2_96,
} from "@/lib/qa/invoice-scanner-accuracy-corpus";

export const INVOICE_SCANNER_ACCURACY_P1_38_POLICY_ID =
  "invoice-scanner-accuracy-p1-38-v1" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_DOC =
  "docs/invoice-scanner-accuracy-p1-38.md" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT =
  "artifacts/invoice-scanner-accuracy-p1-38.json" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_SCORING_MODULE =
  "lib/qa/invoice-scanner-accuracy-p1-38-scoring.ts" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_AUDIT_MODULE =
  "lib/qa/invoice-scanner-accuracy-p1-38-audit.ts" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_UNIT_TEST =
  "tests/unit/invoice-scanner-accuracy-p1-38.test.ts" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_CHECK_NPM_SCRIPT =
  "check:invoice-scanner-accuracy-p1-38" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_CI_NPM_SCRIPT =
  "test:ci:invoice-scanner-accuracy-p1-38" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_INVOICE_COUNT = 100 as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT = 85 as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_HEADER_FIELDS = [
  "supplierName",
  "invoiceNumber",
  "invoiceDate",
  "dueDate",
  "totalAmount",
  "taxAmount",
] as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_LINE_FIELDS = [
  "description",
  "quantity",
  "unitPrice",
  "totalPrice",
] as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_FLOW_STEPS = [
  "load_corpus_100",
  "score_field_level",
  "assert_accuracy_threshold",
] as const;

export const INVOICE_SCANNER_ACCURACY_P1_38_WIRING_PATHS = [
  INVOICE_SCANNER_ACCURACY_P1_38_DOC,
  INVOICE_SCANNER_ACCURACY_P1_38_SCORING_MODULE,
  INVOICE_SCANNER_ACCURACY_P1_38_AUDIT_MODULE,
  INVOICE_SCANNER_ACCURACY_P1_38_UNIT_TEST,
  INVOICE_SCANNER_ACCURACY_P1_38_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_P1_38_CI_WORKFLOW,
  "lib/qa/invoice-scanner-accuracy-corpus.ts",
  "lib/qa/invoice-scanner-accuracy-scoring.ts",
  "lib/qa/invoice-scanner-ocr-mapper.ts",
] as const;

export function isInvoiceScannerAccuracyP138Pass(fieldAccuracyPct: number): boolean {
  return fieldAccuracyPct >= INVOICE_SCANNER_ACCURACY_P1_38_MIN_FIELD_PCT;
}
