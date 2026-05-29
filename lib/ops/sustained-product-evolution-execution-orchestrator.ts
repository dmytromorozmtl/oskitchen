/**
 * Sustained product evolution execution orchestrator — Step 11 honest milestone + track truth.
 * Policy: era39-sustained-product-evolution-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateSustainedProductEvolutionIntegrity } from "@/lib/commercial/sustained-product-evolution-integrity-era35";
import {
  detectSustainedProductEvolutionStarted,
  resolveNextSustainedProductEvolutionAttentionTrack,
  type SustainedProductEvolutionTrackStatus,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import { buildSustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID =
  "era39-sustained-product-evolution-execution-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_DOC =
  "docs/next-step-11-sustained-product-evolution-2026-05-29.md" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_STEP12_DOC =
  "docs/next-step-12-continuous-improvement-loop-execution-2026-05-29.md" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/sustained-product-evolution-execution-summary.json" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT =
  "artifacts/sustained-product-evolution-execution-report.html" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-sustained-product-evolution-execution" as const;

export type SustainedProductEvolutionExecutionMilestone =
  | "sustained_operational_excellence_blocked"
  | "awaiting_improvement_loop_closure"
  | "awaiting_track_customer_feedback"
  | "awaiting_track_competitor_leapfrog"
  | "awaiting_ownership_matrix_review"
  | "awaiting_pure_ops_terminus"
  | "awaiting_product_evolution_integrity"
  | "sustained_product_evolution_passed";

export type SustainedProductEvolutionExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type SustainedProductEvolutionExecutionSummary = {
  version: "sustained-product-evolution-execution-v1";
  policyId: typeof SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: SustainedProductEvolutionExecutionMilestone;
  sustainedOpsExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  productEvolutionReady: boolean;
  continuousImprovementLoopActive: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  tracksHealthy: boolean;
  overdueCount: number;
  productEvolutionIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  tracks: readonly SustainedProductEvolutionTrackStatus[];
  gates: readonly SustainedProductEvolutionExecutionGateStatus[];
  nextAttentionTrack: SustainedProductEvolutionTrackStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveSustainedProductEvolutionExecutionMilestone(input: {
  sustainedOperationalExcellencePassed: boolean;
  continuousImprovementLoopActive: boolean;
  productEvolutionReady: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  overdueCount: number;
  nextAttentionTrack: Pick<SustainedProductEvolutionTrackStatus, "id"> | null;
  productEvolutionStarted: boolean;
  ownershipMatrixReviewed: boolean;
  productEvolutionIntegrityPassed: boolean;
}): SustainedProductEvolutionExecutionMilestone {
  if (!input.sustainedOperationalExcellencePassed) {
    return "sustained_operational_excellence_blocked";
  }

  if (!input.continuousImprovementLoopActive) {
    return "awaiting_improvement_loop_closure";
  }

  if (!input.sustainedOpsConvergenceReady) {
    return "awaiting_pure_ops_terminus";
  }

  if (input.overdueCount > 0 && input.nextAttentionTrack) {
    switch (input.nextAttentionTrack.id) {
      case "customer_feedback_backlog":
        return "awaiting_track_customer_feedback";
      case "competitor_leapfrog_roadmap":
        return "awaiting_track_competitor_leapfrog";
      default:
        break;
    }
  }

  if (input.productEvolutionStarted && !input.ownershipMatrixReviewed) {
    return "awaiting_ownership_matrix_review";
  }

  if (!input.productEvolutionReady) {
    return "awaiting_improvement_loop_closure";
  }

  if (!input.pureOperationalModeEra25Active) {
    return "awaiting_pure_ops_terminus";
  }

  if (!input.productEvolutionIntegrityPassed) {
    return "awaiting_product_evolution_integrity";
  }

  return "sustained_product_evolution_passed";
}

export function buildSustainedProductEvolutionExecutionGates(input: {
  sustainedOperationalExcellencePassed: boolean;
  sustainedOpsExecutionMilestone: string | null;
  continuousImprovementLoopActive: boolean;
  productEvolutionReady: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  tracksHealthy: boolean;
  overdueCount: number;
  competitorLeapfrogHealthy: boolean;
  customerFeedbackHealthy: boolean;
  ownershipMatrixReviewed: boolean;
  productEvolutionStarted: boolean;
  productEvolutionIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  competitorAligned: boolean;
  metricsBaselinePassed: boolean;
}): SustainedProductEvolutionExecutionGateStatus[] {
  return [
    {
      id: "sustained_operational_excellence",
      label: "Sustained operational excellence complete (Step 10)",
      complete: input.sustainedOperationalExcellencePassed,
      proofStatus: input.sustainedOperationalExcellencePassed
        ? "sustained_operational_excellence_passed"
        : input.sustainedOpsExecutionMilestone,
      detail: input.sustainedOperationalExcellencePassed
        ? "Cadences A–D + sustained ops integrity passed."
        : "Complete Step 10 — sustained operational excellence execution.",
      command: "npm run ops:run-sustained-operational-excellence-execution -- --write",
    },
    {
      id: "improvement_loop_active",
      label: "Continuous improvement loop active",
      complete: input.continuousImprovementLoopActive,
      proofStatus: input.continuousImprovementLoopActive ? "loop_active" : "blocked",
      detail: input.continuousImprovementLoopActive
        ? "Sustained ops complete — improvement loop tracks unlocked."
        : "Step 10 improvement loop prerequisite not met.",
      command: "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    },
    {
      id: "sustained_ops_convergence",
      label: "Era25 sustained ops convergence ready",
      complete: input.sustainedOpsConvergenceReady,
      proofStatus: input.sustainedOpsConvergenceReady ? "convergence_ready" : "blocked",
      detail: input.sustainedOpsConvergenceReady
        ? "Sustained operational excellence convergence era25 milestone ready."
        : "Run sustained ops convergence orchestrator before product evolution sign-off.",
      command:
        "npm run ops:run-sustained-operational-excellence-convergence-era25-post-market-leader-convergence-orchestrator -- --write",
    },
    {
      id: "product_evolution_tracks",
      label: "Product evolution measurable tracks healthy",
      complete: input.tracksHealthy,
      proofStatus: input.tracksHealthy ? "tracks_healthy" : `${input.overdueCount}_overdue`,
      detail: input.tracksHealthy
        ? "No overdue customer feedback or competitor leapfrog tracks."
        : "Refresh stale product evolution evidence — guidance tracks do not block.",
      command: SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "customer_feedback",
      label: "Operator feedback captured (customer_feedback_backlog)",
      complete: input.customerFeedbackHealthy,
      proofStatus: input.customerFeedbackHealthy ? "healthy" : "stale",
      detail: "Requires operator_feedback_score in pilot-metrics-baseline PASS artifact.",
      command: "npm run smoke:pilot-metrics-baseline",
    },
    {
      id: "competitor_leapfrog",
      label: "Competitor leapfrog roadmap aligned",
      complete: input.competitorLeapfrogHealthy && input.competitorAligned,
      proofStatus:
        input.competitorLeapfrogHealthy && input.competitorAligned
          ? "evidence_aligned_era17"
          : "stale_or_misaligned",
      detail: "Competitor matrix must remain evidence_aligned_era17 — no aspirational PASS.",
      command: "npm run smoke:competitor-feature-gap-matrix",
    },
    {
      id: "ownership_matrix",
      label: "Ownership matrix quarterly review",
      complete: !input.productEvolutionStarted || input.ownershipMatrixReviewed,
      proofStatus: input.ownershipMatrixReviewed ? "reviewed" : "pending",
      detail: input.productEvolutionStarted
        ? "SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_REVIEWED required after product evolution attestation."
        : "Optional until product evolution env attestation started.",
      command: "npm run ops:export-sustained-product-evolution-ownership-matrix -- --write",
    },
    {
      id: "pure_ops_terminus",
      label: "Pure operational mode era25 terminus active",
      complete: input.pureOperationalModeEra25Active,
      proofStatus: input.pureOperationalModeEra25Active ? "era25_active" : "pending",
      detail: "Phase 11.4 — steady-state operator loop convergence train closure.",
      command: "npm run ops:validate-pure-operational-mode-terminus-era25 -- --json",
    },
    {
      id: "product_evolution_integrity",
      label: "Sustained product evolution integrity (era35)",
      complete: input.productEvolutionIntegrityPassed,
      proofStatus: input.productEvolutionIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No product evolution started without improvement loop or fake competitor PASS.",
      command: "npm run ops:validate-sustained-product-evolution-integrity -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through product evolution — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildSustainedProductEvolutionExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  sustainedOpsExecution?: SustainedOperationalExcellenceExecutionSummary | null;
  marketLeaderExecution?: MarketLeaderPositioningExecutionSummary | null;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): SustainedProductEvolutionExecutionSummary {
  const env = input.env ?? process.env;
  const artifacts = readContinuousImprovementLoopArtifacts();
  const evaluation = evaluateSustainedProductEvolution(env);
  const productEvolutionIntegrity = evaluateSustainedProductEvolutionIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? artifacts.goNoGoSummary,
    p0StagingOverride: artifacts.p0Staging,
    tier2SummaryOverride: artifacts.tier2Summary,
    metricsBaselineOverride: artifacts.metricsBaseline,
    caseStudyDraftOverride: artifacts.caseStudyDraft,
    investorOnepagerOverride: artifacts.investorOnepager,
    rollbackDrillOverride: artifacts.rollbackDrill,
    competitorMatrixOverride: artifacts.competitorMatrix,
  });
  const inflection = evaluateCommercialInflectionReadiness(env);

  const sustainedOpsExecution =
    input.sustainedOpsExecution ??
    buildSustainedOperationalExcellenceExecutionSummary({
      env,
      marketLeaderExecution: input.marketLeaderExecution ?? null,
      seriesAExpansion: input.seriesAExpansion ?? null,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });

  const sustainedOperationalExcellencePassed =
    sustainedOpsExecution.milestone === "sustained_operational_excellence_passed";
  const tracks = evaluation.tracks;
  const overdueCount = evaluation.health.overdueCount;
  const tracksHealthy = overdueCount === 0;
  const nextAttentionTrack = resolveNextSustainedProductEvolutionAttentionTrack(tracks);
  const productEvolutionStarted = detectSustainedProductEvolutionStarted(env);
  const ownershipMatrixReviewed = parseEnvBoolean(
    env.SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_REVIEWED,
  ) === true;

  const feedbackTrack = tracks.find((track) => track.id === "customer_feedback_backlog");
  const leapfrogTrack = tracks.find((track) => track.id === "competitor_leapfrog_roadmap");
  const customerFeedbackHealthy =
    feedbackTrack?.status === "healthy" || feedbackTrack?.status === "guidance";
  const competitorLeapfrogHealthy =
    leapfrogTrack?.status === "healthy" || leapfrogTrack?.status === "guidance";
  const competitorAligned =
    artifacts.competitorMatrix?.overall === "PASSED" &&
    artifacts.competitorMatrix.matrixProofStatus === "evidence_aligned_era17";
  const metricsBaselinePassed = artifacts.metricsBaseline?.overall === "PASSED";

  const milestone = resolveSustainedProductEvolutionExecutionMilestone({
    sustainedOperationalExcellencePassed,
    continuousImprovementLoopActive: evaluation.continuousImprovementLoopActive,
    productEvolutionReady: evaluation.productEvolutionReady,
    sustainedOpsConvergenceReady: evaluation.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: evaluation.prerequisites.pureOperationalModeEra25Active,
    overdueCount,
    nextAttentionTrack,
    productEvolutionStarted,
    ownershipMatrixReviewed,
    productEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
  });

  const gates = buildSustainedProductEvolutionExecutionGates({
    sustainedOperationalExcellencePassed,
    sustainedOpsExecutionMilestone: sustainedOpsExecution.milestone,
    continuousImprovementLoopActive: evaluation.continuousImprovementLoopActive,
    productEvolutionReady: evaluation.productEvolutionReady,
    sustainedOpsConvergenceReady: evaluation.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: evaluation.prerequisites.pureOperationalModeEra25Active,
    tracksHealthy,
    overdueCount,
    competitorLeapfrogHealthy,
    customerFeedbackHealthy,
    ownershipMatrixReviewed,
    productEvolutionStarted,
    productEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? evaluation.goDecision,
    competitorAligned,
    metricsBaselinePassed,
  });

  const recommendedCommands: string[] = [];
  if (!sustainedOperationalExcellencePassed) {
    recommendedCommands.push("npm run ops:run-sustained-operational-excellence-execution -- --write");
    recommendedCommands.push("npm run ops:run-sustained-operational-excellence-execution -- --execute");
  } else if (!evaluation.continuousImprovementLoopActive) {
    recommendedCommands.push(
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-continuous-improvement-loop -- --json");
  } else if (!evaluation.prerequisites.sustainedOpsConvergenceReady) {
    recommendedCommands.push(
      "npm run ops:run-sustained-operational-excellence-convergence-era25-post-market-leader-convergence-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-pure-operational-mode-terminus-era25 -- --json");
  } else if (overdueCount > 0 && nextAttentionTrack) {
    if (nextAttentionTrack.id === "customer_feedback_backlog") {
      recommendedCommands.push("npm run smoke:pilot-metrics-baseline");
    }
    if (nextAttentionTrack.id === "competitor_leapfrog_roadmap") {
      recommendedCommands.push("npm run smoke:competitor-feature-gap-matrix");
      recommendedCommands.push("npm run smoke:pilot-forbidden-claims-enforcement");
    }
    recommendedCommands.push(
      "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    );
  } else if (productEvolutionStarted && !ownershipMatrixReviewed) {
    recommendedCommands.push(
      "npm run ops:export-sustained-product-evolution-ownership-matrix -- --write",
    );
  } else if (!evaluation.prerequisites.pureOperationalModeEra25Active) {
    recommendedCommands.push(
      "npm run ops:run-pure-operational-mode-terminus-era25-post-sustained-ops-convergence-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-pure-operational-mode-terminus-era25 -- --json");
  } else if (!productEvolutionIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-sustained-product-evolution-integrity -- --json");
  }

  if (milestone === "sustained_product_evolution_passed") {
    recommendedCommands.push(
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    );
  }

  return {
    version: "sustained-product-evolution-execution-v1",
    policyId: SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    sustainedOpsExecutionMilestone: sustainedOpsExecution.milestone,
    goDecision: input.goNoGo?.decision ?? evaluation.goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    productEvolutionReady: evaluation.productEvolutionReady,
    continuousImprovementLoopActive: evaluation.continuousImprovementLoopActive,
    sustainedOpsConvergenceReady: evaluation.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active: evaluation.prerequisites.pureOperationalModeEra25Active,
    tracksHealthy,
    overdueCount,
    productEvolutionIntegrityPassed: productEvolutionIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    tracks,
    gates,
    nextAttentionTrack,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/implementation",
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops",
      "/solutions/ghost-kitchens",
      "/solutions/meal-prep",
      "/dashboard/reports",
    ],
    honestyNote:
      "PASS > SKIPPED — feature maturity is per_ship guidance only. Competitor matrix must cite live pilot evidence. No fake ownership matrix attestation. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatSustainedProductEvolutionExecutionLines(
  summary: SustainedProductEvolutionExecutionSummary,
): string[] {
  return [
    `Sustained product evolution execution: ${summary.milestone}`,
    `Sustained ops: ${summary.sustainedOpsExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Tracks: ${summary.tracksHealthy ? "healthy" : `${summary.overdueCount} overdue`}`,
    `Improvement loop: ${summary.continuousImprovementLoopActive ? "active" : "blocked"} · convergence ${summary.sustainedOpsConvergenceReady ? "ready" : "pending"} · integrity ${summary.productEvolutionIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextAttentionTrack
      ? `Next track: ${summary.nextAttentionTrack.label} — ${summary.nextAttentionTrack.detail}`
      : "All measurable tracks fresh or blocked on sustained ops",
  ];
}
