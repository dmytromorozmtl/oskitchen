/**
 * Tier 2 golden path — Era 21 product + CLI wiring (post-P0 execution).
 */

import { TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { TIER2_GOLDEN_PATH_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { TIER2_GOLDEN_PATH_UI_ERA21_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";

export const TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID = "era21-tier2-golden-path-v1" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_BACKLOG_ID = "KOS-E21-002" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_EXTENDS_POLICIES = [
  TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID,
  TIER2_GOLDEN_PATH_PHASES_ERA21_POLICY_ID,
  TIER2_GOLDEN_PATH_UI_ERA21_POLICY_ID,
  "era21-tier2-golden-path-post-p0-orchestrator-v1",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC =
  "docs/next-step-2-after-p0-pass-2026-05-28.md" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_PHASE_B_DOC =
  "docs/next-step-tier2-golden-path-phase-b-product-2026-05-28.md" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_OPS_SCRIPTS = [
  "ops:run-tier2-golden-path-post-p0-orchestrator",
  "ops:validate-tier2-golden-path-env",
  "ops:validate-tier2-staging-golden-path-integrity",
  "ops:sync-tier2-staging-golden-path-integrity-baseline",
  "ops:export-tier2-golden-path-env-template",
  "ops:export-tier2-golden-path-readiness-checklist",
  "ops:sync-tier2-golden-path-progress-report",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_CI_SCRIPTS = [
  "test:ci:tier2-golden-path-era21",
  "test:ci:tier2-golden-path-era21:cert",
  "test:ci:tier2-staging-golden-path-integrity-era28",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_UNIT_TESTS = [
  "tests/unit/tier2-golden-path-post-p0-orchestrator-era21.test.ts",
  "tests/unit/tier2-staging-golden-path-era20.test.ts",
  "tests/unit/tier2-golden-path-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-tier2-golden-path-era21.test.ts",
  "tests/unit/tier2-staging-golden-path-phases-era21.test.ts",
  "tests/unit/run-tier2-golden-path-post-p0-orchestrator.test.ts",
  "tests/unit/tier2-golden-path-era21-cert-live.test.ts",
  "tests/unit/tier2-staging-golden-path-integrity-era28.test.ts",
  "tests/unit/validate-tier2-staging-golden-path-integrity.test.ts",
  "tests/unit/tier2-staging-golden-path-integrity-era28-cert-live.test.ts",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/tier2-golden-path-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-tier2-status-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
