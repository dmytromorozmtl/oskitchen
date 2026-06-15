/**
 * Era 192 — Vendor Portal 2.0 wiring cert (Phase 6 Round 2 #44).
 *
 * Full path: orders + invoices + analytics → three modules → vendor hub.
 */

import {
  VENDOR_PORTAL_ERA117_MODULES,
  VENDOR_PORTAL_ERA117_OPS_DOC,
  VENDOR_PORTAL_ERA117_POLICY_ID,
  VENDOR_PORTAL_ERA117_ROUTE,
  VENDOR_PORTAL_ERA117_SERVICE,
  VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT,
  VENDOR_PORTAL_ERA117_WIRING_PATHS,
} from "@/lib/marketplace/vendor-portal-era117-policy";

export const VENDOR_PORTAL_ERA192_POLICY_ID = "era192-vendor-portal-v2-v1" as const;

export const VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT =
  "artifacts/vendor-portal-era192-smoke-summary.json" as const;

export const VENDOR_PORTAL_ERA192_NPM_SCRIPT = "smoke:vendor-portal-era192" as const;

export const VENDOR_PORTAL_ERA192_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-vendor-portal-era192.ts" as const;

export const VENDOR_PORTAL_ERA192_OPS_DOC = "docs/vendor-portal-era192-setup.md" as const;

export const VENDOR_PORTAL_ERA192_CANONICAL_OPS_DOC = VENDOR_PORTAL_ERA117_OPS_DOC;

export const VENDOR_PORTAL_ERA192_CANONICAL_SUMMARY_ARTIFACT =
  VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT;

export const VENDOR_PORTAL_ERA192_WIRING_PATHS = VENDOR_PORTAL_ERA117_WIRING_PATHS;

export const VENDOR_PORTAL_ERA192_SERVICE = VENDOR_PORTAL_ERA117_SERVICE;

export const VENDOR_PORTAL_ERA192_ROUTE = VENDOR_PORTAL_ERA117_ROUTE;

export const VENDOR_PORTAL_ERA192_MODULES = VENDOR_PORTAL_ERA117_MODULES;

export const VENDOR_PORTAL_ERA192_CYCLE_RUNBOOK_STEPS = [
  "Open Vendor Portal → Dashboard (Vendor Portal 2.0 hub).",
  "Verify three module cards — Orders, Invoices, Analytics.",
  "Open Orders inbox and review pending purchase orders.",
  "Open Invoices — verify commission balances and settlement history.",
  "Run npm run smoke:vendor-portal-era117 — canonical era117 wiring cert PASSED.",
  "Run npm run smoke:vendor-portal-era192 — artifact overall PASSED.",
] as const;

export const VENDOR_PORTAL_ERA192_CI_SCRIPTS = [
  "test:ci:vendor-portal-era192",
  "test:ci:vendor-portal-era192:cert",
] as const;

export const VENDOR_PORTAL_ERA192_UNIT_TESTS = [
  "tests/unit/vendor-portal-era192.test.ts",
  "tests/unit/vendor-portal-era117.test.ts",
  "tests/unit/vendor-portal.test.ts",
] as const;

export const VENDOR_PORTAL_ERA192_CANONICAL_POLICY_ID = VENDOR_PORTAL_ERA117_POLICY_ID;
