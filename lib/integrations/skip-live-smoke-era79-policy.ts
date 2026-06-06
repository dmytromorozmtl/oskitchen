/**
 * Era 79 — Skip LIVE smoke PASS (Phase 1 extension #79).
 *
 * Full path: OAuth token → signed orders webhook → ExternalOrder → KDS kitchen import → status sync wiring.
 */

export const SKIP_LIVE_SMOKE_ERA79_POLICY_ID = "era79-skip-live-smoke-v1" as const;

export const SKIP_LIVE_SMOKE_ERA79_SUMMARY_ARTIFACT =
  "artifacts/skip-live-smoke-summary.json" as const;

export const SKIP_LIVE_SMOKE_ERA79_NPM_SCRIPT = "smoke:skip-live" as const;

export const SKIP_LIVE_SMOKE_ERA79_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-skip-live-era79.ts" as const;

export const SKIP_LIVE_SMOKE_ERA79_OPS_DOC = "docs/skip-live-smoke-setup.md" as const;

export const SKIP_LIVE_SMOKE_ERA79_WIRING_PATHS = [
  "scripts/smoke-skip-live.ts",
  "services/integrations/skip/kitchen-import.service.ts",
  "services/integrations/skip/inbound-order.service.ts",
  "services/integrations/skip/status-sync.service.ts",
  "app/api/webhooks/skip/orders/route.ts",
  "services/integrations/skip/skip-marketplace.ts",
  "services/integrations/skip/skip-service.ts",
] as const;

export const SKIP_LIVE_SMOKE_ERA79_CYCLE_RUNBOOK_STEPS = [
  "Provision Skip partner sandbox restaurant ID (not smoke-test placeholder).",
  "Save OAuth credentials or complete OAuth in Dashboard → Integrations → Skip.",
  "Register orders webhook URL with matching signing secret in Skip developer portal.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct SKIP_* env).",
  "Run npm run smoke:skip-live-era79 — artifact overall PASSED.",
  "Verify steps: marketplace API → staging webhook → ExternalOrder → KDS import → status sync wiring.",
] as const;

export const SKIP_LIVE_SMOKE_ERA79_CI_SCRIPTS = [
  "test:ci:skip-live-smoke-era79",
  "test:ci:skip-live-smoke-era79:cert",
] as const;

export const SKIP_LIVE_SMOKE_ERA79_UNIT_TESTS = [
  "tests/unit/skip-live-smoke-era79.test.ts",
  "tests/unit/smoke-skip-live.test.ts",
  "tests/unit/skip-status-sync.test.ts",
] as const;

export const SKIP_LIVE_SMOKE_ERA79_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
