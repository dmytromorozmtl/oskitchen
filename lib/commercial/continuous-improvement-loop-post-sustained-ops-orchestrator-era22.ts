/**
 * Continuous improvement loop post-Sustained-ops orchestrator — track milestones, freshness, honest guidance.
 * Policy: era22-continuous-improvement-loop-post-sustained-ops-orchestrator-v1
 */
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
  resolveNextContinuousImprovementLoopAttentionTrack,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  type ContinuousImprovementLoopTrackStatus,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";

export const CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID =
  "era22-continuous-improvement-loop-post-sustained-ops-orchestrator-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_COMMAND =
  "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_EXPORT_COMMAND =
  "npm run ops:export-continuous-improvement-loop-release-checklist -- --write" as const;

export type ContinuousImprovementLoopMilestone =
  | "sustained_ops_blocked"
  | "attention_weekly_integration"
  | "attention_monthly_metrics"
  | "attention_quarterly_governance"
  | "loop_all_healthy";

export type ContinuousImprovementLoopPostSustainedOpsOrchestratorSummary = {
  policyId: typeof CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID;
  milestone: ContinuousImprovementLoopMilestone;
  pureOperationalMode: boolean;
  sustainedOpsComplete: boolean;
  readyForWeeklySmokes: boolean;
  readyForMetricsSmokes: boolean;
  readyForGovernanceSmokes: boolean;
  goDecision: string | null;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  goNoGoArtifactPresent: boolean;
  p0StagingArtifactPresent: boolean;
  tier2ArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  competitorMatrixArtifactPresent: boolean;
  nextAttentionTrackId: string | null;
  nextAttentionTrackLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveContinuousImprovementLoopMilestone(input: {
  pureOperationalMode: boolean;
  tracks: readonly Pick<ContinuousImprovementLoopTrackStatus, "id" | "status">[];
}): ContinuousImprovementLoopMilestone {
  if (!input.pureOperationalMode) return "sustained_ops_blocked";

  const attention = resolveNextContinuousImprovementLoopAttentionTrack(
    input.tracks as readonly ContinuousImprovementLoopTrackStatus[],
  );
  if (!attention) return "loop_all_healthy";

  switch (attention.id) {
    case "weekly_integration":
      return "attention_weekly_integration";
    case "monthly_metrics":
      return "attention_monthly_metrics";
    case "quarterly_governance":
      return "attention_quarterly_governance";
    default:
      return "loop_all_healthy";
  }
}

export function resolveContinuousImprovementLoopMilestoneFromTrackStatuses(
  tracks: readonly Pick<ContinuousImprovementLoopTrackStatus, "id" | "status">[],
  input: { pureOperationalMode: boolean },
): ContinuousImprovementLoopMilestone {
  return resolveContinuousImprovementLoopMilestone({
    pureOperationalMode: input.pureOperationalMode,
    tracks,
  });
}

export function buildContinuousImprovementLoopPostSustainedOpsOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateContinuousImprovementLoop>;
  artifacts: {
    goNoGoPresent: boolean;
    p0StagingPresent: boolean;
    tier2Present: boolean;
    metricsBaselinePresent: boolean;
    competitorMatrixPresent: boolean;
  };
}): ContinuousImprovementLoopPostSustainedOpsOrchestratorSummary {
  const attention = resolveNextContinuousImprovementLoopAttentionTrack(input.evaluation.tracks);
  const milestone = resolveContinuousImprovementLoopMilestone({
    pureOperationalMode: input.evaluation.pureOperationalMode,
    tracks: input.evaluation.tracks,
  });

  const readyForWeeklySmokes = input.evaluation.readyForWeeklySmokes;
  const readyForMetricsSmokes = input.evaluation.readyForMetricsSmokes;
  const readyForGovernanceSmokes = input.evaluation.readyForGovernanceSmokes;

  const recommendedCommands = input.evaluation.pureOperationalMode
    ? ([
        "npm run ops:validate-sustained-operational-excellence-integrity -- --json",
        "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
        "npm run ops:validate-sustained-operational-excellence-env -- --json",
        "npm run ops:validate-continuous-improvement-loop -- --json",
        CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-continuous-improvement-loop-progress-report -- --write",
        CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_EXPORT_COMMAND,
        ...(readyForWeeklySmokes || milestone === "attention_weekly_integration"
          ? (["npm run smoke:woo-shopify-live", "npm run smoke:commerce-webhook-drill"] as const)
          : ([] as const)),
        ...(readyForMetricsSmokes || milestone === "attention_monthly_metrics"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        ...(readyForGovernanceSmokes || milestone === "attention_quarterly_governance"
          ? ([
              "npm run smoke:pilot-forbidden-claims-enforcement",
              "npm run smoke:competitor-feature-gap-matrix",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
        "npm run ops:validate-sustained-operational-excellence-env -- --json",
        "npm run smoke:pilot-metrics-baseline",
      ] as const);

  return {
    policyId: CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID,
    milestone,
    pureOperationalMode: input.evaluation.pureOperationalMode,
    sustainedOpsComplete: input.evaluation.sustainedOpsComplete,
    readyForWeeklySmokes,
    readyForMetricsSmokes,
    readyForGovernanceSmokes,
    goDecision: input.evaluation.goDecision,
    healthyCount: input.evaluation.health.healthyCount,
    dueSoonCount: input.evaluation.health.dueSoonCount,
    overdueCount: input.evaluation.health.overdueCount,
    guidanceCount: input.evaluation.health.guidanceCount,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    p0StagingArtifactPresent: input.artifacts.p0StagingPresent,
    tier2ArtifactPresent: input.artifacts.tier2Present,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    competitorMatrixArtifactPresent: input.artifacts.competitorMatrixPresent,
    nextAttentionTrackId: attention?.id ?? null,
    nextAttentionTrackLabel: attention?.label ?? null,
    recommendedCommands,
  };
}

export function buildContinuousImprovementLoopOrchestratorReportMarkdown(input: {
  summary: ContinuousImprovementLoopPostSustainedOpsOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateContinuousImprovementLoop>;
}): string {
  const lines: string[] = [
    "# Continuous Improvement Loop — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — never blocks release; artifact freshness drives track status.",
    "",
    `Policy: \`${CONTINUOUS_IMPROVEMENT_LOOP_POST_SUSTAINED_OPS_ORCHESTRATOR_ERA22_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Pure operational mode: ${input.summary.pureOperationalMode ? "yes" : "no"}`,
    `- Sustained ops complete: ${input.summary.sustainedOpsComplete ? "yes" : "no"}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Overdue / due soon / healthy: ${input.summary.overdueCount} / ${input.summary.dueSoonCount} / ${input.summary.healthyCount}`,
    `- Next attention: ${input.summary.nextAttentionTrackLabel ?? "none — all artifact tracks fresh"}`,
    "",
    "## Recurring tracks (7)",
    "",
  ];

  for (const track of input.evaluation.tracks) {
    lines.push(`- [${track.status === "healthy" ? "x" : " "}] **${track.label}** (${track.frequency})`);
    lines.push(`  - Status: ${track.status}`);
    lines.push(`  - ${track.detail}`);
    if (track.lastRunAt) {
      lines.push(`  - Last evidence: ${track.lastRunAt}`);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — improvement loop compact panel (no era21 gate)");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#continuous-improvement-loop` panel");
  lines.push(`- [ ] \`${SUSTAINED_OPS_ORDER_HUB_ROUTE}\` + \`${SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE}\` — daily shift ops`);
  lines.push("- [ ] `/dashboard/integration-health` — weekly integration track");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
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
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}\``);
  lines.push(
    `Forbidden claims: [\`${SERIES_A_FORBIDDEN_CLAIMS_DOC}\`](../${SERIES_A_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Feature maturity: [\`${SERIES_A_FEATURE_MATURITY_DOC}\`](../${SERIES_A_FEATURE_MATURITY_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}
