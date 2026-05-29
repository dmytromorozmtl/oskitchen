/**
 * Tier 2 staging proof execution orchestrator — Step 3 honest milestone + phase truth.
 * Policy: era31-tier2-staging-proof-execution-v1
 */
import { evaluateP0StagingProofIntegrity } from "@/lib/commercial/p0-staging-proof-integrity-era28";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import type { Tier2GoldenPathMilestone } from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
  buildTier2GoldenPathPhaseStatuses,
  resolveNextIncompleteTier2GoldenPathPhase,
  type Tier2GoldenPathPhaseStatus,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { evaluateTier2StagingGoldenPathIntegrity } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { P0StagingProofExecutionSummary } from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

export const TIER2_STAGING_PROOF_EXECUTION_POLICY_ID =
  "era31-tier2-staging-proof-execution-v1" as const;

export const TIER2_STAGING_PROOF_EXECUTION_DOC =
  "docs/next-step-3-tier2-staging-proof-band-2026-05-29.md" as const;

export const TIER2_STAGING_PROOF_EXECUTION_STEP4_DOC =
  "docs/next-step-4-commercial-gate-2026-05-29.md" as const;

export const TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/tier2-staging-proof-execution-summary.json" as const;

export const TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT =
  "artifacts/tier2-staging-proof-execution-report.html" as const;

export const TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-tier2-staging-proof-execution" as const;

export type Tier2StagingProofExecutionMilestone =
  | "p0_blocked"
  | "p0_execution_blocked"
  | Tier2GoldenPathMilestone
  | "awaiting_tier2_integrity"
  | "proof_passed";

export type Tier2StagingProofExecutionGateStatus = {
  id: string;
  label: string;
  complete: boolean;
  proofStatus: string | null;
  detail: string;
  command: string | null;
};

export type Tier2StagingProofExecutionSummary = {
  version: "tier2-staging-proof-execution-v1";
  policyId: typeof TIER2_STAGING_PROOF_EXECUTION_POLICY_ID;
  generatedAt: string;
  milestone: Tier2StagingProofExecutionMilestone;
  p0ProofStatus: string | null;
  p0ExecutionMilestone: string | null;
  tier2ProofStatus: string | null;
  tier2Overall: string | null;
  tier2IntegrityPassed: boolean;
  p0IntegrityPassed: boolean;
  kdsPlaywrightProofStatus: string | null;
  goDecision: string | null;
  goBlockerCount: number;
  phases: readonly Tier2GoldenPathPhaseStatus[];
  gates: readonly Tier2StagingProofExecutionGateStatus[];
  nextPhase: Tier2GoldenPathPhaseStatus | null;
  recommendedCommands: readonly string[];
  productSurfaces: readonly string[];
  honestyNote: string;
};

type KdsPlaywrightArtifact = {
  overall?: string;
  playwrightProofStatus?: string;
  proofStatus?: string;
};

type GoNoGoArtifact = {
  decision?: string;
  blockers?: string[];
};

export function readKdsPlaywrightProofStatus(artifact: KdsPlaywrightArtifact | null): string | null {
  if (!artifact) return null;
  return artifact.playwrightProofStatus ?? artifact.proofStatus ?? artifact.overall ?? null;
}

export function resolveTier2StagingProofExecutionMilestone(input: {
  p0GatePassed: boolean;
  p0ExecutionPassed: boolean;
  tier2Milestone: Tier2GoldenPathMilestone;
  tier2GatePassed: boolean;
  tier2IntegrityPassed: boolean;
}): Tier2StagingProofExecutionMilestone {
  if (!input.p0GatePassed) return "p0_blocked";
  if (!input.p0ExecutionPassed) return "p0_execution_blocked";
  if (input.tier2GatePassed && input.tier2IntegrityPassed) return "proof_passed";
  if (input.tier2GatePassed && !input.tier2IntegrityPassed) return "awaiting_tier2_integrity";
  return input.tier2Milestone;
}

export function buildTier2StagingProofExecutionGates(input: {
  p0GatePassed: boolean;
  p0ExecutionPassed: boolean;
  p0IntegrityPassed: boolean;
  tier2IntegrityPassed: boolean;
  kdsProofStatus: string | null;
}): Tier2StagingProofExecutionGateStatus[] {
  return [
    {
      id: "p0_gate",
      label: "P0 staging proof passed",
      complete: input.p0GatePassed,
      proofStatus: input.p0GatePassed ? "proof_passed" : "awaiting_ops_credentials",
      detail: input.p0GatePassed
        ? "P0 artifact shows proof_passed."
        : "Complete Step 2 — ops vault + child smokes.",
      command: "npm run ops:run-p0-staging-proof-execution -- --write",
    },
    {
      id: "p0_execution",
      label: "P0 execution orchestrator complete",
      complete: input.p0ExecutionPassed,
      proofStatus: input.p0ExecutionPassed ? "proof_passed" : "in_progress",
      detail: input.p0ExecutionPassed
        ? "p0-staging-proof-execution milestone proof_passed."
        : "Run ops:run-p0-staging-proof-execution until proof_passed.",
      command: "npm run ops:run-p0-staging-proof-execution -- --execute",
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
      id: "kds_playwright",
      label: "KDS Playwright staging proof",
      complete: input.kdsProofStatus === "proof_passed" || input.kdsProofStatus === "PASSED",
      proofStatus: input.kdsProofStatus,
      detail:
        input.kdsProofStatus === "proof_passed" || input.kdsProofStatus === "PASSED"
          ? "KDS Playwright artifact PASS."
          : "Run smoke:kds-staging-playwright after Tier 2 child smokes.",
      command: "npm run smoke:kds-staging-playwright",
    },
    {
      id: "tier2_integrity",
      label: "Tier 2 integrity validation",
      complete: input.tier2IntegrityPassed,
      proofStatus: input.tier2IntegrityPassed ? "integrity_passed" : "integrity_pending",
      detail: "No fake PASS in tier2-staging-golden-path-summary.json.",
      command: "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
    },
  ];
}

