/**
 * Tier 2 staging golden path integrity — detects fake proof_passed and P0 prerequisite drift.
 * Policy: era28-tier2-staging-golden-path-integrity-v1
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
  recomputeTier2ProofStatusFromSummary,
  type Tier2StagingGoldenPathSummary,
} from "@/lib/commercial/tier2-staging-golden-path-summary";

export const TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID =
  "era28-tier2-staging-golden-path-integrity-v1" as const;

export const TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT =
  "artifacts/tier2-staging-golden-path-integrity-baseline.json" as const;

export type Tier2StagingGoldenPathIntegrityViolationId =
  | "artifact_missing"
  | "p0_prerequisite_not_passed"
  | "fake_pass_status_mismatch"
  | "fake_pass_overall_skipped"
  | "proof_failed_recorded"
  | "baseline_regression";

export type Tier2StagingGoldenPathIntegrityViolation = {
  id: Tier2StagingGoldenPathIntegrityViolationId;
  detail: string;
};

export type Tier2StagingGoldenPathIntegrityBaseline = {
  tier2ProofStatus: "proof_passed";
  recordedAt: string;
  commitSha: string | null;
};

export type Tier2StagingGoldenPathIntegritySummary = {
  policyId: typeof TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID;
  integrityPassed: boolean;
  artifactPresent: boolean;
  artifactPath: typeof TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT;
  tier2ProofStatus: Tier2StagingGoldenPathSummary["tier2ProofStatus"] | null;
  recomputedProofStatus: Tier2StagingGoldenPathSummary["tier2ProofStatus"] | null;
  p0ProofStatusInArtifact: string | null;
  p0ProofStatusLive: string | null;
  overall: string | null;
  baselinePresent: boolean;
  regressionDetected: boolean;
  violations: readonly Tier2StagingGoldenPathIntegrityViolation[];
  recommendedCommands: readonly string[];
};

function readTier2Artifact(root: string): Tier2StagingGoldenPathSummary | null {
  const path = join(root, TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Tier2StagingGoldenPathSummary;
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

function readIntegrityBaseline(root: string): Tier2StagingGoldenPathIntegrityBaseline | null {
  try {
    const path = join(root, TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as Tier2StagingGoldenPathIntegrityBaseline;
  } catch {
    return null;
  }
}

const BLOCKING_VIOLATION_IDS: readonly Tier2StagingGoldenPathIntegrityViolationId[] = [
  "p0_prerequisite_not_passed",
  "fake_pass_status_mismatch",
  "fake_pass_overall_skipped",
  "proof_failed_recorded",
  "baseline_regression",
];

export function evaluateTier2StagingGoldenPathIntegrity(
  root: string = process.cwd(),
  options?: {
    artifactOverride?: Tier2StagingGoldenPathSummary | null;
    p0ProofStatusOverride?: string | null;
    baselineOverride?: Tier2StagingGoldenPathIntegrityBaseline | null;
  },
): Tier2StagingGoldenPathIntegritySummary {
  const artifact =
    options?.artifactOverride !== undefined
      ? options.artifactOverride
      : readTier2Artifact(root);
  const p0ProofStatusLive =
    options?.p0ProofStatusOverride !== undefined
      ? options.p0ProofStatusOverride
      : readP0ProofStatus(root);
  const baseline =
    options?.baselineOverride !== undefined
      ? options.baselineOverride
      : readIntegrityBaseline(root);

  const violations: Tier2StagingGoldenPathIntegrityViolation[] = [];

  if (!artifact) {
    violations.push({
      id: "artifact_missing",
      detail: `No ${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT} — run smoke after P0 proof_passed.`,
    });
    return {
      policyId: TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
      integrityPassed: true,
      artifactPresent: false,
      artifactPath: TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
      tier2ProofStatus: null,
      recomputedProofStatus: null,
      p0ProofStatusInArtifact: null,
      p0ProofStatusLive: p0ProofStatusLive,
      overall: null,
      baselinePresent: baseline !== null,
      regressionDetected: false,
      violations,
      recommendedCommands: [
        "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
        "npm run ops:validate-p0-staging-proof-integrity -- --json",
        "npm run smoke:tier2-staging-golden-path -- --checklist-only",
      ],
    };
  }

  const recomputedProofStatus = recomputeTier2ProofStatusFromSummary(artifact);

  if (artifact.tier2ProofStatus === "proof_passed" && p0ProofStatusLive !== "proof_passed") {
    violations.push({
      id: "p0_prerequisite_not_passed",
      detail: `Tier 2 claims proof_passed but live P0 artifact is ${p0ProofStatusLive ?? "missing"} — run P0 vault first.`,
    });
  }

  if (
    artifact.tier2ProofStatus === "proof_passed" &&
    artifact.p0ProofStatus !== "proof_passed"
  ) {
    violations.push({
      id: "p0_prerequisite_not_passed",
      detail: `Tier 2 summary embeds p0ProofStatus=${artifact.p0ProofStatus ?? "missing"} — must be proof_passed.`,
    });
  }

  if (artifact.tier2ProofStatus === "proof_passed" && recomputedProofStatus !== "proof_passed") {
    violations.push({
      id: "fake_pass_status_mismatch",
      detail: `Artifact claims proof_passed but steps recompute ${recomputedProofStatus} — never hand-edit PASS.`,
    });
  }

  if (artifact.tier2ProofStatus === "proof_passed" && artifact.overall !== "PASSED") {
    violations.push({
      id: "fake_pass_overall_skipped",
      detail: `tier2ProofStatus proof_passed but overall=${artifact.overall} — SKIPPED ≠ PASS.`,
    });
  }

  if (artifact.overall === "FAILED" || artifact.tier2ProofStatus === "proof_failed") {
    violations.push({
      id: "proof_failed_recorded",
      detail: "Tier 2 proof_failed — fix Woo → Order Hub → KDS → Packing on staging before GO.",
    });
  }

  if (
    baseline?.tier2ProofStatus === "proof_passed" &&
    artifact.tier2ProofStatus !== "proof_passed"
  ) {
    violations.push({
      id: "baseline_regression",
      detail: `Baseline recorded proof_passed at ${baseline.recordedAt} but current is ${artifact.tier2ProofStatus}.`,
    });
  }

  const integrityPassed = !violations.some((row) =>
    BLOCKING_VIOLATION_IDS.includes(row.id),
  );
  const regressionDetected = violations.some((row) => row.id === "baseline_regression");

  return {
    policyId: TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
    integrityPassed,
    artifactPresent: true,
    artifactPath: TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
    tier2ProofStatus: artifact.tier2ProofStatus,
    recomputedProofStatus,
    p0ProofStatusInArtifact: artifact.p0ProofStatus,
    p0ProofStatusLive,
    overall: artifact.overall,
    baselinePresent: baseline !== null,
    regressionDetected,
    violations,
    recommendedCommands: [
      "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
      "npm run ops:validate-tier2-golden-path-env -- --json",
      "npm run smoke:tier2-staging-golden-path",
      "npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write",
      "npm run ops:validate-commercial-inflection-readiness -- --json",
    ],
  };
}
