/**
 * AI Purchasing Manager smoke summary — wiring audit (Era 106).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_PURCHASING_ERA106_CAPABILITIES,
  AI_PURCHASING_ERA106_POLICY_ID,
  AI_PURCHASING_ERA106_ROUTE,
  AI_PURCHASING_ERA106_SERVICE,
  AI_PURCHASING_ERA106_WIRING_PATHS,
} from "@/lib/ai/ai-purchasing-era106-policy";

export const AI_PURCHASING_SMOKE_SUMMARY_VERSION = AI_PURCHASING_ERA106_POLICY_ID;

export type AiPurchasingSmokeEra106Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiPurchasingSmokeEra106ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiPurchasingSmokeEra106Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiPurchasingSmokeEra106Summary = {
  version: typeof AI_PURCHASING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiPurchasingSmokeEra106Overall;
  proofStatus: AiPurchasingSmokeEra106ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AiPurchasingSmokeEra106Step[];
  honestyNote: string;
};

export function auditAiPurchasingSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AI_PURCHASING_ERA106_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AI_PURCHASING_ERA106_SERVICE) {
      if (!src.includes("generatePurchaseRecommendations")) {
        failures.push("ai-purchasing.ts missing generatePurchaseRecommendations");
      }
      if (!src.includes("generateAiPurchasingDailyBrief")) {
        failures.push("ai-purchasing.ts missing generateAiPurchasingDailyBrief");
      }
      if (!src.includes("assembleAiPurchasingResult")) {
        failures.push("ai-purchasing.ts missing assembleAiPurchasingResult");
      }
    }

    if (rel === "lib/ai/ai-purchasing-builders.ts") {
      if (!src.includes("predictShortage")) {
        failures.push("ai-purchasing-builders.ts missing predictShortage");
      }
      if (!src.includes("optimizePrice")) {
        failures.push("ai-purchasing-builders.ts missing optimizePrice");
      }
      if (!src.includes("buildAiPurchasingDailyBrief")) {
        failures.push("ai-purchasing-builders.ts missing buildAiPurchasingDailyBrief");
      }
      if (!src.includes("buildPurchaseRecommendation")) {
        failures.push("ai-purchasing-builders.ts missing buildPurchaseRecommendation");
      }
      if (!src.includes("alternativeSupplier")) {
        failures.push("ai-purchasing-builders.ts missing alternative supplier logic");
      }
    }

    if (rel === "services/ai/ai-purchasing-dashboard.ts") {
      if (!src.includes("loadPurchasingAiDashboard")) {
        failures.push("ai-purchasing-dashboard.ts missing loadPurchasingAiDashboard");
      }
      if (!src.includes("generatePurchaseRecommendations")) {
        failures.push("ai-purchasing-dashboard.ts missing recommendation loader");
      }
    }

    if (rel === "app/dashboard/inventory/purchasing-ai/page.tsx") {
      if (!src.includes("PurchasingAiDashboard")) {
        failures.push("purchasing-ai page missing PurchasingAiDashboard");
      }
      if (!src.includes("loadPurchasingAiDashboard")) {
        failures.push("purchasing-ai page missing loadPurchasingAiDashboard");
      }
    }

    if (rel === "components/dashboard/purchasing-ai-dashboard.tsx") {
      if (!src.includes("purchasing-ai-dashboard")) {
        failures.push("purchasing-ai-dashboard.tsx missing root test id");
      }
      if (!src.includes("ai-purchasing-daily-brief")) {
        failures.push("purchasing-ai-dashboard.tsx missing daily brief card");
      }
      if (!src.includes("dailyBrief")) {
        failures.push("purchasing-ai-dashboard.tsx missing dailyBrief display");
      }
      if (!src.includes("alternativeSupplier")) {
        failures.push("purchasing-ai-dashboard.tsx missing alternative supplier UI");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAiPurchasingSmokeEra106ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiPurchasingSmokeEra106ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiPurchasingSmokeEra106Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AiPurchasingSmokeEra106Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAiPurchasingSmokeEra106ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiPurchasingSmokeEra106Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiPurchasingSmokeEra106Step[] = [
    {
      id: "wiring_audit",
      label: "Shortage prediction → price optimization → alternative supplier → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 106 AI Purchasing Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AI_PURCHASING_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AI_PURCHASING_ERA106_ROUTE,
    capabilities: AI_PURCHASING_ERA106_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with ingredients, supplier catalog, and demand data.",
  };
}

export function formatAiPurchasingSmokeEra106ReportLines(
  summary: AiPurchasingSmokeEra106Summary,
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
