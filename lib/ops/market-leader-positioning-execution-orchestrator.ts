/**
 * Market leader positioning execution orchestrator — Step 9 honest milestone + pillar truth.
 * Policy: era37-market-leader-positioning-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateMarketLeaderPositioningIntegrity } from "@/lib/commercial/market-leader-positioning-integrity-era32";
import {
  resolveMarketLeaderPositioningComplete,
  resolveNextIncompleteMarketLeaderPositioningPhase,
  type MarketLeaderPositioningPhaseStatus,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import { buildSeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import {
  evaluateMarketLeaderPositioningEnv,
  readMarketLeaderPositioningArtifacts,
} from "@/scripts/ops/validate-market-leader-positioning-env";

export const MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID =
  "era37-market-leader-positioning-execution-v1" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_DOC =
  "docs/next-step-9-market-leader-positioning-2026-05-29.md" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_STEP10_DOC =
  "docs/next-step-10-sustained-operational-excellence-2026-05-29.md" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/market-leader-positioning-execution-summary.json" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT =
  "artifacts/market-leader-positioning-execution-report.html" as const;

export const MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-market-leader-positioning-execution" as const;

export type MarketLeaderPositioningExecutionMilestone =
  | "series_a_expansion_blocked"
  | "awaiting_pillar1_category_narrative"
  | "awaiting_pillar2_competitive_moat_proof"
  | "awaiting_pillar3_analyst_press_kit"
  | "awaiting_pillar4_expansion_revenue_motion"
  | "awaiting_market_leader_integrity"
  | "market_leader_positioning_passed";

export type MarketLeaderPositioningExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type MarketLeaderPositioningExecutionSummary = {
  version: "market-leader-positioning-execution-v1";
  policyId: typeof MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: MarketLeaderPositioningExecutionMilestone;
  seriesAExpansionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  pillarsComplete: boolean;
  seriesAComplete: boolean;
  marketLeaderIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  phases: readonly MarketLeaderPositioningPhaseStatus[];
  gates: readonly MarketLeaderPositioningExecutionGateStatus[];
  nextPhase: MarketLeaderPositioningPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveMarketLeaderPositioningExecutionMilestone(input: {
  seriesAExpansionPassed: boolean;
  pillars: readonly MarketLeaderPositioningPhaseStatus[];
  marketLeaderIntegrityPassed: boolean;
}): MarketLeaderPositioningExecutionMilestone {
  if (!input.seriesAExpansionPassed) return "series_a_expansion_blocked";

  const nextPillar = resolveNextIncompleteMarketLeaderPositioningPhase(input.pillars);
  if (nextPillar?.optional === false) {
    switch (nextPillar.id) {
      case "pillar1_category_narrative":
        return "awaiting_pillar1_category_narrative";
      case "pillar2_competitive_moat_proof":
        return "awaiting_pillar2_competitive_moat_proof";
      case "pillar3_analyst_press_kit":
        return "awaiting_pillar3_analyst_press_kit";
      case "pillar4_expansion_revenue_motion":
        return "awaiting_pillar4_expansion_revenue_motion";
      default:
        break;
    }
  }

  if (!resolveMarketLeaderPositioningComplete(input.pillars)) {
    return "awaiting_pillar1_category_narrative";
  }

  if (!input.marketLeaderIntegrityPassed) return "awaiting_market_leader_integrity";
  return "market_leader_positioning_passed";
}

export function buildMarketLeaderPositioningExecutionGates(input: {
  seriesAExpansionPassed: boolean;
  seriesAExpansionMilestone: string | null;
  pillarsComplete: boolean;
  seriesAComplete: boolean;
  marketLeaderIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  caseStudyApproved: boolean;
  moatEvidenceReady: boolean;
  investorReady: boolean;
  competitorAligned: boolean;
}): MarketLeaderPositioningExecutionGateStatus[] {
  return [
    {
      id: "series_a_expansion",
      label: "Series A partner expansion complete (Step 8)",
      complete: input.seriesAExpansionPassed,
      proofStatus: input.seriesAExpansionPassed
        ? "series_a_partner_expansion_passed"
        : input.seriesAExpansionMilestone,
      detail: input.seriesAExpansionPassed
        ? "Tracks A–D + Series A integrity passed."
        : "Complete Step 8 — Series A partner expansion execution.",
      command: "npm run ops:run-series-a-partner-expansion-execution -- --write",
    },
    {
      id: "series_a_complete",
      label: "Series A tracks complete (prerequisite)",
      complete: input.seriesAComplete,
      proofStatus: input.seriesAComplete ? "series_a_complete" : "in_progress",
      detail: input.seriesAComplete
        ? "Data room, partner channel, multi-region, CS tracks complete."
        : "Series A phases must be complete before market leader positioning.",
      command: "npm run ops:validate-series-a-partner-expansion-env -- --json",
    },
    {
      id: "market_leader_pillars",
      label: "Market leader pillars 1–4",
      complete: input.pillarsComplete,
      proofStatus: input.pillarsComplete ? "pillars_complete" : "in_progress",
      detail: input.pillarsComplete
        ? "Category narrative, moat deck, analyst kit, expansion motion complete."
        : "Complete four pillars with audited artifacts — all F&B formats, no overclaim.",
      command: MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "case_study_approval",
      label: "Case study customer approval",
      complete: input.caseStudyApproved,
      proofStatus: input.caseStudyApproved ? "approved" : "pending",
      detail: "Pillar 1 requires written case study approval — signed or anonymized_signed only.",
      command: "npm run smoke:pilot-case-study-draft",
    },
    {
      id: "moat_evidence",
      label: "Competitive moat evidence (P0 + Tier 2 + rollback + Week 1)",
      complete: input.moatEvidenceReady,
      proofStatus: input.moatEvidenceReady ? "moat_evidence_ready" : "pending",
      detail: "Pillar 2 requires P0, Tier 2, rollback proof_passed + Week 1 TTV/POS closeout.",
      command: "npm run smoke:pilot-rollback-drill",
    },
    {
      id: "analyst_kit_artifacts",
      label: "Analyst kit artifacts (investor + competitor matrix)",
      complete: input.investorReady && input.competitorAligned,
      proofStatus:
        input.investorReady && input.competitorAligned ? "artifacts_ready" : "pending",
      detail: "Pillar 3 requires investor proof_ready_with_metrics + competitor evidence_aligned_era17.",
      command: "npm run smoke:investor-narrative-onepager",
    },
    {
      id: "market_leader_integrity",
      label: "Market leader positioning integrity",
      complete: input.marketLeaderIntegrityPassed,
      proofStatus: input.marketLeaderIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake investor/rollback PASS or market leader started without Series A.",
      command: "npm run ops:validate-market-leader-positioning-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through market leader phase — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildMarketLeaderPositioningExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): MarketLeaderPositioningExecutionSummary {
  const env = input.env ?? process.env;
  const mlArtifacts = readMarketLeaderPositioningArtifacts();
  const mlEvaluation = evaluateMarketLeaderPositioningEnv(env);
  const mlIntegrity = evaluateMarketLeaderPositioningIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? mlArtifacts.goNoGoSummary,
    p0StagingOverride: mlArtifacts.p0Staging,
    tier2SummaryOverride: mlArtifacts.tier2Summary,
    metricsBaselineOverride: mlArtifacts.metricsBaseline,
    caseStudyDraftOverride: mlArtifacts.caseStudyDraft,
    investorOnepagerOverride: mlArtifacts.investorOnepager,
    rollbackDrillOverride: mlArtifacts.rollbackDrill,
    competitorMatrixOverride: mlArtifacts.competitorMatrix,
  });
  const inflection = evaluateCommercialInflectionReadiness(env);

  const seriesAExpansion =
    input.seriesAExpansion ??
    buildSeriesAPartnerExpansionExecutionSummary({
      env,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? null,
    });

  const phases = mlEvaluation.phases;
  const seriesAExpansionPassed =
    seriesAExpansion.milestone === "series_a_partner_expansion_passed";
  const pillarsComplete = resolveMarketLeaderPositioningComplete(phases);

  const caseStudyApproval = env.PILOT_CASE_STUDY_CUSTOMER_APPROVAL?.trim().toLowerCase();
  const caseStudyApproved =
    caseStudyApproval === "signed" ||
    caseStudyApproval === "anonymized_signed" ||
    mlArtifacts.caseStudyDraft?.customerApprovalStatus === "signed" ||
    mlArtifacts.caseStudyDraft?.customerApprovalStatus === "anonymized_signed";

  const p0Passed = mlArtifacts.p0Staging?.p0ProofStatus === "proof_passed";
  const tier2Passed = mlArtifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const rollbackPassed = mlArtifacts.rollbackDrill?.rollbackProofStatus === "proof_passed";
  const week1Ttv = Boolean(env.PILOT_WEEK1_TTV_HOURS?.trim());
  const posCloseout = env.PILOT_WEEK1_POS_CLOSEOUT_STATUS?.trim().toLowerCase() === "pass";
  const moatEvidenceReady = p0Passed && tier2Passed && rollbackPassed && week1Ttv && posCloseout;

  const investorReady =
    mlArtifacts.investorOnepager?.overall === "PASSED" &&
    mlArtifacts.investorOnepager.narrativeProofStatus === "proof_ready_with_metrics";
  const competitorAligned =
    mlArtifacts.competitorMatrix?.overall === "PASSED" &&
    mlArtifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";

  const milestone = resolveMarketLeaderPositioningExecutionMilestone({
    seriesAExpansionPassed,
    pillars: phases,
    marketLeaderIntegrityPassed: mlIntegrity.integrityPassed,
  });

  const gates = buildMarketLeaderPositioningExecutionGates({
    seriesAExpansionPassed,
    seriesAExpansionMilestone: seriesAExpansion.milestone,
    pillarsComplete,
    seriesAComplete: mlEvaluation.seriesAComplete,
    marketLeaderIntegrityPassed: mlIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? mlEvaluation.goDecision,
    caseStudyApproved,
    moatEvidenceReady,
    investorReady,
    competitorAligned,
  });

  const nextPhase = seriesAExpansionPassed
    ? resolveNextIncompleteMarketLeaderPositioningPhase(phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!seriesAExpansionPassed) {
    recommendedCommands.push("npm run ops:run-series-a-partner-expansion-execution -- --write");
    recommendedCommands.push("npm run ops:run-series-a-partner-expansion-execution -- --execute");
  } else if (!pillarsComplete) {
    recommendedCommands.push(
      MARKET_LEADER_POSITIONING_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute",
    );
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push(
      "npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-market-leader-positioning-env -- --json");
  } else if (!mlIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-market-leader-positioning-integrity -- --json");
  }

  if (milestone === "market_leader_positioning_passed") {
    recommendedCommands.push(
      "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
    );
  }

  return {
    version: "market-leader-positioning-execution-v1",
    policyId: MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    seriesAExpansionMilestone: seriesAExpansion.milestone,
    goDecision: input.goNoGo?.decision ?? mlEvaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    pillarsComplete,
    seriesAComplete: mlEvaluation.seriesAComplete,
    marketLeaderIntegrityPassed: mlIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/solutions/ghost-kitchens",
      "/solutions/meal-prep",
      "/platform/commercial-pilot-ops",
      "/dashboard/reports",
      "/dashboard/integration-health",
    ],
    honestyNote:
      "PASS > SKIPPED — no 'market leader' claims without third-party validation. Case study requires signed approval. Enterprise SSO production requires gate3 PASS. ICP = all F&B formats.",
  };
}

export function formatMarketLeaderPositioningExecutionLines(
  summary: MarketLeaderPositioningExecutionSummary,
): string[] {
  return [
    `Market leader positioning execution: ${summary.milestone}`,
    `Series A expansion: ${summary.seriesAExpansionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Pillars: ${summary.pillarsComplete ? "complete" : "in progress"}`,
    `Series A: ${summary.seriesAComplete ? "complete" : "blocked"} · integrity ${summary.marketLeaderIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next pillar: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All pillars complete or blocked on Series A expansion",
  ];
}
