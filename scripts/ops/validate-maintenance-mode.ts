#!/usr/bin/env npx tsx
import { resolveMaintenanceModeMilestone } from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import {
  buildMaintenanceModeRhythmStatuses,
  resolveMaintenanceModeHealthSummary,
  resolveMaintenanceModePrerequisites,
  resolveProductEvolutionReady,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export function evaluateMaintenanceMode(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveMaintenanceModePrerequisites>;
  goDecision: string | null;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
  improvementLoop: ReturnType<typeof evaluateContinuousImprovementLoop>;
  productEvolution: ReturnType<typeof evaluateSustainedProductEvolution>;
  rhythms: ReturnType<typeof buildMaintenanceModeRhythmStatuses>;
  health: ReturnType<typeof resolveMaintenanceModeHealthSummary>;
  readyForWeeklyRhythmSmokes: boolean;
  readyForMonthlyCadenceSmokes: boolean;
  maintenanceModeMilestone: ReturnType<typeof resolveMaintenanceModeMilestone>;
} {
  const artifacts = readContinuousImprovementLoopArtifacts();
  const goDecision = artifacts.goNoGoSummary?.decision ?? null;
  const productEvolutionReady = resolveProductEvolutionReady({
    goNoGoSummary: artifacts.goNoGoSummary,
    p0Staging: artifacts.p0Staging,
    tier2Summary: artifacts.tier2Summary,
    metricsBaseline: artifacts.metricsBaseline,
    caseStudyDraft: artifacts.caseStudyDraft,
    investorOnepager: artifacts.investorOnepager,
    rollbackDrill: artifacts.rollbackDrill,
    competitorMatrix: artifacts.competitorMatrix,
    env,
  });
  const prerequisites = resolveMaintenanceModePrerequisites({
    goDecision,
    productEvolutionReady,
  });
  const improvementLoop = evaluateContinuousImprovementLoop(env);
  const productEvolution = evaluateSustainedProductEvolution(env);
  const rhythms = buildMaintenanceModeRhythmStatuses({
    improvementLoopOverdue: improvementLoop.health.overdueCount,
    improvementLoopDueSoon: improvementLoop.health.dueSoonCount,
    productEvolutionOverdue: productEvolution.health.overdueCount,
    productEvolutionDueSoon: productEvolution.health.dueSoonCount,
    metricsBaseline: artifacts.metricsBaseline,
    p0Staging: artifacts.p0Staging,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
  });
  const health = resolveMaintenanceModeHealthSummary(rhythms);
  const wedIntegration = rhythms.find((rhythm) => rhythm.id === "weekly_wed_integration_health");
  const monthlyW1 = rhythms.find((rhythm) => rhythm.id === "monthly_w1_metrics_baseline");
  const monthlyW2 = rhythms.find((rhythm) => rhythm.id === "monthly_w2_feedback_triage");
  const readyForWeeklyRhythmSmokes =
    prerequisites.maintenanceModeActive &&
    (wedIntegration?.status === "overdue" || wedIntegration?.status === "due_soon");
  const readyForMonthlyCadenceSmokes =
    prerequisites.maintenanceModeActive &&
    [monthlyW1, monthlyW2].some(
      (rhythm) => rhythm?.status === "overdue" || rhythm?.status === "due_soon",
    );
  const maintenanceModeMilestone = resolveMaintenanceModeMilestone({
    maintenanceModeActive: prerequisites.maintenanceModeActive,
    productEvolutionReady: productEvolution.productEvolutionReady,
    rhythms,
  });

  return {
    prerequisites,
    goDecision,
    maintenanceModeActive: prerequisites.maintenanceModeActive,
    commercialPilotPathComplete: prerequisites.commercialPilotPathComplete,
    improvementLoop,
    productEvolution,
    rhythms,
    health,
    readyForWeeklyRhythmSmokes,
    readyForMonthlyCadenceSmokes,
    maintenanceModeMilestone,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMaintenanceMode();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era24-maintenance-mode-v1",
          maintenanceModeActive: result.maintenanceModeActive,
          commercialPilotPathComplete: result.commercialPilotPathComplete,
          goDecision: result.goDecision,
          maintenanceModeMilestone: result.maintenanceModeMilestone,
          readyForWeeklyRhythmSmokes: result.readyForWeeklyRhythmSmokes,
          readyForMonthlyCadenceSmokes: result.readyForMonthlyCadenceSmokes,
          upstream: {
            improvementLoopOverdue: result.improvementLoop.health.overdueCount,
            productEvolutionOverdue: result.productEvolution.health.overdueCount,
          },
          health: result.health,
          rhythms: result.rhythms.map((rhythm) => ({
            id: rhythm.id,
            label: rhythm.label,
            ownerRole: rhythm.ownerRole,
            frequency: rhythm.frequency,
            status: rhythm.status,
            detail: rhythm.detail,
          })),
          guardrails: [
            "Never hand-edit PASS in artifacts/*.json",
            "Never merge GO artifacts across customers",
            "Never skip commercial pilot cert on release",
            "Never add Step 13+ gates without new era charter",
          ],
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nMaintenance mode (era24-maintenance-mode-v1)\n`);

  if (!result.maintenanceModeActive) {
    console.log("Not in maintenance mode — complete Steps 1–11 first.\n");
    console.log(`  productEvolutionReady: ${result.productEvolution.productEvolutionReady}`);
    console.log(`  goDecision: ${result.goDecision ?? "missing"}\n`);
    process.exit(0);
  }

  console.log("Commercial pilot path complete — repeat maintenance rhythms forever.\n");
  console.log(`Maintenance mode milestone: ${result.maintenanceModeMilestone}\n`);

  for (const rhythm of result.rhythms) {
    console.log(`[${rhythm.status}] ${rhythm.label} (${rhythm.ownerRole})`);
    console.log(`  ${rhythm.detail}\n`);
  }

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
