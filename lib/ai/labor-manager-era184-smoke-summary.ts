/**
 * AI Labor Manager summary — Round 2 wiring audit (Era 184).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_LABOR_MANAGER_ERA184_CANONICAL_SUMMARY_ARTIFACT,
  AI_LABOR_MANAGER_ERA184_CAPABILITIES,
  AI_LABOR_MANAGER_ERA184_POLICY_ID,
  AI_LABOR_MANAGER_ERA184_ROUTE,
} from "@/lib/ai/labor-manager-era184-policy";
import { auditAiLaborManagerSmokeWiring } from "@/lib/ai/labor-manager-smoke-summary";

export const AI_LABOR_MANAGER_ERA184_SMOKE_SUMMARY_VERSION =
  AI_LABOR_MANAGER_ERA184_POLICY_ID;

export type AiLaborManagerSmokeEra184Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiLaborManagerSmokeEra184ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiLaborManagerSmokeEra184Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiLaborManagerSmokeEra184Summary = {
  version: typeof AI_LABOR_MANAGER_ERA184_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiLaborManagerSmokeEra184Overall;
  proofStatus: AiLaborManagerSmokeEra184ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: AiLaborManagerSmokeEra184Step[];
  honestyNote: string;
};

export function auditAiLaborManagerSmokeEra184Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAiLaborManagerSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, AI_LABOR_MANAGER_ERA184_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAiLaborManagerSmokeEra184ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiLaborManagerSmokeEra184ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiLaborManagerSmokeEra184Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AiLaborManagerSmokeEra184Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAiLaborManagerSmokeEra184ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiLaborManagerSmokeEra184Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiLaborManagerSmokeEra184Step[] = [
    {
      id: "wiring_audit",
      label: "Staffing optimization + overtime alerts → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 184 AI Labor Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era109)",
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
          ? "Canonical era109 smoke PASSED"
          : liveSmokeOverall
            ? `era109 artifact overall: ${liveSmokeOverall}`
            : "No era109 artifact — run npm run smoke:ai-labor-manager-era109",
    },
  ];

  return {
    version: AI_LABOR_MANAGER_ERA184_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: AI_LABOR_MANAGER_ERA184_ROUTE,
    capabilities: AI_LABOR_MANAGER_ERA184_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with schedule plan and clock data.",
  };
}

export function formatAiLaborManagerSmokeEra184ReportLines(
  summary: AiLaborManagerSmokeEra184Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era109): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
