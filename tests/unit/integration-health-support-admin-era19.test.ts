import { describe, expect, it } from "vitest";

import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildIntegrationHealthChannelCardsModel,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import { INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import {
  buildIntegrationHealthSmokeArtifactsModel,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import {
  buildIntegrationHealthSupportAdminModel,
  buildIntegrationHealthSupportAdminTriageRows,
  resolveIntegrationHealthSupportAdminMode,
  resolveIntegrationHealthSupportAdminVisibility,
} from "@/lib/integrations/integration-health-support-admin-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const goNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: ["P0 staging proof blocked"],
  warnings: [],
  customerExecutionStatus: "skipped_missing_customer",
  customerName: null,
  loiSignedDate: null,
  icpQualification: { qualified: false, disqualifiers: [], missingCriteria: [] },
  evidenceGates: [
    { id: "p0_staging_proof", label: "P0 staging proof", pass: false, reason: "awaiting_ops_credentials" },
  ],
  evaluatorInput: {
    tier0Pass: false,
    tier1Pass: false,
    tier2Pass: false,
    roleChecklistsComplete: false,
    forbiddenClaimsInContract: false,
    icpQualified: false,
    stagingUrl: null,
    commitSha: null,
  },
};

const p0Summary: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["E2E_STAGING_BASE_URL"],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["E2E_STAGING_BASE_URL"],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites/proof_skipped_missing_prerequisites",
      missingEnvVars: ["CHANNEL_SMOKE_OWNER_EMAIL"],
    },
  },
};

const commercialOps: CommercialPilotOpsStatusModel = {
  loadedAt: "2026-05-28T00:00:00.000Z",
  goNoGo: { artifactPresent: true, summary: goNoGo },
  p0Staging: { artifactPresent: true, summary: p0Summary },
};

const channelCards = buildIntegrationHealthChannelCardsModel({
  stripeConfigured: false,
  stripeMissingEnvVars: ["STRIPE_SECRET_KEY"],
  failedWebhookCount: 2,
  apiKeysActive: 0,
  channelSmoke: null,
  p0Staging: p0Summary,
  cards: [
    {
      id: "conn-1",
      provider: "WOOCOMMERCE",
      name: "Woo store",
      status: "ERROR",
      lastSyncAt: null,
      lastError: "401 unauthorized",
      hasWebhookSecret: false,
    },
  ],
  liveProofSlices: [],
  sso: { entitlementEnabled: true, configured: false, active: false },
});

const smokeArtifacts = buildIntegrationHealthSmokeArtifactsModel({
  channelLive: null,
  p0Staging: p0Summary,
  stagingWorkflows: null,
});

describe("integration-health-support-admin-era19", () => {
  it("shows panel only for platform bypass or support triage roles", () => {
    expect(
      resolveIntegrationHealthSupportAdminVisibility({
        platformBypass: false,
        canTriageSupport: false,
      }),
    ).toBe(false);
    expect(
      resolveIntegrationHealthSupportAdminVisibility({
        platformBypass: true,
        canTriageSupport: false,
      }),
    ).toBe(true);
    expect(
      resolveIntegrationHealthSupportAdminVisibility({
        platformBypass: false,
        canTriageSupport: true,
      }),
    ).toBe(true);
  });

  it("uses platform mode for platform bypass and support mode otherwise", () => {
    expect(resolveIntegrationHealthSupportAdminMode({ platformBypass: true })).toBe("platform");
    expect(resolveIntegrationHealthSupportAdminMode({ platformBypass: false })).toBe("support");
  });

  it("builds tenant-scoped triage rows with workspace links in support mode", () => {
    const rows = buildIntegrationHealthSupportAdminTriageRows({
      mode: "support",
      commercialOps,
      channelCards,
      smokeArtifacts,
      failedWebhookCount: 2,
    });

    expect(rows.some((row) => row.category === "commercial")).toBe(true);
    expect(rows.some((row) => row.id === "channel-woocommerce")).toBe(true);
    expect(rows.some((row) => row.href === LAUNCH_WIZARD_ROUTE)).toBe(true);
    expect(rows.every((row) => row.href.startsWith("/dashboard") || row.href.startsWith("/platform"))).toBe(
      true,
    );
  });

  it("includes platform implementation links only in platform mode", () => {
    const supportModel = buildIntegrationHealthSupportAdminModel({
      visible: true,
      mode: "support",
      workspaceId: "ws-123",
      businessName: "Pilot Kitchen",
      connectionCount: 1,
      errorConnectionCount: 1,
      failedWebhookCount: 2,
      commercialOps,
      channelCards,
      smokeArtifacts,
    });
    const platformModel = buildIntegrationHealthSupportAdminModel({
      visible: true,
      mode: "platform",
      workspaceId: "ws-123",
      businessName: "Pilot Kitchen",
      connectionCount: 1,
      errorConnectionCount: 1,
      failedWebhookCount: 2,
      commercialOps,
      channelCards,
      smokeArtifacts,
    });

    expect(supportModel.platformLinks).toHaveLength(0);
    expect(platformModel.platformLinks.some((link) => link.href.startsWith("/platform"))).toBe(true);
    expect(platformModel.commercialDecisionLabel).toContain("NO-GO");
    expect(platformModel.p0MissingEnvVarCount).toBe(2);
    expect(platformModel.tenantContext.workspaceId).toBe("ws-123");
  });

  it("returns hidden model shell when not visible", () => {
    const model = buildIntegrationHealthSupportAdminModel({
      visible: false,
      mode: "support",
      workspaceId: null,
      businessName: null,
      connectionCount: 0,
      errorConnectionCount: 0,
      failedWebhookCount: 0,
      commercialOps: null,
      channelCards: {
        policyId: INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID,
        loadedAt: "2026-05-28T00:00:00.000Z",
        headline: "No channels",
        cards: [],
      },
      smokeArtifacts,
    });

    expect(model.visible).toBe(false);
    expect(model.triageRows).toHaveLength(0);
  });
});
