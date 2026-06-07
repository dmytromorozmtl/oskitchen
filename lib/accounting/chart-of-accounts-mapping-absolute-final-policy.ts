/**
 * Absolute Final Task 96 — chart of accounts mapping.
 *
 * @see app/dashboard/accounting/chart-of-accounts/page.tsx
 * @see components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx
 */

import { coaAccountByCode, RESTAURANT_COA_TEMPLATE } from "@/lib/accounting/restaurant-coa-template";

export const CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID =
  "chart-of-accounts-mapping-absolute-final-v1" as const;

export const CHART_OF_ACCOUNTS_MAPPING_ROUTE =
  "/dashboard/accounting/chart-of-accounts" as const;

export const CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH =
  "app/dashboard/accounting/chart-of-accounts/page.tsx" as const;

export const CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH =
  "components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx" as const;

export const CHART_OF_ACCOUNTS_MAPPING_SERVICE_PATH =
  "services/accounting/chart-of-accounts-mapping-service.ts" as const;

export const CHART_OF_ACCOUNTS_MAPPING_CONTENT_PATH =
  "lib/accounting/chart-of-accounts-mapping-content.ts" as const;

export const CHART_OF_ACCOUNTS_MAPPING_STRIP_PATH =
  "components/dashboard/accounting/chart-of-accounts-mapping-strip.tsx" as const;

export const CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY = "chartOfAccountsMappingV1" as const;

export const CHART_OF_ACCOUNTS_MAPPING_GL_SYNC_PAGE =
  "app/dashboard/accounting/gl-sync/page.tsx" as const;

export type CoaExternalProvider = "quickbooks" | "xero";

export type CoaMappingRow = {
  pnlLineKey: string;
  pnlLineLabel: string;
  glAccountCode: string;
  glAccountName: string;
  externalProvider: CoaExternalProvider | null;
  externalAccountId: string | null;
  externalAccountName: string | null;
};

export type CoaMappingConfig = {
  version: 1;
  mappings: CoaMappingRow[];
};

export type CoaMappingSummary = {
  totalLines: number;
  mappedCount: number;
  quickBooksLinkedCount: number;
  unmappedCount: number;
  coveragePercent: number;
};

export type CoaMappingModel = {
  policyId: typeof CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID;
  mappings: CoaMappingRow[];
  summary: CoaMappingSummary;
  quickBooksConnected: boolean;
  quickBooksAccounts: { id: string; name: string; accountType: string }[];
  refreshedAt: string;
};

export const CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS = [
  "revenue",
  "food_cost",
  "labor",
  "occupancy",
  "supplies",
  "repairs",
  "marketing",
  "admin",
] as const;

export const CHART_OF_ACCOUNTS_MAPPING_REQUIRED_MARKERS = [
  'data-testid="chart-of-accounts-mapping-panel"',
  "ChartOfAccountsMappingPanel",
] as const;

export const CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS = [
  "BETA",
  "not a certified GL",
  "accountant review",
  "QuickBooks",
  "Do not claim",
] as const;

export const CHART_OF_ACCOUNTS_MAPPING_WIRING_PATHS = [
  CHART_OF_ACCOUNTS_MAPPING_PAGE_PATH,
  CHART_OF_ACCOUNTS_MAPPING_COMPONENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_SERVICE_PATH,
  CHART_OF_ACCOUNTS_MAPPING_CONTENT_PATH,
  CHART_OF_ACCOUNTS_MAPPING_STRIP_PATH,
  CHART_OF_ACCOUNTS_MAPPING_GL_SYNC_PAGE,
  "lib/accounting/chart-of-accounts-mapping-absolute-final-policy.ts",
  "lib/accounting/chart-of-accounts-mapping-audit.ts",
  "lib/accounting/chart-of-accounts-mapping-storage.ts",
  "actions/accounting/chart-of-accounts-mapping.ts",
  "tests/unit/chart-of-accounts-mapping-absolute-final.test.ts",
] as const;

export const CHART_OF_ACCOUNTS_MAPPING_UNIT_TEST =
  "tests/unit/chart-of-accounts-mapping-absolute-final.test.ts" as const;

export const CHART_OF_ACCOUNTS_MAPPING_CI_SCRIPTS = [
  "test:ci:chart-of-accounts-mapping",
  "test:ci:chart-of-accounts-mapping:cert",
] as const;

export function buildDefaultCoaMappingRows(): CoaMappingRow[] {
  return CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS.map((key) => {
    const coa = RESTAURANT_COA_TEMPLATE.find((a) => a.pnlLineKey === key);
    return {
      pnlLineKey: key,
      pnlLineLabel: coa?.name ?? key,
      glAccountCode: coa?.code ?? "",
      glAccountName: coa?.name ?? "",
      externalProvider: null,
      externalAccountId: null,
      externalAccountName: null,
    };
  });
}

export function parseCoaMappingConfig(raw: unknown): CoaMappingConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1 || !Array.isArray(obj.mappings)) return null;

  const mappings: CoaMappingRow[] = [];
  for (const item of obj.mappings) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (typeof row.pnlLineKey !== "string" || typeof row.glAccountCode !== "string") continue;
    mappings.push({
      pnlLineKey: row.pnlLineKey,
      pnlLineLabel: typeof row.pnlLineLabel === "string" ? row.pnlLineLabel : row.pnlLineKey,
      glAccountCode: row.glAccountCode,
      glAccountName: typeof row.glAccountName === "string" ? row.glAccountName : "",
      externalProvider:
        row.externalProvider === "quickbooks" || row.externalProvider === "xero"
          ? row.externalProvider
          : null,
      externalAccountId: typeof row.externalAccountId === "string" ? row.externalAccountId : null,
      externalAccountName:
        typeof row.externalAccountName === "string" ? row.externalAccountName : null,
    });
  }

  return { version: 1, mappings };
}

export function mergeCoaMappingRows(saved: readonly CoaMappingRow[]): CoaMappingRow[] {
  const defaults = buildDefaultCoaMappingRows();
  const byKey = new Map(saved.map((r) => [r.pnlLineKey, r]));

  return defaults.map((def) => {
    const existing = byKey.get(def.pnlLineKey);
    if (!existing) return def;
    const coa = coaAccountByCode(existing.glAccountCode) ?? coaAccountByCode(def.glAccountCode);
    return {
      ...def,
      glAccountCode: coa?.code ?? def.glAccountCode,
      glAccountName: coa?.name ?? def.glAccountName,
      externalProvider: existing.externalProvider,
      externalAccountId: existing.externalAccountId,
      externalAccountName: existing.externalAccountName,
    };
  });
}

export function summarizeCoaMappingCoverage(mappings: readonly CoaMappingRow[]): CoaMappingSummary {
  const totalLines = mappings.length;
  const mappedCount = mappings.filter((m) => m.glAccountCode.trim().length > 0).length;
  const quickBooksLinkedCount = mappings.filter(
    (m) => m.externalProvider === "quickbooks" && m.externalAccountId,
  ).length;
  const unmappedCount = totalLines - mappedCount;
  const coveragePercent = totalLines === 0 ? 0 : Math.round((mappedCount / totalLines) * 100);

  return {
    totalLines,
    mappedCount,
    quickBooksLinkedCount,
    unmappedCount,
    coveragePercent,
  };
}

export function resolveGlAccountForPnlLine(
  mappings: readonly CoaMappingRow[],
  pnlLineKey: string,
): CoaMappingRow | undefined {
  return mappings.find((m) => m.pnlLineKey === pnlLineKey);
}
