/**
 * Era 126 — Data Export & Portability wiring cert (Phase 7 #53).
 *
 * Full path: CSV domains → JSON manifest → GDPR-ready portability index.
 */

import {
  DATA_EXPORT_PATH,
  DATA_EXPORT_POLICY_ID,
  DATA_EXPORT_SERVICE,
} from "@/lib/data/export-policy";

export const DATA_EXPORT_ERA126_POLICY_ID = "era126-data-export-portability-v1" as const;

export const DATA_EXPORT_ERA126_SUMMARY_ARTIFACT =
  "artifacts/data-export-smoke-summary.json" as const;

export const DATA_EXPORT_ERA126_NPM_SCRIPT = "smoke:data-export-era126" as const;

export const DATA_EXPORT_ERA126_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-data-export-era126.ts" as const;

export const DATA_EXPORT_ERA126_OPS_DOC = "docs/data-export-era126-setup.md" as const;

export const DATA_EXPORT_ERA126_WIRING_PATHS = [
  DATA_EXPORT_SERVICE,
  "lib/data/export-builders.ts",
  "lib/data/export-policy.ts",
  "app/dashboard/data/export/page.tsx",
  "components/data/data-export-panel.tsx",
  "app/api/data/portability-manifest/route.ts",
] as const;

export const DATA_EXPORT_ERA126_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Data → Export & Portability.",
  "Review summary — export lanes, domains, portable rows, JSON manifest.",
  "Inspect domain lanes — operations, catalog, purchasing, integrations, compliance.",
  "Download CSV per domain or JSON portability manifest.",
  "Run npm run smoke:data-export-era126 — artifact overall PASSED.",
] as const;

export const DATA_EXPORT_ERA126_CI_SCRIPTS = [
  "test:ci:data-export-era126",
  "test:ci:data-export-era126:cert",
] as const;

export const DATA_EXPORT_ERA126_UNIT_TESTS = [
  "tests/unit/data-export-era126.test.ts",
  "tests/unit/data-export.test.ts",
] as const;

export const DATA_EXPORT_ERA126_CANONICAL_POLICY_ID = DATA_EXPORT_POLICY_ID;

export const DATA_EXPORT_ERA126_SERVICE = DATA_EXPORT_SERVICE;

export const DATA_EXPORT_ERA126_ROUTE = DATA_EXPORT_PATH;

export const DATA_EXPORT_ERA126_LANES = [
  "operations",
  "catalog",
  "purchasing",
  "integrations",
  "compliance",
] as const;

export const DATA_EXPORT_ERA126_FORMATS = ["csv", "json-manifest"] as const;
