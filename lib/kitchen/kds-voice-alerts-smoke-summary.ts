/**
 * KDS Voice Alerts smoke summary — wiring audit (Era 105).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_VOICE_ALERTS_ERA105_KINDS,
  KDS_VOICE_ALERTS_ERA105_POLICY_ID,
  KDS_VOICE_ALERTS_ERA105_SERVICE,
  KDS_VOICE_ALERTS_ERA105_WIRING_PATHS,
} from "@/lib/kitchen/kds-voice-alerts-era105-policy";

export const KDS_VOICE_ALERTS_SMOKE_SUMMARY_VERSION = KDS_VOICE_ALERTS_ERA105_POLICY_ID;

export type KdsVoiceAlertsSmokeEra105Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsVoiceAlertsSmokeEra105ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsVoiceAlertsSmokeEra105Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsVoiceAlertsSmokeEra105Summary = {
  version: typeof KDS_VOICE_ALERTS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsVoiceAlertsSmokeEra105Overall;
  proofStatus: KdsVoiceAlertsSmokeEra105ProofStatus;
  wiringCertPassed: boolean;
  service: string;
  alertKinds: readonly string[];
  steps: KdsVoiceAlertsSmokeEra105Step[];
  honestyNote: string;
};

export function auditKdsVoiceAlertsSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of KDS_VOICE_ALERTS_ERA105_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === KDS_VOICE_ALERTS_ERA105_SERVICE) {
      if (!src.includes("buildKdsVoiceAlertMessage")) {
        failures.push("voice-alerts.ts missing buildKdsVoiceAlertMessage");
      }
      if (!src.includes("speakKdsVoiceAlert")) {
        failures.push("voice-alerts.ts missing speakKdsVoiceAlert");
      }
      if (!src.includes("announceKdsVoiceAlert")) {
        failures.push("voice-alerts.ts missing announceKdsVoiceAlert");
      }
      if (!src.includes("speechSynthesis")) {
        failures.push("voice-alerts.ts missing speechSynthesis TTS");
      }
      if (!src.includes("cancelKdsVoiceAlerts")) {
        failures.push("voice-alerts.ts missing cancelKdsVoiceAlerts");
      }
    }

    if (rel === "lib/kitchen/kds-voice-alerts-policy.ts") {
      if (!src.includes("KDS_VOICE_ALERTS_POLICY_ID")) {
        failures.push("kds-voice-alerts-policy.ts missing policy id");
      }
      if (!src.includes("KDS_VOICE_ALERT_DEFAULT_RATE")) {
        failures.push("kds-voice-alerts-policy.ts missing default rate");
      }
    }

    if (rel === "components/kitchen/kds-daily-service.tsx") {
      if (!src.includes("announceKdsVoiceAlert")) {
        failures.push("kds-daily-service.tsx missing announceKdsVoiceAlert");
      }
      if (!src.includes('"new_order"')) {
        failures.push("kds-daily-service.tsx missing new_order voice trigger");
      }
      if (!src.includes('"overdue"')) {
        failures.push("kds-daily-service.tsx missing overdue voice trigger");
      }
      if (!src.includes('"rush_peak"')) {
        failures.push("kds-daily-service.tsx missing rush_peak voice trigger");
      }
      if (!src.includes('"allergen"')) {
        failures.push("kds-daily-service.tsx missing allergen voice trigger");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveKdsVoiceAlertsSmokeEra105ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsVoiceAlertsSmokeEra105ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsVoiceAlertsSmokeEra105Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): KdsVoiceAlertsSmokeEra105Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveKdsVoiceAlertsSmokeEra105ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsVoiceAlertsSmokeEra105Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsVoiceAlertsSmokeEra105Step[] = [
    {
      id: "wiring_audit",
      label: "Message builder → speechSynthesis queue → KDS daily service triggers",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 105 KDS Voice Alerts cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: KDS_VOICE_ALERTS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    service: KDS_VOICE_ALERTS_ERA105_SERVICE,
    alertKinds: KDS_VOICE_ALERTS_ERA105_KINDS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live TTS proof requires browser with speechSynthesis enabled on staging KDS.",
  };
}

export function formatKdsVoiceAlertsSmokeEra105ReportLines(
  summary: KdsVoiceAlertsSmokeEra105Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Service: ${summary.service}`,
    `Alert kinds: ${summary.alertKinds.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
