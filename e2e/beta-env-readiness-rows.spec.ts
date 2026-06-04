import { expect, test } from "@playwright/test";

import {
  BETA_ENV_READINESS_ROWS_E2E_POLICY_ID,
  BETA_ENV_READINESS_ROWS_EXPECTED_COUNT,
  BETA_ENV_READINESS_ROWS_SLI_ID,
  BETA_ENV_STATUS_MISSING_LABEL,
  BETA_ENV_STATUS_OPTIONAL_LABEL,
  BETA_ENV_STATUS_READY_LABEL,
  betaEnvReadinessRowTestId,
  betaEnvReadinessRowsWithinContract,
  betaEnvReadinessSummarySumMatchesTotal,
  parseBetaEnvReadinessSummaryCounts,
} from "@/lib/integrations/beta-env-readiness-rows-e2e-policy";
import {
  betaEnvReadinessRowsSucceeded,
  summarizeBetaEnvReadinessRowsResult,
} from "@/lib/integrations/beta-env-readiness-rows-e2e-metrics";

import { runBetaEnvReadinessRowsFlow } from "./helpers/beta-env-readiness-rows-flow";
import { skipBetaEnvReadinessRowsIfNotAuthed } from "./helpers/beta-env-readiness-rows-ready";

/**
 * BETA env readiness panel row contract E2E (QA-41).
 *
 * Validates DEV-50 env readiness rows — status badges, summary counts, setup links.
 *
 * @see components/integrations/beta-integration-env-readiness-panel.tsx
 */

test.describe("beta env readiness rows policy", () => {
  test("exports row contract for eighteen BETA integrations", () => {
    expect(BETA_ENV_READINESS_ROWS_E2E_POLICY_ID).toBe("beta-env-readiness-rows-e2e-v1");
    expect(BETA_ENV_READINESS_ROWS_SLI_ID).toBe("integrations.beta_env_readiness_rows");
    expect(BETA_ENV_READINESS_ROWS_EXPECTED_COUNT).toBe(18);
    expect(betaEnvReadinessRowTestId("square")).toBe("beta-env-readiness-square");
    expect(BETA_ENV_STATUS_READY_LABEL).toBe("Env ready");
    expect(BETA_ENV_STATUS_OPTIONAL_LABEL).toBe("No server env");
    expect(BETA_ENV_STATUS_MISSING_LABEL).toBe("Missing env");
  });

  test("parses summary counts and validates sum against total", () => {
    const text = "4 env ready\n6 no server env\n8 missing vars";
    const counts = parseBetaEnvReadinessSummaryCounts(text);
    expect(counts).toEqual({ ready: 4, optional: 6, missing: 8 });
    expect(betaEnvReadinessSummarySumMatchesTotal(counts!, 18)).toBe(true);
  });

  test("evaluates env readiness row contract", () => {
    const summary = summarizeBetaEnvReadinessRowsResult({
      panelVisible: true,
      rowCount: 18,
      expectedCount: 18,
      readyCount: 5,
      optionalCount: 1,
      missingCount: 12,
      allRowsHaveStatusBadge: true,
      allRowsHaveSetupLink: true,
      honestyDisclaimerVisible: true,
    });
    expect(betaEnvReadinessRowsWithinContract(summary)).toBe(true);
    expect(betaEnvReadinessRowsSucceeded(summary)).toBe(true);
  });
});

test.describe("beta env readiness rows (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "BETA env readiness rows E2E runs in chromium-authed project only",
    );
    skipBetaEnvReadinessRowsIfNotAuthed();
  });

  test("integration health shows eighteen env readiness rows with status badges without RSC failure", async ({
    page,
  }) => {
    const result = await runBetaEnvReadinessRowsFlow(page);
    if (!result) {
      test.skip(true, "BETA env readiness rows unavailable — missing permissions.");
    }

    const summary = summarizeBetaEnvReadinessRowsResult({
      panelVisible: true,
      rowCount: result!.rowCount,
      expectedCount: result!.expectedCount,
      readyCount: result!.readyCount,
      optionalCount: result!.optionalCount,
      missingCount: result!.missingCount,
      allRowsHaveStatusBadge: result!.allRowsHaveStatusBadge,
      allRowsHaveSetupLink: result!.allRowsHaveSetupLink,
      honestyDisclaimerVisible: true,
    });
    expect(betaEnvReadinessRowsWithinContract(summary)).toBe(true);
  });
});
