import { describe, expect, it } from "vitest";

import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";

describe("series-a-partner-expansion-convergence-phases-era25", () => {
  it("locks phases policy id", () => {
    expect(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-series-a-partner-expansion-convergence-phases-v1",
    );
  });

  it("defines platform anchor", () => {
    expect(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-series-a-partner-expansion-convergence",
    );
  });

  it("documents convergence slice doc", () => {
    expect(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC).toContain(
      "series-a-partner-expansion-convergence",
    );
  });
});
