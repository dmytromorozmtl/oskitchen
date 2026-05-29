import { describe, expect, it } from "vitest";

import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PHASES_POLICY_ID,
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
});
