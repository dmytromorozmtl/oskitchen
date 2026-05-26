# Items flow

The Items step adapts per `OrderCreationModeConfig`:

- `PREORDER`: only products from the currently active weekly menu.
- `RESTAURANT_ORDER` / `CAFE_ORDER` / `MANUAL_ORDER` / `BAKERY_ORDER`:
  any active product across the workspace + custom lines.
- `CATERING_ORDER` / `BAR_EVENT_ORDER`: catalog + custom lines (no
  weekly menu).
- `MEAL_PLAN_ORDER`: catalog only; no custom lines (meal plan cycle
  items are managed elsewhere and pre-populated).
- `CUSTOM_ORDER`: catalog + custom lines, no preset.

## Custom line items

`OrderItem.productId` is now nullable. When a line has no `productId`,
it stores `title`, optional `sku`, `unitPrice`, `lineTotal`, `notes`,
`preparedDate`, and `modifiersJson`. The packing, production, and
verification services skip lines with no `productId` because no recipe
exists.

## Pricing

The service computes:

```
unitPrice  = line.unitPrice ?? product.price ?? 0
lineTotal  = unitPrice * quantity
subtotal   = sum(lineTotal)
total      = subtotal + tax + fees − discount
```

If the request supplies an explicit `total`, it is used as-is. Otherwise
the service computes from the line totals.
