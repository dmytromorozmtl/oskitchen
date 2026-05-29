/**
 * Pilot scale expansion execution phases — Week 2–4 + expansion LOI (Step 6).
 */
export const PILOT_SCALE_EXPANSION_PHASES_POLICY_ID =
  "era34-pilot-scale-expansion-phases-v1" as const;

export const PILOT_SCALE_EXPANSION_STEP6_DOC =
  "docs/next-step-6-pilot-scale-expansion-2026-05-29.md" as const;

export type PilotScaleExpansionPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  routes: readonly string[];
  smokeScripts: readonly string[];
  docPath: string;
  blocksCompletion: boolean;
};

export const PILOT_SCALE_EXPANSION_PHASES: readonly PilotScaleExpansionPhaseDef[] = [
  {
    id: "week2_daily_ops",
    label: "Week 2 — Daily ops cadence (Owner Briefing + Integration Health)",
    keys: ["PILOT_SCALE_WEEK2_OPS_REVIEWED"],
    routes: ["/dashboard/today", "/dashboard/integration-health"],
    smokeScripts: [],
    docPath: PILOT_SCALE_EXPANSION_STEP6_DOC,
    blocksCompletion: true,
  },
  {
    id: "week3_metrics_trend",
    label: "Week 3 — Reports + metrics trend vs baseline",
    keys: ["PILOT_SCALE_WEEK3_METRICS_REVIEWED"],
    routes: ["/dashboard/reports", "/dashboard/today"],
    smokeScripts: ["smoke:pilot-metrics-baseline"],
    docPath: PILOT_SCALE_EXPANSION_STEP6_DOC,
    blocksCompletion: true,
  },
  {
    id: "week4_expansion_readiness",
    label: "Week 4 — Expansion readiness (second location or format)",
    keys: ["PILOT_SCALE_WEEK4_EXPANSION_READINESS"],
    routes: ["/dashboard/implementation", "/platform/commercial-pilot-ops"],
    smokeScripts: [],
    docPath: PILOT_SCALE_EXPANSION_STEP6_DOC,
    blocksCompletion: true,
  },
  {
    id: "multi_location_onboarding",
    label: "Multi-location onboarding (if locationCount > 1)",
    keys: ["PILOT_SCALE_MULTI_LOCATION_STATUS"],
    routes: ["/dashboard/integration-health", "/dashboard/kitchen"],
    smokeScripts: ["smoke:woo-shopify-live"],
    docPath: PILOT_SCALE_EXPANSION_STEP6_DOC,
    blocksCompletion: false,
  },
  {
    id: "expansion_loi",
    label: "Expansion LOI + scope sign-off",
    keys: ["PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE", "PILOT_SCALE_EXPANSION_SCOPE"],
    routes: ["/dashboard/launch-wizard"],
    smokeScripts: [],
    docPath: PILOT_SCALE_EXPANSION_STEP6_DOC,
    blocksCompletion: true,
  },
  {
    id: "maturity_matrix_review",
    label: "Feature maturity matrix review (pilot evidence)",
    keys: ["PILOT_SCALE_MATURITY_MATRIX_REVIEWED"],
    routes: ["/platform/commercial-pilot-ops"],
    smokeScripts: [],
    docPath: "docs/feature-maturity-matrix.md",
    blocksCompletion: true,
  },
] as const;

export const PILOT_SCALE_EXPANSION_TRACKED_ENV_KEYS = [
  "PILOT_SCALE_WEEK2_OPS_REVIEWED",
  "PILOT_SCALE_WEEK3_METRICS_REVIEWED",
  "PILOT_SCALE_WEEK4_EXPANSION_READINESS",
  "PILOT_SCALE_MULTI_LOCATION_STATUS",
  "PILOT_SCALE_MULTI_LOCATION_DEFER_REASON",
  "PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE",
  "PILOT_SCALE_EXPANSION_SCOPE",
  "PILOT_SCALE_MATURITY_MATRIX_REVIEWED",
] as const;

