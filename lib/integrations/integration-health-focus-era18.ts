import type { IntegrationProvider } from "@prisma/client";

import type {
  IntegrationHealthCard,
  IntegrationHealthSummary,
} from "@/services/developer/integration-health-service";

export type IntegrationHealthRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export type IntegrationHealthFocusSnapshot = {
  overall: IntegrationHealthSummary["overall"];
  downCount: number;
  degradedCount: number;
  failedWebhookCount: number;
  stripeConfigured: boolean;
  emailConfigured: boolean;
  errorConnectionCount: number;
  needsAuthCount: number;
  missingWebhookSecretCount: number;
  neverSyncedCount: number;
};

export type IntegrationHealthAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

const WEBHOOK_PILOT_PROVIDERS = new Set<IntegrationProvider>(["WOOCOMMERCE", "SHOPIFY"]);

const CONNECTION_SETUP_HREF: Partial<Record<IntegrationProvider, string>> = {
  WOOCOMMERCE: "/dashboard/integrations/woocommerce",
  SHOPIFY: "/dashboard/integrations/shopify",
  UBER_EATS: "/dashboard/integrations/uber-eats",
  UBER_DIRECT: "/dashboard/integrations/uber-direct",
  DOORDASH: "/dashboard/integrations/doordash",
};

export function integrationConnectionSetupHref(provider: IntegrationProvider): string {
  return CONNECTION_SETUP_HREF[provider] ?? "/dashboard/sales-channels/health";
}

export function isWebhookPilotProvider(provider: IntegrationProvider): boolean {
  return WEBHOOK_PILOT_PROVIDERS.has(provider);
}

export function buildIntegrationHealthFocusSnapshot(input: {
  summary: IntegrationHealthSummary;
  cards: readonly IntegrationHealthCard[];
  failedWebhookCount: number;
}): IntegrationHealthFocusSnapshot {
  let errorConnectionCount = 0;
  let needsAuthCount = 0;
  let missingWebhookSecretCount = 0;
  let neverSyncedCount = 0;

  for (const card of input.cards) {
    if (card.status === "ERROR") errorConnectionCount += 1;
    if (card.status === "NEEDS_AUTH") needsAuthCount += 1;
    if (isWebhookPilotProvider(card.provider) && !card.hasWebhookSecret) {
      missingWebhookSecretCount += 1;
    }
    if (card.status === "CONNECTED" && !card.lastSyncAt) neverSyncedCount += 1;
  }

  return {
    overall: input.summary.overall,
    downCount: input.summary.downCount,
    degradedCount: input.summary.degradedCount,
    failedWebhookCount: input.failedWebhookCount,
    stripeConfigured: input.summary.stripeConfigured,
    emailConfigured: input.summary.emailConfigured,
    errorConnectionCount,
    needsAuthCount,
    missingWebhookSecretCount,
    neverSyncedCount,
  };
}

export function summarizeIntegrationHealthFocus(
  snapshot: IntegrationHealthFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    snapshot.errorConnectionCount +
    snapshot.needsAuthCount +
    snapshot.missingWebhookSecretCount +
    snapshot.failedWebhookCount +
    (snapshot.stripeConfigured ? 0 : 1) +
    (snapshot.emailConfigured ? 0 : 1) +
    snapshot.neverSyncedCount;

  const hasUrgent =
    snapshot.overall === "down" ||
    snapshot.errorConnectionCount > 0 ||
    snapshot.needsAuthCount > 0 ||
    snapshot.missingWebhookSecretCount > 0 ||
    snapshot.failedWebhookCount > 0 ||
    !snapshot.stripeConfigured;

  return { totalSignals, hasUrgent };
}

