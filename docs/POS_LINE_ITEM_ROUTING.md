# POS line item routing (order detail)

## Implementation

- **Library:** `lib/orders/line-item-routing.ts` — `buildLineItemRoutingRow`.
- **UI:** Order detail **Items** tab — columns Ops route, Kitchen, plus per-line explanation.

## Logic (v1 heuristic)

1. If a `ProductionWorkItem` matches the line (`orderItemId` or `productId`) → **Kitchen / production** with explanation “work item created”.
2. Else if custom line (no `productId`) → **Custom**.
3. Else if product has a **recipe** but no work item → **Production later** (routing gap / not yet enqueued).
4. Else → **Ready now** (typical grab-and-go / no kitchen ticket).

## Production tab

- Explains count mismatch between line items and work items.

Future: drive from explicit product flags (e.g. `requiresKitchen`, pack-out templates) when available.
