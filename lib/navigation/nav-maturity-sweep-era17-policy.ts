/**
 * Nav maturity sweep — Evolution Era 17 Workstream H Cycle 32.
 *
 * Classifies Era 17 preview routes and re-validates focused nav honesty.
 * Does NOT promote preview surfaces to live or hide beta badges.
 */

import { NAV_PAGE_MATURITY_ERA14_POLICY_ID } from "@/lib/navigation/nav-page-maturity-era14-policy";
import { PAGE_MATURITY_SWEEP_POLICY_ID } from "@/lib/navigation/page-maturity-sweep-policy";

export const NAV_MATURITY_SWEEP_ERA17_POLICY_ID = "era17-nav-maturity-sweep-v1" as const;

export const NAV_MATURITY_SWEEP_ERA17_DECISION_DATE = "2026-05-28" as const;

export const NAV_MATURITY_SWEEP_ERA17_EXTENDS_POLICIES = [
  PAGE_MATURITY_SWEEP_POLICY_ID,
  NAV_PAGE_MATURITY_ERA14_POLICY_ID,
] as const;

export const NAV_MATURITY_SWEEP_ERA17_PROOF_STATUS = "nav_maturity_sweep_recertified" as const;

/** Preview routes classified in Era 17 sweep — must exist in NAV_MATURITY_RULES. */
export const NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES = [
  "/dashboard/settings/security/sso",
  "/dashboard/inventory/pos-impacts",
  "/dashboard/costing/theft",
  "/dashboard/marketing/holiday-packages",
  "/dashboard/integrations/7shifts",
] as const;

export const NAV_MATURITY_SWEEP_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-nav-maturity-sweep-era17.ts" as const;

export const NAV_MATURITY_SWEEP_ERA17_SUMMARY_ARTIFACT =
  "artifacts/nav-maturity-sweep-era17-summary.json" as const;

export const NAV_MATURITY_SWEEP_ERA17_NPM_SCRIPT = "smoke:nav-maturity-sweep-era17" as const;

export const NAV_MATURITY_SWEEP_ERA17_CANONICAL_MARKERS = [
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  "smoke:nav-maturity-sweep-era17",
  "nav_maturity_sweep_recertified",
  "page-maturity-honesty",
  "findNavPageMaturityHonestyGaps",
] as const;

export const NAV_MATURITY_SWEEP_ERA17_CI_SCRIPTS = [
  "test:ci:nav-maturity-sweep-era17",
  "test:ci:nav-maturity-sweep-era17:cert",
] as const;

export const NAV_MATURITY_SWEEP_ERA17_UNIT_TESTS = [
  "tests/unit/page-maturity-honesty.test.ts",
  "tests/unit/nav-page-maturity-era14-policy.test.ts",
  "tests/unit/nav-maturity-sweep-era17-policy.test.ts",
  "tests/unit/nav-maturity-sweep-era17-audit.test.ts",
  "tests/unit/nav-maturity-sweep-era17-cert-live.test.ts",
] as const;

export const NAV_MATURITY_SWEEP_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/canonical-doc-index.md",
] as const;

export const NAV_MATURITY_SWEEP_ERA17_REVIEW_SECTION =
  "Era 17 nav maturity sweep (2026-05-28)" as const;

export const NAV_MATURITY_SWEEP_ERA17_BACKLOG_ID = "KOS-E17-031" as const;
