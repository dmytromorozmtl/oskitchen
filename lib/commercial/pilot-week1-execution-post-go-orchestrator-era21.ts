/**
 * Pilot Week 1 post-GO orchestrator — day milestones, readiness, honest gates.
 * Policy: era21-pilot-week1-execution-post-go-orchestrator-v1
 */
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_WEEK1_EXECUTION_STEP4_DOC,
  PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC,
  resolveNextIncompletePilotWeek1ExecutionPhase,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import type { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

export const PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-pilot-week1-execution-post-go-orchestrator-v1" as const;

export const PILOT_WEEK1_READINESS_CHECKLIST_PATH =
  "docs/pilot-week1-readiness-checklist.md" as const;

export const PILOT_WEEK1_POST_GO_ORCHESTRATOR_COMMAND =
  "npm run ops:run-pilot-week1-execution-post-go-orchestrator" as const;

export const PILOT_WEEK1_READINESS_EXPORT_COMMAND =
  "npm run ops:export-pilot-week1-readiness-checklist -- --write" as const;

export type PilotWeek1ExecutionMilestone =
  | "go_blocked"
  | "day1_ttv_onboarding"
  | "day2_integration_health"
  | "day3_pos_money_path"
  | "day4_reports_review"
  | "day5_metrics_narrative"
  | "week1_complete";

export type PilotWeek1PostGoOrchestratorSummary = {
  policyId: typeof PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: PilotWeek1ExecutionMilestone;
  prerequisitesComplete: boolean;
  week1Complete: boolean;
  readyForDay5Smokes: boolean;
  goDecision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  caseStudyDraftArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolvePilotWeek1ExecutionMilestone(input: {
  prerequisitesComplete: boolean;
  week1Complete: boolean;
  phases: readonly { id: string; complete: boolean }[];
}): PilotWeek1ExecutionMilestone {
  if (!input.prerequisitesComplete) return "go_blocked";
  if (input.week1Complete) return "week1_complete";

  const next = input.phases.find((phase) => !phase.complete);
  if (!next) return "week1_complete";

  switch (next.id) {
    case "day1_ttv_onboarding":
      return "day1_ttv_onboarding";
    case "day2_integration_health":
      return "day2_integration_health";
    case "day3_pos_money_path":
      return "day3_pos_money_path";
    case "day4_reports_review":
      return "day4_reports_review";
    case "day5_metrics_narrative":
      return "day5_metrics_narrative";
    default:
      return "day1_ttv_onboarding";
  }
}

export function resolvePilotWeek1ExecutionMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    week1Complete: boolean;
  },
): PilotWeek1ExecutionMilestone {
  return resolvePilotWeek1ExecutionMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    week1Complete: input.week1Complete,
    phases,
  });
}

export function buildPilotWeek1PostGoOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluatePilotWeek1Env>;
  artifacts: {
    goNoGoPresent: boolean;
    metricsBaselinePresent: boolean;
    caseStudyDraftPresent: boolean;
  };
}): PilotWeek1PostGoOrchestratorSummary {
  const nextPhase = resolveNextIncompletePilotWeek1ExecutionPhase(input.evaluation.phases);
  const milestone = resolvePilotWeek1ExecutionMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    week1Complete: input.evaluation.week1Complete,
    phases: input.evaluation.phases,
  });

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-commercial-go-closure-env -- --json",
        "npm run ops:validate-pilot-week1-env -- --json",
        PILOT_WEEK1_POST_GO_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-pilot-week1-env-template -- --write",
        "npm run ops:sync-pilot-week1-progress-report -- --write",
        PILOT_WEEK1_READINESS_EXPORT_COMMAND,
        ...(input.evaluation.readyForDay5Smokes
          ? ([
              "npm run smoke:pilot-metrics-baseline",
              "npm run smoke:pilot-case-study-draft",
              "npm run smoke:pilot-gono-go",
            ] as const)
          : ([] as const)),
      ] as const)
    : ([
        "npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write",
        "npm run ops:validate-commercial-go-closure-env -- --json",
        "npm run smoke:pilot-gono-go",
      ] as const);

  return {
    policyId: PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    week1Complete: input.evaluation.week1Complete,
    readyForDay5Smokes: input.evaluation.readyForDay5Smokes,
    goDecision: input.evaluation.goDecision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    caseStudyDraftArtifactPresent: input.artifacts.caseStudyDraftPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildPilotWeek1ReadinessChecklistMarkdown(input: {
  summary: PilotWeek1PostGoOrchestratorSummary;
  evaluation: ReturnType<typeof evaluatePilotWeek1Env>;
}): string {
  const lines: string[] = [
    "# Pilot Week 1 — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — record real TTV, order IDs, and Day 5 artifacts; never hand-edit PASS.",
    "",
    `Policy: \`${PILOT_WEEK1_POST_GO_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Week 1 complete: ${input.summary.week1Complete ? "yes" : "no"}`,
    `- Ready for Day 5 smokes: ${input.summary.readyForDay5Smokes ? "yes" : "no"}`,
    `- Next day: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Day checklist (5 days)",
    "",
  ];

  for (const phase of input.evaluation.phases) {
    lines.push(`- [${phase.complete ? "x" : " "}] **${phase.label}**`);
    lines.push(`  - ${phase.detail}`);
    if (phase.routes.length > 0) {
      lines.push(`  - Routes: ${phase.routes.map((route) => `\`${route}\``).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("## Tracked env vars");
  lines.push("");
  if (input.evaluation.missing.length === 0) {
    lines.push("All tracked PILOT_WEEK1_* env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Week 1 top action (priority 3)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Week 1 phases in commercial blockers");
  lines.push("- [ ] `/dashboard/integration-health` — Week 1 cadence banner");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — Week 1 phases panel");
  lines.push("- [ ] `/dashboard/reports` — Day 4 next-action cards");
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
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Forbidden narrative: [\`${PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC}\`](../${PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC})`);
  lines.push(`Step 4 doc: [\`${PILOT_WEEK1_EXECUTION_STEP4_DOC}\`](../${PILOT_WEEK1_EXECUTION_STEP4_DOC})`);
  lines.push("");

  return lines.join("\n");
}
