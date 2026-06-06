/**
 * Era 194 — Marketplace Financing wiring cert (Phase 6 Round 2 #46).
 *
 * Full path: net-30/60/90 → early payment → factoring → financing snapshot.
 */

import {
  MARKETPLACE_FINANCING_ERA119_OPS_DOC,
  MARKETPLACE_FINANCING_ERA119_POLICY_ID,
  MARKETPLACE_FINANCING_ERA119_PRODUCTS,
  MARKETPLACE_FINANCING_ERA119_ROUTE,
  MARKETPLACE_FINANCING_ERA119_SERVICE,
  MARKETPLACE_FINANCING_ERA119_SUMMARY_ARTIFACT,
  MARKETPLACE_FINANCING_ERA119_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-financing-era119-policy";

export const MARKETPLACE_FINANCING_ERA194_POLICY_ID =
  "era194-marketplace-financing-v1" as const;

export const MARKETPLACE_FINANCING_ERA194_SUMMARY_ARTIFACT =
  "artifacts/marketplace-financing-era194-smoke-summary.json" as const;

export const MARKETPLACE_FINANCING_ERA194_NPM_SCRIPT =
  "smoke:marketplace-financing-era194" as const;

export const MARKETPLACE_FINANCING_ERA194_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-marketplace-financing-era194.ts" as const;

export const MARKETPLACE_FINANCING_ERA194_OPS_DOC =
  "docs/marketplace-financing-era194-setup.md" as const;

export const MARKETPLACE_FINANCING_ERA194_CANONICAL_OPS_DOC =
  MARKETPLACE_FINANCING_ERA119_OPS_DOC;

export const MARKETPLACE_FINANCING_ERA194_CANONICAL_SUMMARY_ARTIFACT =
  MARKETPLACE_FINANCING_ERA119_SUMMARY_ARTIFACT;

export const MARKETPLACE_FINANCING_ERA194_WIRING_PATHS =
  MARKETPLACE_FINANCING_ERA119_WIRING_PATHS;

export const MARKETPLACE_FINANCING_ERA194_SERVICE = MARKETPLACE_FINANCING_ERA119_SERVICE;

export const MARKETPLACE_FINANCING_ERA194_ROUTE = MARKETPLACE_FINANCING_ERA119_ROUTE;

export const MARKETPLACE_FINANCING_ERA194_PRODUCTS = MARKETPLACE_FINANCING_ERA119_PRODUCTS;

export const MARKETPLACE_FINANCING_ERA194_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Financing.",
  "Verify Net-30 / Net-60 / Net-90 term cards and eligibility.",
  "Review early payment offers (2% discount window).",
  "Check invoice factoring offers when receivables exceed threshold.",
  "Run npm run smoke:marketplace-financing-era119 — canonical era119 wiring cert PASSED.",
  "Run npm run smoke:marketplace-financing-era194 — artifact overall PASSED.",
] as const;

export const MARKETPLACE_FINANCING_ERA194_CI_SCRIPTS = [
  "test:ci:marketplace-financing-era194",
  "test:ci:marketplace-financing-era194:cert",
] as const;

export const MARKETPLACE_FINANCING_ERA194_UNIT_TESTS = [
  "tests/unit/marketplace-financing-era194.test.ts",
  "tests/unit/marketplace-financing-era119.test.ts",
  "tests/unit/marketplace-financing.test.ts",
] as const;

export const MARKETPLACE_FINANCING_ERA194_CANONICAL_POLICY_ID =
  MARKETPLACE_FINANCING_ERA119_POLICY_ID;
