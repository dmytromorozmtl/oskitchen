# Order creation architecture

## Layers

```
lib/orders/*                       pure utilities (no I/O)
services/orders/order-creation-service.ts   Prisma writes + pricing
actions/order-creation.ts          Next.js server action (auth + zod)
components/dashboard/orders/order-center.tsx   client stepper UI
app/dashboard/orders/new/page.tsx  server page + permission gate
```

## Source files

| File | Purpose |
|------|---------|
| `lib/orders/order-types.ts` | 11 creation types + labels + descriptions + active-menu requirement map. |
| `lib/orders/order-status.ts` | Widened 10-value status + DB enum map + tone. |
| `lib/orders/order-fulfillment.ts` | 7 fulfillment types + DB enum map + delivery address shape. |
| `lib/orders/order-payment.ts` | Payment modes + payment statuses. |
| `lib/orders/order-creation-modes.ts` | Per-type config: allowed statuses, fulfillments, sources, defaults. |
| `lib/orders/order-validation.ts` | Zod schema for the inbound payload. |
| `services/orders/order-creation-service.ts` | Pricing, line resolution, customer resolution, Prisma write, CRM upsert. |
| `actions/order-creation.ts` | Server action wrapper with permission gate. |
| `components/dashboard/orders/order-center.tsx` | 6-step client UI. |

## Data model (additive)

`Order` columns added by migration `20260526100000_order_creation_center`:

- `customerId UUID NULL` (FK → `kitchen_customers.id`, SET NULL)
- `statusDetail VARCHAR(40) NULL`
- `orderType VARCHAR(40) NULL`
- `paymentMode VARCHAR(40) NULL`
- `paymentStatus VARCHAR(40) NULL`
- `creationSource VARCHAR(40) NULL`
- `fulfillmentDetail VARCHAR(40) NULL`
- `fulfillmentWindowStart TIMESTAMPTZ NULL`
- `fulfillmentWindowEnd TIMESTAMPTZ NULL`
- `pickupLocationId UUID NULL`
- `deliveryAddressJson JSONB NULL`
- `kitchenNotes TEXT NULL`
- `packingNotes TEXT NULL`
- `deliveryNotesExt TEXT NULL`
- `allergyNotes TEXT NULL`
- `dietaryNotes TEXT NULL`
- `subtotal / taxAmount / feesAmount / discountAmount DECIMAL(10,2) NULL`
- `channelProvider VARCHAR(40) NULL`
- `externalOrderIdExt VARCHAR(255) NULL`
- `sourceMetadataJson JSONB NULL`

`OrderItem` columns / changes:

- `productId` → **nullable** (was NOT NULL).
- `title VARCHAR(255) NULL`
- `sku VARCHAR(120) NULL`
- `unitPrice DECIMAL(10,2) NULL`
- `lineTotal DECIMAL(10,2) NULL`
- `notes TEXT NULL`
- `modifiersJson JSONB NULL`
- `preparedDate DATE NULL`
- `sourceMappingId UUID NULL`

The legacy DB enums (`OrderStatus`, `FulfillmentType`) are unchanged — the
widened values live in `statusDetail` and `fulfillmentDetail` string
columns. Helpers `toDbOrderStatus` and `toDbFulfillmentType` translate
between them.
