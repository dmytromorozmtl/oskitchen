import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MEAL_PREP_OS_ERA114_CANONICAL_POLICY_ID,
  MEAL_PREP_OS_ERA114_MODULES,
  MEAL_PREP_OS_ERA114_POLICY_ID,
  MEAL_PREP_OS_ERA114_ROUTE,
  MEAL_PREP_OS_ERA114_SERVICE,
  MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT,
  MEAL_PREP_OS_ERA114_WIRING_PATHS,
} from "@/lib/meal-prep/meal-prep-os-era114-policy";
import {
  auditMealPrepOsSmokeWiring,
  buildMealPrepOsSmokeEra114Summary,
  resolveMealPrepOsSmokeEra114ProofStatus,
} from "@/lib/meal-prep/meal-prep-os-smoke-summary";
import {
  MEAL_PREP_OS_POLICY_ID,
  MEAL_PREP_OS_SERVICE,
} from "@/lib/meal-prep/meal-prep-os-policy";

const ROOT = process.cwd();

describe("meal prep os era114", () => {
  it("locks era114 policy and artifact path", () => {
    expect(MEAL_PREP_OS_ERA114_POLICY_ID).toBe("era114-meal-prep-os-v1");
    expect(MEAL_PREP_OS_ERA114_SUMMARY_ARTIFACT).toBe(
      "artifacts/meal-prep-os-smoke-summary.json",
    );
    expect(MEAL_PREP_OS_ERA114_ROUTE).toBe("/dashboard/meal-prep");
    expect(MEAL_PREP_OS_ERA114_MODULES).toHaveLength(4);
  });

  it("aligns era114 with canonical meal prep policy", () => {
    expect(MEAL_PREP_OS_ERA114_CANONICAL_POLICY_ID).toBe(MEAL_PREP_OS_POLICY_ID);
    expect(MEAL_PREP_OS_ERA114_SERVICE).toBe(MEAL_PREP_OS_SERVICE);
  });

  it("audits in-repo Meal Prep OS wiring", () => {
    const audit = auditMealPrepOsSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MEAL_PREP_OS_ERA114_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-module weekly menu cutoffs forecasting subscriptions wiring", () => {
    const service = readFileSync(join(ROOT, MEAL_PREP_OS_ERA114_SERVICE), "utf8");
    expect(service).toContain("loadMealPrepOsDashboard");
    expect(service).toContain("loadMealPlanOverviewKpis");
    expect(service).toContain("WEEKLY_PREORDER");

    const builders = readFileSync(join(ROOT, "lib/meal-prep/meal-prep-os-builders.ts"), "utf8");
    expect(builders).toContain("buildWeeklyMenuModule");
    expect(builders).toContain("buildForecastingModule");

    const panel = readFileSync(
      join(ROOT, "components/meal-prep/meal-prep-os-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("meal-prep-os-panel");
    expect(panel).toContain("Meal Prep OS");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMealPrepOsSmokeEra114ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMealPrepOsSmokeEra114ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMealPrepOsSmokeEra114Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("cutoffs");
  });
});
