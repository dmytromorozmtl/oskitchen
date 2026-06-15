/**
 * Continuous improvement loop — post-era21 pure operational mode (Step 10).
 * Informational recurring tracks only — no env attestation gates.
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
  buildSustainedOperationalExcellencePhaseStatuses,
  resolveMarketLeaderCompleteForSustainedOps,
  resolveSustainedOperationalExcellenceComplete,
  resolveSustainedOperationalExcellencePrerequisites,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
} from "@/lib/commercial/market-leader-positioning-phases-era21";

export const CONTINUOUS_IMPROVEMENT_LOOP_PHASES_ERA22_POLICY_ID =
  "era22-continuous-improvement-loop-phases-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC =
  "docs/next-step-10-continuous-improvement-loop-2026-05-28.md" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC =
  "docs/continuous-improvement-loop-release-checklist-era22.md" as const;

export type ContinuousImprovementLoopTrackFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "per_release"
  | "per_pilot";

export type ContinuousImprovementLoopTrackStatusKind =
  | "healthy"
  | "due_soon"
  | "overdue"
  | "guidance";

export type ContinuousImprovementLoopTrackDef = {
  id: string;
  label: string;
  frequency: ContinuousImprovementLoopTrackFrequency;
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
};

export const CONTINUOUS_IMPROVEMENT_LOOP_TRACKS: readonly ContinuousImprovementLoopTrackDef[] = [
  {
    id: "daily_shift_ops",
    label: "Daily — Owner Briefing shift handoffs",
    frequency: "daily",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/today", SUSTAINED_OPS_ORDER_HUB_ROUTE, SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE],
    smokeScripts: [],
  },
  {
    id: "weekly_integration",
    label: "Weekly — Integration Health + webhook smokes",
    frequency: "weekly",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/integration-health", SERIES_A_PLATFORM_OPS_ROUTE],
    smokeScripts: ["smoke:woo-shopify-live", "smoke:commerce-webhook-drill"],
  },
  {
    id: "monthly_metrics",
    label: "Monthly — Pilot metrics baseline per customer",
    frequency: "monthly",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/reports", SERIES_A_PLATFORM_OPS_ROUTE],
    smokeScripts: ["smoke:pilot-metrics-baseline"],
  },
  {
    id: "quarterly_governance",
    label: "Quarterly — Forbidden claims + competitor matrix",
    frequency: "quarterly",
    docPath: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    routes: ["/dashboard/implementation", "/dashboard/reports"],
    smokeScripts: [
      "smoke:pilot-forbidden-claims-enforcement",
      "smoke:competitor-feature-gap-matrix",
    ],
  },
  {
    id: "product_maturity_quarterly",
    label: "Quarterly — Feature maturity matrix review",
    frequency: "quarterly",
    docPath: SERIES_A_FEATURE_MATURITY_DOC,
    routes: ["/dashboard/implementation"],
    smokeScripts: [],
  },
  {
    id: "per_release_cert",
    label: "Per release — Commercial pilot cert chain",
    frequency: "per_release",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE],
    smokeScripts: ["test:ci:commercial-pilot-runbook:cert"],
  },
  {
    id: "per_pilot_isolation",
    label: "Per new pilot — Isolated GO artifacts (Scale Gate 1)",
    frequency: "per_pilot",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/launch-wizard", SERIES_A_PLATFORM_OPS_ROUTE],
    smokeScripts: ["smoke:pilot-gono-go"],
  },
] as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_TRACKED_ENV_KEYS = [
  "CONTINUOUS_IMPROVEMENT_LOOP_PURE_MODE_ATTESTED",
  "CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CADENCE_REVIEWED",
] as const;

export function detectContinuousImprovementLoopStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return CONTINUOUS_IMPROVEMENT_LOOP_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const CONTINUOUS_IMPROVEMENT_LOOP_STALE_THRESHOLDS_DAYS = {
  weekly_integration: { healthy: 5, dueSoon: 7 },
  monthly_metrics: { healthy: 28, dueSoon: 35 },
  quarterly_governance: { healthy: 80, dueSoon: 90 },
} as const;

export type ContinuousImprovementLoopTrackStatus = {
  id: string;
  label: string;
  frequency: ContinuousImprovementLoopTrackFrequency;
  status: ContinuousImprovementLoopTrackStatusKind;
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  detail: string;
  artifactPath: string | null;
  lastRunAt: string | null;
};

export type ContinuousImprovementLoopPrerequisiteStatus = {
  goDecision: string | null;
  sustainedOpsComplete: boolean;
  pureOperationalMode: boolean;
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
): ContinuousImprovementLoopTrackStatusKind {
  if (!evidencePassed) return "overdue";
  if (ageDays === null) return "due_soon";
  if (ageDays <= thresholds.healthy) return "healthy";
  if (ageDays <= thresholds.dueSoon) return "due_soon";
  return "overdue";
}

export function resolveSustainedOpsCompleteForContinuousImprovement(input: {
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
  const marketLeaderComplete = resolveMarketLeaderCompleteForSustainedOps({
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
  const prerequisites = resolveSustainedOperationalExcellencePrerequisites({
    goDecision,
    marketLeaderComplete,
  });
  if (!prerequisites.prerequisitesComplete) return false;

  const phases = buildSustainedOperationalExcellencePhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    competitorMatrix: input.competitorMatrix,
    env: input.env,
  });
  return resolveSustainedOperationalExcellenceComplete(phases);
}

export function resolveContinuousImprovementLoopPrerequisites(input: {
  goDecision: string | null;
  sustainedOpsComplete: boolean;
}): ContinuousImprovementLoopPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    sustainedOpsComplete: input.sustainedOpsComplete,
    pureOperationalMode: input.goDecision === "GO" && input.sustainedOpsComplete,
  };
}

export function buildContinuousImprovementLoopTrackStatuses(input: {
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  customerName: string | null;
}): ContinuousImprovementLoopTrackStatus[] {
  const p0 = input.p0Staging;
  const tier2 = input.tier2Summary;
  const metrics = input.metricsBaseline;
  const competitor = input.competitorMatrix;
  const customer = input.customerName ?? "customer";

  return CONTINUOUS_IMPROVEMENT_LOOP_TRACKS.map((track) => {
    if (track.id === "daily_shift_ops") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail: `Use Today → Order Hub handoffs and production calendar for ${customer} — no era21 gate panels remain`,
        artifactPath: null,
        lastRunAt: null,
      };
    }

    if (track.id === "weekly_integration") {
      const channelLive = p0?.children.channelLive;
      const channelPassed = channelLive?.overall === "PASSED";
      const tier2Passed = tier2?.tier2ProofStatus === "proof_passed";
      const evidencePassed = channelPassed || tier2Passed;
      const lastRunAt = p0?.runAt ?? tier2?.runAt ?? null;
      const ageDays = daysSince(lastRunAt);
      const status = resolveStaleStatus(
        ageDays,
        CONTINUOUS_IMPROVEMENT_LOOP_STALE_THRESHOLDS_DAYS.weekly_integration,
        evidencePassed,
      );
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail:
          status === "healthy"
            ? "Integration evidence fresh — re-run smokes after credential rotation"
            : status === "due_soon"
              ? "Integration review due soon — schedule smoke:woo-shopify-live + smoke:commerce-webhook-drill"
              : "Run npm run smoke:woo-shopify-live + smoke:commerce-webhook-drill until artifacts honest",
        artifactPath: channelPassed ? "artifacts/p0-staging-proof-unblock-summary.json" : "artifacts/tier2-staging-golden-path-summary.json",
        lastRunAt,
      };
    }

    if (track.id === "monthly_metrics") {
      const metricsPassed = metrics?.overall === "PASSED";
      const lastRunAt = metrics?.runAt ?? metrics?.capturedAt ?? null;
      const ageDays = daysSince(lastRunAt);
      const status = resolveStaleStatus(
        ageDays,
        CONTINUOUS_IMPROVEMENT_LOOP_STALE_THRESHOLDS_DAYS.monthly_metrics,
        metricsPassed,
      );
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail:
          status === "healthy"
            ? `Metrics baseline fresh for ${customer} — maintain per-customer isolation`
            : status === "due_soon"
              ? `Monthly refresh due — npm run smoke:pilot-metrics-baseline (${PILOT_METRICS_BASELINE_ARTIFACT_PATH})`
              : `Run npm run smoke:pilot-metrics-baseline — ${PILOT_METRICS_BASELINE_ARTIFACT_PATH} → PASSED`,
        artifactPath: PILOT_METRICS_BASELINE_ARTIFACT_PATH,
        lastRunAt,
      };
    }

    if (track.id === "quarterly_governance") {
      const aligned =
        competitor?.overall === "PASSED" &&
        competitor.matrixProofStatus === "evidence_aligned_era17";
      const lastRunAt = competitor?.runAt ?? null;
      const ageDays = daysSince(lastRunAt);
      const status = resolveStaleStatus(
        ageDays,
        CONTINUOUS_IMPROVEMENT_LOOP_STALE_THRESHOLDS_DAYS.quarterly_governance,
        aligned,
      );
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail:
          status === "healthy"
            ? "Governance artifacts aligned — review forbidden claims before next sales cycle"
            : status === "due_soon"
              ? "Quarterly governance review due — smoke:pilot-forbidden-claims-enforcement + smoke:competitor-feature-gap-matrix"
              : `Run governance smokes — ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH} must stay evidence_aligned_era17`,
        artifactPath: COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
        lastRunAt,
      };
    }

    if (track.id === "product_maturity_quarterly") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail: `Review ${SERIES_A_FEATURE_MATURITY_DOC} when shipping features — cross-check ${SERIES_A_COMPETITOR_LEAPFROG_DOC}`,
        artifactPath: null,
        lastRunAt: null,
      };
    }

    if (track.id === "per_release_cert") {
      return {
        id: track.id,
        label: track.label,
        frequency: track.frequency,
        status: "guidance" as const,
        docPath: track.docPath,
        routes: track.routes,
        smokeScripts: track.smokeScripts,
        detail:
          "Add npm run test:ci:commercial-pilot-runbook:cert to every release checklist — SKIPPED ≠ PASS",
        artifactPath: null,
        lastRunAt: null,
      };
    }

    return {
      id: track.id,
      label: track.label,
      frequency: track.frequency,
      status: "guidance" as const,
      docPath: track.docPath,
      routes: track.routes,
      smokeScripts: track.smokeScripts,
      detail:
        "Every new pilot gets isolated GO artifacts — SCALE_PER_CUSTOMER_GO_ISOLATION=1 before smoke:pilot-gono-go",
      artifactPath: null,
      lastRunAt: null,
    };
  });
}

export function resolveContinuousImprovementLoopHealthSummary(
  tracks: readonly ContinuousImprovementLoopTrackStatus[],
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

export function resolveNextContinuousImprovementLoopAttentionTrack(
  tracks: readonly ContinuousImprovementLoopTrackStatus[],
): ContinuousImprovementLoopTrackStatus | null {
  return (
    tracks.find((track) => track.status === "overdue") ??
    tracks.find((track) => track.status === "due_soon") ??
    null
  );
}

export function formatContinuousImprovementLoopTrackDetail(
  track: ContinuousImprovementLoopTrackStatus,
): string {
  return `${track.label}: ${track.detail}`;
}

/** Barrel re-exports for era22 orchestrator/UI — canonical paths live in era21 modules. */
export {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
} from "@/lib/commercial/market-leader-positioning-phases-era21";

export {
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
