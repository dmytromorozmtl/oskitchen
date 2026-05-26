# Catering Sales & Event Quote Center — Ready Report

## What changed

The legacy single-form `/dashboard/catering` page is preserved
unchanged from the user's perspective, but every submission now flows
through a new `services/catering/quote-service.ts` so quotes are
indexed by quote number, linked to the CRM, audited, and visible in
the new Command Center.

The new module ships at `/dashboard/catering-quotes` with 11 routes
plus a hardened public `/quote/[token]` route.

## Data model updates

- Extended `CateringQuoteStatus` enum (`READY_TO_SEND`, `VIEWED`,
  `NEEDS_REVISION`, `REJECTED`, `CONVERTED_TO_ORDER`, `CANCELLED`,
  `ARCHIVED`).
- Added new enums for event type, service style, pricing mode, line
  type, audit event types, follow-up status.
- Extended `CateringQuote` with 25+ optional columns (customer/company
  links, brand/location, quote number, event metadata, fees,
  cost/margin estimates, validity, conversion link, audit
  timestamps).
- Extended `CateringQuoteItem` with `lineType`, `unit`,
  `costEstimate`, `marginEstimate`, `sortOrder`, `notes`, `menuId`,
  `updatedAt`.
- Added six new tables: `catering_quote_packages`,
  `catering_quote_events`, `catering_quote_versions`,
  `catering_proposal_views`, `catering_quote_followups`,
  `catering_quote_templates`.
- All additive — existing rows preserved.
- Migration: `20260511235000_catering_quotes_command_center`. Applied
  successfully via `npm run db:deploy`.

## Quote Command Center

- KPIs: open / drafts / sent / accepted / expiring / follow-ups due /
  pipeline value / accepted revenue / average quote.
- Subnav: Overview / Quotes / Pipeline / Follow-ups / Templates /
  Accepted-Events / Public Proposals / Reports / Settings.

## Wizard

- 7-section single page form at `/dashboard/catering-quotes/new`.
- Captures client, event, service style, starter line, fees, dietary
  notes, and proposal settings; redirects to the detail editor.

## Proposal editor

- Status & action buttons gated by `canTransitionQuoteStatus`.
- Public-link card with rotate/revoke + view counter.
- Line editor with type, quantity, unit, unit price; inline remove.
- Full quote field editor with fees, notes, validity.
- Conversion preview with blocking errors and warnings.
- Operational handoff flags (delivery/setup/staffing/packing/production).
- Follow-up creator + list.
- Activity + versions.

## Public proposal link

- Strict allow-list payload via `buildPublicProposalPayload`.
- Internal notes / costs / margins **never** exposed.
- Token rotation, revocation, view auditing (IP/UA hashed), and
  expiration are all implemented.
- No fake e-signature / payment buttons.

## Versioning

- "Save version" snapshots quote + items to
  `CateringQuoteVersion.snapshotJson` with monotonic `versionNumber`.
- Each version writes a `QUOTE_VERSION_SAVED` audit event.

## Quote → Order conversion

- Manual, preview-first, idempotent (unique `convertedOrderId`).
- Creates a `PENDING` Order with carry-over of event date, fulfillment
  type, customer info, brand/location, and allergy/dietary notes
  inside `Order.notes`.
- Recomputes CRM metrics for the customer email.
- Audit event `QUOTE_CONVERTED_TO_ORDER`.

## CRM integration

- Customer upserted on quote create (`source=CATERING_QUOTE`,
  `type=CATERING_CLIENT`).
- CRM timeline events on create, status change, conversion.

## Production / Packing / Routes handoff

- Conversion produces a regular `Order` that flows through every
  existing operational pipeline; no parallel surface.
- `fulfillmentType` set automatically from service style + delivery
  flag.

## Permissions & security

- `lib/catering/quote-permissions.ts` defines `canDoCateringQuote()`
  with permissions for read/list, cost/margin read, internal notes
  read, create/update/share/revoke/convert/archive/template/follow-up.
- Superadmin override via `isSuperAdminEmail`.
- Server-side ownership check (`userId === user.id`) on every action.

## Reports

- Pipeline value, accepted revenue, average value, conversion rate.
- Revenue by event type / brand.
- Lost and expiring quotes lists.

## Remaining limitations / future work

- The wizard does not yet apply templates automatically (data model is
  ready; UI is a follow-up).
- Per-line product picker is text-based; a CRM-style product picker
  would be ideal.
- Real email send + e-signature + payment integrations are still
  placeholders.
- Production batches don't yet carry `cateringQuoteId`; documented as
  a future enhancement.

## Next recommendations

1. Apply templates from the wizard with one click.
2. Add a structured "Address" sub-form backed by `eventAddressJson`.
3. Surface the catering pipeline value KPI on the global dashboard.
4. Add a per-quote PDF export.
5. Add a "Request approval" CTA on the public page that posts to a
   moderator queue.
