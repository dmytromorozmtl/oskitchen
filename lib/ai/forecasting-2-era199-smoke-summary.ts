/**
 * Forecasting 2.0 summary — Round 2 wiring audit (Era 199).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORECASTING_2_ERA199_CANONICAL_SUMMARY_ARTIFACT,
  FORECASTING_2_ERA199_POLICY_ID,
  FORECASTING_2_ERA199_ROUTE,
  FORECASTING_2_ERA199_SIGNALS,
} from "@/lib/ai/forecasting-era199-policy";
import { auditForecasting2SmokeWiring } from "@/lib/ai/forecasting-2-smoke-summary";

export const FORECASTING_2_ERA199_SMOKE_SUMMARY_VERSION = FORECASTING_2_ERA199_POLICY_ID;

export type Forecasting2SmokeEra199Overall = "PASSED" | "FAILED" | "SKIPPED";

export type Forecasting2SmokeEra199ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type Forecasting2SmokeEra199Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type Forecasting2SmokeEra199Summary = {
  version: typeof FORECASTING_2_ERA199_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: Forecasting2SmokeEra199Overall;
  proofStatus: Forecasting2SmokeEra199ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  signals: readonly string[];
  steps: Forecasting2SmokeEra199Step[];
  honestyNote: string;
};

export function auditForecasting2SmokeEra199Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditForecasting2SmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, FORECASTING_2_ERA199_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveForecasting2SmokeEra199ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): Forecasting2SmokeEra199ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildForecasting2SmokeEra199Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): Forecasting2SmokeEra199Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveForecasting2SmokeEra199ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: Forecasting2SmokeEra199Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: Forecasting2SmokeEra199Step[] = [
    {
      id: "wiring_audit",
      label: "90-day horizon → weather adjustments → holiday calendar",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 199 Forecasting 2.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era124)",
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
          ? "Canonical era124 smoke PASSED"
          : liveSmokeOverall
            ? `era124 artifact overall: ${liveSmokeOverall}`
            : "No era124 artifact — run npm run smoke:forecasting-2-era124",
    },
  ];

  return {
    version: FORECASTING_2_ERA199_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: FORECASTING_2_ERA199_ROUTE,
    signals: FORECASTING_2_ERA199_SIGNALS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires ≥7 days of order history for meaningful projections.",
  };
}

export function formatForecasting2SmokeEra199ReportLines(
  summary: Forecasting2SmokeEra199Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era124): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Signals: ${summary.signals.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
