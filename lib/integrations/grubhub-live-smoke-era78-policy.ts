/**
 * Era 78 — Grubhub LIVE smoke PASS (Phase 1 extension #78).
 *
 * Full path: OAuth/API key → signed orders webhook → ExternalOrder → KDS kitchen import → status sync wiring.
 */

export const GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID = "era78-grubhub-live-smoke-v1" as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT =
  "artifacts/grubhub-live-smoke-summary.json" as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_NPM_SCRIPT = "smoke:grubhub-live" as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-grubhub-live-era78.ts" as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_OPS_DOC = "docs/grubhub-live-smoke-setup.md" as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_WIRING_PATHS = [
  "scripts/smoke-grubhub-live.ts",
  "services/integrations/grubhub/kitchen-import.service.ts",
  "services/integrations/grubhub/inbound-order.service.ts",
  "services/integrations/grubhub/status-sync.service.ts",
  "app/api/webhooks/grubhub/orders/route.ts",
  "services/integrations/grubhub/grubhub-marketplace.ts",
  "services/integrations/grubhub/menu-sync.service.ts",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_CYCLE_RUNBOOK_STEPS = [
  "Provision Grubhub partner sandbox merchant ID (not smoke-test placeholder).",
  "Save API key or complete OAuth in Dashboard → Integrations → Grubhub.",
  "Register orders webhook URL with matching signing secret in Grubhub developer portal.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct GRUBHUB_* env).",
  "Run npm run smoke:grubhub-live-era78 — artifact overall PASSED.",
  "Verify steps: marketplace API → staging webhook → ExternalOrder → KDS import → status sync wiring.",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_CI_SCRIPTS = [
  "test:ci:grubhub-live-smoke-era78",
  "test:ci:grubhub-live-smoke-era78:cert",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_UNIT_TESTS = [
  "tests/unit/grubhub-live-smoke-era78.test.ts",
  "tests/unit/smoke-grubhub-live.test.ts",
  "tests/unit/grubhub-status-sync.test.ts",
] as const;

export const GRUBHUB_LIVE_SMOKE_ERA78_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
