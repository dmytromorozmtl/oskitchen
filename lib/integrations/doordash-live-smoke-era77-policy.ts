/**
 * Era 77 — DoorDash LIVE smoke PASS (Phase 1 extension #77).
 *
 * Full path: OAuth/API key → signed orders webhook → ExternalOrder → KDS kitchen import → status sync wiring.
 */

export const DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID = "era77-doordash-live-smoke-v1" as const;

export const DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT =
  "artifacts/doordash-live-smoke-summary.json" as const;

export const DOORDASH_LIVE_SMOKE_ERA77_NPM_SCRIPT = "smoke:doordash-live" as const;

export const DOORDASH_LIVE_SMOKE_ERA77_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-doordash-live-era77.ts" as const;

export const DOORDASH_LIVE_SMOKE_ERA77_OPS_DOC = "docs/doordash-live-smoke-setup.md" as const;

export const DOORDASH_LIVE_SMOKE_ERA77_WIRING_PATHS = [
  "scripts/smoke-doordash-live.ts",
  "services/integrations/doordash/kitchen-import.service.ts",
  "services/integrations/doordash/inbound-order.service.ts",
  "services/integrations/doordash/status-sync.service.ts",
  "app/api/webhooks/doordash/orders/route.ts",
  "services/integrations/doordash/doordash-marketplace.ts",
  "services/integrations/doordash/menu-sync.service.ts",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA77_CYCLE_RUNBOOK_STEPS = [
  "Provision DoorDash partner sandbox merchant ID (not smoke-test placeholder).",
  "Save API key or complete OAuth in Dashboard → Integrations → DoorDash.",
  "Register orders webhook URL with matching signing secret in DoorDash developer portal.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct DOORDASH_* env).",
  "Run npm run smoke:doordash-live-era77 — artifact overall PASSED.",
  "Verify steps: marketplace API → staging webhook → ExternalOrder → KDS import → status sync wiring.",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA77_CI_SCRIPTS = [
  "test:ci:doordash-live-smoke-era77",
  "test:ci:doordash-live-smoke-era77:cert",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA77_UNIT_TESTS = [
  "tests/unit/doordash-live-smoke-era77.test.ts",
  "tests/unit/smoke-doordash-live.test.ts",
  "tests/unit/doordash-status-sync.test.ts",
] as const;

export const DOORDASH_LIVE_SMOKE_ERA77_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
