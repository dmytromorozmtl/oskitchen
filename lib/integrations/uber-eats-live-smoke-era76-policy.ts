/**
 * Era 76 — Uber Eats LIVE smoke PASS (Phase 1 extension #76).
 *
 * Full path: OAuth token → signed orders webhook → ExternalOrder → KDS kitchen import → status sync wiring.
 */

export const UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID = "era76-uber-eats-live-smoke-v1" as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT =
  "artifacts/uber-eats-live-smoke-summary.json" as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_NPM_SCRIPT = "smoke:uber-eats-live" as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-uber-eats-live-era76.ts" as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_OPS_DOC = "docs/uber-eats-live-smoke-setup.md" as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_WIRING_PATHS = [
  "scripts/smoke-uber-eats-live.ts",
  "services/integrations/uber-eats/kitchen-import.service.ts",
  "services/integrations/uber-eats/inbound-order.service.ts",
  "services/integrations/uber-eats/status-sync.service.ts",
  "app/api/webhooks/uber-eats/orders/route.ts",
  "app/api/integrations/uber-eats/test/route.ts",
  "services/integrations/uber-eats/menu-sync.service.ts",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_CYCLE_RUNBOOK_STEPS = [
  "Provision Uber Eats partner sandbox store UUID (not smoke-test placeholder).",
  "Save client ID, secret, and store UUID in Dashboard → Integrations → Uber Eats; complete OAuth.",
  "Register orders webhook URL with matching signing secret in Uber developer portal.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct UBER_EATS_* env).",
  "Run npm run smoke:uber-eats-live-era76 — artifact overall PASSED.",
  "Verify steps: OAuth token → staging webhook → ExternalOrder → KDS import → status sync wiring.",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_CI_SCRIPTS = [
  "test:ci:uber-eats-live-smoke-era76",
  "test:ci:uber-eats-live-smoke-era76:cert",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_UNIT_TESTS = [
  "tests/unit/uber-eats-live-smoke-era76.test.ts",
  "tests/unit/smoke-uber-eats-live.test.ts",
  "tests/unit/uber-eats-status-sync.test.ts",
] as const;

export const UBER_EATS_LIVE_SMOKE_ERA76_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
