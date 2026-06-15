/**
 * Investor narrative one-pager v2 — Evolution Era 17 Workstream K Cycle 41.
 *
 * Template + evidence gates for founder/investor materials.
 * Does NOT publish live traction metrics without pilot-metrics-baseline proof_captured.
 */

import { PILOT_METRICS_BASELINE_ERA17_POLICY_ID } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";
import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID =
  "era17-investor-narrative-onepager-v2-v1" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_DECISION_DATE = "2026-05-28" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_EXTENDS_POLICIES = [
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
  "era7-marketing-claims-governance-v1",
] as const;

/** Template ready — live metrics narrative blocked until pilot baseline overall PASSED. */
export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_PROOF_STATUS =
  "template_only_awaiting_pilot_metrics" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_DOC =
  "docs/investor-narrative-onepager-era17.md" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-investor-narrative-onepager-era17.ts" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_SUMMARY_ARTIFACT =
  "artifacts/investor-narrative-onepager-summary.json" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_NPM_SCRIPT =
  "smoke:investor-narrative-onepager" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_PILOT_METRICS_ARTIFACT =
  "artifacts/pilot-metrics-baseline-summary.json" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "What we can claim today",
  "Metrics narrative gate",
  "Safe investor wording",
  "Forbidden claims",
  "Evidence paths",
  "Sign-off checklist",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review docs/investor-narrative-onepager-era17.md — template only until pilot metrics captured.",
  "Confirm artifacts/pilot-metrics-baseline-summary.json overall PASSED before citing KPIs externally.",
  "Run npm run smoke:investor-narrative-onepager — review artifacts/investor-narrative-onepager-summary.json.",
  "Run MARKETING_CLAIMS_STRICT=1 verify-claims before sharing with investors.",
  "Do not substitute template placeholders or partial metrics for live traction.",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_MARKERS = [
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID,
  "smoke:investor-narrative-onepager",
  "template_only_awaiting_pilot_metrics",
  "narrativeProofStatus",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_FORBIDDEN_CLAIMS = [
  "live pilot kpi without proof_captured",
  "production sso or soc2 type ii",
  "unified inventory or unified rewards",
  "rush-hour kds certification",
  "paid pilot go without gono-go artifact",
  "template traction placeholders as verified metrics",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_CI_SCRIPTS = [
  "test:ci:investor-narrative-onepager-era17",
  "test:ci:investor-narrative-onepager-era17:cert",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_UNIT_TESTS = [
  "tests/unit/investor-narrative-onepager-era17-policy.test.ts",
  "tests/unit/investor-narrative-onepager-summary.test.ts",
  "tests/unit/investor-narrative-onepager-era17-cert-live.test.ts",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_CANONICAL_DOC_PATHS = [
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_DOC,
  "docs/pilot-metrics-baseline-era17.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/competitor-feature-gap-matrix.md",
] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_REVIEW_SECTION =
  "Era 17 investor narrative one-pager v2 (2026-05-28)" as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ERA17_BACKLOG_ID = "KOS-E17-034" as const;
