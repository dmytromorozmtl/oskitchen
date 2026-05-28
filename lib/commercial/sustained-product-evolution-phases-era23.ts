/**
 * Sustained product evolution — post-era22 product-led growth (Step 11).
 * Informational tracks only — no env attestation gates.
 */
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  resolveContinuousImprovementLoopPrerequisites,
  resolveSustainedOpsCompleteForContinuousImprovement,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SUSTAINED_PRODUCT_EVOLUTION_PHASES_ERA23_POLICY_ID =
  "era23-sustained-product-evolution-phases-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC =
  "docs/next-step-11-sustained-product-evolution-2026-05-28.md" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC =
  "docs/sustained-product-evolution-ownership-matrix-era23.md" as const;

export const IMPLEMENTATION_BACKLOG_DOC = "docs/implementation-backlog.md" as const;

export type SustainedProductEvolutionTrackFrequency =
  | "monthly"
  | "quarterly"
  | "per_ship"
  | "ongoing";

export type SustainedProductEvolutionTrackStatusKind =
  | "healthy"
  | "due_soon"
  | "overdue"
  | "guidance";

export type SustainedProductEvolutionTrackDef = {
  id: string;
  label: string;
  frequency: SustainedProductEvolutionTrackFrequency;
  ownerRole: string;
  docPath: string;
  routes: readonly string[];
};

export const SUSTAINED_PRODUCT_EVOLUTION_TRACKS: readonly SustainedProductEvolutionTrackDef[] = [
  {
    id: "feature_maturity_matrix",
    label: "Product — Feature maturity matrix reflects shipped reality",
    frequency: "per_ship",
    ownerRole: "product",
    docPath: SERIES_A_FEATURE_MATURITY_DOC,
    routes: ["/dashboard/implementation", SERIES_A_PLATFORM_OPS_ROUTE],
  },
  {
    id: "competitor_leapfrog_roadmap",
    label: "Product — Competitor leapfrog roadmap gap review",
    frequency: "quarterly",
    ownerRole: "product",
    docPath: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    routes: ["/dashboard/implementation", "/dashboard/reports"],
  },
  {
    id: "customer_feedback_backlog",
    label: "Product — Customer feedback → implementation backlog",
    frequency: "monthly",
    ownerRole: "product",
    docPath: IMPLEMENTATION_BACKLOG_DOC,
    routes: ["/dashboard/reports", "/dashboard/implementation"],
  },
  {
    id: "gtm_landing_alignment",
    label: "Marketing — GTM landing pages vs forbidden claims",
    frequency: "quarterly",
    ownerRole: "marketing",
    docPath: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    routes: [SERIES_A_GHOST_KITCHEN_LANDING_ROUTE, SERIES_A_MEAL_PREP_LANDING_ROUTE],
  },
  {
    id: "implementation_hub_rollout",
    label: "Engineering — Implementation hub rollout cadence",
    frequency: "quarterly",
    ownerRole: "engineering",
    docPath: SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
    routes: ["/dashboard/implementation"],
  },
  {
    id: "ownership_matrix_review",
    label: "Leadership — Cross-functional ownership matrix review",
    frequency: "quarterly",
    ownerRole: "leadership",
    docPath: SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE],
  },
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_STALE_THRESHOLDS_DAYS = {
  customer_feedback_backlog: { healthy: 28, dueSoon: 35 },
  competitor_leapfrog_roadmap: { healthy: 80, dueSoon: 90 },
} as const;

export type SustainedProductEvolutionTrackStatus = {
  id: string;
  label: string;
  frequency: SustainedProductEvolutionTrackFrequency;
  ownerRole: string;
  status: SustainedProductEvolutionTrackStatusKind;
  docPath: string;
  routes: readonly string[];
  detail: string;
  artifactPath: string | null;
  lastRunAt: string | null;
};

export type SustainedProductEvolutionPrerequisiteStatus = {
  goDecision: string | null;
  continuousImprovementLoopActive: boolean;
  productEvolutionReady: boolean;
};

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return (Date.now() - parsed) / (1000 * 60 * 60 * 24);
}

function resolveStaleStatus(
  ageDays: number | null,
  thresholds: { healthy: number; dueSoon: number },
  evidencePassed: boolean,
): SustainedProductEvolutionTrackStatusKind {
  if (!evidencePassed) return "overdue";
  if (ageDays === null) return "due_soon";
  if (ageDays <= thresholds.healthy) return "healthy";
  if (ageDays <= thresholds.dueSoon) return "due_soon";
  return "overdue";
}

export function resolveContinuousImprovementLoopActive(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const sustainedOpsComplete = resolveSustainedOpsCompleteForContinuousImprovement({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix: input.competitorMatrix,
    env: input.env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  return resolveContinuousImprovementLoopPrerequisites({
    goDecision,
    sustainedOpsComplete,
  }).pureOperationalMode;
}

export function resolveSustainedProductEvolutionPrerequisites(input: {
  goDecision: string | null;
  continuousImprovementLoopActive: boolean;
}): SustainedProductEvolutionPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    continuousImprovementLoopActive: input.continuousImprovementLoopActive,
    productEvolutionReady:
      input.goDecision === "GO" && input.continuousImprovementLoopActive,
  };
}

