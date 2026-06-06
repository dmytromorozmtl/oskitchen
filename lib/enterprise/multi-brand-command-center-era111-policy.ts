/**
 * Era 111 — Multi-Brand Command Center wiring cert (Phase 5 extension #111).
 *
 * Full path: brand analytics → lanes A–D → revenue share → portfolio alerts → dashboard.
 */

import { ENTERPRISE_MULTI_BRAND_POLICY_ID } from "@/lib/enterprise/multi-brand-policy";

export const MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID =
  "era111-multi-brand-command-center-v1" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT =
  "artifacts/multi-brand-command-center-smoke-summary.json" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_NPM_SCRIPT =
  "smoke:multi-brand-command-center-era111" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-multi-brand-command-center-era111.ts" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_OPS_DOC =
  "docs/multi-brand-command-center-era111-setup.md" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS = [
  "services/enterprise/multi-brand-service.ts",
  "lib/enterprise/multi-brand-builders.ts",
  "lib/enterprise/multi-brand-policy.ts",
  "app/dashboard/enterprise/multi-brand/page.tsx",
  "components/enterprise/multi-brand-enterprise-panel.tsx",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Multi-Brand Command Center.",
  "Verify portfolio summary — revenue, MTD orders, active lanes, top lane.",
  "Review revenue share bars for Brand lanes A–D.",
  "Check brand cards — revenue per brand, MTD share, portfolio alerts.",
  "Run npm run smoke:multi-brand-command-center-era111 — artifact overall PASSED.",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_CI_SCRIPTS = [
  "test:ci:multi-brand-command-center-era111",
  "test:ci:multi-brand-command-center-era111:cert",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_UNIT_TESTS = [
  "tests/unit/multi-brand-command-center-era111.test.ts",
  "tests/unit/multi-brand-enterprise.test.ts",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_CANONICAL_POLICY_ID =
  ENTERPRISE_MULTI_BRAND_POLICY_ID;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE =
  "services/enterprise/multi-brand-service.ts" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE =
  "/dashboard/enterprise/multi-brand" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES = [
  "brand_lanes_abcd",
  "revenue_per_brand",
  "portfolio_alerts",
] as const;
