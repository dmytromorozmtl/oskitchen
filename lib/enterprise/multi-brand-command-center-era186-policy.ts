/**
 * Era 186 — Multi-Brand Command Center wiring cert (Phase 5 Round 2 #38).
 *
 * Full path: brand analytics → lanes A–D → revenue share → portfolio alerts → dashboard.
 */

import {
  MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES,
  MULTI_BRAND_COMMAND_CENTER_ERA111_OPS_DOC,
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT,
  MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS,
} from "@/lib/enterprise/multi-brand-command-center-era111-policy";

export const MULTI_BRAND_COMMAND_CENTER_ERA186_POLICY_ID =
  "era186-multi-brand-command-center-v1" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_SUMMARY_ARTIFACT =
  "artifacts/multi-brand-command-center-era186-smoke-summary.json" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_NPM_SCRIPT =
  "smoke:multi-brand-command-center-era186" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-multi-brand-command-center-era186.ts" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_OPS_DOC =
  "docs/multi-brand-command-center-era186-setup.md" as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_OPS_DOC =
  MULTI_BRAND_COMMAND_CENTER_ERA111_OPS_DOC;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_SUMMARY_ARTIFACT =
  MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_WIRING_PATHS =
  MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_SERVICE =
  MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_ROUTE =
  MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CAPABILITIES =
  MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Enterprise → Multi-Brand Command Center.",
  "Verify portfolio summary — revenue, MTD orders, active lanes, top lane.",
  "Review revenue share bars for Brand lanes A–D.",
  "Check brand cards — revenue per brand, MTD share, portfolio alerts.",
  "Run npm run smoke:multi-brand-command-center-era111 — canonical era111 wiring cert PASSED.",
  "Run npm run smoke:multi-brand-command-center-era186 — artifact overall PASSED.",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CI_SCRIPTS = [
  "test:ci:multi-brand-command-center-era186",
  "test:ci:multi-brand-command-center-era186:cert",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_UNIT_TESTS = [
  "tests/unit/multi-brand-command-center-era186.test.ts",
  "tests/unit/multi-brand-command-center-era111.test.ts",
  "tests/unit/multi-brand-enterprise.test.ts",
] as const;

export const MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_POLICY_ID =
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID;
