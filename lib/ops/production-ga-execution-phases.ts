/**
 * Production GA execution phases — security, pricing, launch narrative (Step 7).
 */
export const PRODUCTION_GA_EXECUTION_PHASES_POLICY_ID =
  "era35-production-ga-execution-phases-v1" as const;

export const PRODUCTION_GA_EXECUTION_STEP7_DOC =
  "docs/next-step-7-production-ga-readiness-2026-05-29.md" as const;

export const PRODUCTION_GA_COMMERCIAL_PILOT_RUNBOOK_DOC =
  "docs/commercial-pilot-runbook.md" as const;

export const PRODUCTION_GA_FORBIDDEN_CLAIMS_DOC =
  "docs/sales-forbidden-claims-training-era20.md" as const;

export type ProductionGaPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  routes: readonly string[];
  smokeScripts: readonly string[];
  docPath: string;
  blocksCompletion: boolean;
};

export const PRODUCTION_GA_EXECUTION_PHASES: readonly ProductionGaPhaseDef[] = [
  {
    id: "engineering_gates",
    label: "Engineering gates — P0 + Tier 2 + scale readiness PASS on production",
    keys: ["PRODUCTION_GA_ENGINEERING_GATES_REVIEWED"],
    routes: ["/platform/commercial-pilot-ops", "/dashboard/integration-health"],
    smokeScripts: ["run:production-pilot-ready"],
    docPath: PRODUCTION_GA_EXECUTION_STEP7_DOC,
    blocksCompletion: true,
  },
  {
    id: "ops_runbooks",
    label: "Ops runbooks — GA cutover documented",
    keys: ["PRODUCTION_GA_OPS_RUNBOOK_REVIEWED"],
    routes: ["/platform/commercial-pilot-ops"],
    smokeScripts: [],
    docPath: PRODUCTION_GA_COMMERCIAL_PILOT_RUNBOOK_DOC,
    blocksCompletion: true,
  },
  {
    id: "cron_monitoring",
    label: "Cron + monitoring — production gate PASS",
    keys: ["PRODUCTION_GA_CRON_MONITORING_REVIEWED"],
    routes: ["/dashboard/developer"],
    smokeScripts: ["test:ci:cron-hygiene"],
    docPath: PRODUCTION_GA_EXECUTION_STEP7_DOC,
    blocksCompletion: true,
  },
  {
    id: "rollback_path",
    label: "Rollback path — documented + drill within 90 days",
    keys: ["PRODUCTION_GA_ROLLBACK_PATH_REVIEWED"],
    routes: ["/dashboard/implementation"],
    smokeScripts: ["smoke:pilot-rollback-drill"],
    docPath: PRODUCTION_GA_COMMERCIAL_PILOT_RUNBOOK_DOC,
    blocksCompletion: true,
  },
  {
    id: "security_review",
    label: "Security review — forbidden claims + SOC2 readiness track (not Type II)",
    keys: ["PRODUCTION_GA_SECURITY_REVIEW_REVIEWED", "SCALE_SOC2_READINESS_TRACK_REVIEWED"],
    routes: ["/solutions/ghost-kitchens", "/solutions/meal-prep"],
    smokeScripts: ["smoke:pilot-forbidden-claims-enforcement", "test:security"],
    docPath: PRODUCTION_GA_FORBIDDEN_CLAIMS_DOC,
    blocksCompletion: true,
  },
  {
    id: "pricing_packaging",
    label: "Pricing + packaging — tiers documented, ICP all F&B formats",
    keys: [
      "PRODUCTION_GA_PRICING_PACKAGING_REVIEWED",
      "PRODUCTION_GA_ICP_ALL_FB_FORMATS_FINALIZED",
    ],
    routes: ["/dashboard/launch-wizard", "/dashboard/reports"],
    smokeScripts: [],
    docPath: PRODUCTION_GA_EXECUTION_STEP7_DOC,
    blocksCompletion: true,
  },
  {
    id: "launch_narrative",
    label: "Public launch narrative — investor onepager + forbidden claims PASS",
    keys: ["PRODUCTION_GA_LAUNCH_NARRATIVE_REVIEWED"],
    routes: ["/dashboard/launch-wizard", "/integrations"],
    smokeScripts: ["smoke:investor-narrative-onepager", "smoke:pilot-forbidden-claims-enforcement"],
    docPath: PRODUCTION_GA_FORBIDDEN_CLAIMS_DOC,
    blocksCompletion: true,
  },
] as const;

export const PRODUCTION_GA_EXECUTION_TRACKED_ENV_KEYS = [
  "PRODUCTION_GA_ENGINEERING_GATES_REVIEWED",
  "PRODUCTION_GA_OPS_RUNBOOK_REVIEWED",
  "PRODUCTION_GA_CRON_MONITORING_REVIEWED",
  "PRODUCTION_GA_ROLLBACK_PATH_REVIEWED",
  "PRODUCTION_GA_SECURITY_REVIEW_REVIEWED",
  "PRODUCTION_GA_PRICING_PACKAGING_REVIEWED",
  "PRODUCTION_GA_ICP_ALL_FB_FORMATS_FINALIZED",
  "PRODUCTION_GA_LAUNCH_NARRATIVE_REVIEWED",
  "SCALE_SOC2_READINESS_TRACK_REVIEWED",
] as const;

