/**
 * Absolute Final Tasks 101–115 — QA full coverage for P3 features 86–100.
 *
 * Each slot adds behavioral regression tests beyond wiring cert suites.
 *
 * @see tests/unit/absolute-final-qa-full-coverage-01-multi-currency.test.ts
 */

export const QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-qa-full-coverage-v1" as const;

export type QaFullCoverageSlot = {
  taskNumber: number;
  featureTaskNumber: number;
  featureKey: string;
  label: string;
  baseCertTest: string;
  qaTest: string;
  ciScript: string;
  ciCertScript: string;
};

export const QA_FULL_COVERAGE_SLOTS: readonly QaFullCoverageSlot[] = [
  {
    taskNumber: 101,
    featureTaskNumber: 86,
    featureKey: "multi-currency-support",
    label: "Multi-currency support",
    baseCertTest: "tests/unit/multi-currency-support.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-01-multi-currency.test.ts",
    ciScript: "test:ci:qa-full-coverage-01-multi-currency",
    ciCertScript: "test:ci:qa-full-coverage-01-multi-currency:cert",
  },
  {
    taskNumber: 102,
    featureTaskNumber: 87,
    featureKey: "eu-data-residency-roadmap",
    label: "EU data residency roadmap",
    baseCertTest: "tests/unit/eu-data-residency-roadmap-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-02-eu-data-residency.test.ts",
    ciScript: "test:ci:qa-full-coverage-02-eu-data-residency",
    ciCertScript: "test:ci:qa-full-coverage-02-eu-data-residency:cert",
  },
  {
    taskNumber: 103,
    featureTaskNumber: 88,
    featureKey: "regional-tax-compliance",
    label: "Regional tax compliance",
    baseCertTest: "tests/unit/regional-tax-compliance-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-03-regional-tax.test.ts",
    ciScript: "test:ci:qa-full-coverage-03-regional-tax",
    ciCertScript: "test:ci:qa-full-coverage-03-regional-tax:cert",
  },
  {
    taskNumber: 104,
    featureTaskNumber: 89,
    featureKey: "app-marketplace-third-party",
    label: "App marketplace 3rd party",
    baseCertTest: "tests/unit/app-marketplace-third-party-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-04-app-marketplace.test.ts",
    ciScript: "test:ci:qa-full-coverage-04-app-marketplace",
    ciCertScript: "test:ci:qa-full-coverage-04-app-marketplace:cert",
  },
  {
    taskNumber: 105,
    featureTaskNumber: 90,
    featureKey: "device-status-dashboard",
    label: "Device status dashboard",
    baseCertTest: "tests/unit/device-status-dashboard-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-05-device-status.test.ts",
    ciScript: "test:ci:qa-full-coverage-05-device-status",
    ciCertScript: "test:ci:qa-full-coverage-05-device-status:cert",
  },
  {
    taskNumber: 106,
    featureTaskNumber: 91,
    featureKey: "data-migration-wizard",
    label: "Data migration wizard",
    baseCertTest: "tests/unit/data-migration-wizard-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-06-data-migration.test.ts",
    ciScript: "test:ci:qa-full-coverage-06-data-migration",
    ciCertScript: "test:ci:qa-full-coverage-06-data-migration:cert",
  },
  {
    taskNumber: 107,
    featureTaskNumber: 92,
    featureKey: "visual-floor-plan-editor",
    label: "Visual floor plan editor",
    baseCertTest: "tests/unit/visual-floor-plan-editor-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-07-floor-plan.test.ts",
    ciScript: "test:ci:qa-full-coverage-07-floor-plan",
    ciCertScript: "test:ci:qa-full-coverage-07-floor-plan:cert",
  },
  {
    taskNumber: 108,
    featureTaskNumber: 93,
    featureKey: "kds-daisy-chain-config",
    label: "KDS daisy-chain config",
    baseCertTest: "tests/unit/kds-daisy-chain-config-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-08-kds-daisy-chain.test.ts",
    ciScript: "test:ci:qa-full-coverage-08-kds-daisy-chain",
    ciCertScript: "test:ci:qa-full-coverage-08-kds-daisy-chain:cert",
  },
  {
    taskNumber: 109,
    featureTaskNumber: 94,
    featureKey: "kds-expedite-screen",
    label: "Expedite screen polish",
    baseCertTest: "tests/unit/kds-expedite-screen-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-09-kds-expedite.test.ts",
    ciScript: "test:ci:qa-full-coverage-09-kds-expedite",
    ciCertScript: "test:ci:qa-full-coverage-09-kds-expedite:cert",
  },
  {
    taskNumber: 110,
    featureTaskNumber: 95,
    featureKey: "white-label-storefront-depth",
    label: "White-label storefront depth",
    baseCertTest: "tests/unit/white-label-storefront-depth-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-10-white-label.test.ts",
    ciScript: "test:ci:qa-full-coverage-10-white-label",
    ciCertScript: "test:ci:qa-full-coverage-10-white-label:cert",
  },
  {
    taskNumber: 111,
    featureTaskNumber: 96,
    featureKey: "chart-of-accounts-mapping",
    label: "Chart of accounts mapping",
    baseCertTest: "tests/unit/chart-of-accounts-mapping-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-11-coa-mapping.test.ts",
    ciScript: "test:ci:qa-full-coverage-11-coa-mapping",
    ciCertScript: "test:ci:qa-full-coverage-11-coa-mapping:cert",
  },
  {
    taskNumber: 112,
    featureTaskNumber: 97,
    featureKey: "journal-entry-export",
    label: "Journal entry export",
    baseCertTest: "tests/unit/journal-entry-export-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-12-journal-export.test.ts",
    ciScript: "test:ci:qa-full-coverage-12-journal-export",
    ciCertScript: "test:ci:qa-full-coverage-12-journal-export:cert",
  },
  {
    taskNumber: 113,
    featureTaskNumber: 98,
    featureKey: "pnl-reconciliation-view",
    label: "P&L reconciliation view",
    baseCertTest: "tests/unit/pnl-reconciliation-view-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-13-pnl-reconciliation.test.ts",
    ciScript: "test:ci:qa-full-coverage-13-pnl-reconciliation",
    ciCertScript: "test:ci:qa-full-coverage-13-pnl-reconciliation:cert",
  },
  {
    taskNumber: 114,
    featureTaskNumber: 99,
    featureKey: "accountant-portal",
    label: "Accountant portal",
    baseCertTest: "tests/unit/accountant-portal-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-14-accountant-portal.test.ts",
    ciScript: "test:ci:qa-full-coverage-14-accountant-portal",
    ciCertScript: "test:ci:qa-full-coverage-14-accountant-portal:cert",
  },
  {
    taskNumber: 115,
    featureTaskNumber: 100,
    featureKey: "kds-driver-eta-tracking",
    label: "Driver ETA tracking in KDS",
    baseCertTest: "tests/unit/kds-driver-eta-tracking-absolute-final.test.ts",
    qaTest: "tests/unit/absolute-final-qa-full-coverage-15-driver-eta.test.ts",
    ciScript: "test:ci:qa-full-coverage-15-driver-eta",
    ciCertScript: "test:ci:qa-full-coverage-15-driver-eta:cert",
  },
] as const;

export const QA_FULL_COVERAGE_POLICY_PATH =
  "lib/qa/absolute-final-qa-full-coverage-policy.ts" as const;

export const QA_FULL_COVERAGE_AUDIT_PATH =
  "lib/qa/absolute-final-qa-full-coverage-audit.ts" as const;

export const QA_FULL_COVERAGE_WIRING_PATHS = [
  QA_FULL_COVERAGE_POLICY_PATH,
  QA_FULL_COVERAGE_AUDIT_PATH,
  ...QA_FULL_COVERAGE_SLOTS.map((s) => s.qaTest),
] as const;

export function getQaFullCoverageSlot(taskNumber: number): QaFullCoverageSlot | undefined {
  return QA_FULL_COVERAGE_SLOTS.find((s) => s.taskNumber === taskNumber);
}

export function getCompletedQaSlots(completedTaskNumbers: readonly number[]): QaFullCoverageSlot[] {
  const set = new Set(completedTaskNumbers);
  return QA_FULL_COVERAGE_SLOTS.filter((s) => set.has(s.taskNumber));
}
