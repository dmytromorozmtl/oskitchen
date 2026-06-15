/**
 * era25 Market Leader Positioning Convergence post-series-a-convergence orchestrator.
 * Policy: era25-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-v1
 */
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import type { SeriesAPartnerExpansionConvergenceEra25Milestone } from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MARKET_LEADER_POSITIONING_STEP8_DOC,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  MARKET_LEADER_POSITIONING_READINESS_EXPORT_COMMAND,
} from "@/lib/commercial/market-leader-positioning-post-series-a-orchestrator-era21";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateMarketLeaderPositioningConvergenceEra25 } from "@/lib/commercial/evaluate-market-leader-positioning-convergence-era25";
import type { MarketLeaderPositioningPhaseStatus } from "@/lib/commercial/market-leader-positioning-phases-era21";

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-v1" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25" as const;

export type MarketLeaderPositioningConvergenceEra25Milestone =
  | "series_a_convergence_regression_blocked"
  | "pillar1_category_narrative"
  | "pillar2_competitive_moat_proof"
  | "pillar3_analyst_press_kit"
  | "pillar4_expansion_revenue_motion"
  | "market_leader_positioning_convergence_era25_ready";

export type MarketLeaderPositioningConvergenceEra25OrchestratorSummary = {
  policyId: typeof MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  seriesAPartnerExpansionConvergenceEra25Milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  seriesAConvergenceReady: boolean;
  marketLeaderComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
  readyForSeriesAConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const SERIES_A_CONVERGENCE_BLOCKED_MILESTONES: readonly SeriesAPartnerExpansionConvergenceEra25Milestone[] =
  [
    "scale_convergence_regression_blocked",
    "track_a_series_a_data_room",
    "track_b_partner_channel_expansion",
    "track_c_multi_region_playbook",
    "track_d_customer_success_repeatability",
  ] as const;

export function resolveMarketLeaderPositioningConvergenceEra25Milestone(input: {
  seriesAPartnerExpansionConvergenceEra25Milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  marketLeaderComplete: boolean;
  phases: readonly MarketLeaderPositioningPhaseStatus[];
}): MarketLeaderPositioningConvergenceEra25Milestone {
  if (
    input.seriesAPartnerExpansionConvergenceEra25Milestone !==
    "series_a_partner_expansion_convergence_era25_ready"
  ) {
    return "series_a_convergence_regression_blocked";
  }

  if (input.marketLeaderComplete) {
    return "market_leader_positioning_convergence_era25_ready";
  }

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "market_leader_positioning_convergence_era25_ready";

  switch (nextBlocking.id) {
    case "pillar1_category_narrative":
      return "pillar1_category_narrative";
    case "pillar2_competitive_moat_proof":
      return "pillar2_competitive_moat_proof";
    case "pillar3_analyst_press_kit":
      return "pillar3_analyst_press_kit";
    case "pillar4_expansion_revenue_motion":
      return "pillar4_expansion_revenue_motion";
    default:
      return "pillar1_category_narrative";
  }
}

export function buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): MarketLeaderPositioningConvergenceEra25OrchestratorSummary {
  const milestone = resolveMarketLeaderPositioningConvergenceEra25Milestone({
    seriesAPartnerExpansionConvergenceEra25Milestone:
      input.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
    marketLeaderComplete: input.evaluation.marketLeaderState.marketLeaderComplete,
    phases: input.evaluation.marketLeaderState.phases,
  });

  const readyForSeriesAConvergenceRegressionSmokes =
    SERIES_A_CONVERGENCE_BLOCKED_MILESTONES.includes(
      input.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
    );

  const recommendedCommands =
    milestone === "series_a_convergence_regression_blocked"
      ? ([
          "npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25 -- --write",
          "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
          MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write",
          "npm run ops:validate-market-leader-positioning-env -- --json",
          "npm run ops:export-market-leader-positioning-env-template -- --write",
          "npm run ops:sync-market-leader-positioning-progress-report -- --write",
          MARKET_LEADER_POSITIONING_READINESS_EXPORT_COMMAND,
          ...(milestone === "pillar1_category_narrative"
            ? (["npm run smoke:pilot-case-study-draft"] as const)
            : ([] as const)),
          ...(input.evaluation.marketLeaderState.readyForMoatSmokes
            ? ([
                "npm run smoke:pilot-rollback-drill",
                "npm run smoke:commerce-webhook-drill",
                "npm run smoke:webhook-replay-p1-expansion",
              ] as const)
            : ([] as const)),
          ...(input.evaluation.marketLeaderState.readyForAnalystKitSmokes ||
          milestone === "pillar3_analyst_press_kit"
            ? ([
                "npm run smoke:pilot-forbidden-claims-enforcement",
                "npm run smoke:investor-narrative-onepager",
                "npm run smoke:competitor-feature-gap-matrix",
              ] as const)
            : ([] as const)),
          ...(milestone === "pillar4_expansion_revenue_motion"
            ? (["npm run smoke:pilot-metrics-baseline"] as const)
            : ([] as const)),
          ...(milestone === "market_leader_positioning_convergence_era25_ready"
            ? (["Begin sustained operational excellence convergence on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId:
      MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    seriesAPartnerExpansionConvergenceEra25Milestone:
      input.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    seriesAConvergenceReady: input.evaluation.seriesAConvergenceReady,
    marketLeaderComplete: input.evaluation.marketLeaderState.marketLeaderComplete,
    goDecision: input.evaluation.marketLeaderState.goDecision,
    completedBlockingCount: input.evaluation.marketLeaderState.completedBlockingCount,
    totalBlockingCount: input.evaluation.marketLeaderState.totalBlockingCount,
    nextPhaseId: input.evaluation.marketLeaderState.nextPhaseId,
    nextPhaseLabel: input.evaluation.marketLeaderState.nextPhaseLabel,
    readyForMoatSmokes: input.evaluation.marketLeaderState.readyForMoatSmokes,
    readyForAnalystKitSmokes: input.evaluation.marketLeaderState.readyForAnalystKitSmokes,
    readyForSeriesAConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildMarketLeaderPositioningConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: MarketLeaderPositioningConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Market Leader Positioning Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Market leader convergence** — honest pillars from MARKET_LEADER_* env + moat/analyst artifacts.",
    "",
    `Policy: \`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Series A convergence milestone: ${input.summary.seriesAPartnerExpansionConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Market leader complete: ${input.summary.marketLeaderComplete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedBlockingCount}/${input.summary.totalBlockingCount} blocking pillars`,
    `- Next pillar: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Pillars",
    "",
  ];

  for (const phase of input.evaluation.marketLeaderState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
  lines.push(
    `Convergence report: \`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH}\``,
  );
  lines.push(
    `Convergence doc: [\`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC}\`](../${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Series A convergence doc: [\`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 market leader reference: [\`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
  lines.push(`Rollback drill: \`${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
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
    `Step 8 doc: [\`${MARKET_LEADER_POSITIONING_STEP8_DOC}\`](../${MARKET_LEADER_POSITIONING_STEP8_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}
