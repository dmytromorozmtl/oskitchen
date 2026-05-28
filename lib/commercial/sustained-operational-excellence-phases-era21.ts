/**
 * Sustained operational excellence cadences — recurring ops after Market leader (Step 9).
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
  buildMarketLeaderPositioningPhaseStatuses,
  MARKET_LEADER_POSITIONING_STEP8_DOC,
  resolveMarketLeaderPositioningComplete,
  resolveMarketLeaderPositioningPrerequisites,
  resolveSeriesACompleteForMarketLeader,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";

export {
  COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH,
  MARKET_LEADER_POSITIONING_STEP8_DOC,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
};

export const SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES_ERA21_POLICY_ID =
  "era21-sustained-operational-excellence-phases-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC =
  "docs/next-step-9-sustained-operational-excellence-2026-05-28.md" as const;

export const SUSTAINED_OPS_ORDER_HUB_ROUTE = "/dashboard/order-hub" as const;

export const SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE = "/dashboard/production-calendar" as const;

export type SustainedOperationalExcellencePhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  blocksCompletion: boolean;
};

export const SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES: readonly SustainedOperationalExcellencePhaseDef[] =
  [
    {
      id: "cadence_a_daily_operational",
      label: "Cadence A — Daily operational excellence (Today + Order Hub + calendar)",
      keys: ["SUSTAINED_OPS_DAILY_CADENCE_ATTESTED"],
      docPath: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
      routes: [
        "/dashboard/today",
        SUSTAINED_OPS_ORDER_HUB_ROUTE,
        SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
      ],
      smokeScripts: [],
      blocksCompletion: true,
    },
    {
      id: "cadence_b_weekly_integration",
      label: "Cadence B — Weekly integration health + webhook review",
      keys: ["SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED"],
      docPath: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
      routes: ["/dashboard/integration-health", SERIES_A_PLATFORM_OPS_ROUTE],
      smokeScripts: ["smoke:woo-shopify-live", "smoke:commerce-webhook-drill"],
      blocksCompletion: true,
    },
    {
      id: "cadence_c_monthly_metrics",
      label: "Cadence C — Monthly pilot metrics rolling baseline refresh",
      keys: ["SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED"],
      docPath: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
      routes: ["/dashboard/reports", SERIES_A_PLATFORM_OPS_ROUTE],
      smokeScripts: ["smoke:pilot-metrics-baseline"],
      blocksCompletion: true,
    },
    {
      id: "cadence_d_quarterly_governance",
      label: "Cadence D — Quarterly forbidden-claims + maturity matrix audit",
      keys: ["SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED"],
      docPath: SERIES_A_FEATURE_MATURITY_DOC,
      routes: ["/dashboard/implementation", "/dashboard/reports"],
      smokeScripts: [
        "smoke:pilot-forbidden-claims-enforcement",
        "smoke:competitor-feature-gap-matrix",
      ],
      blocksCompletion: true,
    },
  ] as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_TRACKED_ENV_KEYS = [
  "SUSTAINED_OPS_DAILY_CADENCE_ATTESTED",
  "SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED",
  "SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED",
  "SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED",
] as const;

export type SustainedOperationalExcellencePhaseStatus = {
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

export type SustainedOperationalExcellencePrerequisiteStatus = {
  goDecision: string | null;
  marketLeaderComplete: boolean;
  prerequisitesComplete: boolean;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function resolveMarketLeaderCompleteForSustainedOps(input: {
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
  const seriesAComplete = resolveSeriesACompleteForMarketLeader({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const prerequisites = resolveMarketLeaderPositioningPrerequisites({
    goDecision,
    seriesAComplete,
  });
  if (!prerequisites.prerequisitesComplete) return false;

  const phases = buildMarketLeaderPositioningPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    rollbackDrill: input.rollbackDrill,
    competitorMatrix: input.competitorMatrix,
    env,
  });
  return resolveMarketLeaderPositioningComplete(phases);
}

export function resolveSustainedOperationalExcellencePrerequisites(input: {
  goDecision: string | null;
  marketLeaderComplete: boolean;
}): SustainedOperationalExcellencePrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    marketLeaderComplete: input.marketLeaderComplete,
    prerequisitesComplete: input.goDecision === "GO" && input.marketLeaderComplete,
  };
}

export function buildSustainedOperationalExcellencePhaseStatuses(input: {
  prerequisites: SustainedOperationalExcellencePrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): SustainedOperationalExcellencePhaseStatus[] {
  const env = input.env ?? process.env;
  const go = input.goNoGoSummary;
  const p0 = input.p0Staging;
  const tier2 = input.tier2Summary;
  const metrics = input.metricsBaseline;
  const competitor = input.competitorMatrix;

  return SUSTAINED_OPERATIONAL_EXCELLENCE_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "cadence_a_daily_operational") {
      const attested = parseEnvBoolean(env.SUSTAINED_OPS_DAILY_CADENCE_ATTESTED) === true;
      const goValid = go?.decision === "GO" && Boolean(go.customerName);
      const isolationMaintained = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
      complete = attested && goValid && isolationMaintained;
      detail = complete
        ? `Daily ops cadence attested — shift handoffs via Order Hub for ${go?.customerName ?? "customer"}`
        : !goValid
          ? `${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} → decision: GO must remain valid`
          : !isolationMaintained
            ? "Maintain Scale Gate 1 — SCALE_PER_CUSTOMER_GO_ISOLATION=1 per active customer"
            : "Attest daily Owner Briefing + Order Hub + production calendar review — SUSTAINED_OPS_DAILY_CADENCE_ATTESTED=1";
    } else if (phase.id === "cadence_b_weekly_integration") {
      const reviewed = parseEnvBoolean(env.SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED) === true;
      const channelLivePassed = p0?.children.channelLive.overall === "PASSED";
      const tier2Passed = tier2?.tier2ProofStatus === "proof_passed";
      const integrationHonest = channelLivePassed || tier2Passed;
      complete = reviewed && integrationHonest;
      detail = complete
        ? "Weekly integration health review recorded — re-run smokes after credential rotation"
        : !integrationHonest
          ? "Run npm run smoke:woo-shopify-live + smoke:commerce-webhook-drill until artifacts honest"
          : "Schedule weekly Integration Health review — SUSTAINED_OPS_WEEKLY_INTEGRATION_REVIEWED=1";
    } else if (phase.id === "cadence_c_monthly_metrics") {
      const refreshed = parseEnvBoolean(env.SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED) === true;
      const metricsPassed = metrics?.overall === "PASSED";
      const isolationMaintained = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
      complete = refreshed && metricsPassed && isolationMaintained;
      detail = complete
        ? "Monthly metrics baseline refreshed — separate snapshot per customer (Gate 1 isolation)"
        : !metricsPassed
          ? `Run npm run smoke:pilot-metrics-baseline — ${PILOT_METRICS_BASELINE_ARTIFACT_PATH} → PASSED`
          : !isolationMaintained
            ? "Per-customer metrics require SCALE_PER_CUSTOMER_GO_ISOLATION=1"
            : "Refresh rolling baseline per active customer — SUSTAINED_OPS_MONTHLY_METRICS_REFRESHED=1";
    } else {
      const audited = parseEnvBoolean(env.SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED) === true;
      const competitorAligned =
        competitor?.overall === "PASSED" &&
        competitor.matrixProofStatus === "evidence_aligned_era17";
      const claimsReviewed =
        parseEnvBoolean(env.SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED) === true ||
        parseEnvBoolean(env.MARKETING_CLAIMS_STRICT) === true;
      complete = audited && competitorAligned && claimsReviewed;
      detail = complete
        ? "Quarterly governance audit complete — feature maturity + forbidden claims reviewed"
        : !competitorAligned
          ? `Run npm run smoke:competitor-feature-gap-matrix — ${COMPETITOR_FEATURE_GAP_MATRIX_ARTIFACT_PATH}`
          : !claimsReviewed
            ? "Review forbidden claims per locale — SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED=1"
            : "Schedule quarterly audit — SUSTAINED_OPS_QUARTERLY_GOVERNANCE_AUDITED=1";
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

export function resolveSustainedOperationalExcellenceComplete(
  phases: readonly SustainedOperationalExcellencePhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteSustainedOperationalExcellencePhase(
  phases: readonly SustainedOperationalExcellencePhaseStatus[],
): SustainedOperationalExcellencePhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}

export function formatSustainedOperationalExcellencePhaseBlockerDetail(
  phase: SustainedOperationalExcellencePhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
