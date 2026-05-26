# Catering Sales & Event Quote Center — Architecture

## Overview

The Catering Sales & Event Quote Center transforms the legacy single-form
`/dashboard/catering` page into a full B2B sales workflow at
`/dashboard/catering-quotes`. The module covers lead capture, proposal
editing, public proposal sharing, versioning, quote-to-order conversion,
operational handoff (production, packing, routes), CRM integration,
follow-ups, templates, and reports.

## Layering

```
app/dashboard/catering-quotes/**         ← Server components (RSC) + forms
app/quote/[token]/page.tsx               ← Public read-only proposal
actions/catering-quotes.ts               ← Server actions (mutations)
actions/catering.ts                      ← Legacy form (delegates to new service)
services/catering/quote-service.ts       ← Business logic for quotes
services/catering/quote-conversion-service.ts ← Quote → Order conversion
services/catering/proposal-service.ts    ← Public proposal loader
lib/catering/quote-types.ts              ← Enums, terminology mapping
lib/catering/quote-status.ts             ← Status transitions, pipeline columns
lib/catering/quote-calculations.ts       ← Pure pricing helpers
lib/catering/quote-permissions.ts        ← canDoCateringQuote()
lib/catering/event-workflows.ts          ← Derived workflow flags
lib/catering/proposal-public-links.ts    ← Public payload (allow-list)
lib/catering/quote-templates.ts          ← Built-in templates
prisma/schema.prisma                     ← Additive schema
```

## Data flow

1. **Capture**: A new quote is created via the wizard (`/new`) or the
   legacy form (`/dashboard/catering`). Both paths funnel through
   `services/catering/quote-service.ts → createQuote()`, which
   - generates a workspace-unique `Q-YYYY-NNNN` quote number
   - generates a public token via `generatePublicProposalToken()`
   - upserts the CRM customer (`upsertCustomerByEmail` with
     `source = "CATERING_QUOTE"`)
   - writes a `QUOTE_CREATED` audit event
   - writes a CRM timeline event when a customer exists
2. **Edit**: Detail page calls `updateQuoteFields()`, `addQuoteLine()`,
   `removeQuoteLine()`, etc. Every mutation recomputes totals via
   `computeQuoteTotals()`.
3. **Status transitions**: `setQuoteStatus()` enforces
   `canTransitionQuoteStatus()` and writes audit + CRM events.
4. **Public link**: `loadPublicProposal()` returns a strictly
   allow-listed payload (no internal notes, costs, margins). A
   `CateringProposalView` row is recorded for each visit; first view
   bumps SENT → VIEWED.
5. **Versioning**: `snapshotQuoteVersion()` writes a JSON snapshot of
   the quote and items to `CateringQuoteVersion`. Use the “Save version”
   button before risky edits.
6. **Conversion**: `previewQuoteConversion()` lists what an order would
   look like; the UI surfaces blocking errors (no product-linked lines,
   already converted, etc.). `convertQuoteToOrder()` only converts when
   the preview is green:
   - Creates a `PENDING` `Order` (never `CONFIRMED`)
   - Carries event date, allergy/dietary notes into `Order.notes`
   - Sets `fulfillmentType=DELIVERY` if delivery is required, otherwise
     `PICKUP`
   - Sets `CateringQuote.status = CONVERTED_TO_ORDER` and stores
     `convertedOrderId` (unique — duplicate conversions impossible)
   - Recomputes CRM metrics for the customer email.
7. **Operational handoff**: After conversion, the new `Order` flows
   through the existing production, packing, packing-verification,
   routes, and tasks pipelines.

## Routes shipped

| Route | Purpose |
|-------|---------|
| `/dashboard/catering-quotes` | Command center (KPIs + latest quotes) |
| `/dashboard/catering-quotes/quotes` | Full quote list |
| `/dashboard/catering-quotes/pipeline` | Kanban by status |
| `/dashboard/catering-quotes/follow-ups` | Pending follow-ups |
| `/dashboard/catering-quotes/templates` | Built-in + workspace templates |
| `/dashboard/catering-quotes/accepted` | Accepted / converted events |
| `/dashboard/catering-quotes/public-proposals` | Audit of public-link state |
| `/dashboard/catering-quotes/reports` | Pipeline, revenue, conversion, lost, expiring |
| `/dashboard/catering-quotes/settings` | Module preferences |
| `/dashboard/catering-quotes/new` | Wizard |
| `/dashboard/catering-quotes/[quoteId]` | Detail editor (lines, fees, pricing, follow-ups, versions, conversion) |
| `/quote/[token]` | Public read-only proposal |
| `/dashboard/catering` | Legacy form (kept for back-compat, points at new center) |

## Back-compat

- Legacy `/dashboard/catering` page still exists.
- Legacy server action `createCateringQuoteAction` now delegates to
  `services/catering/quote-service.createQuote()` so old form posts
  produce identical results (quote number, CRM upsert, audit events).
- Existing `CateringQuote` rows remain valid; new columns have safe
  defaults and existing public tokens still resolve through
  `loadPublicProposal()`.
