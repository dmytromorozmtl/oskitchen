import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMenuEngineeringP2_105,
  formatMenuEngineeringP2_105AuditLines,
} from "@/lib/analytics/menu-engineering-p2-105-audit";
import { MENU_ENGINEERING_P2_105_CAPABILITIES } from "@/lib/analytics/menu-engineering-p2-105-content";
import {
  buildMenuEngineeringDemoReport,
  buildMenuEngineeringItems,
  buildQuadrantSummaries,
  classifyMenuEngineeringCategory,
  MENU_ENGINEERING_DEMO_ROWS,
} from "@/lib/analytics/menu-engineering-p2-105-operations";
import {
  MENU_ENGINEERING_P2_105_CAPABILITY_COUNT,
  MENU_ENGINEERING_P2_105_CI_WORKFLOW,
  MENU_ENGINEERING_P2_105_DOC,
  MENU_ENGINEERING_P2_105_NPM_SCRIPT,
  MENU_ENGINEERING_P2_105_POLICY_ID,
  MENU_ENGINEERING_P2_105_ROUTE,
  MENU_ENGINEERING_P2_105_UNIT_TEST,
} from "@/lib/analytics/menu-engineering-p2-105-policy";

const ROOT = process.cwd();

describe("Menu engineering (P2-105)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(MENU_ENGINEERING_P2_105_POLICY_ID).toBe("menu-engineering-p2-105-v1");
    expect(MENU_ENGINEERING_P2_105_ROUTE).toBe("/dashboard/analytics/menu-engineering");
    expect(MENU_ENGINEERING_P2_105_CAPABILITY_COUNT).toBe(3);
    expect(MENU_ENGINEERING_P2_105_CAPABILITIES).toHaveLength(3);
  });

  it("passes full menu engineering audit", () => {
    const summary = auditMenuEngineeringP2_105(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyServiceLinked).toBe(true);
    expect(summary.legacyPageLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("classifies menu engineering categories correctly", () => {
    expect(
      classifyMenuEngineeringCategory({
        popularity: 100,
        profitability: 70,
        avgPopularity: 50,
        targetMarginPercent: 65,
      }),
    ).toBe("STAR");
    expect(
      classifyMenuEngineeringCategory({
        popularity: 100,
        profitability: 50,
        avgPopularity: 50,
        targetMarginPercent: 65,
      }),
    ).toBe("PLOW");
    expect(
      classifyMenuEngineeringCategory({
        popularity: 20,
        profitability: 70,
        avgPopularity: 50,
        targetMarginPercent: 65,
      }),
    ).toBe("PUZZLE");
    expect(
      classifyMenuEngineeringCategory({
        popularity: 10,
        profitability: 40,
        avgPopularity: 50,
        targetMarginPercent: 65,
      }),
    ).toBe("DOG");
  });

  it("builds menu engineering items with recommendations", () => {
    const items = buildMenuEngineeringItems([...MENU_ENGINEERING_DEMO_ROWS]);
    expect(items.length).toBe(8);
    expect(items.every((i) => i.recommendation.length > 0)).toBe(true);
    expect(items.find((i) => i.category === "STAR")?.productName).toBe("Signature burger");
  });

  it("builds quadrant summaries for all four categories", () => {
    const items = buildMenuEngineeringItems([...MENU_ENGINEERING_DEMO_ROWS]);
    const quadrants = buildQuadrantSummaries(items);
    expect(quadrants).toHaveLength(4);
    expect(quadrants.find((q) => q.category === "STAR")?.count).toBe(2);
    expect(quadrants.find((q) => q.category === "DOG")?.action).toContain("Retire");
  });

  it("builds demo menu engineering report", () => {
    const report = buildMenuEngineeringDemoReport();
    expect(report.itemCount).toBe(8);
    expect(report.starCount).toBe(2);
    expect(report.plowCount).toBe(2);
    expect(report.puzzleCount).toBe(2);
    expect(report.dogCount).toBe(2);
    expect(report.targetMarginPercent).toBe(65);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[MENU_ENGINEERING_P2_105_NPM_SCRIPT]).toContain(
      "audit-menu-engineering-p2-105.ts",
    );
    expect(pkg.scripts["test:ci:menu-engineering-p2-105"]).toContain(
      MENU_ENGINEERING_P2_105_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MENU_ENGINEERING_P2_105_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(MENU_ENGINEERING_P2_105_NPM_SCRIPT);

    expect(existsSync(join(ROOT, MENU_ENGINEERING_P2_105_DOC))).toBe(true);
    expect(
      formatMenuEngineeringP2_105AuditLines(auditMenuEngineeringP2_105(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
