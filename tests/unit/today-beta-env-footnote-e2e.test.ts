import { describe, expect, it } from "vitest";

import {
  TODAY_BETA_ENV_FOOTNOTE_E2E_POLICY_ID,
  TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL,
  betaEnvBadgeSumMatchesTotal,
  parseBetaEnvBadgeCounts,
  todayBetaEnvFootnoteWithinContract,
} from "@/lib/integrations/today-beta-env-footnote-e2e-policy";
import { todayBetaEnvFootnoteSucceeded } from "@/lib/integrations/today-beta-env-footnote-e2e-metrics";

describe("today beta env footnote E2E policy (QA-38)", () => {
  it("locks Today footnote e2e policy id and expected BETA count", () => {
    expect(TODAY_BETA_ENV_FOOTNOTE_E2E_POLICY_ID).toBe("today-beta-env-footnote-e2e-v1");
    expect(TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL).toBe(10);
  });

  it("parses env readiness badge counts from footnote text", () => {
    const counts = parseBetaEnvBadgeCounts("2 env ready\n1 no server env\n15 missing");
    expect(counts).toEqual({ ready: 2, optional: 1, missing: 15 });
    expect(betaEnvBadgeSumMatchesTotal(counts!, 18)).toBe(true);
  });

  it("requires health strip, footnote, and badge sum contract", () => {
    const ok = {
      healthStripVisible: true,
      footnoteVisible: true,
      readyBadgeVisible: true,
      optionalBadgeVisible: true,
      missingBadgeVisible: true,
      readinessLinkVisible: true,
      badgeSumMatchesTotal: true,
    };
    expect(todayBetaEnvFootnoteWithinContract(ok)).toBe(true);
    expect(todayBetaEnvFootnoteSucceeded(ok)).toBe(true);

    const missingFootnote = { ...ok, footnoteVisible: false };
    expect(todayBetaEnvFootnoteWithinContract(missingFootnote)).toBe(false);
  });
});
