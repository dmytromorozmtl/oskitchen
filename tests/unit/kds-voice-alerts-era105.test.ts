import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_VOICE_ALERTS_ERA105_CANONICAL_POLICY_ID,
  KDS_VOICE_ALERTS_ERA105_KINDS,
  KDS_VOICE_ALERTS_ERA105_POLICY_ID,
  KDS_VOICE_ALERTS_ERA105_SERVICE,
  KDS_VOICE_ALERTS_ERA105_SUMMARY_ARTIFACT,
  KDS_VOICE_ALERTS_ERA105_WIRING_PATHS,
} from "@/lib/kitchen/kds-voice-alerts-era105-policy";
import {
  auditKdsVoiceAlertsSmokeWiring,
  buildKdsVoiceAlertsSmokeEra105Summary,
  resolveKdsVoiceAlertsSmokeEra105ProofStatus,
} from "@/lib/kitchen/kds-voice-alerts-smoke-summary";
import {
  KDS_VOICE_ALERTS_POLICY_ID,
  KDS_VOICE_ALERTS_SERVICE,
} from "@/lib/kitchen/kds-voice-alerts-policy";

const ROOT = process.cwd();

describe("kds voice alerts era105", () => {
  it("locks era105 policy and artifact path", () => {
    expect(KDS_VOICE_ALERTS_ERA105_POLICY_ID).toBe("era105-kds-voice-alerts-v1");
    expect(KDS_VOICE_ALERTS_ERA105_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-voice-alerts-smoke-summary.json",
    );
    expect(KDS_VOICE_ALERTS_ERA105_SERVICE).toBe("services/kitchen/voice-alerts.ts");
    expect(KDS_VOICE_ALERTS_ERA105_KINDS).toHaveLength(5);
  });

  it("aligns era105 with canonical voice alerts policy", () => {
    expect(KDS_VOICE_ALERTS_ERA105_CANONICAL_POLICY_ID).toBe(KDS_VOICE_ALERTS_POLICY_ID);
    expect(KDS_VOICE_ALERTS_ERA105_SERVICE).toBe(KDS_VOICE_ALERTS_SERVICE);
  });

  it("audits in-repo KDS Voice Alerts wiring", () => {
    const audit = auditKdsVoiceAlertsSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_VOICE_ALERTS_ERA105_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes TTS service and KDS daily service triggers", () => {
    const service = readFileSync(join(ROOT, KDS_VOICE_ALERTS_ERA105_SERVICE), "utf8");
    expect(service).toContain("buildKdsVoiceAlertMessage");
    expect(service).toContain("SpeechSynthesisUtterance");
    expect(service).toContain("announceKdsVoiceAlert");

    const kdsService = readFileSync(
      join(ROOT, "components/kitchen/kds-daily-service.tsx"),
      "utf8",
    );
    expect(kdsService).toContain("announceKdsVoiceAlert");
    expect(kdsService).toContain('"rush_building"');
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsVoiceAlertsSmokeEra105ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsVoiceAlertsSmokeEra105ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsVoiceAlertsSmokeEra105Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.alertKinds).toHaveLength(5);
  });
});
