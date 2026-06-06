/**
 * AI Marketing Manager smoke summary — wiring audit (Era 110).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_MARKETING_MANAGER_ERA110_CAPABILITIES,
  AI_MARKETING_MANAGER_ERA110_POLICY_ID,
  AI_MARKETING_MANAGER_ERA110_ROUTE,
  AI_MARKETING_MANAGER_ERA110_SERVICE,
  AI_MARKETING_MANAGER_ERA110_WIRING_PATHS,
} from "@/lib/ai/marketing-manager-era110-policy";

export const AI_MARKETING_MANAGER_SMOKE_SUMMARY_VERSION = AI_MARKETING_MANAGER_ERA110_POLICY_ID;

export type AiMarketingManagerSmokeEra110Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiMarketingManagerSmokeEra110ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiMarketingManagerSmokeEra110Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiMarketingManagerSmokeEra110Summary = {
  version: typeof AI_MARKETING_MANAGER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiMarketingManagerSmokeEra110Overall;
  proofStatus: AiMarketingManagerSmokeEra110ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AiMarketingManagerSmokeEra110Step[];
  honestyNote: string;
};

export function auditAiMarketingManagerSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AI_MARKETING_MANAGER_ERA110_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AI_MARKETING_MANAGER_ERA110_SERVICE) {
      if (!src.includes("loadMarketingManagerSnapshot")) {
        failures.push("marketing-manager.ts missing loadMarketingManagerSnapshot");
      }
      if (!src.includes("buildMarketingManagerSnapshot")) {
        failures.push("marketing-manager.ts missing buildMarketingManagerSnapshot");
      }
      if (!src.includes("listChurnRiskCustomers")) {
        failures.push("marketing-manager.ts missing churn risk loader");
      }
      if (!src.includes("listEmailCampaignFlows")) {
        failures.push("marketing-manager.ts missing email campaign flows");
      }
    }

    if (rel === "lib/ai/marketing-manager-builders.ts") {
      if (!src.includes("buildAutoCampaignRecommendations")) {
        failures.push("marketing-manager-builders.ts missing buildAutoCampaignRecommendations");
      }
      if (!src.includes("buildWeatherPromoRecommendations")) {
        failures.push("marketing-manager-builders.ts missing buildWeatherPromoRecommendations");
      }
      if (!src.includes("buildMarketingManagerDailyBrief")) {
        failures.push("marketing-manager-builders.ts missing buildMarketingManagerDailyBrief");
      }
      if (!src.includes("buildMarketingManagerSnapshot")) {
        failures.push("marketing-manager-builders.ts missing buildMarketingManagerSnapshot");
      }
    }

    if (rel === "lib/ai/marketing-manager-policy.ts") {
      if (!src.includes("AI_MARKETING_MANAGER_POLICY_ID")) {
        failures.push("marketing-manager-policy.ts missing policy id");
      }
      if (!src.includes("AI_MARKETING_CHURN_WINBACK_THRESHOLD")) {
        failures.push("marketing-manager-policy.ts missing churn threshold");
      }
    }

    if (rel === "app/dashboard/marketing/manager/page.tsx") {
      if (!src.includes("MarketingManagerClient")) {
        failures.push("marketing manager page missing MarketingManagerClient");
      }
      if (!src.includes("loadMarketingManagerSnapshot")) {
        failures.push("marketing manager page missing loadMarketingManagerSnapshot");
      }
    }

    if (rel === "components/marketing/marketing-manager-client.tsx") {
      if (!src.includes("ai-marketing-manager-root")) {
        failures.push("marketing-manager-client.tsx missing root test id");
      }
      if (!src.includes("ai-marketing-manager-daily-brief")) {
        failures.push("marketing-manager-client.tsx missing daily brief card");
      }
      if (!src.includes("autoCampaigns")) {
        failures.push("marketing-manager-client.tsx missing auto campaigns UI");
      }
      if (!src.includes("weatherPromos")) {
        failures.push("marketing-manager-client.tsx missing weather promos UI");
      }
      if (!src.includes("Weather & calendar promos")) {
        failures.push("marketing-manager-client.tsx missing weather promos section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAiMarketingManagerSmokeEra110ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiMarketingManagerSmokeEra110ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiMarketingManagerSmokeEra110Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AiMarketingManagerSmokeEra110Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAiMarketingManagerSmokeEra110ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiMarketingManagerSmokeEra110Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiMarketingManagerSmokeEra110Step[] = [
    {
      id: "wiring_audit",
      label: "Auto campaigns + weather promos → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 110 AI Marketing Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AI_MARKETING_MANAGER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AI_MARKETING_MANAGER_ERA110_ROUTE,
    capabilities: AI_MARKETING_MANAGER_ERA110_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with marketing consent, Klaviyo, and order history.",
  };
}

export function formatAiMarketingManagerSmokeEra110ReportLines(
  summary: AiMarketingManagerSmokeEra110Summary,
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
