import type { BusinessType, GoLiveLaunchStatus } from "@prisma/client";

import { detectBlockers, hasCriticalBlocker, type LaunchBlocker } from "@/lib/go-live/blocker-engine";
import { calculateReadiness, type ReadinessBreakdown, type ReadinessInputs } from "@/lib/go-live/readiness-engine";
import { eligibleForApproval, riskFromInputs } from "@/lib/go-live/launch-score";

export type ValidationReport = {
  readiness: ReadinessBreakdown;
  blockers: LaunchBlocker[];
  canApprove: boolean;
  recommendedStatus: GoLiveLaunchStatus;
  riskLevel: ReturnType<typeof riskFromInputs>;
  reasons: string[];
};

export function validateLaunch(
  inputs: ReadinessInputs,
  businessType: BusinessType | null,
  currentStatus: GoLiveLaunchStatus,
): ValidationReport {
  const readiness = calculateReadiness(inputs, businessType);
  const blockers = detectBlockers(inputs);
  const reasons: string[] = [];

  if (hasCriticalBlocker(blockers)) {
    reasons.push("At least one critical blocker is open.");
  }
  const hasRequiredMissing = readiness.required.missing.length > 0;
  if (hasRequiredMissing) {
    reasons.push(`${readiness.required.missing.length} required readiness check(s) failing.`);
  }
  if (inputs.approvalsRequired > inputs.approvalsCount) {
    reasons.push(
      `${inputs.approvalsRequired - inputs.approvalsCount} approval(s) outstanding.`,
    );
  }

  const canApprove = eligibleForApproval({ readinessScore: readiness.score, blockers }) && !hasRequiredMissing;

  let recommendedStatus: GoLiveLaunchStatus;
  if (currentStatus === "LIVE" || currentStatus === "POST_LAUNCH_MONITORING" || currentStatus === "COMPLETED" || currentStatus === "ROLLBACK_MODE") {
    recommendedStatus = currentStatus;
  } else if (hasCriticalBlocker(blockers)) {
    recommendedStatus = "BLOCKED";
  } else if (canApprove && inputs.approvalsRequired <= inputs.approvalsCount) {
    recommendedStatus = "APPROVED";
  } else if (readiness.score >= 80 && !hasRequiredMissing) {
    recommendedStatus = "READY";
  } else if (readiness.score >= 30) {
    recommendedStatus = "IN_PROGRESS";
  } else if (readiness.score > 0) {
    recommendedStatus = "NEEDS_REVIEW";
  } else {
    recommendedStatus = currentStatus === "NOT_STARTED" ? "NOT_STARTED" : "IN_PROGRESS";
  }

  return {
    readiness,
    blockers,
    canApprove: canApprove && inputs.approvalsRequired <= inputs.approvalsCount,
    recommendedStatus,
    riskLevel: riskFromInputs({
      readinessScore: readiness.score,
      blockers,
      approvalsCount: inputs.approvalsCount,
      approvalsRequired: inputs.approvalsRequired,
    }),
    reasons,
  };
}
