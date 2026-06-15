import type { IntegrationProvider } from "@prisma/client";

import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  integrationConnectionSetupHref,
  resolveIntegrationHealthRowNextAction,
  type IntegrationHealthRowNextAction,
} from "@/lib/integrations/integration-health-focus-era18";
import type { ChannelPilotLiveProofSlice } from "@/lib/integrations/integration-health-live-proof-focus-era18";
import {
  channelPilotProviderLabel,
  formatChannelLiveProofOperatorStatus,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import {
  normalizeSmokeArtifactOverall,
  type IntegrationHealthSmokeDisplayStatus,
} from "@/lib/integrations/integration-health-smoke-artifacts-era19";
import type { ChannelLiveSmokeSummary } from "@/lib/integrations/channel-live-smoke-summary";
import type { IntegrationHealthCard } from "@/services/developer/integration-health-service";
import { formatPilotIntegrationLastSync } from "@/lib/integrations/pilot-integration-health-strip-era18";

export const INTEGRATION_HEALTH_CHANNEL_CARDS_AGGREGATOR_ERA19_POLICY_ID =
  "era19-integration-health-channel-cards-aggregator-v1" as const;

export type IntegrationHealthChannelCardStateTone =
  | "healthy"
  | "degraded"
  | "down"
  | "neutral";

export type IntegrationHealthChannelCard = {
  id: string;
  label: string;
  currentState: string;
  stateTone: IntegrationHealthChannelCardStateTone;
  lastSyncLabel: string | null;
  lastError: string | null;
  smokeStatus: IntegrationHealthSmokeDisplayStatus | null;
  smokeDetail: string | null;
  missingEnvVars: string[];
  nextAction: IntegrationHealthRowNextAction | null;
  supportGuidance: string;
};

export type IntegrationHealthChannelCardsModel = {
  policyId: typeof INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID;
  loadedAt: string;
  headline: string;
  cards: IntegrationHealthChannelCard[];
};

export type IntegrationHealthChannelCardsInput = {
  stripeConfigured: boolean;
  stripeMissingEnvVars: readonly string[];
  failedWebhookCount: number;
  apiKeysActive: number;
  channelSmoke: ChannelLiveSmokeSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  cards: readonly IntegrationHealthCard[];
  liveProofSlices: readonly ChannelPilotLiveProofSlice[];
  sso: {
    entitlementEnabled: boolean;
    configured: boolean;
    active: boolean;
  } | null;
};

function cardForProvider(
  cards: readonly IntegrationHealthCard[],
  provider: IntegrationProvider,
): IntegrationHealthCard | null {
  return cards.find((row) => row.provider === provider) ?? null;
}

function liveProofForProvider(
  slices: readonly ChannelPilotLiveProofSlice[],
  provider: "WOOCOMMERCE" | "SHOPIFY",
): ChannelPilotLiveProofSlice | null {
  return slices.find((slice) => slice.provider === provider) ?? null;
}

function mapProviderProofStatus(
  proofStatus: string | null | undefined,
): IntegrationHealthSmokeDisplayStatus | null {
  if (!proofStatus) return null;
  if (proofStatus === "proof_passed") return "PASSED";
  if (proofStatus === "proof_failed") return "FAILED";
  if (proofStatus.includes("skipped")) return "SKIPPED WITH REASON";
  return null;
}

function connectionStateTone(
  status: IntegrationHealthCard["status"] | null,
): IntegrationHealthChannelCardStateTone {
  if (!status) return "neutral";
  if (status === "CONNECTED") return "healthy";
  if (status === "ERROR") return "down";
  return "degraded";
}

function buildPilotChannelCard(input: {
  provider: "WOOCOMMERCE" | "SHOPIFY";
  connection: IntegrationHealthCard | null;
  liveProof: ChannelPilotLiveProofSlice | null;
  channelSmoke: ChannelLiveSmokeSummary | null;
}): IntegrationHealthChannelCard {
  const label = channelPilotProviderLabel(input.provider);
  const proofStatus =
    input.provider === "WOOCOMMERCE"
      ? input.channelSmoke?.wooLiveProofStatus
      : input.channelSmoke?.shopifyLiveProofStatus;

  let smokeStatus = mapProviderProofStatus(proofStatus);
  let smokeDetail: string | null = null;
  if (input.channelSmoke) {
    smokeStatus = smokeStatus ?? normalizeSmokeArtifactOverall(input.channelSmoke.overall);
    smokeDetail =
      smokeStatus === "PASSED"
        ? "Engineering live smoke passed for aggregate run — not a marketplace LIVE claim."
        : smokeStatus === "FAILED"
          ? "Engineering live smoke failed — review mapping and credentials."
          : input.channelSmoke.missingEnvVars.length > 0
            ? `SKIPPED — missing ${input.channelSmoke.missingEnvVars.join(", ")}`
            : "Engineering live smoke SKIPPED WITH REASON.";
  }

  let currentState: string;
  if (!input.connection) {
    currentState = input.liveProof
      ? formatChannelLiveProofOperatorStatus(input.liveProof.operatorStatus)
      : "No saved connection";
  } else {
    currentState = input.connection.status.replaceAll("_", " ");
    if (input.liveProof) {
      currentState = `${currentState} · ${formatChannelLiveProofOperatorStatus(input.liveProof.operatorStatus)}`;
    }
  }

  const nextAction =
    (input.connection ? resolveIntegrationHealthRowNextAction(input.connection) : null) ??
    (input.liveProof?.operatorStatus === "no_connection"
      ? { label: "Connect channel", href: integrationConnectionSetupHref(input.provider), tone: "urgent" as const }
      : input.liveProof?.operatorStatus === "wizard_incomplete"
        ? {
            label: "Finish pilot wizard",
            href: integrationConnectionSetupHref(input.provider),
            tone: "urgent" as const,
          }
        : { label: "Open channel health", href: "/dashboard/sales-channels/health", tone: "normal" as const });

  let stateTone = connectionStateTone(input.connection?.status ?? null);
  if (smokeStatus === "FAILED") {
    stateTone = "down";
  } else if (smokeStatus === "SKIPPED WITH REASON" && stateTone === "healthy") {
    stateTone = "degraded";
  }

  return {
    id: input.provider === "WOOCOMMERCE" ? "woocommerce" : "shopify",
    label,
    currentState,
    stateTone,
    lastSyncLabel: input.connection?.lastSyncAt
      ? formatPilotIntegrationLastSync(input.connection.lastSyncAt)
      : null,
    lastError: input.connection?.lastError ?? null,
    smokeStatus,
    smokeDetail,
    missingEnvVars: input.channelSmoke?.missingEnvVars ?? [],
    nextAction,
    supportGuidance:
      "Complete in-app pilot wizard, then engineering live smoke — never claim LIVE without artifact PASS.",
  };
}

export function buildStripeChannelCard(input: {
  stripeConfigured: boolean;
  stripeMissingEnvVars: readonly string[];
}): IntegrationHealthChannelCard {
  return {
    id: "stripe",
    label: "Stripe",
    currentState: input.stripeConfigured ? "Keys configured" : "Keys missing or incomplete",
    stateTone: input.stripeConfigured ? "healthy" : "down",
    lastSyncLabel: null,
    lastError: null,
    smokeStatus: null,
    smokeDetail: "Billing smoke is workspace-level — verify charges in Stripe Dashboard.",
    missingEnvVars: [...input.stripeMissingEnvVars],
    nextAction: {
      label: input.stripeConfigured ? "Open billing" : "Configure Stripe",
      href: "/dashboard/billing",
      tone: input.stripeConfigured ? "normal" : "urgent",
    },
    supportGuidance:
      "Stripe BETA in pilot — LIVE requires real charges and webhook delivery proof in staging/production.",
  };
}

export function buildWebhooksChannelCard(input: {
  failedWebhookCount: number;
}): IntegrationHealthChannelCard {
  const blocked = input.failedWebhookCount > 0;
  return {
    id: "webhooks",
    label: "Webhooks",
    currentState: blocked
      ? `${input.failedWebhookCount} unprocessed/failed delivery(ies)`
      : "No webhook backlog",
    stateTone: blocked ? "down" : "healthy",
    lastSyncLabel: null,
    lastError: blocked ? "Unprocessed webhook events in queue" : null,
    smokeStatus: null,
    smokeDetail: null,
    missingEnvVars: [],
    nextAction: {
      label: blocked ? "Review webhook queue" : "Open webhooks",
      href: "/dashboard/sales-channels/webhooks",
      tone: blocked ? "urgent" : "normal",
    },
    supportGuidance:
      "Verify signing secrets on Woo/Shopify connectors before replaying failed events.",
  };
}

export function buildPublicApiChannelCard(input: {
  apiKeysActive: number;
}): IntegrationHealthChannelCard {
  const configured = input.apiKeysActive > 0;
  return {
    id: "public-api",
    label: "Public API",
    currentState: configured
      ? `${input.apiKeysActive} active API key(s)`
      : "No active API keys",
    stateTone: configured ? "healthy" : "neutral",
    lastSyncLabel: null,
    lastError: null,
    smokeStatus: null,
    smokeDetail: "Public API v1 — no SLA or production certification claim.",
    missingEnvVars: [],
    nextAction: {
      label: configured ? "Manage API keys" : "Create API key",
      href: "/dashboard/developer",
      tone: configured ? "normal" : "normal",
    },
    supportGuidance:
      "Developer center shows keys and integration health — rate limits and metering are pilot-scoped.",
  };
}

export function buildSsoChannelCard(input: {
  sso: IntegrationHealthChannelCardsInput["sso"];
  p0Staging: P0StagingProofUnblockSummary | null;
}): IntegrationHealthChannelCard | null {
  if (!input.sso?.entitlementEnabled) return null;

  const ssoChild = input.p0Staging?.children.ssoIdpStaging;
  const smokeStatus = ssoChild?.overall
    ? normalizeSmokeArtifactOverall(ssoChild.overall)
    : null;

  let currentState: string;
  if (input.sso.active) currentState = "SSO LIVE — active";
  else if (input.sso.configured) currentState = "SSO LIVE — activation pending";
  else currentState = "SSO LIVE — setup incomplete";

  let stateTone: IntegrationHealthChannelCardStateTone = input.sso.active ? "healthy" : "degraded";
  if (smokeStatus === "FAILED") {
    stateTone = "down";
  } else if (smokeStatus === "SKIPPED WITH REASON" && stateTone === "healthy") {
    stateTone = "degraded";
  }

  return {
    id: "sso",
    label: "Enterprise SSO",
    currentState,
    stateTone,
    lastSyncLabel: null,
    lastError: null,
    smokeStatus,
    smokeDetail:
      smokeStatus === "SKIPPED WITH REASON"
        ? "IdP staging smoke SKIPPED — ops credentials required."
        : smokeStatus === "PASSED"
          ? "IdP staging smoke passed on last engineering run."
          : "Run smoke:enterprise-sso-idp-staging when vault credentials exist.",
    missingEnvVars: ssoChild?.missingEnvVars ?? [],
    nextAction: {
      label: input.sso.active ? "Review SSO settings" : "Configure SSO pilot",
      href: "/dashboard/settings/security/sso",
      tone: input.sso.active ? "normal" : "urgent",
    },
    supportGuidance:
      "Enterprise SSO + SCIM LIVE for Okta, Entra ID, and Google Workspace — configure at /dashboard/enterprise/sso-scim.",
  };
}

export function buildIntegrationHealthChannelCards(
  input: IntegrationHealthChannelCardsInput,
): IntegrationHealthChannelCard[] {
  const cards: IntegrationHealthChannelCard[] = [
    buildStripeChannelCard({
      stripeConfigured: input.stripeConfigured,
      stripeMissingEnvVars: input.stripeMissingEnvVars,
    }),
    buildPilotChannelCard({
      provider: "WOOCOMMERCE",
      connection: cardForProvider(input.cards, "WOOCOMMERCE"),
      liveProof: liveProofForProvider(input.liveProofSlices, "WOOCOMMERCE"),
      channelSmoke: input.channelSmoke,
    }),
    buildPilotChannelCard({
      provider: "SHOPIFY",
      connection: cardForProvider(input.cards, "SHOPIFY"),
      liveProof: liveProofForProvider(input.liveProofSlices, "SHOPIFY"),
      channelSmoke: input.channelSmoke,
    }),
    buildWebhooksChannelCard({ failedWebhookCount: input.failedWebhookCount }),
    buildPublicApiChannelCard({ apiKeysActive: input.apiKeysActive }),
  ];

  const ssoCard = buildSsoChannelCard({ sso: input.sso, p0Staging: input.p0Staging });
  if (ssoCard) cards.push(ssoCard);

  return cards;
}

export function summarizeIntegrationHealthChannelCards(
  cards: readonly IntegrationHealthChannelCard[],
): string {
  const down = cards.filter((card) => card.stateTone === "down").length;
  const degraded = cards.filter((card) => card.stateTone === "degraded").length;
  const smokeBlocked = cards.some(
    (card) => card.smokeStatus === "FAILED" || card.smokeStatus === "SKIPPED WITH REASON",
  );

  if (down > 0) {
    return `${down} channel(s) down — fix connections and webhook backlog before pilot scale.`;
  }
  if (degraded > 0 || smokeBlocked) {
    return "Some channels need setup or engineering smoke — review each card before go-live.";
  }
  return "Core integration surfaces look configured — confirm engineering smoke artifacts before LIVE claims.";
}

export function buildIntegrationHealthChannelCardsModel(
  input: IntegrationHealthChannelCardsInput,
  loadedAt?: string,
): IntegrationHealthChannelCardsModel {
  const cards = buildIntegrationHealthChannelCards(input);
  return {
    policyId: INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID,
    loadedAt: loadedAt ?? new Date().toISOString(),
    headline: summarizeIntegrationHealthChannelCards(cards),
    cards,
  };
}

export function listStripeMissingEnvVars(input: {
  secretKey?: string | null;
  webhookSecret?: string | null;
  publishableKey?: string | null;
}): string[] {
  const missing: string[] = [];
  if (!input.secretKey?.trim()) missing.push("STRIPE_SECRET_KEY");
  if (!input.webhookSecret?.trim()) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!input.publishableKey?.trim()) missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  return missing;
}
