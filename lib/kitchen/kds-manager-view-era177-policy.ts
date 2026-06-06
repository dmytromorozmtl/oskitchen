/**
 * Era 177 — KDS Manager View wiring cert (Phase 3 Round 2 #29).
 *
 * Full path: production + expo + queue → performance / delays / efficiency snapshot.
 */

import {
  KDS_MANAGER_VIEW_ERA102_OPS_DOC,
  KDS_MANAGER_VIEW_ERA102_PILLARS,
  KDS_MANAGER_VIEW_ERA102_POLICY_ID,
  KDS_MANAGER_VIEW_ERA102_ROUTE,
  KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT,
  KDS_MANAGER_VIEW_ERA102_WIRING_PATHS,
} from "@/lib/kitchen/kds-manager-view-era102-policy";

export const KDS_MANAGER_VIEW_ERA177_POLICY_ID = "era177-kds-manager-view-v1" as const;

export const KDS_MANAGER_VIEW_ERA177_SUMMARY_ARTIFACT =
  "artifacts/kds-manager-view-era177-smoke-summary.json" as const;

export const KDS_MANAGER_VIEW_ERA177_NPM_SCRIPT = "smoke:kds-manager-view-era177" as const;

export const KDS_MANAGER_VIEW_ERA177_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-manager-view-era177.ts" as const;

export const KDS_MANAGER_VIEW_ERA177_OPS_DOC = "docs/kds-manager-view-era177-setup.md" as const;

export const KDS_MANAGER_VIEW_ERA177_CANONICAL_OPS_DOC = KDS_MANAGER_VIEW_ERA102_OPS_DOC;

export const KDS_MANAGER_VIEW_ERA177_CANONICAL_SUMMARY_ARTIFACT =
  KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT;

export const KDS_MANAGER_VIEW_ERA177_WIRING_PATHS = KDS_MANAGER_VIEW_ERA102_WIRING_PATHS;

export const KDS_MANAGER_VIEW_ERA177_PILLARS = KDS_MANAGER_VIEW_ERA102_PILLARS;

export const KDS_MANAGER_VIEW_ERA177_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Kitchen → Manager — verify performance, delays, efficiency panels.",
  "Queue orders and complete tickets — confirm on-time rate and efficiency score update.",
  "Trigger overdue tickets — verify delays panel and manager alerts.",
  "Run npm run smoke:kds-manager-view-era102 — canonical era102 wiring cert PASSED.",
  "Run npm run smoke:kds-manager-view-era177 — artifact overall PASSED.",
] as const;

export const KDS_MANAGER_VIEW_ERA177_CI_SCRIPTS = [
  "test:ci:kds-manager-view-era177",
  "test:ci:kds-manager-view-era177:cert",
] as const;

export const KDS_MANAGER_VIEW_ERA177_UNIT_TESTS = [
  "tests/unit/kds-manager-view-era177.test.ts",
  "tests/unit/kds-manager-view-era102.test.ts",
  "tests/unit/kds-manager-view.test.ts",
] as const;

export const KDS_MANAGER_VIEW_ERA177_CANONICAL_POLICY_ID = KDS_MANAGER_VIEW_ERA102_POLICY_ID;

export const KDS_MANAGER_VIEW_ERA177_ROUTE = KDS_MANAGER_VIEW_ERA102_ROUTE;

export const KDS_MANAGER_VIEW_ERA177_CAPABILITIES = [
  "performance_metrics",
  "delay_tracking",
  "efficiency_score",
  "manager_alerts",
] as const;
