/**
 * era25 Pure Operational Mode Terminus post-sustained-ops-convergence orchestrator.
 * Policy: era25-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-v1
 */
import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_FOREVER_COMMANDS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import type { SustainedOperationalExcellenceConvergenceEra25Milestone } from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_COMMAND,
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_EXPORT_COMMAND,
} from "@/lib/commercial/continuous-improvement-loop-post-sustained-ops-orchestrator-era22";
import {
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND } from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import type { evaluatePureOperationalModeTerminusEra25 } from "@/lib/commercial/evaluate-pure-operational-mode-terminus-era25";
import type { ContinuousImprovementLoopTrackStatus } from "@/lib/commercial/continuous-improvement-loop-phases-era22";

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-v1" as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25" as const;

export type PureOperationalModeTerminusEra25Milestone =
  | "sustained_ops_convergence_regression_blocked"
  | "attention_weekly_integration"
  | "attention_monthly_metrics"
  | "attention_quarterly_governance"
  | "pure_operational_mode_era25_active";

export type PureOperationalModeTerminusEra25OrchestratorSummary = {
  policyId: typeof PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: PureOperationalModeTerminusEra25Milestone;
  sustainedOperationalExcellenceConvergenceEra25Milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  terminusBlocked: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  goDecision: string | null;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  nextAttentionTrackId: string | null;
  nextAttentionTrackLabel: string | null;
  readyForWeeklySmokes: boolean;
  readyForMetricsSmokes: boolean;
  readyForGovernanceSmokes: boolean;
  readyForSustainedOpsConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const SUSTAINED_OPS_CONVERGENCE_BLOCKED_MILESTONES: readonly SustainedOperationalExcellenceConvergenceEra25Milestone[] =
  [
    "market_leader_convergence_regression_blocked",
    "cadence_a_daily_operational",
    "cadence_b_weekly_integration",
    "cadence_c_monthly_metrics",
    "cadence_d_quarterly_governance",
  ] as const;

export function resolvePureOperationalModeTerminusEra25Milestone(input: {
  sustainedOperationalExcellenceConvergenceEra25Milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  sustainedOpsConvergenceReady: boolean;
  tracks: readonly ContinuousImprovementLoopTrackStatus[];
}): PureOperationalModeTerminusEra25Milestone {
  if (
    input.sustainedOperationalExcellenceConvergenceEra25Milestone !==
    "sustained_operational_excellence_convergence_era25_ready"
  ) {
    return "sustained_ops_convergence_regression_blocked";
  }

  const attention = input.tracks.find(
    (track) => track.status === "overdue" || track.status === "due_soon",
  );
  if (!attention) return "pure_operational_mode_era25_active";

  switch (attention.id) {
    case "weekly_integration":
      return "attention_weekly_integration";
    case "monthly_metrics":
      return "attention_monthly_metrics";
    case "quarterly_governance":
      return "attention_quarterly_governance";
    default:
      return "pure_operational_mode_era25_active";
  }
}

export function buildPureOperationalModeTerminusEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluatePureOperationalModeTerminusEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): PureOperationalModeTerminusEra25OrchestratorSummary {
  const milestone = resolvePureOperationalModeTerminusEra25Milestone({
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      input.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
    sustainedOpsConvergenceReady: input.evaluation.sustainedOpsConvergenceReady,
    tracks: input.evaluation.terminusState.tracks,
  });

  const readyForSustainedOpsConvergenceRegressionSmokes =
    SUSTAINED_OPS_CONVERGENCE_BLOCKED_MILESTONES.includes(
      input.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
    );

  const recommendedCommands =
    milestone === "sustained_ops_convergence_regression_blocked"
      ? ([
          SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
          PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-pure-operational-mode-terminus-era25-report -- --write",
          "npm run ops:validate-continuous-improvement-loop -- --json",
          CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-continuous-improvement-loop-progress-report -- --write",
          CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_EXPORT_COMMAND,
          ...(input.evaluation.terminusState.readyForWeeklySmokes ||
          milestone === "attention_weekly_integration"
            ? (["npm run smoke:woo-shopify-live", "npm run smoke:commerce-webhook-drill"] as const)
            : ([] as const)),
          ...(input.evaluation.terminusState.readyForMetricsSmokes ||
          milestone === "attention_monthly_metrics"
            ? (["npm run smoke:pilot-metrics-baseline"] as const)
            : ([] as const)),
          ...(input.evaluation.terminusState.readyForGovernanceSmokes ||
          milestone === "attention_quarterly_governance"
            ? ([
                "npm run smoke:pilot-forbidden-claims-enforcement",
                "npm run smoke:competitor-feature-gap-matrix",
              ] as const)
            : ([] as const)),
          ...(milestone === "pure_operational_mode_era25_active"
            ? (["era25 product convergence chain complete — hand off to era23 product evolution"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      input.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
    terminusBlocked: input.evaluation.terminusBlocked,
    sustainedOpsConvergenceReady: input.evaluation.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: input.evaluation.pureOperationalModeEra25Active,
    goDecision: input.evaluation.terminusState.goDecision,
    healthyCount: input.evaluation.terminusState.healthyCount,
    dueSoonCount: input.evaluation.terminusState.dueSoonCount,
    overdueCount: input.evaluation.terminusState.overdueCount,
    guidanceCount: input.evaluation.terminusState.guidanceCount,
    nextAttentionTrackId: input.evaluation.terminusState.nextAttentionTrackId,
    nextAttentionTrackLabel: input.evaluation.terminusState.nextAttentionTrackLabel,
    readyForWeeklySmokes: input.evaluation.terminusState.readyForWeeklySmokes,
    readyForMetricsSmokes: input.evaluation.terminusState.readyForMetricsSmokes,
    readyForGovernanceSmokes: input.evaluation.terminusState.readyForGovernanceSmokes,
    readyForSustainedOpsConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildPureOperationalModeTerminusEra25OrchestratorReportMarkdown(input: {
  summary: PureOperationalModeTerminusEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluatePureOperationalModeTerminusEra25>;
}): string {
  const lines: string[] = [
    "# era25 Pure Operational Mode Terminus — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Final era25 slice** — informational improvement loop only; no new env attestation keys.",
    "",
    `Policy: \`${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Sustained ops convergence milestone: ${input.summary.sustainedOperationalExcellenceConvergenceEra25Milestone}`,
    `- Terminus blocked: ${input.summary.terminusBlocked ? "yes" : "no"}`,
    `- Pure operational mode era25 active: ${input.summary.pureOperationalModeEra25Active ? "yes" : "no"}`,
    `- Overdue / due soon / healthy: ${input.summary.overdueCount} / ${input.summary.dueSoonCount} / ${input.summary.healthyCount}`,
    `- Next attention: ${input.summary.nextAttentionTrackLabel ?? "none — all tracks fresh"}`,
    "",
    "## Improvement loop tracks",
    "",
  ];

  for (const track of input.evaluation.terminusState.tracks) {
    lines.push(`- [${track.status === "healthy" ? "x" : " "}] **${track.label}** (${track.frequency})`);
    lines.push(`  - Status: ${track.status}`);
    lines.push(`  - ${track.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of PURE_OPERATIONAL_MODE_TERMINUS_ERA25_FOREVER_COMMANDS) {
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
  lines.push(`Convergence report: \`${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH}\``);
  lines.push(
    `Terminus doc: [\`${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC}\`](../${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_DOC})`,
  );
  lines.push(
    `Sustained ops convergence doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era22 improvement loop reference: [\`${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC}\`](../${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ERA22_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops terminus: \`${SERIES_A_PLATFORM_OPS_ROUTE}${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(
    `Improvement loop: \`${SERIES_A_PLATFORM_OPS_ROUTE}${CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`P0 staging: \`${P0_STAGING_PROOF_ARTIFACT_PATH}\``);
  lines.push(`Tier 2: \`${TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
  lines.push(
    `Release checklist: [\`${CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC}\`](../${CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC})`,
  );
  lines.push(
    `Step 10 doc: [\`${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC}\`](../${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC})`,
  );
  lines.push(
    `Forbidden claims: [\`${SERIES_A_FORBIDDEN_CLAIMS_DOC}\`](../${SERIES_A_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Feature maturity: [\`${SERIES_A_FEATURE_MATURITY_DOC}\`](../${SERIES_A_FEATURE_MATURITY_DOC})`,
  );
  lines.push(`Order Hub: \`${SUSTAINED_OPS_ORDER_HUB_ROUTE}\``);
  lines.push(`Production calendar: \`${SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE}\``);
  lines.push("");

  return lines.join("\n");
}
