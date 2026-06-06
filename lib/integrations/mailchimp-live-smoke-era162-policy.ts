/**
 * Era 162 — Mailchimp LIVE integration wiring cert (Phase 1 Round 2 #14).
 *
 * Full path: OAuth token → email list sync → campaign automation → registry LIVE.
 */

import {
  MAILCHIMP_LIVE_SMOKE_ERA85_INTEGRATION_HEALTH_PATH,
  MAILCHIMP_LIVE_SMOKE_ERA85_OPS_DOC,
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT,
  MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS,
} from "@/lib/integrations/mailchimp-live-smoke-era85-policy";

export const MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID = "era162-mailchimp-live-v1" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT =
  "artifacts/mailchimp-live-smoke-era162-smoke-summary.json" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_NPM_SCRIPT = "smoke:mailchimp-live-era162" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-mailchimp-live-era162.ts" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_OPS_DOC =
  "docs/mailchimp-live-smoke-era162-setup.md" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_OPS_DOC = MAILCHIMP_LIVE_SMOKE_ERA85_OPS_DOC;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_SUMMARY_ARTIFACT =
  MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT;

export const MAILCHIMP_LIVE_SMOKE_ERA162_WIRING_PATHS = MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CYCLE_RUNBOOK_STEPS = [
  "Provision Mailchimp OAuth app + demo audience (real token, not placeholder).",
  "Complete OAuth in Dashboard → Integrations → Mailchimp; select an audience list.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:mailchimp-live — live OAuth → email list → campaign automation.",
  "Run npm run smoke:mailchimp-live-era162 — artifact overall PASSED.",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CI_SCRIPTS = [
  "test:ci:mailchimp-live-smoke-era162",
  "test:ci:mailchimp-live-smoke-era162:cert",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_UNIT_TESTS = [
  "tests/unit/mailchimp-live-smoke-era162.test.ts",
  "tests/unit/mailchimp-live-smoke-era85.test.ts",
  "tests/unit/smoke-mailchimp-live.test.ts",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_POLICY_ID =
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID;

export const MAILCHIMP_LIVE_SMOKE_ERA162_INTEGRATION_HEALTH_PATH =
  MAILCHIMP_LIVE_SMOKE_ERA85_INTEGRATION_HEALTH_PATH;

export const MAILCHIMP_LIVE_SMOKE_ERA162_CAPABILITIES = [
  "oauth",
  "email_list",
  "campaign_automation",
] as const;
