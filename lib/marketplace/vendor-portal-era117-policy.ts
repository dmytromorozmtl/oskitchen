/**
 * Era 117 — Vendor Portal 2.0 wiring cert (Phase 6 extension #117).
 *
 * Full path: orders + invoices + analytics → three modules → vendor hub.
 */

import { VENDOR_PORTAL_POLICY_ID } from "@/lib/marketplace/vendor-portal-policy";

export const VENDOR_PORTAL_ERA117_POLICY_ID = "era117-vendor-portal-v2-v1" as const;

export const VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT =
  "artifacts/vendor-portal-smoke-summary.json" as const;

export const VENDOR_PORTAL_ERA117_NPM_SCRIPT = "smoke:vendor-portal-era117" as const;

export const VENDOR_PORTAL_ERA117_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-vendor-portal-era117.ts" as const;

export const VENDOR_PORTAL_ERA117_OPS_DOC = "docs/vendor-portal-era117-setup.md" as const;

export const VENDOR_PORTAL_ERA117_WIRING_PATHS = [
  "services/marketplace/vendor-portal-service.ts",
  "lib/marketplace/vendor-portal-builders.ts",
  "lib/marketplace/vendor-portal-policy.ts",
  "app/vendor/(cabinet)/dashboard/page.tsx",
  "app/vendor/(cabinet)/orders/page.tsx",
  "app/vendor/(cabinet)/invoices/page.tsx",
  "app/vendor/(cabinet)/analytics/page.tsx",
  "components/marketplace/vendor-portal-hub.tsx",
] as const;

export const VENDOR_PORTAL_ERA117_CYCLE_RUNBOOK_STEPS = [
  "Open Vendor Portal → Dashboard (Vendor Portal 2.0 hub).",
  "Verify three module cards — Orders, Invoices, Analytics.",
  "Open Orders inbox and review pending purchase orders.",
  "Open Invoices — verify commission balances and settlement history.",
  "Run npm run smoke:vendor-portal-era117 — artifact overall PASSED.",
] as const;

export const VENDOR_PORTAL_ERA117_CI_SCRIPTS = [
  "test:ci:vendor-portal-era117",
  "test:ci:vendor-portal-era117:cert",
] as const;

export const VENDOR_PORTAL_ERA117_UNIT_TESTS = [
  "tests/unit/vendor-portal-era117.test.ts",
  "tests/unit/vendor-portal.test.ts",
] as const;

export const VENDOR_PORTAL_ERA117_CANONICAL_POLICY_ID = VENDOR_PORTAL_POLICY_ID;

export const VENDOR_PORTAL_ERA117_SERVICE =
  "services/marketplace/vendor-portal-service.ts" as const;

export const VENDOR_PORTAL_ERA117_ROUTE = "/vendor/dashboard" as const;

export const VENDOR_PORTAL_ERA117_MODULES = [
  "orders",
  "invoices",
  "analytics",
] as const;
