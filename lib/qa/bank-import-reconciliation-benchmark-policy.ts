/**
 * Blueprint P0-19 — Bank import reconciliation accuracy (3 months CSV/PDF, category match rate).
 */

export const BANK_IMPORT_RECONCILIATION_BENCHMARK_POLICY_ID =
  "bank-import-reconciliation-benchmark-v1" as const;

export const BANK_IMPORT_RECONCILIATION_MIN_MONTHS = 3 as const;

export const BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS = 90 as const;

export const BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT = 85 as const;

export const BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT =
  "artifacts/bank-import-reconciliation-benchmark-summary.json" as const;

export const BANK_IMPORT_RECONCILIATION_BENCHMARK_SCRIPT =
  "scripts/run-bank-import-reconciliation-benchmark.ts" as const;

export const BANK_IMPORT_RECONCILIATION_BENCHMARK_UNIT_TEST =
  "tests/unit/bank-import-reconciliation-benchmark.test.ts" as const;

export const BANK_IMPORT_RECONCILIATION_BENCHMARK_NPM_SCRIPT =
  "test:ci:bank-import-reconciliation-benchmark" as const;
