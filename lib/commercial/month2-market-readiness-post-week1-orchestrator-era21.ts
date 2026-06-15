/**
 * Month 2 market readiness post-Week 1 orchestrator — workstream milestones, readiness, honest gates.
 * Policy: era21-month2-market-readiness-post-week1-orchestrator-v1
 */
import {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  MONTH2_GTM_FORBIDDEN_CLAIMS_DOC,
  MONTH2_INVESTOR_ONEPAGER_DOC,
  MONTH2_MARKET_READINESS_STEP5_DOC,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolveNextIncompleteMonth2MarketReadinessPhase,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { evaluateMonth2MarketReadinessEnv } from "@/scripts/ops/validate-month2-market-readiness-env";

export const MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID =
  "era21-month2-market-readiness-post-week1-orchestrator-v1" as const;

export const MONTH2_MARKET_READINESS_READINESS_CHECKLIST_PATH =
  "docs/month2-market-readiness-readiness-checklist.md" as const;

export const MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_COMMAND =
  "npm run ops:run-month2-market-readiness-post-week1-orchestrator" as const;

export const MONTH2_MARKET_READINESS_READINESS_EXPORT_COMMAND =
  "npm run ops:export-month2-market-readiness-readiness-checklist -- --write" as const;

export type Month2MarketReadinessMilestone =
  | "week1_blocked"
  | "workstream_a_investor_onepager"
  | "workstream_b_gtm_icp_landings"
  | "workstream_d_case_study_publish"
  | "month2_complete";

export type Month2MarketReadinessPostWeek1OrchestratorSummary = {
  policyId: typeof MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID;
  milestone: Month2MarketReadinessMilestone;
  prerequisitesComplete: boolean;
  week1Complete: boolean;
  month2Complete: boolean;
  readyForInvestorOnepagerSmoke: boolean;
  goDecision: string | null;
  envPresentCount: number;
  envTotalCount: number;
  goNoGoArtifactPresent: boolean;
  metricsBaselineArtifactPresent: boolean;
  caseStudyDraftArtifactPresent: boolean;
  investorOnepagerArtifactPresent: boolean;
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  recommendedCommands: readonly string[];
};

export function resolveMonth2MarketReadinessMilestone(input: {
  prerequisitesComplete: boolean;
  week1Complete: boolean;
  month2Complete: boolean;
  phases: readonly { id: string; complete: boolean; optional: boolean }[];
}): Month2MarketReadinessMilestone {
  if (!input.week1Complete || !input.prerequisitesComplete) return "week1_blocked";
  if (input.month2Complete) return "month2_complete";

  const nextBlocking = input.phases.find((phase) => !phase.optional && !phase.complete);
  if (!nextBlocking) return "month2_complete";

  switch (nextBlocking.id) {
    case "workstream_a_investor_onepager":
      return "workstream_a_investor_onepager";
    case "workstream_b_gtm_icp_landings":
      return "workstream_b_gtm_icp_landings";
    case "workstream_d_case_study_publish":
      return "workstream_d_case_study_publish";
    default:
      return "workstream_a_investor_onepager";
  }
}

export function resolveMonth2MarketReadinessMilestoneFromPhaseStatuses(
  phases: readonly { id: string; complete: boolean; optional: boolean }[],
  input: {
    prerequisitesComplete: boolean;
    week1Complete: boolean;
    month2Complete: boolean;
  },
): Month2MarketReadinessMilestone {
  return resolveMonth2MarketReadinessMilestone({
    prerequisitesComplete: input.prerequisitesComplete,
    week1Complete: input.week1Complete,
    month2Complete: input.month2Complete,
    phases,
  });
}

export function buildMonth2MarketReadinessPostWeek1OrchestratorSummary(input: {
  evaluation: ReturnType<typeof evaluateMonth2MarketReadinessEnv>;
  artifacts: {
    goNoGoPresent: boolean;
    metricsBaselinePresent: boolean;
    caseStudyDraftPresent: boolean;
    investorOnepagerPresent: boolean;
  };
}): Month2MarketReadinessPostWeek1OrchestratorSummary {
  const nextPhase = resolveNextIncompleteMonth2MarketReadinessPhase(input.evaluation.phases);
  const milestone = resolveMonth2MarketReadinessMilestone({
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    week1Complete: input.evaluation.week1Complete,
    month2Complete: input.evaluation.month2Complete,
    phases: input.evaluation.phases,
  });

  const readyForInvestorOnepagerSmoke = input.evaluation.readyForInvestorOnepagerSmoke;

  const recommendedCommands = input.evaluation.prerequisites.prerequisitesComplete
    ? ([
        "npm run ops:validate-pilot-week1-execution-integrity -- --json",
        "npm run ops:validate-month2-market-readiness-integrity -- --json",
        "npm run ops:validate-pilot-week1-env -- --json",
        "npm run ops:validate-month2-market-readiness-env -- --json",
        MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_COMMAND + " -- --write",
        "npm run ops:export-month2-market-readiness-env-template -- --write",
        "npm run ops:sync-month2-market-readiness-progress-report -- --write",
        MONTH2_MARKET_READINESS_READINESS_EXPORT_COMMAND,
        ...(readyForInvestorOnepagerSmoke
          ? ([
              "npm run smoke:investor-narrative-onepager",
              "npm run smoke:pilot-forbidden-claims-enforcement",
            ] as const)
          : ([] as const)),
        ...(milestone === "workstream_d_case_study_publish"
          ? (["npm run smoke:pilot-case-study-draft"] as const)
          : ([] as const)),
        "npm run smoke:pilot-gono-go",
      ] as const)
    : ([
        "npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write",
        "npm run ops:validate-pilot-week1-env -- --json",
        "npm run smoke:pilot-metrics-baseline",
      ] as const);

  return {
    policyId: MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID,
    milestone,
    prerequisitesComplete: input.evaluation.prerequisites.prerequisitesComplete,
    week1Complete: input.evaluation.week1Complete,
    month2Complete: input.evaluation.month2Complete,
    readyForInvestorOnepagerSmoke,
    goDecision: input.evaluation.goDecision,
    envPresentCount: input.evaluation.present.length,
    envTotalCount: input.evaluation.present.length + input.evaluation.missing.length,
    goNoGoArtifactPresent: input.artifacts.goNoGoPresent,
    metricsBaselineArtifactPresent: input.artifacts.metricsBaselinePresent,
    caseStudyDraftArtifactPresent: input.artifacts.caseStudyDraftPresent,
    investorOnepagerArtifactPresent: input.artifacts.investorOnepagerPresent,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    recommendedCommands,
  };
}

export function buildMonth2MarketReadinessReadinessChecklistMarkdown(input: {
  summary: Month2MarketReadinessPostWeek1OrchestratorSummary;
  evaluation: ReturnType<typeof evaluateMonth2MarketReadinessEnv>;
}): string {
  const lines: string[] = [
    "# Month 2 Market Readiness — Readiness Checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "> **Honest ops only** — cite real KPIs from metrics baseline; never publish without customer approval.",
    "",
    `Policy: \`${MONTH2_MARKET_READINESS_POST_WEEK1_ORCHESTRATOR_ERA21_POLICY_ID}\``,
    "",
    "## Current milestone",
    "",
    `- Milestone: **${input.summary.milestone}**`,
    `- GO decision: ${input.summary.goDecision ?? "missing"}`,
    `- Week 1 complete: ${input.summary.week1Complete ? "yes" : "no"}`,
    `- Month 2 complete: ${input.summary.month2Complete ? "yes" : "no"}`,
    `- Ready for investor one-pager smoke: ${input.summary.readyForInvestorOnepagerSmoke ? "yes" : "no"}`,
    `- Next workstream: ${input.summary.nextPhaseLabel ?? "none"}`,
    "",
    "## Workstream checklist (A–E)",
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
    lines.push("All tracked Month 2 env vars present in local shell.");
  } else {
    for (const key of input.evaluation.missing) {
      lines.push(`- [ ] \`${key}\``);
    }
  }

  lines.push("");
  lines.push("## Product verification");
  lines.push("");
  lines.push("- [ ] `/dashboard/today` — Month 2 top action (priority 4)");
  lines.push("- [ ] `/dashboard/launch-wizard` — Month 2 workstreams in commercial blockers");
  lines.push("- [ ] `/solutions/ghost-kitchens` + `/solutions/meal-prep` — ICP landing review");
  lines.push("- [ ] `/platform/commercial-pilot-ops` — Month 2 phases panel");
  lines.push("- [ ] `/dashboard/reports` — investor KPI source from metrics baseline");
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
  lines.push(`Investor one-pager: \`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH}\``);
  lines.push(
    `Investor doc: [\`${MONTH2_INVESTOR_ONEPAGER_DOC}\`](../${MONTH2_INVESTOR_ONEPAGER_DOC})`,
  );
  lines.push(
    `Forbidden claims: [\`${MONTH2_GTM_FORBIDDEN_CLAIMS_DOC}\`](../${MONTH2_GTM_FORBIDDEN_CLAIMS_DOC})`,
  );
  lines.push(
    `Step 5 doc: [\`${MONTH2_MARKET_READINESS_STEP5_DOC}\`](../${MONTH2_MARKET_READINESS_STEP5_DOC})`,
  );
  lines.push("");

  return lines.join("\n");
}
