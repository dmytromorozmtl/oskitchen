# Catering Quote — New Quote Wizard

Route: `/dashboard/catering-quotes/new`

The wizard is a single accordion-style RSC form that captures the
following sections in order. All fields are optional unless marked.

## Step 1 — Client (required)

- `customerName` *(required)*
- `customerEmail` *(required)*
- `customerPhone`
- `companyName`

Upserts a `KitchenCustomer` (`source=CATERING_QUOTE`,
`type=CATERING_CLIENT` when a company is set).

## Step 2 — Event details

- `eventName`
- `eventType` (`CateringEventType`)
- `eventDate`
- `guestCount`
- `brandId`, `locationId` (when available)

## Step 3 — Service style & logistics

- `serviceStyle` (`CateringServiceStyle`)
- `pricingMode` (`CateringPricingMode`)
- Flags: `deliveryRequired`, `setupRequired`, `staffingRequired`

These flags drive the **Operational handoff** card on the detail page
and the conversion preview.

## Step 4 — Starter line (optional)

- `lineTitle`, `lineQty`, `lineUnitPrice`

If provided, an initial `FOOD` line item is created and the quote
subtotal/total reflect it.

## Step 5 — Fees & pricing

- `serviceFee`, `deliveryFee`, `setupFee`, `staffingFee`, `discount`,
  `tax`

Totals are recomputed server-side after every save.

## Step 6 — Dietary / allergy

- `dietaryNotes`, `allergyNotes`

These notes appear on the public proposal under a clearly highlighted
panel and flow into `Order.notes` on conversion so kitchen, packing,
and delivery see them.

## Step 7 — Proposal settings

- `validUntil`
- `clientNotes` (public-facing)
- `internalNotes` (never public)
- legacy `notes` (kept for back-compat)

## Step 8 — Review

The submission redirects to `/dashboard/catering-quotes/[quoteId]`
which acts as the review + editor surface.
