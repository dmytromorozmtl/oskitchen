# Customer follow-ups

## Goal

Make sure quote follow-ups, VIP thank-yous, reactivation campaigns, allergy
confirmations, and service-issue tickets do not slip through the cracks.

## Data

```
customer_follow_ups(
  id, customer_id, user_id, title, reason,
  type    -> GENERAL | QUOTE | EVENT | VIP | REACTIVATION | ISSUE | ALLERGY_CONFIRMATION | MEAL_PLAN
  due_at, status -> OPEN | COMPLETED | CANCELLED | OVERDUE
  assigned_to_id, completed_at, created_at, updated_at
)
```

Plus `kitchen_customers.next_follow_up_at` mirrors the earliest open follow-up.

## UI

- `/dashboard/customers/follow-ups` — workspace view (open + overdue + recently completed)
- Customer detail card — add / view per customer
- A follow-up due today writes `FOLLOW_UP_CREATED` / `FOLLOW_UP_COMPLETED` to
  the timeline event log.

## Actions

| Action | Path |
|---|---|
| `createCustomerFollowUpAction` | Customer detail page |
| `updateCustomerFollowUpStatusAction` | Follow-ups page (Mark done) |

## Roadmap

- "Show on Today Board" toggle
- Optional Task link in Operations Task Center
- Recurring follow-ups (e.g. weekly meal-plan renewal nudge)
