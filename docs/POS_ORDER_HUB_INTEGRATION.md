# POS — Order Hub Integration

## Source attribution

- Orders created by POS checkout use `orderType = POS_SALE` and `creationSource = POS` (see `services/orders/order-creation-service.ts`).
- Order Hub internal table shows channel **POS** when `creationSource === "POS"` or `orderType === "POS_SALE"` (`app/dashboard/order-hub/page.tsx`).

## Triage tab

- New hub tab **`pos`** filters internal orders to POS-sourced rows (`services/order-hub/order-triage-service.ts`).
- External/channel rows are empty on this tab (POS is internal capture only).

## Mapping

- POS lines that reference real `productId` values follow the same production mapping assumptions as manual orders.
- Custom lines (`title` without `productId`) behave like other custom manual lines — operators should validate kitchen notes.

## Deep links

- Transactions table links to `/dashboard/orders/[id]` for fulfillment and audit history shared with other channels.
