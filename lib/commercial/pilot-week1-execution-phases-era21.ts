/**
 * Pilot Week 1 execution phases — TTV through metrics baseline (Step 4 after GO).
 */
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";

export const PILOT_GONOGO_SUMMARY_ARTIFACT_PATH = "artifacts/pilot-gono-go-summary.json" as const;

export const PILOT_METRICS_BASELINE_ARTIFACT_PATH =
  "artifacts/pilot-metrics-baseline-summary.json" as const;

export const PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH =
  "artifacts/pilot-case-study-draft-summary.json" as const;

export const PILOT_WEEK1_EXECUTION_PHASES_ERA21_POLICY_ID =
  "era21-pilot-week1-execution-phases-v1" as const;

export const PILOT_WEEK1_EXECUTION_STEP4_DOC =
  "docs/next-step-4-pilot-week1-execution-2026-05-28.md" as const;

export const PILOT_WEEK1_FORBIDDEN_NARRATIVE_DOC =
  "docs/sales-forbidden-claims-training-era20.md" as const;

export type PilotWeek1ExecutionPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
};

export const PILOT_WEEK1_EXECUTION_PHASES: readonly PilotWeek1ExecutionPhaseDef[] = [
  {
    id: "day1_ttv_onboarding",
    label: "Day 1 — TTV + onboarding (Launch Wizard → first order)",
    keys: ["PILOT_WEEK1_TTV_HOURS", "PILOT_WEEK1_FIRST_ORDER_ID"],
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    routes: ["/dashboard/launch-wizard", "/dashboard/order-hub"],
    smokeScripts: [],
  },
  {
    id: "day2_integration_health",
    label: "Day 2 — Integration Health cadence",
    keys: ["PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED"],
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    routes: ["/dashboard/integration-health"],
    smokeScripts: ["smoke:woo-shopify-live"],
  },
  {
    id: "day3_pos_money_path",
    label: "Day 3 — POS shift open → sale → closeout",
    keys: ["PILOT_WEEK1_POS_CLOSEOUT_STATUS"],
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    routes: ["/dashboard/pos/shifts", "/dashboard/pos"],
    smokeScripts: [],
  },
  {
    id: "day4_reports_review",
    label: "Day 4 — Reports weekly export + copy review",
    keys: ["PILOT_WEEK1_REPORTS_WEEKLY_EXPORT"],
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    routes: ["/dashboard/reports"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement"],
  },
  {
    id: "day5_metrics_narrative",
    label: "Day 5 — Metrics baseline + case study + GO re-run",
    keys: [],
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    routes: ["/dashboard/today", "/dashboard/reports"],
    smokeScripts: [
      "smoke:pilot-metrics-baseline",
      "smoke:pilot-case-study-draft",
      "smoke:pilot-gono-go",
    ],
  },
] as const;

export const PILOT_WEEK1_TRACKED_ENV_KEYS = [
  "PILOT_WEEK1_TTV_HOURS",
  "PILOT_WEEK1_FIRST_ORDER_ID",
  "PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED",
  "PILOT_WEEK1_POS_CLOSEOUT_STATUS",
  "PILOT_WEEK1_REPORTS_WEEKLY_EXPORT",
] as const;

export type PilotWeek1ExecutionPhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  presentKeys: string[];
  missingKeys: string[];
  docPath: string;
  routes: readonly string[];
  smokeScripts: readonly string[];
  detail: string;
};

export type PilotWeek1ExecutionPrerequisiteStatus = {
  goDecision: string | null;
  prerequisitesComplete: boolean;
};

