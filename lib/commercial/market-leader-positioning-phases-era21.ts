/**
 * Market leader positioning phases — category narrative + moat + analyst kit (Step 8 after Series A).
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
  buildSeriesAPartnerExpansionPhaseStatuses,
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  resolveScaleCompleteForSeriesA,
  resolveSeriesAPartnerExpansionComplete,
  resolveSeriesAPartnerExpansionPrerequisites,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  SERIES_A_PLATFORM_OPS_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";

export {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  SERIES_A_COMPETITOR_LEAPFROG_DOC,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_MEAL_PREP_LANDING_ROUTE,
  SERIES_A_PLATFORM_OPS_ROUTE,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
};

export const PILOT_ROLLBACK_DRILL_ARTIFACT_PATH =
  "artifacts/pilot-rollback-drill-summary.json" as const;

export const MARKET_LEADER_POSITIONING_PHASES_ERA21_POLICY_ID =
  "era21-market-leader-positioning-phases-v1" as const;

export const MARKET_LEADER_POSITIONING_STEP8_DOC =
  "docs/next-step-8-market-leader-positioning-2026-05-28.md" as const;

const PILOT_CASE_STUDY_VALID_APPROVAL_VALUES = ["signed", "anonymized_signed"] as const;

export type MarketLeaderPositioningPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  blocksCompletion: boolean;
};

export const MARKET_LEADER_POSITIONING_PHASES: readonly MarketLeaderPositioningPhaseDef[] = [
  {
    id: "pillar1_category_narrative",
    label: "Pillar 1 — Category narrative (ghost kitchen + meal prep OS)",
    keys: ["MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED"],
    docPath: SERIES_A_COMPETITOR_LEAPFROG_DOC,
    routes: [SERIES_A_GHOST_KITCHEN_LANDING_ROUTE, SERIES_A_MEAL_PREP_LANDING_ROUTE],
    smokeScripts: ["smoke:pilot-case-study-draft"],
    blocksCompletion: true,
  },
  {
    id: "pillar2_competitive_moat_proof",
    label: "Pillar 2 — Competitive moat deck (integration + operator UX + resilience)",
    keys: ["MARKET_LEADER_MOAT_DECK_REVIEWED"],
    docPath: MARKET_LEADER_POSITIONING_STEP8_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE, "/dashboard/integration-health"],
    smokeScripts: [
      "smoke:pilot-rollback-drill",
      "smoke:commerce-webhook-drill",
      "smoke:webhook-replay-p1-expansion",
    ],
    blocksCompletion: true,
  },
  {
    id: "pillar3_analyst_press_kit",
    label: "Pillar 3 — Analyst / press kit (honest maturity, no overclaim)",
    keys: ["MARKET_LEADER_ANALYST_KIT_PUBLISHED"],
    docPath: SERIES_A_FEATURE_MATURITY_DOC,
    routes: ["/dashboard/reports", "/dashboard/implementation"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement", "smoke:investor-narrative-onepager"],
    blocksCompletion: true,
  },
  {
    id: "pillar4_expansion_revenue_motion",
    label: "Pillar 4 — Expansion revenue motion (second location, SKU, partner referrals)",
    keys: ["MARKET_LEADER_EXPANSION_MOTION_REVIEWED"],
    docPath: MARKET_LEADER_POSITIONING_STEP8_DOC,
    routes: ["/dashboard/reports", "/dashboard/today"],
    smokeScripts: ["smoke:pilot-metrics-baseline"],
    blocksCompletion: true,
  },
] as const;

export const MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS = [
  "MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED",
  "MARKET_LEADER_MOAT_DECK_REVIEWED",
  "MARKET_LEADER_ANALYST_KIT_PUBLISHED",
  "MARKET_LEADER_EXPANSION_MOTION_REVIEWED",
] as const;

export function detectMarketLeaderPositioningStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return MARKET_LEADER_POSITIONING_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export type MarketLeaderPositioningPhaseStatus = {
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

export type MarketLeaderPositioningPrerequisiteStatus = {
  goDecision: string | null;
  seriesAComplete: boolean;
  prerequisitesComplete: boolean;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function resolveCaseStudyCustomerApproval(input: {
  caseStudy: PilotCaseStudyDraftSummary | null;
  env: NodeJS.ProcessEnv;
}): boolean {
  const fromArtifact = input.caseStudy?.customerApprovalStatus;
  if (
    fromArtifact &&
    PILOT_CASE_STUDY_VALID_APPROVAL_VALUES.includes(
      fromArtifact as (typeof PILOT_CASE_STUDY_VALID_APPROVAL_VALUES)[number],
    )
  ) {
    return true;
  }
  const fromEnv = input.env.PILOT_CASE_STUDY_CUSTOMER_APPROVAL?.trim().toLowerCase();
  return PILOT_CASE_STUDY_VALID_APPROVAL_VALUES.some((value) => value === fromEnv);
}

export function resolveSeriesACompleteForMarketLeader(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill: PilotRollbackDrillSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const env = input.env ?? process.env;
  const scaleComplete = resolveScaleCompleteForSeriesA({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveSeriesAPartnerExpansionPrerequisites({
    goDecision,
    scaleComplete,
  });
  if (!prerequisites.prerequisitesComplete) return false;

  const phases = buildSeriesAPartnerExpansionPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    competitorMatrix: input.competitorMatrix,
    env,
  });
  return resolveSeriesAPartnerExpansionComplete(phases);
}

export function resolveMarketLeaderPositioningPrerequisites(input: {
  goDecision: string | null;
  seriesAComplete: boolean;
}): MarketLeaderPositioningPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    seriesAComplete: input.seriesAComplete,
    prerequisitesComplete: input.goDecision === "GO" && input.seriesAComplete,
  };
}

export function buildMarketLeaderPositioningPhaseStatuses(input: {
  prerequisites: MarketLeaderPositioningPrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill: PilotRollbackDrillSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): MarketLeaderPositioningPhaseStatus[] {
  const env = input.env ?? process.env;
  const p0 = input.p0Staging;
  const tier2 = input.tier2Summary;
  const rollback = input.rollbackDrill;
  const go = input.goNoGoSummary;
  const competitor = input.competitorMatrix;
  const investor = input.investorOnepager;

  return MARKET_LEADER_POSITIONING_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "pillar1_category_narrative") {
      const reviewed = parseEnvBoolean(env.MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED) === true;
      const customerApproved = resolveCaseStudyCustomerApproval({
        caseStudy: input.caseStudyDraft,
        env,
      });
      const icpProof = go?.decision === "GO" && Boolean(go.customerName);
      complete = reviewed && customerApproved && icpProof;
      detail = complete
        ? `Category narrative reviewed for ${go?.customerName ?? "customer"} — no "market leader" without third-party validation`
        : !icpProof
          ? `${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} → decision: GO with customer name`
          : !customerApproved
            ? "Obtain written case study approval — PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed|anonymized_signed"
            : "Review positioning one-liner vs competitor leapfrog doc — MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED=1";
    } else if (phase.id === "pillar2_competitive_moat_proof") {
      const reviewed = parseEnvBoolean(env.MARKET_LEADER_MOAT_DECK_REVIEWED) === true;
      const p0Passed = p0?.p0ProofStatus === "proof_passed";
      const tier2Passed = tier2?.tier2ProofStatus === "proof_passed";
      const rollbackPassed = rollback?.rollbackProofStatus === "proof_passed";
      const week1Ttv = Boolean(env.PILOT_WEEK1_TTV_HOURS?.trim());
      const posCloseout = env.PILOT_WEEK1_POS_CLOSEOUT_STATUS?.trim().toLowerCase() === "pass";
      const moatEvidence = p0Passed && tier2Passed && rollbackPassed && week1Ttv && posCloseout;
      complete = reviewed && moatEvidence;
      detail = complete
        ? "Moat deck reviewed — P0 + Tier2 + rollback + Week 1 operator UX artifacts cited"
        : !p0Passed
          ? `${P0_STAGING_PROOF_ARTIFACT_PATH} → proof_passed`
          : !tier2Passed
            ? `${TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH} → proof_passed`
            : !rollbackPassed
              ? `${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH} → proof_passed`
              : !week1Ttv || !posCloseout
                ? "Record Week 1 TTV + POS closeout — PILOT_WEEK1_TTV_HOURS + PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass"
                : "Review moat slide deck with artifact citations — MARKET_LEADER_MOAT_DECK_REVIEWED=1";
    } else if (phase.id === "pillar3_analyst_press_kit") {
      const published = parseEnvBoolean(env.MARKET_LEADER_ANALYST_KIT_PUBLISHED) === true;
      const dataRoomBundle = parseEnvBoolean(env.SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED) === true;
      const investorReady =
        investor?.overall === "PASSED" &&
        investor.narrativeProofStatus === "proof_ready_with_metrics";
      const competitorAligned =
        competitor?.overall === "PASSED" &&
        competitor.matrixProofStatus === "evidence_aligned_era17";
      complete = published && dataRoomBundle && investorReady && competitorAligned;
      detail = complete
        ? "Analyst kit published — feature maturity matrix + smoke-honest artifact links only"
        : !dataRoomBundle
          ? "Complete Series A Track A first — SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED=1"
          : !investorReady
            ? `${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH} → proof_ready_with_metrics`
            : !competitorAligned
              ? `${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH} → evidence_aligned_era17`
              : "Publish analyst kit with honest maturity disclaimers — MARKET_LEADER_ANALYST_KIT_PUBLISHED=1";
    } else {
      const reviewed = parseEnvBoolean(env.MARKET_LEADER_EXPANSION_MOTION_REVIEWED) === true;
      const partnerOnepager = parseEnvBoolean(env.SERIES_A_PARTNER_ONEPAGER_REVIEWED) === true;
      const csPlaybook = parseEnvBoolean(env.SERIES_A_CS_PLAYBOOK_REVIEWED) === true;
      const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
      const ghostKitchenGtm = parseEnvBoolean(env.MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED) === true;
      const mealPrepGtm = parseEnvBoolean(env.MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED) === true;
      const metricsPassed = input.metricsBaseline?.overall === "PASSED";
      complete =
        reviewed &&
        partnerOnepager &&
        csPlaybook &&
        perCustomerIsolation &&
        ghostKitchenGtm &&
        mealPrepGtm &&
        metricsPassed;
      detail = complete
        ? "Expansion revenue motion reviewed — second location/SKU/partner referrals tied to pilot #1 metrics"
        : !partnerOnepager
          ? "Complete Series A Track B — SERIES_A_PARTNER_ONEPAGER_REVIEWED=1"
          : !csPlaybook
            ? "Complete Series A Track D — SERIES_A_CS_PLAYBOOK_REVIEWED=1"
            : !perCustomerIsolation
              ? "Extend Scale Gate 1 — SCALE_PER_CUSTOMER_GO_ISOLATION=1"
              : !ghostKitchenGtm || !mealPrepGtm
                ? "Review GTM landing pages — MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED=1 + MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED=1"
                : !metricsPassed
                  ? `${PILOT_METRICS_BASELINE_ARTIFACT_PATH} → overall: PASSED`
                  : "Review expansion playbook — MARKET_LEADER_EXPANSION_MOTION_REVIEWED=1";
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

export function resolveMarketLeaderPositioningComplete(
  phases: readonly MarketLeaderPositioningPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteMarketLeaderPositioningPhase(
  phases: readonly MarketLeaderPositioningPhaseStatus[],
): MarketLeaderPositioningPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}

export function formatMarketLeaderPositioningPhaseBlockerDetail(
  phase: MarketLeaderPositioningPhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
