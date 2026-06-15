/**
 * Competitor feature gap matrix summary — Evolution Era 17 Workstream K Cycle 42.
 */

import { COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID } from "@/lib/commercial/competitor-feature-gap-matrix-era17-policy";

export const COMPETITOR_FEATURE_GAP_MATRIX_SUMMARY_VERSION =
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID;

export type CompetitorFeatureGapMatrixOverall = "PASSED" | "FAILED";

export type CompetitorMatrixProofStatus =
  | "evidence_aligned_era17"
  | "proof_failed_cert";

export type CompetitorFeatureGapMatrixSummary = {
  version: typeof COMPETITOR_FEATURE_GAP_MATRIX_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CompetitorFeatureGapMatrixOverall;
  matrixProofStatus: CompetitorMatrixProofStatus;
  certPassed: boolean;
  requiredCompetitorCount: number;
};

export function resolveCompetitorMatrixProofStatus(certPassed: boolean): CompetitorMatrixProofStatus {
  return certPassed ? "evidence_aligned_era17" : "proof_failed_cert";
}

export function recomputeCompetitorMatrixProofStatusFromSummary(
  summary: CompetitorFeatureGapMatrixSummary,
): CompetitorMatrixProofStatus {
  return resolveCompetitorMatrixProofStatus(summary.certPassed);
}

export function resolveCompetitorMatrixOverall(
  matrixProofStatus: CompetitorMatrixProofStatus,
): CompetitorFeatureGapMatrixOverall {
  return matrixProofStatus === "evidence_aligned_era17" ? "PASSED" : "FAILED";
}

export function buildCompetitorFeatureGapMatrixSummary(input: {
  certPassed: boolean;
  requiredCompetitorCount: number;
  commitSha?: string | null;
  runAt?: Date;
}): CompetitorFeatureGapMatrixSummary {
  const matrixProofStatus = resolveCompetitorMatrixProofStatus(input.certPassed);

  return {
    version: COMPETITOR_FEATURE_GAP_MATRIX_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveCompetitorMatrixOverall(matrixProofStatus),
    matrixProofStatus,
    certPassed: input.certPassed,
    requiredCompetitorCount: input.requiredCompetitorCount,
  };
}

export function formatCompetitorFeatureGapMatrixReportLines(
  summary: CompetitorFeatureGapMatrixSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `matrixProofStatus: ${summary.matrixProofStatus}`,
    `certPassed: ${summary.certPassed}`,
    `requiredCompetitorCount: ${summary.requiredCompetitorCount}`,
  ];
}
