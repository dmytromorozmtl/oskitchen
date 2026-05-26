# Catering — Production / Packing / Routes Handoff

## Strategy

We do **not** introduce a parallel production/packing/routes pipeline
for catering. We re-use the existing pipelines by ensuring that once a
quote is converted into an `Order`, the order behaves like any other
order in the system. This is the safest and most maintainable approach.

## What flows where

| Catering quote field | Becomes |
|----------------------|---------|
| `eventDate` | `Order.pickupDate` |
| `serviceStyle / deliveryRequired` | `Order.fulfillmentType` (`DELIVERY` or `PICKUP`) |
| `customerName / customerEmail / customerPhone` | `Order.customer*` |
| `brandId / locationId` | `Order.brandId / locationId` |
| `allergyNotes / dietaryNotes / clientNotes / internalNotes` | concatenated into `Order.notes` |
| `CateringQuoteItem` w/ `productId` | `OrderItem` rows |
| `total` | `Order.total` |

## Downstream surfaces

Because the `Order` is a regular `PENDING` order, all existing tools
take over from there:

- **Order Hub** — `/dashboard/order-hub` shows the new order.
- **Production** — Production planning groups orders into batches.
- **Kitchen Screen** — sees `Order.notes` (allergies/dietary
  included).
- **Packing** — generates labels/manifests from the same data.
- **Packing Verification** — order items appear for QA.
- **Routes** — when `fulfillmentType=DELIVERY`, the order shows up in
  route planning.
- **Tasks** — operators can attach tasks to the order via the existing
  task system.

## Lines without product links

Catering quotes commonly include service/staffing/setup lines that are
not `Product` rows. Those lines are **not** copied into `OrderItem`
because `OrderItem` requires `productId`. The preview surfaces a
warning (`"N line(s) without a linked product will not appear on the
order."`), and they remain visible on the quote. This is intentional —
service line items live on the quote/invoice, not on the production
order.

## Future hooks (documented, not implemented)

- `ProductionBatch.cateringQuoteId` — to label batches with the
  source event.
- Catering-specific packing batch templates.
- Setup/staffing tasks auto-created on conversion when those flags are
  set.
