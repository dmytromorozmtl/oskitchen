/**
 * Sustained operational excellence post-Market-leader orchestrator — cadence milestones, readiness, honest gates.
 * Policy: era21-sustained-operational-excellence-post-market-leader-orchestrator-v1
 */
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveNextIncompleteSustainedOperationalExcellencePhase,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-sustained-operational-excellence-post-market-leader-orchestrator-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_CHECKLIST_PATH =
  "docs/sustained-operational-excellence-readiness-checklist.md" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_COMMAND =
  "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_EXPORT_COMMAND =
  "npm run ops:export-sustained-operational-excellence-readiness-checklist -- --write" as const;

export type SustainedOperationalExcellenceMilestone =
  | "market_leader_blocked"
  | "cadence_a_daily_operational"
  | "cadence_b_weekly_integration"
  | "cadence_c_monthly_metrics"
  | "cadence_d_quarterly_governance"
  | "sustained_ops_complete";

export type SustainedOperationalExcellencePostMarketLeaderOrchestratorSummary = {
  policyId: typeof SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: SustainedOperationalExcellenceMilestone;
  prerequisitesComplete: boolean;
  marketLeaderComplete: boolean;
  sustainedOpsComplete: boolean;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
  goDecision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  p0StagingArtifactPresent: boolean;
  tier2ArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  competitorMatrixArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveSustainedOperationalExcellenceMilestone(input: {
  prerequisitesComplete: boolean;
  marketLeaderComplete: boolean;
  sustainedOpsComplete: boolean;
  phases: readonly { id: string; complete: boolean; optional: boolean }[];
}): SustainedOperationalExcellenceMilestone {
  if (!input.marketLeaderComplete || !input.prerequisitesComplete) return "market_leader_blocked";
  if (input.sustainedOpsComplete) return "sustained_ops_complete";

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "sustained_ops_complete";

  switch (nextBlocking.id) {
    case "cadence_a_daily_operational":
      return "cadence_a_daily_operational";
    case "cadence_b_weekly_integration":
      return "cadence_b_weekly_integration";
    case "cadence_c_monthly_metrics":
      return "cadence_c_monthly_metrics";
    case "cadence_d_quarterly_governance":
      return "cadence_d_quarterly_governance";
    default:
      return "cadence_a_daily_operational";
  }
}

export function resolveSustainedOperationalExcellenceMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean; optional: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    marketLeaderComplete: boolean;
    sustainedOpsComplete: boolean;
  },
): SustainedOperationalExcellenceMilestone {
  return resolveSustainedOperationalExcellenceMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    marketLeaderComplete: input.marketLeaderComplete,
    sustainedOpsComplete: input.sustainedOpsComplete,
    phases,
  });
}

export function buildSustainedOperationalExcellencePostMarketLeaderOrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateSustainedOperationalExcellenceEnv>;
  artifacts: {
    goNoGoPresent: boolean;
    p0StagingPresent: boolean;
    tier2Present: boolean;
    metricsBaselinePresent: boolean;
    competitorMatrixPresent: boolean;
  };
}): SustainedOperationalExcellencePostMarketLeaderOrchestratorSummary {
  const nextPhase = resolveNextIncompleteSustainedOperationalExcellencePhase(input.evaluation.phases);
  const milestone = resolveSustainedOperationalExcellenceMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    marketLeaderComplete: input.evaluation.marketLeaderComplete,
    sustainedOpsComplete: input.evaluation.sustainedOpsComplete,
    phases: input.evaluation.phases,
  });

  const readyForIntegrationSmokes = input.evaluation.readyForIntegrationSmokes;
  const readyForMetricsSmokes = input.evaluation.readyForMetricsSmokes;

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-market-leader-positioning-env -- --json",
        "npm run ops:validate-sustained-operational-excellence-env -- --json",
        SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-sustained-operational-excellence-env-template -- --write",
        "npm run ops:sync-sustained-operational-excellence-progress-report -- --write",
        SUSTAINED_OPERATIONAL_EXCELLENCE_READINESS_EXPORT_COMMAND,
        ...(readyForIntegrationSmokes ||
        milestone === "cadence_b_weekly_integration"
          ? (["npm run smoke:woo-shopify-live", "npm run smoke:commerce-webhook-drill"] as const)
          : ([] as const)),
        ...(readyForMetricsSmokes || milestone === "cadence_c_monthly_metrics"
          ? (["npm run smoke:pilot-metrics-baseline"] as const)
          : ([] as const)),
        ...(milestone === "cadence_d_quarterly_governance"
          ? ([
              "npm run smoke:pilot-forbidden-claims-enforcement",
              "npm run smoke:competitor-feature-gap-matrix",
            ] as const)
          : ([] as const)),
        "npm run test:ci:commercial-pilot-runbook:cert",
      ] as const)
    : ([
        "npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write",
        "npm run ops:validate-market-leader-positioning-env -- --json",
        "npm run smoke:pilot-forbidden-claims-enforcement",
      ] as const);

  return {
    policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    marketLeaderComplete: input.evaluation.marketLeaderComplete,
    sustainedOpsComplete: input.evaluation.sustainedOpsComplete,
    readyForIntegrationSmokes,
    readyForMetricsSmokes,
    goDecision: input.evaluation.goDecision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    p0StagingArtifactPresent: input.artifacts.p0StagingPresent,
    tier2ArtifactPresent: input.artifacts.tier2Present,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    competitorMatrixArtifactPresent: input.artifacts.competitorMatrixPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildSustainedOperationalExcellenceReadinessChecklistMarkdown(input: {
  summary: SustainedOperationalExcellencePostMarketLeaderOrchestratorSummary;
  evaluation: ReturnType<typeof evaluateSustainedOperationalExcellenceEnv>;
}): string {
  const lines: string[] = [
    "# Sustained Operational Excellence — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — never hand-edit PASS in `artifacts/*.json`; re-run smokes after credential rotation.",
    "",
    `Policy: \`${SUSTAINED_OPERATIONAL_EXCELLENCE_POST_MARKET_LEADER_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Market leader complete: ${input.summary.marketLeaderComplete ? "yes" : "no"}`,
    `- Sustained ops complete: ${input.summary.sustainedOpsComplete ? "yes" : "no"}`,
    `- Ready for integration smokes: ${input.summary.readyForIntegrationSmokes ? "yes" : "no"}`,
    `- Ready for metrics smokes: ${input.summary.readyForMetricsSmokes ? "yes" : "no"}`,
    `- Next cadence: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Cadence checklist (A–D)",
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
    lines.push("All tracked SUSTAINED_OPS_* env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Sustained ops top action (priority 8)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Cadences in commercial blockers");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — `#sustained-operational-excellence` panel");
  lines.push(`- [ ] \`${SUSTAINED_OPS_ORDER_HUB_ROUTE}\` + \`${SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE}\` — daily cadence`);
  lines.push("- [ ] `/dashboard/integration-health` — weekly integration review");
  lines.push("- [ ] `/dashboard/reports` — monthly metrics refresh");
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
  lines.push(`Competitor matrix: \`${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}\``);
  lines.push(
    `Feature maturity: [\`${SERIES_A_FEATURE_MATURITY_DOC}\`](../${SERIES_A_FEATURE_MATURITY_DOC})`,
  );
  lines.push(
    `Forbidden claims: [\`${SERIES_A_FORBIDDEN_CLAIMS_DOC}\`](../${SERIES_A_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Step 9 doc: [\`${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC}\`](../${SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC})`,
  );
  lines.push(`Platform ops: \`${SERIES_A_PLATFORM_OPS_ROUTE}\``);
  lines.push("");

  return lines.join("\n");
}
