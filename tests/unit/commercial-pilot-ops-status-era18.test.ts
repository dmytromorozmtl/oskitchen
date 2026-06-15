import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_OPS_STATUS_ERA18_BACKLOG_ID,
  COMMERCIAL_PILOT_OPS_STATUS_ERA18_POLICY_ID,
  COMMERCIAL_PILOT_OPS_STATUS_ERA18_PROOF_STATUS,
} from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import {
  buildCommercialPilotOpsGateRows,
  buildCommercialPilotOpsStatusModel,
  formatCommercialPilotOpsDecisionLabel,
  pickCommercialPilotOpsAttentionItems,
  resolveCommercialPilotOpsDecision,
  summarizeCommercialPilotOpsStatus,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { buildP0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";

const sampleGoNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T16:01:05.375Z",
  decision: "NO-GO",
  blockers: ["Tier 0 engineering CI gate failed", "P0 staging proof not passed"],
  warnings: ["Staging URL not recorded in evidence pack"],
  customerExecutionStatus: "skipped_missing_customer",
  customerName: null,
  loiSignedDate: null,
  icpQualification: {
    qualified: false,
    disqualifiers: [],
    missingCriteria: ["Owner engaged in onboarding"],
  },
  evidenceGates: [
    {
      id: "tier0",
      label: "Tier 0 engineering gate",
      pass: false,
      reason: "tier0ProofStatus=proof_failed",
    },
    {
      id: "p0_staging_proof",
      label: "P0 staging proof (SSO + GitHub + channel)",
      pass: false,
      reason: "p0ProofStatus=proof_failed",
    },
    {
      id: "tier1",
      label: "Tier 1 staging readiness",
      pass: true,
      reason: "tier1ProofStatus proof_passed",
    },
  ],
  evaluatorInput: {
    tier0Pass: false,
    tier1Pass: true,
    tier2Pass: false,
    roleChecklistsComplete: false,
    forbiddenClaimsInContract: false,
    icpQualified: false,
    stagingUrl: null,
    commitSha: "abc123",
  },
};

const sampleP0: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T15:54:32.553Z",
  commitSha: null,
  overall: "FAILED",
  p0ProofStatus: "proof_failed",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["E2E_STAGING_BASE_URL", "DATABASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: "FAILED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["E2E_STAGING_BASE_URL"],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["E2E_LOGIN_EMAIL"],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites/proof_skipped_missing_prerequisites",
      missingEnvVars: ["DATABASE_URL"],
    },
  },
};

function modelWith(over: {
  goNoGo?: Partial<{ artifactPresent: boolean; summary: PilotGoNoGoSummary | null }>;
  p0Staging?: Partial<{ artifactPresent: boolean; summary: P0StagingProofUnblockSummary | null }>;
  vaultReadiness?: Partial<{ artifactPresent: boolean; report: VaultReadinessReport | null }>;
}) {
  return buildCommercialPilotOpsStatusModel({
    goNoGo: {
      artifactPresent: over.goNoGo?.artifactPresent ?? true,
      summary: over.goNoGo?.summary ?? sampleGoNoGo,
    },
    p0Staging: {
      artifactPresent: over.p0Staging?.artifactPresent ?? true,
      summary: over.p0Staging?.summary ?? sampleP0,
    },
    vaultReadiness: {
      artifactPresent: over.vaultReadiness?.artifactPresent ?? false,
      report: over.vaultReadiness?.report ?? null,
    },
  });
}

describe("commercial-pilot-ops-status-era18 policy", () => {
  it("registers era18 commercial pilot ops status proof", () => {
    expect(COMMERCIAL_PILOT_OPS_STATUS_ERA18_POLICY_ID).toBe(
      "era18-commercial-pilot-ops-status-v1",
    );
    expect(COMMERCIAL_PILOT_OPS_STATUS_ERA18_PROOF_STATUS).toBe(
      "commercial_pilot_ops_status_panel_wired",
    );
    expect(COMMERCIAL_PILOT_OPS_STATUS_ERA18_BACKLOG_ID).toBe("KOS-E18-052");
  });
});

describe("resolveCommercialPilotOpsDecision", () => {
  it("returns UNKNOWN when artifact missing", () => {
    expect(
      resolveCommercialPilotOpsDecision({ artifactPresent: false, summary: null }),
    ).toBe("UNKNOWN");
  });

  it("returns NO-GO from artifact without faking GO", () => {
    expect(resolveCommercialPilotOpsDecision({ artifactPresent: true, summary: sampleGoNoGo })).toBe(
      "NO-GO",
    );
  });

  it("returns GO only when artifact says GO", () => {
    expect(
      resolveCommercialPilotOpsDecision({
        artifactPresent: true,
        summary: { ...sampleGoNoGo, decision: "GO", blockers: [] },
      }),
    ).toBe("GO");
  });
});

