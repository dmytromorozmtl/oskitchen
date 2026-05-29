import { describe, expect, it } from "vitest";

import {
  allBreakthroughBriefingTilesWired,
  buildOwnerDailyBriefingBreakthroughEra25Tiles,
} from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";

describe("owner-daily-briefing-breakthrough-era25-briefing", () => {
  it("builds B0–B4 tiles", () => {
    const tiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
      blueprintMilestone: "engineering_gates_blocked",
      gatesMilestone: "charter_readiness_blocked",
      blueprintBlocked: true,
      p0ProofStatus: "awaiting_ops_credentials",
      briefingSchemeCount: 5,
    });
    expect(tiles).toHaveLength(5);
    expect(tiles.map((tile) => tile.schemeId)).toEqual(["B0", "B1", "B2", "B3", "B4"]);
  });

  it("marks all tiles wired with default inputs", () => {
    const tiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
      blueprintMilestone: "era25_first_product_slice_blueprint_ready",
      gatesMilestone: "era25_engineering_gates_open",
      blueprintBlocked: false,
      p0ProofStatus: "proof_passed",
      briefingSchemeCount: 5,
    });
    expect(allBreakthroughBriefingTilesWired(tiles)).toBe(true);
  });

  it("links B2 to integration recovery", () => {
    const tiles = buildOwnerDailyBriefingBreakthroughEra25Tiles({
      blueprintMilestone: "engineering_gates_blocked",
      gatesMilestone: "charter_readiness_blocked",
      blueprintBlocked: true,
      p0ProofStatus: "awaiting_ops_credentials",
      briefingSchemeCount: 5,
    });
    const b2 = tiles.find((tile) => tile.schemeId === "B2");
    expect(b2?.href).toContain("integration-recovery-checklist");
  });
});
