import { describe, expect, it } from "vitest";

import {
  mergeGoldenPathArtifactsForGoNoGo,
  formatTier2GoldenPathGateReason,
} from "@/lib/commercial/tier2-golden-path-gono-go-bridge-era20";
import { deriveTier2Pass } from "@/lib/commercial/pilot-gono-go-summary";
import { buildP0OpsVaultPhaseStatuses } from "@/lib/commercial/p0-ops-vault-phases-era21";
import { buildLaunchWizardTier2StatusSlice } from "@/lib/launch-wizard/launch-wizard-tier2-status-era21";

describe("tier2-golden-path-gono-go-bridge-era20", () => {
  it("passes tier2 gate when tier2 artifact is proof_passed", () => {
    const effective = mergeGoldenPathArtifactsForGoNoGo({
      operatorGoldenPath: { phaseProofStatus: "proof_skipped_missing_prerequisites" },
      tier2StagingGoldenPath: { overall: "PASSED", tier2ProofStatus: "proof_passed", p0ProofStatus: "proof_passed" },
    });
    expect(effective?.phaseProofStatus).toBe("proof_passed");

    const gate = deriveTier2Pass(
      { phaseProofStatus: "proof_skipped_missing_prerequisites" },
      { tier2ProofStatus: "proof_passed", overall: "PASSED", p0ProofStatus: "proof_passed" },
    );
    expect(gate.pass).toBe(true);
    expect(formatTier2GoldenPathGateReason(null, { tier2ProofStatus: "proof_passed" })).toContain(
      "tier2-staging-golden-path-summary",
    );
  });

  it("maps awaiting_manual_phases to proof_partial", () => {
    const effective = mergeGoldenPathArtifactsForGoNoGo({
      operatorGoldenPath: null,
      tier2StagingGoldenPath: {
        overall: "SKIPPED",
        tier2ProofStatus: "awaiting_manual_phases",
        p0ProofStatus: "proof_passed",
      },
    });
    expect(effective?.phaseProofStatus).toBe("proof_partial");
  });
});

describe("p0-ops-vault-phases-era21", () => {
  it("groups missing env vars by phase", () => {
    const phases = buildP0OpsVaultPhaseStatuses({
      missingEnvVars: ["E2E_STAGING_BASE_URL", "DATABASE_URL"],
    });
    const staging = phases.find((p) => p.id === "staging_login");
    const db = phases.find((p) => p.id === "database_encryption");
    expect(staging?.complete).toBe(false);
    expect(staging?.missingKeys).toContain("E2E_STAGING_BASE_URL");
    expect(db?.missingKeys).toContain("DATABASE_URL");
  });
});

describe("launch-wizard-tier2-status-era21", () => {
  it("blocks tier2 when p0 not passed", () => {
    const slice = buildLaunchWizardTier2StatusSlice({
      tier2Summary: null,
      p0ProofStatus: "awaiting_ops_credentials",
    });
    expect(slice.blockedOnP0).toBe(true);
    expect(slice.rows[0]?.status).toBe("BLOCKED");
  });
});
