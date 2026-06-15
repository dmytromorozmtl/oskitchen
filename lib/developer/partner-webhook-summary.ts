/**
 * Partner webhook docs smoke summary — Evolution Era 17 Cycle 14.
 */

import { PARTNER_WEBHOOK_ERA17_POLICY_ID } from "@/lib/developer/partner-webhook-era17-policy";
import {
  buildPartnerWebhookConfidenceSummary,
  evaluatePartnerWebhookReadiness,
} from "@/lib/developer/partner-webhook-pack";

export const PARTNER_WEBHOOK_SUMMARY_VERSION = "era17-partner-webhook-docs-v1" as const;

export type PartnerWebhookProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_missing_prerequisites"
  | "docs_ready_awaiting_partner_attestation";

export type PartnerWebhookSummary = {
  version: typeof PARTNER_WEBHOOK_SUMMARY_VERSION;
  policyId: typeof PARTNER_WEBHOOK_ERA17_POLICY_ID;
  runAt: string;
  partnerWebhookProofStatus: PartnerWebhookProofStatus;
  certPassed: boolean;
  partnerAttestationEmail: string | null;
  partnerAttestationNotes: string | null;
  readinessDecision: "READY" | "NOT_READY" | "CONDITIONAL";
  blockers: string[];
  warnings: string[];
};

export type PartnerWebhookSummaryInput = {
  certPassed: boolean;
  partnerAttestationEmail?: string | null;
  partnerAttestationNotes?: string | null;
  partnerDocExists?: boolean;
  contractMaturityDocExists?: boolean;
};

export function resolvePartnerWebhookProofStatus(
  input: PartnerWebhookSummaryInput,
): PartnerWebhookProofStatus {
  if (!input.certPassed) return "proof_failed";
  if (input.partnerAttestationEmail?.trim()) return "proof_passed";
  return "docs_ready_awaiting_partner_attestation";
}

export function buildPartnerWebhookSummary(
  input: PartnerWebhookSummaryInput,
  runAt: Date = new Date(),
): PartnerWebhookSummary {
  const readiness = evaluatePartnerWebhookReadiness({
    policyCertPass: input.certPassed,
    webhookSecurityCertPass: input.certPassed,
    partnerDocExists: input.partnerDocExists ?? true,
    contractMaturityDocExists: input.contractMaturityDocExists ?? true,
    livePartnerAttestation:
      input.partnerAttestationEmail != null
        ? Boolean(input.partnerAttestationEmail.trim())
        : undefined,
  });

  return {
    version: PARTNER_WEBHOOK_SUMMARY_VERSION,
    policyId: PARTNER_WEBHOOK_ERA17_POLICY_ID,
    runAt: runAt.toISOString(),
    partnerWebhookProofStatus: resolvePartnerWebhookProofStatus(input),
    certPassed: input.certPassed,
    partnerAttestationEmail: input.partnerAttestationEmail?.trim() || null,
    partnerAttestationNotes: input.partnerAttestationNotes?.trim() || null,
    readinessDecision: readiness.decision,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
  };
}

export function formatPartnerWebhookSummaryLines(summary: PartnerWebhookSummary): string[] {
  const attestationLine = summary.partnerAttestationEmail
    ? `Partner attestation: ${summary.partnerAttestationEmail}`
    : "[SKIPPED WITH REASON] Partner attestation — PARTNER_WEBHOOK_ATTESTATION_EMAIL not set";

  return [
    `Partner webhook docs (${summary.version}) — proof: ${summary.partnerWebhookProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Cert passed: ${summary.certPassed}`,
    `Readiness: ${summary.readinessDecision}`,
    attestationLine,
    ...(summary.warnings.length > 0 ? [`Warnings: ${summary.warnings.join("; ")}`] : []),
  ];
}

export function parsePartnerWebhookEnv(): Pick<
  PartnerWebhookSummaryInput,
  "partnerAttestationEmail" | "partnerAttestationNotes"
> {
  return {
    partnerAttestationEmail: process.env.PARTNER_WEBHOOK_ATTESTATION_EMAIL ?? null,
    partnerAttestationNotes: process.env.PARTNER_WEBHOOK_ATTESTATION_NOTES ?? null,
  };
}

export function buildPartnerWebhookConfidenceArtifact(
  input: PartnerWebhookSummaryInput,
): ReturnType<typeof buildPartnerWebhookConfidenceSummary> {
  return buildPartnerWebhookConfidenceSummary({
    policyCertPass: input.certPassed,
    webhookSecurityCertPass: input.certPassed,
    partnerDocExists: input.partnerDocExists ?? true,
    contractMaturityDocExists: input.contractMaturityDocExists ?? true,
    livePartnerAttestation:
      input.partnerAttestationEmail != null
        ? Boolean(input.partnerAttestationEmail.trim())
        : undefined,
  });
}
