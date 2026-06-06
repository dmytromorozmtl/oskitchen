/**
 * Era 109 — AI Labor Manager wiring cert (Phase 4 extension #109).
 *
 * Full path: schedule plan + realtime clock → staffing optimization → overtime alerts → dashboard.
 */

import { AI_LABOR_MANAGER_POLICY_ID } from "@/lib/ai/labor-manager-policy";

export const AI_LABOR_MANAGER_ERA109_POLICY_ID = "era109-ai-labor-manager-v1" as const;

export const AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT =
  "artifacts/ai-labor-manager-smoke-summary.json" as const;

export const AI_LABOR_MANAGER_ERA109_NPM_SCRIPT = "smoke:ai-labor-manager-era109" as const;

export const AI_LABOR_MANAGER_ERA109_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-labor-manager-era109.ts" as const;

export const AI_LABOR_MANAGER_ERA109_OPS_DOC = "docs/ai-labor-manager-era109-setup.md" as const;

export const AI_LABOR_MANAGER_ERA109_WIRING_PATHS = [
  "services/ai/labor-manager.ts",
  "lib/ai/labor-manager-builders.ts",
  "lib/ai/labor-manager-policy.ts",
  "app/dashboard/staff/labor-manager/page.tsx",
  "components/labor/labor-manager-client.tsx",
] as const;

export const AI_LABOR_MANAGER_ERA109_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Staff → AI Labor Manager.",
  "Verify daily labor brief with staffing and overtime summary.",
  "Review staffing optimization — understaffed/overstaffed day signals.",
  "Check overtime alerts — projected hours and est. OT cost.",
  "Run npm run smoke:ai-labor-manager-era109 — artifact overall PASSED.",
] as const;

export const AI_LABOR_MANAGER_ERA109_CI_SCRIPTS = [
  "test:ci:ai-labor-manager-era109",
  "test:ci:ai-labor-manager-era109:cert",
] as const;

export const AI_LABOR_MANAGER_ERA109_UNIT_TESTS = [
  "tests/unit/ai-labor-manager-era109.test.ts",
  "tests/unit/labor-manager.test.ts",
] as const;

export const AI_LABOR_MANAGER_ERA109_CANONICAL_POLICY_ID = AI_LABOR_MANAGER_POLICY_ID;

export const AI_LABOR_MANAGER_ERA109_SERVICE = "services/ai/labor-manager.ts" as const;

export const AI_LABOR_MANAGER_ERA109_ROUTE = "/dashboard/staff/labor-manager" as const;

export const AI_LABOR_MANAGER_ERA109_CAPABILITIES = [
  "staffing_optimization",
  "overtime_alerts",
  "daily_brief",
] as const;
