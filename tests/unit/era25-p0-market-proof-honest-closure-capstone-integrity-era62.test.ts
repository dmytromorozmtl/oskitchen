import { describe, expect, it } from "vitest";

import { evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";

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

describe("era25-p0-market-proof-honest-closure-capstone-integrity-era62", () => {
  it("detects closure started without Band A sole-path lock", () => {
    const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
      env: { ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED: "1" },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "proof_passed",
    });
    expect(result.integrityPassed).toBe(false);
    expect(result.era25P0MarketProofHonestClosureCapstoneExecutionStarted).toBe(true);
    expect(result.violations.some((row) => row.id === "closure_without_sole_path")).toBe(true);
  });

  it("detects closure claiming proof_passed without honest artifact", () => {
    const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
      env: { ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_REPORT_REVIEWED: "1" },
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
      result.violations.some((row) => row.id === "closure_claims_proof_passed_without_artifact"),
    ).toBe(true);
  });

  it("detects closure attested before proof_passed artifact", () => {
    const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
      env: {
        ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ERA25_ATTESTED: "1",
        ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ERA25_ATTESTED: "1",
      },
      goNoGoOverride: honestGo,
      p0ProofStatusOverride: "awaiting_ops_credentials",
    });
    expect(
      result.violations.some((row) => row.id === "closure_attested_before_proof_passed_artifact"),
    ).toBe(true);
  });

  it("passes when closure capstone env absent", () => {
    const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity(process.cwd(), {
      env: {},
      goNoGoOverride: honestGo,
    });
    expect(result.era25P0MarketProofHonestClosureCapstoneExecutionStarted).toBe(false);
    expect(result.integrityPassed).toBe(true);
  });
});
