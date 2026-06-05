import { expect, test } from "@playwright/test";

import {
  BETA_ENV_FOOTNOTE_HEALTH_HREF,
  BETA_ENV_FOOTNOTE_LINK_LABEL,
  BETA_ENV_FOOTNOTE_TESTID,
  INTEGRATION_HEALTH_STRIP_TESTID,
  TODAY_BETA_ENV_FOOTNOTE_E2E_POLICY_ID,
  TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL,
  TODAY_BETA_ENV_FOOTNOTE_SLI_ID,
  TODAY_PATH,
  betaEnvBadgeSumMatchesTotal,
  parseBetaEnvBadgeCounts,
  todayBetaEnvFootnoteWithinContract,
} from "@/lib/integrations/today-beta-env-footnote-e2e-policy";
import {
  summarizeTodayBetaEnvFootnoteResult,
  todayBetaEnvFootnoteSucceeded,
} from "@/lib/integrations/today-beta-env-footnote-e2e-metrics";

import { runTodayBetaEnvFootnoteFlow } from "./helpers/today-beta-env-footnote-flow";
import { skipTodayBetaEnvFootnoteIfNotAuthed } from "./helpers/today-beta-env-footnote-ready";

/**
 * Today Integration Health BETA env footnote E2E (QA-38).
 *
 * Validates DEV-53 footnote on Today command center — health strip + env readiness badges.
 *
 * @see components/dashboard/integration-health-strip.tsx
 * @see lib/integrations/pilot-integration-health-beta-env-era18.ts
 */

test.describe("today beta env footnote policy", () => {
  test("exports Today footnote contract for eighteen BETA integrations", () => {
    expect(TODAY_BETA_ENV_FOOTNOTE_E2E_POLICY_ID).toBe("today-beta-env-footnote-e2e-v1");
    expect(TODAY_BETA_ENV_FOOTNOTE_SLI_ID).toBe("integrations.today_beta_env_footnote");
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(BETA_ENV_FOOTNOTE_TESTID).toBe("pilot-integration-beta-env-footnote");
    expect(INTEGRATION_HEALTH_STRIP_TESTID).toBe("pilot-integration-health-strip");
    expect(TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL).toBe(10);
    expect(BETA_ENV_FOOTNOTE_HEALTH_HREF).toBe("/dashboard/integrations/health");
    expect(BETA_ENV_FOOTNOTE_LINK_LABEL).toBe("BETA env readiness panel");
  });

  test("parses badge counts and validates sum against total", () => {
    const text = "3 env ready\n5 no server env\n10 missing";
    const counts = parseBetaEnvBadgeCounts(text);
    expect(counts).toEqual({ ready: 3, optional: 5, missing: 10 });
    expect(betaEnvBadgeSumMatchesTotal(counts!, 18)).toBe(true);
  });

  test("evaluates Today footnote contract", () => {
    const summary = summarizeTodayBetaEnvFootnoteResult({
      healthStripVisible: true,
      footnoteVisible: true,
      readyBadgeVisible: true,
      optionalBadgeVisible: true,
      missingBadgeVisible: true,
      readinessLinkVisible: true,
      badgeSumMatchesTotal: true,
    });
    expect(todayBetaEnvFootnoteWithinContract(summary)).toBe(true);
    expect(todayBetaEnvFootnoteSucceeded(summary)).toBe(true);
  });
});

test.describe("today beta env footnote (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Today BETA env footnote runs in chromium-authed project only",
    );
    skipTodayBetaEnvFootnoteIfNotAuthed();
  });

  test("Today shows Integration Health strip with BETA env footnote without RSC failure", async ({
    page,
  }) => {
    const result = await runTodayBetaEnvFootnoteFlow(page);
    if (!result) {
      test.skip(true, "Today BETA env footnote unavailable — missing permissions.");
    }

    expect(result!.expectedTotal).toBe(TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL);
    expect(
      result!.readyCount + result!.optionalCount + result!.missingCount,
    ).toBe(TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL);
  });
});
