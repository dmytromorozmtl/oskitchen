import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";
import {
  CASHIER_SHIFT_FLOW_P2_42_ASSIGN_DRAWER_TEST_ID,
  CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT,
  CASHIER_SHIFT_FLOW_P2_42_CASH_PAGE,
  CASHIER_SHIFT_FLOW_P2_42_COUNT_SERVICE,
  CASHIER_SHIFT_FLOW_P2_42_DOC,
  CASHIER_SHIFT_FLOW_P2_42_EXPORT_ROUTE,
  CASHIER_SHIFT_FLOW_P2_42_FLOW_LINK_TEST_ID,
  CASHIER_SHIFT_FLOW_P2_42_FLOW_STEPS,
  CASHIER_SHIFT_FLOW_P2_42_HONESTY_MARKERS,
  CASHIER_SHIFT_FLOW_P2_42_POLICY_ID,
  CASHIER_SHIFT_FLOW_P2_42_ROOT_TEST_ID,
  CASHIER_SHIFT_FLOW_P2_42_ROUTE,
  CASHIER_SHIFT_FLOW_P2_42_SHIFT_SERVICE,
  CASHIER_SHIFT_FLOW_P2_42_SHIFTS_ROUTE,
  CASHIER_SHIFT_FLOW_P2_42_WIRING_PATHS,
} from "@/lib/pos/cashier-shift-flow-p2-42-policy";

export type CashierShiftFlowP2_42AuditSummary = {
  policyId: typeof CASHIER_SHIFT_FLOW_P2_42_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  shiftServiceWired: boolean;
  countServiceWired: boolean;
  cashClientWired: boolean;
  cashPageWired: boolean;
  shiftsPageWired: boolean;
  exportRouteWired: boolean;
  goldenCloseoutOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCashierShiftFlowP2_42(
  root = process.cwd(),
): CashierShiftFlowP2_42AuditSummary {
  const wiringComplete = CASHIER_SHIFT_FLOW_P2_42_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_DOC))) {
    const source = readFileSync(join(root, CASHIER_SHIFT_FLOW_P2_42_DOC), "utf8");
    docWired =
      source.includes(CASHIER_SHIFT_FLOW_P2_42_ROUTE) &&
      source.includes("Square parity") &&
      source.includes("assign drawer");
  }

  let shiftServiceWired = false;
  if (existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_SHIFT_SERVICE))) {
    const source = readFileSync(join(root, CASHIER_SHIFT_FLOW_P2_42_SHIFT_SERVICE), "utf8");
    shiftServiceWired =
      source.includes("openPosShift") &&
      source.includes("closePosShift") &&
      source.includes("listRecentClosedShiftSummaries");
  }

  let countServiceWired = false;
  if (existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_COUNT_SERVICE))) {
    const source = readFileSync(join(root, CASHIER_SHIFT_FLOW_P2_42_COUNT_SERVICE), "utf8");
    countServiceWired =
      source.includes("recordCashDrawerCount") &&
      source.includes("listRecentCashDrawerCounts");
  }

  let cashClientWired = false;
  if (existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT))) {
    const source = readFileSync(join(root, CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT), "utf8");
    cashClientWired =
      source.includes(CASHIER_SHIFT_FLOW_P2_42_ROOT_TEST_ID) &&
      source.includes(CASHIER_SHIFT_FLOW_P2_42_ASSIGN_DRAWER_TEST_ID) &&
      source.includes("pos-cash-open-panel") &&
      source.includes("pos-cash-count-panel") &&
      source.includes("pos-cash-close-panel") &&
      source.includes("pos-cash-report-panel") &&
      source.includes("POS_CASH_MANAGEMENT_STEPS");
  }

  let cashPageWired = false;
  if (existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_CASH_PAGE))) {
    const source = readFileSync(join(root, CASHIER_SHIFT_FLOW_P2_42_CASH_PAGE), "utf8");
    cashPageWired =
      source.includes("PosCashManagementClient") &&
      source.includes("loadPosCashManagementBootstrap");
  }

  let shiftsPageWired = false;
  const shiftsPage = join(root, "app/dashboard/pos/shifts/page.tsx");
  if (existsSync(shiftsPage)) {
    const source = readFileSync(shiftsPage, "utf8");
    shiftsPageWired =
      source.includes(CASHIER_SHIFT_FLOW_P2_42_ROUTE) &&
      source.includes(CASHIER_SHIFT_FLOW_P2_42_FLOW_LINK_TEST_ID);
  }

  const exportRouteWired = existsSync(join(root, CASHIER_SHIFT_FLOW_P2_42_EXPORT_ROUTE));

  const golden = computeShiftCloseout({
    openingCash: 200,
    cashSalesTotals: [15.5, 22.25],
    closingCash: 237.75,
  });
  const goldenCloseoutOk =
    golden.cashSalesTotal === 37.75 &&
    golden.expectedCash === 237.75 &&
    golden.variance === 0;

  const combined = [CASHIER_SHIFT_FLOW_P2_42_DOC, CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CASHIER_SHIFT_FLOW_P2_42_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    shiftServiceWired &&
    countServiceWired &&
    cashClientWired &&
    cashPageWired &&
    shiftsPageWired &&
    exportRouteWired &&
    goldenCloseoutOk &&
    honestyMarkersPresent &&
    CASHIER_SHIFT_FLOW_P2_42_FLOW_STEPS.length === 5;

  return {
    policyId: CASHIER_SHIFT_FLOW_P2_42_POLICY_ID,
    wiringComplete,
    docWired,
    shiftServiceWired,
    countServiceWired,
    cashClientWired,
    cashPageWired,
    shiftsPageWired,
    exportRouteWired,
    goldenCloseoutOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCashierShiftFlowP2_42AuditLines(
  summary: CashierShiftFlowP2_42AuditSummary,
): string[] {
  return [
    `Cashier shift flow audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${CASHIER_SHIFT_FLOW_P2_42_DOC})`,
    `Shift service: ${summary.shiftServiceWired ? "wired" : "missing"}`,
    `Cash count service: ${summary.countServiceWired ? "wired" : "missing"}`,
    `Cash management client: ${summary.cashClientWired ? "wired" : "missing"}`,
    `Cash page: ${summary.cashPageWired ? "yes" : "no"}`,
    `Shifts page flow link: ${summary.shiftsPageWired ? "yes" : "no"}`,
    `CSV export route: ${summary.exportRouteWired ? "yes" : "no"}`,
    `Golden closeout: ${summary.goldenCloseoutOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
