import type { StorefrontSettings } from "@prisma/client";

import { isStripeSecretConfigured, stripeReadinessSummary } from "@/lib/storefront/stripe-readiness";
import { isStorefrontStripeConnectEnabled } from "@/lib/storefront/storefront-stripe-connect";
import { resolveStorefrontStripeCheckoutCurrency } from "@/services/storefront/storefront-currency-service";
import {
  connectReadinessForStorefront,
  storefrontUsesConnectCheckout,
} from "@/services/storefront/storefront-stripe-connect-service";

type SfPayFields = Pick<
  StorefrontSettings,
  | "onlinePaymentEnabled"
  | "payLaterOnly"
  | "currency"
  | "stripeConnectAccountId"
  | "stripeConnectChargesEnabled"
  | "stripeConnectPayoutsEnabled"
  | "stripeConnectDetailsSubmitted"
>;

export function isStorefrontOnlineCheckoutAvailable(sf: SfPayFields): boolean {
  if (!sf.onlinePaymentEnabled || sf.payLaterOnly) return false;
  if (!isStripeSecretConfigured()) return false;
  const cur = resolveStorefrontStripeCheckoutCurrency(sf);
  if (cur.status !== "aligned") return false;
  if (storefrontUsesConnectCheckout(sf)) return true;
  if (isStorefrontStripeConnectEnabled() && sf.stripeConnectAccountId?.trim()) {
    return sf.stripeConnectChargesEnabled;
  }
  return true;
}

export function storefrontPaymentReadiness(sf: SfPayFields) {
  const stripe = stripeReadinessSummary();
  const cur = resolveStorefrontStripeCheckoutCurrency(sf);
  const connect = connectReadinessForStorefront(sf);
  const allowed = isStorefrontOnlineCheckoutAvailable(sf);
  return {
    allowed,
    stripeReady: stripe.ready,
    stripeMode: stripe.mode,
    stripeMessage: stripe.message,
    storefrontCurrency: sf.currency,
    stripeCheckoutCurrency: cur.stripeCurrency,
    currencyStatus: cur.status,
    currencyMessage: cur.message,
    connect,
    paymentMode: connect.ready ? "connect" : connect.connectEnabled ? "connect_pending" : "platform",
    blockedReason: sf.payLaterOnly
      ? "Pay-later only is enabled — online card checkout is disabled."
      : !sf.onlinePaymentEnabled
        ? "Online payments are turned off in Ordering settings."
        : !stripe.ready
          ? stripe.message
          : cur.status !== "aligned"
            ? cur.message
            : connect.connectEnabled && connect.status === "pending_verification"
              ? "Complete Stripe Connect onboarding to accept card payments."
              : connect.connectEnabled && connect.status === "not_connected"
                ? "Connect your Stripe account to accept online payments."
                : null,
  };
}
