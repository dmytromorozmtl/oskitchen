"use server";


import { fail, ok } from "@/lib/action-result";
import { format, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { generateStorefrontPublicToken } from "@/lib/store-token";
import { safeError } from "@/lib/security";
import { SITE_URL } from "@/lib/constants";
import { sendOrderConfirmation } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { isDateInStorefrontBlackout } from "@/lib/storefront/blackout";
import { validateStorefrontDelivery } from "@/lib/storefront/delivery-validation";
import {
  buildCartSnapshotEnvelope,
  orderSourceWithMarket,
} from "@/lib/storefront/cart-snapshot";
import {
  fingerprintFromStorefrontCartJson,
  isPastDailyOrderCutoff,
  parsePickupDeliveryNotes,
  stableCartFingerprint,
} from "@/lib/storefront/checkout";
import { resolveActiveMarket } from "@/lib/storefront/market-resolve";
import {
  mergeKitchenLegacyTax,
  taxSettingsFromKitchenSettings,
} from "@/lib/storefront/tax-settings";
import { isStorefrontOnlineCheckoutAvailable } from "@/services/storefront/storefront-payment-service";
import { runStorefrontFulfillmentRuleEngine } from "@/services/storefront/storefront-fulfillment-rule-engine";
import { stripeMinorAmountForOrder } from "@/services/storefront/storefront-currency-service";
import { createStorefrontStripeCheckoutSession } from "@/services/storefront/storefront-stripe-checkout-service";
import { upsertCustomerFromOrder } from "@/services/crm/customer-service";
import { recomputeMetricsForOrderEmail } from "@/services/crm/customer-metrics-service";
import { enforceStorefrontRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";
import { markCartRecoveryConverted } from "@/services/storefront/storefront-cart-recovery-service";
import { computeCheckoutTotals } from "@/lib/storefront/checkout-totals";
import {
  buildOrderConfirmationCommerce,
  orderConfirmationTotalsHtml,
} from "@/lib/storefront/order-confirmation-email";
import { quoteStorefrontTaxFromAddress } from "@/lib/storefront/tax-provider";
import {
  checkoutExtensionsFromKitchenSettings,
  computeDepositAmount,
  computeTipAmount,
} from "@/lib/storefront/checkout-extensions";
import { checkoutSubmitV2Schema } from "@/lib/storefront/contracts/checkout-v2";
import { quoteStorefrontShipping } from "@/lib/storefront/shipping-engine";
import { buildStorefrontMenuCatalog } from "@/services/storefront/storefront-menu-catalog-service";
import { priceCartLines } from "@/services/storefront/storefront-cart-service";
import { upsertStorefrontCustomer } from "@/services/storefront/storefront-customer-service";
import {
  markStorefrontOnlinePaymentFailed,
  retryStorefrontOnlinePaymentByToken,
} from "@/services/storefront/storefront-payment-recovery-service";
import {
  buildStorefrontOrderCustomerEmailEqualsWhere,
  encryptStorefrontOrderPiiFields,
} from "@/lib/storefront/storefront-order-pii";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

const submitSchema = checkoutSubmitV2Schema;
const retryPublicStorefrontPaymentSchema = z.object({
  slug: z.string().trim().min(1),
  token: z.string().trim().min(8).max(64),
});

export async function submitPublicStorefrontOrder(raw: unknown) {
  try {
    const parsed = submitSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Invalid checkout payload." };
    }
    const body = parsed.data;

    if (body.websiteUrl?.trim()) {
      return { error: "Invalid checkout payload." };
    }

    const rate = await enforceStorefrontRateLimit("storefront_checkout_submit", {
      scopeSuffix: body.slug,
    });
    if (!rate.ok) {
      return { error: rate.message };
    }

    const captcha = await verifyTurnstileToken(body.captchaToken);
    if (!captcha.ok) {
      return { error: captcha.error };
    }

    const sf = await prisma.storefrontSettings.findUnique({
      where: { storeSlug: body.slug },
      include: {
        activeMenu: {
          include: {
            products: { where: { active: true, storefrontVisible: true } },
          },
        },
        blackoutDates: true,
        fulfillmentRules: { where: { active: true }, orderBy: { priority: "desc" } },
      },
    });

    if (!sf?.enabled || !sf.preorderEnabled) {
      return { error: "This storefront is not accepting orders right now." };
    }
    if (!sf.published) {
      return { error: "This storefront is not published yet." };
    }
    if (isStorefrontInClosureWindow(sf)) {
      return { error: "This kitchen is temporarily closed for online orders." };
    }
    if (!sf.activeMenuId || !sf.activeMenu) {
      return { error: "No published menu is linked to this storefront." };
    }
    if (sf.activeMenu.catalogOnly) {
      return { error: "No published menu is linked to this storefront." };
    }

    if (body.fulfillmentType === "PICKUP" && !sf.pickupEnabled) {
      return { error: "Pickup is not enabled." };
    }
    if (body.fulfillmentType === "DELIVERY" && !sf.deliveryEnabled) {
      return { error: "Delivery is not enabled." };
    }

    const termsRequired = Boolean(sf.termsText?.trim());
    if (termsRequired && !body.termsAccepted) {
      return { error: "Please accept the terms to place an order." };
    }

    if (isPastDailyOrderCutoff(sf.orderCutoffTime, sf.timezone)) {
      return {
        error:
          "This kitchen is past today's online order cutoff for now — try again tomorrow or contact them directly.",
      };
    }

    if (sf.maxOrdersPerDay != null && sf.maxOrdersPerDay > 0) {
      const dayStart = startOfDay(new Date());
      const todayCount = await prisma.storefrontOrder.count({
        where: {
          storefrontId: sf.id,
          isTestOrder: false,
          createdAt: { gte: dayStart },
        },
      });
      if (todayCount >= sf.maxOrdersPerDay) {
        return { error: "Daily order limit reached — please try again tomorrow." };
      }
    }

    const marketCtx = await resolveActiveMarket({
      storeSlug: body.slug,
      storefrontUserId: sf.userId,
      defaultActiveMenuId: sf.activeMenuId,
      currency: sf.currency,
      marketIdFromQuery: body.marketId ?? null,
    });
    const effectiveMenuId = marketCtx.activeMenuId ?? sf.activeMenuId;
    if (!effectiveMenuId) {
      return { error: "No published menu is linked to this storefront." };
    }

    const catalog = await buildStorefrontMenuCatalog({
      storefrontId: sf.id,
      storeSlug: body.slug,
      menuId: effectiveMenuId,
      currency: marketCtx.market.currency ?? sf.currency,
      marketId: marketCtx.market.id,
      marketProductIds: marketCtx.productIds,
    });
    if (!catalog) {
      return { error: "Storefront menu is not available for this market." };
    }

    const menuProductIds = new Set(catalog.products.map((p) => p.id));
    for (const line of body.lines) {
      if (!menuProductIds.has(line.productId)) {
        return { error: "One or more items are not on the current menu." };
      }
    }
    if (body.priceVersion && body.priceVersion !== catalog.priceVersion) {
      return {
        error: "Menu prices or availability changed — refresh your cart and try again.",
      };
    }

    const priced = priceCartLines(body.lines, catalog, { clientPriceVersion: body.priceVersion });
    const soldOutWarning = priced.warnings.find((w) => w.code === "SOLD_OUT");
    if (soldOutWarning) {
      return { error: soldOutWarning.message };
    }
    if (priced.cart.lines.length === 0) {
      return { error: "Your cart is empty or items are no longer available." };
    }

    const subtotal = priced.cart.subtotal;
    const lineSnapshots = priced.cart.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      modifierOptionIds: l.modifierOptionIds,
      title: l.variantTitle ? `${l.title} — ${l.variantTitle}` : l.title,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      modifierLabels: l.modifierLabels,
    }));

    const guestNotes = parsePickupDeliveryNotes(body.customerNotes);

    const fpNew = stableCartFingerprint(body.lines);
    const recentDup = await prisma.storefrontOrder.findFirst({
      where: {
        AND: [
          {
            storefrontId: sf.id,
            createdAt: { gte: new Date(Date.now() - 45_000) },
          },
          buildStorefrontOrderCustomerEmailEqualsWhere(body.customerEmail),
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    if (recentDup) {
      const prevFp = fingerprintFromStorefrontCartJson(recentDup.cartJson);
      if (prevFp && prevFp === fpNew) {
        revalidatePath(`/s/${sf.storeSlug}`);
        return {
          ok: true as const,
          token: recentDup.publicToken,
          duplicateOrder: true as const,
        };
      }
    }

    const pickupDate =
      body.pickupDate && body.fulfillmentType === "PICKUP" ? new Date(body.pickupDate) : undefined;
    const deliveryDate =
      body.deliveryDate && body.fulfillmentType === "DELIVERY" ? new Date(body.deliveryDate) : undefined;

    if (body.fulfillmentType === "PICKUP" && !pickupDate) {
      return { error: "Please choose a pickup date." };
    }

    let pickupWindowLabel: string | null = null;
    if (body.pickupWindowId) {
      const pickupWindow = await prisma.pickupWindow.findFirst({
        where: {
          id: body.pickupWindowId,
          userId: sf.userId,
          storeSlug: body.slug,
          active: true,
        },
      });
      if (!pickupWindow || pickupWindow.currentOrders >= pickupWindow.maxOrders) {
        return { error: "That pickup time slot is no longer available." };
      }
      pickupWindowLabel = `${pickupWindow.startTime}–${pickupWindow.endTime}`;
    }
    if (body.fulfillmentType === "DELIVERY" && !deliveryDate) {
      return { error: "Please choose a delivery date." };
    }

    const fulfillmentDay = pickupDate ?? deliveryDate;
    if (isDateInStorefrontBlackout(sf.blackoutDates, fulfillmentDay)) {
      return {
        error:
          "That date is not available for online orders — choose another day or contact the kitchen directly.",
      };
    }

    const deliveryCheck = validateStorefrontDelivery(sf, {
      fulfillmentType: body.fulfillmentType,
      deliveryAddress: body.deliveryAddress,
      subtotal,
    });
    if (!deliveryCheck.ok) {
      return { error: deliveryCheck.error ?? "Delivery is not available for this address." };
    }

    const ruleCheck = await runStorefrontFulfillmentRuleEngine(sf, {
      fulfillmentType: body.fulfillmentType,
      fulfillmentDate: fulfillmentDay!,
      productIds: body.lines.map((l) => l.productId),
      subtotal,
      matchedZoneName: deliveryCheck.matchedZoneName,
      orderingNow: new Date(),
    });
    if (!ruleCheck.allowed) {
      return { error: ruleCheck.blockers[0] ?? "This order cannot be placed for the selected date." };
    }

    const min = sf.minimumOrderAmount != null ? Number(sf.minimumOrderAmount) : null;
    if (min != null && subtotal < min) {
      return { error: "Order is below the minimum for this storefront." };
    }

    const wantsOnline = body.checkoutPayment === "online";
    if (wantsOnline && !isStorefrontOnlineCheckoutAvailable(sf)) {
      return {
        error:
          "Online card checkout is not available for this storefront yet — choose pay later or contact the kitchen.",
      };
    }

    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: sf.userId },
      select: {
        deliveryFee: true,
        defaultTaxRate: true,
        taxIncludedInPrices: true,
        taxDisplayName: true,
        settingsCenterJson: true,
      },
    });
    let discountAmount = 0;
    let promoId: string | null = null;
    let promoFreeDelivery = false;
    const rawPromo = body.promoCode?.trim();
    if (rawPromo) {
      const promo = await prisma.storefrontDiscount.findFirst({
        where: {
          storefrontId: sf.id,
          active: true,
          code: { equals: rawPromo, mode: "insensitive" },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!promo) {
        return { error: "That promo code is not valid." };
      }
      if (promo.maxUses != null && promo.usesCount >= promo.maxUses) {
        return { error: "That promo code is no longer available." };
      }
      if (promo.kind === "PERCENT_OFF" && promo.percentOff != null) {
        discountAmount = Math.round(subtotal * (Number(promo.percentOff) / 100) * 100) / 100;
      } else if (promo.kind === "FIXED_OFF" && promo.amountOff != null) {
        discountAmount = Math.min(subtotal, Number(promo.amountOff));
      } else if (promo.kind === "FREE_DELIVERY") {
        promoFreeDelivery = true;
      }
      promoId = promo.id;
    }

    let deliveryFee = 0;
    if (body.fulfillmentType === "DELIVERY") {
      const shipQuote = quoteStorefrontShipping(sf, {
        fulfillmentType: "DELIVERY",
        deliveryAddress: body.deliveryAddress,
        subtotal,
      });
      if (!shipQuote.ok) {
        return { error: shipQuote.error ?? "Delivery is not available for this address." };
      }
      deliveryFee = promoFreeDelivery ? 0 : shipQuote.deliveryFee;
    }

    const extensions = checkoutExtensionsFromKitchenSettings(kitchen?.settingsCenterJson);
    const tipAmount = computeTipAmount(subtotal - discountAmount, body.tipPercent ?? null);
    const depositAmount = computeDepositAmount(subtotal - discountAmount, extensions);
    const taxSettings = mergeKitchenLegacyTax(taxSettingsFromKitchenSettings(kitchen?.settingsCenterJson), {
      defaultTaxRate: kitchen?.defaultTaxRate != null ? Number(kitchen.defaultTaxRate) : null,
      taxDisplayName: kitchen?.taxDisplayName ?? null,
      taxIncludedInPrices: kitchen?.taxIncludedInPrices === true,
    });
    if (body.fulfillmentType === "DELIVERY" && body.deliveryAddress?.trim()) {
      await quoteStorefrontTaxFromAddress({
        address: { line1: body.deliveryAddress },
        subtotal,
        discountAmount: 0,
        deliveryFee: 0,
        fallbackSettings: taxSettings,
      });
    }
    const totals = computeCheckoutTotals({
      subtotal,
      deliveryFee,
      discountAmount,
      taxSettings,
      tipAmount,
      depositAmount,
    });
    const tax = totals.tax;
    const total = totals.total;
    const cartSnapshot = buildCartSnapshotEnvelope({
      marketId: marketCtx.market.id,
      lines: lineSnapshots,
      taxBreakdown: totals.taxBreakdown,
      taxMode: taxSettings.mode,
      taxRegionCode: taxSettings.regionCode ?? null,
    });

    if (wantsOnline) {
      const minor = stripeMinorAmountForOrder(total, sf);
      if (!minor.ok) {
        return { error: minor.error };
      }
    }

    const deliveryAddressJson =
      body.fulfillmentType === "DELIVERY" && body.deliveryAddress
        ? { raw: body.deliveryAddress }
        : undefined;

    const publicToken = generateStorefrontPublicToken();
    const orderNumber = `SF-${Date.now().toString(36).toUpperCase()}`;
    const internalOrderNotes = (() => {
      const base = wantsOnline
        ? "Storefront preorder (online payment pending)"
        : sf.payLaterOnly
          ? "Storefront preorder (pay later / request)"
          : "Storefront order";
      const promoNote = rawPromo ? `\nPromo: ${rawPromo}` : "";
      const slotNote = pickupWindowLabel ? `\nPickup window: ${pickupWindowLabel}` : "";
      return guestNotes
        ? `${base}${promoNote}${slotNote}\nGuest notes: ${guestNotes}`
        : `${base}${promoNote}${slotNote}`;
    })();

    const fulfillmentDate = pickupDate ?? deliveryDate;

    const { createdOrder, storefrontOrder } = await prisma.$transaction(async (tx) => {
      const o = await persistResolvedOrder(
        {
          userId: sf.userId,
          db: tx,
        },
        {
          orderType: "STOREFRONT_ORDER",
          creationSource: "STOREFRONT",
          statusKey: wantsOnline ? "REQUESTED" : "CONFIRMED",
          paymentMode: wantsOnline ? "STRIPE_PLACEHOLDER" : "PAY_LATER",
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone ?? undefined,
          fulfillmentDetail: body.fulfillmentType,
          fulfillmentDate: fulfillmentDate?.toISOString(),
          deliveryAddressJson: deliveryAddressJson as Prisma.InputJsonValue | undefined,
          notes: internalOrderNotes,
          subtotal,
          taxAmount: tax,
          feesAmount: deliveryFee,
          discountAmount: discountAmount || undefined,
          total,
          sourceMetadataJson:
            wantsOnline && promoId
              ? ({ pendingStorefrontPromoId: promoId } as Prisma.InputJsonValue)
              : undefined,
          lines: priced.cart.lines.map((line) => ({
            productId: line.productId,
            title: line.variantTitle ? `${line.title} — ${line.variantTitle}` : line.title,
            sku: undefined,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.unitPrice * line.quantity,
            notes: undefined,
            preparedDate: null,
            modifiersJson: line.modifierLabels?.length
              ? ({
                  labels: line.modifierLabels,
                  optionIds: line.modifierOptionIds ?? [],
                } as Prisma.InputJsonValue)
              : null,
            sourceMappingId: null,
          })),
        },
      );

      const storefrontPii = encryptStorefrontOrderPiiFields({
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
      });

      const sfo = await tx.storefrontOrder.create({
        data: {
          userId: sf.userId,
          storefrontId: sf.id,
          orderNumber,
          customerName: storefrontPii.customerName!,
          customerEmail: storefrontPii.customerEmail!,
          customerPhone: storefrontPii.customerPhone ?? undefined,
          customerNotes: guestNotes,
          fulfillmentType: body.fulfillmentType,
          pickupDate: pickupDate ?? null,
          deliveryDate: deliveryDate ?? null,
          deliveryAddressJson: deliveryAddressJson ?? undefined,
          subtotal,
          tax,
          deliveryFee,
          discount: discountAmount,
          total,
          paymentMode: wantsOnline ? "ONLINE_PAYMENT" : "PAY_LATER",
          paymentStatus: wantsOnline ? "PENDING" : "NOT_REQUIRED",
          status: wantsOnline ? "SUBMITTED" : "SUBMITTED",
          publicToken,
          internalOrderId: o.orderId,
          cartJson: cartSnapshot as Prisma.InputJsonValue,
          source: orderSourceWithMarket("storefront", marketCtx.market.id),
          lineItems: {
            create: lineSnapshots.map((c) => ({
              productId: c.productId,
              variantId: c.variantId ?? undefined,
              title: c.title,
              quantity: c.quantity,
              unitPrice: c.unitPrice,
              total: c.unitPrice * c.quantity,
              modifiersJson: c.modifierLabels?.length
                ? { labels: c.modifierLabels, optionIds: c.modifierOptionIds ?? [] }
                : undefined,
            })),
          },
        },
      });

      if (promoId && !wantsOnline) {
        await tx.storefrontDiscount.update({
          where: { id: promoId },
          data: { usesCount: { increment: 1 } },
        });
      }

      if (body.pickupWindowId) {
        await tx.pickupWindow.update({
          where: { id: body.pickupWindowId },
          data: { currentOrders: { increment: 1 } },
        });
      }

      return { createdOrder: o, storefrontOrder: sfo };
    });

    if (wantsOnline) {
      const minor = stripeMinorAmountForOrder(total, sf);
      if (!minor.ok) {
        return { error: minor.error };
      }
      const useConnect =
        Boolean(sf.stripeConnectAccountId?.trim()) && sf.stripeConnectChargesEnabled;
      const stripeRes = await createStorefrontStripeCheckoutSession({
        storefrontOrderId: storefrontOrder.id,
        storefrontSlug: sf.storeSlug,
        publicToken,
        amountTotal: total,
        amountMinor: minor.amountMinor,
        stripeCurrency: minor.currency,
        orderNumber,
        merchantUserId: sf.userId,
        pendingPromoId: promoId,
        stripeConnectAccountId: useConnect ? sf.stripeConnectAccountId : null,
        applicationFeeBps: useConnect ? sf.stripeApplicationFeeBps : null,
      });
      if (!stripeRes.ok) {
        await markStorefrontOnlinePaymentFailed({
          storefrontOrderId: storefrontOrder.id,
          storefrontId: sf.id,
          publicToken,
          merchantUserId: sf.userId,
          reason: stripeRes.error,
          phase: "initial_checkout",
        });
        revalidatePath("/dashboard/order-hub");
        revalidatePath("/dashboard/orders");
        revalidatePath(`/s/${sf.storeSlug}`);
        return { ok: true as const, token: publicToken };
      }
      await prisma.storefrontConversionEvent.create({
        data: {
          storefrontId: sf.id,
          eventName: "order_created",
          metadataJson: {
            total,
            fulfillment: body.fulfillmentType,
            promo: rawPromo ?? undefined,
            payment: "online_pending",
          },
        },
      });
      await upsertCustomerFromOrder({
        userId: sf.userId,
        email: body.customerEmail,
        name: body.customerName,
        phone: body.customerPhone ?? null,
        source: "STOREFRONT",
        orderId: createdOrder.orderId,
        orderTotal: total,
        marketingConsent: Boolean(body.guestMarketingOptIn),
      });
      await upsertStorefrontCustomer({
        storefrontId: sf.id,
        email: body.customerEmail,
      });
      await markCartRecoveryConverted(sf.id, body.customerEmail);
      await recomputeMetricsForOrderEmail(sf.userId, body.customerEmail);
      revalidatePath("/dashboard/order-hub");
      revalidatePath("/dashboard/orders");
      revalidatePath(`/s/${sf.storeSlug}`);
      revalidatePath("/dashboard/customers");
      return { ok: true as const, token: publicToken, stripeCheckoutUrl: stripeRes.url };
    }

    await prisma.storefrontConversionEvent.create({
      data: {
        storefrontId: sf.id,
        eventName: "order_created",
        metadataJson: {
          total,
          fulfillment: body.fulfillmentType,
          promo: rawPromo ?? undefined,
        },
      },
    });

    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId: sf.userId },
    });

    if (settings?.notifyOrderConfirmation) {
      const commerce = buildOrderConfirmationCommerce({
        marketName: marketCtx.market.name,
        marketId: marketCtx.market.id,
        subtotal,
        discount: discountAmount,
        deliveryFee,
        taxBreakdown: totals.taxBreakdown,
        taxTotal: tax,
        taxIncludedInPrices: totals.taxIncludedInPrices,
      });
      await sendOrderConfirmation({
        to: body.customerEmail,
        customerName: body.customerName,
        orderId: createdOrder.orderId,
        total: formatCurrency(total),
        lookupUrl: `${SITE_URL}/order/${createdOrder.lookupToken}`,
        businessName: sf.publicName ?? settings.businessName,
        fulfillmentLabel: body.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup",
        fulfillmentDate: fulfillmentDate ? format(fulfillmentDate, "PP") : undefined,
        lines: lineSnapshots.map((line) => ({
          title: line.title,
          quantity: line.quantity,
        })),
        marketLabel: commerce.marketLabel,
        totalsHtml: orderConfirmationTotalsHtml(commerce),
      });
    }

    await upsertCustomerFromOrder({
      userId: sf.userId,
      email: body.customerEmail,
      name: body.customerName,
      phone: body.customerPhone ?? null,
      source: "STOREFRONT",
      orderId: createdOrder.orderId,
      orderTotal: total,
      marketingConsent: Boolean(body.guestMarketingOptIn),
    });
    await upsertStorefrontCustomer({
      storefrontId: sf.id,
      email: body.customerEmail,
    });
    await markCartRecoveryConverted(sf.id, body.customerEmail);
    await recomputeMetricsForOrderEmail(sf.userId, body.customerEmail);

    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/s/${sf.storeSlug}`);
    revalidatePath("/dashboard/customers");
    return { ok: true as const, token: publicToken };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function retryPublicStorefrontPayment(raw: unknown) {
  try {
    const parsed = retryPublicStorefrontPaymentSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Invalid payment retry request." };
    }

    const rate = await enforceStorefrontRateLimit("storefront_checkout_retry", {
      scopeSuffix: `${parsed.data.slug}:${parsed.data.token.slice(0, 12)}`,
    });
    if (!rate.ok) {
      return { error: rate.message };
    }

    const result = await retryStorefrontOnlinePaymentByToken({
      publicToken: parsed.data.token,
      storeSlug: parsed.data.slug,
    });

    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/s/${parsed.data.slug}/order/${parsed.data.token}`);
    revalidatePath(`/s/${parsed.data.slug}`);

    if (!result.ok) {
      return { error: result.error };
    }

    return { ok: true as const, stripeCheckoutUrl: result.stripeCheckoutUrl };
  } catch (e) {
    return { error: safeError(e) };
  }
}
