/** Feature flag: merchant Connect checkout (Option B). Off by default for pilot. */
export function isStorefrontStripeConnectEnabled(): boolean {
  return process.env.STOREFRONT_STRIPE_CONNECT === "1";
}

export function stripeConnectClientId(): string | null {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  return id && id.length > 0 ? id : null;
}

export type StorefrontConnectStatus =
  | "disabled"
  | "not_connected"
  | "pending_verification"
  | "ready";

export function resolveStorefrontConnectStatus(sf: {
  stripeConnectAccountId: string | null;
  stripeConnectChargesEnabled: boolean;
  stripeConnectDetailsSubmitted: boolean;
}): StorefrontConnectStatus {
  if (!isStorefrontStripeConnectEnabled()) return "disabled";
  if (!sf.stripeConnectAccountId?.trim()) return "not_connected";
  if (sf.stripeConnectChargesEnabled) return "ready";
  if (sf.stripeConnectDetailsSubmitted) return "pending_verification";
  return "pending_verification";
}
