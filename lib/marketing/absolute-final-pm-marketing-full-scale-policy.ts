/**
 * Absolute Final Tasks 131–145 — PM & Marketing full scale for P3 features 86–100.
 *
 * Each slot adds a GTM / sales / content surface with shared pm-gtm doc markers.
 *
 * @see tests/unit/absolute-final-pm-marketing-full-scale-01-multi-currency.test.ts
 */

export const PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-pm-marketing-full-scale-v1" as const;

export type PmMarketingTargetKind = "doc" | "component";

export type PmMarketingFullScaleSlot = {
  taskNumber: number;
  featureTaskNumber: number;
  featureKey: string;
  label: string;
  targetKind: PmMarketingTargetKind;
  targetPath: string;
  gtmTest: string;
  ciScript: string;
  ciCertScript: string;
};

export const PM_MARKETING_FULL_SCALE_SLOTS: readonly PmMarketingFullScaleSlot[] = [
  {
    taskNumber: 131,
    featureTaskNumber: 86,
    featureKey: "multi-currency-support",
    label: "Multi-currency support",
    targetKind: "doc",
    targetPath: "docs/multi-currency-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-01-multi-currency.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-01-multi-currency",
    ciCertScript: "test:ci:pm-marketing-full-scale-01-multi-currency:cert",
  },
  {
    taskNumber: 132,
    featureTaskNumber: 87,
    featureKey: "eu-data-residency-roadmap",
    label: "EU data residency roadmap",
    targetKind: "doc",
    targetPath: "docs/eu-data-residency-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-02-eu-data-residency.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-02-eu-data-residency",
    ciCertScript: "test:ci:pm-marketing-full-scale-02-eu-data-residency:cert",
  },
  {
    taskNumber: 133,
    featureTaskNumber: 88,
    featureKey: "regional-tax-compliance",
    label: "Regional tax compliance",
    targetKind: "doc",
    targetPath: "docs/regional-tax-compliance-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-03-regional-tax.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-03-regional-tax",
    ciCertScript: "test:ci:pm-marketing-full-scale-03-regional-tax:cert",
  },
  {
    taskNumber: 134,
    featureTaskNumber: 89,
    featureKey: "app-marketplace-third-party",
    label: "App marketplace 3rd party",
    targetKind: "component",
    targetPath: "components/marketing/app-marketplace-third-party.tsx",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-04-app-marketplace.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-04-app-marketplace",
    ciCertScript: "test:ci:pm-marketing-full-scale-04-app-marketplace:cert",
  },
  {
    taskNumber: 135,
    featureTaskNumber: 90,
    featureKey: "device-status-dashboard",
    label: "Device status dashboard",
    targetKind: "doc",
    targetPath: "docs/device-status-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-05-device-status.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-05-device-status",
    ciCertScript: "test:ci:pm-marketing-full-scale-05-device-status:cert",
  },
  {
    taskNumber: 136,
    featureTaskNumber: 91,
    featureKey: "data-migration-wizard",
    label: "Data migration wizard",
    targetKind: "doc",
    targetPath: "docs/data-migration-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-06-data-migration.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-06-data-migration",
    ciCertScript: "test:ci:pm-marketing-full-scale-06-data-migration:cert",
  },
  {
    taskNumber: 137,
    featureTaskNumber: 92,
    featureKey: "visual-floor-plan-editor",
    label: "Visual floor plan editor",
    targetKind: "doc",
    targetPath: "docs/floor-plan-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-07-floor-plan.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-07-floor-plan",
    ciCertScript: "test:ci:pm-marketing-full-scale-07-floor-plan:cert",
  },
  {
    taskNumber: 138,
    featureTaskNumber: 93,
    featureKey: "kds-daisy-chain-config",
    label: "KDS daisy-chain config",
    targetKind: "doc",
    targetPath: "docs/kds-daisy-chain-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-08-kds-daisy-chain.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-08-kds-daisy-chain",
    ciCertScript: "test:ci:pm-marketing-full-scale-08-kds-daisy-chain:cert",
  },
  {
    taskNumber: 139,
    featureTaskNumber: 94,
    featureKey: "kds-expedite-screen",
    label: "Expedite screen polish",
    targetKind: "doc",
    targetPath: "docs/kds-expedite-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-09-kds-expedite.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-09-kds-expedite",
    ciCertScript: "test:ci:pm-marketing-full-scale-09-kds-expedite:cert",
  },
  {
    taskNumber: 140,
    featureTaskNumber: 95,
    featureKey: "white-label-storefront-depth",
    label: "White-label storefront depth",
    targetKind: "doc",
    targetPath: "docs/white-label-storefront-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-10-white-label.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-10-white-label",
    ciCertScript: "test:ci:pm-marketing-full-scale-10-white-label:cert",
  },
  {
    taskNumber: 141,
    featureTaskNumber: 96,
    featureKey: "chart-of-accounts-mapping",
    label: "Chart of accounts mapping",
    targetKind: "doc",
    targetPath: "docs/chart-of-accounts-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-11-coa-mapping.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-11-coa-mapping",
    ciCertScript: "test:ci:pm-marketing-full-scale-11-coa-mapping:cert",
  },
  {
    taskNumber: 142,
    featureTaskNumber: 97,
    featureKey: "journal-entry-export",
    label: "Journal entry export",
    targetKind: "doc",
    targetPath: "docs/journal-entry-export-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-12-journal-export.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-12-journal-export",
    ciCertScript: "test:ci:pm-marketing-full-scale-12-journal-export:cert",
  },
  {
    taskNumber: 143,
    featureTaskNumber: 98,
    featureKey: "pnl-reconciliation-view",
    label: "P&L reconciliation view",
    targetKind: "doc",
    targetPath: "docs/pnl-reconciliation-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-13-pnl-reconciliation.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-13-pnl-reconciliation",
    ciCertScript: "test:ci:pm-marketing-full-scale-13-pnl-reconciliation:cert",
  },
  {
    taskNumber: 144,
    featureTaskNumber: 99,
    featureKey: "accountant-portal",
    label: "Accountant portal",
    targetKind: "doc",
    targetPath: "docs/accountant-portal-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-14-accountant-portal.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-14-accountant-portal",
    ciCertScript: "test:ci:pm-marketing-full-scale-14-accountant-portal:cert",
  },
  {
    taskNumber: 145,
    featureTaskNumber: 100,
    featureKey: "kds-driver-eta-tracking",
    label: "Driver ETA tracking in KDS",
    targetKind: "doc",
    targetPath: "docs/kds-driver-eta-gtm-scale.md",
    gtmTest: "tests/unit/absolute-final-pm-marketing-full-scale-15-driver-eta.test.ts",
    ciScript: "test:ci:pm-marketing-full-scale-15-driver-eta",
    ciCertScript: "test:ci:pm-marketing-full-scale-15-driver-eta:cert",
  },
] as const;

export const PM_MARKETING_FULL_SCALE_POLICY_PATH =
  "lib/marketing/absolute-final-pm-marketing-full-scale-policy.ts" as const;

export const PM_MARKETING_FULL_SCALE_AUDIT_PATH =
  "lib/marketing/absolute-final-pm-marketing-full-scale-audit.ts" as const;

export const PM_MARKETING_FULL_SCALE_TOKENS_PATH =
  "lib/marketing/absolute-final-pm-marketing-full-scale-tokens.ts" as const;

export function getPmMarketingFullScaleSlot(
  taskNumber: number,
): PmMarketingFullScaleSlot | undefined {
  return PM_MARKETING_FULL_SCALE_SLOTS.find((s) => s.taskNumber === taskNumber);
}
