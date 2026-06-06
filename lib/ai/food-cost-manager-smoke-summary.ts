/**
 * AI Food Cost Manager smoke summary — wiring audit (Era 108).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES,
  AI_FOOD_COST_MANAGER_ERA108_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA108_ROUTE,
  AI_FOOD_COST_MANAGER_ERA108_SERVICE,
  AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS,
} from "@/lib/ai/food-cost-manager-era108-policy";

export const AI_FOOD_COST_MANAGER_SMOKE_SUMMARY_VERSION = AI_FOOD_COST_MANAGER_ERA108_POLICY_ID;

export type AiFoodCostManagerSmokeEra108Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiFoodCostManagerSmokeEra108ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiFoodCostManagerSmokeEra108Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiFoodCostManagerSmokeEra108Summary = {
  version: typeof AI_FOOD_COST_MANAGER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiFoodCostManagerSmokeEra108Overall;
  proofStatus: AiFoodCostManagerSmokeEra108ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AiFoodCostManagerSmokeEra108Step[];
  honestyNote: string;
};

export function auditAiFoodCostManagerSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AI_FOOD_COST_MANAGER_ERA108_SERVICE) {
      if (!src.includes("analyzeFoodCost")) {
        failures.push("food-cost-ai.ts missing analyzeFoodCost");
      }
      if (!src.includes("generateFoodCostManagerDailyBrief")) {
        failures.push("food-cost-ai.ts missing generateFoodCostManagerDailyBrief");
      }
      if (!src.includes("assembleFoodCostAnalysis")) {
        failures.push("food-cost-ai.ts missing assembleFoodCostAnalysis");
      }
    }

    if (rel === "lib/ai/food-cost-builders.ts") {
      if (!src.includes("computeRealTimeMarginPercent")) {
        failures.push("food-cost-builders.ts missing computeRealTimeMarginPercent");
      }
      if (!src.includes("computeProfitPerItem")) {
        failures.push("food-cost-builders.ts missing computeProfitPerItem");
      }
      if (!src.includes("buildPriceRecommendation")) {
        failures.push("food-cost-builders.ts missing buildPriceRecommendation");
      }
      if (!src.includes("buildFoodCostManagerDailyBrief")) {
        failures.push("food-cost-builders.ts missing buildFoodCostManagerDailyBrief");
      }
    }

    if (rel === "lib/ai/food-cost-manager-policy.ts") {
      if (!src.includes("AI_FOOD_COST_MANAGER_POLICY_ID")) {
        failures.push("food-cost-manager-policy.ts missing policy id");
      }
      if (!src.includes("AI_FOOD_COST_MANAGER_ROUTE")) {
        failures.push("food-cost-manager-policy.ts missing route");
      }
    }

    if (rel === "services/ai/food-cost-dashboard.ts") {
      if (!src.includes("loadFoodCostDashboard")) {
        failures.push("food-cost-dashboard.ts missing loadFoodCostDashboard");
      }
      if (!src.includes("analyzeFoodCost")) {
        failures.push("food-cost-dashboard.ts missing analyzeFoodCost");
      }
    }

    if (rel === "app/dashboard/analytics/food-cost/page.tsx") {
      if (!src.includes("FoodCostDashboard")) {
        failures.push("food-cost page missing FoodCostDashboard");
      }
      if (!src.includes("loadFoodCostDashboard")) {
        failures.push("food-cost page missing loadFoodCostDashboard");
      }
    }

    if (rel === "components/dashboard/food-cost-dashboard.tsx") {
      if (!src.includes("food-cost-dashboard")) {
        failures.push("food-cost-dashboard.tsx missing root test id");
      }
      if (!src.includes("food-cost-manager-daily-brief")) {
        failures.push("food-cost-dashboard.tsx missing daily brief card");
      }
      if (!src.includes("realTimeMarginPercent")) {
        failures.push("food-cost-dashboard.tsx missing real-time margin column");
      }
      if (!src.includes("profitPerItem")) {
        failures.push("food-cost-dashboard.tsx missing profit per item column");
      }
      if (!src.includes("priceRecommendation")) {
        failures.push("food-cost-dashboard.tsx missing price recommendation drill-down");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAiFoodCostManagerSmokeEra108ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiFoodCostManagerSmokeEra108ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiFoodCostManagerSmokeEra108Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AiFoodCostManagerSmokeEra108Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAiFoodCostManagerSmokeEra108ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiFoodCostManagerSmokeEra108Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiFoodCostManagerSmokeEra108Step[] = [
    {
      id: "wiring_audit",
      label: "Per-item profit → real-time margin → price recommendations → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 108 AI Food Cost Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AI_FOOD_COST_MANAGER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AI_FOOD_COST_MANAGER_ERA108_ROUTE,
    capabilities: AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with recipes, costing runs, and menu prices.",
  };
}

export function formatAiFoodCostManagerSmokeEra108ReportLines(
  summary: AiFoodCostManagerSmokeEra108Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
