/**
 * Pilot Week 1 execution orchestrator — Step 5 honest milestone + phase truth.
 * Policy: era33-pilot-week1-execution-v1
 */
import type { CommercialGateExecutionSummary } from "@/lib/ops/commercial-gate-execution-orchestrator";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";
import { PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-rollback-drill-era17-policy";
import {
  resolveNextIncompletePilotWeek1ExecutionPhase,
  type PilotWeek1ExecutionPhaseStatus,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import { evaluatePilotWeek1ExecutionIntegrity } from "@/lib/commercial/pilot-week1-execution-integrity-era28";
import type { PilotWeek1ExecutionMilestone } from "@/lib/commercial/pilot-week1-execution-post-go-orchestrator-era21";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotGoldenPathSummary } from "@/lib/commercial/pilot-operator-golden-path-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { evaluatePilotWeek1Env } from "@/scripts/ops/validate-pilot-week1-env";

export const PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID =
  "era33-pilot-week1-execution-v1" as const;

export const PILOT_WEEK1_EXECUTION_DOC =
  "docs/next-step-5-pilot-week1-2026-05-29.md" as const;

export const PILOT_WEEK1_EXECUTION_STEP6_DOC =
  "docs/next-step-6-pilot-scale-expansion-2026-05-29.md" as const;

export const PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/pilot-week1-execution-summary.json" as const;

export const PILOT_WEEK1_EXECUTION_HTML_ARTIFACT =
  "artifacts/pilot-week1-execution-report.html" as const;

export const PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-pilot-week1-execution" as const;

export const PILOT_WEEK1_CHECKPOINT_ENV_KEYS = [
  "PILOT_WEEK1_CHECKPOINT_DATE",
  "PILOT_WEEK1_OPERATOR_SATISFACTION",
] as const;

export type PilotWeek1ExecutionOrchestratorMilestone =
  | "commercial_gate_blocked"
  | PilotWeek1ExecutionMilestone
  | "awaiting_checkpoint_smokes"
  | "awaiting_cs_signoff"
  | "awaiting_week1_integrity"
  | "week1_execution_passed";

export type PilotWeek1ExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type PilotWeek1ExecutionOrchestratorSummary = {
  version: "pilot-week1-execution-v1";
  policyId: typeof PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID;
  generatedAt: string;
  milestone: PilotWeek1ExecutionOrchestratorMilestone;
  commercialGateMilestone: string | null;
  goDecision: string | null;
  customerName: string | null;
  week1Complete: boolean;
  readyForDay5Smokes: boolean;
  operatorGoldenPathProofStatus: string | null;
  rollbackDrillProofStatus: string | null;
  week1IntegrityPassed: boolean;
  csSignoffComplete: boolean;
  phases: readonly PilotWeek1ExecutionPhaseStatus[];
  gates: readonly PilotWeek1ExecutionGateStatus[];
  nextPhase: PilotWeek1ExecutionPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function readOperatorGoldenPathProofStatus(
  artifact: Pick<PilotGoldenPathSummary, "overall" | "phaseProofStatus"> | null,
): string | null {
  if (!artifact) return null;
  return artifact.phaseProofStatus ?? artifact.overall ?? null;
}

export function readRollbackDrillProofStatus(
  artifact: Pick<PilotRollbackDrillSummary, "rollbackProofStatus"> | null,
): string | null {
  if (!artifact) return null;
  return artifact.rollbackProofStatus ?? null;
}

export function isCheckpointSmokesPassed(input: {
  operatorGoldenPath: Pick<PilotGoldenPathSummary, "overall" | "phaseProofStatus"> | null;
  rollbackDrill: Pick<PilotRollbackDrillSummary, "rollbackProofStatus"> | null;
}): boolean {
  const operatorPassed =
    input.operatorGoldenPath?.phaseProofStatus === "proof_passed" ||
    input.operatorGoldenPath?.overall === "PASSED";
  const rollbackPassed = input.rollbackDrill?.rollbackProofStatus === "proof_passed";
  return Boolean(operatorPassed && rollbackPassed);
}

export function isCsSignoffComplete(env: NodeJS.ProcessEnv): boolean {
  return PILOT_WEEK1_CHECKPOINT_ENV_KEYS.every((key) => Boolean(env[key]?.trim()));
}

export function resolvePilotWeek1ExecutionOrchestratorMilestone(input: {
  commercialGatePassed: boolean;
  week1Evaluation: ReturnType<typeof evaluatePilotWeek1Env>;
  checkpointSmokesPassed: boolean;
  csSignoffComplete: boolean;
  week1IntegrityPassed: boolean;
}): PilotWeek1ExecutionOrchestratorMilestone {
  if (!input.commercialGatePassed) return "commercial_gate_blocked";
  if (!input.week1Evaluation.prerequisites.prerequisitesComplete) return "go_blocked";
  if (!input.week1Evaluation.week1Complete) {
    return input.week1Evaluation.week1Milestone;
  }
  if (!input.checkpointSmokesPassed) return "awaiting_checkpoint_smokes";
  if (!input.csSignoffComplete) return "awaiting_cs_signoff";
  if (!input.week1IntegrityPassed) return "awaiting_week1_integrity";
  return "week1_execution_passed";
}

export function buildPilotWeek1ExecutionGates(input: {
  commercialGatePassed: boolean;
  commercialGateMilestone: string | null;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  week1Complete: boolean;
  operatorGoldenPathProofStatus: string | null;
  rollbackDrillProofStatus: string | null;
  csSignoffComplete: boolean;
  week1IntegrityPassed: boolean;
}): PilotWeek1ExecutionGateStatus[] {
  return [
    {
      id: "commercial_gate",
      label: "Commercial gate execution complete",
      complete: input.commercialGatePassed,
      proofStatus: input.commercialGatePassed ? "commercial_gate_passed" : input.commercialGateMilestone,
      detail: input.commercialGatePassed
        ? "commercial-gate-execution milestone commercial_gate_passed."
        : "Complete Step 4 — ICP + LOI + GO with integrity PASS.",
      command: "npm run ops:run-commercial-gate-execution -- --write",
    },
    {
      id: "go_integrity",
      label: "GO integrity validation",
      complete: input.goIntegrityPassed,
      proofStatus: input.goIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "Honest GO requires P0 + Tier 2 artifact truth — no fake GO.",
      command: "npm run ops:validate-pilot-gono-go-integrity -- --json",
    },
    {
      id: "week1_day_phases",
      label: "Week 1 day phases (TTV → metrics)",
      complete: input.week1Complete,
      proofStatus: input.week1Complete ? "week1_complete" : "in_progress",
      detail: input.week1Complete
        ? "All 5 day phases recorded with real env attestations."
        : "Record Day 1–5 milestones — never estimate TTV or fake order IDs.",
      command: "npm run ops:validate-pilot-week1-env -- --json",
    },
    {
      id: "checkpoint_operator_golden_path",
      label: "Week 1 checkpoint — operator golden path (production)",
      complete:
        input.operatorGoldenPathProofStatus === "proof_passed" ||
        input.operatorGoldenPathProofStatus === "PASSED",
      proofStatus: input.operatorGoldenPathProofStatus,
      detail:
        input.operatorGoldenPathProofStatus === "proof_passed"
          ? "Production operator golden path PASS recorded."
          : "Run smoke:pilot-operator-golden-path on production — not staging replay.",
      command: "npm run smoke:pilot-operator-golden-path",
    },
    {
      id: "checkpoint_rollback_drill",
      label: "Week 1 checkpoint — rollback drill",
      complete: input.rollbackDrillProofStatus === "proof_passed",
      proofStatus: input.rollbackDrillProofStatus,
      detail:
        input.rollbackDrillProofStatus === "proof_passed"
          ? "Rollback drill executable and documented."
          : "Run smoke:pilot-rollback-drill — tabletop or staging with operator email.",
      command: "npm run smoke:pilot-rollback-drill",
    },
    {
      id: "cs_signoff",
      label: "CS + COO Week 1 sign-off",
      complete: input.csSignoffComplete,
      proofStatus: input.csSignoffComplete ? "signed_off" : "pending",
      detail: input.csSignoffComplete
        ? "Checkpoint date and operator satisfaction recorded."
        : "Set PILOT_WEEK1_CHECKPOINT_DATE + PILOT_WEEK1_OPERATOR_SATISFACTION after Day 7 review.",
      command: null,
    },
    {
      id: "week1_integrity",
      label: "Week 1 execution integrity",
      complete: input.week1IntegrityPassed,
      proofStatus: input.week1IntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake metrics PASS or Week 1 started without honest GO.",
      command: "npm run ops:validate-pilot-week1-execution-integrity -- --json",
    },
  ];
}

export function buildPilotWeek1ExecutionOrchestratorSummary(input: {
  env?: NodeJS.ProcessEnv;
  commercialGate?: CommercialGateExecutionSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  operatorGoldenPath?: Pick<PilotGoldenPathSummary, "overall" | "phaseProofStatus"> | null;
  rollbackDrill?: Pick<PilotRollbackDrillSummary, "rollbackProofStatus"> | null;
  generatedAt?: Date;
}): PilotWeek1ExecutionOrchestratorSummary {
  const env = input.env ?? process.env;
  const week1Evaluation = evaluatePilotWeek1Env(env);
  const week1Integrity = evaluatePilotWeek1ExecutionIntegrity(process.cwd(), {
    env,
    goNoGoOverride: input.goNoGo ?? null,
  });
  const commercialGatePassed = input.commercialGate?.milestone === "commercial_gate_passed";
  const operatorGoldenPathProofStatus = readOperatorGoldenPathProofStatus(
    input.operatorGoldenPath ?? null,
  );
  const rollbackDrillProofStatus = readRollbackDrillProofStatus(input.rollbackDrill ?? null);
  const checkpointSmokesPassed = isCheckpointSmokesPassed({
    operatorGoldenPath: input.operatorGoldenPath ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
  });
  const csSignoffComplete = isCsSignoffComplete(env);

  const milestone = resolvePilotWeek1ExecutionOrchestratorMilestone({
    commercialGatePassed,
    week1Evaluation,
    checkpointSmokesPassed,
    csSignoffComplete,
    week1IntegrityPassed: week1Integrity.integrityPassed,
  });

  const gates = buildPilotWeek1ExecutionGates({
    commercialGatePassed,
    commercialGateMilestone: input.commercialGate?.milestone ?? null,
    goDecision: week1Evaluation.goDecision,
    goIntegrityPassed: week1Integrity.goIntegrityPassed,
    week1Complete: week1Evaluation.week1Complete,
    operatorGoldenPathProofStatus,
    rollbackDrillProofStatus,
    csSignoffComplete,
    week1IntegrityPassed: week1Integrity.integrityPassed,
  });

  const nextPhase = commercialGatePassed
    ? resolveNextIncompletePilotWeek1ExecutionPhase(week1Evaluation.phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!commercialGatePassed) {
    recommendedCommands.push("npm run ops:run-commercial-gate-execution -- --write");
    recommendedCommands.push("npm run ops:run-commercial-gate-execution -- --execute");
  } else if (!week1Evaluation.prerequisites.prerequisitesComplete) {
    recommendedCommands.push("npm run smoke:pilot-gono-go");
    recommendedCommands.push("npm run ops:validate-pilot-gono-go-integrity -- --json");
  } else {
    recommendedCommands.push("npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write");
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    } else if (week1Evaluation.readyForDay5Smokes) {
      recommendedCommands.push("npm run smoke:pilot-metrics-baseline");
      recommendedCommands.push("npm run smoke:pilot-case-study-draft");
      recommendedCommands.push("npm run smoke:pilot-gono-go");
    }
    if (week1Evaluation.week1Complete && !checkpointSmokesPassed) {
      recommendedCommands.push("npm run smoke:pilot-operator-golden-path");
      recommendedCommands.push("npm run smoke:pilot-rollback-drill");
    }
    recommendedCommands.push(PILOT_WEEK1_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  }

  if (milestone === "week1_execution_passed") {
    recommendedCommands.push("npm run ops:run-pilot-scale-expansion-execution -- --write");
    recommendedCommands.push("npm run run:production-pilot-ready");
  }

  return {
    version: "pilot-week1-execution-v1",
    policyId: PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    commercialGateMilestone: input.commercialGate?.milestone ?? null,
    goDecision: week1Evaluation.goDecision,
    customerName: input.goNoGo?.customerName ?? null,
    week1Complete: week1Evaluation.week1Complete,
    readyForDay5Smokes: week1Evaluation.readyForDay5Smokes,
    operatorGoldenPathProofStatus,
    rollbackDrillProofStatus,
    week1IntegrityPassed: week1Integrity.integrityPassed,
    csSignoffComplete,
    phases: week1Evaluation.phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/today",
      "/dashboard/launch-wizard",
      "/dashboard/kitchen",
      "/dashboard/pos",
      "/dashboard/integration-health#integration-health-pilot-week1",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — Week 1 PASS requires production orders, executable rollback drill, and CS sign-off. Applies to all F&B formats (restaurant, bar, café, bakery, catering, ghost kitchen).",
  };
}

export function formatPilotWeek1ExecutionOrchestratorLines(
  summary: PilotWeek1ExecutionOrchestratorSummary,
): string[] {
  return [
    `Pilot Week 1 execution: ${summary.milestone}`,
    `Commercial gate: ${summary.commercialGateMilestone ?? "missing"} · GO: ${summary.goDecision ?? "not evaluated"}`,
    `Customer: ${summary.customerName ?? "not recorded"} · Week 1 days complete: ${summary.week1Complete ? "yes" : "no"}`,
    `Checkpoint operator path: ${summary.operatorGoldenPathProofStatus ?? "missing"} · rollback: ${summary.rollbackDrillProofStatus ?? "missing"}`,
    `CS sign-off: ${summary.csSignoffComplete ? "yes" : "no"} · Week 1 integrity: ${summary.week1IntegrityPassed ? "PASS" : "FAIL"}`,
    summary.nextPhase
      ? `Next phase: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All day phases complete or blocked on commercial gate",
  ];
}

export {
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT,
  PILOT_ROLLBACK_DRILL_ERA17_SUMMARY_ARTIFACT,
};
