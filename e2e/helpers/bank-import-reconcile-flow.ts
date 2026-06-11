import { expect, test, type Page } from "@playwright/test";

import {
  BANK_IMPORT_COMMIT_BTN_TEST_ID,
  BANK_IMPORT_COMMIT_SUCCESS_PATTERN,
  BANK_IMPORT_CSV_INPUT_TEST_ID,
  BANK_IMPORT_PANEL_TEST_ID,
  BANK_IMPORT_PATH,
  BANK_IMPORT_PREVIEW_BTN_TEST_ID,
  BANK_IMPORT_PREVIEW_PANEL_TEST_ID,
  BANK_IMPORT_RECONCILE_FLOW_STEPS,
  BANK_IMPORT_RECONCILE_VISIBLE_MS,
  BANK_IMPORT_RECONCILED_LABEL,
  BANK_RECONCILE_BTN_TEST_ID,
  BANK_RECONCILE_PANEL_TEST_ID,
  BANK_RECONCILE_TX_ROW_TEST_ID,
  BANK_RECONCILIATION_PATH,
  buildBankImportE2eCsv,
  buildBankImportE2eMarker,
  type BankImportReconcileFlowStep,
} from "@/lib/qa/bank-import-reconcile-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type BankImportReconcileFlowResult = {
  marker: string;
  steps: BankImportReconcileFlowStep[];
  reconciledVia: "manual" | "auto";
};

export async function previewBankImportCsv(page: Page, csv: string): Promise<void> {
  await page.goto(BANK_IMPORT_PATH);
  await skipIfLoginRedirect(page);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByTestId(BANK_IMPORT_PANEL_TEST_ID)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByTestId(BANK_IMPORT_CSV_INPUT_TEST_ID).fill(csv);
  await page.getByTestId(BANK_IMPORT_PREVIEW_BTN_TEST_ID).click();
  await expect(page.getByTestId(BANK_IMPORT_PREVIEW_PANEL_TEST_ID)).toBeVisible({
    timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS,
  });
}

export async function commitBankImportPreview(page: Page): Promise<void> {
  await page.getByTestId(BANK_IMPORT_COMMIT_BTN_TEST_ID).click();
  await expect(page.getByText(BANK_IMPORT_COMMIT_SUCCESS_PATTERN)).toBeVisible({
    timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS,
  });
}

export async function verifyBankImportListed(page: Page, marker: string): Promise<void> {
  await page.goto(BANK_IMPORT_PATH);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByText(marker)).toBeVisible({
    timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS,
  });
}

export async function reconcileBankTransaction(
  page: Page,
  marker: string,
): Promise<"manual" | "auto"> {
  await page.goto(BANK_RECONCILIATION_PATH);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByTestId(BANK_RECONCILE_PANEL_TEST_ID)).toBeVisible({
    timeout: 15_000,
  });

  const txRow = page
    .getByTestId(BANK_RECONCILE_TX_ROW_TEST_ID)
    .filter({ hasText: marker })
    .first();

  if (!(await txRow.isVisible().catch(() => false))) {
    await page.goto(BANK_IMPORT_PATH);
    await assertNoDashboardRscFailure(page);
    const importRow = page.locator("div", { hasText: marker }).first();
    await expect(importRow).toBeVisible({ timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS });
    await expect(importRow.getByText(BANK_IMPORT_RECONCILED_LABEL)).toBeVisible({
      timeout: 15_000,
    });
    return "auto";
  }

  const matchSelect = txRow.locator('select[name="matchId"]');
  const optionCount = await matchSelect.locator("option").count();
  if (optionCount === 0) {
    test.skip(true, "No orders or invoices available to reconcile against.");
  }

  await txRow.getByTestId(BANK_RECONCILE_BTN_TEST_ID).click();
  await expect(txRow).not.toBeVisible({ timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS });

  await page.goto(BANK_IMPORT_PATH);
  await assertNoDashboardRscFailure(page);
  const importRow = page.locator("div", { hasText: marker }).first();
  await expect(importRow.getByText(BANK_IMPORT_RECONCILED_LABEL)).toBeVisible({
    timeout: BANK_IMPORT_RECONCILE_VISIBLE_MS,
  });

  return "manual";
}

export async function runBankImportReconcileFlow(
  page: Page,
): Promise<BankImportReconcileFlowResult> {
  const steps: BankImportReconcileFlowStep[] = [];
  const marker = buildBankImportE2eMarker();
  const csv = buildBankImportE2eCsv(marker);

  await previewBankImportCsv(page, csv);
  steps.push("csv_preview");

  await commitBankImportPreview(page);
  steps.push("import_commit");

  await verifyBankImportListed(page, marker);
  steps.push("verify_import_listed");

  const reconciledVia = await reconcileBankTransaction(page, marker);
  steps.push("reconcile_tx");

  if (steps.length !== BANK_IMPORT_RECONCILE_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { marker, steps, reconciledVia };
}
