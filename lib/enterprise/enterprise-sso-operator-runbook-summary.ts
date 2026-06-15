/**
 * Enterprise SSO operator runbook summary — Evolution Era 17 Workstream A Cycle 4.
 */

import {
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-operator-runbook-era17-policy";

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_SUMMARY_VERSION =
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID;

export type EnterpriseSsoOperatorRunbookOverall = "PASSED" | "FAILED";

export type EnterpriseSsoOperatorProofStatus =
  | "operator_runbook_ready"
  | "proof_failed_cert";

export type EnterpriseSsoOperatorRunbookSummary = {
  version: typeof ENTERPRISE_SSO_OPERATOR_RUNBOOK_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: EnterpriseSsoOperatorRunbookOverall;
  ssoOperatorProofStatus: EnterpriseSsoOperatorProofStatus;
  ssoDeliveryStatus: typeof ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS;
  certPassed: boolean;
};

export function resolveEnterpriseSsoOperatorProofStatus(
  certPassed: boolean,
): EnterpriseSsoOperatorProofStatus {
  return certPassed ? "operator_runbook_ready" : "proof_failed_cert";
}

export function buildEnterpriseSsoOperatorRunbookSummary(input: {
  certPassed: boolean;
  commitSha?: string | null;
  runAt?: Date;
}): EnterpriseSsoOperatorRunbookSummary {
  const ssoOperatorProofStatus = resolveEnterpriseSsoOperatorProofStatus(input.certPassed);

  return {
    version: ENTERPRISE_SSO_OPERATOR_RUNBOOK_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: ssoOperatorProofStatus === "proof_failed_cert" ? "FAILED" : "PASSED",
    ssoOperatorProofStatus,
    ssoDeliveryStatus: ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS,
    certPassed: input.certPassed,
  };
}

export function formatEnterpriseSsoOperatorRunbookReportLines(
  summary: EnterpriseSsoOperatorRunbookSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `ssoOperatorProofStatus: ${summary.ssoOperatorProofStatus}`,
    `ssoDeliveryStatus: ${summary.ssoDeliveryStatus}`,
    `certPassed: ${summary.certPassed}`,
  ];
}
