import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { nativeBudgetingMeetsMinCategories } from "@/lib/finance/native-budgeting-p3-91-content";
import {
  NATIVE_BUDGETING_P3_91_CANONICAL_PATH,
  NATIVE_BUDGETING_P3_91_DOC,
  NATIVE_BUDGETING_P3_91_PANEL,
  NATIVE_BUDGETING_P3_91_POLICY_ID,
  NATIVE_BUDGETING_P3_91_SERVICE,
  NATIVE_BUDGETING_P3_91_WIRING_PATHS,
} from "@/lib/finance/native-budgeting-p3-91-policy";

export type NativeBudgetingP391AuditSummary = {
  policyId: typeof NATIVE_BUDGETING_P3_91_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  categoriesOk: boolean;
  pageWired: boolean;
  pnlIntegrated: boolean;
  passed: boolean;
  failures: string[];
};

export function auditNativeBudgetingP391(root = process.cwd()): NativeBudgetingP391AuditSummary {
  const failures: string[] = [];

  const wiringComplete = NATIVE_BUDGETING_P3_91_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-91 wiring paths");

  let docWired = false;
  if (existsSync(join(root, NATIVE_BUDGETING_P3_91_DOC))) {
    const doc = readFileSync(join(root, NATIVE_BUDGETING_P3_91_DOC), "utf8");
    docWired =
      doc.includes(NATIVE_BUDGETING_P3_91_POLICY_ID) &&
      doc.includes("budget vs actual") &&
      doc.includes("R365");
  } else {
    failures.push(`missing doc: ${NATIVE_BUDGETING_P3_91_DOC}`);
  }

  const categoriesOk = nativeBudgetingMeetsMinCategories();
  if (!categoriesOk) failures.push("insufficient budget categories");

  let pageWired = false;
  const pagePath = join(root, "app/dashboard/finance/budget/page.tsx");
  if (existsSync(join(root, NATIVE_BUDGETING_P3_91_PANEL)) && existsSync(pagePath)) {
    const page = readFileSync(pagePath, "utf8");
    const panel = readFileSync(join(root, NATIVE_BUDGETING_P3_91_PANEL), "utf8");
    pageWired =
      page.includes("NativeBudgetingPanel") &&
      (page.includes(NATIVE_BUDGETING_P3_91_POLICY_ID) ||
        page.includes("NATIVE_BUDGETING_P3_91_POLICY_ID")) &&
      panel.includes('data-testid="native-budgeting-panel"') &&
      panel.includes("Budget vs actual");
  } else {
    failures.push("missing budget page or panel");
  }

  let pnlIntegrated = false;
  const pnlService = join(root, "services/accounting/restaurant-pnl-service.ts");
  const pnlPage = join(root, "app/dashboard/reports/financial/pnl/page.tsx");
  if (existsSync(pnlService) && existsSync(pnlPage)) {
    const service = readFileSync(pnlService, "utf8");
    const page = readFileSync(pnlPage, "utf8");
    pnlIntegrated =
      service.includes("pnlLineBudgetAmount") &&
      service.includes("resolveNativeBudgetSettings") &&
      page.includes(NATIVE_BUDGETING_P3_91_CANONICAL_PATH);
  } else {
    failures.push("PnL service or page missing native budget integration");
  }

  if (!existsSync(join(root, NATIVE_BUDGETING_P3_91_SERVICE))) {
    failures.push(`missing service: ${NATIVE_BUDGETING_P3_91_SERVICE}`);
  }

  const passed =
    failures.length === 0 &&
    wiringComplete &&
    docWired &&
    categoriesOk &&
    pageWired &&
    pnlIntegrated;

  return {
    policyId: NATIVE_BUDGETING_P3_91_POLICY_ID,
    wiringComplete,
    docWired,
    categoriesOk,
    pageWired,
    pnlIntegrated,
    passed,
    failures,
  };
}

export function formatNativeBudgetingP391AuditLines(
  summary: NativeBudgetingP391AuditSummary,
): string[] {
  return [
    `Native budgeting (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Categories (8+): ${summary.categoriesOk ? "yes" : "no"}`,
    `Budget page wired: ${summary.pageWired ? "yes" : "no"}`,
    `PnL integrated: ${summary.pnlIntegrated ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
