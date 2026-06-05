import { describe, expect, it } from "vitest";

import {
  BETA_ENV_READINESS_ROWS_E2E_POLICY_ID,
  BETA_ENV_READINESS_ROWS_EXPECTED_COUNT,
  betaEnvReadinessRowsWithinContract,
  betaEnvReadinessSummarySumMatchesTotal,
  parseBetaEnvReadinessSummaryCounts,
} from "@/lib/integrations/beta-env-readiness-rows-e2e-policy";
import { betaEnvReadinessRowsSucceeded } from "@/lib/integrations/beta-env-readiness-rows-e2e-metrics";

describe("beta env readiness rows E2E policy (QA-41)", () => {
  it("locks env readiness rows e2e policy id and expected count", () => {
    expect(BETA_ENV_READINESS_ROWS_E2E_POLICY_ID).toBe("beta-env-readiness-rows-e2e-v1");
    expect(BETA_ENV_READINESS_ROWS_EXPECTED_COUNT).toBe(10);
  });

  it("parses header summary counts from panel text", () => {
    const counts = parseBetaEnvReadinessSummaryCounts("3 env ready · 2 no server env · 13 missing vars");
    expect(counts).toEqual({ ready: 3, optional: 2, missing: 13 });
    expect(betaEnvReadinessSummarySumMatchesTotal(counts!, 18)).toBe(true);
  });

  it("requires eighteen rows with status badges and honesty disclaimer", () => {
    const ok = {
      panelVisible: true,
      rowCount: 18,
      expectedCount: 18,
      readyCount: 2,
      optionalCount: 1,
      missingCount: 15,
      allRowsHaveStatusBadge: true,
      allRowsHaveSetupLink: true,
      honestyDisclaimerVisible: true,
    };
    expect(betaEnvReadinessRowsWithinContract(ok)).toBe(true);
    expect(betaEnvReadinessRowsSucceeded(ok)).toBe(true);

    const missingBadge = { ...ok, allRowsHaveStatusBadge: false };
    expect(betaEnvReadinessRowsWithinContract(missingBadge)).toBe(false);
  });
});
