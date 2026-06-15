/**
 * KDS Voice Alerts summary — Round 2 wiring audit (Era 180).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_VOICE_ALERTS_ERA180_CANONICAL_SUMMARY_ARTIFACT,
  KDS_VOICE_ALERTS_ERA180_CAPABILITIES,
  KDS_VOICE_ALERTS_ERA180_KINDS,
  KDS_VOICE_ALERTS_ERA180_POLICY_ID,
  KDS_VOICE_ALERTS_ERA180_SERVICE,
} from "@/lib/kitchen/kds-voice-alerts-era180-policy";
import { auditKdsVoiceAlertsSmokeWiring } from "@/lib/kitchen/kds-voice-alerts-smoke-summary";

export const KDS_VOICE_ALERTS_ERA180_SMOKE_SUMMARY_VERSION = KDS_VOICE_ALERTS_ERA180_POLICY_ID;

export type KdsVoiceAlertsSmokeEra180Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsVoiceAlertsSmokeEra180ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsVoiceAlertsSmokeEra180Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsVoiceAlertsSmokeEra180Summary = {
  version: typeof KDS_VOICE_ALERTS_ERA180_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsVoiceAlertsSmokeEra180Overall;
  proofStatus: KdsVoiceAlertsSmokeEra180ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  service: string;
  alertKinds: readonly string[];
  capabilities: readonly string[];
  steps: KdsVoiceAlertsSmokeEra180Step[];
  honestyNote: string;
};

export function auditKdsVoiceAlertsSmokeEra180Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsVoiceAlertsSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_VOICE_ALERTS_ERA180_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsVoiceAlertsSmokeEra180ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsVoiceAlertsSmokeEra180ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsVoiceAlertsSmokeEra180Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsVoiceAlertsSmokeEra180Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsVoiceAlertsSmokeEra180ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsVoiceAlertsSmokeEra180Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsVoiceAlertsSmokeEra180Step[] = [
    {
      id: "wiring_audit",
      label: "Message builder → speechSynthesis queue → KDS daily service triggers",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 180 KDS Voice Alerts cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era105)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era105 smoke PASSED"
          : liveSmokeOverall
            ? `era105 artifact overall: ${liveSmokeOverall}`
            : "No era105 artifact — run npm run smoke:kds-voice-alerts-era105",
    },
  ];

  return {
    version: KDS_VOICE_ALERTS_ERA180_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    service: KDS_VOICE_ALERTS_ERA180_SERVICE,
    alertKinds: KDS_VOICE_ALERTS_ERA180_KINDS,
    capabilities: KDS_VOICE_ALERTS_ERA180_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live TTS proof requires browser with speechSynthesis enabled on staging KDS.",
  };
}

export function formatKdsVoiceAlertsSmokeEra180ReportLines(
  summary: KdsVoiceAlertsSmokeEra180Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era105): ${summary.liveSmokeOverall ?? "not run"}`,
    `Service: ${summary.service}`,
    `Alert kinds: ${summary.alertKinds.join(", ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
