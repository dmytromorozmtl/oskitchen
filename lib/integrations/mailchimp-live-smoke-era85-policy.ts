/**
 * Era 85 — Mailchimp LIVE smoke PASS (Phase 1 extension #85).
 *
 * Full path: OAuth token → email list → campaign automation wiring.
 */

export const MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID = "era85-mailchimp-live-smoke-v1" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT =
  "artifacts/mailchimp-live-smoke-summary.json" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_NPM_SCRIPT = "smoke:mailchimp-live" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-mailchimp-live-era85.ts" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_OPS_DOC = "docs/mailchimp-live-smoke-setup.md" as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS = [
  "scripts/smoke-mailchimp-live.ts",
  "services/integrations/mailchimp/list-sync.service.ts",
  "services/integrations/mailchimp/campaign-automation.service.ts",
  "services/integrations/mailchimp/mailchimp-api.ts",
  "services/integrations/mailchimp/mailchimp-live-service.ts",
  "app/api/integrations/mailchimp/oauth/callback/route.ts",
  "app/api/integrations/mailchimp/sync-list/route.ts",
  "app/api/integrations/mailchimp/trigger-automation/route.ts",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_CYCLE_RUNBOOK_STEPS = [
  "Provision Mailchimp OAuth app + demo audience (not smoke-test placeholder token).",
  "Complete OAuth in Dashboard → Integrations → Mailchimp; select an audience list.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct MAILCHIMP_ACCESS_TOKEN).",
  "Run npm run smoke:mailchimp-live-era85 — artifact overall PASSED.",
  "Verify steps: OAuth token → email list → campaign automation wiring.",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_CI_SCRIPTS = [
  "test:ci:mailchimp-live-smoke-era85",
  "test:ci:mailchimp-live-smoke-era85:cert",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_UNIT_TESTS = [
  "tests/unit/mailchimp-live-smoke-era85.test.ts",
  "tests/unit/smoke-mailchimp-live.test.ts",
  "tests/unit/mailchimp-sync.test.ts",
] as const;

export const MAILCHIMP_LIVE_SMOKE_ERA85_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
