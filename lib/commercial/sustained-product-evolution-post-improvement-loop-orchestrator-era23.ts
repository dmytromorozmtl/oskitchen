/**
 * Sustained product evolution post-improvement-loop orchestrator — track milestones, freshness, honest guidance.
 * Policy: era23-sustained-product-evolution-post-improvement-loop-orchestrator-v1
 */
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  IMPLEMENTATION_BACKLOG_DOC,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolveNextSustainedProductEvolutionAttentionTrack,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC,
  SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
  type SustainedProductEvolutionTrackStatus,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_COMMAND } from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND } from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import type { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export const SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID =
  "era23-sustained-product-evolution-post-improvement-loop-orchestrator-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_COMMAND =
  "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_EXPORT_COMMAND =
  "npm run ops:export-sustained-product-evolution-ownership-matrix -- --write" as const;

export type SustainedProductEvolutionMilestone =
  | "era25_sustained_ops_convergence_blocked"
  | "improvement_loop_blocked"
  | "attention_customer_feedback"
  | "attention_competitor_leapfrog"
  | "product_evolution_healthy";

export type SustainedProductEvolutionPostImprovementLoopOrchestratorSummary = {
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID;
  milestone: SustainedProductEvolutionMilestone;
  productEvolutionReady: boolean;
  continuousImprovementLoopActive: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  readyForFeedbackSmokes: boolean;
  readyForLeapfrogSmokes: boolean;
  goDecision: string | null;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  goNoGoArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  competitorMatrixArtifactPresent: boolean;
  nextAttentionTrackId: string | null;
  nextAttentionTrackLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveSustainedProductEvolutionMilestone(input: {
  productEvolutionReady: boolean;
  sustainedOpsConvergenceReady: boolean;
  tracks: readonly Pick<SustainedProductEvolutionTrackStatus, "id" | "status">[];
}): SustainedProductEvolutionMilestone {
  if (!input.sustainedOpsConvergenceReady) return "era25_sustained_ops_convergence_blocked";
  if (!input.productEvolutionReady) return "improvement_loop_blocked";

  const attention = resolveNextSustainedProductEvolutionAttentionTrack(
    input.tracks as readonly SustainedProductEvolutionTrackStatus[],
  );
  if (!attention) return "product_evolution_healthy";

  switch (attention.id) {
    case "customer_feedback_backlog":
      return "attention_customer_feedback";
    case "competitor_leapfrog_roadmap":
      return "attention_competitor_leapfrog";
    default:
      return "product_evolution_healthy";
  }
}

export function resolveSustainedProductEvolutionMilestoneFromTrackStatuses(
  tracks: readonly Pick<SustainedProductEvolutionTrackStatus, "id" | "status">[],
  input: { productEvolutionReady: boolean; sustainedOpsConvergenceReady?: boolean },
): SustainedProductEvolutionMilestone {
  return resolveSustainedProductEvolutionMilestone({
    productEvolutionReady: input.productEvolutionReady,
    sustainedOpsConvergenceReady: input.sustainedOpsConvergenceReady ?? false,
    tracks,
  });
}

export function buildSustainedProductEvolutionPostImprovementLoopOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSustainedProductEvolution>;
  artifacts: {
    goNoGoPresent: boolean;
    metricsBaselinePresent: boolean;
    competitorMatrixPresent: boolean;
  };
}): SustainedProductEvolutionPostImprovementLoopOrchestratorSummary {
  const attention = resolveNextSustainedProductEvolutionAttentionTrack(input.evaluation.tracks);
  const milestone = resolveSustainedProductEvolutionMilestone({
    productEvolutionReady: input.evaluation.productEvolutionReady,
    sustainedOpsConvergenceReady: input.evaluation.prerequisites.sustainedOpsConvergenceReady,
    tracks: input.evaluation.tracks,
  });

  const readyForFeedbackSmokes = input.evaluation.readyForFeedbackSmokes;
  const readyForLeapfrogSmokes = input.evaluation.readyForLeapfrogSmokes;

  const recommendedCommands = input.evaluation.productEvolutionReady
    ? ([
        "npm run ops:validate-continuous-improvement-loop-integrity -- --json",
        "npm run ops:validate-sustained-product-evolution-integrity -- --json",
        "npm run ops:validate-continuous-improvement-loop -- --json",
        "npm run ops:validate-sustained-product-evolution -- --json",
        SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-sustained-product-evolution-progress-report -- --write",
        SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_EXPORT_COMMAND,
        ...(readyForFeedbackSmokes || milestone === "attention_customer_feedback"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        ...(readyForLeapfrogSmokes || milestone === "attention_competitor_leapfrog"
          ? ([
              "npm run smoke:competitor-feature-gap-matrix",
              "npm run smoke:pilot-forbidden-claims-enforcement",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : milestone === "era25_sustained_ops_convergence_blocked"
      ? ([
          SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
          PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
          "npm run ops:validate-continuous-improvement-loop -- --json",
          "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
          "npm run smoke:pilot-metrics-baseline",
        ] as const);

  return {
    policyId: SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID,
    milestone,
    productEvolutionReady: input.evaluation.productEvolutionReady,
    continuousImprovementLoopActive: input.evaluation.continuousImprovementLoopActive,
    sustainedOpsConvergenceReady: input.evaluation.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: input.evaluation.prerequisites.pureOperationalModeEra25Active,
    readyForFeedbackSmokes,
    readyForLeapfrogSmokes,
    goDecision: input.evaluation.goDecision,
    healthyCount: input.evaluation.health.healthyCount,
    dueSoonCount: input.evaluation.health.dueSoonCount,
    overdueCount: input.evaluation.health.overdueCount,
    guidanceCount: input.evaluation.health.guidanceCount,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    competitorMatrixArtifactPresent: input.artifacts.competitorMatrixPresent,
    nextAttentionTrackId: attention?.id ?? null,
    nextAttentionTrackLabel: attention?.label ?? null,
    recommendedCommands,
  };
}

export function buildSustainedProductEvolutionOrchestratorReportMarkdown(input: {
  summary: SustainedProductEvolutionPostImprovementLoopOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSustainedProductEvolution>;
}): string {
  const lines: string[] = [
    "# Sustained Product Evolution — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational tracks + integrity guard (era35)** — product-led growth with honest Improvement loop prerequisite.",
    "",
    `Policy: \`${SUSTAINED_PRODUCT_EVOLUTION_POST_IMPROVEMENT_LOOP_ORCHESTRATOR_ERA23_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Product evolution ready: ${input.summary.productEvolutionReady ? "yes" : "no"}`,
    `- Improvement loop active: ${input.summary.continuousImprovementLoopActive ? "yes" : "no"}`,
    `- Sustained ops convergence ready: ${input.summary.sustainedOpsConvergenceReady ? "yes" : "no"}`,
    `- Pure operational mode era25 active: ${input.summary.pureOperationalModeEra25Active ? "yes" : "no"}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Overdue / due soon / healthy: ${input.summary.overdueCount} / ${input.summary.dueSoonCount} / ${input.summary.healthyCount}`,
    `- Next attention: ${input.summary.nextAttentionTrackLabel ?? "none — measurable tracks fresh"}`,
    "",
    "## Product evolution tracks (6)",
    "",
  ];

  for (const track of input.evaluation.tracks) {
    lines.push(
      `- [${track.status === "healthy" ? "x" : " "}] **${track.label}** (${track.ownerRole})`,
    );
    lines.push(`  - Status: ${track.status}`);
    lines.push(`  - ${track.detail}`);
    if (track.lastRunAt) {
      lines.push(`  - Last evidence: ${track.lastRunAt}`);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — product evolution compact panel (violet, below improvement loop)");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#sustained-product-evolution` panel");
  lines.push(`- [ ] \`${SERIES_A_GHOST_KITCHEN_LANDING_ROUTE}\` + \`${SERIES_A_MEAL_PREP_LANDING_ROUTE}\` — GTM alignment (guidance)`);
  lines.push("- [ ] `/dashboard/implementation` — feature maturity + rollout cadence");
  lines.push(`- [ ] \`${IMPLEMENTATION_BACKLOG_DOC}\` — operator_feedback_score triage`);
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
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
  lines.push(
    `Ownership matrix: [\`${SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC}\`](../${SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC})`,
  );
  lines.push(
    `Feature maturity: [\`${SERIES_A_FEATURE_MATURITY_DOC}\`](../${SERIES_A_FEATURE_MATURITY_DOC})`,
  );
  lines.push(
    `Competitor leapfrog: [\`${SERIES_A_COMPETITOR_LEAPFROG_DOC}\`](../${SERIES_A_COMPETITOR_LEAPFROG_DOC})`,
  );
  lines.push(
    `Forbidden claims: [\`${SERIES_A_FORBIDDEN_CLAIMS_DOC}\`](../${SERIES_A_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Step 10 doc: [\`${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC}\`](../${CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC})`,
  );
  lines.push(
    `Step 11 doc: [\`${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC}\`](../${SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC})`,
  );
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}\``);
  lines.push("");

  return lines.join("\n");
}
