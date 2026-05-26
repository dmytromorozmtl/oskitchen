# Catering Quote → Order Conversion

## Goal

Turn an accepted catering quote into a draft `Order` that the existing
production / packing / packing-verification / routes pipelines can
operate on.

## Safety rules (enforced server-side)

1. **Manual only**. There is no automatic conversion. The user clicks
   "Convert to draft order" on the quote detail page.
2. **Preview-first**. The button is disabled until
   `previewQuoteConversion()` returns `ok: true`.
3. **No duplicate conversion**. `CateringQuote.convertedOrderId` is
   `unique` at the DB level. A second conversion is impossible.
4. **Draft only**. The created `Order.status` is `PENDING`. The user
   confirms and prices it through the regular Order Hub flow.
5. **No silent payments / no fake e-signature**.

## Preview output (`ConversionPreview`)

- `fulfillmentType`: `DELIVERY` when delivery is required or service
  style implies dropoff/trays/buffet/etc; otherwise `PICKUP`.
- `pickupDate`: `quote.eventDate`.
- `lines`: each `CateringQuoteItem` mapped to a previewed line; only
  lines with a `productId` will appear on the resulting order.
- `notes`: serialized event/dietary/allergy/internal context. This is
  what flows into `Order.notes`.
- `warnings`: non-blocking (e.g. lines without products will be
  dropped).
- `blockingErrors`: shown in red; disable the button.

## Conversion (`convertQuoteToOrder()`)

Single Prisma transaction:

1. `prisma.order.create` with:
   - the workspace user as `userId`
   - `brandId`, `locationId` carried over
   - customer name/email/phone from the quote
   - total = quote total
   - `status = PENDING`
   - `fulfillmentType` from preview
   - `pickupDate = quote.eventDate`
   - `notes` from the preview
   - `publicLookupToken` generated via `generatePublicLookupToken()`
   - `orderItems` created from lines that have a `productId`
2. `prisma.cateringQuote.update`:
   - `status = CONVERTED_TO_ORDER`
   - `convertedOrderId = order.id`
   - `acceptedAt = quote.acceptedAt ?? new Date()`
3. `prisma.cateringQuoteEvent.create` (audit: `QUOTE_CONVERTED_TO_ORDER`).

Post-transaction (best-effort):

- `prisma.customerTimelineEvent.create` on the CRM timeline.
- `recomputeMetricsForOrderEmail` to refresh LTV / order count.

## Allergy & dietary safety

The conversion **always** includes `allergyNotes` and `dietaryNotes` in
`Order.notes` even when empty (header line is omitted if empty). This
ensures kitchen, packing, and routes always see them.
