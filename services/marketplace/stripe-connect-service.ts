import type Stripe from "stripe";

import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import {
  isAllowedMarketplaceConnectWebhookEvent,
  isMarketplaceVendorStripeConnectEnabled,
  marketplaceVendorStripeConnectClientId,
  resolveVendorConnectStatus,
} from "@/lib/marketplace/stripe-connect-config";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { recordBillingEvent } from "@/services/billing/billing-service";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function toMinorUnits(amount: number): number {
  return Math.max(0, Math.round(amount * 100));
}

export async function createVendorAccount(vendorId: string): Promise<
  { ok: true; accountId: string } | { ok: false; error: string }
> {
  if (!isMarketplaceVendorStripeConnectEnabled()) {
    return { ok: false, error: "Marketplace Stripe Connect is not enabled." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, companyName: true, legalName: true, stripeAccountId: true },
  });
  if (!vendor) return { ok: false, error: "Vendor not found." };
  if (vendor.stripeAccountId) return { ok: true, accountId: vendor.stripeAccountId };

  try {
    const account = await stripe.accounts.create({
      type: "express",
      metadata: {
        kitchenosVendorId: vendor.id,
        kitchenosVendorName: vendor.companyName,
      },
      business_profile: { name: vendor.companyName },
    });

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { stripeAccountId: account.id },
    });

    return { ok: true, accountId: account.id };
  } catch (error) {
    logger.error("[marketplace-connect] createVendorAccount failed", error);
    return { ok: false, error: safeStripeError(error) };
  }
}

export async function getAccountLink(vendorId: string): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  if (!isMarketplaceVendorStripeConnectEnabled()) {
    return { ok: false, error: "Marketplace Stripe Connect is not enabled." };
  }
  if (!marketplaceVendorStripeConnectClientId()) {
    return { ok: false, error: "STRIPE_CONNECT_CLIENT_ID is not configured." };
  }

  const created = await createVendorAccount(vendorId);
  if (!created.ok) return created;

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  try {
    const link = await stripe.accountLinks.create({
      account: created.accountId,
      refresh_url: `${SITE_URL}/vendor/finance?connect=refresh`,
      return_url: `${SITE_URL}/vendor/finance?connect=return`,
      type: "account_onboarding",
    });
    if (!link.url) return { ok: false, error: "Stripe did not return an onboarding URL." };
    return { ok: true, url: link.url };
  } catch (error) {
    logger.error("[marketplace-connect] getAccountLink failed", error);
    return { ok: false, error: safeStripeError(error) };
  }
}

export async function handleAccountUpdate(accountId: string): Promise<void> {
  const stripe = getStripeClient();
  if (!stripe) return;

  const account = await stripe.accounts.retrieve(accountId);
  const vendor = await prisma.vendor.findFirst({
    where: { stripeAccountId: accountId },
    select: { id: true, documents: true, verifiedAt: true },
  });
  if (!vendor) return;

  const payoutsEnabled = Boolean(account.payouts_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);

  if (payoutsEnabled && detailsSubmitted && !vendor.verifiedAt) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { verifiedAt: new Date() },
    });
  }

  logger.info("[marketplace-connect] account updated", {
    vendorId: vendor.id,
    payoutsEnabled,
    detailsSubmitted,
  });
}

export async function createPaymentIntent(input: {
  orderId: string;
}): Promise<
  | { ok: true; paymentIntentId: string; clientSecret: string | null }
  | { ok: false; error: string }
