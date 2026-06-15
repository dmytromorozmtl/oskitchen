import { describe, expect, it } from "vitest";

import { evaluateEra25BandAMarketProofExecutionSolePathIntegrity } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";

const honestGo = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "GO" as const,
  blockers: [],
  warnings: [],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
  evidenceGates: [],
  evaluatorInput: {
    tier0Pass: true,
    tier1Pass: true,
    tier2Pass: true,
    tier3Pass: true,
    roleChecklistsComplete: true,
    forbiddenClaimsInContract: false,
    icpQualified: true,
    stagingUrl: "https://x.example.com",
    commitSha: "abc",
  },
};

describe("era25-band-a-market-proof-execution-sole-path-integrity-era61", () => {
  it("detects sole-path started without honest governance terminus freeze", () => {
    const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
      env: { ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      tier2ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25BandAMarketProofExecutionSolePathExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "sole_path_without_terminus_freeze")).toBe(
      true,
    );
  });

  it("detects sole-path claiming P0 complete without honest artifact", () => {
    const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
      env: { ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_P0_PROOF_REFERENCED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
      p0StagingOverride: {
        version: "era17-p0-staging-proof-unblock-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        commitSha: null,
        overall: "SKIPPED",
        p0ProofStatus: "awaiting_ops_credentials",
        defaultProofStatus: "awaiting_ops_credentials",
        allMissingEnvVars: ["VAULT_KEY"],
        children: {
          ssoIdpStaging: {
            smokeScript: "smoke:enterprise-sso-idp-staging",
            artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
            overall: null,
            proofStatus: null,
            missingEnvVars: [],
          },
          stagingWorkflowsFirstGreen: {
            smokeScript: "smoke:staging-workflows-first-green",
            artifactPath: "artifacts/staging-workflows-first-green-summary.json",
            overall: null,
            proofStatus: null,
            missingEnvVars: [],
          },
          channelLive: {
            smokeScript: "smoke:woo-shopify-live",
            artifactPath: "artifacts/channel-live-smoke-summary.json",
            overall: null,
            proofStatus: null,
            missingEnvVars: [],
          },
        },
      },
    });
    expect(
      result.violations.some((row) => row.id === "sole_path_claims_p0_complete_without_artifact"),
    ).toBe(true);
  });

  it("detects frozen env mutation when sole-path path active", () => {
    const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
      env: {
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
        ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(
      result.violations.some((row) => row.id === "era25_frozen_env_mutation_after_sole_path"),
    ).toBe(true);
  });

  it("passes when sole-path env absent", () => {
    const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25BandAMarketProofExecutionSolePathExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
