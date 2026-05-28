import type { IntegrationProvider } from "@prisma/client";

import { integrationConnectionSetupHref } from "@/lib/integrations/integration-health-focus-era18";
import {
  CHANNEL_PILOT_WEBHOOKS_ANCHOR,
  WEBHOOK_QUEUE_ROUTE,
} from "@/lib/integrations/webhook-queue-focus-era18-policy";

export type WebhookQueueFocusSnapshot = {
  unprocessedCount: number;
  invalidSignatureCount: number;
  processingErrorCount: number;
  backlogCount: number;
};

export type WebhookQueueAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type WebhookQueueEventFocus = {
  id: string;
  provider: string;
  signatureValid: boolean;
  processed: boolean;
  processingError: string | null;
};

export type WebhookQueueRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export function webhookEventAnchor(eventId: string): string {
  return `#webhook-event-${eventId}`;
}

function providerSetupHref(provider: string): string {
  const known = provider.toUpperCase() as IntegrationProvider;
  return integrationConnectionSetupHref(known);
}

export function buildWebhookQueueFocusSnapshot(input: {
  unprocessedCount: number;
  invalidSignatureCount: number;
  processingErrorCount: number;
}): WebhookQueueFocusSnapshot {
  return {
    unprocessedCount: input.unprocessedCount,
    invalidSignatureCount: input.invalidSignatureCount,
    processingErrorCount: input.processingErrorCount,
    backlogCount: input.unprocessedCount,
  };
}

export function summarizeWebhookQueueFocus(snapshot: WebhookQueueFocusSnapshot): {
  totalSignals: number;
  hasUrgent: boolean;
} {
  const totalSignals =
    snapshot.unprocessedCount +
    snapshot.invalidSignatureCount +
    snapshot.processingErrorCount;

  const hasUrgent =
    snapshot.invalidSignatureCount > 0 ||
    snapshot.processingErrorCount > 0 ||
    snapshot.unprocessedCount >= 10;

  return { totalSignals, hasUrgent };
}

/** Webhook queue categories — signature and handler failures before backlog. */
export function pickWebhookQueueAttentionItems(
  snapshot: WebhookQueueFocusSnapshot,
): WebhookQueueAttentionItem[] {
  const items: WebhookQueueAttentionItem[] = [];

  if (snapshot.invalidSignatureCount > 0) {
    items.push({
      id: "invalid-signatures",
      title: `${snapshot.invalidSignatureCount} invalid webhook signature${snapshot.invalidSignatureCount === 1 ? "" : "s"}`,
      detail: "Signing secret mismatch — fix connector webhook secret before replay.",
      href: WEBHOOK_QUEUE_ROUTE,
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.processingErrorCount > 0) {
    items.push({
      id: "processing-errors",
      title: `${snapshot.processingErrorCount} webhook processing error${snapshot.processingErrorCount === 1 ? "" : "s"}`,
      detail: "Handler failures on otherwise valid events — review errors and replay safely.",
      href: WEBHOOK_QUEUE_ROUTE,
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.unprocessedCount > 0) {
    items.push({
      id: "unprocessed-backlog",
      title: `${snapshot.unprocessedCount} unprocessed webhook${snapshot.unprocessedCount === 1 ? "" : "s"}`,
      detail: "May include normal backlog — compare with processing errors above.",
      href: WEBHOOK_QUEUE_ROUTE,
      priority: 3,
      tone: snapshot.unprocessedCount >= 10 ? "urgent" : "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Per-event next action in the webhook activity table. */
export function resolveWebhookQueueRowNextAction(
  event: WebhookQueueEventFocus,
): WebhookQueueRowNextAction | null {
  const anchor = `${WEBHOOK_QUEUE_ROUTE}${webhookEventAnchor(event.id)}`;

  if (!event.signatureValid) {
    return {
      label: "Fix webhook secret",
      href: `${providerSetupHref(event.provider)}${CHANNEL_PILOT_WEBHOOKS_ANCHOR}`,
      tone: "urgent",
    };
  }

  if (!event.processed && event.processingError) {
    return {
      label: "Review processing error",
      href: anchor,
      tone: "urgent",
    };
  }

  if (!event.processed) {
    return {
      label: "Replay webhook",
      href: anchor,
      tone: "normal",
    };
  }

  return null;
}
