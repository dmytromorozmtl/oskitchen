import { z } from "zod";

export const storeCartLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  modifierOptionIds: z.array(z.string().uuid()).max(24).optional(),
  quantity: z.number().int().positive().max(500),
});

export const storeCartLinePricedSchema = storeCartLineSchema.extend({
  lineKey: z.string().min(8).max(200),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
  title: z.string(),
  variantTitle: z.string().optional(),
  modifierLabels: z.array(z.string()).optional(),
  soldOut: z.boolean(),
  canAddToCart: z.boolean(),
});

export const storeCartPayloadSchema = z.object({
  menuId: z.string().uuid(),
  priceVersion: z.string().min(8).max(64),
  currency: z.string().min(3).max(8),
  lines: z.array(storeCartLinePricedSchema),
  subtotal: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});

export const storeCartWarningSchema = z.object({
  code: z.enum([
    "PRICE_CHANGED",
    "SOLD_OUT",
    "NOT_ON_MENU",
    "QUANTITY_CAPPED",
    "MENU_CHANGED",
    "INVALID_VARIANT",
    "INVALID_MODIFIERS",
  ]),
  productId: z.string().uuid().optional(),
  lineKey: z.string().optional(),
  message: z.string(),
});

export const storeCartApiResponseSchema = z.object({
  ok: z.literal(true),
  cart: storeCartPayloadSchema,
  warnings: z.array(storeCartWarningSchema).optional(),
});

export const storeCartPatchSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  /** Legacy map productId → qty (default variant, no modifiers). */
  lines: z.record(z.string().uuid(), z.number().int().min(0).max(500)).optional(),
  /** v2 full line updates (preferred when variants/modifiers are used). */
  cartLines: z.array(storeCartLineSchema).optional(),
  lineDelta: z
    .object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      modifierOptionIds: z.array(z.string().uuid()).max(24).optional(),
      delta: z.number().int().min(-500).max(500),
    })
    .optional(),
  merge: z.boolean().optional().default(true),
  clientPriceVersion: z.string().max(64).optional(),
});

export type StoreCartLine = z.infer<typeof storeCartLineSchema>;
export type StoreCartLinePriced = z.infer<typeof storeCartLinePricedSchema>;
export type StoreCartPayload = z.infer<typeof storeCartPayloadSchema>;
export type StoreCartWarning = z.infer<typeof storeCartWarningSchema>;
export type StoreCartApiResponse = z.infer<typeof storeCartApiResponseSchema>;
