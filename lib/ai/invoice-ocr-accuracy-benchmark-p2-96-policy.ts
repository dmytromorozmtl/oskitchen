/**
 * Blueprint P2-96 — Invoice OCR accuracy benchmark (100 invoices).
 *
 * @see docs/invoice-ocr-accuracy-benchmark.md
 * @see scripts/run-invoice-ocr-accuracy-benchmark-p2-96.ts
 */

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID =
  "invoice-ocr-accuracy-benchmark-p2-96-v1" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC =
  "docs/invoice-ocr-accuracy-benchmark.md" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_LEGACY_POLICY =
  "lib/qa/invoice-scanner-accuracy-benchmark-policy.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH =
  "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-operations.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SERVICE_PATH =
  "services/ai/invoice-ocr-accuracy-benchmark-p2-96-service.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_INVOICES = 100 as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_MIN_ACCURACY_PCT = 85 as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT =
  "artifacts/invoice-ocr-accuracy-benchmark-p2-96-summary.json" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT = 4 as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_AUDIT_SCRIPT =
  "scripts/audit-invoice-ocr-accuracy-benchmark-p2-96.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_RUN_SCRIPT =
  "scripts/run-invoice-ocr-accuracy-benchmark-p2-96.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_NPM_SCRIPT =
  "audit:invoice-ocr-accuracy-benchmark-p2-96" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_TEST_NPM_SCRIPT =
  "test:ci:invoice-ocr-accuracy-benchmark-p2-96" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_UNIT_TEST =
  "tests/unit/invoice-ocr-accuracy-benchmark-p2-96.test.ts" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_WIRING_PATHS = [
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_DOC,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_OPERATIONS_PATH,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SERVICE_PATH,
  "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-audit.ts",
  "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-content.ts",
  "lib/qa/invoice-scanner-accuracy-corpus.ts",
  "lib/qa/invoice-scanner-accuracy-scoring.ts",
  "lib/qa/invoice-scanner-ocr-mapper.ts",
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_RUN_SCRIPT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_UNIT_TEST,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_LEGACY_POLICY,
] as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "not certified",
  "golden corpus",
] as const;
