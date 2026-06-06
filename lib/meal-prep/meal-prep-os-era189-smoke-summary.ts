/**
 * Meal Prep OS summary — Round 2 wiring audit (Era 189).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MEAL_PREP_OS_ERA189_CANONICAL_SUMMARY_ARTIFACT,
  MEAL_PREP_OS_ERA189_MODULES,
  MEAL_PREP_OS_ERA189_POLICY_ID,
  MEAL_PREP_OS_ERA189_ROUTE,
} from "@/lib/meal-prep/meal-prep-os-era189-policy";
import { auditMealPrepOsSmokeWiring } from "@/lib/meal-prep/meal-prep-os-smoke-summary";

export const MEAL_PREP_OS_ERA189_SMOKE_SUMMARY_VERSION = MEAL_PREP_OS_ERA189_POLICY_ID;

export type MealPrepOsSmokeEra189Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MealPrepOsSmokeEra189ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MealPrepOsSmokeEra189Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MealPrepOsSmokeEra189Summary = {
  version: typeof MEAL_PREP_OS_ERA189_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MealPrepOsSmokeEra189Overall;
  proofStatus: MealPrepOsSmokeEra189ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  modules: readonly string[];
  steps: MealPrepOsSmokeEra189Step[];
  honestyNote: string;
};

export function auditMealPrepOsSmokeEra189Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditMealPrepOsSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, MEAL_PREP_OS_ERA189_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveMealPrepOsSmokeEra189ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MealPrepOsSmokeEra189ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMealPrepOsSmokeEra189Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): MealPrepOsSmokeEra189Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveMealPrepOsSmokeEra189ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MealPrepOsSmokeEra189Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MealPrepOsSmokeEra189Step[] = [
    {
      id: "wiring_audit",
      label: "Weekly menu + cutoffs + forecasting + subscriptions → four modules → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 189 Meal Prep OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era114)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era114 smoke PASSED"
          : liveSmokeOverall
            ? `era114 artifact overall: ${liveSmokeOverall}`
            : "No era114 artifact — run npm run smoke:meal-prep-os-era114",
    },
  ];

  return {
    version: MEAL_PREP_OS_ERA189_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: MEAL_PREP_OS_ERA189_ROUTE,
    modules: MEAL_PREP_OS_ERA189_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with weekly menus, meal plans, and active cycles.",
  };
}

export function formatMealPrepOsSmokeEra189ReportLines(
  summary: MealPrepOsSmokeEra189Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era114): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