/** Workspace integration health categories — pilot channel blockers first. */
export function pickIntegrationHealthAttentionItems(
  snapshot: IntegrationHealthFocusSnapshot,
): IntegrationHealthAttentionItem[] {
  const items: IntegrationHealthAttentionItem[] = [];

  if (snapshot.errorConnectionCount > 0) {
    items.push({
      id: "connection-errors",
      title: `${snapshot.errorConnectionCount} integration error${snapshot.errorConnectionCount === 1 ? "" : "s"}`,
      detail: "Channel connectors failed — reconnect before pilot orders can flow.",
      href: "/dashboard/sales-channels/health",
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.needsAuthCount > 0) {
    items.push({
      id: "needs-auth",
      title: `${snapshot.needsAuthCount} connection${snapshot.needsAuthCount === 1 ? "" : "s"} need OAuth`,
      detail: "Complete authorization so sync and webhooks can resume.",
      href: "/dashboard/sales-channels",
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.missingWebhookSecretCount > 0) {
    items.push({
      id: "missing-webhook-secret",
      title: `${snapshot.missingWebhookSecretCount} Woo/Shopify secret${snapshot.missingWebhookSecretCount === 1 ? "" : "s"} missing`,
      detail: "Webhook signing cannot verify until secrets are saved on the connector.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 3,
      tone: "urgent",
    });
  }

  if (snapshot.failedWebhookCount > 0) {
    items.push({
      id: "webhook-backlog",
      title: `${snapshot.failedWebhookCount} unprocessed webhook${snapshot.failedWebhookCount === 1 ? "" : "s"}`,
      detail: "Review delivery errors — may block channel order import.",
      href: "/dashboard/sales-channels/webhooks",
      priority: 4,
      tone: "urgent",
    });
  }

  if (!snapshot.stripeConfigured) {
    items.push({
      id: "stripe-missing",
      title: "Stripe not configured",
      detail: "Payments and pilot checkout paths need Stripe keys in workspace settings.",
      href: "/dashboard/settings/billing",
      priority: 5,
      tone: "urgent",
    });
  }

  if (!snapshot.emailConfigured) {
    items.push({
      id: "email-missing",
      title: "Transactional email not configured",
      detail: "Order confirmations and alerts need Resend credentials.",
      href: "/dashboard/settings/notifications",
      priority: 6,
      tone: "normal",
    });
  }

  if (snapshot.neverSyncedCount > 0) {
    items.push({
      id: "never-synced",
      title: `${snapshot.neverSyncedCount} connection${snapshot.neverSyncedCount === 1 ? "" : "s"} never synced`,
      detail: "Run first catalog or order sync after credentials are saved.",
      href: "/dashboard/sales-channels",
      priority: 7,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Per-connection next action for the saved connections table. */
export function resolveIntegrationHealthRowNextAction(
  card: IntegrationHealthCard,
): IntegrationHealthRowNextAction | null {
  const setupHref = integrationConnectionSetupHref(card.provider);

  if (card.status === "ERROR") {
    return { label: "Reconnect integration", href: setupHref, tone: "urgent" };
  }

  if (card.status === "NEEDS_AUTH") {
    return { label: "Complete OAuth", href: setupHref, tone: "urgent" };
  }

  if (card.status === "DISABLED") {
    return { label: "Enable connection", href: setupHref, tone: "normal" };
  }

  if (isWebhookPilotProvider(card.provider) && !card.hasWebhookSecret) {
    return { label: "Configure webhook secret", href: setupHref, tone: "urgent" };
  }

  if (card.status === "CONNECTED" && !card.lastSyncAt) {
    return { label: "Run first sync", href: setupHref, tone: "normal" };
  }

  if (card.lastError?.trim()) {
    return {
      label: "Review last error",
      href: "/dashboard/sales-channels/health",
      tone: "normal",
    };
  }

  return null;
}

export type SalesChannelHealthProbe = {
  status: string;
  errorMessage?: string | null;
};

/** Sales channels health cards — extends integration row actions with manual probe results. */
export function resolveSalesChannelHealthConnectionNextAction(
  card: IntegrationHealthCard,
  probe?: SalesChannelHealthProbe | null,
): IntegrationHealthRowNextAction | null {
  const base = resolveIntegrationHealthRowNextAction(card);
  if (base) return base;

  const probeStatus = probe?.status?.toUpperCase();
  if (probeStatus === "FAILED" || probeStatus === "ERROR" || probeStatus === "UNHEALTHY") {
    return {
      label: "Fix failed health probe",
      href: integrationConnectionSetupHref(card.provider),
      tone: "urgent",
    };
  }

  return null;
}
