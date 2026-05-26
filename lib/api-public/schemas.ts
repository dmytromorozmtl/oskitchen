import { z } from "zod";

export const publicApiRecipeCreateSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(255),
  yieldQuantity: z.number().positive().optional(),
  yieldUnit: z.string().max(40).optional(),
});

export const publicApiWebhookCreateSchema = z.object({
  topic: z.string().min(1).max(120).optional(),
  payload: z.unknown().optional(),
});
