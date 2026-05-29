/**
 * Engineering path terminus — master commercial pilot path catalog (Step 13, era24).
 * Orchestration only: no new gates, env keys, or briefing priorities.
 */
import {
  COMMERCIAL_PILOT_PATH_STEP_CATALOG,
  type CommercialPilotPathStepDef,
  type CommercialPilotPathStepKind,
} from "@/lib/commercial/commercial-pilot-path-step-catalog-era24";

export type { CommercialPilotPathStepDef, CommercialPilotPathStepKind };
export { COMMERCIAL_PILOT_PATH_STEP_CATALOG };

export const ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID =
  "era24-engineering-path-terminus-v1" as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_BACKLOG_ID = "KOS-E24-013" as const;

export const ENGINEERING_PATH_TERMINUS_STEP13_DOC =
  "docs/next-step-13-engineering-path-terminus-2026-05-28.md" as const;

export const COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH =
  "artifacts/commercial-pilot-path-status-report.md" as const;

export const ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR = "#engineering-path-terminus" as const;

export const ENGINEERING_PATH_TERMINUS_TRACKED_ENV_KEYS = [
  "ENGINEERING_PATH_TERMINUS_MASTER_PATH_ATTESTED",
  "ENGINEERING_PATH_TERMINUS_STATUS_REPORT_REVIEWED",
] as const;

export function detectEngineeringPathTerminusStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ENGINEERING_PATH_TERMINUS_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export type CommercialPilotPathStepStatus = CommercialPilotPathStepDef & {
  complete: boolean;
  detail: string;
};

export type CommercialPilotPathSummary = {
  totalSteps: number;
  completedSteps: number;
  gateStepsComplete: boolean;
  pathComplete: boolean;
  engineeringTerminusActive: boolean;
  steadyStateActive: boolean;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
  terminalClosureActive: boolean;
  linearPathPermanentlyClosed: boolean;
  goDecision: string | null;
  firstBlockedStep: CommercialPilotPathStepStatus | null;
  firstBlockedGateStep: CommercialPilotPathStepStatus | null;
};

export type CommercialPilotPathEvaluationInput = {
  p0Vault: { allPresent: boolean; present: string[]; missing: string[] };
  tier2: { tier2GatePassed: boolean; p0GatePassed: boolean; missing: string[] };
  commercialGo: {
    phases: Array<{ complete: boolean }>;
    decision: string | null;
    missing: string[];
  };
  pilotWeek1: { week1Complete: boolean; goDecision: string | null; missing: string[] };
  month2: { month2Complete: boolean; missing: string[] };
  scale: { scaleComplete: boolean; missing: string[] };
  seriesA: { seriesAComplete: boolean; missing: string[] };
  marketLeader: { marketLeaderComplete: boolean; missing: string[] };
  sustainedOps: { sustainedOpsComplete: boolean; missing: string[] };
  improvementLoop: { pureOperationalMode: boolean; goDecision: string | null };
  productEvolution: { productEvolutionReady: boolean };
  maintenanceMode: {
    maintenanceModeActive: boolean;
    commercialPilotPathComplete: boolean;
    goDecision: string | null;
  };
  steadyState: {
    steadyStateActive: boolean;
    engineeringTerminusActive: boolean;
    overdueTracks: number;
  };
  absoluteEnd: {
    absoluteEndActive: boolean;
    pathEngineeringClosed: boolean;
    completedSteps: number;
    totalSteps: number;
    goDecision: string | null;
  };
  terminalClosure: {
    terminalClosureActive: boolean;
    linearPathPermanentlyClosed: boolean;
    docChainSteps: number;
  };
};

function envDetail(missing: string[]): string {
  if (missing.length === 0) return "All tracked env vars present";
  return `${missing.length} env var(s) missing`;
}

