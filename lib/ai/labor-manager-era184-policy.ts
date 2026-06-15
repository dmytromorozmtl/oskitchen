/**
 * Era 184 — AI Labor Manager wiring cert (Phase 4 Round 2 #36).
 *
 * Full path: schedule plan + realtime clock → staffing optimization → overtime alerts → dashboard.
 */

import {
  AI_LABOR_MANAGER_ERA109_CAPABILITIES,
  AI_LABOR_MANAGER_ERA109_OPS_DOC,
  AI_LABOR_MANAGER_ERA109_POLICY_ID,
  AI_LABOR_MANAGER_ERA109_ROUTE,
  AI_LABOR_MANAGER_ERA109_SERVICE,
  AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT,
  AI_LABOR_MANAGER_ERA109_WIRING_PATHS,
} from "@/lib/ai/labor-manager-era109-policy";

export const AI_LABOR_MANAGER_ERA184_POLICY_ID = "era184-ai-labor-manager-v1" as const;

export const AI_LABOR_MANAGER_ERA184_SUMMARY_ARTIFACT =
  "artifacts/ai-labor-manager-era184-smoke-summary.json" as const;

export const AI_LABOR_MANAGER_ERA184_NPM_SCRIPT = "smoke:ai-labor-manager-era184" as const;

export const AI_LABOR_MANAGER_ERA184_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-ai-labor-manager-era184.ts" as const;

export const AI_LABOR_MANAGER_ERA184_OPS_DOC = "docs/ai-labor-manager-era184-setup.md" as const;

export const AI_LABOR_MANAGER_ERA184_CANONICAL_OPS_DOC = AI_LABOR_MANAGER_ERA109_OPS_DOC;

export const AI_LABOR_MANAGER_ERA184_CANONICAL_SUMMARY_ARTIFACT =
  AI_LABOR_MANAGER_ERA109_SUMMARY_ARTIFACT;

export const AI_LABOR_MANAGER_ERA184_WIRING_PATHS = AI_LABOR_MANAGER_ERA109_WIRING_PATHS;

export const AI_LABOR_MANAGER_ERA184_SERVICE = AI_LABOR_MANAGER_ERA109_SERVICE;

export const AI_LABOR_MANAGER_ERA184_ROUTE = AI_LABOR_MANAGER_ERA109_ROUTE;

export const AI_LABOR_MANAGER_ERA184_CAPABILITIES = AI_LABOR_MANAGER_ERA109_CAPABILITIES;

export const AI_LABOR_MANAGER_ERA184_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Staff → AI Labor Manager.",
  "Verify daily labor brief with staffing and overtime summary.",
  "Review staffing optimization — understaffed/overstaffed day signals.",
  "Check overtime alerts — projected hours and est. OT cost.",
  "Run npm run smoke:ai-labor-manager-era109 — canonical era109 wiring cert PASSED.",
  "Run npm run smoke:ai-labor-manager-era184 — artifact overall PASSED.",
] as const;

export const AI_LABOR_MANAGER_ERA184_CI_SCRIPTS = [
  "test:ci:ai-labor-manager-era184",
  "test:ci:ai-labor-manager-era184:cert",
] as const;

export const AI_LABOR_MANAGER_ERA184_UNIT_TESTS = [
  "tests/unit/ai-labor-manager-era184.test.ts",
  "tests/unit/ai-labor-manager-era109.test.ts",
  "tests/unit/labor-manager.test.ts",
] as const;

export const AI_LABOR_MANAGER_ERA184_CANONICAL_POLICY_ID = AI_LABOR_MANAGER_ERA109_POLICY_ID;
