/**
 * Era 119 — Marketplace Financing wiring cert (Phase 6 extension #119).
 *
 * Full path: net-30/60/90 → early payment → factoring → financing snapshot.
 */

import { MARKETPLACE_FINANCING_POLICY_ID } from "@/lib/marketplace/financing-policy";

export const MARKETPLACE_FINANCING_ERA119_POLICY_ID =
  "era119-marketplace-financing-v1" as const;

export const MARKETPLACE_FINANCING_ERA119_SUMMARY_ARTIFACT =
  "artifacts/marketplace-financing-smoke-summary.json" as const;

export const MARKETPLACE_FINANCING_ERA119_NPM_SCRIPT =
  "smoke:marketplace-financing-era119" as const;

export const MARKETPLACE_FINANCING_ERA119_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-marketplace-financing-era119.ts" as const;

export const MARKETPLACE_FINANCING_ERA119_OPS_DOC =
  "docs/marketplace-financing-era119-setup.md" as const;

export const MARKETPLACE_FINANCING_ERA119_WIRING_PATHS = [
  "services/marketplace/financing.ts",
  "lib/marketplace/financing-builders.ts",
  "lib/marketplace/financing-policy.ts",
  "actions/marketplace/financing.ts",
  "app/dashboard/marketplace/financing/page.tsx",
  "components/marketplace/marketplace-financing-panel.tsx",
] as const;

export const MARKETPLACE_FINANCING_ERA119_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Financing.",
  "Verify Net-30 / Net-60 / Net-90 term cards and eligibility.",
  "Review early payment offers (2% discount window).",
  "Check invoice factoring offers when receivables exceed threshold.",
  "Run npm run smoke:marketplace-financing-era119 — artifact overall PASSED.",
] as const;

export const MARKETPLACE_FINANCING_ERA119_CI_SCRIPTS = [
  "test:ci:marketplace-financing-era119",
  "test:ci:marketplace-financing-era119:cert",
] as const;

export const MARKETPLACE_FINANCING_ERA119_UNIT_TESTS = [
  "tests/unit/marketplace-financing-era119.test.ts",
  "tests/unit/marketplace-financing.test.ts",
] as const;

export const MARKETPLACE_FINANCING_ERA119_CANONICAL_POLICY_ID = MARKETPLACE_FINANCING_POLICY_ID;

export const MARKETPLACE_FINANCING_ERA119_SERVICE =
  "services/marketplace/financing.ts" as const;

export const MARKETPLACE_FINANCING_ERA119_ROUTE =
  "/dashboard/marketplace/financing" as const;

export const MARKETPLACE_FINANCING_ERA119_PRODUCTS = [
  "net_30",
  "net_60",
  "net_90",
  "early_payment",
  "factoring",
] as const;
