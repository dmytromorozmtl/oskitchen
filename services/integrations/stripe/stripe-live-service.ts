import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import type { StripeLiveConnectionSettings, StripeLiveDashboard } from "@/lib/integrations/stripe-live-types";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getStripePendingPayoutCents } from "@/services/integrations/stripe/payout-reconciliation.service";
import {
  getStripeLiveCredentials,
  isStripeConfigured,
  isStripeWebhookConfigured,
  parseStripeSettings,
} from "@/services/integrations/stripe/stripe-credentials";

export async function ensureStripeConnection(userId: string) {
  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.STRIPE,
  );
  const existing = await prisma.integrationConnection.findFirst({ where });
  if (existing) return existing;
  return prisma.integrationConnection.create({
    data: {
      userId,
      provider: IntegrationProvider.STRIPE,
      name: "Stripe",
      status: IntegrationStatus.NEEDS_AUTH,
    },
  });
}

export async function connectStripeLive(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Set STRIPE_SECRET_KEY" };
  }
  if (!isStripeWebhookConfigured()) {
    return { ok: false, error: "Set STRIPE_WEBHOOK_SECRET" };
  }

  const conn = await ensureStripeConnection(userId);
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { status: IntegrationStatus.CONNECTED, lastError: null },
  });
  return { ok: true };
}

export function getStripeLiveMessage(configured = isStripeConfigured()): string {
  return configured
    ? "Stripe LIVE — PaymentIntent, webhooks, and payout reconciliation."
    : "Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable Stripe LIVE.";
}

export async function getStripeLiveDashboard(userId: string): Promise<StripeLiveDashboard> {
  const conn = await ensureStripeConnection(userId);
  const creds = getStripeLiveCredentials(conn);
  const settings = parseStripeSettings(conn.settingsJson);
  const configured = isStripeConfigured();
  const webhookConfigured = isStripeWebhookConfigured();
  const connected = Boolean(configured && webhookConfigured && conn.status === IntegrationStatus.CONNECTED);

  if (configured && webhookConfigured && conn.status !== IntegrationStatus.CONNECTED) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: { status: IntegrationStatus.CONNECTED, lastError: null },
    });
  }

  const pendingPayoutCents = configured ? await getStripePendingPayoutCents() : null;

  return {
    mode: configured ? "live" : "placeholder",
    connected: connected || (configured && webhookConfigured),
    webhookConfigured,
    lastPaymentIntentAt: settings.lastPaymentIntentAt ?? null,
    lastPayoutReconcileAt: settings.lastPayoutReconcileAt ?? null,
    lastPayoutReconcileCount: settings.lastPayoutReconcileCount ?? null,
    pendingPayoutCents,
    message: getStripeLiveMessage(configured),
  };
}

export async function updateStripeLiveSettings(
  userId: string,
  patch: Partial<StripeLiveConnectionSettings>,
): Promise<void> {
  const conn = await ensureStripeConnection(userId);
  const current = parseStripeSettings(conn.settingsJson);
  const next: StripeLiveConnectionSettings = { ...current, ...patch };
  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: { settingsJson: next },
  });
}
