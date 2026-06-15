/**
 * Month 2 market readiness phases — investor + GTM + publish gate (Step 5 after Week 1).
 */
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildPilotWeek1ExecutionPhaseStatuses,
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
  resolvePilotWeek1ExecutionComplete,
  resolvePilotWeek1ExecutionPrerequisites,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";

export {
  PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  PILOT_METRICS_BASELINE_ARTIFACT_PATH,
};

/** Inline to avoid circular import via pilot-case-study-draft-era17-policy. */
const PILOT_CASE_STUDY_VALID_APPROVAL_VALUES = ["signed", "anonymized_signed"] as const;

export const INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH =
  "artifacts/investor-narrative-onepager-summary.json" as const;

export const MONTH2_MARKET_READINESS_PHASES_ERA21_POLICY_ID =
  "era21-month2-market-readiness-phases-v1" as const;

export const MONTH2_MARKET_READINESS_STEP5_DOC =
  "docs/next-step-5-month2-market-readiness-2026-05-28.md" as const;

export const MONTH2_INVESTOR_ONEPAGER_DOC = "docs/investor-narrative-onepager-era17.md" as const;

export const MONTH2_GTM_FORBIDDEN_CLAIMS_DOC = "docs/sales-forbidden-claims-training-era20.md" as const;

export const MONTH2_CASE_STUDY_DRAFT_DOC = "docs/pilot-case-study-draft-era17.md" as const;

export const MONTH2_GHOST_KITCHEN_LANDING_ROUTE = "/solutions/ghost-kitchens" as const;

export const MONTH2_MEAL_PREP_LANDING_ROUTE = "/solutions/meal-prep" as const;

export type Month2MarketReadinessPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  blocksCompletion: boolean;
};

export const MONTH2_MARKET_READINESS_PHASES: readonly Month2MarketReadinessPhaseDef[] = [
  {
    id: "workstream_a_investor_onepager",
    label: "Workstream A — Investor one-pager v3 (real KPIs)",
    keys: ["MONTH2_INVESTOR_FOUNDER_SIGNOFF"],
    docPath: MONTH2_INVESTOR_ONEPAGER_DOC,
    routes: ["/dashboard/reports"],
    smokeScripts: ["smoke:investor-narrative-onepager"],
    blocksCompletion: true,
  },
  {
    id: "workstream_b_gtm_icp_landings",
    label: "Workstream B — ICP landing pages (ghost kitchen + meal prep)",
    keys: [
      "MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED",
      "MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED",
    ],
    docPath: MONTH2_MARKET_READINESS_STEP5_DOC,
    routes: [MONTH2_GHOST_KITCHEN_LANDING_ROUTE, MONTH2_MEAL_PREP_LANDING_ROUTE],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement"],
    blocksCompletion: true,
  },
  {
    id: "workstream_c_api_rate_limits",
    label: "Workstream C — Public API rate limits (P2, optional)",
    keys: ["MONTH2_API_RATE_LIMITS_DOC_REVIEWED"],
    docPath: MONTH2_MARKET_READINESS_STEP5_DOC,
    routes: ["/dashboard/integration-health"],
    smokeScripts: [],
    blocksCompletion: false,
  },
  {
    id: "workstream_d_case_study_publish",
    label: "Workstream D — Case study publish gate (customer approval)",
    keys: ["PILOT_CASE_STUDY_CUSTOMER_APPROVAL"],
    docPath: MONTH2_CASE_STUDY_DRAFT_DOC,
    routes: ["/customers"],
    smokeScripts: ["smoke:pilot-case-study-draft"],
    blocksCompletion: true,
  },
  {
    id: "workstream_e_second_pilot_pipeline",
    label: "Workstream E — Second pilot pipeline (optional)",
    keys: ["MONTH2_SECOND_PROSPECT_QUEUED"],
    docPath: "docs/next-step-3-after-tier2-pass-2026-05-28.md",
    routes: ["/dashboard/implementation"],
    smokeScripts: [],
    blocksCompletion: false,
  },
] as const;

export const MONTH2_MARKET_READINESS_TRACKED_ENV_KEYS = [
  "MONTH2_INVESTOR_FOUNDER_SIGNOFF",
  "MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED",
  "MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED",
  "MONTH2_API_RATE_LIMITS_DOC_REVIEWED",
  "PILOT_CASE_STUDY_CUSTOMER_APPROVAL",
  "MONTH2_SECOND_PROSPECT_QUEUED",
] as const;

export type Month2MarketReadinessPhaseStatus = {
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

export type Month2MarketReadinessPrerequisiteStatus = {
  goDecision: string | null;
  week1Complete: boolean;
  prerequisitesComplete: boolean;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function resolveCaseStudyApproval(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim().toLowerCase();
  return PILOT_CASE_STUDY_VALID_APPROVAL_VALUES.includes(
    value as (typeof PILOT_CASE_STUDY_VALID_APPROVAL_VALUES)[number],
  )
    ? value
    : null;
}

export function resolveMonth2MarketReadinessPrerequisites(input: {
  goDecision: string | null;
  week1Complete: boolean;
}): Month2MarketReadinessPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    week1Complete: input.week1Complete,
    prerequisitesComplete: input.goDecision === "GO" && input.week1Complete,
  };
}

