import type { IntegrationConnection } from "@prisma/client";

import { getStripe } from "@/lib/stripe";
import type { StripeLiveConnectionSettings } from "@/lib/integrations/stripe-live-types";

export function isStripeConfigured(): boolean {
  return Boolean(getStripe());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

export function parseStripeSettings(settingsJson: unknown): StripeLiveConnectionSettings {
  if (!settingsJson || typeof settingsJson !== "object") return {};
  return settingsJson as StripeLiveConnectionSettings;
}

export function getStripeLiveCredentials(conn: IntegrationConnection | null) {
  const stripe = getStripe();
  if (!stripe) return null;
  return {
    stripe,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? null,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? null,
    settings: parseStripeSettings(conn?.settingsJson),
  };
}
