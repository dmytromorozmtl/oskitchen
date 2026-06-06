/**
 * AI Food Cost Manager summary — Round 2 wiring audit (Era 183).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_FOOD_COST_MANAGER_ERA183_CANONICAL_SUMMARY_ARTIFACT,
  AI_FOOD_COST_MANAGER_ERA183_CAPABILITIES,
  AI_FOOD_COST_MANAGER_ERA183_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA183_ROUTE,
} from "@/lib/ai/food-cost-manager-era183-policy";
import { auditAiFoodCostManagerSmokeWiring } from "@/lib/ai/food-cost-manager-smoke-summary";

export const AI_FOOD_COST_MANAGER_ERA183_SMOKE_SUMMARY_VERSION =
  AI_FOOD_COST_MANAGER_ERA183_POLICY_ID;

export type AiFoodCostManagerSmokeEra183Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiFoodCostManagerSmokeEra183ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiFoodCostManagerSmokeEra183Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiFoodCostManagerSmokeEra183Summary = {
  version: typeof AI_FOOD_COST_MANAGER_ERA183_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiFoodCostManagerSmokeEra183Overall;
  proofStatus: AiFoodCostManagerSmokeEra183ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: AiFoodCostManagerSmokeEra183Step[];
  honestyNote: string;
};

export function auditAiFoodCostManagerSmokeEra183Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAiFoodCostManagerSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, AI_FOOD_COST_MANAGER_ERA183_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAiFoodCostManagerSmokeEra183ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiFoodCostManagerSmokeEra183ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiFoodCostManagerSmokeEra183Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AiFoodCostManagerSmokeEra183Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAiFoodCostManagerSmokeEra183ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiFoodCostManagerSmokeEra183Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiFoodCostManagerSmokeEra183Step[] = [
    {
      id: "wiring_audit",
      label: "Per-item profit → real-time margin → price recommendations → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 183 AI Food Cost Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era108)",
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
          ? "Canonical era108 smoke PASSED"
          : liveSmokeOverall
            ? `era108 artifact overall: ${liveSmokeOverall}`
            : "No era108 artifact — run npm run smoke:ai-food-cost-manager-era108",
    },
  ];

  return {
    version: AI_FOOD_COST_MANAGER_ERA183_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: AI_FOOD_COST_MANAGER_ERA183_ROUTE,
    capabilities: AI_FOOD_COST_MANAGER_ERA183_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with recipes, costing runs, and menu prices.",
  };
}

export function formatAiFoodCostManagerSmokeEra183ReportLines(
  summary: AiFoodCostManagerSmokeEra183Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era108): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
