/**
 * Era 105 — KDS Voice Alerts wiring cert (Phase 3 extension #105).
 *
 * Full path: message builder → speechSynthesis queue → KDS daily service triggers.
 */

import { KDS_VOICE_ALERTS_POLICY_ID } from "@/lib/kitchen/kds-voice-alerts-policy";

export const KDS_VOICE_ALERTS_ERA105_POLICY_ID = "era105-kds-voice-alerts-v1" as const;

export const KDS_VOICE_ALERTS_ERA105_SUMMARY_ARTIFACT =
  "artifacts/kds-voice-alerts-smoke-summary.json" as const;

export const KDS_VOICE_ALERTS_ERA105_NPM_SCRIPT = "smoke:kds-voice-alerts-era105" as const;

export const KDS_VOICE_ALERTS_ERA105_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-voice-alerts-era105.ts" as const;

export const KDS_VOICE_ALERTS_ERA105_OPS_DOC = "docs/kds-voice-alerts-era105-setup.md" as const;

export const KDS_VOICE_ALERTS_ERA105_WIRING_PATHS = [
  "services/kitchen/voice-alerts.ts",
  "lib/kitchen/kds-voice-alerts-policy.ts",
  "components/kitchen/kds-daily-service.tsx",
] as const;

export const KDS_VOICE_ALERTS_ERA105_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen (main KDS) with sound enabled.",
  "Queue a new order — verify spoken new-order alert via browser TTS.",
  "Let a ticket go overdue — confirm overdue voice alert fires once.",
  "Trigger rush building/peak — confirm rush voice alerts.",
  "Run npm run smoke:kds-voice-alerts-era105 — artifact overall PASSED.",
] as const;

export const KDS_VOICE_ALERTS_ERA105_CI_SCRIPTS = [
  "test:ci:kds-voice-alerts-era105",
  "test:ci:kds-voice-alerts-era105:cert",
] as const;

export const KDS_VOICE_ALERTS_ERA105_UNIT_TESTS = [
  "tests/unit/kds-voice-alerts-era105.test.ts",
  "tests/unit/kds-voice-alerts.test.ts",
] as const;

export const KDS_VOICE_ALERTS_ERA105_CANONICAL_POLICY_ID = KDS_VOICE_ALERTS_POLICY_ID;

export const KDS_VOICE_ALERTS_ERA105_SERVICE = "services/kitchen/voice-alerts.ts" as const;

export const KDS_VOICE_ALERTS_ERA105_KINDS = [
  "new_order",
  "overdue",
  "rush_peak",
  "rush_building",
  "allergen",
] as const;