export function buildTier2StagingProofExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  tier2Summary?: Tier2StagingGoldenPathSummary | null;
  p0Execution?: P0StagingProofExecutionSummary | null;
  kdsArtifact?: KdsPlaywrightArtifact | null;
  goNoGo?: GoNoGoArtifact | null;
  generatedAt?: Date;
}): Tier2StagingProofExecutionSummary {
  const env = input.env ?? process.env;
  const evaluation = evaluateTier2GoldenPathEnv(env);
  const phases = buildTier2GoldenPathPhaseStatuses({
    tier2Summary: input.tier2Summary ?? null,
    env,
  });
  const p0Integrity = evaluateP0StagingProofIntegrity();
  const tier2Integrity = evaluateTier2StagingGoldenPathIntegrity();
  const p0ExecutionPassed = input.p0Execution?.milestone === "proof_passed";
  const kdsProofStatus = readKdsPlaywrightProofStatus(input.kdsArtifact ?? null);

  const milestone = resolveTier2StagingProofExecutionMilestone({
    p0GatePassed: evaluation.p0GatePassed,
    p0ExecutionPassed,
    tier2Milestone: evaluation.tier2Milestone,
    tier2GatePassed: evaluation.tier2GatePassed,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
  });

  const gates = buildTier2StagingProofExecutionGates({
    p0GatePassed: evaluation.p0GatePassed,
    p0ExecutionPassed,
    p0IntegrityPassed: p0Integrity.integrityPassed,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
    kdsProofStatus,
  });

  const nextPhase = evaluation.p0GatePassed
    ? resolveNextIncompleteTier2GoldenPathPhase(phases)
    : null;

  const recommendedCommands: string[] = [];
  if (!evaluation.p0GatePassed) {
    recommendedCommands.push("npm run ops:run-p0-staging-proof-execution -- --write");
    recommendedCommands.push("npm run check-vault-readiness -- --write");
  } else if (!p0ExecutionPassed) {
    recommendedCommands.push("npm run ops:run-p0-staging-proof-execution -- --execute");
  } else {
    recommendedCommands.push("npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
    if (nextPhase?.smokeScripts.length) {
      for (const script of nextPhase.smokeScripts) {
        recommendedCommands.push(`npm run ${script}`);
      }
    } else if (nextPhase?.id === "automated_child_smokes") {
      recommendedCommands.push("npm run smoke:tier2-staging-golden-path");
    }
    if (!gates.find((g) => g.id === "kds_playwright")?.complete) {
      recommendedCommands.push("npm run smoke:kds-staging-playwright");
    }
    recommendedCommands.push(TIER2_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  }

  if (milestone === "proof_passed") {
    recommendedCommands.push("npm run icp-qualification-check");
    recommendedCommands.push("npm run smoke:pilot-gono-go");
  }

  return {
    version: "tier2-staging-proof-execution-v1",
    policyId: TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    p0ProofStatus: evaluation.p0ProofStatus,
    p0ExecutionMilestone: input.p0Execution?.milestone ?? null,
    tier2ProofStatus: evaluation.tier2ProofStatus,
    tier2Overall: input.tier2Summary?.overall ?? null,
    tier2IntegrityPassed: tier2Integrity.integrityPassed,
    p0IntegrityPassed: p0Integrity.integrityPassed,
    kdsPlaywrightProofStatus: kdsProofStatus,
    goDecision: input.goNoGo?.decision ?? null,
    goBlockerCount: input.goNoGo?.blockers?.length ?? 0,
    phases,
    gates,
    nextPhase,
    recommendedCommands,
    productSurfaces: [
      "/dashboard/integration-health#integration-health-tier2-golden-path",
      "/dashboard/today",
      "/dashboard/launch-wizard",
      "/platform/commercial-pilot-ops",
    ],
    honestyNote:
      "PASS > SKIPPED — Tier 2 proof_passed requires manual fulfillment env vars and real KDS GitHub evidence. Applies to all F&B formats.",
  };
}

export function formatTier2StagingProofExecutionLines(
  summary: Tier2StagingProofExecutionSummary,
): string[] {
  return [
    `Tier 2 staging proof execution: ${summary.milestone}`,
    `P0: ${summary.p0ProofStatus ?? "missing"} · P0 execution: ${summary.p0ExecutionMilestone ?? "n/a"}`,
    `Tier 2: ${summary.tier2ProofStatus ?? "missing"} (${summary.tier2Overall ?? "n/a"})`,
    `KDS Playwright: ${summary.kdsPlaywrightProofStatus ?? "missing"}`,
    `GO/NO-GO: ${summary.goDecision ?? "not evaluated"} (${summary.goBlockerCount} blockers)`,
    summary.nextPhase
      ? `Next phase: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All Tier 2 phases complete or blocked on P0",
  ];
}

export {
  P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT,
  TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
};
