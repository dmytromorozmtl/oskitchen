/**
 * era25 Owner Daily Briefing Breakthrough — product slice policy.
 */
import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID } from "@/lib/commercial/era25-first-product-slice-blueprint-era24-policy";

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID =
  "era25-owner-daily-briefing-breakthrough-v1" as const;

export { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC };

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_EXTENDS_POLICIES = [
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PHASES_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UI_POLICY_ID,
  "era25-owner-daily-briefing-breakthrough-post-gates-orchestrator-v1",
  "era25-owner-daily-briefing-breakthrough-briefing-v1",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_OPS_SCRIPTS = [
  "ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25",
  "ops:validate-owner-daily-briefing-breakthrough-era25",
  "ops:sync-owner-daily-briefing-breakthrough-era25-report",
  "ops:validate-era25-first-product-slice-blueprint",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_CI_SCRIPTS = [
  "test:ci:owner-daily-briefing-breakthrough-era25",
  "test:ci:owner-daily-briefing-breakthrough-era25:cert",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UNIT_TESTS = [
  "tests/unit/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25.test.ts",
  "tests/unit/owner-daily-briefing-breakthrough-phases-era25.test.ts",
  "tests/unit/owner-daily-briefing-breakthrough-ui-era25.test.ts",
  "tests/unit/owner-daily-briefing-breakthrough-era25-briefing.test.ts",
  "tests/unit/run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25.test.ts",
  "tests/unit/validate-owner-daily-briefing-breakthrough-era25.test.ts",
  "tests/unit/evaluate-owner-daily-briefing-breakthrough-era25.test.ts",
  "tests/unit/owner-daily-briefing-breakthrough-era25-cert-live.test.ts",
] as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PRODUCT_SURFACES = [
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/dashboard/owner-daily-briefing-breakthrough-era25-panel.tsx",
  "app/dashboard/today/page.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
