/**
 * Today Integration Health BETA env footnote E2E policy (QA-38).
 *
 * Validates DEV-53 footnote on `/dashboard/today` — health strip + env readiness counts.
 *
 * @see e2e/today-beta-env-footnote.spec.ts
 * @see components/dashboard/integration-health-strip.tsx
 */

import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import { TODAY_HEADING_PATTERN, TODAY_PATH } from "@/lib/onboarding/signup-quick-start-today-e2e-policy";

export const TODAY_BETA_ENV_FOOTNOTE_E2E_POLICY_ID =
  "today-beta-env-footnote-e2e-v1" as const;

export const TODAY_BETA_ENV_FOOTNOTE_SLI_ID =
  "integrations.today_beta_env_footnote" as const;

export { TODAY_PATH, TODAY_HEADING_PATTERN };

export const INTEGRATION_HEALTH_STRIP_TESTID = "pilot-integration-health-strip" as const;
export const BETA_ENV_FOOTNOTE_TESTID = "pilot-integration-beta-env-footnote" as const;

export const BETA_ENV_FOOTNOTE_LINK_LABEL = "BETA env readiness panel" as const;
export const BETA_ENV_FOOTNOTE_HEALTH_HREF = "/dashboard/integrations/health" as const;

export const TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT;

export const TODAY_BETA_ENV_FOOTNOTE_VISIBLE_MS = 30_000 as const;

export type TodayBetaEnvFootnoteContract = {
  healthStripVisible: boolean;
  footnoteVisible: boolean;
  readyBadgeVisible: boolean;
  optionalBadgeVisible: boolean;
  missingBadgeVisible: boolean;
  readinessLinkVisible: boolean;
  badgeSumMatchesTotal: boolean;
};

export function todayBetaEnvFootnoteWithinContract(
  input: TodayBetaEnvFootnoteContract,
): boolean {
  return (
    input.healthStripVisible &&
    input.footnoteVisible &&
    input.readyBadgeVisible &&
    input.optionalBadgeVisible &&
    input.missingBadgeVisible &&
    input.readinessLinkVisible &&
    input.badgeSumMatchesTotal
  );
}

export function parseBetaEnvBadgeCounts(text: string): {
  ready: number;
  optional: number;
  missing: number;
} | null {
  const ready = text.match(/(\d+)\s+env ready/i);
  const optional = text.match(/(\d+)\s+no server env/i);
  const missing = text.match(/(\d+)\s+missing/i);
  if (!ready || !optional || !missing) return null;
  return {
    ready: Number(ready[1]),
    optional: Number(optional[1]),
    missing: Number(missing[1]),
  };
}

export function betaEnvBadgeSumMatchesTotal(
  counts: { ready: number; optional: number; missing: number },
  expectedTotal: number = TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL,
): boolean {
  return counts.ready + counts.optional + counts.missing === expectedTotal;
}
