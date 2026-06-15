import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAllergenTrackingP2_101,
  formatAllergenTrackingP2_101AuditLines,
} from "@/lib/inventory/allergen-tracking-p2-101-audit";
import { ALLERGEN_TRACKING_P2_101_CAPABILITIES } from "@/lib/inventory/allergen-tracking-p2-101-content";
import {
  buildAllergenTrackingDemoReport,
  buildRegulatoryAllergenRegistry,
  linkInventoryIngredientAllergens,
  rollUpRecipeAllergens,
  ALLERGEN_TRACKING_DEMO_INVENTORY,
  ALLERGEN_TRACKING_DEMO_RECIPES,
} from "@/lib/inventory/allergen-tracking-p2-101-operations";
import {
  ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT,
  ALLERGEN_TRACKING_P2_101_CI_WORKFLOW,
  ALLERGEN_TRACKING_P2_101_DOC,
  ALLERGEN_TRACKING_P2_101_NPM_SCRIPT,
  ALLERGEN_TRACKING_P2_101_POLICY_ID,
  ALLERGEN_TRACKING_P2_101_ROUTE,
  ALLERGEN_TRACKING_P2_101_UNIT_TEST,
} from "@/lib/inventory/allergen-tracking-p2-101-policy";
import { STANDARD_ALLERGEN_KEYS } from "@/lib/nutrition/allergen-registry";

const ROOT = process.cwd();

describe("Allergen tracking (P2-101)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(ALLERGEN_TRACKING_P2_101_POLICY_ID).toBe("allergen-tracking-p2-101-v1");
    expect(ALLERGEN_TRACKING_P2_101_ROUTE).toBe("/dashboard/inventory/allergen-tracking");
    expect(ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT).toBe(3);
    expect(ALLERGEN_TRACKING_P2_101_CAPABILITIES).toHaveLength(3);
  });

  it("passes full allergen tracking audit", () => {
    const summary = auditAllergenTrackingP2_101(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyRegistryLinked).toBe(true);
    expect(summary.legacyServiceLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds regulatory allergen registry with 14 keys", () => {
    const registry = buildRegulatoryAllergenRegistry();
    expect(registry.length).toBe(STANDARD_ALLERGEN_KEYS.length);
    expect(registry.some((row) => row.key === "milk")).toBe(true);
    expect(registry.every((row) => row.regulatoryNote.length > 0)).toBe(true);
  });

  it("rolls up recipe allergens from ingredients and profile", () => {
    const rollup = rollUpRecipeAllergens(ALLERGEN_TRACKING_DEMO_RECIPES[0]!);
    expect(rollup.rolledUpAllergens).toContain("wheat");
    expect(rollup.rolledUpAllergens).toContain("milk");
    expect(rollup.containsStatement).toContain("Contains:");
  });

  it("links inventory ingredients to allergen keys", () => {
    const links = linkInventoryIngredientAllergens([...ALLERGEN_TRACKING_DEMO_INVENTORY]);
    expect(links.length).toBe(4);
    expect(links.find((row) => row.ingredientId === "ing-peanut-oil")?.allergenKeys).toContain(
      "peanuts",
    );
  });

  it("builds demo allergen tracking report", () => {
    const report = buildAllergenTrackingDemoReport();
    expect(report.registryCount).toBe(STANDARD_ALLERGEN_KEYS.length);
    expect(report.recipeRollupCount).toBe(2);
    expect(report.inventoryLinkCount).toBe(4);
    expect(report.unverifiedRecipeCount).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[ALLERGEN_TRACKING_P2_101_NPM_SCRIPT]).toContain(
      "audit-allergen-tracking-p2-101.ts",
    );
    expect(pkg.scripts["test:ci:allergen-tracking-p2-101"]).toContain(
      ALLERGEN_TRACKING_P2_101_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ALLERGEN_TRACKING_P2_101_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(ALLERGEN_TRACKING_P2_101_NPM_SCRIPT);

    expect(existsSync(join(ROOT, ALLERGEN_TRACKING_P2_101_DOC))).toBe(true);
    expect(
      formatAllergenTrackingP2_101AuditLines(auditAllergenTrackingP2_101(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
