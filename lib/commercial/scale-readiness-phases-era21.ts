/**
 * Scale readiness phases — multi-customer ops + enterprise expansion (Step 6 after Month 2).
 */
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import {
  buildMonth2MarketReadinessPhaseStatuses,
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  resolveMonth2MarketReadinessComplete,
  resolveMonth2MarketReadinessPrerequisites,
  resolveWeek1CompleteForMonth2,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";

export {
  INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
};

export const P0_STAGING_PROOF_ARTIFACT_PATH =
  "artifacts/p0-staging-proof-unblock-summary.json" as const;

export const TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH =
  "artifacts/tier2-staging-golden-path-summary.json" as const;

export const PILOT_ROLLBACK_DRILL_ARTIFACT_PATH =
  "artifacts/pilot-rollback-drill-summary.json" as const;

export const SCALE_READINESS_PHASES_ERA21_POLICY_ID = "era21-scale-readiness-phases-v1" as const;

export const SCALE_READINESS_STEP6_DOC = "docs/next-step-6-scale-readiness-2026-05-28.md" as const;

export const SCALE_READINESS_FORBIDDEN_CLAIMS_DOC =
  "docs/sales-forbidden-claims-training-era20.md" as const;

export const SCALE_READINESS_ROLLBACK_DOC = "docs/pilot-rollback-drill-era17.md" as const;

export const SCALE_READINESS_PLATFORM_OPS_ROUTE = "/platform/commercial-pilot-ops" as const;

export type ScaleReadinessPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  blocksCompletion: boolean;
};

export const SCALE_READINESS_PHASES: readonly ScaleReadinessPhaseDef[] = [
  {
    id: "gate1_per_customer_pilot_ops",
    label: "Gate 1 — Per-customer GO artifacts (no shared GO)",
    keys: ["SCALE_PER_CUSTOMER_GO_ISOLATION"],
    docPath: SCALE_READINESS_STEP6_DOC,
    routes: [SCALE_READINESS_PLATFORM_OPS_ROUTE, "/dashboard/implementation"],
    smokeScripts: ["smoke:pilot-gono-go"],
    blocksCompletion: true,
  },
  {
    id: "gate2_soc2_readiness_track",
    label: "Gate 2 — SOC2 readiness track (no false certification claims)",
    keys: ["SCALE_SOC2_READINESS_TRACK_REVIEWED"],
    docPath: SCALE_READINESS_FORBIDDEN_CLAIMS_DOC,
    routes: ["/dashboard/implementation"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement"],
    blocksCompletion: true,
  },
  {
    id: "gate3_enterprise_sso_production",
    label: "Gate 3 — Enterprise SSO production cutover",
    keys: ["SCALE_SSO_PRODUCTION_STATUS"],
    docPath: "docs/era18-p0-staging-proof-ops-checklist.md",
    routes: ["/dashboard/launch-wizard", "/dashboard/integration-health"],
    smokeScripts: ["smoke:enterprise-sso-idp-staging"],
    blocksCompletion: true,
  },
  {
    id: "gate4_operational_resilience",
    label: "Gate 4 — Rollback + webhook resilience drills",
    keys: ["SCALE_RESILIENCE_DRILLS_ATTESTED"],
    docPath: SCALE_READINESS_ROLLBACK_DOC,
    routes: [SCALE_READINESS_PLATFORM_OPS_ROUTE],
    smokeScripts: [
      "smoke:pilot-rollback-drill",
      "smoke:commerce-webhook-drill",
      "smoke:webhook-replay-p1-expansion",
    ],
    blocksCompletion: true,
  },
  {
    id: "gate5_data_room_artifact_chain",
    label: "Gate 5 — Investor/partner data room artifact chain",
    keys: ["SCALE_DATA_ROOM_INDEX_PUBLISHED"],
    docPath: SCALE_READINESS_STEP6_DOC,
    routes: ["/dashboard/reports", SCALE_READINESS_PLATFORM_OPS_ROUTE],
    smokeScripts: ["smoke:investor-narrative-onepager", "smoke:pilot-metrics-baseline"],
    blocksCompletion: true,
  },
  {
    id: "gate6_second_paid_pilot_optional",
    label: "Gate 6 — Second paid pilot validation (optional)",
    keys: ["SCALE_SECOND_PAID_PILOT_QUEUED"],
    docPath: "docs/next-step-3-after-tier2-pass-2026-05-28.md",
    routes: ["/dashboard/implementation"],
    smokeScripts: [],
    blocksCompletion: false,
  },
] as const;

export const SCALE_READINESS_TRACKED_ENV_KEYS = [
  "SCALE_PER_CUSTOMER_GO_ISOLATION",
  "SCALE_SOC2_READINESS_TRACK_REVIEWED",
  "SCALE_SSO_PRODUCTION_STATUS",
  "SCALE_SSO_PRODUCTION_DEFERRED_REASON",
  "SCALE_RESILIENCE_DRILLS_ATTESTED",
  "SCALE_DATA_ROOM_INDEX_PUBLISHED",
  "SCALE_SECOND_PAID_PILOT_QUEUED",
] as const;

export type ScaleReadinessPhaseStatus = {
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

export type ScaleReadinessPrerequisiteStatus = {
  goDecision: string | null;
  month2Complete: boolean;
  prerequisitesComplete: boolean;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function resolveMonth2CompleteForScale(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const week1Complete = resolveWeek1CompleteForMonth2({
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    env: input.env,
  });
  const prerequisites = resolveMonth2MarketReadinessPrerequisites({
    goDecision,
    week1Complete,
  });
  if (!prerequisites.prerequisitesComplete) return false;

  const phases = buildMonth2MarketReadinessPhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    investorOnepager: input.investorOnepager,
    env: input.env,
  });
  return resolveMonth2MarketReadinessComplete(phases);
}

export function resolveScaleReadinessPrerequisites(input: {
  goDecision: string | null;
  month2Complete: boolean;
}): ScaleReadinessPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    month2Complete: input.month2Complete,
    prerequisitesComplete: input.goDecision === "GO" && input.month2Complete,
  };
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

