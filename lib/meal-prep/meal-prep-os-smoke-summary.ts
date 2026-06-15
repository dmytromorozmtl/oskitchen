/**
 * Meal Prep OS smoke summary — wiring audit (Era 114).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MEAL_PREP_OS_ERA114_MODULES,
  MEAL_PREP_OS_ERA114_POLICY_ID,
  MEAL_PREP_OS_ERA114_ROUTE,
  MEAL_PREP_OS_ERA114_SERVICE,
  MEAL_PREP_OS_ERA114_WIRING_PATHS,
} from "@/lib/meal-prep/meal-prep-os-era114-policy";

export const MEAL_PREP_OS_SMOKE_SUMMARY_VERSION = MEAL_PREP_OS_ERA114_POLICY_ID;

export type MealPrepOsSmokeEra114Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MealPrepOsSmokeEra114ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MealPrepOsSmokeEra114Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MealPrepOsSmokeEra114Summary = {
  version: typeof MEAL_PREP_OS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MealPrepOsSmokeEra114Overall;
  proofStatus: MealPrepOsSmokeEra114ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  modules: readonly string[];
  steps: MealPrepOsSmokeEra114Step[];
  honestyNote: string;
};

export function auditMealPrepOsSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MEAL_PREP_OS_ERA114_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MEAL_PREP_OS_ERA114_SERVICE) {
      if (!src.includes("loadMealPrepOsDashboard")) {
        failures.push("meal-prep-os-service.ts missing loadMealPrepOsDashboard");
      }
      if (!src.includes("buildMealPrepOsDashboard")) {
        failures.push("meal-prep-os-service.ts missing buildMealPrepOsDashboard");
      }
      if (!src.includes("loadMealPlanOverviewKpis")) {
        failures.push("meal-prep-os-service.ts missing loadMealPlanOverviewKpis");
      }
      if (!src.includes("WEEKLY_PREORDER")) {
        failures.push("meal-prep-os-service.ts missing weekly menu query");
      }
      if (!src.includes("mealPlanCycle")) {
        failures.push("meal-prep-os-service.ts missing subscription cycle query");
      }
    }

    if (rel === "lib/meal-prep/meal-prep-os-builders.ts") {
      if (!src.includes("buildWeeklyMenuModule")) {
        failures.push("meal-prep-os-builders.ts missing buildWeeklyMenuModule");
      }
      if (!src.includes("buildCutoffsModule")) {
        failures.push("meal-prep-os-builders.ts missing buildCutoffsModule");
      }
      if (!src.includes("buildForecastingModule")) {
        failures.push("meal-prep-os-builders.ts missing buildForecastingModule");
      }
      if (!src.includes("buildSubscriptionsModule")) {
        failures.push("meal-prep-os-builders.ts missing buildSubscriptionsModule");
      }
      if (!src.includes("buildMealPrepOsDashboard")) {
        failures.push("meal-prep-os-builders.ts missing buildMealPrepOsDashboard");
      }
    }

    if (rel === "lib/meal-prep/meal-prep-os-policy.ts") {
      if (!src.includes("MEAL_PREP_OS_POLICY_ID")) {
        failures.push("meal-prep-os-policy.ts missing policy id");
      }
      if (!src.includes("MEAL_PREP_OS_PATH")) {
        failures.push("meal-prep-os-policy.ts missing route");
      }
    }

    if (rel === "app/dashboard/meal-prep/page.tsx") {
      if (!src.includes("MealPrepOsPanel")) {
        failures.push("meal-prep page missing MealPrepOsPanel");
      }
      if (!src.includes("loadMealPrepOsDashboard")) {
        failures.push("meal-prep page missing loadMealPrepOsDashboard");
      }
    }

    if (rel === "components/meal-prep/meal-prep-os-panel.tsx") {
      if (!src.includes("meal-prep-os-panel")) {
        failures.push("meal-prep-os-panel.tsx missing root test id");
      }
      if (!src.includes("Meal Prep OS")) {
        failures.push("meal-prep-os-panel.tsx missing Meal Prep OS title");
      }
      if (!src.includes("Weekly menus, preorder cutoffs, demand forecasting, and subscription cycles")) {
        failures.push("meal-prep-os-panel.tsx missing four-module copy");
      }
      if (!src.includes("modules.map")) {
        failures.push("meal-prep-os-panel.tsx missing module cards");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveMealPrepOsSmokeEra114ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MealPrepOsSmokeEra114ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMealPrepOsSmokeEra114Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): MealPrepOsSmokeEra114Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveMealPrepOsSmokeEra114ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MealPrepOsSmokeEra114Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MealPrepOsSmokeEra114Step[] = [
    {
      id: "wiring_audit",
      label: "Weekly menu + cutoffs + forecasting + subscriptions → four modules → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 114 Meal Prep OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MEAL_PREP_OS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: MEAL_PREP_OS_ERA114_ROUTE,
    modules: MEAL_PREP_OS_ERA114_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with weekly menus, meal plans, and active cycles.",
  };
}

export function formatMealPrepOsSmokeEra114ReportLines(
  summary: MealPrepOsSmokeEra114Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
