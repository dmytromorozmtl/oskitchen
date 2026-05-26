# Customer data model

All changes in this milestone are **additive**. No existing column was removed
or renamed. Existing rows in `kitchen_customers` continue to function.

## Updated: `KitchenCustomer` (`kitchen_customers`)

Existing columns: `id, user_id, email, name, phone, notes, created_at, updated_at`.

New columns:

| Column | Type | Default | Notes |
|---|---|---|---|
| `type` | `CustomerType` | `INDIVIDUAL` | INDIVIDUAL / HOUSEHOLD / COMPANY / CATERING_CLIENT / EVENT_CLIENT / WHOLESALE_CLIENT / OFFICE_CLIENT / VIP_CLIENT / INTERNAL_TEST |
| `status` | `CustomerStatus` | `ACTIVE` | ACTIVE / NEW / VIP / AT_RISK / INACTIVE / BLOCKED / ARCHIVED |
| `first_name`, `last_name`, `display_name`, `company_name`, `job_title` | varchar | null | structured names |
| `company_account_id` | uuid | null | FK → `company_accounts.id` (SET NULL) |
| `default_address_json`, `billing_address_json` | jsonb | null | freeform; consumed by detail page |
| `delivery_notes` | text | null | visible to driver role |
| `dietary_preferences_json`, `allergies_json`, `dislikes_json`, `favorite_items_json`, `tags_json` | jsonb | null | parsed by `lib/crm/customer-privacy.ts` |
| `source` | `CustomerSource` | `MANUAL` | see `lib/crm/customer-types.ts` |
| `source_channel_id`, `external_customer_id` | varchar/uuid | null | tied back to external systems |
| `preferred_brand_id`, `preferred_location_id` | uuid | null | populated lazily from orders |
| `preferred_fulfillment_type` | `FulfillmentType` | null | PICKUP / DELIVERY |
| `marketing_consent`, `sms_consent` | bool | false | toggled via `customer_consent_events` |
| `consent_source`, `consent_at` | varchar/timestamp | null | populated on every consent change |
| `first_order_at`, `last_order_at` | timestamp | null | computed by metrics service |
| `total_orders`, `lifetime_value_cents`, `average_order_value_cents` | int | 0 | computed metrics |
| `repeat_purchase_rate` | float | null | computed |
| `at_risk_score` | int | null | 0..100 heuristic |
| `last_contacted_at`, `next_follow_up_at` | timestamp | null | follow-up engine |

New indexes:

```
kitchen_customers(user_id, status)
kitchen_customers(user_id, type)
kitchen_customers(user_id, source)
kitchen_customers(user_id, last_order_at)
kitchen_customers(user_id, lifetime_value_cents)
kitchen_customers(phone)
kitchen_customers(preferred_brand_id)
kitchen_customers(preferred_location_id)
```

The legacy `kitchen_customers(user_id, email)` unique index is preserved.

## New tables

| Table | Purpose |
|---|---|
| `customer_addresses` | Multiple delivery addresses per customer with default flag |
| `customer_notes` | Note log with visibility enum INTERNAL / KITCHEN / DELIVERY / SALES |
| `customer_timeline_events` | Append-only timeline (orders, quotes, imports, merges, notes, consent, allergies) |
| `customer_segments` | Static or rule-based segment definitions |
| `customer_segment_memberships` | Many-to-many between customer and segment |
| `customer_merge_candidates` | Auto-detected duplicate suggestions (future job) |
| `customer_follow_ups` | Typed, assignable follow-up tasks tied to a customer |
| `customer_consent_events` | Audit log for every consent change |
| `company_accounts` | B2B / catering / office / wholesale clients (with primary contact + members) |

## Preserved tables

- `kitchen_customers` (extended)
- `customer_subscriptions` (used by meal prep)
- `customer_merge_events` (used by the existing dedupe flow)

`customer_merge_events` and the new `customer_merge_candidates` coexist:
`customer_merge_events` records confirmed merges; `customer_merge_candidates`
is reserved for future automatic suggestions.
