/**
 * Era 180 — KDS Voice Alerts wiring cert (Phase 3 Round 2 #32).
 *
 * Full path: message builder → speechSynthesis queue → KDS daily service triggers.
 */

import {
  KDS_VOICE_ALERTS_ERA105_KINDS,
  KDS_VOICE_ALERTS_ERA105_OPS_DOC,
  KDS_VOICE_ALERTS_ERA105_POLICY_ID,
  KDS_VOICE_ALERTS_ERA105_SERVICE,
  KDS_VOICE_ALERTS_ERA105_SUMMARY_ARTIFACT,
  KDS_VOICE_ALERTS_ERA105_WIRING_PATHS,
} from "@/lib/kitchen/kds-voice-alerts-era105-policy";

export const KDS_VOICE_ALERTS_ERA180_POLICY_ID = "era180-kds-voice-alerts-v1" as const;

export const KDS_VOICE_ALERTS_ERA180_SUMMARY_ARTIFACT =
  "artifacts/kds-voice-alerts-era180-smoke-summary.json" as const;

export const KDS_VOICE_ALERTS_ERA180_NPM_SCRIPT = "smoke:kds-voice-alerts-era180" as const;

export const KDS_VOICE_ALERTS_ERA180_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-voice-alerts-era180.ts" as const;

export const KDS_VOICE_ALERTS_ERA180_OPS_DOC = "docs/kds-voice-alerts-era180-setup.md" as const;

export const KDS_VOICE_ALERTS_ERA180_CANONICAL_OPS_DOC = KDS_VOICE_ALERTS_ERA105_OPS_DOC;

export const KDS_VOICE_ALERTS_ERA180_CANONICAL_SUMMARY_ARTIFACT =
  KDS_VOICE_ALERTS_ERA105_SUMMARY_ARTIFACT;

export const KDS_VOICE_ALERTS_ERA180_WIRING_PATHS = KDS_VOICE_ALERTS_ERA105_WIRING_PATHS;

export const KDS_VOICE_ALERTS_ERA180_KINDS = KDS_VOICE_ALERTS_ERA105_KINDS;

export const KDS_VOICE_ALERTS_ERA180_SERVICE = KDS_VOICE_ALERTS_ERA105_SERVICE;

export const KDS_VOICE_ALERTS_ERA180_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen (main KDS) with sound enabled.",
  "Queue a new order — verify spoken new-order alert via browser TTS.",
  "Let a ticket go overdue — confirm overdue voice alert fires once.",
  "Trigger rush building/peak — confirm rush voice alerts.",
  "Run npm run smoke:kds-voice-alerts-era105 — canonical era105 wiring cert PASSED.",
  "Run npm run smoke:kds-voice-alerts-era180 — artifact overall PASSED.",
] as const;

export const KDS_VOICE_ALERTS_ERA180_CI_SCRIPTS = [
  "test:ci:kds-voice-alerts-era180",
  "test:ci:kds-voice-alerts-era180:cert",
] as const;

export const KDS_VOICE_ALERTS_ERA180_UNIT_TESTS = [
  "tests/unit/kds-voice-alerts-era180.test.ts",
  "tests/unit/kds-voice-alerts-era105.test.ts",
  "tests/unit/kds-voice-alerts.test.ts",
] as const;

export const KDS_VOICE_ALERTS_ERA180_CANONICAL_POLICY_ID = KDS_VOICE_ALERTS_ERA105_POLICY_ID;

export const KDS_VOICE_ALERTS_ERA180_CAPABILITIES = [
  "tts_messages",
  "speech_synthesis",
  "new_order_alert",
  "overdue_alert",
  "rush_alert",
] as const;
