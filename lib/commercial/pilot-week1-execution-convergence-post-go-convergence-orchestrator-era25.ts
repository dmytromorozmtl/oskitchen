/**
 * era25 Pilot Week 1 Execution Convergence post-GO-convergence orchestrator.
 * Policy: era25-pilot-week1-execution-convergence-post-go-convergence-orchestrator-v1
 */
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import type { PaidPilotGoConvergenceEra25Milestone } from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluatePilotWeek1ExecutionConvergenceEra25 } from "@/lib/commercial/evaluate-pilot-week1-execution-convergence-era25";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-pilot-week1-execution-convergence-post-go-convergence-orchestrator-v1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25" as const;

export type PilotWeek1ExecutionConvergenceEra25Milestone =
  | "go_convergence_regression_blocked"
  | "awaiting_day1_ttv"
  | "attention_integration_health"
  | "awaiting_day3_pos_money_path"
  | "awaiting_day4_reports_review"
  | "awaiting_metrics_baseline"
  | "pilot_week1_execution_convergence_era25_ready";

export type PilotWeek1ExecutionConvergenceEra25OrchestratorSummary = {
  policyId: typeof PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  paidPilotGoConvergenceEra25Milestone: PaidPilotGoConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  goConvergenceReady: boolean;
  week1Complete: boolean;
  goDecision: string | null;
  completedPhaseCount: number;
  totalPhaseCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForDay5Smokes: boolean;
  readyForGoConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const GO_CONVERGENCE_BLOCKED_MILESTONES: readonly PaidPilotGoConvergenceEra25Milestone[] = [
  "breakthrough_regression_blocked",
  "awaiting_icp_qualification",
  "awaiting_loi",
  "attention_forbidden_claims",
  "awaiting_go_decision",
  "awaiting_kickoff_checklist",
] as const;

export function resolvePilotWeek1ExecutionConvergenceEra25Milestone(input: {
  paidPilotGoConvergenceEra25Milestone: PaidPilotGoConvergenceEra25Milestone;
  week1Complete: boolean;
  nextPhaseId: string | null;
}): PilotWeek1ExecutionConvergenceEra25Milestone {
  if (
    input.paidPilotGoConvergenceEra25Milestone !== "paid_pilot_go_convergence_era25_ready"
  ) {
    return "go_convergence_regression_blocked";
  }

  if (input.week1Complete) {
    return "pilot_week1_execution_convergence_era25_ready";
  }

  switch (input.nextPhaseId) {
    case "day1_ttv_onboarding":
      return "awaiting_day1_ttv";
    case "day2_integration_health":
      return "attention_integration_health";
    case "day3_pos_money_path":
      return "awaiting_day3_pos_money_path";
    case "day4_reports_review":
      return "awaiting_day4_reports_review";
    case "day5_metrics_narrative":
      return "awaiting_metrics_baseline";
    default:
      return "awaiting_day1_ttv";
  }
}

export function buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): PilotWeek1ExecutionConvergenceEra25OrchestratorSummary {
  const milestone = resolvePilotWeek1ExecutionConvergenceEra25Milestone({
    paidPilotGoConvergenceEra25Milestone:
      input.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
    week1Complete: input.evaluation.week1State.week1Complete,
    nextPhaseId: input.evaluation.week1State.nextPhaseId,
  });

  const readyForGoConvergenceRegressionSmokes = GO_CONVERGENCE_BLOCKED_MILESTONES.includes(
    input.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
  );

  const recommendedCommands =
    milestone === "go_convergence_regression_blocked"
      ? ([
          "npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25 -- --write",
          "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-pilot-week1-execution-convergence-era25 -- --json",
          PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write",
          "npm run ops:validate-pilot-week1-env -- --json",
          "npm run ops:export-pilot-week1-env-template -- --write",
          "npm run ops:sync-pilot-week1-progress-report -- --write",
          ...(input.evaluation.week1State.readyForDay5Smokes
            ? ([
                "npm run smoke:pilot-metrics-baseline",
                "npm run smoke:pilot-case-study-draft",
                "npm run smoke:pilot-gono-go",
              ] as const)
            : ([] as const)),
          ...(milestone === "pilot_week1_execution_convergence_era25_ready"
            ? (["Begin month 2 market readiness on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    paidPilotGoConvergenceEra25Milestone:
      input.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    goConvergenceReady: input.evaluation.goConvergenceReady,
    week1Complete: input.evaluation.week1State.week1Complete,
    goDecision: input.evaluation.week1State.goDecision,
    completedPhaseCount: input.evaluation.week1State.completedPhaseCount,
    totalPhaseCount: input.evaluation.week1State.totalPhaseCount,
    nextPhaseId: input.evaluation.week1State.nextPhaseId,
    nextPhaseLabel: input.evaluation.week1State.nextPhaseLabel,
    readyForDay5Smokes: input.evaluation.week1State.readyForDay5Smokes,
    readyForGoConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildPilotWeek1ExecutionConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: PilotWeek1ExecutionConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Pilot Week 1 Execution Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Week 1 convergence** — honest day phases from PILOT_WEEK1_* env + Day 5 artifacts.",
    "",
    `Policy: \`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO convergence milestone: ${input.summary.paidPilotGoConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Week 1 complete: ${input.summary.week1Complete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedPhaseCount}/${input.summary.totalPhaseCount} days`,
    `- Next day: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Day phases",
    "",
  ];

  for (const phase of input.evaluation.week1State.phases) {
    lines.push(`- [${phase.complete ? "x" : " "}] **${phase.label}**`);
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
  lines.push(`Convergence report: \`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH}\``);
  lines.push(
    `Convergence doc: [\`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC}\`](../${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `GO convergence doc: [\`${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC}\`](../${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 Week 1 reference: [\`${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push("");

  return lines.join("\n");
}
