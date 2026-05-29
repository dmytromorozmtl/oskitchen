import { describe, expect, it } from "vitest";

import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS,
  detectMonth2MarketReadinessConvergenceEra25Started,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";

describe("month2-market-readiness-convergence-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-month2-market-readiness-convergence-phases-v1",
    );
  });

  it("defines platform anchor", () => {
    expect(MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-month2-market-readiness-convergence",
    );
  });

  it("documents convergence slice doc", () => {
    expect(MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC).toContain(
      "month2-market-readiness-convergence",
    );
  });

  it("tracks era25 month 2 convergence attestation env keys", () => {
    expect(MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_TRACKED_ENV_KEYS).toContain(
      "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED",
    );
    expect(
      detectMonth2MarketReadinessConvergenceEra25Started({
        MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED: "1",
      }),
    ).toBe(true);
  });
});
