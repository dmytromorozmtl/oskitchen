/** Feature flag: Stripe Connect payouts to app marketplace publishers. */
export function isMarketplacePartnerStripeConnectEnabled(): boolean {
  return process.env.MARKETPLACE_PARTNER_STRIPE_CONNECT === "1";
}

export function marketplacePartnerStripeConnectClientId(): string | null {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();
  return id && id.length > 0 ? id : null;
}

export type PartnerConnectStatus =
  | "disabled"
  | "not_connected"
  | "pending_verification"
  | "ready";

export function resolvePartnerConnectStatus(account: {
  stripeConnectAccountId: string | null;
  stripeConnectPayoutsEnabled: boolean;
  stripeConnectDetailsSubmitted: boolean;
}): PartnerConnectStatus {
  if (!isMarketplacePartnerStripeConnectEnabled()) return "disabled";
  if (!account.stripeConnectAccountId?.trim()) return "not_connected";
  if (account.stripeConnectPayoutsEnabled) return "ready";
  if (account.stripeConnectDetailsSubmitted) return "pending_verification";
  return "pending_verification";
}

export function partnerConnectStatusLabel(status: PartnerConnectStatus): string {
  switch (status) {
    case "disabled":
      return "Connect payouts disabled";
    case "not_connected":
      return "Stripe Connect not linked";
    case "pending_verification":
      return "Pending Stripe verification";
    case "ready":
      return "Payouts ready";
  }
}
