/**
 * Era 100 — KDS Production View wiring cert (Phase 3 extension #100).
 *
 * Full path: active work items → station load → bottleneck detection → kitchen ETA.
 */

export const KDS_PRODUCTION_VIEW_ERA100_POLICY_ID = "era100-kds-production-view-v1" as const;

export const KDS_PRODUCTION_VIEW_ERA100_SUMMARY_ARTIFACT =
  "artifacts/kds-production-view-smoke-summary.json" as const;

export const KDS_PRODUCTION_VIEW_ERA100_NPM_SCRIPT = "smoke:kds-production-view-era100" as const;

export const KDS_PRODUCTION_VIEW_ERA100_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-production-view-era100.ts" as const;

export const KDS_PRODUCTION_VIEW_ERA100_OPS_DOC = "docs/kds-production-view-era100-setup.md" as const;

export const KDS_PRODUCTION_VIEW_ERA100_WIRING_PATHS = [
  "app/dashboard/kitchen/production/page.tsx",
  "components/kitchen/production-view-client.tsx",
  "lib/kitchen/kds-production-view.ts",
  "lib/kitchen/kds-production-view-policy.ts",
  "services/kitchen/production-view-service.ts",
  "services/kitchen/multi-station-service.ts",
] as const;

export const KDS_PRODUCTION_VIEW_ERA100_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Production — verify station load cards render.",
  "Queue POS or channel orders — confirm tickets route to stations with load % and ETA.",
  "Identify bottleneck station badge when one line exceeds others.",
  "Run npm run smoke:kds-production-view-era100 — artifact overall PASSED.",
] as const;

export const KDS_PRODUCTION_VIEW_ERA100_CI_SCRIPTS = [
  "test:ci:kds-production-view-era100",
  "test:ci:kds-production-view-era100:cert",
] as const;

export const KDS_PRODUCTION_VIEW_ERA100_UNIT_TESTS = [
  "tests/unit/kds-production-view-era100.test.ts",
  "tests/unit/kds-production-view.test.ts",
] as const;

export const KDS_PRODUCTION_VIEW_ERA100_ROUTE = "/dashboard/kitchen/production" as const;
