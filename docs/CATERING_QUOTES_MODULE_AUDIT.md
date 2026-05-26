# Catering Quotes module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/catering`, `app/quote/[token]/page.tsx`,
`actions/catering.ts`, `CateringQuote` + `CateringQuoteItem` models,
related downstream surfaces (orders, CRM, follow-ups, production,
packing, routes, reports).

## TL;DR

The page can capture a basic quote draft and share a single public
read-only link. It cannot manage the rest of a real catering sales
workflow: lead pipeline, full proposal editor, versioning, fees,
margins, follow-ups, dietary handoff, and safe conversion to an order.

The plan: keep `/dashboard/catering` working (legacy capture form
preserved), ship a real "Catering Sales & Event Quote Center" at
`/dashboard/catering-quotes` and a hardened public proposal at
`/quote/[token]`. All schema changes are **additive**: existing rows in
`catering_quotes` / `catering_quote_items` stay readable.

## Findings

| #  | Area | Current state | Limitation | Affected workflow | Business impact | Recommended fix | Pri |
|----|------|---------------|------------|-------------------|-----------------|-----------------|-----|
| 1  | Route | Single form-first page `/dashboard/catering` | No pipeline, no detail editor, no tabs | All catering | Operators cannot manage a real sales pipeline | Ship Command Center at `/dashboard/catering-quotes` with subnav, KPIs, pipeline, detail editor; keep `/dashboard/catering` as legacy alias | P1 |
| 2  | Data model — quote | Only `customerName/email/companyName/eventDate/guestCount/budget/notes/subtotal/tax/total/publicToken/status` | Missing event type, service style, fees, margins, validity, addresses, internal vs client notes, accepted/rejected timestamps, converted order link, brand/location | All | Quotes don't represent a real proposal | Add (additive) event type, service style, pricing mode, fee components, fees/discounts/estimated cost/margin, valid-until, address JSON, brand/location, customerId/companyAccountId, quoteNumber, acceptedAt/rejectedAt/convertedOrderId | P0 |
| 3  | Data model — line items | Only `title/description/quantity/unitPrice/total/productId` | No `lineType` (food / service / delivery / setup / staffing / rental / discount), no unit, no cost/margin, no sort, no notes, no menu link | Proposal editor | Cannot model fees, services, discounts as line items | Add `lineType`, `unit`, `sortOrder`, `notes`, `costEstimate`, `marginEstimate`, `menuId` | P0 |
| 4  | Status enum | DRAFT / SENT / ACCEPTED / DECLINED / EXPIRED | Missing READY_TO_SEND, VIEWED, NEEDS_REVISION, REJECTED, CONVERTED_TO_ORDER, CANCELLED, ARCHIVED | Pipeline | No real lead → won workflow | Extend enum (additive — Postgres `ALTER TYPE … ADD VALUE`). Keep DECLINED for back-compat | P0 |
| 5  | Public proposal | `/quote/[token]` renders quote + items; exposes the canonical `status` enum value and prints "totals indicative until you confirm" disclaimer | Doesn't enforce visibility rules. If internal notes/costs were on the quote today they would leak. No expiration. No view tracking. | Public link | Risk surface | Strict allow-list of public fields in `lib/catering/proposal-public-links.ts`; add `validUntil`, `CateringProposalView` audit, revoke control | P0 |
| 6  | Versioning | None | Cannot show "what was sent" after edits | Sales | Disputes possible | Add `CateringQuoteVersion` snapshot table; snapshot on every status change or explicit save | P1 |
| 7  | Quote-to-order conversion | Not implemented; operators must rebuild orders manually | All accepted quotes have to be re-typed | All | Operational drag | Add `services/catering/quote-conversion-service.ts` — preview + draft `Order` (PENDING) + carry items, fees, notes, allergies; bump status to `CONVERTED_TO_ORDER`; store `convertedOrderId`; refuse duplicates | P0 |
| 8  | CRM integration | None — `customerName`/`customerEmail` are unstructured strings; no link to `KitchenCustomer` or `CompanyAccount` | Customer profile cannot see quotes | All | Sales/CRM data fragmentation | Optional `customerId`, `companyAccountId`; on create/update call `upsertCustomerByEmail` (source = `CATERING_QUOTE`); append `CustomerTimelineEvent` | P0 |
| 9  | Follow-ups | None | Operators forget sent quotes | All | Lost revenue | New `CateringQuoteFollowUp` table + UI; reuse the existing Today Board surface via tasks | P1 |
| 10 | Pricing/fees | Only `subtotal/tax/total/budget` | Cannot model delivery, setup, staffing, service fee, discount independently | All | Pricing wrong | Add `serviceFee/deliveryFee/setupFee/staffingFee/discount/tax` Decimal fields. Compute total in `lib/catering/quote-calculations.ts`. | P0 |
| 11 | Margin/cost | None | Operators don't know if a quote is profitable | All | Margin blindness | Optional per-line and per-quote `costEstimate` + computed `marginEstimate` (% + $); never shown in public links | P1 |
| 12 | Dietary / allergy | Single `notes` field | Kitchen/packing/routes don't get structured info | All operational | Food safety risk | Add `dietaryNotes`, `allergyNotes` (text), surface both in generated `Order.notes` so kitchen/packing/driver see them | P0 |
| 13 | Production handoff | None | Accepted quotes don't seed production batches | Catering | Manual replanning | Auto-create draft order on conversion; production already keys off orders. Document path for `productionBatch.cateringQuoteId` follow-up. | P1 |
| 14 | Packing / loadout | None | Tray labels and packing batches built by hand | Catering | Risk of missing trays | Document conversion path; loadout summary on the quote detail page; structured for follow-up linking | P1 |
| 15 | Routes / delivery | None | Delivery plans entered by hand | Catering | Manual labour | Inherit `fulfillmentType=DELIVERY` on conversion when delivery is required; rely on existing route assignment in Routes | P2 |
| 16 | Templates | None | Operators rebuild the same proposal repeatedly | Catering | Time loss | New `CateringQuoteTemplate` (workspace-scoped) + 9 built-ins in `lib/catering/templates.ts` | P1 |
| 17 | Brand / location | Not modelled | Multi-brand / multi-location can't scope quotes | Multi-brand | Reporting / fulfillment | Optional `brandId`, `locationId` on `CateringQuote` | P2 |
| 18 | Public link safety | Token present, no expiration, no view audit, no revoke | Stolen tokens stay valid forever | Public link | Privacy risk | `validUntil`, `CateringProposalView` events, "revoke" rotates token to a fresh string and invalidates the old | P0 |
| 19 | E-signature / payment | Footer says "Stripe later" but no fake button | Acceptable today | Public link | None | Keep an honest "Reply to caterer for now" CTA; add a future-ready "Request approval" placeholder that posts to admin for manual review | P3 |
| 20 | Pipeline view | None | Cannot tell at a glance what stage each quote is in | Sales | Lost revenue | Pipeline Kanban with status columns + per-card warnings | P1 |
| 21 | Empty states | Single "No quotes yet" | Lacks CTAs | All | Polish | Per-tab empty states matching the spec | P2 |
| 22 | Permissions | None | Same as the rest of today | All | Privacy | New `lib/catering/quote-permissions.ts` to gate cost/margin reads, internal-only fields, and conversion; superadmin overrides via existing `isSuperAdminEmail` | P1 |
| 23 | Reports | None | Sales has no view of pipeline | All | Visibility | Reports tab with pipeline value, accepted revenue, conversion rate, AOV, lost quotes, expiring, by-event-type, by-brand/location | P1 |
| 24 | Business-mode terminology | Page title hard-coded | Bar / Bakery / Café / Meal Prep need different copy | All | UX | `cateringTerminologyForMode` helper analogous to CRM/Meal Plans | P2 |
| 25 | Quote number | None | No human-readable identifier | All | Communication | Generate `Q-YYYY-NNNN` per workspace on create | P1 |
| 26 | Legacy form | `actions/catering.ts.createCateringQuoteAction` ignores customerId/companyAccountId | New form will need extra fields, but legacy form must still work | Back-compat | None | Wrap legacy create to also call the new service (delegating create); legacy form remains | P0 |

## Priority legend

- **P0** — Data correctness, public-link safety, conversion correctness, allergy/dietary safety.
- **P1** — Pipeline/editor/templates/CRM/follow-ups (core catering value).
- **P2** — Multi-brand, terminology, polish, reports breakdowns.
- **P3** — E-signature, real payment, accept/reject buttons.