> {
  const order = await prisma.marketplacePurchaseOrder.findUnique({
    where: { id: input.orderId },
    include: {
      vendor: { select: { id: true, stripeAccountId: true, commissionRate: true } },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const total = decimalToNumber(order.total);
  const amount = toMinorUnits(total);
  const commissionRate = decimalToNumber(order.vendor.commissionRate) / 100;
  const applicationFee = toMinorUnits(total * commissionRate);

  try {
    const payload: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: order.currency.toLowerCase(),
      metadata: {
        marketplaceOrderId: order.id,
        vendorId: order.vendorId,
        workspaceId: order.workspaceId,
      },
      automatic_payment_methods: { enabled: true },
    };

    if (
      isMarketplaceVendorStripeConnectEnabled() &&
      order.vendor.stripeAccountId?.trim()
    ) {
      payload.application_fee_amount = applicationFee;
      payload.transfer_data = { destination: order.vendor.stripeAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(payload);

    await prisma.marketplacePurchaseOrder.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      ok: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    logger.error("[marketplace-connect] createPaymentIntent failed", error);
    return { ok: false, error: safeStripeError(error) };
  }
}

export async function capturePayment(paymentIntentId: string): Promise<
  { ok: true; status: string } | { ok: false; error: string }
> {
  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  try {
    const intent = await stripe.paymentIntents.capture(paymentIntentId);
    await releaseFunds(intent.id);
    return { ok: true, status: intent.status };
  } catch (error) {
    logger.error("[marketplace-connect] capturePayment failed", error);
    return { ok: false, error: safeStripeError(error) };
  }
}

export async function releaseFunds(paymentIntentId: string): Promise<void> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { paymentIntentId },
    select: { id: true, vendorId: true, status: true },
  });
  if (!order) return;

  await prisma.vendorTransaction.updateMany({
    where: { purchaseOrderId: order.id, status: "PENDING" },
    data: { status: "AVAILABLE", availableAt: new Date() },
  });
}

export async function processPayout(vendorId: string): Promise<
  | { ok: true; payoutId: string; amount: number; transferId?: string }
  | { ok: false; error: string }
> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { id: true, stripeAccountId: true },
  });
  if (!vendor) return { ok: false, error: "Vendor not found." };

  const available = await prisma.vendorTransaction.findMany({
    where: { vendorId, status: "AVAILABLE" },
    select: { id: true, netAmount: true },
  });
  if (available.length === 0) {
    return { ok: false, error: "No available balance to pay out." };
  }

  const amount = available.reduce((sum, row) => sum + decimalToNumber(row.netAmount), 0);
  const payoutId = `PAYOUT-${Date.now().toString(36).toUpperCase()}`;

  let transferId: string | undefined;
  const stripe = getStripeClient();

  if (
    stripe &&
    isMarketplaceVendorStripeConnectEnabled() &&
    vendor.stripeAccountId?.trim()
  ) {
    try {
      const transfer = await stripe.transfers.create({
        amount: toMinorUnits(amount),
        currency: "usd",
        destination: vendor.stripeAccountId,
        metadata: { payoutId, vendorId: vendor.id },
      });
      transferId = transfer.id;
    } catch (error) {
      logger.error("[marketplace-connect] processPayout transfer failed", error);
      return { ok: false, error: safeStripeError(error) };
    }
  }

  await prisma.vendorTransaction.updateMany({
    where: { id: { in: available.map((row) => row.id) } },
    data: { status: "PAID_OUT", payoutId },
  });

  return { ok: true, payoutId, amount, transferId };
}

export async function isDuplicateMarketplaceConnectWebhook(stripeEventId: string): Promise<boolean> {
  const existing = await prisma.billingEvent.findUnique({
    where: { stripeEventId },
    select: { id: true },
  });
  return Boolean(existing);
}

async function resolveVendorByStripeAccountId(accountId: string | null | undefined) {
  if (!accountId?.trim()) return null;
  return prisma.vendor.findFirst({
    where: { stripeAccountId: accountId },
    select: {
      id: true,
      workspaceId: true,
      stripeAccountId: true,
      workspace: { select: { ownerUserId: true } },
    },
  });
}

async function resolveVendorIdFromConnectEvent(event: Stripe.Event): Promise<string | null> {
  const object = event.data.object as {
    metadata?: { vendorId?: string; marketplaceOrderId?: string };
    destination?: string | { id?: string } | null;
  };

  if (object.metadata?.vendorId?.trim()) {
    return object.metadata.vendorId.trim();
  }

  if (object.metadata?.marketplaceOrderId?.trim()) {
    const order = await prisma.marketplacePurchaseOrder.findUnique({
      where: { id: object.metadata.marketplaceOrderId.trim() },
      select: { vendorId: true },
    });
    return order?.vendorId ?? null;
  }

  const destination =
    typeof object.destination === "string"
      ? object.destination
      : object.destination?.id ?? null;
  if (destination) {
    const vendor = await resolveVendorByStripeAccountId(destination);
    return vendor?.id ?? null;
  }

  if (event.account) {
    const vendor = await resolveVendorByStripeAccountId(event.account);
    return vendor?.id ?? null;
  }

  return null;
}

export async function recordMarketplaceConnectWebhookDelivery(input: {
  event: Stripe.Event;
  vendorId?: string | null;
}): Promise<void> {
  const vendorId =
    input.vendorId ?? (await resolveVendorIdFromConnectEvent(input.event));
  if (!vendorId) return;

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { workspaceId: true, workspace: { select: { ownerUserId: true } } },
  });
  const userId = vendor?.workspace?.ownerUserId;
  if (!userId) return;

  await recordBillingEvent({
    userId,
    workspaceId: vendor.workspaceId,
    eventType: `MARKETPLACE_CONNECT_${input.event.type.toUpperCase().replaceAll(".", "_")}`,
    source: "stripe",
    stripeEventId: input.event.id,
    summary: input.event.type,
    metadata: { vendorId, eventType: input.event.type },
  });
}

