# Company / B2B CRM

## Model

```
company_accounts(
  id, user_id, name, billing_email, phone, address_json,
  primary_contact_id (FK → kitchen_customers, SET NULL),
  tags_json, notes, created_at, updated_at
)
```

`kitchen_customers.company_account_id` points back at `company_accounts.id`
(SET NULL on delete) — and is what powers "members" on the company page.

## UI

- `/dashboard/customers/companies` — list + quick-add form.
- Customer detail page links can attach a customer to a company (planned for
  a future iteration once the company picker lands).

## Use cases

| Business type | Example |
|---|---|
| Catering | Recurring office lunches, weekly corporate breakfast |
| Café | Local company subscriptions, conference catering |
| Meal prep | Office gym programs, employer-sponsored meal plans |
| Bar | Private event bookings tied to a corporate host |
| Multi-brand operator | A holding company that owns multiple billed projects |

## Future

- Quote / event history rolled up to the company
- Per-company billing settings (PO numbers, net terms)
- Tags JSON editor
- Bulk-attach members
