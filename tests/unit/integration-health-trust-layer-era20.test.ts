import { describe, expect, it } from "vitest";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { buildIntegrationHealthChannelCards } from "@/lib/integrations/integration-health-channel-cards-era19";
import {
  applySmokeHonestyToChannelCard,
  buildIntegrationHealthP0TrustBanner,
  capIntegrationHealthStateToneForSmoke,
  enrichIntegrationHealthChannelCardsWithTrustLayer,
} from "@/lib/integrations/integration-health-trust-layer-era20";
import { INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID } from "@/lib/integrations/integration-health-trust-layer-era20-policy";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";

const p0Awaiting: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: [
    "E2E_STAGING_BASE_URL",
    "DATABASE_URL",
    "ENCRYPTION_KEY",
  ],
  children: {
    ssoIdpStaging: {
      smokeScript: "a",
      artifactPath: "a",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "b",
      artifactPath: "b",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "c",
      artifactPath: "c",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
  },
};

const channelSkipped: ChannelLiveSmokeSummary = {
  version: "era17-channel-live-smoke-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wooLiveProofStatus: "proof_skipped_missing_prerequisites",
  shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["DATABASE_URL", "ENCRYPTION_KEY", "CHANNEL_SMOKE_OWNER_EMAIL"],
  steps: [],
};

describe("integration-health-trust-layer-era20", () => {
  it("locks era20 trust layer policy id", () => {
    expect(INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID).toBe(
      "era20-integration-health-trust-layer-v1",
    );
  });

  it("caps healthy tone when smoke is SKIPPED", () => {
    expect(capIntegrationHealthStateToneForSmoke("healthy", "SKIPPED WITH REASON")).toBe(
      "degraded",
    );
    expect(capIntegrationHealthStateToneForSmoke("healthy", "FAILED")).toBe("down");
  });

  it("builds P0 trust banner when credentials missing", () => {
    const banner = buildIntegrationHealthP0TrustBanner(p0Awaiting);
    expect(banner?.visible).toBe(true);
    expect(banner?.missingCount).toBe(3);
    expect(banner?.headline).toContain("Phase 1 — Staging login");
    expect(banner?.headline).toContain("E2E_STAGING_BASE_URL");
    expect(banner?.smokeScripts[0]).toContain("staging-workflows-first-green");
    expect(banner?.nextActions[0]?.href).toContain("commercial-pilot-ops");
    expect(banner?.honestyNote.toLowerCase()).toContain("skipped");
  });

  it("hides P0 banner when proof passed", () => {
    expect(
      buildIntegrationHealthP0TrustBanner({
        ...p0Awaiting,
        p0ProofStatus: "proof_passed",
        allMissingEnvVars: [],
      }),
    ).toBeNull();
  });

  it("never shows healthy on woo card when live smoke SKIPPED", () => {
    const cards = buildIntegrationHealthChannelCards({
      stripeConfigured: true,
      stripeMissingEnvVars: [],
      failedWebhookCount: 0,
      apiKeysActive: 1,
      channelSmoke: channelSkipped,
      p0Staging: p0Awaiting,
      cards: [
        {
          provider: "WOOCOMMERCE",
          status: "CONNECTED",
          lastSyncAt: new Date(),
          lastError: null,
          webhookHealth: "OK",
          mappingHealth: "OK",
        } as import("@/services/developer/integration-health-service").IntegrationHealthCard,
      ],
      liveProofSlices: [],
      sso: null,
    });
    const woo = cards.find((c) => c.id === "woocommerce");
    expect(woo?.smokeStatus).toBe("SKIPPED WITH REASON");
    expect(woo?.stateTone).not.toBe("healthy");
  });

  it("enriches channel cards model with trust slice", () => {
    const enriched = enrichIntegrationHealthChannelCardsWithTrustLayer(
      {
        policyId: "era19-integration-health-channel-cards-v1",
        loadedAt: "2026-05-28T00:00:00.000Z",
        headline: "test",
        cards: [
          applySmokeHonestyToChannelCard({
            id: "woocommerce",
            label: "WooCommerce",
            currentState: "CONNECTED",
            stateTone: "healthy",
            lastSyncLabel: null,
            lastError: null,
            smokeStatus: "SKIPPED WITH REASON",
            smokeDetail: "skipped",
            missingEnvVars: ["DATABASE_URL"],
            nextAction: null,
            supportGuidance: "test",
          }),
        ],
      },
      p0Awaiting,
    );
    expect(enriched.trustLayerPolicyId).toBe(INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID);
    expect(enriched.p0Trust?.missingEnvVars).toContain("E2E_STAGING_BASE_URL");
    expect(enriched.cards[0]?.stateTone).toBe("degraded");
    expect(enriched.headline).toContain("P0 blocked");
  });

  it("shows tier2 golden path banner when P0 passed and tier2 incomplete", () => {
    const p0Passed = { ...p0Awaiting, p0ProofStatus: "proof_passed", overall: "PASSED" };
    const enriched = enrichIntegrationHealthChannelCardsWithTrustLayer(
      {
        policyId: "era19-integration-health-channel-cards-v1",
        loadedAt: "2026-05-28T00:00:00.000Z",
        headline: "test",
        cards: [],
      },
      p0Passed,
      {
        version: "era20-tier2-staging-golden-path-v1",
        runAt: "2026-05-28T00:00:00.000Z",
        commitSha: null,
        overall: "SKIPPED",
        tier2ProofStatus: "awaiting_manual_phases",
        p0ProofStatus: "proof_passed",
        steps: [],
        missingManualEnvVars: ["TIER2_CHANNEL_WEBHOOK_MANUAL"],
        playbookDoc: "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md",
      },
    );
    expect(enriched.p0Trust).toBeNull();
    expect(enriched.tier2GoldenPath?.visible).toBe(true);
    expect(enriched.headline).toContain("manual");
  });
});
