# Customer CRM deep audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/customers`, `/dashboard/customers/deduplication`,
`KitchenCustomer`, `CustomerSubscription`, `CustomerMergeEvent`, order-derived
customer aggregation in `actions/orders.ts` and `actions/implementation.ts`,
catering quotes, storefront orders, sales channels.

## TL;DR

Customer CRM is two pages today:

- `/dashboard/customers` — reads `Order` directly, groups by `customerEmail`, and
  shows an aggregated table of "diners". Empty state is the default view.
- `/dashboard/customers/deduplication` — reads `KitchenCustomer` (imports + CSV)
  and shows possible duplicates by email / phone / name.

There is **no shared Customer entity** that ties together orders, imports,
catering quotes, storefront checkout, and sales channels. CRM workflows
(segments, follow-ups, allergies, dietary, consent, B2B, VIP, at-risk) do not
exist. The plan gate `feature="customer_crm"` is already wired and stays.

Every fix here is **additive** — `KitchenCustomer` grows, but old rows keep
working, and the order-derived aggregation continues to render for legacy
workspaces.

## Findings

| #  | Area | Current state | Limitation | Affected business types | Recommended fix | Pri |
|----|------|----------------|------------|--------------------------|-----------------|-----|
| 1  | UI on `/dashboard/customers` | 3 KPI cards + a table grouped by order email | No tabs, no segments, no detail page, no follow-ups, no allergies, no consent | All | Replace with Command Center subnav + tabs + customer detail page | P1 |
| 2  | Customer entity | `KitchenCustomer` has only `email/name/phone/notes` | Cannot store type / status / address / dietary / allergies / consent / metrics / source | All | Extend `KitchenCustomer` additively + add child models (Address, Note, TimelineEvent, Segment, Membership, MergeCandidate, FollowUp, ConsentEvent, CompanyAccount) | P0 |
| 3  | Order ↔ Customer link | None — `Order` stores `customerEmail/Name/Phone` only | Cannot follow a customer's history from an order | All | On order create (manual, storefront, channel, import), upsert `KitchenCustomer` and append a `CustomerTimelineEvent`. No new FK column needed; we match on `(userId, email)` | P0 |
| 4  | Metrics | Computed in-page from raw orders | Recomputed every page load; not surfaceable in detail; no AOV / repeat / VIP signal | All | `customer-metrics-service.ts` writes `totalOrders/lifetimeValue/averageOrderValue/firstOrderAt/lastOrderAt/...` back to `KitchenCustomer`; refresh on order events + manual button | P0 |
| 5  | Segmentation | None | No way to filter VIPs, at-risk, catering clients, allergy-sensitive | All | `CustomerSegment` (static + rule JSON) + `CustomerSegmentMembership`, plus a small in-process evaluator | P1 |
| 6  | Follow-ups | None | Sales / VIP / allergy confirmation / event leads slip through | Catering, bakery, bar, meal prep | `CustomerFollowUp` (typed + assignable + dueAt) | P1 |
| 7  | Companies / B2B | None | Office lunch / corporate catering / wholesale clients can't be tracked | Catering, café, meal prep, multi-brand | `CompanyAccount` with primary contact + tags + notes | P1 |
| 8  | Allergies / dietary | None on `KitchenCustomer` | Kitchen can't see "this guest is gluten-free" from the customer profile | All — esp. bakery, catering, meal prep | `allergiesJson`, `dietaryPreferencesJson`, `dislikesJson` on customer + visibility helpers; surface in order, packing, kitchen screen (links only — no automatic kitchen-screen rewrite this pass) | P0 |
| 9  | Consent | None | Cannot answer "who consented to email marketing?" | All | `CustomerConsentEvent` + `marketingConsent/smsConsent + consentSource/consentAt` on customer | P0 (privacy) |
| 10 | Privacy / permissions | Owner has full access; no role gating | Kitchen / driver / accountant should see less | Multi-tenant | `lib/crm/customer-permissions.ts` with role-scoped views; UI hides full PII for non-managerial roles | P0 |
| 11 | Source tracking | None | Cannot see whether a customer came from storefront, Woo, Shopify, Uber Eats, import, catering quote, etc. | All | `source` enum + `sourceChannelId` reference; populate on every entry point | P1 |
| 12 | Preferred brand / location | None | Cannot route follow-ups by brand / location | Multi-brand, multi-location | `preferredBrandId / preferredLocationId / preferredFulfillmentType` on customer | P2 |
| 13 | Dedupe page | Lists groups by email/phone/normalized name, has a Merge action | Works, but does not write `CustomerMergeCandidate` records (no auto-suggest), and merge only re-points subscriptions, not orders | All | Keep the existing flow; add `CustomerMergeCandidate` for future auto-detection; expand merge to copy notes + addresses + timeline | P2 |
| 14 | Import / Export integration | CSV `CUSTOMERS` import already upserts `KitchenCustomer` | Missing dietary / allergies / tags / company columns | All | Document mapping; expand template later | P2 |
| 15 | Catering quotes | `CateringQuote` carries `customerEmail` / `customerName` / `companyName` but no link to `KitchenCustomer` | Quote follow-ups don't show on the customer profile | Catering | Upsert `KitchenCustomer` + `CompanyAccount` on quote create; append timeline event | P1 |
| 16 | Sales channels | `ChannelOrder` exists; channel imports do not upsert customers | Channel-derived buyers never join the CRM | Ghost / cloud / multi-brand | Add upsert hook on channel order ingest (documented integration point; main code path lands as the channel ingest evolves) | P1 |
| 17 | Marketing emails | None automatic | Good — but we still need a place to record consent for when a real integration ships | All | Track consent + export "consented only" lists; never send from OS Kitchen itself this pass | P0 (privacy) |
| 18 | Empty states | Single empty state on overview | Confusing on segments / follow-ups / dedupe / companies | All | Per-tab empty states wired into the new pages | P2 |
| 19 | Business-mode terminology | Hard-coded "Customer CRM" | "Guests" / "Clients" / "Subscribers" better matches certain modes | All | `crmTerminologyForMode()` helper, mirror of `tasksTerminologyForMode` | P2 |
| 20 | Audit trail | `CustomerMergeEvent` only | No record of "consent changed" / "allergy edited" / "follow-up created" | Privacy-sensitive workspaces | `CustomerTimelineEvent` + `CustomerConsentEvent` cover everything; document scope | P1 |
| 21 | Subscriptions / meal plans | `CustomerSubscription` already linked to `KitchenCustomer` | Detail page should show subscriptions when present | Meal prep | Pull on detail page if `customerSubscriptions.length > 0` | P2 |

## Priority legend

- **P0** — Privacy, data correctness, breaking gap
- **P1** — High CRM value (segments, follow-ups, B2B, integration hooks)
- **P2** — Polish / future depth
- **P3** — Roadmap
