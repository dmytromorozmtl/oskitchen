# Customer segments

## Concepts

- **Segment** = a named group of customers, either static (manual additions)
  or rule-based (`rules_json`).
- **Rule** = a JSON record with a discriminated `kind` field. Rules are
  conjunctive — every rule must match.
- **Membership** = row in `customer_segment_memberships`. Recomputed when the
  segment is created or when the user clicks "Rebuild".

## Built-in segments

Defined in `lib/crm/customer-segments.ts → BUILT_IN_SEGMENTS`. The Segments UI
shows them in a starter pack until the workspace adds them.

| Key | Name | Rules |
|---|---|---|
| `vip` | VIP | `status IN (VIP)` |
| `repeat-buyers` | Repeat buyers | `totalOrders ≥ 2` |
| `new-customers` | New customers | `status IN (NEW)` |
| `at-risk` | At risk | `lastOrderOlderThanDays = 60 AND totalOrders ≥ 1` |
| `inactive` | Inactive | `lastOrderOlderThanDays = 180` |
| `high-ltv` | High LTV | `lifetimeValueCentsAtLeast = 50000` |
| `catering-clients` | Catering clients | `type IN (CATERING_CLIENT, EVENT_CLIENT)` |
| `event-leads` | Event leads | `source IN (EVENT_INQUIRY, BAR_EVENT_INQUIRY)` |
| `meal-plan` | Meal plan customers | `source IN (MEAL_PLAN)` |
| `allergy-sensitive` | Allergy-sensitive | `hasAnyAllergy` |
| `corporate-clients` | Corporate clients | `type IN (COMPANY, OFFICE_CLIENT, WHOLESALE_CLIENT)` |
| `bakery-preorders` | Bakery preorders | `source IN (BAKERY_PREORDER)` |
| `no-recent-order` | No recent order (90d) | `lastOrderOlderThanDays = 90` |
| `marketing-consented` | Marketing consented | `marketingConsent = true` |

## Evaluator

`evaluateSegment(rules, customer, now)` is pure and lives in `lib/crm/customer-segments.ts`.
Used both in the server "Rebuild" action and reusable for a future "preview" panel.

## Manual segments

Custom segments are static for the v1 — operators add them via the form and
membership stays empty until manual additions land (or until they reopen and
update the rules JSON in a follow-up). The rebuild button is wired and works.

## Future

- Inline rules editor on segment detail page
- Background recompute on order create / status change
- "Export segment to CSV" button (reuses Import / Export Center)
