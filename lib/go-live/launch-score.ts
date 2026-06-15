import type { GoLiveRiskLevel } from "@prisma/client";

import { hasCriticalBlocker, type LaunchBlocker } from "@/lib/go-live/blocker-engine";

export function riskFromInputs(input: {
  readinessScore: number;
  blockers: LaunchBlocker[];
  approvalsRequired: number;
  approvalsCount: number;
}): GoLiveRiskLevel {
  if (hasCriticalBlocker(input.blockers)) return "CRITICAL";
  if (input.readinessScore < 40) return "HIGH";
  const highRiskCount = input.blockers.filter((b) => b.severity === "HIGH_RISK").length;
  if (highRiskCount >= 2) return "HIGH";
  if (input.approvalsRequired > input.approvalsCount) return "HIGH";
  if (input.readinessScore < 70 || highRiskCount === 1) return "MEDIUM";
  return "LOW";
}

export function eligibleForApproval(input: {
  readinessScore: number;
  blockers: LaunchBlocker[];
}): boolean {
  if (hasCriticalBlocker(input.blockers)) return false;
  return input.readinessScore >= 80;
}
