import { describe, expect, it } from "vitest";

import {
  buildMaintenanceModeOrchestratorReportMarkdown,
  buildMaintenanceModePostProductEvolutionOrchestratorSummary,
  resolveMaintenanceModeMilestone,
  resolveMaintenanceModeMilestoneFromRhythmStatuses,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import { buildMaintenanceModeRhythmStatuses } from "@/lib/commercial/maintenance-mode-phases-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

describe("maintenance-mode-post-product-evolution-orchestrator-era24", () => {
  it("blocks when product evolution is not ready", () => {
    const evaluation = evaluateMaintenanceMode({});
    expect(evaluation.maintenanceModeMilestone).toBe("product_evolution_blocked");
    expect(evaluation.maintenanceModeActive).toBe(false);
  });

  it("resolves maintenance_mode_healthy when measurable rhythms are fresh", () => {
    const rhythms = buildMaintenanceModeRhythmStatuses({
      improvementLoopOverdue: 0,
      improvementLoopDueSoon: 0,
      productEvolutionOverdue: 0,
      productEvolutionDueSoon: 0,
      metricsBaseline: {
        overall: "PASSED",
        runAt: new Date().toISOString(),
        capturedAt: new Date().toISOString(),
      } as never,
      p0Staging: {
        children: { channelLive: { overall: "PASSED" } },
        runAt: new Date().toISOString(),
      } as never,
      customerName: "Acme",
    });
    const milestone = resolveMaintenanceModeMilestone({
      maintenanceModeActive: true,
      productEvolutionReady: true,
      rhythms,
    });
    expect(milestone).toBe("maintenance_mode_healthy");
  });

  it("resolves attention_weekly_rhythm when Wed integration is overdue", () => {
    const milestone = resolveMaintenanceModeMilestoneFromRhythmStatuses(
      [{ id: "weekly_wed_integration_health", status: "overdue" }],
      { maintenanceModeActive: true, productEvolutionReady: true },
    );
    expect(milestone).toBe("attention_weekly_rhythm");
  });

  it("resolves attention_monthly_cadence when W1 metrics baseline is due soon", () => {
    const milestone = resolveMaintenanceModeMilestoneFromRhythmStatuses(
      [{ id: "monthly_w1_metrics_baseline", status: "due_soon" }],
      { maintenanceModeActive: true, productEvolutionReady: true },
    );
    expect(milestone).toBe("attention_monthly_cadence");
  });

  it("builds orchestrator summary with Step 11 redirect when blocked", () => {
    const evaluation = evaluateMaintenanceMode({});
    const summary = buildMaintenanceModePostProductEvolutionOrchestratorSummary({
      evaluation,
      artifacts: {
        playbookReportPresent: false,
        rhythmCalendarDocPresent: true,
      },
    });
    expect(summary.milestone).toBe("product_evolution_blocked");
    expect(summary.recommendedCommands[0]).toContain(
      "sustained-product-evolution-post-improvement-loop-orchestrator",
    );
  });

  it("builds orchestrator report markdown", () => {
    const evaluation = evaluateMaintenanceMode({});
    const summary = buildMaintenanceModePostProductEvolutionOrchestratorSummary({
      evaluation,
      artifacts: {
        playbookReportPresent: false,
        rhythmCalendarDocPresent: true,
      },
    });
    const markdown = buildMaintenanceModeOrchestratorReportMarkdown({
      summary,
      evaluation,
    });
    expect(markdown).toContain("Maintenance Mode — Orchestrator Report");
    expect(markdown).toContain("#maintenance-mode");
  });
});
