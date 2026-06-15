/**
 * Pilot inventory messaging summary — Evolution Era 17 Cycle 30.
 */

import {
  PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
  PILOT_INVENTORY_MESSAGING_ERA17_SAFE_SALES_PHRASES,
  PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS,
  PILOT_INVENTORY_MESSAGING_ERA17_TRAINING_MODULES,
} from "@/lib/inventory/pilot-inventory-messaging-era17-policy";

export const PILOT_INVENTORY_MESSAGING_SUMMARY_VERSION =
  "era17-pilot-inventory-messaging-v1" as const;

export type PilotInventoryMessagingProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_cert_failed"
  | "messaging_ready_awaiting_training_attestation";

export type PilotInventoryMessagingSummary = {
  version: typeof PILOT_INVENTORY_MESSAGING_SUMMARY_VERSION;
  policyId: typeof PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID;
  runAt: string;
  certPassed: boolean;
  messagingProofStatus: PilotInventoryMessagingProofStatus;
  storefrontHookStatus: typeof PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS;
  trainingAttestationEmail: string | null;
  trainingModulesCount: number;
  safePhrasesCount: number;
  readinessDecision: "READY" | "NOT_READY";
};

export function resolvePilotInventoryMessagingProofStatus(input: {
  certPassed: boolean;
  trainingAttestationEmail?: string | null;
}): PilotInventoryMessagingProofStatus {
  if (!input.certPassed) return "proof_skipped_cert_failed";
  if (input.trainingAttestationEmail?.trim()) return "proof_passed";
  return "messaging_ready_awaiting_training_attestation";
}

export function buildPilotInventoryMessagingSummary(input: {
  certPassed: boolean;
  trainingAttestationEmail?: string | null;
  runAt?: Date;
}): PilotInventoryMessagingSummary {
  const messagingProofStatus = resolvePilotInventoryMessagingProofStatus(input);

  return {
    version: PILOT_INVENTORY_MESSAGING_SUMMARY_VERSION,
    policyId: PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
    runAt: (input.runAt ?? new Date()).toISOString(),
    certPassed: input.certPassed,
    messagingProofStatus,
    storefrontHookStatus: PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS,
    trainingAttestationEmail: input.trainingAttestationEmail?.trim() || null,
    trainingModulesCount: PILOT_INVENTORY_MESSAGING_ERA17_TRAINING_MODULES.length,
    safePhrasesCount: PILOT_INVENTORY_MESSAGING_ERA17_SAFE_SALES_PHRASES.length,
    readinessDecision: input.certPassed ? "READY" : "NOT_READY",
  };
}

export function formatPilotInventoryMessagingReportLines(
  summary: PilotInventoryMessagingSummary,
): string[] {
  const attestationLine = summary.trainingAttestationEmail
    ? `Training attestation: ${summary.trainingAttestationEmail}`
    : "[SKIPPED WITH REASON] Training attestation — PILOT_INVENTORY_MESSAGING_ATTESTATION_EMAIL not set";

  return [
    `Pilot inventory messaging (${summary.version}) — proof: ${summary.messagingProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Cert passed: ${summary.certPassed}`,
    `Storefront hook: ${summary.storefrontHookStatus}`,
    `Readiness: ${summary.readinessDecision}`,
    attestationLine,
  ];
}

export function parsePilotInventoryMessagingEnv(): Pick<
  Parameters<typeof buildPilotInventoryMessagingSummary>[0],
  "trainingAttestationEmail"
> {
  return {
    trainingAttestationEmail: process.env.PILOT_INVENTORY_MESSAGING_ATTESTATION_EMAIL ?? null,
  };
}
