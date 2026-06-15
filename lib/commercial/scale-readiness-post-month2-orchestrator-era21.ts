/**
 * Scale readiness post-Month 2 orchestrator — gate milestones, readiness, honest gates.
 * Policy: era21-scale-readiness-post-month2-orchestrator-v1
 */
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SCALE_READINESS_FORBIDDEN_CLAIMS_DOC,
  SCALE_READINESS_ROLLBACK_DOC,
  SCALE_READINESS_STEP6_DOC,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  resolveNextIncompleteScaleReadinessPhase,
} from "@/lib/commercial/scale-readiness-phases-era21";
import type { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

export const SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-scale-readiness-post-month2-orchestrator-v1" as const;

export const SCALE_READINESS_READINESS_CHECKLIST_PATH =
  "docs/scale-readiness-readiness-checklist.md" as const;

export const SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_COMMAND =
  "npm run ops:run-scale-readiness-post-month2-orchestrator" as const;

export const SCALE_READINESS_READINESS_EXPORT_COMMAND =
  "npm run ops:export-scale-readiness-readiness-checklist -- --write" as const;

export type ScaleReadinessMilestone =
  | "month2_blocked"
  | "gate1_per_customer_pilot_ops"
  | "gate2_soc2_readiness_track"
  | "gate3_enterprise_sso_production"
  | "gate4_operational_resilience"
  | "gate5_data_room_artifact_chain"
  | "scale_complete";

export type ScaleReadinessPostMonth2OrchestratorSummary = {
  policyId: typeof SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: ScaleReadinessMilestone;
  prerequisitesComplete: boolean;
  month2Complete: boolean;
  scaleComplete: boolean;
  readyForResilienceSmokes: boolean;
  goDecision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  p0StagingArtifactPresent: boolean;
  tier2ArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  caseStudyDraftArtifactPresent: boolean;
  investorOnepagerArtifactPresent: boolean;
  rollbackDrillArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveScaleReadinessMilestone(input: {
  prerequisitesComplete: boolean;
  month2Complete: boolean;
  scaleComplete: boolean;
  phases: readonly { id: string; complete: boolean; optional: boolean }[];
}): ScaleReadinessMilestone {
  if (!input.month2Complete || !input.prerequisitesComplete) return "month2_blocked";
  if (input.scaleComplete) return "scale_complete";

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "scale_complete";

  switch (nextBlocking.id) {
    case "gate1_per_customer_pilot_ops":
      return "gate1_per_customer_pilot_ops";
    case "gate2_soc2_readiness_track":
      return "gate2_soc2_readiness_track";
    case "gate3_enterprise_sso_production":
      return "gate3_enterprise_sso_production";
    case "gate4_operational_resilience":
      return "gate4_operational_resilience";
    case "gate5_data_room_artifact_chain":
      return "gate5_data_room_artifact_chain";
    default:
      return "gate1_per_customer_pilot_ops";
  }
}

export function resolveScaleReadinessMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean; optional: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    month2Complete: boolean;
    scaleComplete: boolean;
  },
): ScaleReadinessMilestone {
  return resolveScaleReadinessMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    month2Complete: input.month2Complete,
    scaleComplete: input.scaleComplete,
    phases,
  });
}

