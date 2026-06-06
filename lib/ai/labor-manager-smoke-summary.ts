/**
 * AI Labor Manager smoke summary — wiring audit (Era 109).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_LABOR_MANAGER_ERA109_CAPABILITIES,
  AI_LABOR_MANAGER_ERA109_POLICY_ID,
  AI_LABOR_MANAGER_ERA109_ROUTE,
  AI_LABOR_MANAGER_ERA109_SERVICE,
  AI_LABOR_MANAGER_ERA109_WIRING_PATHS,
} from "@/lib/ai/labor-manager-era109-policy";

export const AI_LABOR_MANAGER_SMOKE_SUMMARY_VERSION = AI_LABOR_MANAGER_ERA109_POLICY_ID;

export type AiLaborManagerSmokeEra109Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiLaborManagerSmokeEra109ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiLaborManagerSmokeEra109Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiLaborManagerSmokeEra109Summary = {
  version: typeof AI_LABOR_MANAGER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiLaborManagerSmokeEra109Overall;
  proofStatus: AiLaborManagerSmokeEra109ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  capabilities: readonly string[];
  steps: AiLaborManagerSmokeEra109Step[];
  honestyNote: string;
};

export function auditAiLaborManagerSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of AI_LABOR_MANAGER_ERA109_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === AI_LABOR_MANAGER_ERA109_SERVICE) {
      if (!src.includes("loadLaborManagerSnapshot")) {
        failures.push("labor-manager.ts missing loadLaborManagerSnapshot");
      }
      if (!src.includes("buildLaborManagerSnapshot")) {
        failures.push("labor-manager.ts missing buildLaborManagerSnapshot");
      }
      if (!src.includes("getLaborRealtimeData")) {
        failures.push("labor-manager.ts missing getLaborRealtimeData");
      }
      if (!src.includes("loadAiSchedulePlan")) {
        failures.push("labor-manager.ts missing loadAiSchedulePlan");
      }
    }

    if (rel === "lib/ai/labor-manager-builders.ts") {
      if (!src.includes("buildStaffingOptimizationSignals")) {
        failures.push("labor-manager-builders.ts missing buildStaffingOptimizationSignals");
      }
      if (!src.includes("buildOvertimeAlerts")) {
        failures.push("labor-manager-builders.ts missing buildOvertimeAlerts");
      }
      if (!src.includes("buildLaborManagerDailyBrief")) {
        failures.push("labor-manager-builders.ts missing buildLaborManagerDailyBrief");
      }
      if (!src.includes("buildLaborManagerSnapshot")) {
        failures.push("labor-manager-builders.ts missing buildLaborManagerSnapshot");
      }
    }

    if (rel === "lib/ai/labor-manager-policy.ts") {
      if (!src.includes("AI_LABOR_MANAGER_POLICY_ID")) {
        failures.push("labor-manager-policy.ts missing policy id");
      }
      if (!src.includes("AI_LABOR_OT_THRESHOLD_HOURS")) {
        failures.push("labor-manager-policy.ts missing OT threshold");
      }
    }

    if (rel === "app/dashboard/staff/labor-manager/page.tsx") {
      if (!src.includes("LaborManagerClient")) {
        failures.push("labor-manager page missing LaborManagerClient");
      }
      if (!src.includes("loadLaborManagerSnapshot")) {
        failures.push("labor-manager page missing loadLaborManagerSnapshot");
      }
    }

    if (rel === "components/labor/labor-manager-client.tsx") {
      if (!src.includes("ai-labor-manager-root")) {
        failures.push("labor-manager-client.tsx missing root test id");
      }
      if (!src.includes("ai-labor-manager-daily-brief")) {
        failures.push("labor-manager-client.tsx missing daily brief card");
      }
      if (!src.includes("staffingSignals")) {
        failures.push("labor-manager-client.tsx missing staffing signals UI");
      }
      if (!src.includes("overtimeAlerts")) {
        failures.push("labor-manager-client.tsx missing overtime alerts UI");
      }
      if (!src.includes("Staffing optimization")) {
        failures.push("labor-manager-client.tsx missing staffing optimization section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveAiLaborManagerSmokeEra109ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiLaborManagerSmokeEra109ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiLaborManagerSmokeEra109Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): AiLaborManagerSmokeEra109Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveAiLaborManagerSmokeEra109ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiLaborManagerSmokeEra109Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiLaborManagerSmokeEra109Step[] = [
    {
      id: "wiring_audit",
      label: "Staffing optimization + overtime alerts → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 109 AI Labor Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: AI_LABOR_MANAGER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: AI_LABOR_MANAGER_ERA109_ROUTE,
    capabilities: AI_LABOR_MANAGER_ERA109_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with schedule plan and clock data.",
  };
}

export function formatAiLaborManagerSmokeEra109ReportLines(
  summary: AiLaborManagerSmokeEra109Summary,
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
