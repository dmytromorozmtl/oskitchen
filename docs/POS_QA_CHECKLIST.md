# POS — QA Checklist

Run after schema migrate + seed demo data.

## Plan & access

- [ ] Starter / expired trial cannot open `/dashboard/pos` (upgrade card).
- [ ] Pro workspace passes plan gate and sees sidebar **POS Terminal** when module enabled.
- [ ] Disabling `pos_terminal` module hides nav + blocks deep links (`ModuleRouteGate`).

## Registers & terminal

- [ ] Create register from `/dashboard/pos/registers`; appears in terminal selector.
- [ ] Product grid respects `posVisible = false` (item hidden).
- [ ] Barcode search: type barcode + Enter adds matching SKU.

## Checkout

- [ ] Cash sale creates `Order` (`creationSource=POS`), `POSTransaction`, `POSPayment` (PAID), `POSReceipt`, audit + analytics side effects.
- [ ] `PAY_LATER` yields `POSPayment` **PENDING** when order unpaid.
- [ ] `COMPED` blocked for staff without `pos_comp`.
- [ ] Offline blocks placeholder card modes with clear message.

## Order Hub

- [ ] POS tab lists only POS-sourced orders.
- [ ] Channel column reads **POS** for POS orders.

## Shifts (Team+)

- [ ] Open shift then run cash sale; close shift shows variance consistent with cash totals.

## Platform

- [ ] `/platform/pos` loads for platform user; never for client session.

## Regression

- [ ] Manual order creation unchanged.
- [ ] Order Hub non-POS tabs unchanged.

Automate high-value paths with Playwright when POS flows stabilize.
