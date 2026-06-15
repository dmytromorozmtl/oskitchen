import { z } from "zod";

import { orderCustomerFieldsSchema } from "@/lib/orders/order-customer-fields";
import { FULFILLMENT_DETAIL_KEYS } from "@/lib/orders/order-fulfillment";
import { ORDER_CREATION_TYPES } from "@/lib/orders/order-types";
import { ORDER_STATUS_KEYS } from "@/lib/orders/order-status";
import { PAYMENT_MODE_KEYS } from "@/lib/orders/order-payment";

const lineSchema = z.object({
  /** Resolved menu product id (preferred). */
  productId: z.string().uuid().optional(),
  /** Free-text title for a custom item. */
  title: z.string().min(1).max(255).optional(),
  sku: z.string().max(120).optional(),
  quantity: z.coerce.number().int().positive().max(9999),
  unitPrice: z.coerce.number().nonnegative().max(1_000_000).optional(),
  notes: z.string().max(2000).optional(),
  preparedDate: z.string().optional(),
  modifiersJson: z.string().max(4000).optional(),
  /** Reference to a `MenuMapping`/`ChannelProductMapping` id when present. */
  sourceMappingId: z.string().uuid().optional(),
}).refine((l) => Boolean(l.productId) || Boolean(l.title), {
  message: "Line item requires a product or a title.",
  path: ["title"],
});

export const orderCreateInputSchema = z.object({
  orderType: z.enum(ORDER_CREATION_TYPES),
  statusKey: z.enum(ORDER_STATUS_KEYS).optional(),
  fulfillmentDetail: z.enum(FULFILLMENT_DETAIL_KEYS).optional(),
  paymentMode: z.enum(PAYMENT_MODE_KEYS).optional(),

  customerId: z.string().uuid().optional(),
  customerName: orderCustomerFieldsSchema.shape.customerName.optional(),
  customerEmail: orderCustomerFieldsSchema.shape.customerEmail.optional(),
  customerPhone: orderCustomerFieldsSchema.shape.customerPhone.optional(),

  brandId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),

  fulfillmentDate: z.string().optional(),
  fulfillmentWindowStart: z.string().optional(),
  fulfillmentWindowEnd: z.string().optional(),

  pickupLocationId: z.string().uuid().optional(),
  deliveryAddressJson: z
    .object({
      line1: z.string().max(255).optional(),
      line2: z.string().max(255).optional(),
      city: z.string().max(120).optional(),
      region: z.string().max(120).optional(),
      postalCode: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),

  notes: z.string().max(4000).optional(),
  kitchenNotes: z.string().max(4000).optional(),
  packingNotes: z.string().max(4000).optional(),
  deliveryNotes: z.string().max(4000).optional(),
  allergyNotes: z.string().max(2000).optional(),
  dietaryNotes: z.string().max(2000).optional(),

  subtotal: z.coerce.number().nonnegative().max(10_000_000).optional(),
  taxAmount: z.coerce.number().nonnegative().max(10_000_000).optional(),
  feesAmount: z.coerce.number().nonnegative().max(10_000_000).optional(),
  discountAmount: z.coerce.number().nonnegative().max(10_000_000).optional(),
  loyaltyPointsRedeem: z.coerce.number().int().nonnegative().max(1_000_000).optional(),
  /** Pre-computed total. If omitted, the server recomputes from lines + price overrides. */
  total: z.coerce.number().nonnegative().max(10_000_000).optional(),

  channelProvider: z.string().max(40).optional(),
  externalOrderId: z.string().max(255).optional(),
  persistedOrderType: z.string().max(40).optional(),
  creationSourceOverride: z.string().max(40).optional(),
  sourceMetadataJson: z.string().max(8000).optional(),

  lines: z.array(lineSchema).max(200),
});

export type OrderCreateInput = z.infer<typeof orderCreateInputSchema>;
