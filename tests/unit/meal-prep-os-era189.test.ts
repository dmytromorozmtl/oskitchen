import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MEAL_PREP_OS_ERA114_POLICY_ID } from "@/lib/meal-prep/meal-prep-os-era114-policy";
import {
  MEAL_PREP_OS_ERA189_CANONICAL_POLICY_ID,
  MEAL_PREP_OS_ERA189_MODULES,
  MEAL_PREP_OS_ERA189_POLICY_ID,
  MEAL_PREP_OS_ERA189_ROUTE,
  MEAL_PREP_OS_ERA189_SERVICE,
  MEAL_PREP_OS_ERA189_SUMMARY_ARTIFACT,
  MEAL_PREP_OS_ERA189_WIRING_PATHS,
} from "@/lib/meal-prep/meal-prep-os-era189-policy";
import {
  auditMealPrepOsSmokeEra189Wiring,
  buildMealPrepOsSmokeEra189Summary,
  resolveMealPrepOsSmokeEra189ProofStatus,
} from "@/lib/meal-prep/meal-prep-os-era189-smoke-summary";
import {
  MEAL_PREP_OS_POLICY_ID,
  MEAL_PREP_OS_SERVICE,
} from "@/lib/meal-prep/meal-prep-os-policy";

const ROOT = process.cwd();

describe("meal prep os era189", () => {
  it("locks era189 policy and artifact path", () => {
    expect(MEAL_PREP_OS_ERA189_POLICY_ID).toBe("era189-meal-prep-os-v1");
    expect(MEAL_PREP_OS_ERA189_SUMMARY_ARTIFACT).toBe(
      "artifacts/meal-prep-os-era189-smoke-summary.json",
    );
    expect(MEAL_PREP_OS_ERA189_ROUTE).toBe("/dashboard/meal-prep");
    expect(MEAL_PREP_OS_ERA189_WIRING_PATHS).toHaveLength(5);
    expect(MEAL_PREP_OS_ERA189_MODULES).toHaveLength(4);
  });

  it("aligns era189 with canonical Meal Prep OS policy", () => {
    expect(MEAL_PREP_OS_ERA189_CANONICAL_POLICY_ID).toBe(MEAL_PREP_OS_ERA114_POLICY_ID);
    expect(MEAL_PREP_OS_ERA189_SERVICE).toBe(MEAL_PREP_OS_SERVICE);
    expect(MEAL_PREP_OS_POLICY_ID).toBe("meal-prep-os-v1");
  });

  it("audits in-repo Meal Prep OS Round 2 wiring", () => {
    const audit = auditMealPrepOsSmokeEra189Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MEAL_PREP_OS_ERA189_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-module weekly menu cutoffs forecasting subscriptions wiring", () => {
    const service = readFileSync(join(ROOT, MEAL_PREP_OS_ERA189_SERVICE), "utf8");
    expect(service).toContain("loadMealPrepOsDashboard");
    expect(service).toContain("loadMealPlanOverviewKpis");
    expect(service).toContain("WEEKLY_PREORDER");
    expect(service).toContain("mealPlanCycle");

    const builders = readFileSync(join(ROOT, "lib/meal-prep/meal-prep-os-builders.ts"), "utf8");
    expect(builders).toContain("buildWeeklyMenuModule");
    expect(builders).toContain("buildCutoffsModule");
    expect(builders).toContain("buildForecastingModule");
    expect(builders).toContain("buildSubscriptionsModule");

    const panel = readFileSync(
      join(ROOT, "components/meal-prep/meal-prep-os-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("meal-prep-os-panel");
    expect(panel).toContain("Meal Prep OS");
    expect(panel).toContain("modules.map");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMealPrepOsSmokeEra189ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMealPrepOsSmokeEra189ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMealPrepOsSmokeEra189Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("weekly_menu");
    expect(summary.modules).toContain("cutoffs");
    expect(summary.modules).toContain("forecasting");
    expect(summary.modules).toContain("subscriptions");
  });
});
