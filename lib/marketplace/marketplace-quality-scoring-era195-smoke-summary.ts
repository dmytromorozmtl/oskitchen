/**
 * Marketplace Quality Scoring summary — Round 2 wiring audit (Era 195).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QUALITY_SCORING_ERA195_CANONICAL_SUMMARY_ARTIFACT,
  QUALITY_SCORING_ERA195_DIMENSIONS,
  QUALITY_SCORING_ERA195_POLICY_ID,
  QUALITY_SCORING_ERA195_ROUTE,
} from "@/lib/marketplace/marketplace-quality-scoring-era195-policy";
import { auditQualityScoringSmokeWiring } from "@/lib/marketplace/marketplace-quality-scoring-smoke-summary";

export const QUALITY_SCORING_ERA195_SMOKE_SUMMARY_VERSION = QUALITY_SCORING_ERA195_POLICY_ID;

export type QualityScoringSmokeEra195Overall = "PASSED" | "FAILED" | "SKIPPED";

export type QualityScoringSmokeEra195ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type QualityScoringSmokeEra195Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type QualityScoringSmokeEra195Summary = {
  version: typeof QUALITY_SCORING_ERA195_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: QualityScoringSmokeEra195Overall;
  proofStatus: QualityScoringSmokeEra195ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  dimensions: readonly string[];
  steps: QualityScoringSmokeEra195Step[];
  honestyNote: string;
};

export function auditQualityScoringSmokeEra195Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditQualityScoringSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, QUALITY_SCORING_ERA195_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveQualityScoringSmokeEra195ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): QualityScoringSmokeEra195ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildQualityScoringSmokeEra195Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): QualityScoringSmokeEra195Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveQualityScoringSmokeEra195ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: QualityScoringSmokeEra195Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: QualityScoringSmokeEra195Step[] = [
    {
      id: "wiring_audit",
      label: "Reviews → supplier scores → tier rankings → quality alerts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 195 Marketplace Quality Scoring cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era120)",
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
          ? "Canonical era120 smoke PASSED"
          : liveSmokeOverall
            ? `era120 artifact overall: ${liveSmokeOverall}`
            : "No era120 artifact — run npm run smoke:marketplace-quality-scoring-era120",
    },
  ];

  return {
    version: QUALITY_SCORING_ERA195_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: QUALITY_SCORING_ERA195_ROUTE,
    dimensions: QUALITY_SCORING_ERA195_DIMENSIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires marketplace POs with vendor reviews and delivered orders.",
  };
}

export function formatQualityScoringSmokeEra195ReportLines(
  summary: QualityScoringSmokeEra195Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era120): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Dimensions: ${summary.dimensions.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
