/**
 * Market leader positioning post-Series A orchestrator — pillar milestones, readiness, honest gates.
 * Policy: era21-market-leader-positioning-post-series-a-orchestrator-v1
 */
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MARKET_LEADER_POSITIONING_STEP8_DOC,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  PILOT_ROLLBACK_DRILL_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  resolveNextIncompleteMarketLeaderPositioningPhase,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { evaluateMarketLeaderPositioningEnv } from "@/scripts/ops/validate-market-leader-positioning-env";

export const MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-market-leader-positioning-post-series-a-orchestrator-v1" as const;

export const MARKET_LEADER_POSITIONING_READINESS_CHECKLIST_PATH =
  "docs/market-leader-positioning-readiness-checklist.md" as const;

export const MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_COMMAND =
  "npm run ops:run-market-leader-positioning-post-series-a-orchestrator" as const;

export const MARKET_LEADER_POSITIONING_READINESS_EXPORT_COMMAND =
  "npm run ops:export-market-leader-positioning-readiness-checklist -- --write" as const;

export type MarketLeaderPositioningMilestone =
  | "series_a_blocked"
  | "pillar1_category_narrative"
  | "pillar2_competitive_moat_proof"
  | "pillar3_analyst_press_kit"
  | "pillar4_expansion_revenue_motion"
  | "market_leader_complete";

export type MarketLeaderPositioningPostSeriesAOrchestratorSummary = {
  policyId: typeof MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: MarketLeaderPositioningMilestone;
  prerequisitesComplete: boolean;
  seriesAComplete: boolean;
  marketLeaderComplete: boolean;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
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
  competitorMatrixArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveMarketLeaderPositioningMilestone(input: {
  prerequisitesComplete: boolean;
  seriesAComplete: boolean;
  marketLeaderComplete: boolean;
  phases: readonly { id: string; complete: boolean; optional: boolean }[];
}): MarketLeaderPositioningMilestone {
  if (!input.seriesAComplete || !input.prerequisitesComplete) return "series_a_blocked";
  if (input.marketLeaderComplete) return "market_leader_complete";

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "market_leader_complete";

  switch (nextBlocking.id) {
    case "pillar1_category_narrative":
      return "pillar1_category_narrative";
    case "pillar2_competitive_moat_proof":
      return "pillar2_competitive_moat_proof";
    case "pillar3_analyst_press_kit":
      return "pillar3_analyst_press_kit";
    case "pillar4_expansion_revenue_motion":
      return "pillar4_expansion_revenue_motion";
    default:
      return "pillar1_category_narrative";
  }
}

export function resolveMarketLeaderPositioningMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean; optional: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    seriesAComplete: boolean;
    marketLeaderComplete: boolean;
  },
): MarketLeaderPositioningMilestone {
  return resolveMarketLeaderPositioningMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    seriesAComplete: input.seriesAComplete,
    marketLeaderComplete: input.marketLeaderComplete,
    phases,
  });
}

export function buildMarketLeaderPositioningPostSeriesAOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateMarketLeaderPositioningEnv>;
  artifacts: {
    goNoGoPresent: boolean;
    p0StagingPresent: boolean;
    tier2Present: boolean;
    metricsBaselinePresent: boolean;
    caseStudyDraftPresent: boolean;
    investorOnepagerPresent: boolean;
    rollbackDrillPresent: boolean;
    competitorMatrixPresent: boolean;
  };
}): MarketLeaderPositioningPostSeriesAOrchestratorSummary {
  const nextPhase = resolveNextIncompleteMarketLeaderPositioningPhase(input.evaluation.phases);
  const milestone = resolveMarketLeaderPositioningMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    seriesAComplete: input.evaluation.seriesAComplete,
    marketLeaderComplete: input.evaluation.marketLeaderComplete,
    phases: input.evaluation.phases,
  });

  const readyForMoatSmokes = input.evaluation.readyForMoatSmokes;
  const readyForAnalystKitSmokes = input.evaluation.readyForAnalystKitSmokes;

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
        "npm run ops:validate-market-leader-positioning-integrity -- --json",
        "npm run ops:validate-series-a-partner-expansion-env -- --json",
        "npm run ops:validate-market-leader-positioning-env -- --json",
        MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-market-leader-positioning-env-template -- --write",
        "npm run ops:sync-market-leader-positioning-progress-report -- --write",
        MARKET_LEADER_POSITIONING_READINESS_EXPORT_COMMAND,
        ...(milestone === "pillar1_category_narrative"
          ? (["npm run smoke:pilot-case-study-draft"] as const)
          : ([] as const)),
        ...(readyForMoatSmokes
          ? ([
              "npm run smoke:pilot-rollback-drill",
              "npm run smoke:commerce-webhook-drill",
              "npm run smoke:webhook-replay-p1-expansion",
            ] as const)
          : ([] as const)),
        ...(readyForAnalystKitSmokes ||
        milestone === "pillar3_analyst_press_kit"
          ? ([
              "npm run smoke:pilot-forbidden-claims-enforcement",
              "npm run smoke:investor-narrative-onepager",
              "npm run smoke:competitor-feature-gap-matrix",
            ] as const)
          : ([] as const)),
        ...(milestone === "pillar4_expansion_revenue_motion"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write",
        "npm run ops:validate-series-a-partner-expansion-env -- --json",
        "npm run smoke:competitor-feature-gap-matrix",
      ] as const);

  return {
    policyId: MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    seriesAComplete: input.evaluation.seriesAComplete,
    marketLeaderComplete: input.evaluation.marketLeaderComplete,
    readyForMoatSmokes,
    readyForAnalystKitSmokes,
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
    competitorMatrixArtifactPresent: input.artifacts.competitorMatrixPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildMarketLeaderPositioningReadinessChecklistMarkdown(input: {
  summary: MarketLeaderPositioningPostSeriesAOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateMarketLeaderPositioningEnv>;
}): string {
  const lines: string[] = [
    "# Market Leader Positioning — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — never claim \"market leader\" without third-party validation or published case study approval.",
    "",
    `Policy: \`${MARKET_LEADER_POSITIONING_POST_SERIES_A_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Series A complete: ${input.summary.seriesAComplete ? "yes" : "no"}`,
    `- Market leader complete: ${input.summary.marketLeaderComplete ? "yes" : "no"}`,
    `- Ready for moat smokes: ${input.summary.readyForMoatSmokes ? "yes" : "no"}`,
    `- Ready for analyst kit smokes: ${input.summary.readyForAnalystKitSmokes ? "yes" : "no"}`,
    `- Next pillar: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Pillar checklist (1–4)",
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
    lines.push("All tracked MARKET_LEADER_* env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Market leader top action (priority 7)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Market leader pillars in commercial blockers");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#market-leader-positioning` panel");
  lines.push(`- [ ] \`${SERIES_A_GHOST_KITCHEN_LANDING_ROUTE}\` + \`${SERIES_A_MEAL_PREP_LANDING_ROUTE}\` — category narrative`);
  lines.push("- [ ] `/dashboard/integration-health` — moat integration depth");
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
  lines.push(`Case study: \`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}\``);
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(`Rollback drill: \`${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH}\``);
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
    `Step 8 doc: [\`${MARKET_LEADER_POSITIONING_STEP8_DOC}\`](../${MARKET_LEADER_POSITIONING_STEP8_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}
