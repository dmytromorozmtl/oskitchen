import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  evaluateCommercialInflectionReadiness,
  resolveCommercialInflectionMilestone,
} from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";

describe("commercial-inflection-readiness-era28", () => {
  it("locks policy id", () => {
    expect(COMMERCIAL_INFLECTION_READINESS_POLICY_ID).toBe("commercial-inflection-readiness-v1");
  });

  it("reports honest p0_ops_vault_blocked locally", () => {
    const result = evaluateCommercialInflectionReadiness({});
    expect(result.milestone).toBe("p0_ops_vault_blocked");
    expect(result.p0ProofStatus).toBe("awaiting_ops_credentials");
    expect(result.p0VaultMissingCount).toBe(11);
    expect(result.goDecision).not.toBe("GO");
    const vaultBlocker = result.blockers.find((row) => row.id === "p0_ops_vault_11_env");
    expect(vaultBlocker?.detail).toContain("Phase 1 — Staging login");
    expect(vaultBlocker?.detail).toContain("docs/GITHUB_E2E_STAGING_SECRETS.md");
    expect(vaultBlocker?.validateCommand).toContain("check-vault-readiness");
    expect(vaultBlocker?.artifactPath).toBe("artifacts/vault-readiness-report.json");
    expect(result.recommendedCommands[0]).toContain("check-vault-readiness");
    expect(result.blockers.some((row) => row.id === "stop_skipped_as_pass")).toBe(true);
    const stopRule = result.blockers.find((row) => row.id === "stop_skipped_as_pass");
    expect(stopRule?.validateCommand).toContain("validate-p0-staging-proof-integrity");
    expect(result.blockers.some((row) => row.id === "stop_tier2_fake_pass")).toBe(true);
    expect(result.blockers.some((row) => row.id === "stop_pilot_gono_go_fake_go")).toBe(true);
  });

  it("blocks tier2 PASS when integrity detects fake proof_passed", () => {
    const tier2Staging: Tier2StagingGoldenPathSummary = {
      version: "era20-tier2-staging-golden-path-v1",
      runAt: "2026-05-28T00:00:00.000Z",
      commitSha: null,
      overall: "SKIPPED",
      tier2ProofStatus: "proof_passed",
      p0ProofStatus: "proof_passed",
      steps: [
        {
          id: "manual",
          label: "Manual",
          kind: "manual_phase",
          status: "SKIPPED",
          reason: "unset",
        },
      ],
      missingManualEnvVars: [],
      playbookDoc: "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
    };
    const result = evaluateCommercialInflectionReadiness(
      {},
      process.cwd(),
      {
        p0Staging: {
          version: "era17-p0-staging-proof-unblock-v1",
          runAt: "2026-05-28T00:00:00.000Z",
          commitSha: null,
          overall: "PASSED",
          p0ProofStatus: "proof_passed",
          defaultProofStatus: "awaiting_ops_credentials",
          allMissingEnvVars: [],
          children: {} as never,
        },
        tier2Staging,
      },
    );
    const tier2Blocker = result.blockers.find((row) => row.id === "tier2_golden_path");
    const stopTier2 = result.blockers.find((row) => row.id === "stop_tier2_fake_pass");
    expect(tier2Blocker?.status).not.toBe("done");
    expect(stopTier2?.status).toBe("blocked");
  });

  it("orders milestones after vault before proof", () => {
    expect(
      resolveCommercialInflectionMilestone({
        p0VaultAllPresent: true,
        p0ProofPassed: false,
        tier2ProofPassed: false,
        goDecision: "NO-GO",
        blockedP0Count: 3,
      }),
    ).toBe("p0_staging_proof_blocked");
  });
});