function findMetricValue(
  metrics: PilotMetricsBaselineSummary | null,
  metricId: string,
): { captured: boolean; lastRunAt: string | null } {
  if (!metrics) return { captured: false, lastRunAt: null };
  const metric = metrics.metrics.find((entry) => entry.id === metricId);
  const captured = metric?.status === "captured" && metric.value !== undefined;
  return {
    captured,
    lastRunAt: metrics.runAt ?? metrics.capturedAt ?? null,
  };
}

export function buildSustainedProductEvolutionTrackStatuses(input: {
  metricsBaseline: PilotMetricsBaselineSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  customerName: string | null;
}): SustainedProductEvolutionTrackStatus[] {
  const customer = input.customerName ?? "customer";
  const competitor = input.competitorMatrix;

  return SUSTAINED_PRODUCT_EVOLUTION_TRACKS.map((track) => {
    if (track.id === "feature_maturity_matrix") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        ownerRole: track.ownerRole,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        detail: `Update ${SERIES_A_FEATURE_MATURITY_DOC} on every feature ship — cross-check sales claims via verify-claims`,
        artifactPath: null,
        lastRunAt: null,
      };
    }

    if (track.id === "competitor_leapfrog_roadmap") {
      const aligned =
        competitor?.overall === "PASSED" &&
        competitor.matrixProofStatus === "evidence_aligned_era17";
      const lastRunAt = competitor?.runAt ?? null;
      const ageDays = daysSince(lastRunAt);
      const status = resolveStaleStatus(
        ageDays,
        SUSTAINED_PRODUCT_EVOLUTION_STALE_THRESHOLDS_DAYS.competitor_leapfrog_roadmap,
        aligned,
      );
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        ownerRole: track.ownerRole,
        status,
        docPath: track.docPath,
        routes: track.routes,
        detail:
          status === "healthy"
            ? `Leapfrog roadmap aligned with ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}`
            : `Review ${SERIES_A_COMPETITOR_LEAPFROG_DOC} against competitor matrix smoke evidence`,
        artifactPath: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
        lastRunAt,
      };
    }

    if (track.id === "customer_feedback_backlog") {
      const feedback = findMetricValue(input.metricsBaseline, "operator_feedback_score");
      const metricsPassed = input.metricsBaseline?.overall === "PASSED";
      const evidencePassed = feedback.captured && metricsPassed;
      const ageDays = daysSince(feedback.lastRunAt);
      const status = resolveStaleStatus(
        ageDays,
        SUSTAINED_PRODUCT_EVOLUTION_STALE_THRESHOLDS_DAYS.customer_feedback_backlog,
        evidencePassed,
      );
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        ownerRole: track.ownerRole,
        status,
        docPath: track.docPath,
        routes: track.routes,
        detail:
          status === "healthy"
            ? `Operator feedback captured for ${customer} — triage into ${IMPLEMENTATION_BACKLOG_DOC}`
            : `Run npm run smoke:pilot-metrics-baseline — capture operator_feedback_score before backlog triage`,
        artifactPath: "artifacts/pilot-metrics-baseline-summary.json",
        lastRunAt: feedback.lastRunAt,
      };
    }

    if (track.id === "gtm_landing_alignment") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        ownerRole: track.ownerRole,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        detail: `Quarterly review ${SERIES_A_GHOST_KITCHEN_LANDING_ROUTE} + ${SERIES_A_MEAL_PREP_LANDING_ROUTE} against ${SERIES_A_FORBIDDEN_CLAIMS_DOC}`,
        artifactPath: null,
        lastRunAt: null,
      };
    }

    if (track.id === "implementation_hub_rollout") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        ownerRole: track.ownerRole,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        detail:
          "Use /dashboard/implementation for rollout status — pair with feature maturity matrix on each release train",
        artifactPath: null,
        lastRunAt: null,
      };
    }

    return {
      id: track.id,
      label: track.label,
      frequency: track.frequency,
      ownerRole: track.ownerRole,
      status: "guidance" as const,
      docPath: track.docPath,
      routes: track.routes,
      detail: `Review cross-functional ownership in ${SUSTAINED_PRODUCT_EVOLUTION_OWNERSHIP_MATRIX_DOC} each quarter`,
      artifactPath: null,
      lastRunAt: null,
    };
  });
}

export function resolveSustainedProductEvolutionHealthSummary(
  tracks: readonly SustainedProductEvolutionTrackStatus[],
): {
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
} {
  return {
    healthyCount: tracks.filter((track) => track.status === "healthy").length,
    dueSoonCount: tracks.filter((track) => track.status === "due_soon").length,
    overdueCount: tracks.filter((track) => track.status === "overdue").length,
    guidanceCount: tracks.filter((track) => track.status === "guidance").length,
  };
}

export function resolveNextSustainedProductEvolutionAttentionTrack(
  tracks: readonly SustainedProductEvolutionTrackStatus[],
): SustainedProductEvolutionTrackStatus | null {
  return (
    tracks.find((track) => track.status === "overdue") ??
    tracks.find((track) => track.status === "due_soon") ??
    null
  );
}

export function formatSustainedProductEvolutionTrackDetail(
  track: SustainedProductEvolutionTrackStatus,
): string {
  return `${track.label}: ${track.detail}`;
}