export type PilotScaleExpansionPhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  optional: boolean;
  presentKeys: string[];
  missingKeys: string[];
  routes: readonly string[];
  smokeScripts: readonly string[];
  docPath: string;
  detail: string;
};

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function buildPilotScaleExpansionPhaseStatuses(input: {
  metricsBaselinePassed: boolean;
  env?: NodeJS.ProcessEnv;
}): PilotScaleExpansionPhaseStatus[] {
  const env = input.env ?? process.env;

  return PILOT_SCALE_EXPANSION_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "week2_daily_ops") {
      const reviewed = parseEnvBoolean(env.PILOT_SCALE_WEEK2_OPS_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "Week 2 daily ops cadence reviewed on Owner Briefing + Integration Health"
        : "Review /dashboard/today + /dashboard/integration-health, then PILOT_SCALE_WEEK2_OPS_REVIEWED=1";
    } else if (phase.id === "week3_metrics_trend") {
      const reviewed = parseEnvBoolean(env.PILOT_SCALE_WEEK3_METRICS_REVIEWED) === true;
      complete = reviewed && input.metricsBaselinePassed;
      detail = complete
        ? "Week 3 metrics trend reviewed vs pilot-metrics-baseline artifact"
        : !input.metricsBaselinePassed
          ? "Run npm run smoke:pilot-metrics-baseline until overall: PASSED"
          : "Export weekly reports, compare to baseline, then PILOT_SCALE_WEEK3_METRICS_REVIEWED=1";
    } else if (phase.id === "week4_expansion_readiness") {
      const ready = parseEnvBoolean(env.PILOT_SCALE_WEEK4_EXPANSION_READINESS) === true;
      complete = ready;
      detail = ready
        ? "Week 4 expansion readiness assessed — all F&B formats (restaurant, bar, café, bakery, catering, etc.)"
        : "Sales + Founder review expansion path, then PILOT_SCALE_WEEK4_EXPANSION_READINESS=1";
    } else if (phase.id === "multi_location_onboarding") {
      const status = env.PILOT_SCALE_MULTI_LOCATION_STATUS?.trim().toLowerCase();
      const deferReason = env.PILOT_SCALE_MULTI_LOCATION_DEFER_REASON?.trim();
      complete =
        status === "pass" ||
        status === "skipped_single_location" ||
        (status === "deferred_honest" && Boolean(deferReason));
      detail = complete
        ? status === "pass"
          ? "Second location onboarded on production"
          : status === "skipped_single_location"
            ? "Single-location operator — honestly skipped"
            : `Multi-location deferred: ${deferReason}`
        : "Set PILOT_SCALE_MULTI_LOCATION_STATUS=pass|skipped_single_location|deferred_honest";
    } else if (phase.id === "expansion_loi") {
      const date = env.PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE?.trim();
      const scope = env.PILOT_SCALE_EXPANSION_SCOPE?.trim();
      complete = Boolean(date && scope);
      detail = complete
        ? `Expansion LOI signed ${date} — scope: ${scope}`
        : "Sign expansion LOI, then set PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE + PILOT_SCALE_EXPANSION_SCOPE — never fake";
    } else {
      const reviewed = parseEnvBoolean(env.PILOT_SCALE_MATURITY_MATRIX_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "docs/feature-maturity-matrix.md reviewed against live pilot evidence"
        : "PM reviews maturity scores with operator evidence, then PILOT_SCALE_MATURITY_MATRIX_REVIEWED=1";
    }

    return {
      id: phase.id,
      label: phase.label,
      complete,
      optional,
      presentKeys: phase.keys.filter((key) => env[key]?.trim()),
      missingKeys: phase.keys.filter((key) => !env[key]?.trim()),
      routes: phase.routes,
      smokeScripts: phase.smokeScripts,
      docPath: phase.docPath,
      detail,
    };
  });
}

export function resolvePilotScaleExpansionWeekPhasesComplete(
  phases: readonly PilotScaleExpansionPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompletePilotScaleExpansionPhase(
  phases: readonly PilotScaleExpansionPhaseStatus[],
): PilotScaleExpansionPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}
