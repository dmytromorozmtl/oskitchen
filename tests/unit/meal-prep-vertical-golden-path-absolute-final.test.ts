import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";
import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";
import { auditMealPrepVerticalGoldenPathWiring } from "@/lib/marketing/meal-prep-vertical-golden-path-audit";
import {
  MEAL_PREP_VERTICAL_CI_SCRIPTS,
  MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID,
  MEAL_PREP_VERTICAL_GOLDEN_PATH_ABSOLUTE_FINAL_POLICY_ID,
  MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC,
  MEAL_PREP_VERTICAL_LANDING_PATH,
  MEAL_PREP_VERTICAL_RECOMMENDED_PLAN,
  MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD,
  MEAL_PREP_VERTICAL_REQUIRED_SECTIONS,
  MEAL_PREP_VERTICAL_UNIT_TEST,
} from "@/lib/marketing/meal-prep-vertical-golden-path-absolute-final-policy";

const ROOT = process.cwd();

describe("Meal prep vertical golden path (Absolute Final Task 69)", () => {
  it("locks absolute final policy with four canonical sections", () => {
    expect(MEAL_PREP_VERTICAL_GOLDEN_PATH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "meal-prep-vertical-golden-path-absolute-final-v1",
    );
    expect(MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC).toBe("docs/meal-prep-vertical-golden-path.md");
    expect(MEAL_PREP_VERTICAL_LANDING_PATH).toBe("/landing/meal-prep");
    expect(MEAL_PREP_VERTICAL_REQUIRED_SECTIONS).toHaveLength(5);
  });

  it("registers meal-prep-weekly golden demo scenario", () => {
    const scenario = GOLDEN_DEMO_SCENARIOS.find(
      (s) => s.scenarioId === MEAL_PREP_VERTICAL_DEMO_SCENARIO_ID,
    );
    expect(scenario).toBeTruthy();
    expect(scenario?.vertical).toBe("meal-prep");
    expect(scenario?.title).toContain("Meal prep");
  });

  it("aligns recommended Pro pricing with plan registry", () => {
    expect(PLAN_REGISTRY[MEAL_PREP_VERTICAL_RECOMMENDED_PLAN].priceMonthlyUsd).toBe(
      MEAL_PREP_VERTICAL_RECOMMENDED_PRICE_USD,
    );
  });

  it("documents product brief, ICP, demo, and pricing", () => {
    const doc = readFileSync(join(ROOT, MEAL_PREP_VERTICAL_GOLDEN_PATH_DOC), "utf8");
    expect(doc).toContain("meal-prep-vertical-golden-path-absolute-final-v1");
    expect(doc).toContain("## Product brief");
    expect(doc).toContain("## ICP");
    expect(doc).toContain("## Demo");
    expect(doc).toContain("## Pricing");
    expect(doc).toContain("meal-prep-weekly");
    expect(doc).toContain("$79/mo");
    expect(doc).toContain("Honesty rule");
  });

  it("passes wiring audit", () => {
    const audit = auditMealPrepVerticalGoldenPathWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.demoScenarioPresent).toBe(true);
    expect(audit.sectionCount).toBe(MEAL_PREP_VERTICAL_REQUIRED_SECTIONS.length);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of MEAL_PREP_VERTICAL_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(MEAL_PREP_VERTICAL_UNIT_TEST).toBe(
      "tests/unit/meal-prep-vertical-golden-path-absolute-final.test.ts",
    );
  });
});
