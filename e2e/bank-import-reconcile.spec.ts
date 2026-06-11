import { expect, test } from "@playwright/test";

import {
  BANK_IMPORT_PATH,
  BANK_IMPORT_RECONCILE_E2E_POLICY_ID,
  BANK_IMPORT_RECONCILE_FLOW_STEPS,
  BANK_RECONCILIATION_PATH,
  buildBankImportE2eCsv,
  buildBankImportE2eMarker,
} from "@/lib/qa/bank-import-reconcile-e2e-policy";
import { categorizeBankTransaction } from "@/lib/finance/bank-transaction-categorization";

import { runBankImportReconcileFlow } from "./helpers/bank-import-reconcile-flow";
import {
  skipBankImportReconcileIfGateDisabled,
  skipBankImportReconcileIfNotAuthed,
} from "./helpers/bank-import-reconcile-ready";

/**
 * Bank import → reconcile golden path.
 *
 * CSV preview → commit → verify listing → manual or auto reconcile.
 *
 * @see docs/INVOICE_SCANNER.md
 * @see lib/qa/bank-import-reconciliation-benchmark-policy.ts
 */

test.describe("bank import reconcile policy", () => {
  test("exports finance flow routes and steps", () => {
    expect(BANK_IMPORT_RECONCILE_E2E_POLICY_ID).toBe("bank-import-reconcile-e2e-v1");
    expect(BANK_IMPORT_PATH).toBe("/dashboard/finance/bank-import");
    expect(BANK_RECONCILIATION_PATH).toBe("/dashboard/accounting/bank-reconciliation");
    expect(BANK_IMPORT_RECONCILE_FLOW_STEPS).toEqual([
      "csv_preview",
      "import_commit",
      "verify_import_listed",
      "reconcile_tx",
    ]);
  });

  test("builds unique E2E CSV fixture", () => {
    const marker = buildBankImportE2eMarker("E2E");
    expect(marker.startsWith("E2E-")).toBe(true);
    const csv = buildBankImportE2eCsv(marker, 250);
    expect(csv).toContain(marker);
    expect(csv).toContain("250.00");
  });

  test("categorizes Stripe deposit as POS deposit", () => {
    expect(categorizeBankTransaction("Stripe payout deposit", "DEPOSIT")).toBe("POS deposit");
  });
});

test.describe("bank import reconcile (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Bank import → reconcile runs in chromium-authed project only",
    );
    skipBankImportReconcileIfGateDisabled();
    skipBankImportReconcileIfNotAuthed();
  });

  test("csv import creates reconciled bank transaction", async ({ page }) => {
    const result = await runBankImportReconcileFlow(page);
    expect(result.steps).toEqual(BANK_IMPORT_RECONCILE_FLOW_STEPS);
    expect(result.marker.length).toBeGreaterThan(0);
    expect(["manual", "auto"]).toContain(result.reconciledVia);
  });
});
