import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRecipeCostingEngineP2_97,
  formatRecipeCostingEngineP2_97AuditLines,
} from "@/lib/inventory/recipe-costing-engine-p2-97-audit";
import { RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES } from "@/lib/inventory/recipe-costing-engine-p2-97-content";
import {
  buildRecipeCostingEngineItemReport,
  buildRecipeCostingEngineReport,
  buildRecipeIngredientCostLines,
  computeMarginByItem,
  computePortionCost,
  RECIPE_COSTING_ENGINE_DEMO_FIXTURE,
} from "@/lib/inventory/recipe-costing-engine-p2-97-operations";
import {
  RECIPE_COSTING_ENGINE_P2_97_CI_WORKFLOW,
  RECIPE_COSTING_ENGINE_P2_97_DOC,
  RECIPE_COSTING_ENGINE_P2_97_NPM_SCRIPT,
  RECIPE_COSTING_ENGINE_P2_97_POLICY_ID,
  RECIPE_COSTING_ENGINE_P2_97_ROUTE,
  RECIPE_COSTING_ENGINE_P2_97_UNIT_TEST,
  RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT,
} from "@/lib/inventory/recipe-costing-engine-p2-97-policy";

const ROOT = process.cwd();

describe("Recipe costing engine (P2-97)", () => {
  it("locks policy id, route, and five capabilities", () => {
    expect(RECIPE_COSTING_ENGINE_P2_97_POLICY_ID).toBe("recipe-costing-engine-p2-97-v1");
    expect(RECIPE_COSTING_ENGINE_P2_97_ROUTE).toBe("/dashboard/costing/recipe-engine");
    expect(RECIPE_COSTING_ENGINE_P2_97_CAPABILITY_COUNT).toBe(5);
    expect(RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES).toHaveLength(5);
  });

  it("passes full recipe costing engine audit", () => {
    const summary = auditRecipeCostingEngineP2_97(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCalculationsLinked).toBe(true);
    expect(summary.legacyServiceLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes ingredient cost lines with waste factor", () => {
    const [recipe] = RECIPE_COSTING_ENGINE_DEMO_FIXTURE;
    const lines = buildRecipeIngredientCostLines(recipe!);
    expect(lines.length).toBe(3);
    expect(lines[0]!.wasteFactor).toBeGreaterThan(1);
    expect(lines[0]!.costPerPortion).toBeGreaterThan(0);
  });

  it("computes portion cost and margin by item", () => {
    const [recipe] = RECIPE_COSTING_ENGINE_DEMO_FIXTURE;
    const portionCost = computePortionCost(recipe!);
    expect(portionCost).toBeGreaterThan(0);

    const margin = computeMarginByItem(
      recipe!.recipeId,
      recipe!.recipeName,
      recipe!.salePrice,
      portionCost,
      portionCost * 0.6,
    );
    expect(margin.grossMarginPercent).toBeGreaterThan(0);
    expect(margin.grossProfit).toBeGreaterThan(0);
  });

  it("builds demo recipe costing engine report", () => {
    const report = buildRecipeCostingEngineReport(RECIPE_COSTING_ENGINE_DEMO_FIXTURE);
    expect(report.itemCount).toBe(2);
    expect(report.items.every((item) => item.portionCost > 0)).toBe(true);
    expect(report.items.every((item) => item.margin.grossMarginPercent > 0)).toBe(true);

    const itemReport = buildRecipeCostingEngineItemReport(RECIPE_COSTING_ENGINE_DEMO_FIXTURE[0]!);
    expect(itemReport.yieldQuantity).toBe(1);
    expect(itemReport.ingredientLines.length).toBe(3);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[RECIPE_COSTING_ENGINE_P2_97_NPM_SCRIPT]).toContain(
      "audit-recipe-costing-engine-p2-97.ts",
    );
    expect(pkg.scripts["test:ci:recipe-costing-engine-p2-97"]).toContain(
      RECIPE_COSTING_ENGINE_P2_97_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, RECIPE_COSTING_ENGINE_P2_97_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(RECIPE_COSTING_ENGINE_P2_97_NPM_SCRIPT);

    expect(existsSync(join(ROOT, RECIPE_COSTING_ENGINE_P2_97_DOC))).toBe(true);
    expect(
      formatRecipeCostingEngineP2_97AuditLines(auditRecipeCostingEngineP2_97(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
