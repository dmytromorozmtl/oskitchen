# POS — Receipts

## Generation

`buildPosReceiptText` (`services/pos/pos-receipt-service.ts`) produces a multi-line plain-text receipt at checkout:

- Business header (placeholder until wired to `KitchenSettings.businessName`)
- Receipt + order identifiers
- Fulfillment + payment mode labels
- Line items with qty × unit price = line total
- Subtotal, tax, discount, total
- Neutral thank-you footer

`POSReceipt` persists `receiptText` and optional `receiptHtml` (currently `null`).

## Actions

- **Print**: use browser print from order detail or future receipt modal (not yet a dedicated print route).
- **Email**: requires transactional email configuration + customer email — not mandatory for persistence.
- **Reprint**: create a follow-up task to duplicate print pipeline; data retained on `POSReceipt`.

## Compliance

- No PAN, track data, or gateway tokens stored in receipt blobs.
- `receiptNumber` is unique per checkout for support correlation.