async function handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
  const vendorId = transfer.metadata?.vendorId?.trim();
  const payoutId = transfer.metadata?.payoutId?.trim();
  if (!vendorId || !payoutId) {
    logger.info("[marketplace-connect] transfer.created without payout metadata", {
      transferId: transfer.id,
    });
    return;
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { stripeAccountId: true },
  });
  const destination =
    typeof transfer.destination === "string" ? transfer.destination : transfer.destination?.id;
  if (!vendor?.stripeAccountId || vendor.stripeAccountId !== destination) {
    logger.warn("[marketplace-connect] transfer destination mismatch", {
      vendorId,
      transferId: transfer.id,
      destination,
    });
    return;
  }

  await prisma.vendorTransaction.updateMany({
    where: {
      vendorId,
      payoutId,
      status: { in: ["AVAILABLE", "PAID_OUT"] },
    },
    data: { status: "PAID_OUT", payoutId },
  });
}

async function handleTransferReversed(transfer: Stripe.Transfer): Promise<void> {
  const vendorId = transfer.metadata?.vendorId?.trim();
  const payoutId = transfer.metadata?.payoutId?.trim();
  if (!vendorId || !payoutId) return;

  await prisma.vendorTransaction.updateMany({
    where: { vendorId, payoutId, status: "PAID_OUT" },
    data: { status: "AVAILABLE", payoutId: null },
  });
}

async function handlePayoutPaid(payout: Stripe.Payout, connectedAccountId: string): Promise<void> {
  const vendor = await resolveVendorByStripeAccountId(connectedAccountId);
  if (!vendor) return;

  const { dispatchVendorWebhookEvent } = await import("@/services/marketplace/vendor-api-service");
  const amount = payout.amount / 100;

  await dispatchVendorWebhookEvent({
    vendorId: vendor.id,
    event: "payout_processed",
    data: {
      payoutId: payout.id,
      amount,
      currency: payout.currency.toUpperCase(),
      status: payout.status,
      arrivalDate: payout.arrival_date
        ? new Date(payout.arrival_date * 1000).toISOString()
        : null,
    },
  });
}

async function handlePayoutFailed(payout: Stripe.Payout, connectedAccountId: string): Promise<void> {
  const vendor = await resolveVendorByStripeAccountId(connectedAccountId);
  if (!vendor) return;

  logger.error("[marketplace-connect] connected account payout failed", {
    vendorId: vendor.id,
    payoutId: payout.id,
    failureCode: payout.failure_code ?? null,
    failureMessage: payout.failure_message ?? null,
  });
}

export async function handleMarketplaceStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (!isAllowedMarketplaceConnectWebhookEvent(event.type)) {
    logger.info("[marketplace-connect] ignored webhook event", { type: event.type, id: event.id });
    return;
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.id) await handleAccountUpdate(account.id);
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.marketplaceOrderId) {
        await releaseFunds(intent.id);
      }
      break;
    }
    case "payment_intent.amount_capturable_updated":
    case "payment_intent.payment_failed": {
      logger.info("[marketplace-connect] payment intent event", { type: event.type, id: event.id });
      break;
    }
    case "transfer.created":
    case "transfer.updated": {
      await handleTransferCreated(event.data.object as Stripe.Transfer);
      break;
    }
    case "transfer.reversed": {
      await handleTransferReversed(event.data.object as Stripe.Transfer);
      break;
    }
    case "payout.paid": {
      if (!event.account) break;
      await handlePayoutPaid(event.data.object as Stripe.Payout, event.account);
      break;
    }
    case "payout.failed":
    case "payout.canceled": {
      if (!event.account) break;
      await handlePayoutFailed(event.data.object as Stripe.Payout, event.account);
      break;
    }
    default:
      break;
  }

  await recordMarketplaceConnectWebhookDelivery({
    event,
    vendorId: await resolveVendorIdFromConnectEvent(event),
  });
}

export function vendorConnectReadiness(vendor: { stripeAccountId: string | null }) {
  const status = resolveVendorConnectStatus(vendor);
  return {
    connectEnabled: isMarketplaceVendorStripeConnectEnabled(),
    connectClientConfigured: Boolean(marketplaceVendorStripeConnectClientId()),
    status,
    accountId: vendor.stripeAccountId,
    ready: status === "ready",
  };
}

export async function refreshVendorConnectReadiness(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { stripeAccountId: true },
  });
  if (!vendor?.stripeAccountId) {
    return vendorConnectReadiness({ stripeAccountId: null });
  }

  const stripe = getStripeClient();
  if (!stripe) return vendorConnectReadiness(vendor);

  const account = await stripe.accounts.retrieve(vendor.stripeAccountId);
  const ready = Boolean(account.payouts_enabled && account.details_submitted);
  return {
    ...vendorConnectReadiness(vendor),
    status: ready ? ("ready" as const) : ("pending_verification" as const),
    payoutsEnabled: Boolean(account.payouts_enabled),
    chargesEnabled: Boolean(account.charges_enabled),
    ready,
  };
}
