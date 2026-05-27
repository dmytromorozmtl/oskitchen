import { prisma } from "@/lib/prisma";
import { stripeMinorAmountForOrder } from "@/services/storefront/storefront-currency-service";
import { isStorefrontOnlineCheckoutAvailable } from "@/services/storefront/storefront-payment-service";
import { createStorefrontStripeCheckoutSession } from "@/services/storefront/storefront-stripe-checkout-service";

type PaymentFailurePhase = "initial_checkout" | "retry_checkout";

type RetryStorefrontOnlinePaymentInput = {
  publicToken: string;
  storeSlug: string;
};

function pendingPromoIdFromInternalOrder(sourceMetadataJson: unknown): string | null {
  if (
    typeof sourceMetadataJson !== "object" ||
    sourceMetadataJson === null ||
    Array.isArray(sourceMetadataJson)
  ) {
    return null;
  }

  const promoId = (sourceMetadataJson as Record<string, unknown>).pendingStorefrontPromoId;
  return typeof promoId === "string" && promoId.trim().length > 0 ? promoId : null;
}

export async function markStorefrontOnlinePaymentFailed(input: {
  phase: PaymentFailurePhase;
  publicToken?: string | null;
  reason: string;
  storefrontId?: string | null;
  storefrontOrderId: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.storefrontOrder.update({
      where: { id: input.storefrontOrderId },
      data: { paymentStatus: "FAILED" },
    });

    if (input.storefrontId) {
      await tx.storefrontConversionEvent.create({
        data: {
          storefrontId: input.storefrontId,
          eventName: "order_payment_failed",
          metadataJson: {
            phase: input.phase,
            publicToken: input.publicToken ?? undefined,
            reason: input.reason,
          },
        },
      });
    }
  });
}

export async function retryStorefrontOnlinePaymentByToken(
  input: RetryStorefrontOnlinePaymentInput,
): Promise<{ ok: true; stripeCheckoutUrl: string } | { ok: false; error: string }> {
  const storefrontOrder = await prisma.storefrontOrder.findFirst({
    where: {
      publicToken: input.publicToken,
      storefront: { storeSlug: input.storeSlug },
    },
    include: {
      storefront: true,
      internalOrder: {
        select: {
          sourceMetadataJson: true,
        },
      },
    },
  });

  if (!storefrontOrder || !storefrontOrder.storefront) {
    return { ok: false, error: "Order not found." };
  }

  if (storefrontOrder.paymentMode !== "ONLINE_PAYMENT") {
    return { ok: false, error: "This order does not use online card checkout." };
  }

  if (storefrontOrder.paymentStatus === "PAID") {
    return { ok: false, error: "This order has already been paid." };
  }

  if (!isStorefrontOnlineCheckoutAvailable(storefrontOrder.storefront)) {
    return {
      ok: false,
      error: "Online card checkout is not available for this storefront right now.",
    };
  }

  const minor = stripeMinorAmountForOrder(Number(storefrontOrder.total), storefrontOrder.storefront);
  if (!minor.ok) {
    await markStorefrontOnlinePaymentFailed({
      storefrontOrderId: storefrontOrder.id,
      storefrontId: storefrontOrder.storefrontId,
      publicToken: storefrontOrder.publicToken,
      reason: minor.error,
      phase: "retry_checkout",
    });
    return { ok: false, error: minor.error };
  }

  const useConnect =
    Boolean(storefrontOrder.storefront.stripeConnectAccountId?.trim()) &&
    storefrontOrder.storefront.stripeConnectChargesEnabled;
  const stripeRes = await createStorefrontStripeCheckoutSession({
    storefrontOrderId: storefrontOrder.id,
    storefrontSlug: storefrontOrder.storefront.storeSlug,
    publicToken: storefrontOrder.publicToken,
    amountTotal: Number(storefrontOrder.total),
    amountMinor: minor.amountMinor,
    stripeCurrency: minor.currency,
    orderNumber: storefrontOrder.orderNumber,
    merchantUserId: storefrontOrder.userId,
    pendingPromoId: pendingPromoIdFromInternalOrder(storefrontOrder.internalOrder?.sourceMetadataJson),
    stripeConnectAccountId: useConnect ? storefrontOrder.storefront.stripeConnectAccountId : null,
    applicationFeeBps: useConnect ? storefrontOrder.storefront.stripeApplicationFeeBps : null,
  });

  if (!stripeRes.ok) {
    await markStorefrontOnlinePaymentFailed({
      storefrontOrderId: storefrontOrder.id,
      storefrontId: storefrontOrder.storefrontId,
      publicToken: storefrontOrder.publicToken,
      reason: stripeRes.error,
      phase: "retry_checkout",
    });
    return { ok: false, error: stripeRes.error };
  }

  await prisma.$transaction(async (tx) => {
    await tx.storefrontOrder.update({
      where: { id: storefrontOrder.id },
      data: { paymentStatus: "PENDING" },
    });

    if (storefrontOrder.storefrontId) {
      await tx.storefrontConversionEvent.create({
        data: {
          storefrontId: storefrontOrder.storefrontId,
          eventName: "order_payment_retry_started",
          metadataJson: {
            paymentStatusBefore: storefrontOrder.paymentStatus,
            publicToken: storefrontOrder.publicToken,
          },
        },
      });
    }
  });

  return { ok: true, stripeCheckoutUrl: stripeRes.url };
}
