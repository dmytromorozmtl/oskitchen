/**
 * Commercial gate execution orchestrator — Step 4 honest milestone + phase truth.
 * Policy: era32-commercial-gate-execution-v1
 */
import type { CommercialGoClosureMilestone } from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import {
  resolveNextIncompleteCommercialGoClosurePhase,
  type CommercialGoClosurePhaseStatus,
} from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluateCommercialInflectionReadiness } from "@/lib/commercial/commercial-inflection-readiness-era28";
import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import { evaluateP0StagingProofIntegrity } from "@/lib/commercial/p0-staging-proof-integrity-era28";
import { evaluateTier2StagingGoldenPathIntegrity } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { Tier2StagingProofExecutionSummary } from "@/lib/ops/tier2-staging-proof-execution-orchestrator";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

export const COMMERCIAL_GATE_EXECUTION_POLICY_ID =
  "era32-commercial-gate-execution-v1" as const;

export const COMMERCIAL_GATE_EXECUTION_DOC =
  "docs/next-step-4-commercial-gate-2026-05-29.md" as const;

export const COMMERCIAL_GATE_EXECUTION_STEP5_DOC =
  "docs/next-step-5-pilot-week1-2026-05-29.md" as const;

export const COMMERCIAL_GATE_EXECUTION_STEP6_DOC =
  "docs/next-step-6-pilot-scale-expansion-2026-05-29.md" as const;

export const COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/commercial-gate-execution-summary.json" as const;

export const COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT =
  "artifacts/commercial-gate-execution-report.html" as const;

export const COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-commercial-gate-execution" as const;

export const ICP_QUALIFICATION_RESULT_ARTIFACT_PATH =
  "artifacts/icp-qualification-result.json" as const;

export type CommercialGateExecutionMilestone =
  | "tier2_execution_blocked"
  | CommercialGoClosureMilestone
  | "awaiting_go_integrity"
  | "awaiting_commercial_inflection"
  | "commercial_gate_passed";

export type CommercialGateExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type IcpQualificationArtifact = {
  envConfigured?: boolean;
  qualified?: boolean;
  disqualifiers?: string[];
  missingCriteria?: string[];
};