export function buildScaleReadinessPostMonth2OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateScaleReadinessEnv>;
  artifacts: {
    goNoGoPresent: boolean;
    p0StagingPresent: boolean;
    tier2Present: boolean;
    metricsBaselinePresent: boolean;
    caseStudyDraftPresent: boolean;
    investorOnepagerPresent: boolean;
    rollbackDrillPresent: boolean;
  };
}): ScaleReadinessPostMonth2OrchestratorSummary {
  const nextPhase = resolveNextIncompleteScaleReadinessPhase(input.evaluation.phases);
  const milestone = resolveScaleReadinessMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    month2Complete: input.evaluation.month2Complete,
    scaleComplete: input.evaluation.scaleComplete,
    phases: input.evaluation.phases,
  });

  const readyForResilienceSmokes = input.evaluation.readyForResilienceSmokes;

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-month2-market-readiness-integrity -- --json",
        "npm run ops:validate-scale-readiness-integrity -- --json",
        "npm run ops:validate-month2-market-readiness-env -- --json",
        "npm run ops:validate-scale-readiness-env -- --json",
        SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-scale-readiness-env-template -- --write",
        "npm run ops:sync-scale-readiness-progress-report -- --write",
        SCALE_READINESS_READINESS_EXPORT_COMMAND,
        ...(readyForResilienceSmokes
          ? ([
              "npm run smoke:pilot-rollback-drill",
              "npm run smoke:commerce-webhook-drill",
              "npm run smoke:webhook-replay-p1-expansion",
            ] as const)
          : ([] as const)),
        ...(milestone === "gate5_data_room_artifact_chain"
          ? ([
              "npm run smoke:investor-narrative-onepager",
              "npm run smoke:pilot-metrics-baseline",
            ] as const)
          : ([] as const)),
        ...(milestone === "gate2_soc2_readiness_track"
          ? (["npm run smoke:pilot-forbidden-claims-enforcement"] as const)
          : ([] as const)),
        "npm run smoke:pilot-gono-go",
      ] as const)
    : ([
        "npm run ops:run-month2-market-readiness-post-week1-orchestrator -- --write",
        "npm run ops:validate-month2-market-readiness-env -- --json",
        "npm run smoke:investor-narrative-onepager",
      ] as const);

  return {
    policyId: SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    month2Complete: input.evaluation.month2Complete,
    scaleComplete: input.evaluation.scaleComplete,
    readyForResilienceSmokes,
    goDecision: input.evaluation.goDecision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    p0StagingArtifactPresent: input.artifacts.p0StagingPresent,
    tier2ArtifactPresent: input.artifacts.tier2Present,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    caseStudyDraftArtifactPresent: input.artifacts.caseStudyDraftPresent,
    investorOnepagerArtifactPresent: input.artifacts.investorOnepagerPresent,
    rollbackDrillArtifactPresent: input.artifacts.rollbackDrillPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildScaleReadinessReadinessChecklistMarkdown(input: {
  summary: ScaleReadinessPostMonth2OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateScaleReadinessEnv>;
}): string {
  const lines: string[] = [
    "# Scale Readiness — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — separate GO per customer; never claim SOC2 until audit complete.",
    "",
    `Policy: \`${SCALE_READINESS_POST_MONTH2_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Month 2 complete: ${input.summary.month2Complete ? "yes" : "no"}`,
    `- Scale complete: ${input.summary.scaleComplete ? "yes" : "no"}`,
    `- Ready for resilience smokes: ${input.summary.readyForResilienceSmokes ? "yes" : "no"}`,
    `- Next gate: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Gate checklist (1–6)",
    "",
  ];

  for (const phase of input.evaluation.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
    if (phase.routes.length > 0) {
      lines.push(`  - Routes: ${phase.routes.map((route) => `\`${route}\``).join(", ")}`);
    }
    if (phase.smokeScripts.length > 0) {
      lines.push(`  - Smokes: ${phase.smokeScripts.map((script) => `\`${script}\``).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("## Tracked env vars");
  lines.push("");
  if (input.evaluation.missing.length === 0) {
    lines.push("All tracked SCALE_* env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Scale readiness top action (priority 5)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Scale gates in commercial blockers");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#scale-readiness` phases panel");
  lines.push("- [ ] `/dashboard/integration-health` — SSO production status");
  lines.push("- [ ] `/dashboard/implementation` — per-customer GO isolation");
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
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Rollback drill: \`${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH}\``);
  lines.push(
    `Forbidden claims: [\`${SCALE_READINESS_FORBIDDEN_CLAIMS_DOC}\`](../${SCALE_READINESS_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Rollback doc: [\`${SCALE_READINESS_ROLLBACK_DOC}\`](../${SCALE_READINESS_ROLLBACK_DOC})`,
  );
  lines.push(`Step 6 doc: [\`${SCALE_READINESS_STEP6_DOC}\`](../${SCALE_READINESS_STEP6_DOC})`);
  lines.push("");

  return lines.join("\n");
}
