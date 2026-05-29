import { describe, expect, it } from "vitest";

import {
  buildCommercialGoClosureUiSlice,
  formatCommercialGoClosureProgressLabel,
} from "@/lib/commercial/commercial-go-closure-ui-era21";

describe("commercial-go-closure-ui-era21", () => {
  it("visible when tier2 passed and decision not GO", () => {
    const slice = buildCommercialGoClosureUiSlice({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "NO-GO",
        blockers: ["No signed LOI"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: {
          qualified: false,
          missingCriteria: [],
          disqualifiers: [],
        },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          tier3Pass: false,
          roleChecklistsComplete: false,
          forbiddenClaimsInContract: false,
          icpQualified: false,
          stagingUrl: null,
          commitSha: null,
        },
      },
    });
    expect(slice?.blocked).toBe(true);
    expect(slice?.phases.length).toBe(5);
    expect(slice?.goClosureMilestone).toBe("awaiting_icp_qualification");
    expect(slice?.postTier2OrchestratorCommand).toContain(
      "ops:run-commercial-go-closure-post-tier2-orchestrator",
    );
    expect(formatCommercialGoClosureProgressLabel(slice!)).toContain("NO-GO");
  });

  it("visible when decision GO but integrity fails", () => {
    const slice = buildCommercialGoClosureUiSlice({
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "GO",
        blockers: ["No signed LOI"],
        warnings: [],
        customerExecutionStatus: "skipped_missing_customer",
        customerName: null,
        loiSignedDate: null,
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: false, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [],
        evaluatorInput: {
          tier0Pass: true,
          tier1Pass: true,
          tier2Pass: true,
          roleChecklistsComplete: true,
          forbiddenClaimsInContract: true,
          icpQualified: true,
        },
      },
    });
    expect(slice?.goIntegrityFailed).toBe(true);
    expect(slice?.blocked).toBe(true);
  });

  it("hidden when decision is GO", () => {
    expect(
      buildCommercialGoClosureUiSlice({
        p0ProofStatus: "proof_passed",
        tier2ProofStatus: "proof_passed",
        goNoGoSummary: {
          version: "era17-pilot-gono-go-v1",
          runAt: new Date().toISOString(),
          decision: "GO",
          blockers: [],
          warnings: [],
          customerExecutionStatus: "recorded",
          customerName: "Acme",
          loiSignedDate: "2026-06-01",
          prospectExecutionStatus: "none",
          prospectName: null,
          icpQualification: {
            qualified: true,
            missingCriteria: [],
            disqualifiers: [],
          },
          evidenceGates: [
            { id: "tier0", label: "Tier 0", pass: true, reason: "ok" },
            { id: "tier1", label: "Tier 1", pass: true, reason: "ok" },
            { id: "tier2", label: "Tier 2", pass: true, reason: "ok" },
            { id: "icp_qualification", label: "ICP", pass: true, reason: "ok" },
            {
              id: "forbidden_claims_enforcement",
              label: "Forbidden claims",
              pass: true,
              reason: "ok",
            },
            { id: "p0_staging_proof", label: "P0", pass: true, reason: "ok" },
          ],
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
        },
      }),
    ).toBeNull();
  });
});
