import { z } from "zod";

export const reorderLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  modifierOptionIds: z.array(z.string().uuid()).optional(),
  quantity: z.number().int().positive().max(500),
  title: z.string().optional(),
});

export type ReorderLine = z.infer<typeof reorderLineSchema>;

export const reorderResultSchema = z.object({
  ok: z.literal(true),
  cart: z.object({
    subtotal: z.number(),
    itemCount: z.number(),
    priceVersion: z.string(),
  }),
  warnings: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
        productId: z.string().optional(),
      }),
    )
    .optional(),
  skippedCount: z.number().int().nonnegative().optional(),
});
