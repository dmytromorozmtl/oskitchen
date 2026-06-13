import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCashierShiftFlowP2_42,
  formatCashierShiftFlowP2_42AuditLines,
} from "@/lib/pos/cashier-shift-flow-p2-42-audit";
import {
  CASHIER_SHIFT_FLOW_P2_42_AUDIT_SCRIPT,
  CASHIER_SHIFT_FLOW_P2_42_CHECK_NPM_SCRIPT,
  CASHIER_SHIFT_FLOW_P2_42_CI_WORKFLOW,
  CASHIER_SHIFT_FLOW_P2_42_DOC,
  CASHIER_SHIFT_FLOW_P2_42_FLOW_STEPS,
  CASHIER_SHIFT_FLOW_P2_42_NPM_SCRIPT,
  CASHIER_SHIFT_FLOW_P2_42_POLICY_ID,
  CASHIER_SHIFT_FLOW_P2_42_ROUTE,
  CASHIER_SHIFT_FLOW_P2_42_UNIT_TEST,
} from "@/lib/pos/cashier-shift-flow-p2-42-policy";
import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";

const ROOT = process.cwd();

describe("Cashier shift flow (P2-42)", () => {
  it("locks policy id and five-step Square flow", () => {
    expect(CASHIER_SHIFT_FLOW_P2_42_POLICY_ID).toBe("cashier-shift-flow-p2-42-v1");
    expect(CASHIER_SHIFT_FLOW_P2_42_ROUTE).toBe("/dashboard/pos/cash");
    expect(CASHIER_SHIFT_FLOW_P2_42_FLOW_STEPS).toEqual([
      "open_shift",
      "assign_drawer",
      "cash_count",
      "close_shift",
      "shift_report",
    ]);
  });

  it("computes balanced closeout golden path", () => {
    const result = computeShiftCloseout({
      openingCash: 100,
      cashSalesTotals: [12.5, 7.5],
      closingCash: 120,
    });
    expect(result.expectedCash).toBe(120);
    expect(result.variance).toBe(0);
  });

  it("passes full cashier shift flow audit", () => {
    const summary = auditCashierShiftFlowP2_42(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.shiftServiceWired).toBe(true);
    expect(summary.countServiceWired).toBe(true);
    expect(summary.cashClientWired).toBe(true);
    expect(summary.cashPageWired).toBe(true);
    expect(summary.shiftsPageWired).toBe(true);
    expect(summary.exportRouteWired).toBe(true);
    expect(summary.goldenCloseoutOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCashierShiftFlowP2_42AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, CASHIER_SHIFT_FLOW_P2_42_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CASHIER_SHIFT_FLOW_P2_42_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CASHIER_SHIFT_FLOW_P2_42_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CASHIER_SHIFT_FLOW_P2_42_NPM_SCRIPT]).toContain(
      "audit-cashier-shift-flow-p2-42.ts",
    );
    expect(pkg.scripts?.[CASHIER_SHIFT_FLOW_P2_42_CHECK_NPM_SCRIPT]).toContain(
      CASHIER_SHIFT_FLOW_P2_42_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CASHIER_SHIFT_FLOW_P2_42_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("cashier-shift-flow-p2-42");
  });
});
