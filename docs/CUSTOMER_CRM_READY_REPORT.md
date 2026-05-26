# Customer CRM ready report

## What changed

- Customer CRM became a Customer Intelligence Center: 10-link subnav,
  KPI strip, per-tab pages, and a deep customer detail page with profile,
  allergies, dietary, orders, notes, follow-ups, consent, timeline, and
  archive.
- Schema grew `kitchen_customers` with 30+ additive columns and shipped 9 new
  child tables, all behind one additive migration.
- Order create / storefront / enterprise API / CSV import all now upsert
  customers and recompute metrics without blocking the request.

## Models added

- `kitchen_customers` extended (status, type, source, dietary, allergies,
  consent, metrics, preferences, etc.)
- `customer_addresses`
- `customer_notes` + `CustomerNoteVisibility`
- `customer_timeline_events` + `CustomerTimelineEventType`
- `customer_segments` + `customer_segment_memberships`
- `customer_merge_candidates` + `CustomerMergeCandidateStatus` (kept the
  existing `customer_merge_events` for the live dedupe flow)
- `customer_follow_ups` + `CustomerFollowUpType` + `CustomerFollowUpStatus`
- `customer_consent_events` + `CustomerConsentType`
- `company_accounts` + back-relation from `kitchen_customers`

## CRM Command Center

`/dashboard/customers` now renders:

- Dynamic title by business mode (`crmTerminologyForMode`)
- 10 KPI tiles
- Top customers table
- Quick actions: Add customer / Import / Recalculate metrics
- 10-tab subnav: Overview / Customers / Segments / VIPs / At risk / Companies /
  Follow-ups / Allergies / Dedupe / Reports

## Customer detail

- Header KPIs (orders, LTV, AOV, last/first order, at-risk score, open
  follow-ups, allergy count)
- Profile form
- Allergy / dietary editor with kitchen-relevant chip surfacing
- Orders table (matched by email)
- Notes (4 visibility levels)
- Follow-ups (typed + due date)
- Consent (email + SMS, with audit history)
- Timeline (append-only)
- Archive (no data destruction)

## Metrics engine

`services/crm/customer-metrics-service.ts` recomputes totals / LTV / AOV /
first/last / at-risk per customer. Triggered from manual orders, storefront,
enterprise API, CSV import, and the admin button.

## Segments

`lib/crm/customer-segments.ts` ships 14 built-in segments with a pure
evaluator. The Segments page adds them in one click and rebuilds membership.

## Follow-ups

Typed, assignable, due-date-driven; rendered on `/dashboard/customers/follow-ups`
and on each detail page. Status changes write timeline events.

## Deduplication

`/dashboard/customers/dedupe` groups by normalised email / phone / name /
external id, lets the operator confirm a merge, and writes to the existing
`customer_merge_events` audit table. The legacy
`/dashboard/customers/deduplication` route still works.

## B2B / Company CRM

`/dashboard/customers/companies` covers the v1: name, billing email, phone,
notes, member count, primary contact display. Tagging + member attach UI
queued for a follow-up.

## Allergy &amp; dietary safety

Stored as JSON; parsed by forgiving helpers; surfaced as a chip on the
overview, list, and allergies pages; documented for kitchen / packing /
quote integration.

## Order / storefront / channel integration

Hooks wired in three places (manual order create, storefront submit,
enterprise API). CSV import populates `source: "IMPORT"`. The pattern is
documented for catering quotes and channel ingest, which are scheduled
follow-ups so we do not touch other modules in this milestone.

## Privacy / permissions

- New `lib/crm/customer-permissions.ts`
- Owner / superadmin retain full access
- Kitchen / driver / packer roles only see allergy / delivery notes attached
  to orders they're working
- Consent audit log captures every change
- No marketing emails are sent automatically

## Reports

`/dashboard/customers/reports` shows KPIs, repeat rate, at-risk share, source
breakdown (90d), type breakdown.

## Remaining limitations

- Catering quote and channel ingest hooks documented but not wired (out of
  scope for this milestone).
- Custom-segment rules JSON editor not yet in the UI — rules can still be
  saved via the action body. Built-in segments cover the common cases.
- Merge flow re-points subscriptions; merging order rows by email is not yet
  performed (still tracked through `customer_email`).
- No background scanner to populate `customer_merge_candidates` yet; the
  table is in place for future work.
- Import / Export Center does not yet add a CRM-specific export by segment;
  the customer import CSV already works.

## Next recommendations

1. Wire the catering quote and channel ingest hooks (one helper call each).
2. Add a segment rules editor.
3. Schedule a daily metrics recompute job (currently per-event only).
4. Add a per-company "members" tab that lists `KitchenCustomer` rows attached
   via `company_account_id`.
5. Add a Mailchimp-or-similar export of `marketing_consent = true` customers.