export function resolveWeek1CompleteForMonth2(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const week1Prerequisites = resolvePilotWeek1ExecutionPrerequisites({ goDecision });
  if (!week1Prerequisites.prerequisitesComplete) return false;

  const week1Phases = buildPilotWeek1ExecutionPhaseStatuses({
    prerequisites: week1Prerequisites,
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft,
    env: input.env,
  });
  return resolvePilotWeek1ExecutionComplete(week1Phases);
}

export function buildMonth2MarketReadinessPhaseStatuses(input: {
  prerequisites: Month2MarketReadinessPrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  investorOnepager: InvestorNarrativeOnepagerSummary | null;
  env?: NodeJS.ProcessEnv;
}): Month2MarketReadinessPhaseStatus[] {
  const env = input.env ?? process.env;
  const go = input.goNoGoSummary;
  const metrics = input.metricsBaseline;
  const caseStudy = input.caseStudyDraft;
  const investor = input.investorOnepager;

  return MONTH2_MARKET_READINESS_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "workstream_a_investor_onepager") {
      const founderSignoff = parseEnvBoolean(env.MONTH2_INVESTOR_FOUNDER_SIGNOFF) === true;
      const investorPassed =
        investor?.overall === "PASSED" &&
        investor.narrativeProofStatus === "proof_ready_with_metrics";
      const metricsPassed = metrics?.overall === "PASSED";
      complete = Boolean(founderSignoff && investorPassed && metricsPassed && go?.decision === "GO");
      detail = complete
        ? `${INVESTOR_NARRATIVE_ONEPAGER_ARTIFACT_PATH} → proof_ready_with_metrics · founder sign-off recorded`
        : !metricsPassed
          ? `Capture real KPIs in ${PILOT_METRICS_BASELINE_ARTIFACT_PATH} first`
          : !investorPassed
            ? "Run npm run smoke:investor-narrative-onepager after metrics PASSED"
            : "Set MONTH2_INVESTOR_FOUNDER_SIGNOFF=1 after legal/founder review — no forward-looking guarantees";
    } else if (phase.id === "workstream_b_gtm_icp_landings") {
      const ghost = parseEnvBoolean(env.MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED) === true;
      const mealPrep = parseEnvBoolean(env.MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED) === true;
      complete = ghost && mealPrep;
      detail = complete
        ? `ICP landings reviewed: ${MONTH2_GHOST_KITCHEN_LANDING_ROUTE} + ${MONTH2_MEAL_PREP_LANDING_ROUTE}`
        : `Review solution pages with forbidden-claims checklist, then set MONTH2_GTM_*_LANDING_REVIEWED=1`;
    } else if (phase.id === "workstream_c_api_rate_limits") {
      complete = parseEnvBoolean(env.MONTH2_API_RATE_LIMITS_DOC_REVIEWED) === true;
      detail = complete
        ? "API rate limits doc reviewed (P2 — parallel track)"
        : "Optional: review Integration Health API keys card + planned rate limit policy";
    } else if (phase.id === "workstream_d_case_study_publish") {
      const approval = resolveCaseStudyApproval(env.PILOT_CASE_STUDY_CUSTOMER_APPROVAL);
      const publishReady = caseStudy?.publishProofStatus === "proof_ready_for_publish";
      const internalReady = caseStudy?.caseStudyProofStatus === "internal_draft_ready";
      complete = Boolean(approval && publishReady && internalReady);
      detail = complete
        ? `Case study publish gate open — ${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH}`
        : !internalReady
          ? "Week 1 case study draft must reach internal_draft_ready first"
          : !approval
            ? "Set PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed|anonymized_signed after written permission"
            : "Run npm run smoke:pilot-case-study-draft — publishProofStatus must be proof_ready_for_publish";
    } else {
      complete =
        parseEnvBoolean(env.MONTH2_SECOND_PROSPECT_QUEUED) === true ||
        parseEnvBoolean(env.MONTH2_SECOND_PROSPECT_SKIPPED) === true;
      detail = complete
        ? "Second prospect queued or explicitly skipped for Month 2"
        : "Optional: queue ICP #2 in Implementation hub or set MONTH2_SECOND_PROSPECT_SKIPPED=1";
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

export function resolveMonth2MarketReadinessComplete(
  phases: readonly Month2MarketReadinessPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteMonth2MarketReadinessPhase(
  phases: readonly Month2MarketReadinessPhaseStatus[],
): Month2MarketReadinessPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}

export function formatMonth2MarketReadinessPhaseBlockerDetail(
  phase: Month2MarketReadinessPhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
