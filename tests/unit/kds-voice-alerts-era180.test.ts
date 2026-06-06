import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_VOICE_ALERTS_ERA105_CANONICAL_POLICY_ID,
  KDS_VOICE_ALERTS_ERA105_POLICY_ID,
} from "@/lib/kitchen/kds-voice-alerts-era105-policy";
import {
  KDS_VOICE_ALERTS_ERA180_CANONICAL_POLICY_ID,
  KDS_VOICE_ALERTS_ERA180_CAPABILITIES,
  KDS_VOICE_ALERTS_ERA180_KINDS,
  KDS_VOICE_ALERTS_ERA180_POLICY_ID,
  KDS_VOICE_ALERTS_ERA180_SERVICE,
  KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT,
  KDS_VOICE_ALERTS_ERA180_WIRING_PATHS,
} from "@/lib/kitchen/kds-voice-alerts-era180-policy";
import {
  auditKdsVoiceAlertsSmokeEra180Wiring,
  buildKdsVoiceAlertsSmokeEra180Summary,
  resolveKdsVoiceAlertsSmokeEra180ProofStatus,
} from "@/lib/kitchen/kds-voice-alerts-era180-smoke-summary";
import {
  KDS_VOICE_ALERTS_POLICY_ID,
  KDS_VOICE_ALERTS_SERVICE,
} from "@/lib/kitchen/kds-voice-alerts-policy";

const ROOT = process.cwd();

describe("kds voice alerts era180", () => {
  it("locks era180 policy and artifact path", () => {
    expect(KDS_VOICE_ALERTS_ERA180_POLICY_ID).toBe("era180-kds-voice-alerts-v1");
    expect(KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-voice-alerts-era180-smoke-summary.json",
    );
    expect(KDS_VOICE_ALERTS_ERA180_SERVICE).toBe("services/kitchen/voice-alerts.ts");
    expect(KDS_VOICE_ALERTS_ERA180_KINDS).toHaveLength(5);
    expect(KDS_VOICE_ALERTS_ERA180_WIRING_PATHS).toHaveLength(3);
    expect(KDS_VOICE_ALERTS_ERA180_CAPABILITIES).toHaveLength(5);
  });

  it("aligns era180 with canonical KDS Voice Alerts policy", () => {
    expect(KDS_VOICE_ALERTS_ERA180_CANONICAL_POLICY_ID).toBe(KDS_VOICE_ALERTS_ERA105_POLICY_ID);
    expect(KDS_VOICE_ALERTS_ERA105_CANONICAL_POLICY_ID).toBe(KDS_VOICE_ALERTS_POLICY_ID);
    expect(KDS_VOICE_ALERTS_ERA180_SERVICE).toBe(KDS_VOICE_ALERTS_SERVICE);
  });

  it("audits in-repo KDS Voice Alerts Round 2 wiring", () => {
    const audit = auditKdsVoiceAlertsSmokeEra180Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_VOICE_ALERTS_ERA180_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes TTS service and KDS daily service triggers", () => {
    const service = readFileSync(join(ROOT, KDS_VOICE_ALERTS_ERA180_SERVICE), "utf8");
    expect(service).toContain("buildKdsVoiceAlertMessage");
    expect(service).toContain("SpeechSynthesisUtterance");
    expect(service).toContain("announceKdsVoiceAlert");
    expect(service).toContain("speechSynthesis");

    const kdsService = readFileSync(
      join(ROOT, "components/kitchen/kds-daily-service.tsx"),
      "utf8",
    );
    expect(kdsService).toContain("announceKdsVoiceAlert");
    expect(kdsService).toContain('"rush_building"');
    expect(kdsService).toContain('"allergen"');
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsVoiceAlertsSmokeEra180ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsVoiceAlertsSmokeEra180ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsVoiceAlertsSmokeEra180Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.alertKinds).toHaveLength(5);
    expect(summary.capabilities).toContain("tts_messages");
    expect(summary.capabilities).toContain("speech_synthesis");
  });
});
