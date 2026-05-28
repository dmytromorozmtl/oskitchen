import { describe, expect, it } from "vitest";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildIntegrationHealthChannelCards,
  buildIntegrationHealthChannelCardsModel,
  buildPublicApiChannelCard,
  buildStripeChannelCard,
  buildWebhooksChannelCard,
  listStripeMissingEnvVars,
  summarizeIntegrationHealthChannelCards,
} from "@/lib/integrations/integration-health-channel-cards-era19";
import { INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";

const channelSkipped: ChannelLiveSmokeSummary = {
  version: "era17-channel-live-smoke-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  overall: "SKIPPED",
  wooLiveProofStatus: "proof_skipped_missing_prerequisites",
  shopifyLiveProofStatus: "proof_skipped_missing_prerequisites",
  missingEnvVars: ["DATABASE_URL"],
  steps: [],
};

const p0Skipped: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: [],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "a",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: ["SSO_STAGING_WORKSPACE_ID"],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "b",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "c",
      overall: "SKIPPED",
      proofStatus: null,
      missingEnvVars: [],
    },
  },
};

describe("integration health channel cards era19", () => {
  it("locks era19 channel cards policy id", () => {
    expect(INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID).toBe(
      "era19-integration-health-channel-cards-v1",
    );
  });

  it("lists stripe missing env vars honestly", () => {
    expect(
      listStripeMissingEnvVars({ secretKey: null, webhookSecret: "x", publishableKey: null }),
    ).toEqual(["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]);
  });

  it("builds stripe card as down when keys missing", () => {
    const card = buildStripeChannelCard({
      stripeConfigured: false,
      stripeMissingEnvVars: ["STRIPE_SECRET_KEY"],
    });
    expect(card.stateTone).toBe("down");
    expect(card.missingEnvVars).toContain("STRIPE_SECRET_KEY");
  });

  it("builds webhook card urgent when backlog exists", () => {
    const card = buildWebhooksChannelCard({ failedWebhookCount: 3 });
    expect(card.stateTone).toBe("down");
    expect(card.nextAction?.tone).toBe("urgent");
  });

  it("builds public api card without SLA claim", () => {
    const card = buildPublicApiChannelCard({ apiKeysActive: 0 });
    expect(card.smokeDetail).toContain("no SLA");
  });

  it("builds woo/shopify cards with SKIPPED smoke status", () => {
    const cards = buildIntegrationHealthChannelCards({
      stripeConfigured: true,
      stripeMissingEnvVars: [],
      failedWebhookCount: 0,
      apiKeysActive: 1,
      channelSmoke: channelSkipped,
      p0Staging: p0Skipped,
      cards: [],
      liveProofSlices: [],
      sso: { entitlementEnabled: true, configured: false, active: false },
    });

    const woo = cards.find((card) => card.id === "woocommerce");
    const shopify = cards.find((card) => card.id === "shopify");
    const sso = cards.find((card) => card.id === "sso");

    expect(woo?.smokeStatus).toBe("SKIPPED WITH REASON");
    expect(shopify?.smokeStatus).toBe("SKIPPED WITH REASON");
    expect(sso?.smokeStatus).toBe("SKIPPED WITH REASON");
    expect(sso?.missingEnvVars).toContain("SSO_STAGING_WORKSPACE_ID");
  });

  it("summarizes degraded headline when smoke blocked", () => {
    const cards = buildIntegrationHealthChannelCards({
      stripeConfigured: false,
      stripeMissingEnvVars: ["STRIPE_SECRET_KEY"],
      failedWebhookCount: 0,
      apiKeysActive: 0,
      channelSmoke: channelSkipped,
      p0Staging: null,
      cards: [],
      liveProofSlices: [],
      sso: null,
    });
    expect(summarizeIntegrationHealthChannelCards(cards)).toContain("down");
  });

  it("builds model with headline", () => {
    const model = buildIntegrationHealthChannelCardsModel({
      stripeConfigured: true,
      stripeMissingEnvVars: [],
      failedWebhookCount: 0,
      apiKeysActive: 2,
      channelSmoke: null,
      p0Staging: null,
      cards: [],
      liveProofSlices: [],
      sso: null,
    });
    expect(model.cards.length).toBeGreaterThanOrEqual(5);
    expect(model.headline.length).toBeGreaterThan(0);
  });
});
