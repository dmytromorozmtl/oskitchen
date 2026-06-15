/**
 * Analytics Suite summary — Round 2 wiring audit (Era 200).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ANALYTICS_SUITE_ERA200_CANONICAL_SUMMARY_ARTIFACT,
  ANALYTICS_SUITE_ERA200_LANES,
  ANALYTICS_SUITE_ERA200_POLICY_ID,
  ANALYTICS_SUITE_ERA200_ROUTE,
} from "@/lib/analytics/analytics-suite-era200-policy";
import { auditAnalyticsSuiteSmokeWiring } from "@/lib/analytics/analytics-suite-smoke-summary";

export const ANALYTICS_SUITE_ERA200_SMOKE_SUMMARY_VERSION = ANALYTICS_SUITE_ERA200_POLICY_ID;

export type AnalyticsSuiteSmokeEra200Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AnalyticsSuiteSmokeEra200ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AnalyticsSuiteSmokeEra200Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AnalyticsSuiteSmokeEra200Summary = {
  version: typeof ANALYTICS_SUITE_ERA200_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AnalyticsSuiteSmokeEra200Overall;
  proofStatus: AnalyticsSuiteSmokeEra200ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  lanes: readonly string[];
  steps: AnalyticsSuiteSmokeEra200Step[];
  honestyNote: string;
};

export function auditAnalyticsSuiteSmokeEra200Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAnalyticsSuiteSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, ANALYTICS_SUITE_ERA200_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAnalyticsSuiteSmokeEra200ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AnalyticsSuiteSmokeEra200ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAnalyticsSuiteSmokeEra200Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AnalyticsSuiteSmokeEra200Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAnalyticsSuiteSmokeEra200ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AnalyticsSuiteSmokeEra200Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AnalyticsSuiteSmokeEra200Step[] = [
    {
      id: "wiring_audit",
      label: "Revenue → orders → operations → forecast — all metrics one screen",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 200 Analytics Suite cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era125)",
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
          ? "Canonical era125 smoke PASSED"
          : liveSmokeOverall
            ? `era125 artifact overall: ${liveSmokeOverall}`
            : "No era125 artifact — run npm run smoke:analytics-suite-era125",
    },
  ];

  return {
    version: ANALYTICS_SUITE_ERA200_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: ANALYTICS_SUITE_ERA200_ROUTE,
    lanes: ANALYTICS_SUITE_ERA200_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires tenant order history and analytics data in the default window.",
  };
}

export function formatAnalyticsSuiteSmokeEra200ReportLines(
  summary: AnalyticsSuiteSmokeEra200Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era125): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
