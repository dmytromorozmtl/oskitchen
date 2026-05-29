import { describe, expect, it } from "vitest";

import {
  buildEngineeringPathTerminusOrchestratorReportMarkdown,
  buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary,
  resolveEngineeringPathTerminusMilestone,
  resolveEngineeringPathTerminusMilestoneFromSummary,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

describe("engineering-path-terminus-post-maintenance-mode-orchestrator-era24", () => {
  it("blocks when maintenance mode is not active", () => {
    const evaluation = evaluateCommercialPilotPath({});
    const maintenanceMode = evaluateMaintenanceMode({});
    expect(maintenanceMode.maintenanceModeActive).toBe(false);
    const milestone = resolveEngineeringPathTerminusMilestone({
      maintenanceModeActive: false,
      summary: evaluation.summary,
    });
    expect(milestone).toBe("maintenance_mode_blocked");
  });

  it("resolves attention_gate_chain when first gate step blocked", () => {
    const evaluation = evaluateCommercialPilotPath({});
    const milestone = resolveEngineeringPathTerminusMilestoneFromSummary({
      maintenanceModeActive: true,
      summary: {
        ...evaluation.summary,
        engineeringTerminusActive: true,
        firstBlockedGateStep: evaluation.summary.firstBlockedGateStep,
      },
    });
    expect(milestone).toBe("attention_gate_chain");
  });

  it("resolves engineering_path_terminus_healthy when gate chain complete", () => {
    const evaluation = evaluateCommercialPilotPath({});
    const milestone = resolveEngineeringPathTerminusMilestoneFromSummary({
      maintenanceModeActive: true,
      summary: {
        ...evaluation.summary,
        engineeringTerminusActive: true,
        gateStepsComplete: true,
        firstBlockedGateStep: null,
        firstBlockedStep: null,
      },
    });
    expect(milestone).toBe("engineering_path_terminus_healthy");
  });

  it("builds orchestrator summary with Step 12 redirect when blocked", () => {
    const evaluation = evaluateCommercialPilotPath({});
    const maintenanceMode = evaluateMaintenanceMode({});
    const summary = buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary({
      evaluation,
      maintenanceMode,
      artifacts: { statusReportPresent: false },
    });
    expect(summary.milestone).toBe("maintenance_mode_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "maintenance-mode-post-product-evolution-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateCommercialPilotPath({});
    const maintenanceMode = evaluateMaintenanceMode({});
    const summary = buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary({
      evaluation,
      maintenanceMode,
      artifacts: { statusReportPresent: false },
    });
    const markdown = buildEngineeringPathTerminusOrchestratorReportMarkdown({
      summary,
      evaluation,
      steps: evaluation.steps,
    });
    expect(markdown).toContain("Engineering Path Terminus — Orchestrator Report");
    expect(markdown).toContain("#engineering-path-terminus");
  });
});
