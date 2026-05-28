/**
 * Era 20 — merges Tier 2 staging golden path artifact into GO/NO-GO tier2 gate.
 */
import type { PilotGoldenPathArtifact } from "@/lib/commercial/pilot-gono-go-summary";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

export const TIER2_GOLDEN_PATH_GONOGO_BRIDGE_ERA20_POLICY_ID =
  "era20-tier2-golden-path-gono-go-bridge-v1" as const;

export function mergeGoldenPathArtifactsForGoNoGo(input: {
  operatorGoldenPath: PilotGoldenPathArtifact | null;
  tier2StagingGoldenPath: Pick<
    Tier2StagingGoldenPathSummary,
    "overall" | "tier2ProofStatus" | "p0ProofStatus"
  > | null;
}): PilotGoldenPathArtifact | null {
  const { operatorGoldenPath, tier2StagingGoldenPath } = input;

  if (tier2StagingGoldenPath?.tier2ProofStatus === "proof_passed") {
    return {
      overall: tier2StagingGoldenPath.overall ?? "PASSED",
      phaseProofStatus: "proof_passed",
      signOffTemplate: operatorGoldenPath?.signOffTemplate,
    };
  }

  if (operatorGoldenPath?.phaseProofStatus === "proof_passed") {
    return operatorGoldenPath;
  }

  if (tier2StagingGoldenPath) {
    const tier2Status = tier2StagingGoldenPath.tier2ProofStatus;
    const mappedPhaseStatus =
      tier2Status === "awaiting_manual_phases"
        ? "proof_partial"
        : tier2Status === "awaiting_p0_proof_passed"
          ? "proof_skipped_missing_prerequisites"
          : operatorGoldenPath?.phaseProofStatus ?? "proof_skipped_missing_prerequisites";

    return {
      overall: tier2StagingGoldenPath.overall ?? operatorGoldenPath?.overall,
      phaseProofStatus: mappedPhaseStatus,
      signOffTemplate: operatorGoldenPath?.signOffTemplate,
    };
  }

  return operatorGoldenPath;
}

export function formatTier2GoldenPathGateReason(
  operatorGoldenPath: PilotGoldenPathArtifact | null,
  tier2StagingGoldenPath: Pick<Tier2StagingGoldenPathSummary, "tier2ProofStatus"> | null,
): string | null {
  if (tier2StagingGoldenPath?.tier2ProofStatus === "proof_passed") {
    return `${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT} → tier2ProofStatus proof_passed`;
  }
  if (operatorGoldenPath?.phaseProofStatus === "proof_passed") {
    return "phaseProofStatus proof_passed (operator golden path)";
  }
  if (tier2StagingGoldenPath) {
    return `tier2ProofStatus=${tier2StagingGoldenPath.tier2ProofStatus ?? "unknown"} — run npm run smoke:tier2-staging-golden-path`;
  }
  return null;
}
