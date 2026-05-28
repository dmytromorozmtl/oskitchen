/**
 * KDS qualified sales one-pager — Evolution Era 17 Workstream F Cycle 28.
 *
 * Sales-safe KDS pilot wording + operator evidence paths.
 * Does NOT claim rush-hour KDS, default-CI Playwright, or Toast-class kitchen orchestration.
 */

import { KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID } from "@/lib/kitchen/kds-staging-playwright-proof-era17-policy";
import { KDS_STAGING_SMOKE_ERA15_POLICY_ID } from "@/lib/kitchen/kds-staging-smoke-era15-policy";
import { OPERATIONAL_SIGNOFF_ERA16_POLICY_ID } from "@/lib/operations/operational-signoff-era16-policy";

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID =
  "era17-kds-qualified-sales-onepager-v1" as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DECISION_DATE = "2026-05-28" as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_EXTENDS_POLICIES = [
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  "era4-kds-staging-smoke-v1",
] as const;

/** Sales one-pager wired — GitHub Playwright proof remains ops-blocked separately. */
export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_STATUS = "sales_onepager_ready" as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DOC =
  "docs/kds-qualified-sales-onepager-era17.md" as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "What KDS v1 includes",
  "What is not included",
  "Safe sales wording",
  "Evidence paths for pilots",
  "Forbidden pilot claims",
  "Support boundaries",
  "Sign-off checklist",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_SAFE_SALES_PHRASES = [
  "Daily-service KDS queue with bump and recall — qualified pilot path",
  "Staging smoke + operator checklist — not rush-hour certified",
  "Supabase Realtime with polling fallback — staging Playwright optional",
  "kitchen.view / kitchen.bump / kitchen.recall RBAC — existing permission model",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_EVIDENCE_COMMANDS = [
  "npm run test:ci:kds-staging-smoke:cert",
  "npm run smoke:kds-staging",
  "npm run smoke:kds-staging-playwright",
  "npm run smoke:operational-signoff-era16",
  "npm run smoke:operational-signoff-staging",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_MARKERS = [
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID,
  "kds-qualified-sales-onepager",
  "sales_onepager_ready",
  "not rush-hour certified",
  "qualified pilot path",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_FORBIDDEN_CLAIMS = [
  "rush-hour kds certification",
  "toast-class kitchen orchestration",
  "default ci playwright kds",
  "production realtime slo",
  "item-level bumping at scale",
  "station routing engine",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CI_SCRIPTS = [
  "test:ci:kds-qualified-sales-onepager-era17",
  "test:ci:kds-qualified-sales-onepager-era17:cert",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_UNIT_TESTS = [
  "tests/unit/kds-qualified-sales-onepager-era17-policy.test.ts",
  "tests/unit/kds-qualified-sales-onepager-era17-cert-live.test.ts",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_CANONICAL_DOC_PATHS = [
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_DOC,
  "docs/kds-v1-scope.md",
  "docs/kds-staging-smoke-checklist.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/enterprise-procurement-pack.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_REVIEW_SECTION =
  "Era 17 KDS qualified sales one-pager (2026-05-28)" as const;

export const KDS_QUALIFIED_SALES_ONEPAGER_ERA17_BACKLOG_ID = "KOS-E17-027" as const;
