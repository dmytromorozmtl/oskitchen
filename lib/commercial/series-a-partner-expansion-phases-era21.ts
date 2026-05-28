/**
 * Series A / partner expansion phases — fundraise + channel motion (Step 7 after Scale).
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
  buildScaleReadinessPhaseStatuses,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveMonth2CompleteForScale,
  resolveScaleReadinessComplete,
  resolveScaleReadinessPrerequisites,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/scale-readiness-phases-era21";

export {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
};

export const COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH =
  "artifacts/competitor-feature-gap-matrix-summary.json" as const;

export const SERIES_A_PARTNER_EXPANSION_PHASES_ERA21_POLICY_ID =
  "era21-series-a-partner-expansion-phases-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_STEP7_DOC =
  "docs/next-step-7-series-a-partner-expansion-2026-05-28.md" as const;

export const SERIES_A_FEATURE_MATURITY_DOC = "docs/feature-maturity-matrix.md" as const;

export const SERIES_A_COMPETITOR_LEAPFROG_DOC =
  "docs/competitor-leapfrog-roadmap-2026-05-28.md" as const;

export const SERIES_A_FORBIDDEN_CLAIMS_DOC =
  "docs/sales-forbidden-claims-training-era20.md" as const;

export const SERIES_A_PLATFORM_OPS_ROUTE = "/platform/commercial-pilot-ops" as const;

export const SERIES_A_GHOST_KITCHEN_LANDING_ROUTE = "/solutions/ghost-kitchens" as const;

export const SERIES_A_MEAL_PREP_LANDING_ROUTE = "/solutions/meal-prep" as const;

export const SERIES_A_INTEGRATIONS_ROUTE = "/integrations" as const;

export type SeriesAPartnerExpansionPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  blocksCompletion: boolean;
};

export const SERIES_A_PARTNER_EXPANSION_PHASES: readonly SeriesAPartnerExpansionPhaseDef[] = [
  {
    id: "track_a_series_a_data_room",
    label: "Track A — Series A data room bundle (audited artifacts + financial hooks)",
    keys: ["SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED"],
    docPath: SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
    routes: ["/dashboard/reports", SERIES_A_PLATFORM_OPS_ROUTE],
    smokeScripts: ["smoke:investor-narrative-onepager", "smoke:competitor-feature-gap-matrix"],
    blocksCompletion: true,
  },
  {
    id: "track_b_partner_channel_expansion",
    label: "Track B — Partner channel one-pager (honest Woo/Shopify maturity)",
    keys: ["SERIES_A_PARTNER_ONEPAGER_REVIEWED"],
    docPath: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    routes: [
      SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
      SERIES_A_INTEGRATIONS_ROUTE,
      "/dashboard/integration-health",
    ],
    smokeScripts: ["smoke:woo-shopify-live", "smoke:woo-shopify"],
    blocksCompletion: true,
  },
  {
    id: "track_c_multi_region_playbook",
    label: "Track C — Multi-region pilot playbook (EU/US staging honesty)",
    keys: ["SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED", "SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED"],
    docPath: SERIES_A_FORBIDDEN_CLAIMS_DOC,
    routes: ["/dashboard/implementation", "/dashboard/launch-wizard"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement"],
    blocksCompletion: true,
  },
  {
    id: "track_d_customer_success_repeatability",
    label: "Track D — Customer success playbook (NPS + expansion metrics from pilot #1)",
    keys: ["SERIES_A_CS_PLAYBOOK_REVIEWED"],
    docPath: SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
    routes: ["/dashboard/reports", "/dashboard/today"],
    smokeScripts: ["smoke:pilot-metrics-baseline"],
    blocksCompletion: true,
  },
] as const;

export const SERIES_A_PARTNER_EXPANSION_TRACKED_ENV_KEYS = [
  "SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED",
  "SERIES_A_PARTNER_ONEPAGER_REVIEWED",
  "SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED",
  "SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED",
  "SERIES_A_CS_PLAYBOOK_REVIEWED",
] as const;

export type SeriesAPartnerExpansionPhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  optional: boolean;
  presentKeys: string[];
  missingKeys: string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  detail: string;
};

export type SeriesAPartnerExpansionPrerequisiteStatus = {
  goDecision: string | null;
  scaleComplete: boolean;
  prerequisitesComplete: boolean;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function dataRoomChainHonest(input: {
  p0: P0StagingProofUnblockSummary | null;
  tier2: Tier2StagingGoldenPathSummary | null;
  metrics: PilotMetricsBaselineSummary | null;
  investor: InvestorNarrativeOnepagerSummary | null;
  caseStudy: PilotCaseStudyDraftSummary | null;
  go: PilotGoNoGoSummary | null;
}): { complete: boolean; gaps: string[] } {
  const gaps: string[] = [];
  if (input.p0?.p0ProofStatus !== "proof_passed") {
    gaps.push(`${P0_STAGING_PROOF_ARTIFACT_PATH} → proof_passed`);
  }
  if (input.tier2?.tier2ProofStatus !== "proof_passed") {
    gaps.push(`${TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH} → proof_passed`);
  }
  if (input.metrics?.overall !== "PASSED") {
    gaps.push(`${PILOT_METRICS_BASELINE_ARTIFACT_PATH} → overall: PASSED`);
  }
  if (
    input.investor?.overall !== "PASSED" ||
    input.investor.narrativeProofStatus !== "proof_ready_with_metrics"
  ) {
    gaps.push(`${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH} → proof_ready_with_metrics`);
  }
  if (input.caseStudy?.caseStudyProofStatus !== "internal_draft_ready") {
    gaps.push(`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH} → internal_draft_ready`);
  }
  if (input.go?.decision !== "GO") {
    gaps.push(`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} → decision: GO`);
  }
  return { complete: gaps.length === 0, gaps };
}

function metricCaptured(
  metrics: PilotMetricsBaselineSummary | null,
  metricId: string,
  envKey: string,
  env: NodeJS.ProcessEnv,
): boolean {
  const fromArtifact =
    metrics?.metrics.find((metric) => metric.id === metricId)?.status === "captured";
  const fromEnv = Boolean(env[envKey]?.trim());
  return fromArtifact || fromEnv;
}

export function resolveScaleCompleteForSeriesA(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill: PilotRollbackDrillSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const env = input.env ?? process.env;
  const month2Complete = resolveMonth2CompleteForScale({
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveScaleReadinessPrerequisites({
    goDecision,
    month2Complete,
  });
  if (!prerequisites.prerequisitesComplete) return false;

  const phases = buildScaleReadinessPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    env,
  });
  return resolveScaleReadinessComplete(phases);
}

export function resolveSeriesAPartnerExpansionPrerequisites(input: {
  goDecision: string | null;
  scaleComplete: boolean;
}): SeriesAPartnerExpansionPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    scaleComplete: input.scaleComplete,
    prerequisitesComplete: input.goDecision === "GO" && input.scaleComplete,
  };
}

export function buildSeriesAPartnerExpansionPhaseStatuses(input: {
  prerequisites: SeriesAPartnerExpansionPrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): SeriesAPartnerExpansionPhaseStatus[] {
  const env = input.env ?? process.env;
  const p0 = input.p0Staging;
  const tier2 = input.tier2Summary;
  const metrics = input.metricsBaseline;
  const competitor = input.competitorMatrix;
  const chain = dataRoomChainHonest({
    p0,
    tier2,
    metrics,
    investor: input.investorOnepager,
    caseStudy: input.caseStudyDraft,
    go: input.goNoGoSummary,
  });

  return SERIES_A_PARTNER_EXPANSION_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "track_a_series_a_data_room") {
      const published = parseEnvBoolean(env.SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED) === true;
      const dataRoomIndexPublished = parseEnvBoolean(env.SCALE_DATA_ROOM_INDEX_PUBLISHED) === true;
      const competitorAligned =
        competitor?.overall === "PASSED" &&
        competitor.matrixProofStatus === "evidence_aligned_era17";
      complete = published && dataRoomIndexPublished && chain.complete && competitorAligned;
      detail = complete
        ? "Series A data room bundle published — artifact hashes audited, competitor matrix aligned"
        : !dataRoomIndexPublished
          ? "Complete Scale Gate 5 first — SCALE_DATA_ROOM_INDEX_PUBLISHED=1"
          : !chain.complete
            ? `Fix data room chain: ${chain.gaps.join("; ")}`
            : !competitorAligned
              ? `Run npm run smoke:competitor-feature-gap-matrix — ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH} → evidence_aligned_era17`
              : "Publish audited bundle with hashes — SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1";
    } else if (phase.id === "track_b_partner_channel_expansion") {
      const reviewed = parseEnvBoolean(env.SERIES_A_PARTNER_ONEPAGER_REVIEWED) === true;
      const channelLivePassed = p0?.children.channelLive.overall === "PASSED";
      const tier2Passed = tier2?.tier2ProofStatus === "proof_passed";
      const integrationHonest = channelLivePassed || tier2Passed;
      complete = reviewed && integrationHonest;
      detail = complete
        ? "Partner one-pager reviewed — Woo/Shopify maturity honest in co-marketing copy"
        : !integrationHonest
          ? "Run npm run smoke:woo-shopify-live before any LIVE marketplace partner claims"
          : "Review partner one-pager against Integration Health — SERIES_A_PARTNER_ONEPAGER_REVIEWED=1";
    } else if (phase.id === "track_c_multi_region_playbook") {
      const drafted = parseEnvBoolean(env.SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED) === true;
      const claimsReviewed =
        parseEnvBoolean(env.SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED) === true ||
        parseEnvBoolean(env.MARKETING_CLAIMS_STRICT) === true;
      const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
      complete = drafted && claimsReviewed && perCustomerIsolation;
      detail = complete
        ? "Multi-region playbook drafted — separate GO artifacts per region, forbidden claims reviewed"
        : !perCustomerIsolation
          ? "Extend Scale Gate 1 — SCALE_PER_CUSTOMER_GO_ISOLATION=1 for per-region GO artifacts"
          : !claimsReviewed
            ? "Review locale forbidden claims — SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1 or MARKETING_CLAIMS_STRICT=1"
            : "Draft EU/US staging runbook with honest SKIPPED/PASS labels — SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED=1";
    } else {
      const reviewed = parseEnvBoolean(env.SERIES_A_CS_PLAYBOOK_REVIEWED) === true;
      const metricsPassed = metrics?.overall === "PASSED";
      const operatorFeedback = metricCaptured(
        metrics,
        "operator_feedback_score",
        "PILOT_METRICS_OPERATOR_FEEDBACK_SCORE",
        env,
      );
      const supportTickets = metricCaptured(
        metrics,
        "support_tickets_per_week",
        "PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK",
        env,
      );
      complete = reviewed && metricsPassed && operatorFeedback && supportTickets;
      detail = complete
        ? "CS playbook reviewed with real operator NPS + support load from pilot #1"
        : !metricsPassed
          ? "Capture pilot metrics baseline first — npm run smoke:pilot-metrics-baseline"
          : !operatorFeedback
            ? "Set PILOT_METRICS_OPERATOR_FEEDBACK_SCORE from pilot midpoint survey"
            : !supportTickets
              ? "Set PILOT_METRICS_SUPPORT_TICKETS_PER_WEEK — track trend, no SLA claim unless contracted"
              : "Review Week 1 → Month 2 CS motion — SERIES_A_CS_PLAYBOOK_REVIEWED=1";
    }

    const missingKeys = phase.keys.filter((key) => !env[key]?.trim());
    const presentKeys = phase.keys.filter((key) => env[key]?.trim());

    return {
      id: phase.id,
      label: phase.label,
      complete,
      optional,
      presentKeys: [...presentKeys],
      missingKeys: [...missingKeys],
      docPath: phase.docPath,
      routes: phase.routes,
      smokeScripts: phase.smokeScripts,
      detail,
    };
  });
}

export function resolveSeriesAPartnerExpansionComplete(
  phases: readonly SeriesAPartnerExpansionPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteSeriesAPartnerExpansionPhase(
  phases: readonly SeriesAPartnerExpansionPhaseStatus[],
): SeriesAPartnerExpansionPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}

export function formatSeriesAPartnerExpansionPhaseBlockerDetail(
  phase: SeriesAPartnerExpansionPhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