export type ProductionGaPhaseStatus = {
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

export function buildProductionGaPhaseStatuses(input: {
  p0ProofPassed: boolean;
  tier2ProofPassed: boolean;
  scaleComplete: boolean;
  rollbackDrillPassed: boolean;
  investorOnepagerPassed: boolean;
  forbiddenClaimsPassed: boolean;
  env?: NodeJS.ProcessEnv;
}): ProductionGaPhaseStatus[] {
  const env = input.env ?? process.env;

  return PRODUCTION_GA_EXECUTION_PHASES.map((phase) => {
    let complete = false;
    let detail = "";
    const optional = !phase.blocksCompletion;

    if (phase.id === "engineering_gates") {
      const reviewed = parseEnvBoolean(env.PRODUCTION_GA_ENGINEERING_GATES_REVIEWED) === true;
      complete =
        reviewed && input.p0ProofPassed && input.tier2ProofPassed && input.scaleComplete;
      detail = complete
        ? "P0 + Tier 2 + scale readiness all proof_passed on production — engineering gates signed off"
        : !input.p0ProofPassed
          ? "P0 staging proof not proof_passed — configure ops vault and run ops:run-p0-staging-proof-execution"
          : !input.tier2ProofPassed
            ? "Tier 2 golden path not proof_passed — run ops:run-tier2-staging-proof-execution"
            : !input.scaleComplete
              ? "Scale readiness not complete — finish scale gates first"
              : "CTO + COO review production gates, then PRODUCTION_GA_ENGINEERING_GATES_REVIEWED=1";
    } else if (phase.id === "ops_runbooks") {
      const reviewed = parseEnvBoolean(env.PRODUCTION_GA_OPS_RUNBOOK_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "docs/commercial-pilot-runbook.md updated with GA cutover steps"
        : "COO updates commercial-pilot-runbook with GA cutover, then PRODUCTION_GA_OPS_RUNBOOK_REVIEWED=1";
    } else if (phase.id === "cron_monitoring") {
      const reviewed = parseEnvBoolean(env.PRODUCTION_GA_CRON_MONITORING_REVIEWED) === true;
      complete = reviewed;
      detail = reviewed
        ? "Production cron gate reviewed — test:ci:cron-hygiene PASS"
        : "Run npm run test:ci:cron-hygiene, then PRODUCTION_GA_CRON_MONITORING_REVIEWED=1";
    } else if (phase.id === "rollback_path") {
      const reviewed = parseEnvBoolean(env.PRODUCTION_GA_ROLLBACK_PATH_REVIEWED) === true;
      complete = reviewed && input.rollbackDrillPassed;
      detail = complete
        ? "Rollback path documented and pilot-rollback-drill proof_passed within 90 days"
        : !input.rollbackDrillPassed
          ? "Run npm run smoke:pilot-rollback-drill until rollbackProofStatus: proof_passed"
          : "Document rollback path in runbook, then PRODUCTION_GA_ROLLBACK_PATH_REVIEWED=1";
    } else if (phase.id === "security_review") {
      const securityReviewed =
        parseEnvBoolean(env.PRODUCTION_GA_SECURITY_REVIEW_REVIEWED) === true;
      const soc2Track = parseEnvBoolean(env.SCALE_SOC2_READINESS_TRACK_REVIEWED) === true;
      complete = securityReviewed && soc2Track;
      detail = complete
        ? "Security questionnaire + forbidden claims reviewed — SOC2 readiness track only (not Type II)"
        : !soc2Track
          ? "Review forbidden claims + SOC2 roadmap, then SCALE_SOC2_READINESS_TRACK_REVIEWED=1 — never claim Type II"
          : "Run test:security + smoke:pilot-forbidden-claims-enforcement, then PRODUCTION_GA_SECURITY_REVIEW_REVIEWED=1";
    } else if (phase.id === "pricing_packaging") {
      const pricing = parseEnvBoolean(env.PRODUCTION_GA_PRICING_PACKAGING_REVIEWED) === true;
      const icp = parseEnvBoolean(env.PRODUCTION_GA_ICP_ALL_FB_FORMATS_FINALIZED) === true;
      complete = pricing && icp;
      detail = complete
        ? "Pricing tiers documented — ICP covers all F&B formats (restaurant, bar, café, bakery, catering, ghost kitchen, meal prep, etc.)"
        : !pricing
          ? "Founder + Sales finalize pricing tiers, then PRODUCTION_GA_PRICING_PACKAGING_REVIEWED=1"
          : "Sales finalizes ICP for all F&B formats, then PRODUCTION_GA_ICP_ALL_FB_FORMATS_FINALIZED=1";
    } else if (phase.id === "launch_narrative") {
      const reviewed = parseEnvBoolean(env.PRODUCTION_GA_LAUNCH_NARRATIVE_REVIEWED) === true;
      complete =
        reviewed && input.investorOnepagerPassed && input.forbiddenClaimsPassed;
      detail = complete
        ? "Public launch narrative approved — investor onepager + forbidden claims PASS"
        : !input.investorOnepagerPassed
          ? "Run npm run smoke:investor-narrative-onepager until overall: PASSED"
          : !input.forbiddenClaimsPassed
            ? "Run npm run smoke:pilot-forbidden-claims-enforcement until PASS"
            : "Marketing + Legal approve narrative, then PRODUCTION_GA_LAUNCH_NARRATIVE_REVIEWED=1";
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

export function resolveProductionGaPhasesComplete(
  phases: readonly ProductionGaPhaseStatus[],
): boolean {
  const blocking = phases.filter((phase) => !phase.optional);
  return blocking.length > 0 && blocking.every((phase) => phase.complete);
}

export function resolveNextIncompleteProductionGaPhase(
  phases: readonly ProductionGaPhaseStatus[],
): ProductionGaPhaseStatus | null {
  return (
    phases.find((phase) => !phase.optional && !phase.complete) ??
    phases.find((phase) => !phase.complete) ??
    null
  );
}
