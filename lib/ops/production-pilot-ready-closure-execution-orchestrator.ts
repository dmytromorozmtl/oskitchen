/**
 * Production pilot ready closure execution orchestrator — Step 14 honest full-chain milestone.
 * Policy: era42-production-pilot-ready-closure-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { evaluateEngineeringPathTerminusIntegrity } from "@/lib/commercial/engineering-path-terminus-integrity-era37";
import {
  resolveEngineeringPathTerminusMilestoneFromSummary,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { CommercialGateExecutionSummary } from "@/lib/ops/commercial-gate-execution-orchestrator";
import type { ContinuousImprovementLoopExecutionSummary } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import type { MaintenanceModeExecutionSummary } from "@/lib/ops/maintenance-mode-execution-orchestrator";
import { buildMaintenanceModeExecutionSummary } from "@/lib/ops/maintenance-mode-execution-orchestrator";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { P0StagingProofExecutionSummary } from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import type { Tier2StagingProofExecutionSummary } from "@/lib/ops/tier2-staging-proof-execution-orchestrator";
import { buildVaultReadinessReport } from "@/lib/ops/vault-readiness-report";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID =
  "era42-production-pilot-ready-closure-execution-v1" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_DOC =
  "docs/next-step-14-production-pilot-ready-closure-2026-05-29.md" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_STEP15_DOC =
  "docs/next-step-15-steady-state-operator-loop-lock-execution-2026-05-29.md" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/production-pilot-ready-closure-execution-summary.json" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT =
  "artifacts/production-pilot-ready-closure-execution-report.html" as const;

export const PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-production-pilot-ready-closure-execution" as const;

export const PRODUCTION_PILOT_READY_EXECUTION_CHAIN_STEPS = [
  {
    id: "p0",
    label: "P0 staging proof (Step 2)",
    artifact: "artifacts/p0-staging-proof-execution-summary.json",
    expectedMilestone: "proof_passed",
    command: "npm run ops:run-p0-staging-proof-execution -- --write",
  },
  {
    id: "tier2",
    label: "Tier 2 golden path (Step 3)",
    artifact: "artifacts/tier2-staging-proof-execution-summary.json",
    expectedMilestone: "proof_passed",
    command: "npm run ops:run-tier2-staging-proof-execution -- --write",
  },
  {
    id: "commercial_gate",
    label: "Commercial gate (Step 4)",
    artifact: "artifacts/commercial-gate-execution-summary.json",
    expectedMilestone: "commercial_gate_passed",
    command: "npm run ops:run-commercial-gate-execution -- --write",
  },
  {
    id: "week1",
    label: "Pilot week 1 (Step 5)",
    artifact: "artifacts/pilot-week1-execution-summary.json",
    expectedMilestone: "week1_execution_passed",
    command: "npm run ops:run-pilot-week1-execution -- --write",
  },
  {
    id: "scale",
    label: "Pilot scale expansion (Step 6)",
    artifact: "artifacts/pilot-scale-expansion-execution-summary.json",
    expectedMilestone: "pilot_scale_expansion_passed",
    command: "npm run ops:run-pilot-scale-expansion-execution -- --write",
  },
  {
    id: "production_ga",
    label: "Production GA (Step 7)",
    artifact: "artifacts/production-ga-execution-summary.json",
    expectedMilestone: "production_ga_passed",
    command: "npm run ops:run-production-ga-execution -- --write",
  },
  {
    id: "series_a",
    label: "Series A partner expansion (Step 8)",
    artifact: "artifacts/series-a-partner-expansion-execution-summary.json",
    expectedMilestone: "series_a_partner_expansion_passed",
    command: "npm run ops:run-series-a-partner-expansion-execution -- --write",
  },
  {
    id: "market_leader",
    label: "Market leader positioning (Step 9)",
    artifact: "artifacts/market-leader-positioning-execution-summary.json",
    expectedMilestone: "market_leader_positioning_passed",
    command: "npm run ops:run-market-leader-positioning-execution -- --write",
  },
  {
    id: "sustained_ops",
    label: "Sustained operational excellence (Step 10)",
    artifact: "artifacts/sustained-operational-excellence-execution-summary.json",
    expectedMilestone: "sustained_operational_excellence_passed",
    command: "npm run ops:run-sustained-operational-excellence-execution -- --write",
  },
  {
    id: "product_evolution",
    label: "Sustained product evolution (Step 11)",
    artifact: "artifacts/sustained-product-evolution-execution-summary.json",
    expectedMilestone: "sustained_product_evolution_passed",
    command: "npm run ops:run-sustained-product-evolution-execution -- --write",
  },
  {
    id: "ci_loop",
    label: "Continuous improvement loop (Step 12)",
    artifact: "artifacts/continuous-improvement-loop-execution-summary.json",
    expectedMilestone: "continuous_improvement_loop_passed",
    command: "npm run ops:run-continuous-improvement-loop-execution -- --write",
  },
  {
    id: "maintenance_mode",
    label: "Maintenance mode (Step 13)",
    artifact: "artifacts/maintenance-mode-execution-summary.json",
    expectedMilestone: "maintenance_mode_passed",
    command: "npm run ops:run-maintenance-mode-execution -- --write",
  },
] as const;

export type ProductionPilotReadyClosureExecutionMilestone =
  | "maintenance_mode_blocked"
  | "awaiting_p0_execution"
  | "awaiting_tier2_execution"
  | "awaiting_commercial_gate_execution"
  | "awaiting_week1_execution"
  | "awaiting_scale_expansion_execution"
  | "awaiting_production_ga_execution"
  | "awaiting_series_a_execution"
  | "awaiting_market_leader_execution"
  | "awaiting_sustained_ops_execution"
  | "awaiting_product_evolution_execution"
  | "awaiting_ci_loop_execution"
  | "awaiting_maintenance_mode_execution"
  | "awaiting_vault_readiness"
  | "awaiting_engineering_path_terminus"
  | "awaiting_investor_narrative"
  | "awaiting_case_study_approval"
  | "awaiting_per_pilot_isolation"
  | "awaiting_go_recertification"
  | "awaiting_forbidden_claims_review"
  | "awaiting_engineering_path_terminus_integrity"
  | "production_pilot_ready_passed";

export type ProductionPilotReadyChainStepStatus = {
  id: string;
  label: string;
  artifact: string;
  expectedMilestone: string;
  command: string;
  complete: boolean;
  actualMilestone: string | null;
  artifactPresent: boolean;
};

export type ProductionPilotReadyClosureExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type ProductionPilotReadyClosureExecutionSummary = {
  version: "production-pilot-ready-closure-execution-v1";
  policyId: typeof PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: ProductionPilotReadyClosureExecutionMilestone;
  maintenanceModeExecutionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  vaultReady: boolean;
  chainComplete: boolean;
  chainStepsPassed: number;
  chainStepsTotal: number;
  firstBlockedChainStepId: string | null;
  engineeringPathTerminusMilestone: string;
  engineeringPathTerminusHealthy: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
  investorNarrativeReady: boolean;
  caseStudyApproved: boolean;
  perCustomerIsolation: boolean;
  forbiddenClaimsReviewed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  chainSteps: readonly ProductionPilotReadyChainStepStatus[];
  gates: readonly ProductionPilotReadyClosureExecutionGateStatus[];
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

const CHAIN_STEP_TO_MILESTONE: Record<
  (typeof PRODUCTION_PILOT_READY_EXECUTION_CHAIN_STEPS)[number]["id"],
  ProductionPilotReadyClosureExecutionMilestone
> = {
  p0: "awaiting_p0_execution",
  tier2: "awaiting_tier2_execution",
  commercial_gate: "awaiting_commercial_gate_execution",
  week1: "awaiting_week1_execution",
  scale: "awaiting_scale_expansion_execution",
  production_ga: "awaiting_production_ga_execution",
  series_a: "awaiting_series_a_execution",
  market_leader: "awaiting_market_leader_execution",
  sustained_ops: "awaiting_sustained_ops_execution",
  product_evolution: "awaiting_product_evolution_execution",
  ci_loop: "awaiting_ci_loop_execution",
  maintenance_mode: "awaiting_maintenance_mode_execution",
};

export function resolveProductionPilotReadyClosureExecutionMilestone(input: {
  maintenanceModePassed: boolean;
  firstBlockedChainStep: Pick<ProductionPilotReadyChainStepStatus, "id"> | null;
  chainComplete: boolean;
  vaultReady: boolean;
  engineeringPathTerminusHealthy: boolean;
  investorNarrativeReady: boolean;
  caseStudyApproved: boolean;
  perCustomerIsolation: boolean;
  goDecision: string | null;
  forbiddenClaimsReviewed: boolean;
  engineeringPathTerminusIntegrityPassed: boolean;
}): ProductionPilotReadyClosureExecutionMilestone {
  if (!input.maintenanceModePassed && input.firstBlockedChainStep?.id === "maintenance_mode") {
    return "maintenance_mode_blocked";
  }

  if (input.firstBlockedChainStep) {
    const mapped = CHAIN_STEP_TO_MILESTONE[input.firstBlockedChainStep.id as keyof typeof CHAIN_STEP_TO_MILESTONE];
    if (mapped) return mapped;
  }

  if (!input.chainComplete) {
    return "awaiting_p0_execution";
  }

  if (!input.vaultReady) {
    return "awaiting_vault_readiness";
  }

  if (!input.engineeringPathTerminusHealthy) {
    return "awaiting_engineering_path_terminus";
  }

  if (!input.investorNarrativeReady) {
    return "awaiting_investor_narrative";
  }

  if (!input.caseStudyApproved) {
    return "awaiting_case_study_approval";
  }

  if (!input.perCustomerIsolation) {
    return "awaiting_per_pilot_isolation";
  }

  if (input.goDecision !== "GO") {
    return "awaiting_go_recertification";
  }

  if (!input.forbiddenClaimsReviewed) {
    return "awaiting_forbidden_claims_review";
  }

  if (!input.engineeringPathTerminusIntegrityPassed) {
    return "awaiting_engineering_path_terminus_integrity";
  }

  return "production_pilot_ready_passed";
}

export function buildProductionPilotReadyChainStepStatuses(input: {
  artifacts: Record<string, { milestone?: string } | null>;
}): ProductionPilotReadyChainStepStatus[] {
  return PRODUCTION_PILOT_READY_EXECUTION_CHAIN_STEPS.map((step) => {
    const loaded = input.artifacts[step.id] ?? null;
    const actualMilestone = loaded?.milestone ?? null;
    return {
      id: step.id,
      label: step.label,
      artifact: step.artifact,
      expectedMilestone: step.expectedMilestone,
      command: step.command,
      complete: actualMilestone === step.expectedMilestone,
      actualMilestone,
      artifactPresent: loaded !== null,
    };
  });
}

export function buildProductionPilotReadyClosureExecutionGates(input: {
  maintenanceModePassed: boolean;
  maintenanceModeExecutionMilestone: string | null;
  chainComplete: boolean;
  chainStepsPassed: number;
  chainStepsTotal: number;
  vaultReady: boolean;
  engineeringPathTerminusHealthy: boolean;
  engineeringPathTerminusMilestone: string;
  engineeringPathTerminusIntegrityPassed: boolean;
  investorNarrativeReady: boolean;
  caseStudyApproved: boolean;
  perCustomerIsolation: boolean;
  forbiddenClaimsReviewed: boolean;
  goDecision: string | null;
  commercialInflectionMilestone: string;
  gateStepsComplete: boolean;
}): ProductionPilotReadyClosureExecutionGateStatus[] {
  return [
    {
      id: "maintenance_mode",
      label: "Maintenance mode complete (Step 13)",
      complete: input.maintenanceModePassed,
      proofStatus: input.maintenanceModePassed
        ? "maintenance_mode_passed"
        : input.maintenanceModeExecutionMilestone,
      detail: input.maintenanceModePassed
        ? "Ten operator rhythms + era36/era56/era57 integrity passed."
        : "Complete Step 13 — maintenance mode execution.",
      command: "npm run ops:run-maintenance-mode-execution -- --write",
    },
    {
      id: "execution_chain",
      label: "Full execution chain Steps 2–13",
      complete: input.chainComplete,
      proofStatus: input.chainComplete
        ? "chain_complete"
        : `${input.chainStepsPassed}/${input.chainStepsTotal}_passed`,
      detail: input.chainComplete
        ? "All twelve execution orchestrators report expected milestones."
        : "Honest blocked state at earliest gate — never fake PASS.",
      command: PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "vault_readiness",
      label: "Ops vault ready (11 secrets)",
      complete: input.vaultReady,
      proofStatus: input.vaultReady ? "vault_ready" : "awaiting_ops_credentials",
      detail: "P0/Tier2 child smokes require configured vault secrets — PASS > SKIPPED.",
      command: "npm run check-vault-readiness -- --write",
    },
    {
      id: "engineering_path_terminus",
      label: "Engineering path terminus healthy",
      complete: input.engineeringPathTerminusHealthy,
      proofStatus: input.engineeringPathTerminusMilestone,
      detail: input.engineeringPathTerminusHealthy
        ? "Commercial pilot path gate chain + informational stack complete."
        : "Run engineering path terminus post-maintenance orchestrator.",
      command:
        "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
    },
    {
      id: "commercial_pilot_path_gates",
      label: "Commercial pilot path gate steps",
      complete: input.gateStepsComplete,
      proofStatus: input.gateStepsComplete ? "gate_steps_complete" : "gate_steps_blocked",
      detail: "Steps 1–11 gate validators must be complete before terminus sign-off.",
      command: "npm run ops:validate-commercial-pilot-path -- --json",
    },
    {
      id: "investor_narrative",
      label: "Investor narrative proof_ready_with_metrics",
      complete: input.investorNarrativeReady,
      proofStatus: input.investorNarrativeReady ? "proof_ready_with_metrics" : "pending",
      detail: "Founder narrative must cite live pilot metrics — no aspirational claims.",
      command: "npm run smoke:investor-narrative-onepager",
    },
    {
      id: "case_study_approval",
      label: "Case study customer approval",
      complete: input.caseStudyApproved,
      proofStatus: input.caseStudyApproved ? "approved" : "pending",
      detail: "Signed or anonymized_signed customer approval required for investor bundle.",
      command: "npm run smoke:pilot-case-study-draft",
    },
    {
      id: "per_pilot_isolation",
      label: "Per-pilot GO isolation (Scale Gate 1)",
      complete: input.perCustomerIsolation,
      proofStatus: input.perCustomerIsolation ? "isolation_maintained" : "pending",
      detail: "SCALE_PER_CUSTOMER_GO_ISOLATION=1 before final GO re-certification.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "go_recertification",
      label: "GO decision re-certification",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "Final GO/NO-GO must remain honest after full chain validation.",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "forbidden_claims",
      label: "Forbidden claims enforcement",
      complete: input.forbiddenClaimsReviewed,
      proofStatus: input.forbiddenClaimsReviewed ? "claims_reviewed" : "pending",
      detail: "Marketing claims strict review before Production Pilot Ready sign-off.",
      command: "npm run smoke:pilot-forbidden-claims-enforcement",
    },
    {
      id: "engineering_path_integrity",
      label: "Engineering path terminus integrity (era37)",
      complete: input.engineeringPathTerminusIntegrityPassed,
      proofStatus: input.engineeringPathTerminusIntegrityPassed
        ? "integrity_passed"
        : "integrity_pending",
      detail: "No terminus attestation without maintenance mode integrity chain.",
      command: "npm run ops:validate-engineering-path-terminus-integrity -- --json",
    },
    {
      id: "commercial_pilot_runbook",
      label: "Commercial pilot runbook cert chain",
      complete: input.chainComplete && input.vaultReady,
      proofStatus: input.chainComplete ? "cert_ready" : "blocked",
      detail: "test:ci:commercial-pilot-runbook:cert on every release train.",
      command: "npm run test:ci:commercial-pilot-runbook:cert",
    },
  ];
}

export function buildProductionPilotReadyClosureExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  maintenanceModeExecution?: MaintenanceModeExecutionSummary | null;
  p0Execution?: P0StagingProofExecutionSummary | null;
  tier2Execution?: Tier2StagingProofExecutionSummary | null;
  commercialGate?: CommercialGateExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  productionGa?: ProductionGaExecutionSummary | null;
  seriesAExpansion?: SeriesAPartnerExpansionExecutionSummary | null;
  marketLeaderExecution?: MarketLeaderPositioningExecutionSummary | null;
  sustainedOpsExecution?: SustainedOperationalExcellenceExecutionSummary | null;
  productEvolutionExecution?: SustainedProductEvolutionExecutionSummary | null;
  ciLoopExecution?: ContinuousImprovementLoopExecutionSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): ProductionPilotReadyClosureExecutionSummary {
  const env = input.env ?? process.env;
  const artifacts = readContinuousImprovementLoopArtifacts();
  const inflection = evaluateCommercialInflectionReadiness(env);
  const maintenanceMode = evaluateMaintenanceMode(env);
  const commercialPilotPath = evaluateCommercialPilotPath(env);
  const engineeringPathTerminusMilestone = resolveEngineeringPathTerminusMilestoneFromSummary({
    maintenanceMode,
    summary: commercialPilotPath.summary,
  });
  const engineeringPathTerminusIntegrity = evaluateEngineeringPathTerminusIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? artifacts.goNoGoSummary,
    p0StagingOverride: artifacts.p0Staging,
    tier2SummaryOverride: artifacts.tier2Summary,
    metricsBaselineOverride: artifacts.metricsBaseline,
    caseStudyDraftOverride: artifacts.caseStudyDraft,
    investorOnepagerOverride: artifacts.investorOnepager,
    rollbackDrillOverride: artifacts.rollbackDrill,
    competitorMatrixOverride: artifacts.competitorMatrix,
  });
  const vaultReport = buildVaultReadinessReport({
    p0Artifact: artifacts.p0Staging,
  });

  const maintenanceModeExecution =
    input.maintenanceModeExecution ??
    buildMaintenanceModeExecutionSummary({
      env,
      ciLoopExecution: input.ciLoopExecution ?? null,
      productEvolutionExecution: input.productEvolutionExecution ?? null,
      sustainedOpsExecution: input.sustainedOpsExecution ?? null,
      marketLeaderExecution: input.marketLeaderExecution ?? null,
      seriesAExpansion: input.seriesAExpansion ?? null,
      productionGa: input.productionGa ?? null,
      scaleExpansion: input.scaleExpansion ?? null,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? artifacts.goNoGoSummary,
    });

  const chainArtifacts: Record<string, { milestone?: string } | null> = {
    p0: input.p0Execution ?? null,
    tier2: input.tier2Execution ?? null,
    commercial_gate: input.commercialGate ?? null,
    week1: input.week1Execution ?? null,
    scale: input.scaleExpansion ?? null,
    production_ga: input.productionGa ?? null,
    series_a: input.seriesAExpansion ?? null,
    market_leader: input.marketLeaderExecution ?? null,
    sustained_ops: input.sustainedOpsExecution ?? null,
    product_evolution: input.productEvolutionExecution ?? null,
    ci_loop: input.ciLoopExecution ?? null,
    maintenance_mode: maintenanceModeExecution,
  };

  const chainSteps = buildProductionPilotReadyChainStepStatuses({ artifacts: chainArtifacts });
  const chainStepsPassed = chainSteps.filter((step) => step.complete).length;
  const chainStepsTotal = chainSteps.length;
  const chainComplete = chainStepsPassed === chainStepsTotal;
  const firstBlockedChainStep = chainSteps.find((step) => !step.complete) ?? null;
  const maintenanceModePassed =
    maintenanceModeExecution.milestone === "maintenance_mode_passed";

  const investorNarrativeReady =
    artifacts.investorOnepager?.narrativeProofStatus === "proof_ready_with_metrics" &&
    artifacts.investorOnepager.overall === "PASSED";
  const caseStudyApproval = env.PILOT_CASE_STUDY_CUSTOMER_APPROVAL?.trim() ?? "";
  const caseStudyApproved =
    caseStudyApproval === "signed" || caseStudyApproval === "anonymized_signed";
  const perCustomerIsolation = parseEnvBoolean(env.SCALE_PER_CUSTOMER_GO_ISOLATION) === true;
  const forbiddenClaimsReviewed =
    parseEnvBoolean(env.SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED) === true ||
    parseEnvBoolean(env.MARKETING_CLAIMS_STRICT) === true;
  const goDecision = input.goNoGo?.decision ?? maintenanceMode.goDecision;
  const engineeringPathTerminusHealthy =
    engineeringPathTerminusMilestone === "engineering_path_terminus_healthy";

  const milestone = resolveProductionPilotReadyClosureExecutionMilestone({
    maintenanceModePassed,
    firstBlockedChainStep,
    chainComplete,
    vaultReady: vaultReport.vaultReady,
    engineeringPathTerminusHealthy,
    investorNarrativeReady,
    caseStudyApproved,
    perCustomerIsolation,
    goDecision,
    forbiddenClaimsReviewed,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
  });

  const gates = buildProductionPilotReadyClosureExecutionGates({
    maintenanceModePassed,
    maintenanceModeExecutionMilestone: maintenanceModeExecution.milestone,
    chainComplete,
    chainStepsPassed,
    chainStepsTotal,
    vaultReady: vaultReport.vaultReady,
    engineeringPathTerminusHealthy,
    engineeringPathTerminusMilestone,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    investorNarrativeReady,
    caseStudyApproved,
    perCustomerIsolation,
    forbiddenClaimsReviewed,
    goDecision,
    commercialInflectionMilestone: inflection.milestone,
    gateStepsComplete: commercialPilotPath.summary.gateStepsComplete,
  });

  const recommendedCommands: string[] = [];
  if (!maintenanceModePassed && firstBlockedChainStep) {
    recommendedCommands.push(firstBlockedChainStep.command);
    recommendedCommands.push(firstBlockedChainStep.command.replace(" -- --write", " -- --execute"));
  } else if (!chainComplete && firstBlockedChainStep) {
    recommendedCommands.push(firstBlockedChainStep.command);
    recommendedCommands.push("npm run run:production-pilot-ready");
  } else if (!vaultReport.vaultReady) {
    recommendedCommands.push("npm run check-vault-readiness -- --write");
  } else if (!engineeringPathTerminusHealthy) {
    recommendedCommands.push(
      "npm run ops:run-engineering-path-terminus-post-maintenance-mode-orchestrator -- --write",
    );
    recommendedCommands.push("npm run ops:validate-commercial-pilot-path -- --json");
  } else if (!investorNarrativeReady) {
    recommendedCommands.push("npm run smoke:investor-narrative-onepager");
  } else if (!caseStudyApproved) {
    recommendedCommands.push("npm run smoke:pilot-case-study-draft");
  } else if (!perCustomerIsolation || goDecision !== "GO") {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
  } else if (!forbiddenClaimsReviewed) {
    recommendedCommands.push("npm run smoke:pilot-forbidden-claims-enforcement");
  } else if (!engineeringPathTerminusIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-engineering-path-terminus-integrity -- --json");
  }

  if (milestone === "production_pilot_ready_passed") {
    recommendedCommands.push(
      "npm run ops:run-steady-state-operator-loop-lock-execution -- --write",
    );
    recommendedCommands.push(
      "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
    );
  }

  return {
    version: "production-pilot-ready-closure-execution-v1",
    policyId: PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    maintenanceModeExecutionMilestone: maintenanceModeExecution.milestone,
    goDecision,
    customerName: artifacts.goNoGoSummary?.customerName ?? null,
    vaultReady: vaultReport.vaultReady,
    chainComplete,
    chainStepsPassed,
    chainStepsTotal,
    firstBlockedChainStepId: firstBlockedChainStep?.id ?? null,
    engineeringPathTerminusMilestone,
    engineeringPathTerminusHealthy,
    engineeringPathTerminusIntegrityPassed: engineeringPathTerminusIntegrity.integrityPassed,
    investorNarrativeReady,
    caseStudyApproved,
    perCustomerIsolation,
    forbiddenClaimsReviewed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    chainSteps,
    gates,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops",
      "/dashboard/today",
      "/solutions/ghost-kitchens",
      "/solutions/meal-prep",
    ],
    honestyNote:
      "PASS > SKIPPED — full chain shows honest blocked state at earliest gate. Vault secrets required for P0 PASS. Never fabricate investor narrative or GO artifacts. ICP = all F&B formats.",
  };
}

function parseEnvBoolean(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return undefined;
}

export function formatProductionPilotReadyClosureExecutionLines(
  summary: ProductionPilotReadyClosureExecutionSummary,
): string[] {
  return [
    `Production pilot ready closure: ${summary.milestone}`,
    `Maintenance mode: ${summary.maintenanceModeExecutionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Chain: ${summary.chainStepsPassed}/${summary.chainStepsTotal} passed · Vault: ${summary.vaultReady ? "ready" : "blocked"}`,
    `Engineering terminus: ${summary.engineeringPathTerminusMilestone} · integrity ${summary.engineeringPathTerminusIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.firstBlockedChainStepId
      ? `First blocked step: ${summary.firstBlockedChainStepId}`
      : "All chain steps passed or awaiting closure artifacts",
  ];
}
