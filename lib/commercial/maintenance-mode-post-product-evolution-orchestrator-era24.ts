/**
 * Maintenance mode post-product-evolution orchestrator — rhythm milestones, honest guidance.
 * Policy: era24-maintenance-mode-post-product-evolution-orchestrator-v1
 */
import {
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH,
  MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC,
  MAINTENANCE_MODE_STEP12_DOC,
  resolveNextMaintenanceModeAttentionRhythm,
  type MaintenanceModeRhythmStatus,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import { SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export const MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-maintenance-mode-post-product-evolution-orchestrator-v1" as const;

export const MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator" as const;

export const MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS = [
  "weekly_mon_shift_handoffs",
  "weekly_wed_integration_health",
  "weekly_fri_progress_sync",
] as const;

export const MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS = [
  "monthly_w1_metrics_baseline",
  "monthly_w2_feedback_triage",
  "monthly_w3_improvement_loop_review",
  "monthly_w4_product_evolution_review",
] as const;

export type MaintenanceModeMilestone =
  | "product_evolution_blocked"
  | "attention_weekly_rhythm"
  | "attention_monthly_cadence"
  | "maintenance_mode_healthy";

export type MaintenanceModePostProductEvolutionOrchestratorSummary = {
  policyId: typeof MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: MaintenanceModeMilestone;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
  productEvolutionReady: boolean;
  readyForWeeklyRhythmSmokes: boolean;
  readyForMonthlyCadenceSmokes: boolean;
  goDecision: string | null;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  improvementLoopOverdue: number;
  productEvolutionOverdue: number;
  playbookReportPresent: boolean;
  rhythmCalendarDocPresent: boolean;
  nextAttentionRhythmId: string | null;
  nextAttentionRhythmLabel: string | null;
  recommendedCommands: readonly string[];
};

function rhythmNeedsAttention(
  rhythms: readonly Pick<MaintenanceModeRhythmStatus, "id" | "status">[],
  ids: readonly string[],
): boolean {
  const idSet = new Set(ids);
  return rhythms.some(
    (rhythm) =>
      idSet.has(rhythm.id) &&
      (rhythm.status === "overdue" || rhythm.status === "due_soon"),
  );
}

export function resolveMaintenanceModeMilestone(input: {
  maintenanceModeActive: boolean;
  productEvolutionReady: boolean;
  rhythms: readonly Pick<MaintenanceModeRhythmStatus, "id" | "status">[];
}): MaintenanceModeMilestone {
  if (!input.maintenanceModeActive || !input.productEvolutionReady) {
    return "product_evolution_blocked";
  }

  if (rhythmNeedsAttention(input.rhythms, MAINTENANCE_MODE_WEEKLY_RHYTHM_IDS)) {
    return "attention_weekly_rhythm";
  }

  if (rhythmNeedsAttention(input.rhythms, MAINTENANCE_MODE_MONTHLY_CADENCE_RHYTHM_IDS)) {
    return "attention_monthly_cadence";
  }

  return "maintenance_mode_healthy";
}

export function resolveMaintenanceModeMilestoneFromRhythmStatuses(
  rhythms: readonly Pick<MaintenanceModeRhythmStatus, "id" | "status">[],
  input: { maintenanceModeActive: boolean; productEvolutionReady: boolean },
): MaintenanceModeMilestone {
  return resolveMaintenanceModeMilestone({
    maintenanceModeActive: input.maintenanceModeActive,
    productEvolutionReady: input.productEvolutionReady,
    rhythms,
  });
}

export function buildMaintenanceModePostProductEvolutionOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateMaintenanceMode>;
  artifacts: {
    playbookReportPresent: boolean;
    rhythmCalendarDocPresent: boolean;
  };
}): MaintenanceModePostProductEvolutionOrchestratorSummary {
  const attention = resolveNextMaintenanceModeAttentionRhythm(input.evaluation.rhythms);
  const milestone = resolveMaintenanceModeMilestone({
    maintenanceModeActive: input.evaluation.maintenanceModeActive,
    productEvolutionReady: input.evaluation.productEvolution.productEvolutionReady,
    rhythms: input.evaluation.rhythms,
  });

  const wedIntegration = input.evaluation.rhythms.find(
    (rhythm) => rhythm.id === "weekly_wed_integration_health",
  );
  const monthlyW1 = input.evaluation.rhythms.find(
    (rhythm) => rhythm.id === "monthly_w1_metrics_baseline",
  );
  const monthlyW2 = input.evaluation.rhythms.find(
    (rhythm) => rhythm.id === "monthly_w2_feedback_triage",
  );

  const readyForWeeklyRhythmSmokes =
    input.evaluation.maintenanceModeActive &&
    (wedIntegration?.status === "overdue" || wedIntegration?.status === "due_soon");
  const readyForMonthlyCadenceSmokes =
    input.evaluation.maintenanceModeActive &&
    [monthlyW1, monthlyW2].some(
      (rhythm) => rhythm?.status === "overdue" || rhythm?.status === "due_soon",
    );

  const recommendedCommands = input.evaluation.maintenanceModeActive
    ? ([
        "npm run ops:validate-sustained-product-evolution -- --json",
        "npm run ops:validate-maintenance-mode -- --json",
        MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-maintenance-mode-playbook-report -- --write",
        "npm run ops:export-maintenance-mode-rhythm-calendar -- --write",
        ...(readyForWeeklyRhythmSmokes || milestone === "attention_weekly_rhythm"
          ? (["npm run smoke:woo-shopify-live", "npm run smoke:commerce-webhook-drill"] as const)
          : ([] as const)),
        ...(readyForMonthlyCadenceSmokes || milestone === "attention_monthly_cadence"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
        "npm run ops:validate-sustained-product-evolution -- --json",
        "npm run smoke:pilot-metrics-baseline",
      ] as const);

  return {
    policyId: MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    maintenanceModeActive: input.evaluation.maintenanceModeActive,
    commercialPilotPathComplete: input.evaluation.commercialPilotPathComplete,
    productEvolutionReady: input.evaluation.productEvolution.productEvolutionReady,
    readyForWeeklyRhythmSmokes,
    readyForMonthlyCadenceSmokes,
    goDecision: input.evaluation.goDecision,
    healthyCount: input.evaluation.health.healthyCount,
    dueSoonCount: input.evaluation.health.dueSoonCount,
    overdueCount: input.evaluation.health.overdueCount,
    guidanceCount: input.evaluation.health.guidanceCount,
    improvementLoopOverdue: input.evaluation.improvementLoop.health.overdueCount,
    productEvolutionOverdue: input.evaluation.productEvolution.health.overdueCount,
    playbookReportPresent: input.artifacts.playbookReportPresent,
    rhythmCalendarDocPresent: input.artifacts.rhythmCalendarDocPresent,
    nextAttentionRhythmId: attention?.id ?? null,
    nextAttentionRhythmLabel: attention?.label ?? null,
    recommendedCommands,
  };
}

export function buildMaintenanceModeOrchestratorReportMarkdown(input: {
  summary: MaintenanceModePostProductEvolutionOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateMaintenanceMode>;
}): string {
  const lines: string[] = [
    "# Maintenance Mode — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — operator rhythms forever; no new briefing priority or env attestation keys.",
    "",
    `Policy: \`${MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Maintenance mode active: ${input.summary.maintenanceModeActive ? "yes" : "no"}`,
    `- Commercial pilot path complete: ${input.summary.commercialPilotPathComplete ? "yes" : "no"}`,
    `- Product evolution ready: ${input.summary.productEvolutionReady ? "yes" : "no"}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Overdue / due soon / healthy / guidance: ${input.summary.overdueCount} / ${input.summary.dueSoonCount} / ${input.summary.healthyCount} / ${input.summary.guidanceCount}`,
    `- Upstream overdue: improvement loop ${input.summary.improvementLoopOverdue} · product evolution ${input.summary.productEvolutionOverdue}`,
    `- Next attention: ${input.summary.nextAttentionRhythmLabel ?? "none — measurable rhythms fresh"}`,
    `- Ready for weekly rhythm smokes: ${input.summary.readyForWeeklyRhythmSmokes ? "yes" : "no"}`,
    `- Ready for monthly cadence smokes: ${input.summary.readyForMonthlyCadenceSmokes ? "yes" : "no"}`,
    "",
    "## Operator rhythms (10)",
    "",
  ];

  for (const rhythm of input.evaluation.rhythms) {
    lines.push(
      `- [${rhythm.status === "healthy" ? "x" : " "}] **${rhythm.label}** (${rhythm.ownerRole})`,
    );
    lines.push(`  - Status: ${rhythm.status}`);
    lines.push(`  - ${rhythm.detail}`);
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — maintenance compact panel (slate, path complete stack top)");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#maintenance-mode` panel + engineering path terminus");
  lines.push("- [ ] `/dashboard/order-hub` — Mon shift handoffs");
  lines.push("- [ ] `/dashboard/integration-health` — Wed integration review");
  lines.push("- [ ] `/dashboard/reports` — W1 metrics + W2 feedback triage");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Playbook report: \`${MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH}\``);
  lines.push(
    `Rhythm calendar: [\`${MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC}\`](../${MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC})`,
  );
  lines.push(
    `Step 11 doc: [\`${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC}\`](../${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC})`,
  );
  lines.push(
    `Step 12 doc: [\`${MAINTENANCE_MODE_STEP12_DOC}\`](../${MAINTENANCE_MODE_STEP12_DOC})`,
  );
  lines.push(
    `Step 10 doc: [\`${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC}\`](../${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC})`,
  );
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}#maintenance-mode\``);
  lines.push("");

  return lines.join("\n");
}
