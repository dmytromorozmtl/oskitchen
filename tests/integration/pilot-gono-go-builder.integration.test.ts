import { describe, expect, it } from "vitest";

import {
  buildPilotGoNoGoSummary,
  recomputePilotGoNoGoDecisionFromSummary,
  type PilotForbiddenClaimsEnforcementArtifact,
  type PilotGoldenPathArtifact,
  type PilotP0StagingProofArtifact,
  type PilotSsoPilotReadyGateArtifact,
  type PilotTierPreflightArtifact,
} from "@/lib/commercial/pilot-gono-go-summary";
import type {
  PilotMetricsBaselineGoNoGoArtifact,
  PilotRollbackDrillGoNoGoArtifact,
} from "@/lib/commercial/era20-pilot-execution-readiness";
import { ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT } from "@/lib/commercial/era20-pilot-icp-qualification-bridge-era20";

/**
 * Pilot GO/NO-GO builder integration — P0 smoke artifacts → honest decision.
 *
 * @see lib/commercial/pilot-gono-go-summary.ts
 * @see scripts/smoke-pilot-gono-go-era17.ts
 */

const P0_EVIDENCE_GATE_IDS = [
  "p0_staging_proof",
  "p0_sso_idp",
  "p0_staging_workflows",
  "p0_channel_live",
] as const;

const QUALIFIED_ICP_JSON = JSON.stringify(ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT);

export function buildAllP0SmokesPassingArtifact(): PilotP0StagingProofArtifact {
  return {
    overall: "PASSED",
    p0ProofStatus: "proof_passed",
    allMissingEnvVars: [],
    children: {
      ssoIdpStaging: { overall: "PASSED", proofStatus: "proof_passed" },
      stagingWorkflowsFirstGreen: { overall: "PASSED", proofStatus: "proof_passed" },
      channelLive: { overall: "PASSED", proofStatus: "proof_passed" },
    },
  };
}

export function buildGoReadyPilotArtifacts(): {
  preflight: PilotTierPreflightArtifact;
  goldenPath: PilotGoldenPathArtifact;
  forbiddenClaimsEnforcement: PilotForbiddenClaimsEnforcementArtifact;
  p0StagingProof: PilotP0StagingProofArtifact;
  ssoPilotReadyGate: PilotSsoPilotReadyGateArtifact;
  metricsBaseline: PilotMetricsBaselineGoNoGoArtifact;
  rollbackDrill: PilotRollbackDrillGoNoGoArtifact;
} {
  return {
    preflight: {
      overall: "PASSED",
      tier0ProofStatus: "proof_passed",
      tier1ProofStatus: "proof_passed",
      commitSha: "deadbeef",
    },
    goldenPath: {
      overall: "PASSED",
      phaseProofStatus: "proof_passed",
      signOffTemplate: {
        stagingUrl: "https://staging.os-kitchen.com",
        commitSha: "deadbeef",
        operatorEmail: "ops@os-kitchen.com",
      },
    },
    forbiddenClaimsEnforcement: {
      overall: "PASSED",
      claimsEnforcementProofStatus: "proof_passed",
      commitSha: "deadbeef",
    },
    p0StagingProof: buildAllP0SmokesPassingArtifact(),
    ssoPilotReadyGate: {
      ssoDeliveryStatus: "pilot_ready",
      promotionAllowed: true,
      gateOutcome: "pilot_ready",
    },
    metricsBaseline: {
      overall: "PASSED",
      baselineProofStatus: "proof_passed",
      capturedCount: 5,
      missingCount: 0,
    },
    rollbackDrill: {
      rollbackProofStatus: "proof_passed",
      drillMode: "tabletop",
      passedStepCount: 6,
      totalSteps: 6,
    },
  };
}

describe("pilot GO/NO-GO builder integration", () => {
  it("returns GO when all P0 smokes and tier gates pass with customer on record", () => {
    const artifacts = buildGoReadyPilotArtifacts();
    const summary = buildPilotGoNoGoSummary({
      ...artifacts,
      icpInput: ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT,
      icpEnvRaw: QUALIFIED_ICP_JSON,
      roleChecklistsComplete: true,
      forbiddenClaimsInContract: false,
      tier3Pass: true,
      customerName: "Acme Commissary",
      loiSignedDate: "2026-05-28",
    });

    expect(summary.decision).toBe("GO");
    expect(summary.blockers).toEqual([]);
    expect(summary.warnings).toEqual([]);
    expect(summary.customerExecutionStatus).toBe("recorded");

    for (const gateId of P0_EVIDENCE_GATE_IDS) {
      const gate = summary.evidenceGates.find((row) => row.id === gateId);
      expect(gate, `missing gate ${gateId}`).toBeDefined();
      expect(gate!.pass, `${gateId} reason: ${gate!.reason}`).toBe(true);
    }

    expect(recomputePilotGoNoGoDecisionFromSummary(summary)).toBe("GO");
  });

  it("returns NO-GO when P0 channel live smoke fails while other gates pass", () => {
    const artifacts = buildGoReadyPilotArtifacts();
    const p0StagingProof: PilotP0StagingProofArtifact = {
      ...artifacts.p0StagingProof,
      overall: "FAILED",
      p0ProofStatus: "proof_failed",
      children: {
        ...artifacts.p0StagingProof.children,
        channelLive: {
          overall: "FAILED",
          proofStatus: "proof_failed",
          missingEnvVars: ["SHOPIFY_SMOKE_ACCESS_TOKEN"],
        },
      },
    };

    const summary = buildPilotGoNoGoSummary({
      ...artifacts,
      p0StagingProof,
      icpInput: ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT,
      icpEnvRaw: QUALIFIED_ICP_JSON,
      roleChecklistsComplete: true,
      forbiddenClaimsInContract: false,
      tier3Pass: true,
      customerName: "Acme Commissary",
      loiSignedDate: "2026-05-28",
    });

    expect(summary.decision).toBe("NO-GO");
    expect(summary.blockers.some((item) => item.includes("P0 staging proof not passed"))).toBe(true);

    const channelGate = summary.evidenceGates.find((row) => row.id === "p0_channel_live");
    expect(channelGate?.pass).toBe(false);
    expect(recomputePilotGoNoGoDecisionFromSummary(summary)).toBe("NO-GO");
  });

  it("returns NO-GO when SSO IdP P0 smoke fails", () => {
    const artifacts = buildGoReadyPilotArtifacts();
    const p0StagingProof: PilotP0StagingProofArtifact = {
      ...artifacts.p0StagingProof,
      overall: "SKIPPED",
      p0ProofStatus: "awaiting_ops_credentials",
      children: {
        ...artifacts.p0StagingProof.children,
        ssoIdpStaging: {
          overall: "SKIPPED",
          proofStatus: "proof_skipped_missing_prerequisites",
          missingEnvVars: ["SSO_STAGING_OPERATOR_EMAIL"],
        },
      },
    };

    const summary = buildPilotGoNoGoSummary({
      ...artifacts,
      p0StagingProof,
      icpInput: ERA20_PILOT_ICP_QUALIFIED_EXAMPLE_INPUT,
      icpEnvRaw: QUALIFIED_ICP_JSON,
      roleChecklistsComplete: true,
      forbiddenClaimsInContract: false,
      tier3Pass: true,
      customerName: "Acme Commissary",
      loiSignedDate: "2026-05-28",
    });

    expect(summary.decision).toBe("NO-GO");
    const ssoGate = summary.evidenceGates.find((row) => row.id === "p0_sso_idp");
    expect(ssoGate?.pass).toBe(false);
  });
});
