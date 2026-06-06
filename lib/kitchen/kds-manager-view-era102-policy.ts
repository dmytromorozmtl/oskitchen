/**
 * Era 102 — KDS Manager View wiring cert (Phase 3 extension #102).
 *
 * Full path: production + expo + queue → performance / delays / efficiency snapshot.
 */

export const KDS_MANAGER_VIEW_ERA102_POLICY_ID = "era102-kds-manager-view-v1" as const;

export const KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT =
  "artifacts/kds-manager-view-smoke-summary.json" as const;

export const KDS_MANAGER_VIEW_ERA102_NPM_SCRIPT = "smoke:kds-manager-view-era102" as const;

export const KDS_MANAGER_VIEW_ERA102_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-manager-view-era102.ts" as const;

export const KDS_MANAGER_VIEW_ERA102_OPS_DOC = "docs/kds-manager-view-era102-setup.md" as const;

export const KDS_MANAGER_VIEW_ERA102_WIRING_PATHS = [
  "app/dashboard/kitchen/manager/page.tsx",
  "components/kitchen/manager-view-client.tsx",
  "lib/kitchen/kds-manager-view.ts",
  "lib/kitchen/kds-manager-view-policy.ts",
  "services/kitchen/manager-view-service.ts",
] as const;

export const KDS_MANAGER_VIEW_ERA102_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Manager — verify performance, delays, efficiency panels.",
  "Queue orders and complete tickets — confirm on-time rate and efficiency score update.",
  "Trigger overdue tickets — verify delays panel and manager alerts.",
  "Run npm run smoke:kds-manager-view-era102 — artifact overall PASSED.",
] as const;

export const KDS_MANAGER_VIEW_ERA102_CI_SCRIPTS = [
  "test:ci:kds-manager-view-era102",
  "test:ci:kds-manager-view-era102:cert",
] as const;

export const KDS_MANAGER_VIEW_ERA102_UNIT_TESTS = [
  "tests/unit/kds-manager-view-era102.test.ts",
  "tests/unit/kds-manager-view.test.ts",
] as const;

export const KDS_MANAGER_VIEW_ERA102_ROUTE = "/dashboard/kitchen/manager" as const;

export const KDS_MANAGER_VIEW_ERA102_PILLARS = [
  "performance",
  "delays",
  "efficiency",
] as const;
