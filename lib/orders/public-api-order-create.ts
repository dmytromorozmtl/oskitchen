import { z } from "zod";

import { fulfillmentSchema } from "@/lib/schemas";
import { orderCustomerFieldsSchema } from "@/lib/orders/order-customer-fields";

/**
 * Enterprise public API — minimal order create (no line items).
 * Customer field limits match `orderCreateInputSchema` / dashboard.
 */
export const publicApiOrderCreateSchema = orderCustomerFieldsSchema.extend({
  total: z.number().nonnegative().max(10_000_000),
  fulfillmentType: fulfillmentSchema.optional(),
  notes: z.string().trim().max(5000).optional().nullable(),
  /** Optional brand/location when workspace migration completes. */
  brandId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

export type PublicApiOrderCreateInput = z.infer<typeof publicApiOrderCreateSchema>;
