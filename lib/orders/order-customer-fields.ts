import { z } from "zod";

/** Shared customer identity fields — dashboard, public API, imports. */
export const orderCustomerFieldsSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(255),
  customerEmail: z.string().trim().email("Valid email required").max(255),
  customerPhone: z.string().trim().max(64).optional().nullable(),
});

export type OrderCustomerFields = z.infer<typeof orderCustomerFieldsSchema>;