export function resolvePilotWeek1ExecutionPrerequisites(input: {
  goDecision: string | null;
}): PilotWeek1ExecutionPrerequisiteStatus {
  return {
    goDecision: input.goDecision,
    prerequisitesComplete: input.goDecision === "GO",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

function parseTtvHours(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const value = Number.parseFloat(raw.trim());
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function buildPilotWeek1ExecutionPhaseStatuses(input: {
  prerequisites: PilotWeek1ExecutionPrerequisiteStatus;
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft: PilotCaseStudyDraftSummary | null;
  env?: NodeJS.ProcessEnv;
}): PilotWeek1ExecutionPhaseStatus[] {
  const env = input.env ?? process.env;
  const go = input.goNoGoSummary;
  const metrics = input.metricsBaseline;
  const caseStudy = input.caseStudyDraft;

  return PILOT_WEEK1_EXECUTION_PHASES.map((phase) => {
    let complete = false;
    let detail = "";

    if (phase.id === "day1_ttv_onboarding") {
      const ttvHours = parseTtvHours(env.PILOT_WEEK1_TTV_HOURS);
      const orderId = env.PILOT_WEEK1_FIRST_ORDER_ID?.trim();
      complete = ttvHours !== null && Boolean(orderId);
      detail = complete
        ? `TTV ${ttvHours}h · first order ${orderId}`
        : "Record real hours-to-first-order and Order Hub ID after Launch Wizard onboarding — never estimate";
    } else if (phase.id === "day2_integration_health") {
      const reviewed = parseEnvBoolean(env.PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "Owner reviewed Integration Health — channel cards honest (no fake LIVE)"
        : "Review /dashboard/integration-health, then export PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED=1";
    } else if (phase.id === "day3_pos_money_path") {
      const closeout = env.PILOT_WEEK1_POS_CLOSEOUT_STATUS?.trim().toLowerCase();
      complete = closeout === "pass";
      detail =
        closeout === "pass"
          ? "POS shift closeout PASS recorded"
          : "Open shift → sale → close at /dashboard/pos/shifts, then PILOT_WEEK1_POS_CLOSEOUT_STATUS=pass";
    } else if (phase.id === "day4_reports_review") {
      const exported = parseEnvBoolean(env.PILOT_WEEK1_REPORTS_WEEKLY_EXPORT) === true;
      complete = exported;
      detail = exported
        ? "First weekly reports export attested"
        : "Export from /dashboard/reports, confirm forbidden claims still accurate, then PILOT_WEEK1_REPORTS_WEEKLY_EXPORT=1";
    } else {
      const metricsPassed = metrics?.overall === "PASSED";
      const caseStudyReady = caseStudy?.caseStudyProofStatus === "internal_draft_ready";
      const goStillGo = go?.decision === "GO";
      complete = Boolean(metricsPassed && caseStudyReady && goStillGo);
      const gaps: string[] = [];
      if (!metricsPassed) {
        gaps.push(`${PILOT_METRICS_BASELINE_ARTIFACT_PATH} → overall: PASSED`);
      }
      if (!caseStudyReady) {
        gaps.push(`${PILOT_CASE_STUDY_DRAFT_ARTIFACT_PATH} → internal_draft_ready`);
      }
      if (!goStillGo) {
        gaps.push(`${PILOT_GONOGO_SUMMARY_ARTIFACT_PATH} → decision: GO`);
      }
      detail = complete
        ? "Week 1 KPIs captured, case study draft ready, GO re-run still GO"
        : gaps.length > 0
          ? `Run Day 5 smokes — missing: ${gaps.join("; ")}`
          : "Run npm run smoke:pilot-metrics-baseline, smoke:pilot-case-study-draft, smoke:pilot-gono-go";
    }

    const missingKeys = phase.keys.filter((key) => !env[key]?.trim());
    const presentKeys = phase.keys.filter((key) => env[key]?.trim());

    return {
      id: phase.id,
      label: phase.label,
      complete,
      presentKeys: [...presentKeys],
      missingKeys: [...missingKeys],
      docPath: phase.docPath,
      routes: phase.routes,
      smokeScripts: phase.smokeScripts,
      detail,
    };
  });
}

export function resolvePilotWeek1ExecutionComplete(
  phases: readonly PilotWeek1ExecutionPhaseStatus[],
): boolean {
  return phases.length > 0 && phases.every((phase) => phase.complete);
}

export function resolveNextIncompletePilotWeek1ExecutionPhase(
  phases: readonly PilotWeek1ExecutionPhaseStatus[],
): PilotWeek1ExecutionPhaseStatus | null {
  return phases.find((phase) => !phase.complete) ?? null;
}

export function formatPilotWeek1ExecutionPhaseBlockerDetail(
  phase: PilotWeek1ExecutionPhaseStatus,
): string {
  return `${phase.label}: ${phase.detail}`;
}
