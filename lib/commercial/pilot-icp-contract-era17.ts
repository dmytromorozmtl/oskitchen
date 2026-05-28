/**
 * Pilot ICP qualification + contract checklist — Evolution Era 17 Cycle 15.
 */

import {
  PILOT_ICP_CONTRACT_ERA17_DEFAULT_DURATION_DAYS,
  PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS,
  PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA,
  PILOT_ICP_CONTRACT_ERA17_SUCCESS_METRICS,
} from "@/lib/commercial/pilot-icp-contract-era17-policy";

export type PilotIcpQualificationInput = {
  singleOrSmallMultiUnit?: boolean;
  ownerOperatorEngaged?: boolean;
  needsCoreKitchenOrderPath?: boolean;
  acceptsQualifiedBetaLabels?: boolean;
  requiresProductionSso?: boolean;
  requiresSoc2OrScim?: boolean;
  requiresUnifiedInventory?: boolean;
  requiresUnifiedRewards?: boolean;
  requiresRushHourKdsSla?: boolean;
  requiresMarketplaceLiveOps?: boolean;
  requiresOfflinePosOrHardwareParity?: boolean;
  requiresPublicApiSla?: boolean;
  refusesQualifiedWording?: boolean;
};

export type PilotIcpQualificationResult = {
  qualified: boolean;
  disqualifiers: string[];
  missingCriteria: string[];
};

export function listPilotIcpDisqualifiers(input: PilotIcpQualificationInput): string[] {
  const hits: string[] = [];
  if (input.requiresProductionSso) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[0]);
  }
  if (input.requiresSoc2OrScim) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[1]);
  }
  if (input.requiresUnifiedInventory || input.requiresUnifiedRewards) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[2]);
  }
  if (input.requiresRushHourKdsSla || input.requiresMarketplaceLiveOps) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[3]);
  }
  if (input.requiresOfflinePosOrHardwareParity) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[4]);
  }
  if (input.requiresPublicApiSla) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[5]);
  }
  if (input.refusesQualifiedWording) {
    hits.push(PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS[6]);
  }
  return hits;
}

export function listMissingPilotIcpCriteria(input: PilotIcpQualificationInput): string[] {
  const missing: string[] = [];
  if (!input.singleOrSmallMultiUnit) {
    missing.push(PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA[0]);
  }
  if (!input.ownerOperatorEngaged) {
    missing.push(PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA[1]);
  }
  if (!input.needsCoreKitchenOrderPath) {
    missing.push(PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA[2]);
  }
  if (!input.acceptsQualifiedBetaLabels) {
    missing.push(PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA[3]);
  }
  return missing;
}

export function evaluatePilotIcpQualification(
  input: PilotIcpQualificationInput,
): PilotIcpQualificationResult {
  const disqualifiers = listPilotIcpDisqualifiers(input);
  const missingCriteria = listMissingPilotIcpCriteria(input);
  return {
    qualified: disqualifiers.length === 0 && missingCriteria.length === 0,
    disqualifiers,
    missingCriteria,
  };
}

export function formatPilotIcpQualificationReport(result: PilotIcpQualificationResult): string {
  if (result.qualified) {
    return "Pilot ICP: QUALIFIED — prospect matches Era 17 paid pilot profile.";
  }
  const lines = ["Pilot ICP: NOT QUALIFIED — do not proceed to paid pilot without remediation."];
  if (result.disqualifiers.length > 0) {
    lines.push(`Disqualifiers: ${result.disqualifiers.join("; ")}`);
  }
  if (result.missingCriteria.length > 0) {
    lines.push(`Missing criteria: ${result.missingCriteria.join("; ")}`);
  }
  return lines.join("\n");
}

export const PILOT_ICP_CONTRACT_DEFAULT_DURATION_DAYS =
  PILOT_ICP_CONTRACT_ERA17_DEFAULT_DURATION_DAYS;

export const PILOT_ICP_CONTRACT_SUCCESS_METRICS = PILOT_ICP_CONTRACT_ERA17_SUCCESS_METRICS;

export type PilotContractReviewInput = {
  icpQualified: boolean;
  forbiddenClaimsInContract: boolean;
  supportBoundariesAcknowledged: boolean;
  rollbackPlanAcknowledged: boolean;
  successMetricsDefined: boolean;
  durationDays?: number;
};

export type PilotContractReviewResult = {
  readyForLegalReview: boolean;
  blockers: string[];
};

export function evaluatePilotContractReadiness(
  input: PilotContractReviewInput,
): PilotContractReviewResult {
  const blockers: string[] = [];
  if (!input.icpQualified) blockers.push("Prospect fails Era 17 pilot ICP qualification");
  if (input.forbiddenClaimsInContract) {
    blockers.push("Contract draft contains forbidden pilot claims");
  }
  if (!input.supportBoundariesAcknowledged) {
    blockers.push("Support boundaries not acknowledged in contract appendix");
  }
  if (!input.rollbackPlanAcknowledged) {
    blockers.push("Rollback plan not referenced in contract");
  }
  if (!input.successMetricsDefined) {
    blockers.push("Success metrics not defined in contract SOW");
  }
  if (
    input.durationDays !== undefined &&
    (input.durationDays < 30 || input.durationDays > 180)
  ) {
    blockers.push("Pilot duration outside 30–180 day qualified window");
  }
  return {
    readyForLegalReview: blockers.length === 0,
    blockers,
  };
}
