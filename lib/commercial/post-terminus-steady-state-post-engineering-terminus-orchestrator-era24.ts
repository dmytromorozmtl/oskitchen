/**
 * Post-terminus steady state post-engineering-terminus orchestrator — loop milestones.
 * Policy: era24-post-terminus-steady-state-post-engineering-terminus-orchestrator-v1
 */
import {
  ENGINEERING_PATH_TERMINUS_STEP13_DOC,
} from "@/lib/commercial/engineering-path-terminus-era24";
import {
  type EngineeringPathTerminusMilestone,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import {
  POST_TERMINUS_STEADY_STATE_REPORT_PATH,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
  type SteadyStateTrackStatus,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";

export const POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID =
  "era24-post-terminus-steady-state-post-engineering-terminus-orchestrator-v1" as const;

export const POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_COMMAND =
  "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator" as const;

export const STEADY_STATE_MEASURABLE_TRACK_IDS = [
  "weekly_maintenance",
  "weekly_improvement_loop",
  "weekly_product_evolution",
] as const;

export type PostTerminusSteadyStateMilestone =
  | "engineering_terminus_blocked"
  | "attention_maintenance_rhythm"
  | "attention_upstream_loop"
  | "steady_state_healthy";

export type PostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary = {
  policyId: typeof POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID;
  milestone: PostTerminusSteadyStateMilestone;
  steadyStateActive: boolean;
  engineeringTerminusActive: boolean;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  readyForMaintenanceRhythmSmokes: boolean;
  readyForUpstreamLoopSmokes: boolean;
  goDecision: string | null;
  healthyCount: number;
  overdueCount: number;
  guidanceCount: number;
  nextAttentionTrackId: string | null;
  nextAttentionTrackLabel: string | null;
  steadyStateReportPresent: boolean;
  recommendedCommands: readonly string[];
};

function findTrack(
  tracks: readonly Pick<SteadyStateTrackStatus, "id" | "status" | "label">[],
  id: string,
): Pick<SteadyStateTrackStatus, "id" | "status" | "label"> | undefined {
  return tracks.find((track) => track.id === id);
}

export function resolvePostTerminusSteadyStateMilestone(input: {
  steadyStateActive: boolean;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  tracks: readonly Pick<SteadyStateTrackStatus, "id" | "status">[];
}): PostTerminusSteadyStateMilestone {
  if (
    !input.steadyStateActive ||
    input.engineeringPathTerminusMilestone !== "engineering_path_terminus_healthy"
  ) {
    return "engineering_terminus_blocked";
  }

  const maintenance = findTrack(input.tracks, "weekly_maintenance");
  if (maintenance?.status === "overdue") {
    return "attention_maintenance_rhythm";
  }

  const improvement = findTrack(input.tracks, "weekly_improvement_loop");
  const evolution = findTrack(input.tracks, "weekly_product_evolution");
  if (improvement?.status === "overdue" || evolution?.status === "overdue") {
    return "attention_upstream_loop";
  }

  return "steady_state_healthy";
}

export function resolvePostTerminusSteadyStateMilestoneFromTrackStatuses(
  tracks: readonly Pick<SteadyStateTrackStatus, "id" | "status">[],
  input: {
    steadyStateActive: boolean;
    engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  },
): PostTerminusSteadyStateMilestone {
  return resolvePostTerminusSteadyStateMilestone({
    steadyStateActive: input.steadyStateActive,
    engineeringPathTerminusMilestone: input.engineeringPathTerminusMilestone,
    tracks,
  });
}

export function buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSteadyStateOperatorLoop>;
  engineeringPathTerminusMilestone: EngineeringPathTerminusMilestone;
  artifacts: { steadyStateReportPresent: boolean };
}): PostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary {
  const milestone = resolvePostTerminusSteadyStateMilestone({
    steadyStateActive: input.evaluation.steadyStateActive,
    engineeringPathTerminusMilestone: input.engineeringPathTerminusMilestone,
    tracks: input.evaluation.tracks,
  });

  const maintenance = findTrack(input.evaluation.tracks, "weekly_maintenance");
  const improvement = findTrack(input.evaluation.tracks, "weekly_improvement_loop");
  const evolution = findTrack(input.evaluation.tracks, "weekly_product_evolution");
  const nextAttention =
    input.evaluation.tracks.find((track) => track.status === "overdue") ?? null;

  const readyForMaintenanceRhythmSmokes =
    input.evaluation.steadyStateActive &&
    (maintenance?.status === "overdue" ||
      input.evaluation.maintenance.maintenanceModeMilestone !== "maintenance_mode_healthy");
  const readyForUpstreamLoopSmokes =
    input.evaluation.steadyStateActive &&
    (improvement?.status === "overdue" || evolution?.status === "overdue");

  const recommendedCommands = input.evaluation.steadyStateActive
    ? ([
        "npm run ops:validate-commercial-pilot-path -- --json",
        "npm run ops:validate-steady-state-operator-loop -- --json",
        POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:sync-steady-state-operator-loop-report -- --write",
        "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
        "npm run ops:sync-commercial-pilot-path-status-report -- --write",
        ...(readyForMaintenanceRhythmSmokes || milestone === "attention_maintenance_rhythm"
          ? ([
              "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
              "npm run ops:sync-maintenance-mode-playbook-report -- --write",
              "npm run smoke:woo-shopify-live",
            ] as const)
          : ([] as const)),
        ...(readyForUpstreamLoopSmokes || milestone === "attention_upstream_loop"
          ? ([
              "npm run ops:validate-continuous-improvement-loop -- --json",
              "npm run ops:validate-sustained-product-evolution -- --json",
              "npm run smoke:pilot-metrics-baseline",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
        "npm run ops:validate-commercial-pilot-path -- --json",
        "npm run ops:validate-maintenance-mode -- --json",
      ] as const);

  return {
    policyId: POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID,
    milestone,
    steadyStateActive: input.evaluation.steadyStateActive,
    engineeringTerminusActive: input.evaluation.engineeringTerminusActive,
    engineeringPathTerminusMilestone: input.engineeringPathTerminusMilestone,
    readyForMaintenanceRhythmSmokes,
    readyForUpstreamLoopSmokes,
    goDecision: input.evaluation.goDecision,
    healthyCount: input.evaluation.health.healthyCount,
    overdueCount: input.evaluation.health.overdueCount,
    guidanceCount: input.evaluation.health.guidanceCount,
    nextAttentionTrackId: nextAttention?.id ?? null,
    nextAttentionTrackLabel: nextAttention?.label ?? null,
    steadyStateReportPresent: input.artifacts.steadyStateReportPresent,
    recommendedCommands,
  };
}

export function buildPostTerminusSteadyStateOrchestratorReportMarkdown(input: {
  summary: PostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSteadyStateOperatorLoop>;
}): string {
  const lines: string[] = [
    "# Post-Terminus Steady State — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Informational only** — repeat Step 12 rhythms forever; no era25 gates without charter.",
    "",
    `Policy: \`${POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Steady state active: ${input.summary.steadyStateActive ? "yes" : "no"}`,
    `- Engineering terminus active: ${input.summary.engineeringTerminusActive ? "yes" : "no"}`,
    `- Engineering path milestone: ${input.summary.engineeringPathTerminusMilestone}`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Overdue / healthy / guidance: ${input.summary.overdueCount} / ${input.summary.healthyCount} / ${input.summary.guidanceCount}`,
    `- Next attention: ${input.summary.nextAttentionTrackLabel ?? "none — measurable tracks fresh"}`,
    `- Ready for maintenance rhythm smokes: ${input.summary.readyForMaintenanceRhythmSmokes ? "yes" : "no"}`,
    `- Ready for upstream loop smokes: ${input.summary.readyForUpstreamLoopSmokes ? "yes" : "no"}`,
    "",
    "## Operator tracks (6)",
    "",
  ];

  for (const track of input.evaluation.tracks) {
    lines.push(
      `- [${track.status === "healthy" ? "x" : " "}] **${track.label}** (${track.ownerRole})`,
    );
    lines.push(`  - Status: ${track.status}`);
    lines.push(`  - ${track.detail}`);
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/platform/commercial-pilot-ops#post-terminus-steady-state` — steady-state tracks");
  lines.push("- [ ] `/platform/commercial-pilot-ops#engineering-path-terminus` — master path catalog");
  lines.push("- [ ] `/dashboard/today` — maintenance compact panel");
  lines.push("- [ ] `/dashboard/launch-wizard` — new pilots only");
  lines.push("");
  lines.push("## Ops commands");
  lines.push("");
  lines.push("```bash");
  for (const command of input.summary.recommendedCommands) {
    lines.push(command);
  }
  lines.push("```");
  lines.push("");
  lines.push(`Steady-state report: \`${POST_TERMINUS_STEADY_STATE_REPORT_PATH}\``);
  lines.push(
    `Step 13 doc: [\`${ENGINEERING_PATH_TERMINUS_STEP13_DOC}\`](../${ENGINEERING_PATH_TERMINUS_STEP13_DOC})`,
  );
  lines.push(
    `Step 14 doc: [\`${POST_TERMINUS_STEADY_STATE_STEP14_DOC}\`](../${POST_TERMINUS_STEADY_STATE_STEP14_DOC})`,
  );
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}#post-terminus-steady-state\``);
  lines.push("");

  return lines.join("\n");
}
