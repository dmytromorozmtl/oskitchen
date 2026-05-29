import { describe, expect, it } from "vitest";

import {
  ENGINEERING_PATH_TERMINUS_BLOCKED_MILESTONES,
  resolveEngineeringPathTerminusMilestone,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";

describe("engineering-path-terminus-era25-integration", () => {
  it("orders milestones with era25 gate before maintenance and product evolution", () => {
    const maintenanceMode = {
      maintenanceModeActive: false,
      prerequisites: {
        sustainedOpsConvergenceReady: false,
        pureOperationalModeEra25Active: false,
        productEvolutionReady: false,
      },
      maintenanceModeMilestone: "era25_sustained_ops_convergence_blocked" as const,
    } as ReturnType<
      typeof import("@/scripts/ops/validate-maintenance-mode").evaluateMaintenanceMode
    >;

    expect(
      resolveEngineeringPathTerminusMilestone({
        maintenanceMode,
        summary: {
          engineeringTerminusActive: false,
          firstBlockedStep: null,
          firstBlockedGateStep: null,
        },
      }),
    ).toBe("era25_sustained_ops_convergence_blocked");
  });

  it("includes era25 fields in commercial pilot path validate JSON", () => {
    const result = evaluateCommercialPilotPathWithMilestones({});
    expect(result.maintenanceMode.prerequisites).toHaveProperty("sustainedOpsConvergenceReady");
    expect(result.maintenanceMode.prerequisites).toHaveProperty("pureOperationalModeEra25Active");
    expect(ENGINEERING_PATH_TERMINUS_BLOCKED_MILESTONES).toContain(
      result.engineeringPathTerminusMilestone,
    );
  });
});
