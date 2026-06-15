import { describe, expect, it } from "vitest";

import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PHASES_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";

describe("market-leader-positioning-convergence-phases-era25", () => {
  it("locks policy id and backlog", () => {
    expect(MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PHASES_POLICY_ID).toBe(
      "era25-market-leader-positioning-convergence-phases-v1",
    );
    expect(MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_BACKLOG_ID).toBe(
      "KOS-E25-007-MARKET-LEADER",
    );
    expect(MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR).toBe(
      "#era25-market-leader-positioning-convergence",
    );
  });
});
