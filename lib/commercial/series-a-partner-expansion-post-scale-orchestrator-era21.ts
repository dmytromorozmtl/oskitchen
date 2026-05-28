/**
 * Series A / partner expansion post-Scale orchestrator — track milestones, readiness, honest gates.
 * Policy: era21-series-a-partner-expansion-post-scale-orchestrator-v1
 */
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  resolveNextIncompleteSeriesAPartnerExpansionPhase,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import type { evaluateSeriesAPartnerExpansionEnv } from "@/scripts/ops/validate-series-a-partner-expansion-env";

export const SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-series-a-partner-expansion-post-scale-orchestrator-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_READINESS_CHECKLIST_PATH =
  "docs/series-a-partner-expansion-readiness-checklist.md" as const;

export const SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator" as const;

export const SERIES_A_PARTNER_EXPANSION_READINESS_EXPORT_COMMAND =
  "npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write" as const;

export type SeriesAPartnerExpansionMilestone =
  | "scale_blocked"
  | "track_a_series_a_data_room"
  | "track_b_partner_channel_expansion"
  | "track_c_multi_region_playbook"
  | "track_d_customer_success_repeatability"
  | "series_a_complete";

export type SeriesAPartnerExpansionPostScaleOrchestratorSummary = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: SeriesAPartnerExpansionMilestone;
  prerequisitesComplete: boolean;
  scaleComplete: boolean;
  seriesAComplete: boolean;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
  goDecision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  p0StagingArtifactPresent: boolean;
  tier2ArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  caseStudyDraftArtifactPresent: boolean;
  investorOnepagerArtifactPresent: boolean;
  competitorMatrixArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveSeriesAPartnerExpansionMilestone(input: {
  prerequisitesComplete: boolean;
  scaleComplete: boolean;
  seriesAComplete: boolean;
  phases: readonly { id: string; complete: boolean; optional: boolean }[];
}): SeriesAPartnerExpansionMilestone {
  if (!input.scaleComplete || !input.prerequisitesComplete) return "scale_blocked";
  if (input.seriesAComplete) return "series_a_complete";

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "series_a_complete";

  switch (nextBlocking.id) {
    case "track_a_series_a_data_room":
      return "track_a_series_a_data_room";
    case "track_b_partner_channel_expansion":
      return "track_b_partner_channel_expansion";
    case "track_c_multi_region_playbook":
      return "track_c_multi_region_playbook";
    case "track_d_customer_success_repeatability":
      return "track_d_customer_success_repeatability";
    default:
      return "track_a_series_a_data_room";
  }
}

export function resolveSeriesAPartnerExpansionMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean; optional: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    scaleComplete: boolean;
    seriesAComplete: boolean;
  },
): SeriesAPartnerExpansionMilestone {
  return resolveSeriesAPartnerExpansionMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    scaleComplete: input.scaleComplete,
    seriesAComplete: input.seriesAComplete,
    phases,
  });
}

export function buildSeriesAPartnerExpansionPostScaleOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSeriesAPartnerExpansionEnv>;
  artifacts: {
    goNoGoPresent: boolean;
    p0StagingPresent: boolean;
    tier2Present: boolean;
    metricsBaselinePresent: boolean;
    caseStudyDraftPresent: boolean;
    investorOnepagerPresent: boolean;
    competitorMatrixPresent: boolean;
  };
}): SeriesAPartnerExpansionPostScaleOrchestratorSummary {
  const nextPhase = resolveNextIncompleteSeriesAPartnerExpansionPhase(input.evaluation.phases);
  const milestone = resolveSeriesAPartnerExpansionMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    scaleComplete: input.evaluation.scaleComplete,
    seriesAComplete: input.evaluation.seriesAComplete,
    phases: input.evaluation.phases,
  });

  const readyForDataRoomSmokes = input.evaluation.readyForDataRoomSmokes;
  const readyForPartnerSmokes = input.evaluation.readyForPartnerSmokes;

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-scale-readiness-env -- --json",
        "npm run ops:validate-series-a-partner-expansion-env -- --json",
        SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-series-a-partner-expansion-env-template -- --write",
        "npm run ops:sync-series-a-partner-expansion-progress-report -- --write",
        SERIES_A_PARTNER_EXPANSION_READINESS_EXPORT_COMMAND,
        ...(readyForDataRoomSmokes || milestone === "track_a_series_a_data_room"
          ? ([
              "npm run smoke:investor-narrative-onepager",
              "npm run smoke:competitor-feature-gap-matrix",
            ] as const)
          : ([] as const)),
        ...(readyForPartnerSmokes
          ? (["npm run smoke:woo-shopify-live", "npm run smoke:woo-shopify"] as const)
          : ([] as const)),
        ...(milestone === "track_c_multi_region_playbook"
          ? (["npm run smoke:pilot-forbidden-claims-enforcement"] as const)
          : ([] as const)),
        ...(milestone === "track_d_customer_success_repeatability"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-scale-readiness-post-month2-orchestrator -- --write",
        "npm run ops:validate-scale-readiness-env -- --json",
        "npm run smoke:pilot-rollback-drill",
      ] as const);

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    scaleComplete: input.evaluation.scaleComplete,
    seriesAComplete: input.evaluation.seriesAComplete,
    readyForDataRoomSmokes,
    readyForPartnerSmokes,
    goDecision: input.evaluation.goDecision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    p0StagingArtifactPresent: input.artifacts.p0StagingPresent,
    tier2ArtifactPresent: input.artifacts.tier2Present,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    caseStudyDraftArtifactPresent: input.artifacts.caseStudyDraftPresent,
    investorOnepagerArtifactPresent: input.artifacts.investorOnepagerPresent,
    competitorMatrixArtifactPresent: input.artifacts.competitorMatrixPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildSeriesAPartnerExpansionReadinessChecklistMarkdown(input: {
  summary: SeriesAPartnerExpansionPostScaleOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSeriesAPartnerExpansionEnv>;
}): string {
  const lines: string[] = [
    "# Series A / Partner Expansion — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — audited artifact hashes; run smoke:woo-shopify-live before LIVE partner copy.",
    "",
    `Policy: \`${SERIES_A_PARTNER_EXPANSION_POST_SCALE_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Scale complete: ${input.summary.scaleComplete ? "yes" : "no"}`,
    `- Series A complete: ${input.summary.seriesAComplete ? "yes" : "no"}`,
    `- Ready for data room smokes: ${input.summary.readyForDataRoomSmokes ? "yes" : "no"}`,
    `- Ready for partner smokes: ${input.summary.readyForPartnerSmokes ? "yes" : "no"}`,
    `- Next track: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Track checklist (A–D)",
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
    lines.push("All tracked SERIES_A_* env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Series A top action (priority 6)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Series A tracks in commercial blockers");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#series-a-partner-expansion` panel");
  lines.push("- [ ] `/solutions/ghost-kitchens` + `/integrations` — partner channel surfaces");
  lines.push("- [ ] `/dashboard/reports` — data room KPI source");
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
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
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
    `Step 7 doc: [\`${SERIES_A_PARTNER_EXPANSION_STEP7_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_STEP7_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}
