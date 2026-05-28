/**
 * Engineering path terminus — master commercial pilot path catalog (Step 13, era24).
 * Orchestration only: no new gates, env keys, or briefing priorities.
 */
import { COMMERCIAL_GO_CLOSURE_STEP3_DOC } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { MAINTENANCE_MODE_STEP12_DOC } from "@/lib/commercial/maintenance-mode-phases-era24";
import { MARKET_LEADER_POSITIONING_STEP8_DOC } from "@/lib/commercial/market-leader-positioning-phases-era21";
import { MONTH2_MARKET_READINESS_STEP5_DOC } from "@/lib/commercial/month2-market-readiness-phases-era21";
import { P0_OPS_VAULT_ERA21_DAY0_DOC } from "@/lib/commercial/p0-ops-vault-era21-policy";
import { PILOT_WEEK1_EXECUTION_STEP4_DOC } from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { SCALE_READINESS_STEP6_DOC } from "@/lib/commercial/scale-readiness-phases-era21";
import { SERIES_A_PARTNER_EXPANSION_STEP7_DOC } from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC } from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { POST_TERMINUS_STEADY_STATE_STEP14_DOC } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC } from "@/lib/commercial/sustained-product-evolution-phases-era23";
import { TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC } from "@/lib/commercial/tier2-staging-golden-path-era21-policy";

export const ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID =
  "era24-engineering-path-terminus-v1" as const;

export const ENGINEERING_PATH_TERMINUS_ERA24_BACKLOG_ID = "KOS-E24-013" as const;

export const ENGINEERING_PATH_TERMINUS_STEP13_DOC =
  "docs/next-step-13-engineering-path-terminus-2026-05-28.md" as const;

export const COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH =
  "artifacts/commercial-pilot-path-status-report.md" as const;

export const ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR = "#engineering-path-terminus" as const;

export type CommercialPilotPathStepKind = "gate" | "informational";

export type CommercialPilotPathStepDef = {
  step: number;
  id: string;
  label: string;
  policyId: string;
  docPath: string;
  kind: CommercialPilotPathStepKind;
  validateCommand: string;
  platformAnchor?: string;
};

export const COMMERCIAL_PILOT_PATH_STEP_CATALOG: readonly CommercialPilotPathStepDef[] = [
  {
    step: 1,
    id: "p0_ops_vault",
    label: "P0 ops vault — Day 0 credentials",
    policyId: "era21-p0-ops-vault-v1",
    docPath: P0_OPS_VAULT_ERA21_DAY0_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-p0-vault-env",
  },
  {
    step: 2,
    id: "tier2_golden_path",
    label: "Tier 2 staging golden path",
    policyId: "era21-tier2-staging-golden-path-v1",
    docPath: TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-tier2-golden-path-env",
  },
  {
    step: 3,
    id: "commercial_go_closure",
    label: "Commercial GO closure",
    policyId: "era21-commercial-go-closure-v1",
    docPath: COMMERCIAL_GO_CLOSURE_STEP3_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-commercial-go-closure-env",
  },
  {
    step: 4,
    id: "pilot_week1_execution",
    label: "Pilot Week 1 execution",
    policyId: "era21-pilot-week1-execution-v1",
    docPath: PILOT_WEEK1_EXECUTION_STEP4_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-pilot-week1-env",
  },
  {
    step: 5,
    id: "month2_market_readiness",
    label: "Month 2 market readiness",
    policyId: "era21-month2-market-readiness-v1",
    docPath: MONTH2_MARKET_READINESS_STEP5_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-month2-market-readiness-env",
  },
  {
    step: 6,
    id: "scale_readiness",
    label: "Scale readiness",
    policyId: "era21-scale-readiness-v1",
    docPath: SCALE_READINESS_STEP6_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-scale-readiness-env",
  },
  {
    step: 7,
    id: "series_a_partner_expansion",
    label: "Series A partner expansion",
    policyId: "era21-series-a-partner-expansion-v1",
    docPath: SERIES_A_PARTNER_EXPANSION_STEP7_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-series-a-partner-expansion-env",
  },
  {
    step: 8,
    id: "market_leader_positioning",
    label: "Market leader positioning",
    policyId: "era21-market-leader-positioning-v1",
    docPath: MARKET_LEADER_POSITIONING_STEP8_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-market-leader-positioning-env",
  },
  {
    step: 9,
    id: "sustained_operational_excellence",
    label: "Sustained operational excellence",
    policyId: "era21-sustained-operational-excellence-v1",
    docPath: SUSTAINED_OPERATIONAL_EXCELLENCE_STEP9_DOC,
    kind: "gate",
    validateCommand: "npm run ops:validate-sustained-operational-excellence-env",
  },
  {
    step: 10,
    id: "continuous_improvement_loop",
    label: "Continuous improvement loop",
    policyId: "era22-continuous-improvement-loop-v1",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-continuous-improvement-loop",
    platformAnchor: "#continuous-improvement-loop",
  },
  {
    step: 11,
    id: "sustained_product_evolution",
    label: "Sustained product evolution",
    policyId: "era23-sustained-product-evolution-v1",
    docPath: SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-sustained-product-evolution",
    platformAnchor: "#sustained-product-evolution",
  },
  {
    step: 12,
    id: "maintenance_mode",
    label: "Maintenance mode — path terminus UI",
    policyId: "era24-maintenance-mode-v1",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-maintenance-mode",
    platformAnchor: "#maintenance-mode",
  },
  {
    step: 13,
    id: "engineering_path_terminus",
    label: "Engineering path terminus — master orchestration",
    policyId: ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
    docPath: ENGINEERING_PATH_TERMINUS_STEP13_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-commercial-pilot-path",
    platformAnchor: ENGINEERING_PATH_TERMINUS_PLATFORM_ANCHOR,
  },
  {
    step: 14,
    id: "post_terminus_steady_state",
    label: "Post-terminus steady state — repeat forever",
    policyId: "era24-post-terminus-steady-state-v1",
    docPath: POST_TERMINUS_STEADY_STATE_STEP14_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-steady-state-operator-loop",
    platformAnchor: "#post-terminus-steady-state",
  },
  {
    step: 15,
    id: "commercial_pilot_path_absolute_end",
    label: "Commercial pilot path — absolute end",
    policyId: "era24-commercial-pilot-path-absolute-end-v1",
    docPath: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-commercial-pilot-path-absolute-end",
    platformAnchor: "#commercial-pilot-path-absolute-end",
  },
  {
    step: 16,
    id: "linear_path_permanently_closed",
    label: "Linear path permanently closed — doc chain terminus",
    policyId: "era24-linear-path-permanently-closed-v1",
    docPath: LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
    kind: "informational",
    validateCommand: "npm run ops:validate-linear-path-permanently-closed",
    platformAnchor: "#linear-path-permanently-closed",
  },
] as const;

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
