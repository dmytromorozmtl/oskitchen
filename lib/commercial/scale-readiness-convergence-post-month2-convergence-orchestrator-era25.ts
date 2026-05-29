/**
 * era25 Scale Readiness Convergence post-month2-convergence orchestrator.
 * Policy: era25-scale-readiness-convergence-post-month2-convergence-orchestrator-v1
 */
import {
  SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import type { Month2MarketReadinessConvergenceEra25Milestone } from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  SCALE_READINESS_STEP6_DOC,
} from "@/lib/commercial/scale-readiness-phases-era21";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateScaleReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-scale-readiness-convergence-era25";
import type { ScaleReadinessPhaseStatus } from "@/lib/commercial/scale-readiness-phases-era21";

export const SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-scale-readiness-convergence-post-month2-convergence-orchestrator-v1" as const;

export const SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25" as const;

export type ScaleReadinessConvergenceEra25Milestone =
  | "month2_convergence_regression_blocked"
  | "gate1_per_customer_pilot_ops"
  | "gate2_soc2_readiness_track"
  | "gate3_enterprise_sso_production"
  | "gate4_operational_resilience"
  | "gate5_data_room_artifact_chain"
  | "scale_readiness_convergence_era25_ready";

export type ScaleReadinessConvergenceEra25OrchestratorSummary = {
  policyId: typeof SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: ScaleReadinessConvergenceEra25Milestone;
  month2MarketReadinessConvergenceEra25Milestone: Month2MarketReadinessConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  month2ConvergenceReady: boolean;
  scaleComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForResilienceSmokes: boolean;
  readyForMonth2ConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const MONTH2_CONVERGENCE_BLOCKED_MILESTONES: readonly Month2MarketReadinessConvergenceEra25Milestone[] =
  [
    "week1_convergence_regression_blocked",
    "awaiting_metrics_baseline_review",
    "awaiting_investor_onepager",
    "awaiting_gtm_icp_landings",
    "attention_case_study_draft",
  ] as const;

export function resolveScaleReadinessConvergenceEra25Milestone(input: {
  month2MarketReadinessConvergenceEra25Milestone: Month2MarketReadinessConvergenceEra25Milestone;
  scaleComplete: boolean;
  phases: readonly ScaleReadinessPhaseStatus[];
}): ScaleReadinessConvergenceEra25Milestone {
  if (
    input.month2MarketReadinessConvergenceEra25Milestone !==
    "month2_market_readiness_convergence_era25_ready"
  ) {
    return "month2_convergence_regression_blocked";
  }

  if (input.scaleComplete) {
    return "scale_readiness_convergence_era25_ready";
  }

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "scale_readiness_convergence_era25_ready";

  switch (nextBlocking.id) {
    case "gate1_per_customer_pilot_ops":
      return "gate1_per_customer_pilot_ops";
    case "gate2_soc2_readiness_track":
      return "gate2_soc2_readiness_track";
    case "gate3_enterprise_sso_production":
      return "gate3_enterprise_sso_production";
    case "gate4_operational_resilience":
      return "gate4_operational_resilience";
    case "gate5_data_room_artifact_chain":
      return "gate5_data_room_artifact_chain";
    default:
      return "gate1_per_customer_pilot_ops";
  }
}

export function buildScaleReadinessConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateScaleReadinessConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): ScaleReadinessConvergenceEra25OrchestratorSummary {
  const milestone = resolveScaleReadinessConvergenceEra25Milestone({
    month2MarketReadinessConvergenceEra25Milestone:
      input.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
    scaleComplete: input.evaluation.scaleState.scaleComplete,
    phases: input.evaluation.scaleState.phases,
  });

  const readyForMonth2ConvergenceRegressionSmokes = MONTH2_CONVERGENCE_BLOCKED_MILESTONES.includes(
    input.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
  );

  const recommendedCommands =
    milestone === "month2_convergence_regression_blocked"
      ? ([
          "npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25 -- --write",
          "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
          SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-scale-readiness-convergence-era25-report -- --write",
          "npm run ops:validate-scale-readiness-env -- --json",
          "npm run ops:export-scale-readiness-env-template -- --write",
          "npm run ops:sync-scale-readiness-progress-report -- --write",
          "npm run ops:export-scale-readiness-readiness-checklist -- --write",
          ...(input.evaluation.scaleState.readyForResilienceSmokes
            ? ([
                "npm run smoke:pilot-rollback-drill",
                "npm run smoke:commerce-webhook-drill",
                "npm run smoke:webhook-replay-p1-expansion",
              ] as const)
            : ([] as const)),
          ...(milestone === "gate5_data_room_artifact_chain"
            ? ([
                "npm run smoke:investor-narrative-onepager",
                "npm run smoke:pilot-metrics-baseline",
              ] as const)
            : ([] as const)),
          ...(milestone === "gate2_soc2_readiness_track"
            ? (["npm run smoke:pilot-forbidden-claims-enforcement"] as const)
            : ([] as const)),
          ...(milestone === "scale_readiness_convergence_era25_ready"
            ? (["Begin Series A / partner expansion convergence on platform ops"] as const)
            : ([] as const)),
          "npm run smoke:pilot-gono-go",
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    month2MarketReadinessConvergenceEra25Milestone:
      input.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    month2ConvergenceReady: input.evaluation.month2ConvergenceReady,
    scaleComplete: input.evaluation.scaleState.scaleComplete,
    goDecision: input.evaluation.scaleState.goDecision,
    completedBlockingCount: input.evaluation.scaleState.completedBlockingCount,
    totalBlockingCount: input.evaluation.scaleState.totalBlockingCount,
    nextPhaseId: input.evaluation.scaleState.nextPhaseId,
    nextPhaseLabel: input.evaluation.scaleState.nextPhaseLabel,
    readyForResilienceSmokes: input.evaluation.scaleState.readyForResilienceSmokes,
    readyForMonth2ConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildScaleReadinessConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: ScaleReadinessConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateScaleReadinessConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Scale Readiness Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Scale convergence** — honest gates from SCALE_* env + rollback/data room artifacts.",
    "",
    `Policy: \`${SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Month 2 convergence milestone: ${input.summary.month2MarketReadinessConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Scale complete: ${input.summary.scaleComplete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedBlockingCount}/${input.summary.totalBlockingCount} blocking gates`,
    `- Next gate: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Gates",
    "",
  ];

  for (const phase of input.evaluation.scaleState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of SCALE_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
    lines.push(`npm run ${cmd}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Convergence report: \`${SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH}\``);
  lines.push(
    `Convergence doc: [\`${SCALE_READINESS_CONVERGENCE_ERA25_DOC}\`](../${SCALE_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Month 2 convergence doc: [\`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC}\`](../${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 Scale reference: [\`${SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${SCALE_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(`Rollback drill: \`${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH}\``);
  lines.push(`Step 6 doc: [\`${SCALE_READINESS_STEP6_DOC}\`](../${SCALE_READINESS_STEP6_DOC})`);
  lines.push("");

  return lines.join("\n");
}
