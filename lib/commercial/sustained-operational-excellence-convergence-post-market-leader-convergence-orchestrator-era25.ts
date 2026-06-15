/**
 * era25 Sustained Operational Excellence Convergence post-market-leader-convergence orchestrator.
 * Policy: era25-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-v1
 */
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import type { MarketLeaderPositioningConvergenceEra25Milestone } from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_EXPORT_COMMAND,
} from "@/lib/commercial/sustained-operational-excellence-post-market-leader-orchestrator-era21";
import type { evaluateSustainedOperationalExcellenceConvergenceEra25 } from "@/lib/commercial/evaluate-sustained-operational-excellence-convergence-era25";
import type { SustainedOperationalExcellencePhaseStatus } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25" as const;

export type SustainedOperationalExcellenceConvergenceEra25Milestone =
  | "market_leader_convergence_regression_blocked"
  | "cadence_a_daily_operational"
  | "cadence_b_weekly_integration"
  | "cadence_c_monthly_metrics"
  | "cadence_d_quarterly_governance"
  | "sustained_operational_excellence_convergence_era25_ready";

export type SustainedOperationalExcellenceConvergenceEra25OrchestratorSummary = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  marketLeaderPositioningConvergenceEra25Milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  marketLeaderConvergenceReady: boolean;
  sustainedOpsComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
  readyForMarketLeaderConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const MARKET_LEADER_CONVERGENCE_BLOCKED_MILESTONES: readonly MarketLeaderPositioningConvergenceEra25Milestone[] =
  [
    "series_a_convergence_regression_blocked",
    "pillar1_category_narrative",
    "pillar2_competitive_moat_proof",
    "pillar3_analyst_press_kit",
    "pillar4_expansion_revenue_motion",
  ] as const;

export function resolveSustainedOperationalExcellenceConvergenceEra25Milestone(input: {
  marketLeaderPositioningConvergenceEra25Milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  sustainedOpsComplete: boolean;
  phases: readonly SustainedOperationalExcellencePhaseStatus[];
}): SustainedOperationalExcellenceConvergenceEra25Milestone {
  if (
    input.marketLeaderPositioningConvergenceEra25Milestone !==
    "market_leader_positioning_convergence_era25_ready"
  ) {
    return "market_leader_convergence_regression_blocked";
  }

  if (input.sustainedOpsComplete) {
    return "sustained_operational_excellence_convergence_era25_ready";
  }

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "sustained_operational_excellence_convergence_era25_ready";

  switch (nextBlocking.id) {
    case "cadence_a_daily_operational":
      return "cadence_a_daily_operational";
    case "cadence_b_weekly_integration":
      return "cadence_b_weekly_integration";
    case "cadence_c_monthly_metrics":
      return "cadence_c_monthly_metrics";
    case "cadence_d_quarterly_governance":
      return "cadence_d_quarterly_governance";
    default:
      return "cadence_a_daily_operational";
  }
}

export function buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSustainedOperationalExcellenceConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): SustainedOperationalExcellenceConvergenceEra25OrchestratorSummary {
  const milestone = resolveSustainedOperationalExcellenceConvergenceEra25Milestone({
    marketLeaderPositioningConvergenceEra25Milestone:
      input.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
    sustainedOpsComplete: input.evaluation.sustainedOpsState.sustainedOpsComplete,
    phases: input.evaluation.sustainedOpsState.phases,
  });

  const readyForMarketLeaderConvergenceRegressionSmokes =
    MARKET_LEADER_CONVERGENCE_BLOCKED_MILESTONES.includes(
      input.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
    );

  const recommendedCommands =
    milestone === "market_leader_convergence_regression_blocked"
      ? ([
          "npm run ops:run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25 -- --write",
          "npm run ops:validate-market-leader-positioning-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-sustained-operational-excellence-convergence-era25 -- --json",
          SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write",
          "npm run ops:validate-sustained-operational-excellence-env -- --json",
          "npm run ops:export-sustained-operational-excellence-env-template -- --write",
          "npm run ops:sync-sustained-operational-excellence-progress-report -- --write",
          SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_EXPORT_COMMAND,
          ...(input.evaluation.sustainedOpsState.readyForIntegrationSmokes ||
          milestone === "cadence_b_weekly_integration"
            ? (["npm run smoke:woo-shopify-live", "npm run smoke:commerce-webhook-drill"] as const)
            : ([] as const)),
          ...(input.evaluation.sustainedOpsState.readyForMetricsSmokes ||
          milestone === "cadence_c_monthly_metrics"
            ? (["npm run smoke:pilot-metrics-baseline"] as const)
            : ([] as const)),
          ...(milestone === "cadence_d_quarterly_governance"
            ? ([
                "npm run smoke:pilot-forbidden-claims-enforcement",
                "npm run smoke:competitor-feature-gap-matrix",
              ] as const)
            : ([] as const)),
          ...(milestone === "sustained_operational_excellence_convergence_era25_ready"
            ? (["Enter pure operational mode — continuous improvement loop on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId:
      SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    marketLeaderPositioningConvergenceEra25Milestone:
      input.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    marketLeaderConvergenceReady: input.evaluation.marketLeaderConvergenceReady,
    sustainedOpsComplete: input.evaluation.sustainedOpsState.sustainedOpsComplete,
    goDecision: input.evaluation.sustainedOpsState.goDecision,
    completedBlockingCount: input.evaluation.sustainedOpsState.completedBlockingCount,
    totalBlockingCount: input.evaluation.sustainedOpsState.totalBlockingCount,
    nextPhaseId: input.evaluation.sustainedOpsState.nextPhaseId,
    nextPhaseLabel: input.evaluation.sustainedOpsState.nextPhaseLabel,
    readyForIntegrationSmokes: input.evaluation.sustainedOpsState.readyForIntegrationSmokes,
    readyForMetricsSmokes: input.evaluation.sustainedOpsState.readyForMetricsSmokes,
    readyForMarketLeaderConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildSustainedOperationalExcellenceConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: SustainedOperationalExcellenceConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSustainedOperationalExcellenceConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Sustained Operational Excellence Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Sustained ops convergence** — honest cadences from SUSTAINED_OPS_* env + artifact freshness.",
    "",
    `Policy: \`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Market leader convergence milestone: ${input.summary.marketLeaderPositioningConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Sustained ops complete: ${input.summary.sustainedOpsComplete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedBlockingCount}/${input.summary.totalBlockingCount} blocking cadences`,
    `- Next cadence: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Cadences",
    "",
  ];

  for (const phase of input.evaluation.sustainedOpsState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
    `Convergence report: \`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH}\``,
  );
  lines.push(
    `Convergence doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Market leader convergence doc: [\`${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC}\`](../${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 sustained ops reference: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`P0 staging: \`${P0_STAGING_PROOF_ARTIFACT_PATH}\``);
  lines.push(`Tier 2: \`${TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
  lines.push(
    `Feature maturity: [\`${SERIES_A_FEATURE_MATURITY_DOC}\`](../${SERIES_A_FEATURE_MATURITY_DOC})`,
  );
  lines.push(
    `Forbidden claims: [\`${SERIES_A_FORBIDDEN_CLAIMS_DOC}\`](../${SERIES_A_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Step 9 doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC})`,
  );
  lines.push(`Order Hub: \`${SUSTAINED_OPS_ORDER_HUB_ROUTE}\``);
  lines.push(`Production calendar: \`${SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE}\``);
  lines.push("");

  return lines.join("\n");
}
