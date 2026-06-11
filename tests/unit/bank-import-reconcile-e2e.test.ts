import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditBankImportReconcileE2E } from "@/lib/qa/bank-import-reconcile-e2e-audit";
import {
  BANK_IMPORT_PATH,
  BANK_IMPORT_RECONCILE_AUDIT_SCRIPT,
  BANK_IMPORT_RECONCILE_CI_WORKFLOW,
  BANK_IMPORT_RECONCILE_E2E_POLICY_ID,
  BANK_IMPORT_RECONCILE_E2E_SPEC,
  BANK_IMPORT_RECONCILE_FLOW_STEPS,
  BANK_IMPORT_RECONCILE_NPM_SCRIPT,
  BANK_IMPORT_RECONCILE_UNIT_TEST,
  BANK_RECONCILIATION_PATH,
  buildBankImportE2eCsv,
  buildBankImportE2eMarker,
  hasBankImportReconcileCredentials,
  isBankImportReconcileE2EEnabled,
} from "@/lib/qa/bank-import-reconcile-e2e-policy";
import { categorizeBankTransaction } from "@/lib/finance/bank-transaction-categorization";
import { parseBankStatementCsv } from "@/lib/finance/bank-statement-csv-parser";

const ROOT = process.cwd();

describe("Bank import → reconcile E2E (P1-46)", () => {
  it("locks policy id and finance flow routes", () => {
    expect(BANK_IMPORT_RECONCILE_E2E_POLICY_ID).toBe("bank-import-reconcile-e2e-v1");
    expect(BANK_IMPORT_PATH).toBe("/dashboard/finance/bank-import");
    expect(BANK_RECONCILIATION_PATH).toBe("/dashboard/accounting/bank-reconciliation");
    expect(BANK_IMPORT_RECONCILE_FLOW_STEPS).toHaveLength(4);
  });

  it("builds parseable CSV fixture for E2E import", () => {
    const marker = buildBankImportE2eMarker();
    const csv = buildBankImportE2eCsv(marker);
    const parsed = parseBankStatementCsv(csv);
    expect(parsed.lines.length).toBe(1);
    expect(parsed.lines[0]?.description).toBe(marker);
  });

  it("categorizes supplier withdrawal lines", () => {
    expect(categorizeBankTransaction("Sysco Foods payment", "WITHDRAWAL")).toBe(
      "Supplier payment",
    );
  });

  it("audits E2E spec, flow helper, and bank UI wiring", () => {
    const summary = auditBankImportReconcileE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.bankImportUiWired).toBe(true);
    expect(summary.bankReconciliationUiWired).toBe(true);
    expect(summary.bankImportPagePresent).toBe(true);
    expect(summary.bankReconciliationPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, BANK_IMPORT_RECONCILE_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BANK_IMPORT_RECONCILE_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, BANK_IMPORT_RECONCILE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BANK_IMPORT_RECONCILE_NPM_SCRIPT]).toContain(
      "audit-bank-import-reconcile-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:bank-import-reconcile-e2e"]).toContain(
      BANK_IMPORT_RECONCILE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, BANK_IMPORT_RECONCILE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:bank-import-reconcile-e2e");
  });

  it("E2E gate requires E2E_BANK_IMPORT_E2E flag", () => {
    const original = process.env.E2E_BANK_IMPORT_E2E;
    delete process.env.E2E_BANK_IMPORT_E2E;
    expect(isBankImportReconcileE2EEnabled()).toBe(false);
    process.env.E2E_BANK_IMPORT_E2E = "true";
    expect(isBankImportReconcileE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_BANK_IMPORT_E2E = original;
    else delete process.env.E2E_BANK_IMPORT_E2E;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasBankImportReconcileCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