export function buildCommercialPilotPathStepStatuses(
  input: CommercialPilotPathEvaluationInput,
): CommercialPilotPathStepStatus[] {
  const statuses: CommercialPilotPathStepStatus[] = COMMERCIAL_PILOT_PATH_STEP_CATALOG.map((def) => {
    switch (def.id) {
      case "p0_ops_vault":
        return {
          ...def,
          complete: input.p0Vault.allPresent,
          detail: input.p0Vault.allPresent
            ? `${input.p0Vault.present.length} env vars present`
            : envDetail(input.p0Vault.missing),
        };
      case "tier2_golden_path":
        return {
          ...def,
          complete: input.tier2.tier2GatePassed && input.tier2.p0GatePassed,
          detail: input.tier2.tier2GatePassed
            ? "tier2ProofStatus proof_passed"
            : `P0 ${input.tier2.p0GatePassed ? "PASS" : "blocked"} · Tier2 env ${envDetail(input.tier2.missing)}`,
        };
      case "commercial_go_closure":
        return {
          ...def,
          complete: input.commercialGo.phases.every((phase) => phase.complete),
          detail: input.commercialGo.decision
            ? `GO/NO-GO decision ${input.commercialGo.decision}`
            : envDetail(input.commercialGo.missing),
        };
      case "pilot_week1_execution":
        return {
          ...def,
          complete: input.pilotWeek1.week1Complete,
          detail: input.pilotWeek1.week1Complete
            ? "Week 1 phases complete"
            : `goDecision ${input.pilotWeek1.goDecision ?? "missing"} · ${envDetail(input.pilotWeek1.missing)}`,
        };
      case "month2_market_readiness":
        return {
          ...def,
          complete: input.month2.month2Complete,
          detail: input.month2.month2Complete
            ? "Month 2 phases complete"
            : envDetail(input.month2.missing),
        };
      case "scale_readiness":
        return {
          ...def,
          complete: input.scale.scaleComplete,
          detail: input.scale.scaleComplete ? "Scale phases complete" : envDetail(input.scale.missing),
        };
      case "series_a_partner_expansion":
        return {
          ...def,
          complete: input.seriesA.seriesAComplete,
          detail: input.seriesA.seriesAComplete
            ? "Series A phases complete"
            : envDetail(input.seriesA.missing),
        };
      case "market_leader_positioning":
        return {
          ...def,
          complete: input.marketLeader.marketLeaderComplete,
          detail: input.marketLeader.marketLeaderComplete
            ? "Market leader phases complete"
            : envDetail(input.marketLeader.missing),
        };
      case "sustained_operational_excellence":
        return {
          ...def,
          complete: input.sustainedOps.sustainedOpsComplete,
          detail: input.sustainedOps.sustainedOpsComplete
            ? "Sustained ops cadences attested"
            : envDetail(input.sustainedOps.missing),
        };
      case "continuous_improvement_loop":
        return {
          ...def,
          complete: input.improvementLoop.pureOperationalMode,
          detail: input.improvementLoop.pureOperationalMode
            ? "Pure operational mode — improvement loop active"
            : `Complete Step 9 first · goDecision ${input.improvementLoop.goDecision ?? "missing"}`,
        };
      case "sustained_product_evolution":
        return {
          ...def,
          complete: input.productEvolution.productEvolutionReady,
          detail: input.productEvolution.productEvolutionReady
            ? "Product evolution tracks active"
            : "Complete Step 10 improvement loop first",
        };
      case "maintenance_mode":
        return {
          ...def,
          complete: input.maintenanceMode.maintenanceModeActive,
          detail: input.maintenanceMode.maintenanceModeActive
            ? "Maintenance mode active — repeat rhythms forever"
            : "Complete Step 11 product evolution first",
        };
      case "engineering_path_terminus":
        return {
          ...def,
          complete: input.maintenanceMode.maintenanceModeActive,
          detail: input.maintenanceMode.maintenanceModeActive
            ? "No era25 gates without explicit new era charter"
            : "Complete Steps 1–12 before path terminus orchestration",
        };
      case "post_terminus_steady_state":
        return {
          ...def,
          complete: input.steadyState.steadyStateActive,
          detail: input.steadyState.steadyStateActive
            ? input.steadyState.overdueTracks > 0
              ? `Steady state active · ${input.steadyState.overdueTracks} track(s) need attention`
              : "Steady state active — repeat Step 12 rhythms forever"
            : "Complete Step 13 engineering path terminus first",
        };
      case "commercial_pilot_path_absolute_end":
        return {
          ...def,
          complete: input.absoluteEnd.absoluteEndActive,
          detail: input.absoluteEnd.absoluteEndActive
            ? `Linear path closed · ${input.absoluteEnd.completedSteps}/${input.absoluteEnd.totalSteps} steps · era25+ requires charter`
            : "Complete Step 14 post-terminus steady state first",
        };
      case "linear_path_permanently_closed":
        return {
          ...def,
          complete: input.terminalClosure.terminalClosureActive,
          detail: input.terminalClosure.terminalClosureActive
            ? `Doc chain complete · ${input.terminalClosure.docChainSteps} steps · Step 17+ forbidden in this chain`
            : "Complete Step 15 absolute end first",
        };
      default:
        return { ...def, complete: false, detail: "Unknown step" };
    }
  });

  return statuses;
}

export function resolveCommercialPilotPathSummary(
  steps: CommercialPilotPathStepStatus[],
  maintenanceMode: CommercialPilotPathEvaluationInput["maintenanceMode"],
  steadyState?: CommercialPilotPathEvaluationInput["steadyState"],
  absoluteEnd?: CommercialPilotPathEvaluationInput["absoluteEnd"],
  terminalClosure?: CommercialPilotPathEvaluationInput["terminalClosure"],
): CommercialPilotPathSummary {
  const completedSteps = steps.filter((step) => step.complete).length;
  const gateSteps = steps.filter((step) => step.kind === "gate");
  const gateStepsComplete = gateSteps.every((step) => step.complete);
  const firstBlockedStep = steps.find((step) => !step.complete) ?? null;
  const firstBlockedGateStep = gateSteps.find((step) => !step.complete) ?? null;

  return {
    totalSteps: steps.length,
    completedSteps,
    gateStepsComplete,
    pathComplete: maintenanceMode.commercialPilotPathComplete,
    engineeringTerminusActive: maintenanceMode.maintenanceModeActive,
    steadyStateActive: steadyState?.steadyStateActive ?? false,
    absoluteEndActive: absoluteEnd?.absoluteEndActive ?? false,
    pathEngineeringClosed: absoluteEnd?.pathEngineeringClosed ?? true,
    terminalClosureActive: terminalClosure?.terminalClosureActive ?? false,
    linearPathPermanentlyClosed: terminalClosure?.linearPathPermanentlyClosed ?? true,
    goDecision: maintenanceMode.goDecision,
    firstBlockedStep,
    firstBlockedGateStep,
  };
}
