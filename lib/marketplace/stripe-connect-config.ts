/** Feature flag: marketplace vendor Stripe Connect payouts. */
export function isMarketplaceVendorStripeConnectEnabled(): boolean {
  return process.env.MARKETPLACE_VENDOR_STRIPE_CONNECT === "1";
}

export function marketplaceVendorStripeConnectClientId(): string | null {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  return id && id.length > 0 ? id : null;
}

export type VendorConnectStatus = "disabled" | "not_connected" | "pending_verification" | "ready";

export function resolveVendorConnectStatus(vendor: {
  stripeAccountId: string | null;
}): VendorConnectStatus {
  if (!isMarketplaceVendorStripeConnectEnabled()) return "disabled";
  if (!vendor.stripeAccountId?.trim()) return "not_connected";
  return "pending_verification";
}

export function vendorConnectStatusLabel(status: VendorConnectStatus): string {
  switch (status) {
    case "disabled":
      return "Stripe Connect disabled";
    case "not_connected":
      return "Connect account not linked";
    case "pending_verification":
      return "Pending Stripe verification";
    case "ready":
      return "Payouts ready";
  }
}

export function marketplaceStripeWebhookSecret(): string | null {
  const secret =
    process.env.STRIPE_MARKETPLACE_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

/** Stripe Connect events handled by `/api/marketplace/stripe-connect/webhook`. */
export const MARKETPLACE_CONNECT_WEBHOOK_EVENTS = [
  "account.updated",
  "payment_intent.succeeded",
  "payment_intent.amount_capturable_updated",
  "payment_intent.payment_failed",
  "transfer.created",
  "transfer.reversed",
  "transfer.updated",
  "payout.paid",
  "payout.failed",
  "payout.canceled",
] as const;

export type MarketplaceConnectWebhookEvent = (typeof MARKETPLACE_CONNECT_WEBHOOK_EVENTS)[number];

export function isAllowedMarketplaceConnectWebhookEvent(
  type: string,
): type is MarketplaceConnectWebhookEvent {
  return (MARKETPLACE_CONNECT_WEBHOOK_EVENTS as readonly string[]).includes(type);
}
