/**
 * Era 191 — Supplier Marketplace wiring cert (Phase 6 Round 2 #43).
 *
 * Full path: food + packaging + equipment lanes → catalog → one-click reorder.
 */

import {
  SUPPLIER_MARKETPLACE_ERA116_LANES,
  SUPPLIER_MARKETPLACE_ERA116_OPS_DOC,
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA116_ROUTE,
  SUPPLIER_MARKETPLACE_ERA116_SERVICE,
  SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT,
  SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS,
} from "@/lib/marketplace/supplier-marketplace-era116-policy";

export const SUPPLIER_MARKETPLACE_ERA191_POLICY_ID =
  "era191-supplier-marketplace-v1" as const;

export const SUPPLIER_MARKETPLACE_ERA191_SUMMARY_ARTIFACT =
  "artifacts/supplier-marketplace-era191-smoke-summary.json" as const;

export const SUPPLIER_MARKETPLACE_ERA191_NPM_SCRIPT =
  "smoke:supplier-marketplace-era191" as const;

export const SUPPLIER_MARKETPLACE_ERA191_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-supplier-marketplace-era191.ts" as const;

export const SUPPLIER_MARKETPLACE_ERA191_OPS_DOC =
  "docs/supplier-marketplace-era191-setup.md" as const;

export const SUPPLIER_MARKETPLACE_ERA191_CANONICAL_OPS_DOC =
  SUPPLIER_MARKETPLACE_ERA116_OPS_DOC;

export const SUPPLIER_MARKETPLACE_ERA191_CANONICAL_SUMMARY_ARTIFACT =
  SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT;

export const SUPPLIER_MARKETPLACE_ERA191_WIRING_PATHS =
  SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS;

export const SUPPLIER_MARKETPLACE_ERA191_SERVICE =
  SUPPLIER_MARKETPLACE_ERA116_SERVICE;

export const SUPPLIER_MARKETPLACE_ERA191_ROUTE =
  SUPPLIER_MARKETPLACE_ERA116_ROUTE;

export const SUPPLIER_MARKETPLACE_ERA191_LANES =
  SUPPLIER_MARKETPLACE_ERA116_LANES;

export const SUPPLIER_MARKETPLACE_ERA191_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace (Supplier Marketplace hub).",
  "Verify three lane cards — Food, Packaging, Equipment.",
  "Browse catalog from a lane and review top SKUs.",
  "Use one-click reorder from last purchase in a lane.",
  "Run npm run smoke:supplier-marketplace-era116 — canonical era116 wiring cert PASSED.",
  "Run npm run smoke:supplier-marketplace-era191 — artifact overall PASSED.",
] as const;

export const SUPPLIER_MARKETPLACE_ERA191_CI_SCRIPTS = [
  "test:ci:supplier-marketplace-era191",
  "test:ci:supplier-marketplace-era191:cert",
] as const;

export const SUPPLIER_MARKETPLACE_ERA191_UNIT_TESTS = [
  "tests/unit/supplier-marketplace-era191.test.ts",
  "tests/unit/supplier-marketplace-era116.test.ts",
  "tests/unit/supplier-marketplace.test.ts",
] as const;

export const SUPPLIER_MARKETPLACE_ERA191_CANONICAL_POLICY_ID =
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID;
