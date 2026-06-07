/**
 * Absolute Final Tasks 116–130 — design full polish for P3 features 86–100.
 *
 * Each slot applies shared visual polish tokens to the primary feature surface.
 *
 * @see tests/unit/absolute-final-design-full-polish-01-multi-currency.test.ts
 */

import { DESIGN_POLISH_TOKEN_NAMES } from "@/lib/design/absolute-final-design-polish-tokens";

export const DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-design-full-polish-v1" as const;

export type DesignPolishTargetKind = "component" | "doc";

export type DesignFullPolishSlot = {
  taskNumber: number;
  featureTaskNumber: number;
  featureKey: string;
  label: string;
  targetKind: DesignPolishTargetKind;
  targetPath: string;
  polishTest: string;
  ciScript: string;
  ciCertScript: string;
};

export const DESIGN_FULL_POLISH_SLOTS: readonly DesignFullPolishSlot[] = [
  {
    taskNumber: 116,
    featureTaskNumber: 86,
    featureKey: "multi-currency-support",
    label: "Multi-currency support",
    targetKind: "component",
    targetPath: "components/dashboard/settings/multi-currency-settings-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-01-multi-currency.test.ts",
    ciScript: "test:ci:design-full-polish-01-multi-currency",
    ciCertScript: "test:ci:design-full-polish-01-multi-currency:cert",
  },
  {
    taskNumber: 117,
    featureTaskNumber: 87,
    featureKey: "eu-data-residency-roadmap",
    label: "EU data residency roadmap",
    targetKind: "doc",
    targetPath: "docs/eu-data-residency-roadmap.md",
    polishTest: "tests/unit/absolute-final-design-full-polish-02-eu-data-residency.test.ts",
    ciScript: "test:ci:design-full-polish-02-eu-data-residency",
    ciCertScript: "test:ci:design-full-polish-02-eu-data-residency:cert",
  },
  {
    taskNumber: 118,
    featureTaskNumber: 88,
    featureKey: "regional-tax-compliance",
    label: "Regional tax compliance",
    targetKind: "doc",
    targetPath: "docs/regional-tax-compliance.md",
    polishTest: "tests/unit/absolute-final-design-full-polish-03-regional-tax.test.ts",
    ciScript: "test:ci:design-full-polish-03-regional-tax",
    ciCertScript: "test:ci:design-full-polish-03-regional-tax:cert",
  },
  {
    taskNumber: 119,
    featureTaskNumber: 89,
    featureKey: "app-marketplace-third-party",
    label: "App marketplace 3rd party",
    targetKind: "component",
    targetPath: "components/marketing/app-marketplace-third-party.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-04-app-marketplace.test.ts",
    ciScript: "test:ci:design-full-polish-04-app-marketplace",
    ciCertScript: "test:ci:design-full-polish-04-app-marketplace:cert",
  },
  {
    taskNumber: 120,
    featureTaskNumber: 90,
    featureKey: "device-status-dashboard",
    label: "Device status dashboard",
    targetKind: "component",
    targetPath: "components/dashboard/devices/device-status-dashboard.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-05-device-status.test.ts",
    ciScript: "test:ci:design-full-polish-05-device-status",
    ciCertScript: "test:ci:design-full-polish-05-device-status:cert",
  },
  {
    taskNumber: 121,
    featureTaskNumber: 91,
    featureKey: "data-migration-wizard",
    label: "Data migration wizard",
    targetKind: "component",
    targetPath: "components/import/migration-wizard-client.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-06-data-migration.test.ts",
    ciScript: "test:ci:design-full-polish-06-data-migration",
    ciCertScript: "test:ci:design-full-polish-06-data-migration:cert",
  },
  {
    taskNumber: 122,
    featureTaskNumber: 92,
    featureKey: "visual-floor-plan-editor",
    label: "Visual floor plan editor",
    targetKind: "component",
    targetPath: "components/restaurant/floor-plan-editor.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-07-floor-plan.test.ts",
    ciScript: "test:ci:design-full-polish-07-floor-plan",
    ciCertScript: "test:ci:design-full-polish-07-floor-plan:cert",
  },
  {
    taskNumber: 123,
    featureTaskNumber: 93,
    featureKey: "kds-daisy-chain-config",
    label: "KDS daisy-chain config",
    targetKind: "component",
    targetPath: "components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-08-kds-daisy-chain.test.ts",
    ciScript: "test:ci:design-full-polish-08-kds-daisy-chain",
    ciCertScript: "test:ci:design-full-polish-08-kds-daisy-chain:cert",
  },
  {
    taskNumber: 124,
    featureTaskNumber: 94,
    featureKey: "kds-expedite-screen",
    label: "Expedite screen polish",
    targetKind: "component",
    targetPath: "components/kitchen/kds-expedite-screen.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-09-kds-expedite.test.ts",
    ciScript: "test:ci:design-full-polish-09-kds-expedite",
    ciCertScript: "test:ci:design-full-polish-09-kds-expedite:cert",
  },
  {
    taskNumber: 125,
    featureTaskNumber: 95,
    featureKey: "white-label-storefront-depth",
    label: "White-label storefront depth",
    targetKind: "component",
    targetPath: "components/dashboard/storefront/white-label-storefront-depth-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-10-white-label.test.ts",
    ciScript: "test:ci:design-full-polish-10-white-label",
    ciCertScript: "test:ci:design-full-polish-10-white-label:cert",
  },
  {
    taskNumber: 126,
    featureTaskNumber: 96,
    featureKey: "chart-of-accounts-mapping",
    label: "Chart of accounts mapping",
    targetKind: "component",
    targetPath: "components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-11-coa-mapping.test.ts",
    ciScript: "test:ci:design-full-polish-11-coa-mapping",
    ciCertScript: "test:ci:design-full-polish-11-coa-mapping:cert",
  },
  {
    taskNumber: 127,
    featureTaskNumber: 97,
    featureKey: "journal-entry-export",
    label: "Journal entry export",
    targetKind: "component",
    targetPath: "components/dashboard/accounting/journal-entry-export-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-12-journal-export.test.ts",
    ciScript: "test:ci:design-full-polish-12-journal-export",
    ciCertScript: "test:ci:design-full-polish-12-journal-export:cert",
  },
  {
    taskNumber: 128,
    featureTaskNumber: 98,
    featureKey: "pnl-reconciliation-view",
    label: "P&L reconciliation view",
    targetKind: "component",
    targetPath: "components/dashboard/accounting/pnl-reconciliation-view-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-13-pnl-reconciliation.test.ts",
    ciScript: "test:ci:design-full-polish-13-pnl-reconciliation",
    ciCertScript: "test:ci:design-full-polish-13-pnl-reconciliation:cert",
  },
  {
    taskNumber: 129,
    featureTaskNumber: 99,
    featureKey: "accountant-portal",
    label: "Accountant portal",
    targetKind: "component",
    targetPath: "components/dashboard/accounting/accountant-portal-panel.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-14-accountant-portal.test.ts",
    ciScript: "test:ci:design-full-polish-14-accountant-portal",
    ciCertScript: "test:ci:design-full-polish-14-accountant-portal:cert",
  },
  {
    taskNumber: 130,
    featureTaskNumber: 100,
    featureKey: "kds-driver-eta-tracking",
    label: "Driver ETA tracking in KDS",
    targetKind: "component",
    targetPath: "components/kitchen/kds-driver-eta-screen.tsx",
    polishTest: "tests/unit/absolute-final-design-full-polish-15-driver-eta.test.ts",
    ciScript: "test:ci:design-full-polish-15-driver-eta",
    ciCertScript: "test:ci:design-full-polish-15-driver-eta:cert",
  },
] as const;

export const DESIGN_FULL_POLISH_POLICY_PATH =
  "lib/design/absolute-final-design-full-polish-policy.ts" as const;

export const DESIGN_FULL_POLISH_AUDIT_PATH =
  "lib/design/absolute-final-design-full-polish-audit.ts" as const;

export const DESIGN_FULL_POLISH_TOKENS_PATH =
  "lib/design/absolute-final-design-polish-tokens.ts" as const;

export function getDesignFullPolishSlot(taskNumber: number): DesignFullPolishSlot | undefined {
  return DESIGN_FULL_POLISH_SLOTS.find((s) => s.taskNumber === taskNumber);
}

export function componentUsesDesignPolishTokens(source: string): boolean {
  return (
    source.includes("absolute-final-design-polish-tokens") &&
    DESIGN_POLISH_TOKEN_NAMES.some((name) => source.includes(name))
  );
}
