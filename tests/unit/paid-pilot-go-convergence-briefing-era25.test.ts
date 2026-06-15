import { describe, expect, it } from "vitest";

import {
  buildPaidPilotGoConvergenceB3Tile,
  buildPaidPilotGoConvergenceBriefingAction,
} from "@/lib/briefing/paid-pilot-go-convergence-briefing-era25";
import type { PaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";

const missingArtifactState: PaidPilotGoConvergenceState = {
  artifactPresent: false,
  artifactPath: "artifacts/pilot-gono-go-summary.json",
  decision: null,
  icpQualified: false,
  loiRecorded: false,
  customerName: null,
  forbiddenClaimsPassed: false,
  blockerCount: 0,
  warningCount: 0,
  topBlocker: "artifacts/pilot-gono-go-summary.json missing",
};

describe("paid-pilot-go-convergence-briefing-era25", () => {
  it("builds B3 attention tile when artifact missing", () => {
    const tile = buildPaidPilotGoConvergenceB3Tile(missingArtifactState);
    expect(tile.headline).toContain("artifact missing");
    expect(tile.tone).toBe("attention");
    expect(tile.href).toContain("#era25-paid-pilot-go-convergence");
  });

  it("builds ranked briefing action when not GO", () => {
    const action = buildPaidPilotGoConvergenceBriefingAction(missingArtifactState);
    expect(action).not.toBeNull();
    expect(action?.severity).toBe("critical");
    expect(action?.ctaLabel).toBe("Open GO convergence");
  });

  it("returns null briefing action when GO", () => {
    const action = buildPaidPilotGoConvergenceBriefingAction({
      ...missingArtifactState,
      artifactPresent: true,
      decision: "GO",
      icpQualified: true,
      loiRecorded: true,
      forbiddenClaimsPassed: true,
    });
    expect(action).toBeNull();
  });
});
