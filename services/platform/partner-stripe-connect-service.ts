import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  isMarketplacePartnerStripeConnectEnabled,
  marketplacePartnerStripeConnectClientId,
  resolvePartnerConnectStatus,
} from "@/lib/platform/partner-stripe-connect";

export async function createPartnerConnectAccountLink(input: {
  publisherKey: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!isMarketplacePartnerStripeConnectEnabled()) {
    return { ok: false, error: "Partner Stripe Connect payouts are not enabled." };
  }
  if (!marketplacePartnerStripeConnectClientId()) {
    return { ok: false, error: "STRIPE_CONNECT_CLIENT_ID is not configured." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const account = await prisma.partnerBillingAccount.findUnique({
    where: { publisherKey: input.publisherKey },
  });
  if (!account) {
    return { ok: false, error: "Partner billing account not found." };
  }

  let stripeAccountId = account.stripeConnectAccountId?.trim() ?? null;
  try {
    if (!stripeAccountId) {
      const created = await stripe.accounts.create({
        type: "express",
        metadata: {
          kitchenosPublisherKey: account.publisherKey,
          kitchenosPublisherName: account.publisherName,
        },
      });
      stripeAccountId = created.id;
      await prisma.partnerBillingAccount.update({
        where: { publisherKey: account.publisherKey },
        data: { stripeConnectAccountId: stripeAccountId },
      });
    }

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${SITE_URL}/platform/partner-billing?connect=refresh&publisher=${encodeURIComponent(account.publisherKey)}`,
      return_url: `${SITE_URL}/platform/partner-billing?connect=return&publisher=${encodeURIComponent(account.publisherKey)}`,
      type: "account_onboarding",
    });
    if (!link.url) return { ok: false, error: "Stripe did not return an onboarding URL." };
    return { ok: true, url: link.url };
  } catch (e) {
    logger.error("[partner-billing] connect account link failed", e);
    return { ok: false, error: safeStripeError(e) };
  }
}

export async function refreshPartnerConnectAccountFromStripe(accountId: string): Promise<void> {
  const stripe = getStripeClient();
  if (!stripe) return;

  const account = await stripe.accounts.retrieve(accountId);
  const billingAccount = await prisma.partnerBillingAccount.findFirst({
    where: { stripeConnectAccountId: accountId },
  });
  if (!billingAccount) return;

  const payoutsEnabled = Boolean(account.payouts_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);

  await prisma.partnerBillingAccount.update({
    where: { publisherKey: billingAccount.publisherKey },
    data: {
      stripeConnectPayoutsEnabled: payoutsEnabled,
      stripeConnectDetailsSubmitted: detailsSubmitted,
      stripeConnectOnboardedAt:
        payoutsEnabled && !billingAccount.stripeConnectOnboardedAt
          ? new Date()
          : billingAccount.stripeConnectOnboardedAt,
    },
  });
}

export function partnerConnectReadinessForAccount(account: {
  publisherKey: string;
  stripeConnectAccountId: string | null;
  stripeConnectPayoutsEnabled: boolean;
  stripeConnectDetailsSubmitted: boolean;
}) {
  const status = resolvePartnerConnectStatus(account);
  return {
    connectEnabled: isMarketplacePartnerStripeConnectEnabled(),
    connectClientConfigured: Boolean(marketplacePartnerStripeConnectClientId()),
    status,
    accountId: account.stripeConnectAccountId,
    payoutsEnabled: account.stripeConnectPayoutsEnabled,
    ready: status === "ready",
    label: status,
  };
}
