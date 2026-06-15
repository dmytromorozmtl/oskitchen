import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingP0OpsVaultAction,
  mergeBriefingP0OpsVaultTopActions,
  P0_OPS_VAULT_BRIEFING_ACTION_PRIORITY,
} from "@/lib/briefing/owner-daily-briefing-p0-ops-vault-era21";
import { buildP0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";

const blockedSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: new Date().toISOString(),
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["E2E_STAGING_BASE_URL", "DATABASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "a",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "b",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "c",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
  },
} as const;

describe("owner-daily-briefing-p0-ops-vault-era21", () => {
  it("builds critical ranked action when ops vault blocked", () => {
    const slice = buildP0OpsVaultUiSlice(blockedSummary);
    const action = buildOwnerDailyBriefingP0OpsVaultAction(slice);
    expect(action?.severity).toBe("critical");
    expect(action?.priority).toBe(P0_OPS_VAULT_BRIEFING_ACTION_PRIORITY);
    expect(action?.title).toContain("Staging login");
    expect(action?.reason).toContain("E2E_STAGING_BASE_URL");
    expect(action?.href).toContain("commercial-pilot-ops");
    expect(action?.ctaLabel).toContain("VP Ops");
    expect(action?.unblockCondition).toContain("vault-readiness-report.json");
  });

  it("returns null when proof passed", () => {
    expect(
      buildOwnerDailyBriefingP0OpsVaultAction(
        buildP0OpsVaultUiSlice({
          ...blockedSummary,
          p0ProofStatus: "proof_passed",
          overall: "PASSED",
          allMissingEnvVars: [],
          children: {
            ...blockedSummary.children,
            ssoIdpStaging: { ...blockedSummary.children.ssoIdpStaging, proofStatus: "proof_passed" },
            stagingWorkflowsFirstGreen: {
              ...blockedSummary.children.stagingWorkflowsFirstGreen,
              proofStatus: "proof_passed",
            },
            channelLive: { ...blockedSummary.children.channelLive, proofStatus: "proof_passed" },
          },
        }),
      ),
    ).toBeNull();
  });

  it("merges ops vault action ahead of lower-priority actions", () => {
    const slice = buildP0OpsVaultUiSlice(blockedSummary);
    const opsAction = buildOwnerDailyBriefingP0OpsVaultAction(slice)!;
    const merged = mergeBriefingP0OpsVaultTopActions(opsAction, [
      {
        id: "other",
        title: "Other",
        reason: "r",
        severity: "normal",
        ownerRole: "owner",
        href: "/x",
        status: "open",
        unblockCondition: "u",
        priority: 5,
        ctaLabel: "Go",
        tone: "normal",
      },
    ]);
    expect(merged[0]?.id).toBe("p0-ops-vault-day0");
  });
});
