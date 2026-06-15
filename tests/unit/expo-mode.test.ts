import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditExpoMode, formatExpoModeAuditLines } from "@/lib/kitchen/expo-mode-p2-93-audit";
import { EXPO_MODE_CAPABILITIES } from "@/lib/kitchen/expo-mode-p2-93-content";
import {
  buildExpoHandoffChecklist,
  buildExpoLineItems,
  buildExpoModeReport,
  buildExpoOrderSnapshot,
  computeExpoCompleteness,
  isExpoWorkItemReady,
} from "@/lib/kitchen/expo-mode-p2-93-operations";
import {
  EXPO_MODE_CAPABILITY_COUNT,
  EXPO_MODE_CI_WORKFLOW,
  EXPO_MODE_DOC,
  EXPO_MODE_NPM_SCRIPT,
  EXPO_MODE_POLICY_ID,
  EXPO_MODE_ROUTE,
  EXPO_MODE_UNIT_TEST,
} from "@/lib/kitchen/expo-mode-p2-93-policy";

const ROOT = process.cwd();

describe("Expo mode (P2-93)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(EXPO_MODE_POLICY_ID).toBe("expo-mode-p2-93-v1");
    expect(EXPO_MODE_ROUTE).toBe("/dashboard/kitchen/expo");
    expect(EXPO_MODE_CAPABILITY_COUNT).toBe(3);
    expect(EXPO_MODE_CAPABILITIES).toHaveLength(3);
  });

  it("passes full expo mode audit", () => {
    const summary = auditExpoMode(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.kdsBumpLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("detects ready work item statuses", () => {
    expect(isExpoWorkItemReady("READY")).toBe(true);
    expect(isExpoWorkItemReady("PACK_HANDOFF")).toBe(true);
    expect(isExpoWorkItemReady("TO_PREP")).toBe(false);
  });

  it("builds line items and completeness from work items", () => {
    const lineItems = buildExpoLineItems(
      ["Burger", "Fries"],
      [
        {
          orderId: "order-1",
          title: "Burger",
          status: "READY",
          station: "grill",
        },
        {
          orderId: "order-1",
          title: "Fries",
          status: "IN_PROGRESS",
          station: "fry",
        },
      ],
      "PREPARING",
    );

    const completeness = computeExpoCompleteness(lineItems);
    expect(completeness.readyCount).toBe(1);
    expect(completeness.missingItems).toEqual(["Fries"]);
    expect(completeness.completenessPercent).toBe(50);
  });

  it("builds handoff checklist and order snapshot", () => {
    const checklist = buildExpoHandoffChecklist({ isComplete: true, hasAllergenConflict: false });
    expect(checklist.find((item) => item.id === "all-items-present")?.checked).toBe(true);

    const snapshot = buildExpoOrderSnapshot({
      orderId: "order-1",
      customerName: "Table 4",
      status: "READY",
      elapsedSeconds: 420,
      items: ["Burger", "Salad"],
      workItems: [],
    });
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.canHandoff).toBe(true);
  });

  it("aggregates expo mode report", () => {
    const report = buildExpoModeReport(
      [
        {
          id: "order-1",
          customerName: "Table 4",
          status: "PREPARING",
          elapsedSeconds: 300,
          items: ["Burger"],
        },
      ],
      [
        {
          orderId: "order-1",
          title: "Burger",
          status: "TO_PREP",
          station: "grill",
        },
      ],
    );
    expect(report.queueCount).toBe(1);
    expect(report.incompleteCount).toBe(1);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[EXPO_MODE_NPM_SCRIPT]).toContain("audit-expo-mode.ts");
    expect(pkg.scripts["test:ci:expo-mode"]).toContain(EXPO_MODE_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, EXPO_MODE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(EXPO_MODE_NPM_SCRIPT);

    expect(existsSync(join(ROOT, EXPO_MODE_DOC))).toBe(true);
    expect(formatExpoModeAuditLines(auditExpoMode(ROOT)).length).toBeGreaterThan(5);
  });
});
