import type { JsonValue } from "@prisma/client/runtime/library";

import type { ValidationReport } from "@/lib/go-live/launch-validator";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

export type GoLiveAuditSnapshot = {
  readinessScore: number;
  riskLevel: ValidationReport["riskLevel"];
  canApprove: boolean;
  recommendedStatus: ValidationReport["recommendedStatus"];
  reasons: string[];
  requiredMissingKeys: string[];
  criticalBlockerKeys: string[];
  approvals: {
    captured: number;
    required: number;
    outstanding: number;
  };
  externalCertification: {
    required: boolean;
    targetProviders: number;
    certifiedProviders: number;
    missingProviders: number;
    missingLabels: string[];
    placeholderScopeLabels: string[];
  };
};

export function buildGoLiveAuditSnapshot(
  inputs: ReadinessInputs,
  report: ValidationReport,
): GoLiveAuditSnapshot {
  return {
    readinessScore: report.readiness.score,
    riskLevel: report.riskLevel,
    canApprove: report.canApprove,
    recommendedStatus: report.recommendedStatus,
    reasons: report.reasons,
    requiredMissingKeys: report.readiness.required.missing.map((signal) => signal.key),
    criticalBlockerKeys: report.blockers
      .filter((blocker) => blocker.severity === "CRITICAL")
      .map((blocker) => blocker.key),
    approvals: {
      captured: inputs.approvalsCount,
      required: inputs.approvalsRequired,
      outstanding: Math.max(0, inputs.approvalsRequired - inputs.approvalsCount),
    },
    externalCertification: {
      required: Boolean(inputs.externalCertificationRequired),
      targetProviders: inputs.externalTargetProviderCount ?? 0,
      certifiedProviders: inputs.externalCertifiedProviderCount ?? 0,
      missingProviders: inputs.externalMissingProviderCount ?? 0,
      missingLabels: inputs.externalMissingProviderLabels ?? [],
      placeholderScopeLabels: inputs.placeholderIntegrationScopeLabels ?? [],
    },
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

export function parseGoLiveAuditSnapshot(value: JsonValue | null | undefined): GoLiveAuditSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as Record<string, unknown>;
  const approvals = candidate.approvals;
  const externalCertification = candidate.externalCertification;

  if (
    typeof candidate.readinessScore !== "number" ||
    typeof candidate.riskLevel !== "string" ||
    typeof candidate.canApprove !== "boolean" ||
    typeof candidate.recommendedStatus !== "string" ||
    !Array.isArray(candidate.reasons) ||
    !isStringArray(candidate.requiredMissingKeys) ||
    !isStringArray(candidate.criticalBlockerKeys) ||
    !approvals ||
    typeof approvals !== "object" ||
    Array.isArray(approvals) ||
    !externalCertification ||
    typeof externalCertification !== "object" ||
    Array.isArray(externalCertification)
  ) {
    return null;
  }

  const approvalData = approvals as Record<string, unknown>;
  const certificationData = externalCertification as Record<string, unknown>;

  if (
    typeof approvalData.captured !== "number" ||
    typeof approvalData.required !== "number" ||
    typeof approvalData.outstanding !== "number" ||
    typeof certificationData.required !== "boolean" ||
    typeof certificationData.targetProviders !== "number" ||
    typeof certificationData.certifiedProviders !== "number" ||
    typeof certificationData.missingProviders !== "number" ||
    !isStringArray(certificationData.missingLabels) ||
    !isStringArray(certificationData.placeholderScopeLabels)
  ) {
    return null;
  }

  return {
    readinessScore: candidate.readinessScore,
    riskLevel: candidate.riskLevel as ValidationReport["riskLevel"],
    canApprove: candidate.canApprove,
    recommendedStatus: candidate.recommendedStatus as ValidationReport["recommendedStatus"],
    reasons: candidate.reasons.filter((reason): reason is string => typeof reason === "string"),
    requiredMissingKeys: candidate.requiredMissingKeys,
    criticalBlockerKeys: candidate.criticalBlockerKeys,
    approvals: {
      captured: approvalData.captured,
      required: approvalData.required,
      outstanding: approvalData.outstanding,
    },
    externalCertification: {
      required: certificationData.required,
      targetProviders: certificationData.targetProviders,
      certifiedProviders: certificationData.certifiedProviders,
      missingProviders: certificationData.missingProviders,
      missingLabels: certificationData.missingLabels,
      placeholderScopeLabels: certificationData.placeholderScopeLabels,
    },
  };
}
