/**
 * Integration Health — Tier 2 golden path banner (post-P0, pre-tier2 PASS).
 */

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { evaluateTier2StagingGoldenPathIntegrity } from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";
import {
  buildTier2GoldenPathUiSlice,
  type Tier2GoldenPathUiSlice,
} from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const INTEGRATION_HEALTH_TIER2_GOLDEN_PATH_ERA21_POLICY_ID =
  "era21-integration-health-tier2-golden-path-v1" as const;

export type IntegrationHealthTier2GoldenPathBanner = {
  policyId: typeof INTEGRATION_HEALTH_TIER2_GOLDEN_PATH_ERA21_POLICY_ID;
  visible: boolean;
  tier2ProofStatus: string;
  overall: string | null;
  headline: string;
  honestyNote: string;
  goldenPath: Tier2GoldenPathUiSlice;
  nextActions: readonly { label: string; href: string }[];
};

export function buildIntegrationHealthTier2GoldenPathBanner(input: {
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
}): IntegrationHealthTier2GoldenPathBanner | null {
  const p0ProofStatus = input.p0Staging?.p0ProofStatus ?? null;
  const goldenPath = buildTier2GoldenPathUiSlice({
    p0ProofStatus,
    tier2Summary: input.tier2Summary,
  });
  if (!goldenPath) return null;

  const tier2Integrity = evaluateTier2StagingGoldenPathIntegrity(process.cwd(), {
    artifactOverride: input.tier2Summary,
    p0ProofStatusOverride: p0ProofStatus,
  });

  return {
    policyId: INTEGRATION_HEALTH_TIER2_GOLDEN_PATH_ERA21_POLICY_ID,
    visible: true,
    tier2ProofStatus: goldenPath.tier2ProofStatus,
    overall: goldenPath.overall,
    headline:
      goldenPath.tier2ProofStatus === "proof_failed"
        ? "Tier 2 staging proof failed — fix Woo → Order Hub → KDS → Packing smokes on staging."
        : goldenPath.tier2ProofStatus === "awaiting_manual_phases"
          ? "P0 passed — complete manual Woo → Order Hub → KDS → Packing phases on staging."
          : "Tier 2 staging golden path incomplete — run orchestrator and record manual sign-off env vars.",
    honestyNote: tier2Integrity.integrityPassed
      ? "Manual TIER2_* env vars are operator attestations after real staging execution — never auto-PASS."
      : `Tier 2 integrity FAIL: ${tier2Integrity.violations.map((row) => row.id).join(", ") || "check artifact"} — run ${goldenPath.integrityValidateCommand}.`,
    goldenPath,
    nextActions: [
      { label: "Launch Wizard Tier 2", href: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}` },
      { label: "Order Hub", href: "/dashboard/order-hub" },
      { label: "KDS", href: "/dashboard/kitchen" },
    ],
  };
}
