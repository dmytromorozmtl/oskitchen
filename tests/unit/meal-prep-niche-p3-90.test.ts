import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMealPrepNicheP390,
  formatMealPrepNicheP390AuditLines,
} from "@/lib/marketing/meal-prep-niche-p3-90-audit";
import {
  mealPrepNicheHasAllPillars,
  MEAL_PREP_NICHE_P3_90_PILLARS,
  MEAL_PREP_NICHE_P3_90_TAGLINE,
} from "@/lib/marketing/meal-prep-niche-p3-90-content";
import {
  MEAL_PREP_NICHE_P3_90_ARTIFACT,
  MEAL_PREP_NICHE_P3_90_BRAND,
  MEAL_PREP_NICHE_P3_90_CHECK_NPM_SCRIPT,
  MEAL_PREP_NICHE_P3_90_CI_WORKFLOW,
  MEAL_PREP_NICHE_P3_90_DOC,
  MEAL_PREP_NICHE_P3_90_PILLAR_IDS,
  MEAL_PREP_NICHE_P3_90_POLICY_ID,
  MEAL_PREP_NICHE_P3_90_UNIT_TEST,
  MEAL_PREP_NICHE_P3_90_WIRING_PATHS,
} from "@/lib/marketing/meal-prep-niche-p3-90-policy";

const ROOT = process.cwd();

describe("Meal Prep OS niche positioning (P3-90)", () => {
  it("locks policy with 3 pillars and Meal Prep OS brand", () => {
    expect(MEAL_PREP_NICHE_P3_90_POLICY_ID).toBe("meal-prep-niche-p3-90-v1");
    expect(MEAL_PREP_NICHE_P3_90_BRAND).toBe("Meal Prep OS");
    expect(MEAL_PREP_NICHE_P3_90_PILLARS).toHaveLength(3);
    expect(mealPrepNicheHasAllPillars()).toBe(true);
    for (const id of MEAL_PREP_NICHE_P3_90_PILLAR_IDS) {
      expect(MEAL_PREP_NICHE_P3_90_PILLARS.some((p) => p.id === id)).toBe(true);
    }
    expect(MEAL_PREP_NICHE_P3_90_TAGLINE).toContain("Meal Prep OS");
  });

  it("passes full P3-90 meal prep niche audit", () => {
    const summary = auditMealPrepNicheP390(ROOT);
    expect(summary.allPillarsDefined, summary.failures.join("; ")).toBe(true);
    expect(summary.landingWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-90 wiring paths, CI gate, and artifact", () => {
    for (const path of MEAL_PREP_NICHE_P3_90_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MEAL_PREP_NICHE_P3_90_CHECK_NPM_SCRIPT]).toContain(
      MEAL_PREP_NICHE_P3_90_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, MEAL_PREP_NICHE_P3_90_CI_WORKFLOW), "utf8");
    expect(ci).toContain(MEAL_PREP_NICHE_P3_90_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, MEAL_PREP_NICHE_P3_90_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(MEAL_PREP_NICHE_P3_90_POLICY_ID);
    expect(artifact.pillars).toEqual(["subscription", "production", "storefront"]);

    const doc = readFileSync(join(ROOT, MEAL_PREP_NICHE_P3_90_DOC), "utf8");
    expect(doc).toContain(MEAL_PREP_NICHE_P3_90_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditMealPrepNicheP390(ROOT);
    const lines = formatMealPrepNicheP390AuditLines(summary);
    expect(lines.some((line) => line.includes(MEAL_PREP_NICHE_P3_90_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
