import { describe, expect, it } from "vitest";

import {
  buildPureOperationalModeTerminusEra25UiSlice,
  shouldSuppressEra21CommercialPilotGatePanels,
  shouldSuppressEra25ProductConvergenceSurfaces,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { resolvePureOperationalModeTerminusEra25Milestone } from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import type { ContinuousImprovementLoopTrackStatus } from "@/lib/commercial/continuous-improvement-loop-phases-era22";

const freshTracks = [
  { id: "weekly_integration", label: "Weekly", status: "healthy" },
  { id: "monthly_metrics", label: "Monthly", status: "healthy" },
  { id: "quarterly_governance", label: "Quarterly", status: "healthy" },
] as const satisfies readonly ContinuousImprovementLoopTrackStatus[];

describe("pure-operational-mode-terminus-era25-gate-suppression", () => {
  it("activates suppression only at pure_operational_mode_era25_active", () => {
    const blockedMilestone = resolvePureOperationalModeTerminusEra25Milestone({
      sustainedOperationalExcellenceConvergenceEra25Milestone:
        "sustained_operational_excellence_convergence_era25_ready",
      sustainedOpsConvergenceReady: true,
      tracks: [
        { id: "weekly_integration", label: "Weekly", status: "overdue" },
        { id: "monthly_metrics", label: "Monthly", status: "healthy" },
        { id: "quarterly_governance", label: "Quarterly", status: "healthy" },
      ],
    });
    expect(blockedMilestone).not.toBe("pure_operational_mode_era25_active");
    expect(
      shouldSuppressEra25ProductConvergenceSurfaces({
        pureOperationalModeEra25Active: blockedMilestone === "pure_operational_mode_era25_active",
      }),
    ).toBe(false);

    const activeMilestone = resolvePureOperationalModeTerminusEra25Milestone({
      sustainedOperationalExcellenceConvergenceEra25Milestone:
        "sustained_operational_excellence_convergence_era25_ready",
      sustainedOpsConvergenceReady: true,
      tracks: freshTracks,
    });
    expect(activeMilestone).toBe("pure_operational_mode_era25_active");
    expect(
      shouldSuppressEra25ProductConvergenceSurfaces({
        pureOperationalModeEra25Active: activeMilestone === "pure_operational_mode_era25_active",
      }),
    ).toBe(true);
  });

  it("suppresses era21 commercial gate panels when terminus active", () => {
    expect(
      shouldSuppressEra21CommercialPilotGatePanels({ pureOperationalModeEra25Active: true }),
    ).toBe(true);
    expect(
      shouldSuppressEra21CommercialPilotGatePanels({ pureOperationalModeEra25Active: false }),
    ).toBe(false);
  });

  it("exposes pureOperationalModeEra25Active on UI slice from evaluation", () => {
    const slice = buildPureOperationalModeTerminusEra25UiSlice({
      sustainedOpsConvergenceVisible: true,
    });
    expect(slice).not.toBeNull();
    expect(typeof slice?.pureOperationalModeEra25Active).toBe("boolean");
  });
});
