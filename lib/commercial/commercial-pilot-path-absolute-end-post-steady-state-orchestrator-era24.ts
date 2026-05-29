/**
 * Commercial pilot path absolute end post-steady-state orchestrator — closure milestones.
 * Policy: era24-commercial-pilot-path-absolute-end-post-steady-state-orchestrator-v1
 */
import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
  PATH_ABSOLUTE_END_LAYERS,
  STEADY_STATE_PRODUCT_SURFACES,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import {
  type PostTerminusSteadyStateMilestone,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { POST_TERMINUS_STEADY_STATE_STEP14_DOC } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-commercial-pilot-path-absolute-end-post-steady-state-orchestrator-v1" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator" as const;

export type CommercialPilotPathAbsoluteEndMilestone =
  | "steady_state_blocked"
  | "attention_path_closure"
  | "absolute_end_healthy";

export type CommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary = {
  policyId: typeof COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: CommercialPilotPathAbsoluteEndMilestone;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
  steadyStateMilestone: PostTerminusSteadyStateMilestone;
  readyForSteadyStateSmokes: boolean;
  readyForPathClosureSmokes: boolean;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  firstBlockedStepNumber: number | null;
  firstBlockedStepLabel: string | null;
  firstBlockedGateStepNumber: number | null;
  firstBlockedGateStepLabel: string | null;
  absoluteEndReportPresent: boolean;
  recommendedCommands: readonly string[];
};

export function resolveCommercialPilotPathAbsoluteEndMilestone(input: {
  absoluteEndActive: boolean;
  steadyStateMilestone: PostTerminusSteadyStateMilestone;
  firstBlockedStep: { step: number; label: string } | null;
  firstBlockedGateStep: { step: number; label: string } | null;
}): CommercialPilotPathAbsoluteEndMilestone {
  if (!input.absoluteEndActive || input.steadyStateMilestone !== "steady_state_healthy") {
    return "steady_state_blocked";
  }

  if (input.firstBlockedGateStep || input.firstBlockedStep) {
    return "attention_path_closure";
  }

  return "absolute_end_healthy";
}

export function buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEnd>;
  steadyStateMilestone: PostTerminusSteadyStateMilestone;
  artifacts: { absoluteEndReportPresent: boolean };
}): CommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary {
  const milestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive: input.evaluation.absoluteEndActive,
    steadyStateMilestone: input.steadyStateMilestone,
    firstBlockedStep: input.evaluation.path.summary.firstBlockedStep,
    firstBlockedGateStep: input.evaluation.path.summary.firstBlockedGateStep,
  });

  const readyForSteadyStateSmokes =
    !input.evaluation.absoluteEndActive ||
    input.steadyStateMilestone !== "steady_state_healthy" ||
    input.evaluation.steadyState.health.overdueCount > 0;
  const readyForPathClosureSmokes =
    input.evaluation.path.summary.firstBlockedGateStep !== null;

  const recommendedCommands = input.evaluation.absoluteEndActive
    ? ([
        "npm run ops:validate-steady-state-operator-loop -- --json",
        "npm run ops:validate-commercial-pilot-path-absolute-end -- --json",
        COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write",
        "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
        "npm run ops:sync-steady-state-operator-loop-report -- --write",
        ...(readyForPathClosureSmokes || milestone === "attention_path_closure"
          ? ([
              "npm run ops:validate-commercial-pilot-path -- --json",
              "npm run ops:validate-p0-vault-env -- --json",
              "npm run ops:validate-commercial-go-closure-env -- --json",
            ] as const)
          : ([] as const)),
        ...(readyForSteadyStateSmokes || milestone === "steady_state_blocked"
          ? ([
              "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
              "npm run ops:validate-maintenance-mode -- --json",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
        "npm run ops:validate-steady-state-operator-loop -- --json",
        "npm run ops:validate-commercial-pilot-path -- --json",
      ] as const);

  return {
    policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    absoluteEndActive: input.evaluation.absoluteEndActive,
    pathEngineeringClosed: input.evaluation.pathEngineeringClosed,
    steadyStateMilestone: input.steadyStateMilestone,
    readyForSteadyStateSmokes,
    readyForPathClosureSmokes,
    goDecision: input.evaluation.goDecision,
    completedSteps: input.evaluation.completedSteps,
    totalSteps: input.evaluation.totalSteps,
    firstBlockedStepNumber: input.evaluation.path.summary.firstBlockedStep?.step ?? null,
    firstBlockedStepLabel: input.evaluation.path.summary.firstBlockedStep?.label ?? null,
    firstBlockedGateStepNumber: input.evaluation.path.summary.firstBlockedGateStep?.step ?? null,
    firstBlockedGateStepLabel: input.evaluation.path.summary.firstBlockedGateStep?.label ?? null,
    absoluteEndReportPresent: input.artifacts.absoluteEndReportPresent,
    recommendedCommands,
  };
}

export function buildCommercialPilotPathAbsoluteEndOrchestratorReportMarkdown(input: {
  summary: CommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEnd>;
}): string {
  const lines: string[] = [
    "# Commercial Pilot Path Absolute End — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — linear path engineering closed; era25+ requires explicit charter.",
    "",
    `Policy: \`${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Absolute end active: ${input.summary.absoluteEndActive ? "yes" : "no"}`,
    `- Path engineering closed: ${input.summary.pathEngineeringClosed ? "yes" : "no"}`,
    `- Steady state milestone: ${input.summary.steadyStateMilestone}`,
    `- Steps complete: ${input.summary.completedSteps}/${input.summary.totalSteps}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- First blocked: ${input.summary.firstBlockedStepLabel ?? "none"}`,
    `- First blocked gate: ${input.summary.firstBlockedGateStepLabel ?? "none"}`,
    `- Ready for steady state smokes: ${input.summary.readyForSteadyStateSmokes ? "yes" : "no"}`,
    `- Ready for path closure smokes: ${input.summary.readyForPathClosureSmokes ? "yes" : "no"}`,
    "",
    "## Path layers (Steps 12–15)",
    "",
  ];

  for (const layer of PATH_ABSOLUTE_END_LAYERS) {
    lines.push(`- **Step ${layer.step}** — ${layer.label} · \`${layer.policyId}\``);
  }

  lines.push("");
  lines.push("## Steady-state product surfaces");
  lines.push("");
  for (const surface of STEADY_STATE_PRODUCT_SURFACES) {
    lines.push(`- **${surface.label}** → \`${surface.route}\` · ${surface.rhythm}`);
  }

  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Absolute end report: \`${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH}\``);
  lines.push(
    `Step 14 doc: [\`${POST_TERMINUS_STEADY_STATE_STEP14_DOC}\`](../${POST_TERMINUS_STEADY_STATE_STEP14_DOC})`,
  );
  lines.push(
    `Step 15 doc: [\`${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC}\`](../${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}#commercial-pilot-path-absolute-end\``,
  );
  lines.push("");

  return lines.join("\n");
}
