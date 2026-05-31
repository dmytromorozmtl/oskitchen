import type Stripe from "stripe";

import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import { amountToStripeMinorUnits } from "@/lib/storefront/currency";
import { decryptStorefrontOrderPiiFields } from "@/lib/storefront/storefront-order-pii";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
export type CreateStorefrontCheckoutSessionInput = {
  storefrontOrderId: string;
  storefrontSlug: string;
  publicToken: string;
  /** ISO amount in major units (same as storefront UI). */
  amountTotal: number;
  /** Stripe smallest-currency unit (pre-computed for storefront currency). */
  amountMinor: number;
  stripeCurrency: string;
  orderNumber: string | null;
  merchantUserId: string;
  pendingPromoId: string | null;
  stripeConnectAccountId?: string | null;
  applicationFeeBps?: number | null;
};

/**
 * Creates a one-time Stripe Checkout Session for a pending storefront order.
 * Metadata is used by the webhook to finalize payment — never put card data here.
 */
export async function createStorefrontStripeCheckoutSession(
  input: CreateStorefrontCheckoutSessionInput,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { ok: false, error: "Stripe is not configured on the server." };
  }
  const currency = input.stripeCurrency.toLowerCase();
  const amountMinor = input.amountMinor;
  if (!Number.isFinite(amountMinor) || amountMinor < 50) {
    return { ok: false, error: "Order total is too small for card checkout." };
  }

  const successUrl = `${SITE_URL}/s/${encodeURIComponent(input.storefrontSlug)}/order/${encodeURIComponent(input.publicToken)}?paid=1`;
  const cancelUrl = `${SITE_URL}/s/${encodeURIComponent(input.storefrontSlug)}/order/${encodeURIComponent(input.publicToken)}?canceled=1`;

  const connectAccountId = input.stripeConnectAccountId?.trim() || null;
  const useConnect = Boolean(connectAccountId);
  const feeBps = input.applicationFeeBps ?? 0;
  const applicationFeeAmount =
    useConnect && feeBps > 0 ? Math.round((amountMinor * feeBps) / 10_000) : undefined;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: input.storefrontOrderId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          purpose: "storefront_order",
          storefrontOrderId: input.storefrontOrderId,
          merchantUserId: input.merchantUserId,
          pendingPromoId: input.pendingPromoId ?? "",
          stripeConnectAccountId: connectAccountId ?? "",
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: amountMinor,
              product_data: {
                name: input.orderNumber ? `OS Kitchen order ${input.orderNumber}` : "OS Kitchen storefront order",
              },
            },
          },
        ],
        ...(useConnect
          ? {
              payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
              },
            }
          : {}),
      },
      useConnect ? { stripeAccount: connectAccountId! } : undefined,
    );
    const url = session.url;
    if (!url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true, url };
  } catch (e) {
    logger.error("[storefront] stripe checkout session failed", e);
    return { ok: false, error: safeStripeError(e) };
  }
}

