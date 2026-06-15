import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  ENTERPRISE_MULTI_LOCATION_PANEL_TESTID,
  ENTERPRISE_MULTI_LOCATION_PATH,
  MULTI_LOCATION_ROLLUP_CSV_EXPORT_TESTID,
  MULTI_LOCATION_ROLLUP_EXPORT_API_PATH,
  MULTI_LOCATION_ROLLUP_SUMMARY_TESTID,
  ROLLUP_EXPORT_ROW_COUNT_HEADER,
  isRollupExportAttachmentDisposition,
  isRollupExportCsvContentType,
} from "@/lib/enterprise/multi-location-rollup-export-e2e-policy";
import { rollupCsvExportWithinContract } from "@/lib/enterprise/multi-location-rollup-export-metrics";

export async function navigateToEnterpriseMultiLocationPanel(page: Page): Promise<void> {
  await page.goto(ENTERPRISE_MULTI_LOCATION_PATH);

  if (page.url().includes("/login")) {
    test.skip(true, "Multi-location rollup export E2E SKIPPED — dashboard auth required");
  }

  await expect(page.getByRole("heading", { name: /Multi-location enterprise/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId(ENTERPRISE_MULTI_LOCATION_PANEL_TESTID)).toBeVisible({
    timeout: 15_000,
  });
}

export async function assertRollupExportControlsVisible(page: Page): Promise<void> {
  await expect(page.getByTestId(MULTI_LOCATION_ROLLUP_SUMMARY_TESTID)).toBeVisible();
  await expect(page.getByTestId(MULTI_LOCATION_ROLLUP_CSV_EXPORT_TESTID)).toBeVisible();
  const exportLink = page.getByTestId(MULTI_LOCATION_ROLLUP_CSV_EXPORT_TESTID).locator("a");
  await expect(exportLink).toHaveAttribute("href", new RegExp(MULTI_LOCATION_ROLLUP_EXPORT_API_PATH));
}

export async function runMultiLocationRollupExportPanelFlow(page: Page): Promise<void> {
  await navigateToEnterpriseMultiLocationPanel(page);
  await assertRollupExportControlsVisible(page);
}

export async function fetchAuthedRollupExportCsv(request: APIRequestContext): Promise<{
  status: number;
  body: string;
  contentType: string | null;
  disposition: string | null;
  rowCountHeader: string | null;
}> {
  const response = await request.get(MULTI_LOCATION_ROLLUP_EXPORT_API_PATH);
  const headers = response.headers();

  return {
    status: response.status(),
    body: await response.text(),
    contentType: headers["content-type"] ?? null,
    disposition: headers["content-disposition"] ?? null,
    rowCountHeader: headers[ROLLUP_EXPORT_ROW_COUNT_HEADER] ?? null,
  };
}

export async function assertAuthedRollupExportCsvContract(
  request: APIRequestContext,
): Promise<void> {
  const result = await fetchAuthedRollupExportCsv(request);

  if (result.status === 404) {
    test.skip(true, "Multi-location rollup export HTTP SKIPPED — workspace not available for actor");
  }

  expect(result.status).toBe(200);
  expect(isRollupExportCsvContentType(result.contentType)).toBe(true);
  expect(isRollupExportAttachmentDisposition(result.disposition)).toBe(true);
  expect(result.rowCountHeader).not.toBeNull();
  expect(Number(result.rowCountHeader)).toBeGreaterThanOrEqual(1);
  expect(rollupCsvExportWithinContract(result.body)).toBe(true);
}
