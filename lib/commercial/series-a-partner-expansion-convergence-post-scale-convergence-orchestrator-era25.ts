/**
 * era25 Series A / Partner Expansion Convergence post-scale-convergence orchestrator.
 * Policy: era25-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-v1
 */
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import type { ScaleReadinessConvergenceEra25Milestone } from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import { SCALE_READINESS_CONVERGENCE_ERA25_DOC } from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateSeriesAPartnerExpansionConvergenceEra25 } from "@/lib/commercial/evaluate-series-a-partner-expansion-convergence-era25";
import type { SeriesAPartnerExpansionPhaseStatus } from "@/lib/commercial/series-a-partner-expansion-phases-era21";

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID =
  "era25-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_COMMAND =
  "npm run ops:run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25" as const;

export type SeriesAPartnerExpansionConvergenceEra25Milestone =
  | "scale_convergence_regression_blocked"
  | "track_a_series_a_data_room"
  | "track_b_partner_channel_expansion"
  | "track_c_multi_region_playbook"
  | "track_d_customer_success_repeatability"
  | "series_a_partner_expansion_convergence_era25_ready";

export type SeriesAPartnerExpansionConvergenceEra25OrchestratorSummary = {
  policyId: typeof SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID;
  milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  scaleReadinessConvergenceEra25Milestone: ScaleReadinessConvergenceEra25Milestone;
  convergenceBlocked: boolean;
  scaleConvergenceReady: boolean;
  seriesAComplete: boolean;
  goDecision: string | null;
  completedBlockingCount: number;
  totalBlockingCount: number;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
  readyForScaleConvergenceRegressionSmokes: boolean;
  convergenceReportPresent: boolean;
  recommendedCommands: readonly string[];
};

const SCALE_CONVERGENCE_BLOCKED_MILESTONES: readonly ScaleReadinessConvergenceEra25Milestone[] = [
  "month2_convergence_regression_blocked",
  "gate1_per_customer_pilot_ops",
  "gate2_soc2_readiness_track",
  "gate3_enterprise_sso_production",
  "gate4_operational_resilience",
  "gate5_data_room_artifact_chain",
] as const;

export function resolveSeriesAPartnerExpansionConvergenceEra25Milestone(input: {
  scaleReadinessConvergenceEra25Milestone: ScaleReadinessConvergenceEra25Milestone;
  seriesAComplete: boolean;
  phases: readonly SeriesAPartnerExpansionPhaseStatus[];
}): SeriesAPartnerExpansionConvergenceEra25Milestone {
  if (
    input.scaleReadinessConvergenceEra25Milestone !== "scale_readiness_convergence_era25_ready"
  ) {
    return "scale_convergence_regression_blocked";
  }

  if (input.seriesAComplete) {
    return "series_a_partner_expansion_convergence_era25_ready";
  }

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "series_a_partner_expansion_convergence_era25_ready";

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

export function buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceEra25>;
  artifacts: { convergenceReportPresent: boolean };
}): SeriesAPartnerExpansionConvergenceEra25OrchestratorSummary {
  const milestone = resolveSeriesAPartnerExpansionConvergenceEra25Milestone({
    scaleReadinessConvergenceEra25Milestone:
      input.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
    seriesAComplete: input.evaluation.seriesAState.seriesAComplete,
    phases: input.evaluation.seriesAState.phases,
  });

  const readyForScaleConvergenceRegressionSmokes = SCALE_CONVERGENCE_BLOCKED_MILESTONES.includes(
    input.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
  );

  const recommendedCommands =
    milestone === "scale_convergence_regression_blocked"
      ? ([
          "npm run ops:run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25 -- --write",
          "npm run ops:validate-scale-readiness-convergence-era25 -- --json",
        ] as const)
      : ([
          "npm run ops:validate-series-a-partner-expansion-convergence-era25 -- --json",
          SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_COMMAND +
            " -- --write",
          "npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write",
          "npm run ops:validate-series-a-partner-expansion-env -- --json",
          "npm run ops:export-series-a-partner-expansion-env-template -- --write",
          "npm run ops:sync-series-a-partner-expansion-progress-report -- --write",
          "npm run ops:export-series-a-partner-expansion-readiness-checklist -- --write",
          ...(input.evaluation.seriesAState.readyForDataRoomSmokes ||
          milestone === "track_a_series_a_data_room"
            ? ([
                "npm run smoke:investor-narrative-onepager",
                "npm run smoke:competitor-feature-gap-matrix",
              ] as const)
            : ([] as const)),
          ...(input.evaluation.seriesAState.readyForPartnerSmokes
            ? (["npm run smoke:woo-shopify-live", "npm run smoke:woo-shopify"] as const)
            : ([] as const)),
          ...(milestone === "track_c_multi_region_playbook"
            ? (["npm run smoke:pilot-forbidden-claims-enforcement"] as const)
            : ([] as const)),
          ...(milestone === "track_d_customer_success_repeatability"
            ? (["npm run smoke:pilot-metrics-baseline"] as const)
            : ([] as const)),
          ...(milestone === "series_a_partner_expansion_convergence_era25_ready"
            ? (["Begin market leader positioning convergence on platform ops"] as const)
            : ([] as const)),
          "npm run test:ci:commercial-pilot-runbook:cert",
        ] as const);

  return {
    policyId: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
    milestone,
    scaleReadinessConvergenceEra25Milestone:
      input.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
    convergenceBlocked: input.evaluation.convergenceBlocked,
    scaleConvergenceReady: input.evaluation.scaleConvergenceReady,
    seriesAComplete: input.evaluation.seriesAState.seriesAComplete,
    goDecision: input.evaluation.seriesAState.goDecision,
    completedBlockingCount: input.evaluation.seriesAState.completedBlockingCount,
    totalBlockingCount: input.evaluation.seriesAState.totalBlockingCount,
    nextPhaseId: input.evaluation.seriesAState.nextPhaseId,
    nextPhaseLabel: input.evaluation.seriesAState.nextPhaseLabel,
    readyForDataRoomSmokes: input.evaluation.seriesAState.readyForDataRoomSmokes,
    readyForPartnerSmokes: input.evaluation.seriesAState.readyForPartnerSmokes,
    readyForScaleConvergenceRegressionSmokes,
    convergenceReportPresent: input.artifacts.convergenceReportPresent,
    recommendedCommands,
  };
}