describe("pickCommercialPilotOpsAttentionItems", () => {
  it("surfaces NO-GO and P0 staging blockers first", () => {
    const items = pickCommercialPilotOpsAttentionItems(modelWith({}));

    expect(items.some((item) => item.id === "gono-go-no-go")).toBe(true);
    expect(items.some((item) => item.id === "p0-staging-blocked")).toBe(true);
    expect(items[0]?.tone).toBe("urgent");
  });

  it("surfaces missing artifact guidance without claiming PASS", () => {
    const items = pickCommercialPilotOpsAttentionItems(
      modelWith({
        goNoGo: { artifactPresent: false, summary: null },
        p0Staging: { artifactPresent: false, summary: null },
      }),
    );

    expect(items.some((item) => item.id === "gono-go-artifact-missing")).toBe(true);
    expect(items.some((item) => item.id === "p0-artifact-missing")).toBe(true);
  });

  it("prioritizes vault phased P0 blocker when vault report has next phase", () => {
    const p0Summary = buildP0StagingProofUnblockSummary({
      ssoArtifact: { overall: "SKIPPED", loginProofStatus: "proof_skipped" },
      workflowsArtifact: { overall: "SKIPPED", firstGreenProofStatus: "proof_skipped" },
      channelArtifact: {
        overall: "SKIPPED",
        wooLiveProofStatus: "proof_skipped",
        shopifyLiveProofStatus: "proof_skipped",
      },
    });
    const items = pickCommercialPilotOpsAttentionItems(
      modelWith({
        p0Staging: { artifactPresent: true, summary: p0Summary },
        vaultReadiness: {
          artifactPresent: true,
          report: {
            version: "vault-readiness-v2",
            generatedAt: "2026-05-28T00:00:00.000Z",
            policyId: "era17-p0-staging-proof-unblock-v1",
            opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
            vaultMatrixDoc: "docs/ops-vault-matrix.md",
            vaultReady: false,
            presentCount: 0,
            totalCount: 11,
            missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
            day0Milestone: "blocked",
            day0PartialComplete: false,
            p0ProofStatus: "awaiting_ops_credentials",
            p0ArtifactOverall: "SKIPPED",
            nextPhase: {
              id: "staging_login",
              label: "Phase 1 — Staging login",
              complete: false,
              presentKeys: [],
              missingKeys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
              docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
              smokeScripts: ["smoke:staging-workflows-first-green"],
            },
            phases: [],
            childSmokes: [],
            recommendedNextSteps: [],
            secrets: [],
            honestyNote: "test",
          },
        },
      }),
    );
    const p0Item = items.find((item) => item.id === "p0-staging-blocked");
    expect(p0Item?.title).toContain("Staging login");
    expect(p0Item?.detail).toContain("GITHUB_E2E_STAGING_SECRETS.md");
    expect(p0Item?.href).toContain("p0-staging-proof");
    expect(items[0]?.id).toBe("p0-staging-blocked");
  });
});

describe("buildCommercialPilotOpsGateRows", () => {
  it("includes next actions for failed P0 gate", () => {
    const rows = buildCommercialPilotOpsGateRows(modelWith({}));
    const p0Row = rows.find((row) => row.id === "p0_staging_proof");

    expect(p0Row?.pass).toBe(false);
    expect(p0Row?.nextAction?.href).toContain("#p0-staging-proof");
  });
});

describe("formatCommercialPilotOpsDecisionLabel", () => {
  it("uses honest labels for each decision state", () => {
    expect(formatCommercialPilotOpsDecisionLabel("NO-GO")).toContain("NO-GO");
    expect(formatCommercialPilotOpsDecisionLabel("UNKNOWN")).toContain("smoke:pilot-gono-go");
    expect(formatCommercialPilotOpsDecisionLabel("GO")).toContain("GO");
  });
});

describe("summarizeCommercialPilotOpsStatus", () => {
  it("marks urgent when decision is not GO", () => {
    const summary = summarizeCommercialPilotOpsStatus(modelWith({}));
    expect(summary.hasUrgent).toBe(true);
    expect(summary.decision).toBe("NO-GO");
  });
});
