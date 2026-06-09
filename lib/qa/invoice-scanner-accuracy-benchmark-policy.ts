/**
 * Blueprint P0-18 — Invoice scanner accuracy benchmark (50+ invoices, >85%).
 */

export const INVOICE_SCANNER_ACCURACY_BENCHMARK_POLICY_ID =
  "invoice-scanner-accuracy-benchmark-v1" as const;

export const INVOICE_SCANNER_ACCURACY_MIN_INVOICES = 50 as const;

export const INVOICE_SCANNER_ACCURACY_MIN_OVERALL_PCT = 85 as const;

export const INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT =
  "artifacts/invoice-scanner-accuracy-benchmark-summary.json" as const;

export const INVOICE_SCANNER_ACCURACY_BENCHMARK_SCRIPT =
  "scripts/run-invoice-scanner-accuracy-benchmark.ts" as const;

export const INVOICE_SCANNER_ACCURACY_BENCHMARK_UNIT_TEST =
  "tests/unit/invoice-scanner-accuracy-benchmark.test.ts" as const;

export const INVOICE_SCANNER_ACCURACY_BENCHMARK_NPM_SCRIPT =
  "test:ci:invoice-scanner-accuracy-benchmark" as const;