export function buildSeriesAPartnerExpansionConvergenceEra25OrchestratorReportMarkdown(input: {
  summary: SeriesAPartnerExpansionConvergenceEra25OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceEra25>;
}): string {
  const lines: string[] = [
    "# era25 Series A / Partner Expansion Convergence — Orchestrator Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Series A convergence** — honest tracks from SERIES_A_* env + data room/partner artifacts.",
    "",
    `Policy: \`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- Scale convergence milestone: ${input.summary.scaleReadinessConvergenceEra25Milestone}`,
    `- Convergence blocked: ${input.summary.convergenceBlocked ? "yes" : "no"}`,
    `- Series A complete: ${input.summary.seriesAComplete ? "yes" : "no"}`,
    `- Progress: ${input.summary.completedBlockingCount}/${input.summary.totalBlockingCount} blocking tracks`,
    `- Next track: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Tracks",
    "",
  ];

  for (const phase of input.evaluation.seriesAState.phases) {
    lines.push(
      `- [${phase.complete ? "x" : " "}] **${phase.label}**${phase.optional ? " _(optional)_" : ""}`,
    );
    lines.push(`  - ${phase.detail}`);
  }

  lines.push("");
  lines.push("## Convergence targets");
  lines.push("");
  for (const target of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS) {
    lines.push(`- **${target.label}** — ${target.surface}`);
  }

  lines.push("");
  lines.push("## Human steps");
  lines.push("");
  for (const step of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS) {
    lines.push(`- ${step}`);
  }

  lines.push("");
  lines.push("## Guardrails (never)");
  lines.push("");
  for (const rule of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  lines.push("");
  lines.push("## Forever commands");
  lines.push("");
  lines.push("```bash");
  for (const cmd of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_FOREVER_COMMANDS) {
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
  lines.push(`Convergence report: \`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH}\``);
  lines.push(
    `Convergence doc: [\`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `Scale convergence doc: [\`${SCALE_READINESS_CONVERGENCE_ERA25_DOC}\`](../${SCALE_READINESS_CONVERGENCE_ERA25_DOC})`,
  );
  lines.push(
    `era21 Series A reference: [\`${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC}\`](../${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ERA21_REFERENCE_DOC})`,
  );
  lines.push(
    `Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}\``,
  );
  lines.push(`GO artifact: \`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH}\``);
  lines.push(`Metrics: \`${PILOT_METRICS_BASELINE_ARTIFACT_PATH}\``);
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
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