export async function applyStorefrontOrderCheckoutCompleted(
  session: Stripe.Checkout.Session,
  opts: { stripeEventId: string },
): Promise<void> {
  if (session.metadata?.purpose !== "storefront_order") return;
  const storefrontOrderId = session.metadata.storefrontOrderId;
  if (!storefrontOrderId) return;
  if (session.payment_status !== "paid") return;

  const amountCents = session.amount_total ?? 0;

  const sfo = await prisma.storefrontOrder.findUnique({
    where: { id: storefrontOrderId },
    include: { internalOrder: true },
  });
  if (!sfo?.internalOrderId || !sfo.internalOrder) return;
  if (sfo.paymentStatus === "PAID") return;

  const internalOrder = sfo.internalOrder;

  const sfRow = sfo.storefrontId
    ? await prisma.storefrontSettings.findUnique({ where: { id: sfo.storefrontId } })
    : null;
  const cur = (session.currency ?? sfRow?.currency ?? "usd").toLowerCase();
  const expectedMinor = amountToStripeMinorUnits(Number(sfo.total), cur);
  if (amountCents !== expectedMinor) {
    logger.error(
      `[storefront] checkout amount mismatch for ${storefrontOrderId}: stripe=${amountCents} expected=${expectedMinor} (${cur})`,
    );
    return;
  }

  const pendingPromoId =
    typeof internalOrder.sourceMetadataJson === "object" &&
    internalOrder.sourceMetadataJson !== null &&
    !Array.isArray(internalOrder.sourceMetadataJson)
      ? (internalOrder.sourceMetadataJson as Record<string, unknown>).pendingStorefrontPromoId
      : undefined;
  const promoId = typeof pendingPromoId === "string" ? pendingPromoId : null;
  const storefrontOrderPii = decryptStorefrontOrderPiiFields({
    customerName: sfo.customerName,
    customerEmail: sfo.customerEmail,
    customerPhone: sfo.customerPhone,
  });

  await prisma.$transaction(async (tx) => {
    await tx.storefrontOrder.update({
      where: { id: sfo.id },
      data: {
        paymentMode: "ONLINE_PAYMENT",
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });
    await tx.order.update({
      where: { id: internalOrder.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: "paid",
        paymentMode: "storefront_stripe_checkout",
      },
    });
    if (promoId) {
      await tx.storefrontDiscount.update({
        where: { id: promoId },
        data: { usesCount: { increment: 1 } },
      });
    }
  });

  const { recordBillingEvent } = await import("@/services/billing/billing-service");
  await recordBillingEvent({
    userId: sfo.userId,
    eventType: "STOREFRONT_STRIPE_CHECKOUT_PAID",
    source: "stripe",
    stripeEventId: opts.stripeEventId,
    summary: `Storefront order paid (${sfo.orderNumber ?? sfo.id})`,
    metadata: { storefrontOrderId: sfo.id, checkoutSessionId: session.id },
  });

  const { format } = await import("date-fns");
  const { sendOrderConfirmation } = await import("@/lib/email");
  const { formatCurrency } = await import("@/lib/utils");
  const { parseStorefrontCartSnapshot } = await import("@/lib/storefront/cart-snapshot");
  const {
    parseMarketIdFromOrderSource,
    resolveMarketDisplay,
  } = await import("@/lib/storefront/order-commerce-context");
  const { parseStorefrontMarketsFromSettingsCenter } = await import("@/lib/storefront/markets");
  const {
    buildOrderConfirmationCommerce,
    orderConfirmationTotalsHtml,
  } = await import("@/lib/storefront/order-confirmation-email");

  const settings = await prisma.kitchenSettings.findUnique({ where: { userId: sfo.userId } });
  if (settings?.notifyOrderConfirmation && storefrontOrderPii.customerEmail) {
    const lines = await prisma.orderItem.findMany({
      where: { orderId: internalOrder.id },
      include: { product: true },
    });
    const token = internalOrder.publicLookupToken;
    const { envelope, marketId: fromCart } = parseStorefrontCartSnapshot(sfo.cartJson);
    const marketId = fromCart ?? parseMarketIdFromOrderSource(sfo.source);
    const markets = parseStorefrontMarketsFromSettingsCenter(settings.settingsCenterJson);
    const { name: marketName } = resolveMarketDisplay(
      marketId,
      markets,
      sfRow?.storeSlug ?? "",
      sfRow?.currency ?? "USD",
    );
    const commerce = buildOrderConfirmationCommerce({
      marketName,
      marketId,
      subtotal: Number(sfo.subtotal),
      discount: Number(sfo.discount),
      deliveryFee: Number(sfo.deliveryFee),
      taxBreakdown: envelope?.taxBreakdown ?? [],
      taxTotal: Number(sfo.tax),
      taxIncludedInPrices: envelope?.taxMode === "eu_vat",
    });
    await sendOrderConfirmation({
      to: storefrontOrderPii.customerEmail,
      customerName: storefrontOrderPii.customerName ?? "Guest",
      orderId: internalOrder.id,
      total: formatCurrency(Number(sfo.total)),
      lookupUrl: token ? `${SITE_URL}/order/${token}` : SITE_URL,
      businessName: sfRow?.publicName ?? settings.businessName,
      fulfillmentLabel: sfo.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup",
      fulfillmentDate: internalOrder.pickupDate ? format(internalOrder.pickupDate, "PP") : undefined,
      lines: lines.map((i) => ({ title: i.product?.title ?? i.title ?? "Item", quantity: i.quantity })),
      marketLabel: commerce.marketLabel,
      totalsHtml: orderConfirmationTotalsHtml(commerce),
    });
  }

  if (sfo.storefrontId) {
    await prisma.storefrontConversionEvent.create({
      data: {
        storefrontId: sfo.storefrontId,
        eventName: "order_paid",
        metadataJson: { total: Number(sfo.total), fulfillment: sfo.fulfillmentType },
      },
    });
  }
}
