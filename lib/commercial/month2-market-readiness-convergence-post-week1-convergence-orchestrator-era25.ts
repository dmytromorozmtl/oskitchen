/**
 * era25 Month 2 Market Readiness Convergence post-week1-convergence orchestrator.
 * Policy: era25-month2-market-readiness-convergence-post-week1-convergence-orchestrator-v1
 */
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import type { PilotWeek1ExecutionConvergenceEra25Milestone } from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MONTH2_INVESTOR_ONEPAGER_DOC,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateMonth2MarketReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-month2-market-readiness-convergence-era25";
import type { Month2MarketReadinessPhaseStatus } from "@/lib/commercial/month2-market-readiness-phases-era21";

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-month2-market-readiness-convergence-post-week1-convergence-orchestrator-v1" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25" as const;

export type Month2MarketReadinessConvergenceEra25Milestone =
  | "week1_convergence_regression_blocked"
  | "awaiting_metrics_baseline_review"
  | "awaiting_investor_onepager"
  | "awaiting_gtm_icp_landings"
  | "attention_case_study_draft"
  | "month2_market_readiness_convergence_era25_ready";

export type Month2MarketReadinessConvergenceEra25OrchestratorSummary = {
  policyId: typeof MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: Month2MarketReadinessConvergenceEra25Milestone;
  pilotWeek1ExecutionConvergenceEra25Milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  week1ConvergenceReady: boolean;
  month2Complete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForInvestorOnepagerSmoke: boolean;
  readyForWeek1ConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const WEEK1_CONVERGENCE_BLOCKED_MILESTONES: readonly PilotWeek1ExecutionConvergenceEra25Milestone[] =
  [
    "go_convergence_regression_blocked",
    "awaiting_day1_ttv",
    "attention_integration_health",
    "awaiting_day3_pos_money_path",
    "awaiting_day4_reports_review",
    "awaiting_metrics_baseline",
  ] as const;

function findPhase(
  phases: readonly Month2MarketReadinessPhaseStatus[],
  id: string,
): Month2MarketReadinessPhaseStatus | undefined {
  return phases.find((phase) => phase.id === id);
}

export function resolveMonth2MarketReadinessConvergenceEra25Milestone(input: {
  pilotWeek1ExecutionConvergenceEra25Milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  month2Complete: boolean;
  metricsBaselinePassed: boolean;
  phases: readonly Month2MarketReadinessPhaseStatus[];
}): Month2MarketReadinessConvergenceEra25Milestone {
  if (
    input.pilotWeek1ExecutionConvergenceEra25Milestone !==
    "pilot_week1_execution_convergence_era25_ready"
  ) {
    return "week1_convergence_regression_blocked";
  }

  if (input.month2Complete) {
    return "month2_market_readiness_convergence_era25_ready";
  }

  if (!input.metricsBaselinePassed) {
    return "awaiting_metrics_baseline_review";
  }

  const workstreamA = findPhase(input.phases, "workstream_a_investor_onepager");
  if (workstreamA && !workstreamA.complete) {
    return "awaiting_investor_onepager";
  }

  const workstreamB = findPhase(input.phases, "workstream_b_gtm_icp_landings");
  if (workstreamB && !workstreamB.complete) {
    return "awaiting_gtm_icp_landings";
  }

  const workstreamD = findPhase(input.phases, "workstream_d_case_study_publish");
  if (workstreamD && !workstreamD.complete) {
    return "attention_case_study_draft";
  }

  return "attention_case_study_draft";
}

export function buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): Month2MarketReadinessConvergenceEra25OrchestratorSummary {
  const milestone = resolveMonth2MarketReadinessConvergenceEra25Milestone({
    pilotWeek1ExecutionConvergenceEra25Milestone:
      input.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
    month2Complete: input.evaluation.month2State.month2Complete,
    metricsBaselinePassed: input.evaluation.month2State.metricsBaselinePassed,
    phases: input.evaluation.month2State.phases,
  });

  const readyForWeek1ConvergenceRegressionSmokes = WEEK1_CONVERGENCE_BLOCKED_MILESTONES.includes(
    input.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
  );

  const recommendedCommands =
    milestone === "week1_convergence_regression_blocked"
      ? ([
          "npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25 -- --write",
          "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-month2-market-readiness-convergence-era25 -- --json",
          MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write",
          "npm run ops:validate-month2-market-readiness-env -- --json",
          "npm run ops:export-month2-market-readiness-env-template -- --write",
          "npm run ops:sync-month2-market-readiness-progress-report -- --write",
          ...(input.evaluation.month2State.readyForInvestorOnepagerSmoke
            ? ([
                "npm run smoke:investor-narrative-onepager",
                "npm run smoke:pilot-forbidden-claims-enforcement",
              ] as const)
            : ([] as const)),
          ...(milestone === "attention_case_study_draft"
            ? (["npm run smoke:pilot-case-study-draft"] as const)
            : ([] as const)),
          ...(milestone === "month2_market_readiness_convergence_era25_ready"
            ? (["Begin scale readiness convergence on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    pilotWeek1ExecutionConvergenceEra25Milestone:
      input.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    week1ConvergenceReady: input.evaluation.week1ConvergenceReady,
    month2Complete: input.evaluation.month2State.month2Complete,
    goDecision: input.evaluation.month2State.goDecision,
    completedBlockingCount: input.evaluation.month2State.completedBlockingCount,
    totalBlockingCount: input.evaluation.month2State.totalBlockingCount,
    nextPhaseId: input.evaluation.month2State.nextPhaseId,
    nextPhaseLabel: input.evaluation.month2State.nextPhaseLabel,
    readyForInvestorOnepagerSmoke: input.evaluation.month2State.readyForInvestorOnepagerSmoke,
    readyForWeek1ConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildMonth2MarketReadinessConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: Month2MarketReadinessConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Month 2 Market Readiness Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Month 2 convergence** — honest workstreams from MONTH2_* env + investor/case study artifacts.",
    "",
    `Policy: \`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Week 1 convergence milestone: ${input.summary.pilotWeek1ExecutionConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Month 2 complete: ${input.summary.month2Complete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedBlockingCount}/${input.summary.totalBlockingCount} blocking workstreams`,
    `- Next workstream: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Workstreams",
    "",
  ];

  for (const phase of input.evaluation.month2State.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
  lines.push(`Convergence report: \`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH}\``);
  lines.push(
    `Convergence doc: [\`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC}\`](../${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Week 1 convergence doc: [\`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC}\`](../${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 Month 2 reference: [\`${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Investor doc: [\`${MONTH2_INVESTOR_ONEPAGER_DOC}\`](../${MONTH2_INVESTOR_ONEPAGER_DOC})`);
  lines.push("");

  return lines.join("\n");
}
