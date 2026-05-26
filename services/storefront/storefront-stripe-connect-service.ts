import type { StorefrontSettings } from "@prisma/client";

import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import {
  isStorefrontStripeConnectEnabled,
  resolveStorefrontConnectStatus,
  stripeConnectClientId,
} from "@/lib/storefront/storefront-stripe-connect";

export function storefrontUsesConnectCheckout(
  sf: Pick<StorefrontSettings, "stripeConnectAccountId" | "stripeConnectChargesEnabled">,
): boolean {
  if (!isStorefrontStripeConnectEnabled()) return false;
  return Boolean(sf.stripeConnectAccountId?.trim() && sf.stripeConnectChargesEnabled);
}

export async function createStorefrontConnectAccountLink(userId: string): Promise<
  | { ok: true; url: string }
  | { ok: false; error: string }
> {
  if (!isStorefrontStripeConnectEnabled()) {
    return { ok: false, error: "Stripe Connect is not enabled on this environment." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const sf = await findAdminStorefront(userId);
  if (!sf) return { ok: false, error: "Storefront not configured." };

  let accountId = sf.stripeConnectAccountId?.trim() ?? null;
  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        metadata: { kitchenosUserId: userId, storefrontId: sf.id },
      });
      accountId = account.id;
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${SITE_URL}/dashboard/storefront/ordering?connect=refresh`,
      return_url: `${SITE_URL}/dashboard/storefront/ordering?connect=return`,
      type: "account_onboarding",
    });
    if (!link.url) return { ok: false, error: "Stripe did not return an onboarding URL." };
    return { ok: true, url: link.url };
  } catch (e) {
    logger.error("[storefront] connect account link failed", e);
    return { ok: false, error: safeStripeError(e) };
  }
}

export async function refreshStorefrontConnectAccountFromStripe(
  accountId: string,
): Promise<void> {
  const stripe = getStripeClient();
  if (!stripe) return;

  const account = await stripe.accounts.retrieve(accountId);
  const sf = await prisma.storefrontSettings.findFirst({
    where: { stripeConnectAccountId: accountId },
  });
  if (!sf) return;

  const chargesEnabled = Boolean(account.charges_enabled);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      stripeConnectChargesEnabled: chargesEnabled,
      stripeConnectPayoutsEnabled: payoutsEnabled,
      stripeConnectDetailsSubmitted: detailsSubmitted,
      stripeConnectOnboardedAt:
        chargesEnabled && !sf.stripeConnectOnboardedAt ? new Date() : sf.stripeConnectOnboardedAt,
    },
  });
}

export function connectReadinessForStorefront(
  sf: Pick<
    StorefrontSettings,
    | "stripeConnectAccountId"
    | "stripeConnectChargesEnabled"
    | "stripeConnectPayoutsEnabled"
    | "stripeConnectDetailsSubmitted"
    | "onlinePaymentEnabled"
    | "payLaterOnly"
    | "currency"
  >,
) {
  const status = resolveStorefrontConnectStatus(sf);
  return {
    connectEnabled: isStorefrontStripeConnectEnabled(),
    connectClientConfigured: Boolean(stripeConnectClientId()),
    status,
    accountId: sf.stripeConnectAccountId,
    chargesEnabled: sf.stripeConnectChargesEnabled,
    payoutsEnabled: sf.stripeConnectPayoutsEnabled,
    ready: status === "ready",
    label:
      status === "disabled"
        ? "Connect disabled (platform payments only)"
        : status === "not_connected"
          ? "Not connected"
          : status === "pending_verification"
            ? "Pending verification"
            : "Connected — online payments ready",
  };
}
