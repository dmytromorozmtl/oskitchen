/**
 * Production GA execution orchestrator — Step 7 honest milestone + phase truth.
 * Policy: era35-production-ga-execution-v1
 */
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { evaluateScaleReadinessIntegrity } from "@/lib/commercial/scale-readiness-integrity-era30";
import {
  buildProductionGaPhaseStatuses,
  resolveNextIncompleteProductionGaPhase,
  resolveProductionGaPhasesComplete,
  type ProductionGaPhaseStatus,
} from "@/lib/ops/production-ga-execution-phases";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import { buildPilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import { PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";
import type { PilotForbiddenClaimsEnforcementSummary } from "@/lib/commercial/pilot-forbidden-claims-enforcement-summary";
import { evaluateScaleReadinessEnv, readScaleReadinessArtifacts } from "@/scripts/ops/validate-scale-readiness-env";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readForbiddenClaimsArtifact(): PilotForbiddenClaimsEnforcementSummary | null {
  const path = join(process.cwd(), PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PilotForbiddenClaimsEnforcementSummary;
  } catch {
    return null;
  }
}

export const PRODUCTION_GA_EXECUTION_POLICY_ID =
  "era35-production-ga-execution-v1" as const;

export const PRODUCTION_GA_EXECUTION_DOC =
  "docs/next-step-7-production-ga-readiness-2026-05-29.md" as const;

export const PRODUCTION_GA_EXECUTION_STEP8_DOC =
  "docs/next-step-8-series-a-partner-expansion-2026-05-29.md" as const;

export const PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/production-ga-execution-summary.json" as const;

export const PRODUCTION_GA_EXECUTION_HTML_ARTIFACT =
  "artifacts/production-ga-execution-report.html" as const;

export const PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-production-ga-execution" as const;

export type ProductionGaExecutionMilestone =
  | "scale_expansion_blocked"
  | "awaiting_engineering_gates"
  | "awaiting_ops_runbooks"
  | "awaiting_cron_monitoring"
  | "awaiting_rollback_path"
  | "awaiting_security_review"
  | "awaiting_pricing_packaging"
  | "awaiting_launch_narrative"
  | "awaiting_scale_integrity"
  | "awaiting_commercial_inflection"
  | "production_ga_passed";

export type ProductionGaExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type ProductionGaExecutionSummary = {
  version: "production-ga-execution-v1";
  policyId: typeof PRODUCTION_GA_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: ProductionGaExecutionMilestone;
  scaleExpansionMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  gaPhasesComplete: boolean;
  scaleComplete: boolean;
  scaleIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  phases: readonly ProductionGaPhaseStatus[];
  gates: readonly ProductionGaExecutionGateStatus[];
  nextPhase: ProductionGaPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveProductionGaExecutionMilestone(input: {
  scaleExpansionPassed: boolean;
  gaPhases: readonly ProductionGaPhaseStatus[];
  scaleIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
}): ProductionGaExecutionMilestone {
  if (!input.scaleExpansionPassed) return "scale_expansion_blocked";

  const nextGa = resolveNextIncompleteProductionGaPhase(input.gaPhases);
  if (nextGa?.optional === false) {
    switch (nextGa.id) {
      case "engineering_gates":
        return "awaiting_engineering_gates";
      case "ops_runbooks":
        return "awaiting_ops_runbooks";
      case "cron_monitoring":
        return "awaiting_cron_monitoring";
      case "rollback_path":
        return "awaiting_rollback_path";
      case "security_review":
        return "awaiting_security_review";
      case "pricing_packaging":
        return "awaiting_pricing_packaging";
      case "launch_narrative":
        return "awaiting_launch_narrative";
      default:
        break;
    }
  }

  if (!resolveProductionGaPhasesComplete(input.gaPhases)) {
    return "awaiting_engineering_gates";
  }

  if (!input.scaleIntegrityPassed) return "awaiting_scale_integrity";
  if (input.commercialInflectionMilestone !== "commercial_inflection_ready") {
    return "awaiting_commercial_inflection";
  }

  return "production_ga_passed";
}

export function buildProductionGaExecutionGates(input: {
  scaleExpansionPassed: boolean;
  scaleExpansionMilestone: string | null;
  gaPhasesComplete: boolean;
  p0ProofPassed: boolean;
  tier2ProofPassed: boolean;
  scaleComplete: boolean;
  scaleIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
  goDecision: string | null;
  rollbackDrillPassed: boolean;
}): ProductionGaExecutionGateStatus[] {
  return [
    {
      id: "scale_expansion",
      label: "Pilot scale expansion complete (Step 6)",
      complete: input.scaleExpansionPassed,
      proofStatus: input.scaleExpansionPassed
        ? "pilot_scale_expansion_passed"
        : input.scaleExpansionMilestone,
      detail: input.scaleExpansionPassed
        ? "Week 2–4 expansion + scale readiness + integrity all passed."
        : "Complete Step 6 — pilot scale expansion execution.",
      command: "npm run ops:run-pilot-scale-expansion-execution -- --write",
    },
    {
      id: "engineering_gates",
      label: "Production engineering gates (P0 + Tier 2 + scale)",
      complete: input.p0ProofPassed && input.tier2ProofPassed && input.scaleComplete,
      proofStatus:
        input.p0ProofPassed && input.tier2ProofPassed && input.scaleComplete
          ? "engineering_gates_ready"
          : "blocked",
      detail: "P0, Tier 2, and scale readiness must all be proof_passed before GA.",
      command: "npm run run:production-pilot-ready",
    },
    {
      id: "ga_phases",
      label: "Production GA checklist phases",
      complete: input.gaPhasesComplete,
      proofStatus: input.gaPhasesComplete ? "ga_phases_complete" : "in_progress",
      detail: input.gaPhasesComplete
        ? "Engineering, ops, cron, rollback, security, pricing, launch narrative complete."
        : "Complete production GA attestation phases — all F&B ICP formats.",
      command: PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND + " -- --write",
    },
    {
      id: "rollback_drill",
      label: "Rollback drill proof_passed",
      complete: input.rollbackDrillPassed,
      proofStatus: input.rollbackDrillPassed ? "proof_passed" : "pending",
      detail: "Rollback path documented and drill within 90 days — never fake proof_passed.",
      command: "npm run smoke:pilot-rollback-drill",
    },
    {
      id: "scale_integrity",
      label: "Scale readiness integrity",
      complete: input.scaleIntegrityPassed,
      proofStatus: input.scaleIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake scale PASS or shared GO across customers.",
      command: "npm run ops:validate-scale-readiness-integrity -- --json",
    },
    {
      id: "commercial_inflection",
      label: "Commercial inflection readiness",
      complete: input.commercialInflectionMilestone === "commercial_inflection_ready",
      proofStatus: input.commercialInflectionMilestone,
      detail:
        input.commercialInflectionMilestone === "commercial_inflection_ready"
          ? "Pilot executable score meets inflection gate."
          : "Resolve remaining commercial inflection blockers.",
      command: "npm run ops:run-commercial-inflection-readiness-orchestrator -- --json",
    },
    {
      id: "go_decision",
      label: "GO decision still honest",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: "GO must remain valid through GA — re-run smoke:pilot-gono-go if artifacts drift.",
      command: "npm run smoke:pilot-gono-go",
    },
  ];
}

export function buildProductionGaExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  scaleExpansion?: PilotScaleExpansionExecutionSummary | null;
  week1Execution?: PilotWeek1ExecutionOrchestratorSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  generatedAt?: Date;
}): ProductionGaExecutionSummary {
  const env = input.env ?? process.env;
  const scaleArtifacts = readScaleReadinessArtifacts();
  const scaleEvaluation = evaluateScaleReadinessEnv(env);
  const scaleIntegrity = evaluateScaleReadinessIntegrity(process.cwd());
  const inflection = evaluateCommercialInflectionReadiness(env);

  const scaleExpansion =
    input.scaleExpansion ??
    buildPilotScaleExpansionExecutionSummary({
      env,
      week1Execution: input.week1Execution ?? null,
      goNoGo: input.goNoGo ?? null,
    });

  const p0ProofStatus =
    scaleArtifacts.p0Staging?.p0ProofStatus ?? null;
  const tier2ProofStatus =
    scaleArtifacts.tier2Summary?.tier2ProofStatus ?? null;
  const p0ProofPassed = p0ProofStatus === "proof_passed";
  const tier2ProofPassed = tier2ProofStatus === "proof_passed";
  const rollbackDrillPassed =
    scaleArtifacts.rollbackDrill?.rollbackProofStatus === "proof_passed";
  const investorOnepagerPassed = scaleArtifacts.investorOnepager?.overall === "PASSED";
  const forbiddenClaimsArtifact = readForbiddenClaimsArtifact();
  const forbiddenClaimsPassed =
    forbiddenClaimsArtifact?.claimsEnforcementProofStatus === "proof_passed" ||
    forbiddenClaimsArtifact?.overall === "PASSED";

  const phases = buildProductionGaPhaseStatuses({
    p0ProofPassed,
    tier2ProofPassed,
    scaleComplete: scaleEvaluation.scaleComplete,
    rollbackDrillPassed,
    investorOnepagerPassed,
    forbiddenClaimsPassed,
    env,
  });

  const scaleExpansionPassed = scaleExpansion.milestone === "pilot_scale_expansion_passed";
  const gaPhasesComplete = resolveProductionGaPhasesComplete(phases);

  const milestone = resolveProductionGaExecutionMilestone({
    scaleExpansionPassed,
    gaPhases: phases,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
  });

  const gates = buildProductionGaExecutionGates({
    scaleExpansionPassed,
    scaleExpansionMilestone: scaleExpansion.milestone,
    gaPhasesComplete,
    p0ProofPassed,
    tier2ProofPassed,
    scaleComplete: scaleEvaluation.scaleComplete,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    goDecision: input.goNoGo?.decision ?? scaleEvaluation.goDecision,
    rollbackDrillPassed,
  });

  const nextPhase = scaleExpansionPassed
    ? resolveNextIncompleteProductionGaPhase(phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!scaleExpansionPassed) {
    recommendedCommands.push("npm run ops:run-pilot-scale-expansion-execution -- --write");
    recommendedCommands.push("npm run ops:run-pilot-scale-expansion-execution -- --execute");
  } else if (!gaPhasesComplete) {
    recommendedCommands.push(PRODUCTION_GA_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    }
    recommendedCommands.push("npm run run:production-pilot-ready");
  } else if (!scaleIntegrity.integrityPassed) {
    recommendedCommands.push("npm run ops:validate-scale-readiness-integrity -- --json");
  } else if (inflection.milestone !== "commercial_inflection_ready") {
    recommendedCommands.push(
      "npm run ops:run-commercial-inflection-readiness-orchestrator -- --json",
    );
  }

  if (milestone === "production_ga_passed") {
    recommendedCommands.push(
      "npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write",
    );
  }

  return {
    version: "production-ga-execution-v1",
    policyId: PRODUCTION_GA_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    scaleExpansionMilestone: scaleExpansion.milestone,
    goDecision: input.goNoGo?.decision ?? scaleEvaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    gaPhasesComplete,
    scaleComplete: scaleEvaluation.scaleComplete,
    scaleIntegrityPassed: scaleIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    p0ProofStatus,
    tier2ProofStatus,
    phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/launch-wizard",
      "/dashboard/integration-health",
      "/platform/commercial-pilot-ops",
      "/solutions/ghost-kitchens",
      "/solutions/meal-prep",
      "/integrations",
    ],
    honestyNote:
      "PASS > SKIPPED — never claim SOC2 Type II until audit complete. Public claims must pass smoke:pilot-forbidden-claims-enforcement. ICP = all F&B formats.",
  };
}

export function formatProductionGaExecutionLines(
  summary: ProductionGaExecutionSummary,
): string[] {
  return [
    `Production GA execution: ${summary.milestone}`,
    `Scale expansion: ${summary.scaleExpansionMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · GA phases: ${summary.gaPhasesComplete ? "complete" : "in progress"}`,
    `P0: ${summary.p0ProofStatus ?? "missing"} · Tier 2: ${summary.tier2ProofStatus ?? "missing"} · scale ${summary.scaleComplete ? "complete" : "blocked"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next phase: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All GA phases complete or blocked on scale expansion",
  ];
}
