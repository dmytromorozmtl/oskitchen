# Customer deduplication

OS Kitchen provides two complementary paths:

1. **Manual dedupe page** — `/dashboard/customers/dedupe`
   - Groups customers by normalized email / phone / name / external id.
   - Lets you confirm a merge group at a time.
   - Confirmed merges write to the existing `customer_merge_events` table.
   - The legacy `/dashboard/customers/deduplication` route also still works
     and re-renders the same data through `findDuplicateGroups`.

2. **Auto-suggestion table (future)** — `customer_merge_candidates`
   - Reserved for a background scanner that pairs customers with a
     confidence score. The UI scaffolding is left for a follow-up so the
     manual flow doesn't break.

## Normalization

In `lib/crm/customer-dedupe.ts`:

- Email → lowercase + trim
- Phone → digits only, ≥7 chars
- Name → lowercase, strip accents, collapse non-alphanumerics

## Confidence

`similarity(a, b)`:

- Email match → +0.6
- Phone match → +0.3
- Name match → +0.1
- External id match → +0.5

Capped at 1.0. Used to populate `customer_merge_candidates.confidence_score`
when the future job runs.

## Merge behavior

The existing `mergeCustomers` action:

1. Repoints `customer_subscriptions` to the primary.
2. Records a `customer_merge_events` row.
3. Deletes duplicate `kitchen_customers` rows.

Future improvements (deferred to keep this milestone scoped):

- Move orders' `customer_email` to match the primary if duplicates have the
  same canonical email but slightly different casings.
- Merge notes, addresses, and timeline events into the primary before delete.
- Soft-delete (mark `MERGED` on candidate, keep audit) instead of hard delete.

## Why we keep `customer_merge_events`

The dedupe action and its audit trail were already in production for imports.
Removing them would silently change behavior and break the
`/dashboard/customers/deduplication` page. Keeping both `customer_merge_events`
(history) and `customer_merge_candidates` (suggestions) gives us a clean
forward path.
