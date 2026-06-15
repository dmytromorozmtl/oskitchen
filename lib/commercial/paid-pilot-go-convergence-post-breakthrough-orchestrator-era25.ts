/**
 * era25 Paid Pilot GO Convergence post-breakthrough orchestrator.
 * Policy: era25-paid-pilot-go-convergence-post-breakthrough-orchestrator-v1
 */
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import type { OwnerDailyBriefingBreakthroughEra25Milestone } from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC } from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluatePaidPilotGoConvergenceEra25 } from "@/lib/commercial/evaluate-paid-pilot-go-convergence-era25";

export const PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID =
  "era25-paid-pilot-go-convergence-post-breakthrough-orchestrator-v1" as const;

export const PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_COMMAND =
  "npm run ops:run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25" as const;

export type PaidPilotGoConvergenceEra25Milestone =
  | "breakthrough_regression_blocked"
  | "awaiting_icp_qualification"
  | "awaiting_loi"
  | "attention_forbidden_claims"
  | "awaiting_go_decision"
  | "awaiting_kickoff_checklist"
  | "paid_pilot_go_convergence_era25_ready";

export type PaidPilotGoConvergenceEra25OrchestratorSummary = {
  policyId: typeof PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID;
  milestone: PaidPilotGoConvergenceEra25Milestone;
  ownerDailyBriefingBreakthroughEra25Milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  convergenceBlocked: boolean;
  goDecision: string | null;
  icpQualified: boolean;
  loiRecorded: boolean;
  forbiddenClaimsPassed: boolean;
  kickoffChecklistPresent: boolean;
  artifactPresent: boolean;
  readyForBreakthroughRegressionSmokes: boolean;
  readyForIcpSmokes: boolean;
  readyForLoiSmokes: boolean;
  readyForForbiddenClaimsSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const BREAKTHROUGH_BLOCKED_MILESTONES: readonly OwnerDailyBriefingBreakthroughEra25Milestone[] = [
  "blueprint_regression_blocked",
  "awaiting_staging_proof",
  "attention_briefing_gaps",
] as const;

export function resolvePaidPilotGoConvergenceEra25Milestone(input: {
  ownerDailyBriefingBreakthroughEra25Milestone: OwnerDailyBriefingBreakthroughEra25Milestone;
  icpQualified: boolean;
  loiRecorded: boolean;
  forbiddenClaimsPassed: boolean;
  kickoffChecklistPresent: boolean;
  goDecision: string | null;
}): PaidPilotGoConvergenceEra25Milestone {
  if (
    input.ownerDailyBriefingBreakthroughEra25Milestone !==
    "owner_daily_briefing_breakthrough_era25_ready"
  ) {
    return "breakthrough_regression_blocked";
  }

  if (!input.icpQualified) {
    return "awaiting_icp_qualification";
  }

  if (!input.loiRecorded) {
    return "awaiting_loi";
  }

  if (!input.forbiddenClaimsPassed) {
    return "attention_forbidden_claims";
  }

  if (input.goDecision !== "GO") {
    return "awaiting_go_decision";
  }

  if (!input.kickoffChecklistPresent) {
    return "awaiting_kickoff_checklist";
  }

  return "paid_pilot_go_convergence_era25_ready";
}

export function buildPaidPilotGoConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluatePaidPilotGoConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): PaidPilotGoConvergenceEra25OrchestratorSummary {
  const milestone = resolvePaidPilotGoConvergenceEra25Milestone({
    ownerDailyBriefingBreakthroughEra25Milestone:
      input.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
    icpQualified: input.evaluation.goState.icpQualified,
    loiRecorded: input.evaluation.goState.loiRecorded,
    forbiddenClaimsPassed: input.evaluation.goState.forbiddenClaimsPassed,
    kickoffChecklistPresent: input.evaluation.kickoffChecklistPresent,
    goDecision: input.evaluation.goState.decision,
  });

  const readyForBreakthroughRegressionSmokes = BREAKTHROUGH_BLOCKED_MILESTONES.includes(
    input.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
  );
  const readyForIcpSmokes = !input.evaluation.goState.icpQualified;
  const readyForLoiSmokes = !input.evaluation.goState.loiRecorded;
  const readyForForbiddenClaimsSmokes = !input.evaluation.goState.forbiddenClaimsPassed;

  const recommendedCommands =
    milestone === "breakthrough_regression_blocked"
      ? ([
          "npm run ops:run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25 -- --write",
          "npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-paid-pilot-go-convergence-era25 -- --json",
          PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_COMMAND + " -- --write",
          "npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write",
          ...(readyForIcpSmokes
            ? (["Set PILOT_ICP_* env vars and npm run smoke:pilot-gono-go"] as const)
            : ([] as const)),
          ...(readyForLoiSmokes
            ? ([
                "Set PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE",
                "npm run smoke:pilot-gono-go",
              ] as const)
            : ([] as const)),
          ...(readyForForbiddenClaimsSmokes
            ? (["npm run smoke:pilot-forbidden-claims-enforcement"] as const)
            : ([] as const)),
          ...(milestone === "awaiting_go_decision"
            ? (["npm run smoke:pilot-gono-go", "Resolve GO/NO-GO blockers honestly"] as const)
            : ([] as const)),
          ...(milestone === "awaiting_kickoff_checklist"
            ? ([`Complete ${PAID_PILOT_GO_CONVERGENCE_ERA25_KICKOFF_CHECKLIST_DOC}`] as const)
            : ([] as const)),
          ...(milestone === "paid_pilot_go_convergence_era25_ready"
            ? (["Begin pilot week 1 execution on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID,
    milestone,
    ownerDailyBriefingBreakthroughEra25Milestone:
      input.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    goDecision: input.evaluation.goState.decision,
    icpQualified: input.evaluation.goState.icpQualified,
    loiRecorded: input.evaluation.goState.loiRecorded,
    forbiddenClaimsPassed: input.evaluation.goState.forbiddenClaimsPassed,
    kickoffChecklistPresent: input.evaluation.kickoffChecklistPresent,
    artifactPresent: input.evaluation.goState.artifactPresent,
    readyForBreakthroughRegressionSmokes,
    readyForIcpSmokes,
    readyForLoiSmokes,
    readyForForbiddenClaimsSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildPaidPilotGoConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: PaidPilotGoConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluatePaidPilotGoConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Paid Pilot GO Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **B3 GO convergence** — honest GO/NO-GO from artifacts, never fake PASS.",
    "",
    `Policy: \`${PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Breakthrough milestone: ${input.summary.ownerDailyBriefingBreakthroughEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- GO decision: ${input.summary.goDecision ?? "missing artifact"}`,
    `- ICP qualified: ${input.summary.icpQualified ? "yes" : "no"}`,
    `- LOI recorded: ${input.summary.loiRecorded ? "yes" : "no"}`,
    `- Forbidden claims passed: ${input.summary.forbiddenClaimsPassed ? "yes" : "no"}`,
    `- Kickoff checklist present: ${input.summary.kickoffChecklistPresent ? "yes" : "no"}`,
    "",
    "## Convergence targets",
    "",
  ];

  for (const target of PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of PAID_PILOT_GO_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
  lines.push(`Convergence report: \`${PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH}\``);
  lines.push(
    `Convergence doc: [\`${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC}\`](../${PAID_PILOT_GO_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Breakthrough doc: [\`${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC}\`](../${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push("");

  return lines.join("\n");
}
