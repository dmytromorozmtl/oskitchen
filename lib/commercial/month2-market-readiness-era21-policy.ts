/**
 * Month 2 market readiness — Era 21 Step 5 product + CLI wiring.
 */

import { MONTH2_MARKET_READINESS_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/month2-market-readiness-phases-era21";
import { MONTH2_MARKET_READINESS_UI_ERA21_POLICY_ID } from "@/lib/commercial/month2-market-readiness-ui-era21";

export const MONTH2_MARKET_READINESS_ERA21_POLICY_ID = "era21-month2-market-readiness-v1" as const;

export const MONTH2_MARKET_READINESS_ERA21_BACKLOG_ID = "KOS-E21-005" as const;

export const MONTH2_MARKET_READINESS_ERA21_EXTENDS_POLICIES = [
  "era17-investor-narrative-onepager-v2-v1",
  "era17-pilot-case-study-draft-v1",
  MONTH2_MARKET_READINESS_PHASES_ERA21_POLICY_ID,
  MONTH2_MARKET_READINESS_UI_ERA21_POLICY_ID,
] as const;

export const MONTH2_MARKET_READINESS_ERA21_OPS_SCRIPTS = [
  "ops:validate-month2-market-readiness-env",
  "ops:export-month2-market-readiness-env-template",
  "ops:sync-month2-market-readiness-progress-report",
] as const;

export const MONTH2_MARKET_READINESS_ERA21_CI_SCRIPTS = [
  "test:ci:month2-market-readiness-era21",
  "test:ci:month2-market-readiness-era21:cert",
] as const;

export const MONTH2_MARKET_READINESS_ERA21_UNIT_TESTS = [
  "tests/unit/month2-market-readiness-phases-era21.test.ts",
  "tests/unit/month2-market-readiness-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-month2-market-readiness-era21.test.ts",
  "tests/unit/month2-market-readiness-era21-cert-live.test.ts",
] as const;

export const MONTH2_MARKET_READINESS_ERA21_PRODUCT_SURFACES = [
  "components/dashboard/month2-market-readiness-phases-panel.tsx",
  "components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
