import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditTableServiceDepth, formatTableServiceDepthAuditLines } from "@/lib/pos/table-service-depth-audit";
import { TABLE_SERVICE_DEPTH_CAPABILITIES } from "@/lib/pos/table-service-depth-content";
import {
  BAR_MODE_QUICK_ITEMS,
  computeServerBankingSummary,
  extractServerLabelFromTabName,
  reconcileTips,
  validateMergeTabs,
  validateTransferSeat,
} from "@/lib/pos/table-service-depth-operations";
import {
  TABLE_SERVICE_DEPTH_CAPABILITY_COUNT,
  TABLE_SERVICE_DEPTH_CI_WORKFLOW,
  TABLE_SERVICE_DEPTH_DOC,
  TABLE_SERVICE_DEPTH_NPM_SCRIPT,
  TABLE_SERVICE_DEPTH_POLICY_ID,
  TABLE_SERVICE_DEPTH_ROUTE,
  TABLE_SERVICE_DEPTH_TEST_IDS,
  TABLE_SERVICE_DEPTH_UNIT_TEST,
} from "@/lib/pos/table-service-depth-policy";

const ROOT = process.cwd();

describe("Table service depth (P2-89)", () => {
  it("locks policy id, route, and seven capabilities", () => {
    expect(TABLE_SERVICE_DEPTH_POLICY_ID).toBe("table-service-depth-p2-89-v1");
    expect(TABLE_SERVICE_DEPTH_ROUTE).toBe("/dashboard/pos/table-service");
    expect(TABLE_SERVICE_DEPTH_CAPABILITY_COUNT).toBe(7);
    expect(TABLE_SERVICE_DEPTH_CAPABILITIES).toHaveLength(7);
    expect(TABLE_SERVICE_DEPTH_TEST_IDS).toHaveLength(8);
  });

  it("passes full table service depth audit", () => {
    const summary = auditTableServiceDepth(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.actionsWired).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.legacyDocLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("extracts server labels and computes banking summary", () => {
    expect(extractServerLabelFromTabName("Alex - Table 4")).toBe("Alex");
    const rows = computeServerBankingSummary([
      { tabName: "Alex - Table 4", tip: 10, total: 60, closedAt: "2026-06-09T12:00:00Z" },
      { tabName: "Alex - Table 7", tip: 8, total: 45, closedAt: "2026-06-09T13:00:00Z" },
      { tabName: "Jordan - Bar 1", tip: 15, total: 90, closedAt: "2026-06-09T14:00:00Z" },
    ]);
    expect(rows.find((row) => row.serverLabel === "Alex")?.tipsTotal).toBe(18);
    expect(rows.find((row) => row.serverLabel === "Jordan")?.tipsTotal).toBe(15);
  });

  it("reconciles tips within tolerance", () => {
    const pass = reconcileTips({ declaredTips: 100, recordedTips: 102, tolerancePercent: 5 });
    expect(pass.withinTolerance).toBe(true);
    const fail = reconcileTips({ declaredTips: 100, recordedTips: 120, tolerancePercent: 5 });
    expect(fail.withinTolerance).toBe(false);
  });

  it("validates merge and transfer operations", () => {
    expect(
      validateMergeTabs({
        sourceTabId: "a",
        targetTabId: "b",
        sourceStatus: "OPEN",
        targetStatus: "OPEN",
      }).ok,
    ).toBe(true);
    expect(
      validateTransferSeat({ fromSeatId: "seat-1", toSeatId: "seat-2", itemCount: 2 }).ok,
    ).toBe(true);
    expect(BAR_MODE_QUICK_ITEMS.length).toBeGreaterThanOrEqual(6);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, TABLE_SERVICE_DEPTH_DOC))).toBe(true);
    expect(existsSync(join(ROOT, TABLE_SERVICE_DEPTH_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[TABLE_SERVICE_DEPTH_NPM_SCRIPT]).toContain("audit-table-service-depth.ts");
    expect(pkg.scripts?.["test:ci:table-service-depth"]).toContain(TABLE_SERVICE_DEPTH_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, TABLE_SERVICE_DEPTH_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:table-service-depth");
  });

  it("formats audit lines", () => {
    const lines = formatTableServiceDepthAuditLines(auditTableServiceDepth(ROOT));
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
