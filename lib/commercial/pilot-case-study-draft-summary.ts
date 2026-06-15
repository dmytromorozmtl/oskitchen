/**
 * Pilot case study draft summary — Evolution Era 17 Workstream K Cycle 43.
 */

import {
  PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID,
  PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES,
} from "@/lib/commercial/pilot-case-study-draft-era17-policy";

export const PILOT_CASE_STUDY_DRAFT_SUMMARY_VERSION = PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID;

export type PilotCaseStudyDraftOverall = "PASSED" | "FAILED";

export type CaseStudyProofStatus =
  | "internal_draft_ready"
  | "proof_failed_cert";

export type PublishProofStatus =
  | "proof_ready_for_publish"
  | "proof_skipped_awaiting_customer_approval"
  | "proof_skipped_missing_pilot_metrics";

export type PilotMetricsBaselineArtifactRef = {
  overall?: string;
  baselineProofStatus?: string;
  capturedCount?: number;
  runAt?: string;
};

export type PilotCaseStudyDraftSummary = {
  version: typeof PILOT_CASE_STUDY_DRAFT_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PilotCaseStudyDraftOverall;
  caseStudyProofStatus: CaseStudyProofStatus;
  publishProofStatus: PublishProofStatus;
  pilotMetricsArtifactLoaded: boolean;
  pilotMetricsOverall: string | null;
  customerApprovalStatus: string | null;
  certPassed: boolean;
};

export function resolveCustomerApprovalStatus(): string | null {
  const raw = process.env.PILOT_CASE_STUDY_CUSTOMER_APPROVAL?.trim().toLowerCase();
  if (!raw) return null;
  return PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES.includes(
    raw as (typeof PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES)[number],
  )
    ? raw
    : raw;
}

export function resolveCaseStudyProofStatus(certPassed: boolean): CaseStudyProofStatus {
  return certPassed ? "internal_draft_ready" : "proof_failed_cert";
}

export function recomputePublishProofStatusFromSummary(
  summary: PilotCaseStudyDraftSummary,
): PublishProofStatus {
  return resolvePublishProofStatus({
    pilotMetricsArtifactLoaded: summary.pilotMetricsArtifactLoaded,
    pilotMetricsOverall: summary.pilotMetricsOverall,
    customerApprovalStatus: summary.customerApprovalStatus,
  });
}

export function resolvePublishProofStatus(input: {
  pilotMetricsArtifactLoaded: boolean;
  pilotMetricsOverall: string | null;
  customerApprovalStatus: string | null;
}): PublishProofStatus {
  const hasValidApproval =
    input.customerApprovalStatus !== null &&
    PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES.includes(
      input.customerApprovalStatus as (typeof PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES)[number],
    );

  if (!input.pilotMetricsArtifactLoaded || input.pilotMetricsOverall !== "PASSED") {
    return "proof_skipped_missing_pilot_metrics";
  }
  if (!hasValidApproval) {
    return "proof_skipped_awaiting_customer_approval";
  }
  return "proof_ready_for_publish";
}

export function resolvePilotCaseStudyDraftOverall(
  caseStudyProofStatus: CaseStudyProofStatus,
): PilotCaseStudyDraftOverall {
  if (caseStudyProofStatus === "proof_failed_cert") return "FAILED";
  return "PASSED";
}

export function buildPilotCaseStudyDraftSummary(input: {
  pilotMetrics: PilotMetricsBaselineArtifactRef | null;
  certPassed: boolean;
  customerApprovalStatus?: string | null;
  commitSha?: string | null;
  runAt?: Date;
}): PilotCaseStudyDraftSummary {
  const pilotMetricsArtifactLoaded = input.pilotMetrics !== null;
  const pilotMetricsOverall = input.pilotMetrics?.overall?.trim() || null;
  const customerApprovalStatus =
    input.customerApprovalStatus ?? resolveCustomerApprovalStatus();
  const caseStudyProofStatus = resolveCaseStudyProofStatus(input.certPassed);
  const publishProofStatus = resolvePublishProofStatus({
    pilotMetricsArtifactLoaded,
    pilotMetricsOverall,
    customerApprovalStatus,
  });

  return {
    version: PILOT_CASE_STUDY_DRAFT_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolvePilotCaseStudyDraftOverall(caseStudyProofStatus),
    caseStudyProofStatus,
    publishProofStatus,
    pilotMetricsArtifactLoaded,
    pilotMetricsOverall,
    customerApprovalStatus,
    certPassed: input.certPassed,
  };
}

export function formatPilotCaseStudyDraftReportLines(
  summary: PilotCaseStudyDraftSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `caseStudyProofStatus: ${summary.caseStudyProofStatus}`,
    `publishProofStatus: ${summary.publishProofStatus}`,
    `certPassed: ${summary.certPassed}`,
    `pilotMetricsOverall: ${summary.pilotMetricsOverall ?? "null"}`,
    `customerApprovalStatus: ${summary.customerApprovalStatus ?? "null"}`,
  ];
}
