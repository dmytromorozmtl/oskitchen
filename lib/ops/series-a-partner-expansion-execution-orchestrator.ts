/**
 * Series A / partner expansion execution orchestrator — Step 8 honest milestone + track truth.
 * Policy: era36-series-a-partner-expansion-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { evaluateSeriesAPartnerExpansionIntegrity } from "@/lib/commercial/series-a-partner-expansion-integrity-era31";
import {
  resolveNextIncompleteSeriesAPartnerExpansionPhase,
  resolveSeriesAPartnerExpansionComplete,
  type SeriesAPartnerExpansionPhaseStatus,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import { buildProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import {
  evaluateSeriesAPartnerExpansionEnv,
  readSeriesAPartnerExpansionArtifacts,
} from "@/scripts/ops/validate-series-a-partner-expansion-env";

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID =
  "era36-series-a-partner-expansion-execution-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_DOC =
  "docs/next-step-8-series-a-partner-expansion-2026-05-29.md" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_STEP9_DOC =
  "docs/next-step-9-market-leader-positioning-2026-05-29.md" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/series-a-partner-expansion-execution-summary.json" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT =
  "artifacts/series-a-partner-expansion-execution-report.html" as const;

export const SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-series-a-partner-expansion-execution" as const;

export type SeriesAPartnerExpansionExecutionMilestone =
  | "production_ga_blocked"
  | "awaiting_track_a_series_a_data_room"
  | "awaiting_track_b_partner_channel_expansion"
  | "awaiting_track_c_multi_region_playbook"
  | "awaiting_track_d_customer_success_repeatability"
  | "awaiting_series_a_integrity"
  | "series_a_partner_expansion_passed";

export type SeriesAPartnerExpansionExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type SeriesAPartnerExpansionExecutionSummary = {
  version: "series-a-partner-expansion-execution-v1";
  policyId: typeof SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: SeriesAPartnerExpansionExecutionMilestone;
  productionGaMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  tracksComplete: boolean;
  scaleComplete: boolean;
  seriesAIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  phases: readonly SeriesAPartnerExpansionPhaseStatus[];
  gates: readonly SeriesAPartnerExpansionExecutionGateStatus[];
  nextPhase: SeriesAPartnerExpansionPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveSeriesAPartnerExpansionExecutionMilestone(input: {
  productionGaPassed: boolean;
  tracks: readonly SeriesAPartnerExpansionPhaseStatus[];
  seriesAIntegrityPassed: boolean;
}): SeriesAPartnerExpansionExecutionMilestone {
  if (!input.productionGaPassed) return "production_ga_blocked";

  const nextTrack = resolveNextIncompleteSeriesAPartnerExpansionPhase(input.tracks);
  if (nextTrack?.optional === false) {
    switch (nextTrack.id) {
      case "track_a_series_a_data_room":
        return "awaiting_track_a_series_a_data_room";
      case "track_b_partner_channel_expansion":
        return "awaiting_track_b_partner_channel_expansion";
      case "track_c_multi_region_playbook":
        return "awaiting_track_c_multi_region_playbook";
      case "track_d_customer_success_repeatability":
        return "awaiting_track_d_customer_success_repeatability";
      default:
        break;
    }
  }

  if (!resolveSeriesAPartnerExpansionComplete(input.tracks)) {
    return "awaiting_track_a_series_a_data_room";
  }

  if (!input.seriesAIntegrityPassed) return "awaiting_series_a_integrity";
  return "series_a_partner_expansion_passed";
}

export function buildSeriesAPartnerExpansionExecutionGates(input: {
  productionGaPassed: boolean;
  productionGaMilestone: string | null;
  tracksComplete: boolean;
  scaleComplete: boolean;
  seriesAIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  competitorMatrixPassed: boolean;
  channelLiveHonest: boolean;
}): SeriesAPartnerExpansionExecutionGateStatus[] {
  return [
    {
      id: "production_ga",
      label: "Production GA complete (Step 7)",
      complete: input.productionGaPassed,
      proofStatus: input.productionGaPassed ? "production_ga_passed" : input.productionGaMilestone,
      detail: input.productionGaPassed
        ? "Engineering, security, pricing, and launch narrative gates passed."
        : "Complete Step 7 — production GA execution.",
      command: "npm run ops:run-production-ga-execution -- --write",
    },
    {
      id: "scale_readiness",
      label: "Scale readiness complete",
      complete: input.scaleComplete,
      proofStatus: input.scaleComplete ? "scale_complete" : "in_progress",
      detail: input.scaleComplete
        ? "All blocking scale readiness gates passed."
        : "Scale readiness must be complete before Series A fundraise motion.",
      command: "npm run ops:validate-scale-readiness-env -- --json",
    },
    {
      id: "series_a_tracks",
      label: "Series A tracks A–D (data room + partner + multi-region + CS)",
      complete: input.tracksComplete,
      proofStatus: input.tracksComplete ? "tracks_complete" : "in_progress",
      detail: input.tracksComplete
        ? "Data room bundle, partner channel, multi-region playbook, CS repeatability complete."
        : "Complete four Series A tracks with audited artifacts — all F&B formats.",
      command: SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "competitor_matrix",
      label: "Competitor feature gap matrix aligned",
      complete: input.competitorMatrixPassed,
      proofStatus: input.competitorMatrixPassed ? "evidence_aligned_era17" : "pending",
      detail: "Track A requires competitor matrix evidence_aligned_era17 — never hand-edit PASS.",
      command: "npm run smoke:competitor-feature-gap-matrix",
    },
    {
      id: "partner_channel_honesty",
      label: "Partner channel LIVE honesty (Woo/Shopify)",
      complete: input.channelLiveHonest,
      proofStatus: input.channelLiveHonest ? "integration_honest" : "pending",
      detail: "Track B requires smoke:woo-shopify-live PASS or Tier 2 proof_passed before partner copy.",
      command: "npm run smoke:woo-shopify-live",
    },
    {
      id: "series_a_integrity",
      label: "Series A partner expansion integrity",
      complete: input.seriesAIntegrityPassed,
      proofStatus: input.seriesAIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake competitor matrix PASS or Series A started without scale.",
      command: "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through Series A — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildSeriesAPartnerExpansionExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): SeriesAPartnerExpansionExecutionSummary {
  const env = input.env ?? process.env;
  const seriesArtifacts = readSeriesAPartnerExpansionArtifacts();
  const seriesEvaluation = evaluateSeriesAPartnerExpansionEnv(env);
  const seriesIntegrity = evaluateSeriesAPartnerExpansionIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? seriesArtifacts.goNoGoSummary,
    p0StagingOverride: seriesArtifacts.p0Staging,
    tier2SummaryOverride: seriesArtifacts.tier2Summary,
    metricsBaselineOverride: seriesArtifacts.metricsBaseline,
    caseStudyDraftOverride: seriesArtifacts.caseStudyDraft,
    investorOnepagerOverride: seriesArtifacts.investorOnepager,
    rollbackDrillOverride: seriesArtifacts.rollbackDrill,
    competitorMatrixOverride: seriesArtifacts.competitorMatrix,
  });
  const inflection = evaluateCommercialInflectionReadiness(env);

  const productionGa =
    input.productionGa ??
    buildProductionGaExecutionSummary({
      env,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? null,
    });

  const phases = seriesEvaluation.phases;
  const productionGaPassed = productionGa.milestone === "production_ga_passed";
  const tracksComplete = resolveSeriesAPartnerExpansionComplete(phases);

  const competitorMatrixPassed =
    seriesArtifacts.competitorMatrix?.overall === "PASSED" &&
    seriesArtifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";
  const channelLivePassed = seriesArtifacts.p0Staging?.children.channelLive.overall === "PASSED";
  const tier2Passed = seriesArtifacts.tier2Summary?.tier2ProofStatus === "proof_passed";
  const channelLiveHonest = channelLivePassed || tier2Passed;

  const milestone = resolveSeriesAPartnerExpansionExecutionMilestone({
    productionGaPassed,
    tracks: phases,
    seriesAIntegrityPassed: seriesIntegrity.integrityPassed,
  });

  const gates = buildSeriesAPartnerExpansionExecutionGates({
    productionGaPassed,
    productionGaMilestone: productionGa.milestone,
    tracksComplete,
    scaleComplete: seriesEvaluation.scaleComplete,
    seriesAIntegrityPassed: seriesIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? seriesEvaluation.goDecision,
    competitorMatrixPassed,
    channelLiveHonest,
  });

  const nextPhase = productionGaPassed
    ? resolveNextIncompleteSeriesAPartnerExpansionPhase(phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!productionGaPassed) {
    recommendedCommands.push("npm run ops:run-production-ga-execution -- --write");
    recommendedCommands.push("npm run ops:run-production-ga-execution -- --execute");
  } else if (!tracksComplete) {
    recommendedCommands.push(
      SERIES_A_PARTNER_EXPANSION_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute",
    );
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push(
      "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-series-a-partner-expansion-env -- --json");
  } else if (!seriesIntegrity.integrityPassed) {
    recommendedCommands.push(
      "npm run ops:validate-series-a-partner-expansion-integrity -- --json",
    );
  }

  if (milestone === "series_a_partner_expansion_passed") {
    recommendedCommands.push(
      "npm run ops:run-market-leader-positioning-execution -- --write",
    );
  }

  return {
    version: "series-a-partner-expansion-execution-v1",
    policyId: SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    productionGaMilestone: productionGa.milestone,
    goDecision: input.goNoGo?.decision ?? seriesEvaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    tracksComplete,
    scaleComplete: seriesEvaluation.scaleComplete,
    seriesAIntegrityPassed: seriesIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/dashboard/reports",
      "/dashboard/integration-health",
      "/platform/commercial-pilot-ops",
      "/solutions/ghost-kitchens",
      "/solutions/meal-prep",
      "/integrations",
    ],
    honestyNote:
      "PASS > SKIPPED — partner channel copy must match Integration Health LIVE/SKIPPED. Never claim enterprise SSO production until gate3 PASS. ICP = all F&B formats.",
  };
}

export function formatSeriesAPartnerExpansionExecutionLines(
  summary: SeriesAPartnerExpansionExecutionSummary,
): string[] {
  return [
    `Series A partner expansion execution: ${summary.milestone}`,
    `Production GA: ${summary.productionGaMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Tracks A–D: ${summary.tracksComplete ? "complete" : "in progress"}`,
    `Scale: ${summary.scaleComplete ? "complete" : "blocked"} · Series A integrity ${summary.seriesAIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next track: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All tracks complete or blocked on production GA",
  ];
}
