/**
 * Multi-location rollup CSV export E2E policy (QA-33).
 *
 * Enterprise consolidated rollup → `/api/dashboard/multi-location/rollup-export`.
 *
 * @see e2e/multi-location-rollup-export-e2e.spec.ts
 * @see lib/enterprise/multi-location-rollup-builders.ts
 */

export const MULTI_LOCATION_ROLLUP_EXPORT_E2E_POLICY_ID =
  "multi-location-rollup-export-e2e-v1" as const;

export const MULTI_LOCATION_ROLLUP_EXPORT_SLI_ID =
  "enterprise.multi_location_rollup_csv_export" as const;

export const MULTI_LOCATION_ROLLUP_EXPORT_API_PATH =
  "/api/dashboard/multi-location/rollup-export" as const;

export const ENTERPRISE_MULTI_LOCATION_PATH =
  "/dashboard/enterprise/multi-location" as const;

export const MULTI_LOCATION_ROLLUP_CSV_HEADERS = [
  "kind",
  "label",
  "locationId",
  "orders",
  "revenue",
  "revenueSharePct",
  "laborPct",
  "foodCostPct",
  "avgOrderValue",
  "vsAvgRevenue",
  "vsAvgLaborPct",
] as const;

export const MULTI_LOCATION_ROLLUP_REQUIRED_ROW_KINDS = ["network", "location"] as const;

export const ENTERPRISE_MULTI_LOCATION_PANEL_TESTID = "enterprise-multi-location-panel" as const;
export const MULTI_LOCATION_ROLLUP_CSV_EXPORT_TESTID = "multi-location-rollup-csv-export" as const;
export const MULTI_LOCATION_ROLLUP_SUMMARY_TESTID = "multi-location-rollup-summary" as const;

export const ROLLUP_EXPORT_CSV_CONTENT_TYPE = "text/csv" as const;
export const ROLLUP_EXPORT_ROW_COUNT_HEADER = "x-row-count" as const;

export type MultiLocationRollupExportContract = {
  headerMatches: boolean;
  rowCount: number;
  hasNetworkRow: boolean;
  hasLocationRow: boolean;
};

export function rollupExportHrefIncludesFilters(href: string): boolean {
  return href.includes(MULTI_LOCATION_ROLLUP_EXPORT_API_PATH);
}

export function isRollupExportCsvContentType(contentType: string | null): boolean {
  return (contentType ?? "").toLowerCase().includes(ROLLUP_EXPORT_CSV_CONTENT_TYPE);
}

export function isRollupExportAttachmentDisposition(disposition: string | null): boolean {
  return (disposition ?? "").toLowerCase().includes("attachment");
}

export function rollupExportWithinContract(contract: MultiLocationRollupExportContract): boolean {
  return (
    contract.headerMatches &&
    contract.rowCount >= 1 &&
    contract.hasNetworkRow
  );
}
