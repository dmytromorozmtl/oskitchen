import { describe, expect, it } from "vitest";

import {
  resolveMaintenanceModeMilestone,
  resolveMaintenanceModeMilestoneFromRhythmStatuses,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import { resolveMaintenanceModePrerequisites } from "@/lib/commercial/maintenance-mode-phases-era24";
import { resolveEra25PureOperationalModeContext } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

describe("maintenance-mode-era25-integration", () => {
  it("exposes era25 context from terminus env chain", () => {
    const era25 = resolveEra25PureOperationalModeContext({});
    expect(typeof era25.sustainedOpsConvergenceReady).toBe("boolean");
    expect(typeof era25.pureOperationalModeEra25Active).toBe("boolean");
    expect(era25.platformOpsHref).toContain("#era25-pure-operational-mode-terminus");
  });

  it("orders milestones with era25 sustained ops gate before product evolution", () => {
    expect(
      resolveMaintenanceModeMilestone({
        maintenanceModeActive: false,
        productEvolutionReady: false,
        sustainedOpsConvergenceReady: false,
        rhythms: [],
      }),
    ).toBe("era25_sustained_ops_convergence_blocked");

    expect(
      resolveMaintenanceModeMilestone({
        maintenanceModeActive: false,
        productEvolutionReady: false,
        sustainedOpsConvergenceReady: true,
        rhythms: [],
      }),
    ).toBe("product_evolution_blocked");
  });

  it("includes era25 fields in validate JSON evaluation", () => {
    const result = evaluateMaintenanceMode({});
    expect(result.prerequisites).toHaveProperty("sustainedOpsConvergenceReady");
    expect(result.prerequisites).toHaveProperty("pureOperationalModeEra25Active");
    expect(result.maintenanceModeMilestone).toBe("era25_sustained_ops_convergence_blocked");
  });

  it("resolves rhythm milestone when era25 sustained ops ready", () => {
    const milestone = resolveMaintenanceModeMilestoneFromRhythmStatuses(
      [{ id: "weekly_wed_integration_health", status: "overdue" }],
      {
        maintenanceModeActive: true,
        productEvolutionReady: true,
        sustainedOpsConvergenceReady: true,
      },
    );
    expect(milestone).toBe("attention_weekly_rhythm");
  });
});