export function buildScaleReadinessPhaseStatuses(input: {
  prerequisites: ScaleReadinessPrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill: PilotRollbackDrillSummary | null;
  env?: NodeJS.ProcessEnv;
}): ScaleReadinessPhaseStatus[] {
  const env = input.env ?? process.env;
  const go = input.goNoGoSummary;
  const p0 = input.p0Staging;
  const rollback = input.rollbackDrill;

  return SCALE_READINESS_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "gate1_per_customer_pilot_ops") {
      const isolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
      complete = isolation && go?.decision === "GO" && Boolean(go.customerName);
      detail = complete
        ? `Per-customer GO policy attested for ${go?.customerName ?? "customer"}`
        : "Set SCALE_PER_CUSTOMER_GO_ISOLATION=1 after documenting separate GO artifact per customer — never reuse across prospects";
    } else if (phase.id === "gate2_soc2_readiness_track") {
      const reviewed = parseEnvBoolean(env.SCALE_SOC2_READINESS_TRACK_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "SOC2 track reviewed — no SOC2 Type II claims in sales until audit complete"
        : "Review forbidden claims + SOC2 roadmap, then SCALE_SOC2_READINESS_TRACK_REVIEWED=1";
    } else if (phase.id === "gate3_enterprise_sso_production") {
      const ssoStagingPassed = p0?.children.ssoIdpStaging.overall === "PASSED";
      const status = env.SCALE_SSO_PRODUCTION_STATUS?.trim().toLowerCase();
      const deferredReason = env.SCALE_SSO_PRODUCTION_DEFERRED_REASON?.trim();
      const productionPass = status === "pass" && ssoStagingPassed;
      const honestDeferral = status === "deferred_honest" && Boolean(deferredReason) && ssoStagingPassed;
      complete = productionPass || honestDeferral;
      detail = complete
        ? productionPass
          ? "SSO production cutover recorded with staging proof PASS"
          : `SSO production deferred honestly: ${deferredReason}`
        : ssoStagingPassed
          ? "Set SCALE_SSO_PRODUCTION_STATUS=pass or deferred_honest + SCALE_SSO_PRODUCTION_DEFERRED_REASON"
          : "Complete P0 SSO staging smoke first — artifacts/p0-staging-proof-unblock-summary.json";
    } else if (phase.id === "gate4_operational_resilience") {
      const attested = parseEnvBoolean(env.SCALE_RESILIENCE_DRILLS_ATTESTED) === true;
      const rollbackPassed = rollback?.rollbackProofStatus === "proof_passed";
      complete = attested && rollbackPassed;
      detail = complete
        ? `${PILOT_ROLLBACK_DRILL_ARTIFACT_PATH} → proof_passed · resilience attested`
        : !rollbackPassed
          ? "Run npm run smoke:pilot-rollback-drill (+ webhook drills) until proof_passed"
          : "Set SCALE_RESILIENCE_DRILLS_ATTESTED=1 after staging/tabletop drills";
    } else if (phase.id === "gate5_data_room_artifact_chain") {
      const published = parseEnvBoolean(env.SCALE_DATA_ROOM_INDEX_PUBLISHED) === true;
      const chain = dataRoomChainHonest({
        p0,
        tier2: input.tier2Summary,
        metrics: input.metricsBaseline,
        investor: input.investorOnepager,
        caseStudy: input.caseStudyDraft,
        go,
      });
      complete = published && chain.complete;
      detail = complete
        ? "Data room index published — all core artifacts smoke-honest"
        : chain.gaps.length > 0
          ? `Fix artifact chain: ${chain.gaps.join("; ")}`
          : "Publish data room index after artifact review — SCALE_DATA_ROOM_INDEX_PUBLISHED=1";
    } else {
      complete =
        parseEnvBoolean(env.SCALE_SECOND_PAID_PILOT_QUEUED) === true ||
        parseEnvBoolean(env.SCALE_SECOND_PAID_PILOT_SKIPPED) === true;
      detail = complete
        ? "Second paid pilot queued or explicitly skipped"
        : "Optional: queue second prospect or SCALE_SECOND_PAID_PILOT_SKIPPED=1";
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

export function resolveScaleReadinessComplete(
  phases: readonly ScaleReadinessPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteScaleReadinessPhase(
  phases: readonly ScaleReadinessPhaseStatus[],
): ScaleReadinessPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}

export function formatScaleReadinessPhaseBlockerDetail(phase: ScaleReadinessPhaseStatus): string {
  return `${phase.label}: ${phase.detail}`;
}
