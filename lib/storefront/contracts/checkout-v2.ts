import { z } from "zod";

import { storeCartLineSchema } from "@/lib/storefront/contracts/cart";

/** Checkout submit payload v2 — variant + modifier aware lines. */
export const checkoutLineV2Schema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  modifierOptionIds: z.array(z.string().uuid()).max(24).optional(),
  quantity: z.number().int().positive().max(500),
});

export const checkoutSubmitV2Schema = z.object({
  slug: z.string().min(2).max(120),
  /** Active market from ?market= or kos_market cookie — persisted on the order snapshot. */
  marketId: z.string().min(1).max(64).optional(),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(40).optional(),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY"]),
  pickupDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().max(2000).optional(),
  lines: z.array(checkoutLineV2Schema).min(1).max(100),
  termsAccepted: z.boolean().optional(),
  customerNotes: z.string().max(2000).optional(),
  promoCode: z.string().max(40).optional(),
  priceVersion: z.string().max(64).optional(),
  tipPercent: z.number().min(0).max(100).optional(),
  checkoutPayment: z.enum(["pay_later", "online"]).optional(),
  captchaToken: z.string().max(4096).optional(),
  websiteUrl: z.string().max(200).optional(),
  guestMarketingOptIn: z.boolean().optional(),
  pickupWindowId: z.string().uuid().optional(),
});

export const shippingQuoteRequestSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY"]),
  deliveryAddress: z.string().max(2000).optional(),
  subtotal: z.number().nonnegative(),
});

export type CheckoutLineV2 = z.infer<typeof checkoutLineV2Schema>;
export type CheckoutSubmitV2 = z.infer<typeof checkoutSubmitV2Schema>;

/** Back-compat: map v2 lines to legacy cart line schema for shared pricing paths. */
export function toStoreCartLines(lines: CheckoutLineV2[]): z.infer<typeof storeCartLineSchema>[] {
  return lines.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    modifierOptionIds: l.modifierOptionIds,
    quantity: l.quantity,
  }));
}