export type CommercialGateExecutionSummary = {
  version: "commercial-gate-execution-v1";
  policyId: typeof COMMERCIAL_GATE_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: CommercialGateExecutionMilestone;
  tier2ExecutionMilestone: string | null;
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  tier2IntegrityPassed: boolean;
  p0IntegrityPassed: boolean;
  icpQualified: boolean | null;
  icpEnvConfigured: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  goBlockerCount: number;
  commercialInflectionMilestone: string;
  pilotExecutableScore: number;
  readyForGoOrchestrator: boolean;
  phases: readonly CommercialGoClosurePhaseStatus[];
  gates: readonly CommercialGateExecutionGateStatus[];
  nextPhase: CommercialGoClosurePhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

export function resolveCommercialGateExecutionMilestone(input: {
  tier2ExecutionPassed: boolean;
  goClosureMilestone: CommercialGoClosureMilestone;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
}): CommercialGateExecutionMilestone {
  if (!input.tier2ExecutionPassed) return "tier2_execution_blocked";
  if (input.goClosureMilestone === "tier2_blocked") return "tier2_execution_blocked";
  if (input.goClosureMilestone !== "decision_go") return input.goClosureMilestone;
  if (input.goDecision === "GO" && !input.goIntegrityPassed) return "awaiting_go_integrity";
  if (input.commercialInflectionMilestone !== "commercial_inflection_ready") {
    return "awaiting_commercial_inflection";
  }
  if (input.goDecision === "GO" && input.goIntegrityPassed) return "commercial_gate_passed";
  return "awaiting_go_orchestrator";
}

export function buildCommercialGateExecutionGates(input: {
  tier2ExecutionPassed: boolean;
  tier2ExecutionMilestone: string | null;
  p0IntegrityPassed: boolean;
  tier2IntegrityPassed: boolean;
  icpArtifact: IcpQualificationArtifact | null;
  goClosureReady: boolean;
  goDecision: string | null;
  goIntegrityPassed: boolean;
  commercialInflectionMilestone: string;
}): CommercialGateExecutionGateStatus[] {
  return [
    {
      id: "tier2_execution",
      label: "Tier 2 staging proof execution complete",
      complete: input.tier2ExecutionPassed,
      proofStatus: input.tier2ExecutionPassed ? "proof_passed" : input.tier2ExecutionMilestone,
      detail: input.tier2ExecutionPassed
        ? "tier2-staging-proof-execution milestone proof_passed."
        : "Complete Step 3 — Tier 2 golden path on staging.",
      command: "npm run ops:run-tier2-staging-proof-execution -- --write",
    },
    {
      id: "p0_integrity",
      label: "P0 integrity validation",
      complete: input.p0IntegrityPassed,
      proofStatus: input.p0IntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake PASS in p0-staging-proof-unblock-summary.json.",
      command: "npm run ops:validate-p0-staging-proof-integrity -- --json",
    },
    {
      id: "tier2_integrity",
      label: "Tier 2 integrity validation",
      complete: input.tier2IntegrityPassed,
      proofStatus: input.tier2IntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake PASS in tier2-staging-golden-path-summary.json.",
      command: "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
    },
    {
      id: "icp_qualification",
      label: "ICP qualification (all F&B formats)",
      complete: Boolean(input.icpArtifact?.envConfigured && input.icpArtifact?.qualified),
      proofStatus: input.icpArtifact?.qualified
        ? "qualified"
        : input.icpArtifact?.envConfigured
          ? "disqualified"
          : "not_configured",
      detail: input.icpArtifact?.envConfigured
        ? input.icpArtifact.qualified
          ? "Real prospect ICP qualifies — restaurant, bar, café, bakery, catering, etc."
          : `Disqualifiers: ${input.icpArtifact.disqualifiers?.join(", ") || input.icpArtifact.missingCriteria?.join(", ") || "review ICP JSON"}`
        : "Export PILOT_GONOGO_ICP_INPUT_JSON from real prospect review.",
      command: "npm run icp-qualification-check",
    },
    {
      id: "go_orchestrator",
      label: "GO/NO-GO orchestrator",
      complete: input.goDecision === "GO",
      proofStatus: input.goDecision,
      detail: input.goClosureReady
        ? input.goDecision === "GO"
          ? "pilot-gono-go-summary.json → decision: GO"
          : "Run npm run smoke:pilot-gono-go after ICP + LOI + sales compliance"
        : "Complete commercial GO closure phases 2–4 first",
      command: "npm run smoke:pilot-gono-go",
    },
    {
      id: "go_integrity",
      label: "GO integrity validation",
      complete: input.goIntegrityPassed,
      proofStatus: input.goIntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "GO decision must match P0 + Tier 2 artifact truth — no fake GO.",
      command: "npm run ops:validate-pilot-gono-go-integrity -- --json",
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
  ];
}

export function buildCommercialGateExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  tier2Execution?: Tier2StagingProofExecutionSummary | null;
  goNoGo?: PilotGoNoGoSummary | null;
  icpArtifact?: IcpQualificationArtifact | null;
  generatedAt?: Date;
}): CommercialGateExecutionSummary {
  const env = input.env ?? process.env;
  const evaluation = evaluateCommercialGoClosureEnv(env);
  const p0Integrity = evaluateP0StagingProofIntegrity();
  const tier2Integrity = evaluateTier2StagingGoldenPathIntegrity();
  const goIntegrity = evaluatePilotGoNoGoIntegrity(process.cwd(), {
    artifactOverride: input.goNoGo ?? null,
    p0ProofStatusOverride: evaluation.prerequisites.p0ProofStatus,
    tier2ProofStatusOverride: evaluation.prerequisites.tier2ProofStatus,
  });
  const inflection = evaluateCommercialInflectionReadiness(env, process.cwd(), {
    goNoGo: input.goNoGo ?? null,
  });

  const tier2ExecutionPassed = input.tier2Execution?.milestone === "proof_passed";
  const icpArtifact = input.icpArtifact ?? null;
  const goDecision = input.goNoGo?.decision ?? evaluation.decision;

  const milestone = resolveCommercialGateExecutionMilestone({
    tier2ExecutionPassed,
    goClosureMilestone: evaluation.goClosureMilestone,
    goDecision,
    goIntegrityPassed: goIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
  });

  const gates = buildCommercialGateExecutionGates({
    tier2ExecutionPassed,
    tier2ExecutionMilestone: input.tier2Execution?.milestone ?? null,
    p0IntegrityPassed: p0Integrity.integrityPassed,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
    icpArtifact,
    goClosureReady: evaluation.readyForGoOrchestrator,
    goDecision,
    goIntegrityPassed: goIntegrity.integrityPassed,
    commercialInflectionMilestone: inflection.milestone,
  });

  const nextPhase =
    tier2ExecutionPassed && evaluation.prerequisites.prerequisitesComplete
      ? resolveNextIncompleteCommercialGoClosurePhase(evaluation.phases)
      : null;

  const recommendedCommands: string[] = [];
  if (!tier2ExecutionPassed) {
    recommendedCommands.push("npm run ops:run-tier2-staging-proof-execution -- --write");
    recommendedCommands.push("npm run ops:run-tier2-staging-proof-execution -- --execute");
  } else if (!evaluation.prerequisites.prerequisitesComplete) {
    recommendedCommands.push("npm run ops:validate-tier2-golden-path-env -- --json");
    recommendedCommands.push("npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
  } else {
    recommendedCommands.push(
      "npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write",
    );
    if (nextPhase?.id === "icp_qualification") {
      recommendedCommands.push("npm run icp-qualification-check");
    } else if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    } else if (nextPhase?.id === "go_orchestrator" && evaluation.readyForGoOrchestrator) {
      recommendedCommands.push("npm run smoke:pilot-gono-go");
    }
    recommendedCommands.push(COMMERCIAL_GATE_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  }

  if (milestone === "commercial_gate_passed") {
    recommendedCommands.push("npm run ops:run-pilot-week1-execution -- --write");
    recommendedCommands.push("npm run run:production-pilot-ready");
  }

  return {
    version: "commercial-gate-execution-v1",
    policyId: COMMERCIAL_GATE_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    tier2ExecutionMilestone: input.tier2Execution?.milestone ?? null,
    p0ProofStatus: evaluation.prerequisites.p0ProofStatus,
    tier2ProofStatus: evaluation.prerequisites.tier2ProofStatus,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
    p0IntegrityPassed: p0Integrity.integrityPassed,
    icpQualified: icpArtifact?.qualified ?? null,
    icpEnvConfigured: Boolean(icpArtifact?.envConfigured),
    goDecision,
    goIntegrityPassed: goIntegrity.integrityPassed,
    goBlockerCount: input.goNoGo?.blockers?.length ?? 0,
    commercialInflectionMilestone: inflection.milestone,
    pilotExecutableScore: inflection.pilotExecutableScore,
    readyForGoOrchestrator: evaluation.readyForGoOrchestrator,
    phases: evaluation.phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/implementation",
      "/dashboard/launch-wizard",
      "/dashboard/today",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — GO requires real ICP prospect (all F&B formats), signed LOI, and paid pilot customer. Never fake PILOT_GONOGO_CUSTOMER_NAME.",
  };
}

export function formatCommercialGateExecutionLines(summary: CommercialGateExecutionSummary): string[] {
  return [
    `Commercial gate execution: ${summary.milestone}`,
    `Tier 2 execution: ${summary.tier2ExecutionMilestone ?? "missing"} · P0=${summary.p0ProofStatus ?? "n/a"} · Tier2=${summary.tier2ProofStatus ?? "n/a"}`,
    `ICP: ${summary.icpEnvConfigured ? (summary.icpQualified ? "qualified" : "not qualified") : "not configured"}`,
    `GO/NO-GO: ${summary.goDecision ?? "not evaluated"} (${summary.goBlockerCount} blockers) · integrity ${summary.goIntegrityPassed ? "PASS" : "FAIL"}`,
    `Commercial inflection: ${summary.commercialInflectionMilestone} · pilot score ${summary.pilotExecutableScore}/100`,
    summary.nextPhase
      ? `Next phase: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All commercial phases complete or blocked on Tier 2",
  ];
}
