/**
 * Pilot GO/NO-GO integrity — detects fake GO in committed artifacts.
 * Policy: era28-pilot-gono-go-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  recomputePilotGoNoGoDecisionFromSummary,
  type PilotGoNoGoSummary,
} from "@/lib/commercial/pilot-gono-go-summary";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID =
  "era28-pilot-gono-go-integrity-v1" as const;

export const PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/pilot-gono-go-integrity-baseline.json" as const;

export type PilotGoNoGoIntegrityViolationId =
  | "artifact_missing"
  | "fake_go_decision_mismatch"
  | "fake_go_with_blockers"
  | "fake_go_missing_customer"
  | "fake_go_evidence_gate_failed"
  | "p0_prerequisite_not_passed"
  | "tier2_prerequisite_not_passed"
  | "baseline_regression";

export type PilotGoNoGoIntegrityViolation = {
  id: PilotGoNoGoIntegrityViolationId;
  detail: string;
};

export type PilotGoNoGoIntegrityBaseline = {
  decision: "GO";
  recordedAt: string;
  commitSha: string | null;
};

export type PilotGoNoGoIntegritySummary = {
  policyId: typeof PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID;
  integrityPassed: boolean;
  artifactPresent: boolean;
  artifactPath: typeof PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT;
  decision: PilotGoNoGoSummary["decision"] | null;
  recomputedDecision: PilotGoNoGoSummary["decision"] | null;
  blockerCount: number;
  customerExecutionStatus: string | null;
  p0ProofStatusLive: string | null;
  tier2ProofStatusLive: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly PilotGoNoGoIntegrityViolation[];
  recommendedCommands: readonly string[];
};

const BLOCKING_VIOLATION_IDS: readonly PilotGoNoGoIntegrityViolationId[] = [
  "fake_go_decision_mismatch",
  "fake_go_with_blockers",
  "fake_go_missing_customer",
  "fake_go_evidence_gate_failed",
  "p0_prerequisite_not_passed",
  "tier2_prerequisite_not_passed",
  "baseline_regression",
];

function readGoNoGoArtifact(root: string): PilotGoNoGoSummary | null {
  const path = join(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PilotGoNoGoSummary;
  } catch {
    return null;
  }
}

function readP0ProofStatus(root: string): string | null {
  const path = join(root, P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { p0ProofStatus?: string };
    return parsed.p0ProofStatus ?? null;
  } catch {
    return null;
  }
}

function readTier2ProofStatus(root: string): string | null {
  const path = join(root, TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Tier2StagingGoldenPathSummary;
    return parsed.tier2ProofStatus ?? null;
  } catch {
    return null;
  }
}

function readIntegrityBaseline(root: string): PilotGoNoGoIntegrityBaseline | null {
  try {
    const path = join(root, PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as PilotGoNoGoIntegrityBaseline;
  } catch {
    return null;
  }
}

export function evaluatePilotGoNoGoIntegrity(
  root: string = process.cwd(),
  options?: {
    artifactOverride?: PilotGoNoGoSummary | null;
    p0ProofStatusOverride?: string | null;
    tier2ProofStatusOverride?: string | null;
    baselineOverride?: PilotGoNoGoIntegrityBaseline | null;
  },
): PilotGoNoGoIntegritySummary {
  const artifact =
    options?.artifactOverride !== undefined
      ? options.artifactOverride
      : readGoNoGoArtifact(root);
  const p0ProofStatusLive =
    options?.p0ProofStatusOverride !== undefined
      ? options.p0ProofStatusOverride
      : readP0ProofStatus(root);
  const tier2ProofStatusLive =
    options?.tier2ProofStatusOverride !== undefined
      ? options.tier2ProofStatusOverride
      : readTier2ProofStatus(root);
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const violations: PilotGoNoGoIntegrityViolation[] = [];

  if (!artifact) {
    violations.push({
      id: "artifact_missing",
      detail: `No ${PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT} — run smoke:pilot-gono-go after Tier 2 PASS.`,
    });
    return {
      policyId: PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID,
      integrityPassed: true,
      artifactPresent: false,
      artifactPath: PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
      decision: null,
      recomputedDecision: null,
      blockerCount: 0,
      customerExecutionStatus: null,
      p0ProofStatusLive,
      tier2ProofStatusLive,
      baselinePresent: baseline !== null,
      regressionDetected: false,
      violations,
      recommendedCommands: [
        "npm run ops:validate-pilot-gono-go-integrity -- --json",
        "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
        "npm run smoke:pilot-gono-go -- --checklist-only",
      ],
    };
  }

  const recomputedDecision = recomputePilotGoNoGoDecisionFromSummary(artifact);

  if (artifact.decision === "GO" && recomputedDecision !== "GO") {
    violations.push({
      id: "fake_go_decision_mismatch",
      detail: `Artifact claims GO but evidence recompute ${recomputedDecision} — never hand-edit GO.`,
    });
  }

  if (artifact.decision === "GO" && artifact.blockers.length > 0) {
    violations.push({
      id: "fake_go_with_blockers",
      detail: `decision=GO but ${artifact.blockers.length} blocker(s) recorded — SKIPPED ≠ GO.`,
    });
  }

  if (artifact.decision === "GO" && artifact.customerExecutionStatus !== "recorded") {
    violations.push({
      id: "fake_go_missing_customer",
      detail: `decision=GO but customerExecutionStatus=${artifact.customerExecutionStatus} — LOI required.`,
    });
  }

  const failedCriticalGates = artifact.evidenceGates.filter((gate) => !gate.pass);
  if (artifact.decision === "GO" && failedCriticalGates.length > 0) {
    violations.push({
      id: "fake_go_evidence_gate_failed",
      detail: `GO with failed gates: ${failedCriticalGates.map((gate) => gate.id).join(", ")}`,
    });
  }

  if (artifact.decision === "GO" && p0ProofStatusLive !== "proof_passed") {
    violations.push({
      id: "p0_prerequisite_not_passed",
      detail: `GO artifact but live P0 is ${p0ProofStatusLive ?? "missing"} — complete P0 vault first.`,
    });
  }

  if (artifact.decision === "GO" && tier2ProofStatusLive !== "proof_passed") {
    violations.push({
      id: "tier2_prerequisite_not_passed",
      detail: `GO artifact but live Tier 2 is ${tier2ProofStatusLive ?? "missing"} — complete golden path first.`,
    });
  }

  if (baseline?.decision === "GO" && artifact.decision !== "GO") {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded GO at ${baseline.recordedAt} but current decision is ${artifact.decision}.`,
    });
  }

  const integrityPassed = !violations.some((row) =>
    BLOCKING_VIOLATION_IDS.includes(row.id),
  );
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID,
    integrityPassed,
    artifactPresent: true,
    artifactPath: PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
    decision: artifact.decision,
    recomputedDecision,
    blockerCount: artifact.blockers.length,
    customerExecutionStatus: artifact.customerExecutionStatus,
    p0ProofStatusLive,
    tier2ProofStatusLive,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-pilot-gono-go-integrity -- --json",
      "npm run ops:validate-commercial-go-closure-env -- --json",
      "npm run smoke:pilot-forbidden-claims-enforcement",
      "npm run smoke:pilot-gono-go",
      "npm run ops:validate-commercial-inflection-readiness -- --json",
    ],
  };
}
