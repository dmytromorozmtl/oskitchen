/**
 * Enterprise SSO pilot_ready gate summary — evaluates Cycle 2 IdP staging artifact.
 */

import {
  ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

export const ENTERPRISE_SSO_PILOT_READY_SUMMARY_VERSION =
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID;

export type EnterpriseSsoPilotReadyGateOutcome =
  | "qualified_pilot_ready"
  | "pilot_foundation_awaiting_proof"
  | "pilot_foundation_proof_failed"
  | "pilot_foundation_artifact_missing";

export type EnterpriseSsoDeliveryStatus = "pilot_foundation" | "pilot_ready";

export type EnterpriseSsoPilotReadyGateSummary = {
  version: typeof ENTERPRISE_SSO_PILOT_READY_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  gateProofStatus: typeof ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS;
  gateOutcome: EnterpriseSsoPilotReadyGateOutcome;
  ssoDeliveryStatus: EnterpriseSsoDeliveryStatus;
  defaultSsoDeliveryStatus: typeof ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS;
  qualifiedSsoDeliveryStatus: typeof ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS;
  inputArtifactPath: string;
  inputLoginProofStatus: string | null;
  inputOverall: string | null;
  promotionAllowed: boolean;
  reason: string;
};

export type EnterpriseSsoPilotReadyGateInputArtifact = {
  overall?: string;
  loginProofStatus?: string;
  idpStagingPrerequisitesMet?: boolean;
  wiringCertPassed?: boolean;
};

export function evaluateEnterpriseSsoPilotReadyGate(
  artifact: EnterpriseSsoPilotReadyGateInputArtifact | null,
): {
  gateOutcome: EnterpriseSsoPilotReadyGateOutcome;
  ssoDeliveryStatus: EnterpriseSsoDeliveryStatus;
  promotionAllowed: boolean;
  reason: string;
} {
  if (!artifact) {
    return {
      gateOutcome: "pilot_foundation_artifact_missing",
      ssoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
      promotionAllowed: false,
      reason:
        "artifacts/enterprise-sso-idp-staging-smoke-summary.json missing — run smoke:enterprise-sso-idp-staging first",
    };
  }

  if (artifact.loginProofStatus === "proof_failed" || artifact.overall === "FAILED") {
    return {
      gateOutcome: "pilot_foundation_proof_failed",
      ssoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
      promotionAllowed: false,
      reason: `Cycle 2 proof failed — loginProofStatus=${artifact.loginProofStatus ?? "unknown"} overall=${artifact.overall ?? "unknown"}`,
    };
  }

  const qualified =
    artifact.loginProofStatus === "proof_passed" &&
    artifact.overall === "PASSED" &&
    artifact.idpStagingPrerequisitesMet !== false;

  if (qualified) {
    return {
      gateOutcome: "qualified_pilot_ready",
      ssoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS,
      promotionAllowed: true,
      reason:
        "Cycle 2 IdP staging artifact validated — qualified pilot_ready delivery allowed for SSO pilot scope",
    };
  }

  return {
    gateOutcome: "pilot_foundation_awaiting_proof",
    ssoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
    promotionAllowed: false,
    reason: `SKIPPED WITH REASON — loginProofStatus=${artifact.loginProofStatus ?? "unknown"} overall=${artifact.overall ?? "unknown"}; configure staging IdP secrets and complete operator proof`,
  };
}

export function buildEnterpriseSsoPilotReadyGateSummary(input: {
  idpStagingArtifact: EnterpriseSsoPilotReadyGateInputArtifact | null;
  commitSha?: string | null;
  runAt?: Date;
  inputArtifactPath?: string;
}): EnterpriseSsoPilotReadyGateSummary {
  const evaluation = evaluateEnterpriseSsoPilotReadyGate(input.idpStagingArtifact);

  return {
    version: ENTERPRISE_SSO_PILOT_READY_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    gateProofStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS,
    gateOutcome: evaluation.gateOutcome,
    ssoDeliveryStatus: evaluation.ssoDeliveryStatus,
    defaultSsoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
    qualifiedSsoDeliveryStatus: ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS,
    inputArtifactPath:
      input.inputArtifactPath ?? "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
    inputLoginProofStatus: input.idpStagingArtifact?.loginProofStatus ?? null,
    inputOverall: input.idpStagingArtifact?.overall ?? null,
    promotionAllowed: evaluation.promotionAllowed,
    reason: evaluation.reason,
  };
}

export function formatEnterpriseSsoPilotReadyGateReportLines(
  summary: EnterpriseSsoPilotReadyGateSummary,
): string[] {
  return [
    `Enterprise SSO pilot_ready gate (${summary.version})`,
    `Run at: ${summary.runAt}`,
    `gateOutcome: ${summary.gateOutcome}`,
    `ssoDeliveryStatus: ${summary.ssoDeliveryStatus}`,
    `promotionAllowed: ${summary.promotionAllowed ? "yes" : "no"}`,
    `input: ${summary.inputArtifactPath} (loginProofStatus=${summary.inputLoginProofStatus ?? "n/a"} overall=${summary.inputOverall ?? "n/a"})`,
    `reason: ${summary.reason}`,
  ];
}
