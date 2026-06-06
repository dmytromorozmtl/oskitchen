/**
 * Era 116 — Supplier Marketplace wiring cert (Phase 6 extension #116).
 *
 * Full path: food + packaging + equipment lanes → catalog → one-click reorder.
 */

import { SUPPLIER_MARKETPLACE_POLICY_ID } from "@/lib/marketplace/supplier-marketplace-policy";

export const SUPPLIER_MARKETPLACE_ERA116_POLICY_ID =
  "era116-supplier-marketplace-v1" as const;

export const SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT =
  "artifacts/supplier-marketplace-smoke-summary.json" as const;

export const SUPPLIER_MARKETPLACE_ERA116_NPM_SCRIPT =
  "smoke:supplier-marketplace-era116" as const;

export const SUPPLIER_MARKETPLACE_ERA116_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-supplier-marketplace-era116.ts" as const;

export const SUPPLIER_MARKETPLACE_ERA116_OPS_DOC =
  "docs/supplier-marketplace-era116-setup.md" as const;

export const SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS = [
  "services/marketplace/supplier-marketplace-service.ts",
  "lib/marketplace/supplier-marketplace-builders.ts",
  "lib/marketplace/supplier-marketplace-policy.ts",
  "actions/marketplace/supplier-reorder.ts",
  "app/dashboard/marketplace/page.tsx",
  "components/marketplace/supplier-marketplace-lanes.tsx",
] as const;

export const SUPPLIER_MARKETPLACE_ERA116_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace (Supplier Marketplace hub).",
  "Verify three lane cards — Food, Packaging, Equipment.",
  "Browse catalog from a lane and review top SKUs.",
  "Use one-click reorder from last purchase in a lane.",
  "Run npm run smoke:supplier-marketplace-era116 — artifact overall PASSED.",
] as const;

export const SUPPLIER_MARKETPLACE_ERA116_CI_SCRIPTS = [
  "test:ci:supplier-marketplace-era116",
  "test:ci:supplier-marketplace-era116:cert",
] as const;

export const SUPPLIER_MARKETPLACE_ERA116_UNIT_TESTS = [
  "tests/unit/supplier-marketplace-era116.test.ts",
  "tests/unit/supplier-marketplace.test.ts",
] as const;

export const SUPPLIER_MARKETPLACE_ERA116_CANONICAL_POLICY_ID = SUPPLIER_MARKETPLACE_POLICY_ID;

export const SUPPLIER_MARKETPLACE_ERA116_SERVICE =
  "services/marketplace/supplier-marketplace-service.ts" as const;

export const SUPPLIER_MARKETPLACE_ERA116_ROUTE = "/dashboard/marketplace" as const;

export const SUPPLIER_MARKETPLACE_ERA116_LANES = [
  "food",
  "packaging",
  "equipment",
] as const;
