/**
 * Investor narrative one-pager summary — Evolution Era 17 Workstream K Cycle 41.
 */

import { INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID } from "@/lib/commercial/investor-narrative-onepager-era17-policy";

export const INVESTOR_NARRATIVE_ONEPAGER_SUMMARY_VERSION =
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID;

export type InvestorNarrativeOnepagerOverall = "PASSED" | "FAILED" | "SKIPPED";

export type InvestorNarrativeProofStatus =
  | "proof_ready_with_metrics"
  | "proof_skipped_missing_pilot_metrics"
  | "proof_failed_cert";

export type PilotMetricsBaselineArtifactRef = {
  overall?: string;
  baselineProofStatus?: string;
  capturedCount?: number;
  runAt?: string;
};

export type InvestorNarrativeOnepagerSummary = {
  version: typeof INVESTOR_NARRATIVE_ONEPAGER_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: InvestorNarrativeOnepagerOverall;
  narrativeProofStatus: InvestorNarrativeProofStatus;
  pilotMetricsArtifactLoaded: boolean;
  pilotMetricsOverall: string | null;
  pilotMetricsBaselineProofStatus: string | null;
  pilotMetricsCapturedCount: number | null;
  certPassed: boolean;
};

export function recomputeInvestorNarrativeProofStatusFromSummary(
  summary: InvestorNarrativeOnepagerSummary,
): InvestorNarrativeProofStatus {
  return resolveInvestorNarrativeProofStatus({
    pilotMetricsArtifactLoaded: summary.pilotMetricsArtifactLoaded,
    pilotMetricsOverall: summary.pilotMetricsOverall,
    certPassed: summary.certPassed,
  });
}

export function resolveInvestorNarrativeProofStatus(input: {
  pilotMetricsArtifactLoaded: boolean;
  pilotMetricsOverall: string | null;
  certPassed: boolean;
}): InvestorNarrativeProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.pilotMetricsArtifactLoaded || input.pilotMetricsOverall !== "PASSED") {
    return "proof_skipped_missing_pilot_metrics";
  }
  return "proof_ready_with_metrics";
}

export function resolveInvestorNarrativeOverall(
  narrativeProofStatus: InvestorNarrativeProofStatus,
): InvestorNarrativeOnepagerOverall {
  if (narrativeProofStatus === "proof_failed_cert") return "FAILED";
  if (narrativeProofStatus === "proof_ready_with_metrics") return "PASSED";
  return "SKIPPED";
}

export function buildInvestorNarrativeOnepagerSummary(input: {
  pilotMetrics: PilotMetricsBaselineArtifactRef | null;
  certPassed: boolean;
  commitSha?: string | null;
  runAt?: Date;
}): InvestorNarrativeOnepagerSummary {
  const pilotMetricsArtifactLoaded = input.pilotMetrics !== null;
  const pilotMetricsOverall = input.pilotMetrics?.overall?.trim() || null;
  const narrativeProofStatus = resolveInvestorNarrativeProofStatus({
    pilotMetricsArtifactLoaded,
    pilotMetricsOverall,
    certPassed: input.certPassed,
  });

  return {
    version: INVESTOR_NARRATIVE_ONEPAGER_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveInvestorNarrativeOverall(narrativeProofStatus),
    narrativeProofStatus,
    pilotMetricsArtifactLoaded,
    pilotMetricsOverall,
    pilotMetricsBaselineProofStatus: input.pilotMetrics?.baselineProofStatus ?? null,
    pilotMetricsCapturedCount:
      typeof input.pilotMetrics?.capturedCount === "number"
        ? input.pilotMetrics.capturedCount
        : null,
    certPassed: input.certPassed,
  };
}

export function formatInvestorNarrativeOnepagerReportLines(
  summary: InvestorNarrativeOnepagerSummary,
): string[] {
  return [
    `Investor narrative one-pager (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Commit SHA: ${summary.commitSha ?? "not recorded"}`,
    `Narrative proof status: ${summary.narrativeProofStatus}`,
    `Pilot metrics artifact loaded: ${summary.pilotMetricsArtifactLoaded ? "yes" : "no"}`,
    `Pilot metrics overall: ${summary.pilotMetricsOverall ?? "not recorded"}`,
    `Pilot metrics captured: ${summary.pilotMetricsCapturedCount ?? "n/a"}/6`,
    `Cert chain: ${summary.certPassed ? "PASSED" : "FAILED"}`,
  ];
}
